/** @odoo-module **/
/** @typedef {import("./owl_tree_model").OWLTreeModel} OWLTreeModel */
import {Component, useState, onWillStart, onWillUpdateProps} from "@odoo/owl";
import {Layout} from "@web/search/layout";
import {useService} from "@web/core/utils/hooks";

export class OWLTreeController extends Component {
    /**
     * Standard setup function of OWL Component, here we parse the XML
     * template to get the options and instantiate the Model.
     **/
    setup() {
        this.orm = useService("orm");
        this.rpc = useService("rpc");
        /** @type OWLTreeModel */
        this.model = useState(
            new this.props.Model(
                this.orm,
                this.props.resModel,
                this.props.fields,
                this.props.archInfo,
                this.props.domain,
                this.props.context,
                this.rpc
            )
        );
        const {arch, templateDocs} = this.props.archInfo;

        onWillStart(async () => {
            await this.model.load();
        });

        onWillUpdateProps(async (nextProps) => {
            if (JSON.stringify(nextProps.domain) !== JSON.stringify(this.props.domain)) {
                this.model.domain = nextProps.domain;
                await this.model.load();
            }
        });
    }

    /**
     */
    async _onTreeItemClicked(treeItem) {
        if (treeItem.children === undefined) {
            await this.model.expandChildrenOf(treeItem.id, treeItem.parent_path);
        } else {
            this.model.toggleChildrenVisibleForItem(treeItem);
        }
    }

    /**
     */
    async _onChangeItemTree({itemMoved, newParent}) {
        await this.model.changeParent(itemMoved.id, newParent.id);

        // Refresh old parent
        let oldParent = await this.model.refreshNode(itemMoved.parent_id[0]);
        await this.model.expandChildrenOf(oldParent.id, oldParent.parent_path);

        // Refresh new parent
        await this.model.expandChildrenOf(newParent.id, newParent.parent_path);
    }
}
OWLTreeController.components = {Layout};
OWLTreeController.template = "owl_tutorial_views.View";
