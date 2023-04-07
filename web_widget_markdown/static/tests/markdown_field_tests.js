/** @odoo-module **/

import {findChildren, getFixture} from "@web/../tests/helpers/utils";
import {makeView, setupViewRegistries} from "@web/../tests/views/helpers";

let serverData = null;
let target = null;

const initMarkdownValue = `
# Hello world

This is a test
`;
QUnit.module("web_widget_markdown", (hooks) => {
    hooks.beforeEach(() => {
        target = getFixture();

        serverData = {
            models: {
                partner: {
                    fields: {
                        content: {
                            string: "Content",
                            type: "text",
                            default: "# Default",
                            searchable: true,
                            trim: true,
                        },
                        // Bar: {string: "Bar", type: "boolean", default: true, searchable: true},
                        // txt: {
                        //     string: "txt",
                        //     type: "text",
                        // },
                        // int_field: {
                        //     string: "int_field",
                        //     type: "integer",
                        //     sortable: true,
                        //     searchable: true,
                        // },
                        // qux: {string: "Qux", type: "float", digits: [16, 1], searchable: true},
                    },
                    records: [
                        {
                            id: 1,
                            // Bar: true,
                            content: initMarkdownValue,
                            // Int_field: 10,
                            // qux: 0.44444,
                            // txt: "some text",
                        },
                    ],
                },
            },
        };

        setupViewRegistries();
    });

    QUnit.module("MarkdownField");

    QUnit.test("markdown fields are correctly rendered in readonly", async function (assert) {
        serverData.models.partner.fields.content.type = "text";
        await makeView({
            type: "form",
            resModel: "partner",
            resId: 1,
            serverData,
            arch: '<form><field name="content" widget="markdown" readonly="1"/></form>',
        });
        /** @type {Element} */
        const div = target.querySelector(".o_field_markdown div");
        assert.ok(div, "should have a div");
        /** @type {Element} */
        const h1 = div.querySelector("h1");
        assert.ok(h1, "should have a H1 tag");
        assert.strictEqual(h1.textContent, "Hello world", "Should be 'Hello world' in the H1 tag");

        const paragraph = div.querySelector("p");
        assert.ok(paragraph, "should have a p tag");
        assert.strictEqual(
            paragraph.textContent,
            "This is a test",
            "Should be 'This is a test' in the p tag"
        );
    });

    QUnit.test("markdown Editor interactions", async function (assert) {
        serverData.models.partner.fields.content.type = "text";
        const concreteView = await makeView({
            type: "form",
            resModel: "partner",
            resId: 1,
            serverData,
            arch: '<form><field name="content" widget="markdown"/></form>',
            mockRPC: function (route, {args, method, model}) {
                if (model === "partner" && method === "write") {
                    assert.strictEqual(args[1].content, "**bold content**", "should write correct value");
                }
            },
        });
        const markdownField = findChildren(concreteView, (comp) => comp.name === "MarkdownField");
        const textarea = target.querySelector(".o_field_markdown textarea");
        assert.ok(textarea, "should have a text area");
        assert.strictEqual(textarea.value, initMarkdownValue, "should still be '# Hello world' in edit");
        assert.strictEqual(
            markdownField.component.easymde.value(),
            initMarkdownValue,
            "easymde should have correct value"
        );

        markdownField.component.easymde.value("**bold content**");
        markdownField.component.commitChanges();
    });
});
