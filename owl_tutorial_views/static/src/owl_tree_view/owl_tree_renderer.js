/** @odoo-module **/
import {useState, Component} from "@odoo/owl";
import {TreeItem} from "../components/tree_item/TreeItem";

export class OWLTreeRenderer extends Component {
    setup() {
        super.setup();
        // Here we could really do without a renderer as we could just use the
        // controller template directly. But the common practice is to have a
        // renderer component that gets updated with props: "items" in that case.
    }
}

OWLTreeRenderer.components = {TreeItem};
OWLTreeRenderer.template = "owl_tutorial_views.OWLTreeRenderer";
OWLTreeRenderer.props = {
    countField: {
        type: String,
        optional: true,
    },
    onTreeItemClicked: {
        type: Function,
        optional: true,
    },
    onChangeItemTree: {
        type: Function,
        optional: true,
    },
    items: {
        type: Array,
        optional: true,
    },
};
