/** @odoo-module **/
import {Component, useState} from "@odoo/owl";

export class TreeItem extends Component {
    /**
     * @override
     */
    constructor(...args) {
        super(...args);
        this.state = useState({
            isDraggedOn: false,
        });
    }

    toggleChildren() {
        if (this.props.item.child_id.length > 0) {
            this.props.onTreeItemClicked(this.props.item);
        }
    }

    onDragstart(event) {
        event.dataTransfer.setData("TreeItem", JSON.stringify(this.props.item));
    }

    onDragover() {}

    onDragenter() {
        Object.assign(this.state, {isDraggedOn: true});
    }

    onDragleave() {
        Object.assign(this.state, {isDraggedOn: false});
    }

    onDrop(event) {
        Object.assign(this.state, {isDraggedOn: false});
        let droppedItem = JSON.parse(event.dataTransfer.getData("TreeItem"));
        if (droppedItem.id == this.props.item.id || droppedItem.parent_id[0] == this.props.item.id) {
            console.log("Drop inside itself or same parent has no effect");
            return;
        }
        if (this.props.item.parent_path.startsWith(droppedItem.parent_path)) {
            console.log("Oops, drop inside child item is forbidden.");
            return;
        }
        this.props.onChangeItemTree({
            itemMoved: droppedItem,
            newParent: this.props.item,
        });
    }
}

TreeItem.components = {TreeItem};
TreeItem.props = {
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
    item: {
        type: Object,
        optional: true,
    },
};
TreeItem.template = "owl_tutorial_views.TreeItem";
