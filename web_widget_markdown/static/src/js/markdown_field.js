/** @odoo-module **/
const {useRef, useState, xml, onMounted, onWillStart, markup, Component, onWillUpdateProps} = owl;
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {loadJS} from "@web/core/assets";
import {useBus} from "@web/core/utils/hooks";
// import {loadJSModule} from "./assets";

export class MarkdownField extends Component {
    setup() {
        console.log("this.props", this.props);
        super.setup();
        this.textareaRef = useRef("textarea");
        onWillStart(async () => {
            await loadJS("/web_widget_markdown/static/lib/simplemde.min.js");
        });
        onMounted(() => {
            if (!this.props.readonly) {
                this._startSimpleMDE();
            }
        });

        useBus(this.env.bus, "RELATIONAL_MODEL:WILL_SAVE_URGENTLY", () =>
            this.commitChanges({urgent: true})
        );
        useBus(this.env.bus, "RELATIONAL_MODEL:NEED_LOCAL_CHANGES", ({detail}) =>
            detail.proms.push(this.commitChanges())
        );

        onWillUpdateProps((newProps) => {
            if (newProps.readonly != this.props.readonly && !newProps.readonly) {
                this._startSimpleMDE(newProps.value);
            }
        });
    }

    /**
     * @param {string} [initValue]
     */
    _startSimpleMDE(initValue) {
        var simplemdeConfig = {
            element: this.textareaRef.el,
            initialValue: initValue ?? this.props.value,
            uniqueId: `markdown-${this.props.id}`,
        };
        if (this.props.editorOptions) {
            simplemdeConfig = {...simplemdeConfig, ...this.props.editorOptions};
        }
        this.simplemde = new SimpleMDE(simplemdeConfig);
        this.simplemde.codemirror.on("blur", this.commitChanges.bind(this));
    }

    get markupValue() {
        // @ts-ignore
        return markup(SimpleMDE.prototype.markdown(this.props.value));
    }

    getEditingValue() {
        if (this.simplemde) {
            return this.simplemde.value();
        } else {
            return null;
        }
    }

    /**
     * Checks if the current value is different from the last saved value.
     * If the field is dirty it needs to be saved.
     */
    _isDirty() {
        return !this.props.readonly && this.props.value !== this.getEditingValue();
    }

    /**
     * @returns {Promise}
     *
     */
    async commitChanges({urgent = false} = {}) {
        console.log("commitChanges");
        if (this._isDirty() || urgent) {
            console.log("dirty value, updating...");
            await this.updateValue();
        }
    }

    async updateValue() {
        const value = this.getEditingValue();
        const lastValue = (this.props.value || "").toString();
        if (value !== null && !(!lastValue && value === "") && value !== lastValue) {
            if (this.props.setDirty) {
                this.props.setDirty(true);
            }
            this.currentEditingValue = value;
            this._selfUpdating = true;
            await this.props.update(value);
            this._selfUpdating = false;
        }
    }
}

MarkdownField.template = "web_widget_markdown.MarkdownField";
MarkdownField.defaultProps = {dynamicPlaceholder: false};
MarkdownField.props = {
    ...standardFieldProps,
    isTranslatable: {type: Boolean, optional: true},
    placeholder: {type: String, optional: true},
    fieldName: {type: String, optional: true},
    editorOptions: {type: Object, optional: true},
};
MarkdownField.extractProps = ({attrs, field}) => {
    return {
        isTranslatable: field.translate,
        fieldName: field.name,
        placeholder: attrs.placeholder,

        editorOptions: {
            placeholder: attrs.placeholder,
        },
    };
};
// MarkdownField.template = "web_widget_model_viewer_16.MarkdownField";
// MarkdownField.defaultProps = {
//     acceptedFileExtensions: "model/gltf-binary",
// };

registry.category("fields").add("markdown", MarkdownField);

export class CodeField extends Component {}
CodeField.template = xml`<pre t-esc="props.value" t-attf-class="bg-#{props.backgroundColor} text-white p-3 rounded"/>`;
CodeField.defaultProps = {
    backgroundColor: "primary",
};
CodeField.props = {
    ...standardFieldProps,
    backgroundColor: {type: String, optional: true},
};
CodeField.extractProps = ({attrs, field}) => {
    return {
        backgroundColor: attrs.background_color,
    };
};
registry.category("fields").add("code", CodeField);

// odoo.define("web_widget_markdown", function (require) {
//     var fieldRegistry = require("web.field_registry");
//     var basicFields = require("web.basic_fields");

//     var markdownField = basicFields.DebouncedField.extend(basicFields.TranslatableFieldMixin, {
//         supportedFieldTypes: ["text"],
//         template: "FieldMarkdown",
//         jsLibs: ["/web_widget_markdown/static/lib/simplemde.min.js"],
//         events: {},

//         /**
//          * @class
//          */
//         init: function () {
//             this._super.apply(this, arguments);
//             this.simplemde = {};
//         },

//         /**
//          * When the the widget render, check view mode, if edit we
//          * instanciate our SimpleMDE
//          *
//          * @override
//          */
//         start: function () {
//             if (this.mode === "edit") {
//                 var $textarea = this.$el.find("textarea");
//                 var simplemdeConfig = {
//                     element: $textarea[0],
//                     initialValue: this.value,
//                     uniqueId: "markdown-" + this.model + this.res_id,
//                 };
//                 if (this.nodeOptions) {
//                     simplemdeConfig = {...simplemdeConfig, ...this.nodeOptions};
//                 }
//                 this.simplemde = new SimpleMDE(simplemdeConfig);
//                 this.simplemde.codemirror.on("change", this._doDebouncedAction.bind(this));
//                 this.simplemde.codemirror.on("blur", this._doAction.bind(this));
//                 if (this.field.translate) {
//                     this.$el = this.$el.add(this._renderTranslateButton());
//                     this.$el.addClass("o_field_translate");
//                 }
//             }
//             return this._super();
//         },

//         /**
//          * Return the SimpleMDE value
//          * @returns {String}
//          *
//          * @private
//          */
//         _getValue: function () {
//             return this.simplemde.value();
//         },

//         _formatValue: function () {
//             return this._super.apply(this, arguments) || "";
//         },

//         _renderEdit: function () {
//             this._super.apply(this, arguments);
//             var newValue = this._formatValue(this.value);
//             if (this.simplemde.value() !== newValue) {
//                 this.simplemde.value(newValue);
//             }
//         },

//         _renderReadonly: function () {
//             this.$el.html(SimpleMDE.prototype.markdown(this._formatValue(this.value)));
//         },
//     });

//     fieldRegistry.add("markdown", markdownField);

//     return {
//         markdownField: markdownField,
//     };
// });
