/** @odoo-module **/
import {useRef, onMounted, onWillStart, markup, Component, onWillUpdateProps} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {useBus} from "@web/core/utils/hooks";
import {debounce} from "@web/core/utils/timing";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {TranslationButton} from "@web/views/fields/translation_button";

export class MarkdownField extends Component {
    setup() {
        super.setup();
        this.textareaRef = useRef("textarea");
        onWillStart(async () => {
            await loadJS("/web_widget_markdown/static/lib/easymde.min.js");
            await loadJS("/web_widget_markdown/static/lib/marked.min.js");
        });
        onMounted(() => {
            if (!this.props.readonly) {
                this._startEasyMDE();
            }
        });

        useBus(this.env.bus, "RELATIONAL_MODEL:WILL_SAVE_URGENTLY", () =>
            this.commitChanges({urgent: true})
        );
        useBus(this.env.bus, "RELATIONAL_MODEL:NEED_LOCAL_CHANGES", ({detail}) =>
            detail.proms.push(this.commitChanges())
        );

        onWillUpdateProps((newProps) => {
            if (newProps.readonly !== this.props.readonly && !newProps.readonly) {
                this._startEasyMDE(newProps.value);
            }
        });
    }

    /**
     * @param {String} [initValue]
     */
    _startEasyMDE(initValue) {
        var easymdeConfig = {
            element: this.textareaRef.el,
            initialValue: initValue ?? this.props.value,
            uniqueId: `markdown-${this.props.id}`,
        };
        if (this.props.editorOptions) {
            easymdeConfig = {...easymdeConfig, ...this.props.editorOptions};
        }
        this.easymde = new EasyMDE(easymdeConfig); // eslint-disable-line no-undef
        this.easymde.codemirror.on("blur", this.commitChanges.bind(this));
        this.easymde.codemirror.on("change", debounce(this.commitChanges.bind(this), 1000));
    }

    get markupValue() {
        var value = this.props.value;
        // Use the "marked" lib to convert.
        if (marked) { // eslint-disable-line no-undef
            value = marked.marked(value); // eslint-disable-line no-undef
        }
        // Wrap within "markup" to say this is raw HTML.
        return markup(value);
    }

    getEditorValue() {
        if (this.easymde) {
            return this.easymde.value();
        }
        return null;
    }

    /**
     * Checks if the current value is different from the last saved value.
     * If the field is dirty it needs to be saved.
     * @returns {Boolean}
     */
    _isDirty() {
        return !this.props.readonly && this.props.value !== this.getEditorValue();
    }

    /**
     * @returns {Promise}
     *
     */
    async commitChanges({urgent = false} = {}) {
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
MarkdownField.components = {
    TranslationButton,
};

registry.category("fields").add("markdown", MarkdownField);
