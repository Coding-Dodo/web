/** @odoo-module **/
const { useRef, onMounted, onWillStart, markup, Component, onWillUpdateProps } = owl;
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { loadJS } from "@web/core/assets";
import { useBus } from "@web/core/utils/hooks";
import { debounce } from "@web/core/utils/timing";
import { TranslationButton } from "@web/views/fields/translation_button";

export class MarkdownField extends Component {
    setup() {
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
            this.commitChanges({ urgent: true })
        );
        useBus(this.env.bus, "RELATIONAL_MODEL:NEED_LOCAL_CHANGES", ({ detail }) =>
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
            initialValue: initValue ? this.props.value : "",
            uniqueId: `markdown-${this.props.id}`,
        };
        if (this.props.editorOptions) {
            simplemdeConfig = { ...simplemdeConfig, ...this.props.editorOptions };
        }
        this.simplemde = new SimpleMDE(simplemdeConfig);
        this.simplemde.codemirror.on("blur", this.commitChanges.bind(this));
        this.simplemde.codemirror.on("change", debounce(this.commitChanges.bind(this), 1000));
    }

    get markupValue() {
        // @ts-ignore
        return markup(SimpleMDE.prototype.markdown(this.props.value));
    }

    getEditorValue() {
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
        return !this.props.readonly && this.props.value !== this.getEditorValue();
    }

    /**
     * @returns {Promise}
     *
     */
    async commitChanges({ urgent = false } = {}) {
        if (this._isDirty() || urgent) {
            await this.updateValue();
        }
    }

    /**
     * Check value changed and setDirty if needed plus update the value
     * @returns {Promise}
     */
    async updateValue() {
        const value = this.getEditorValue();
        const lastValue = (this.props.value || "").toString();
        if (value !== null && !(!lastValue && value === "") && value !== lastValue) {
            if (this.props.setDirty) {
                this.props.setDirty(true);
            }
            await this.props.update(value);
        }
    }
}

MarkdownField.template = "web_widget_markdown.MarkdownField";
MarkdownField.props = {
    ...standardFieldProps,
    isTranslatable: { type: Boolean, optional: true },
    placeholder: { type: String, optional: true },
    fieldName: { type: String, optional: true },
    editorOptions: { type: Object, optional: true },
};
MarkdownField.extractProps = ({ attrs, field }) => {
    return {
        isTranslatable: field.translate,
        fieldName: field.name,
        placeholder: attrs.placeholder,

        editorOptions: {
            placeholder: attrs.placeholder,
        },
    };
};
MarkdownField.components = {
    TranslationButton,
};

registry.category("fields").add("markdown", MarkdownField);
