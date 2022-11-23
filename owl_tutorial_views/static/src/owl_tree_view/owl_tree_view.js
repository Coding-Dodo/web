/** @odoo-module */

import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {OWLTreeArchParser} from "./owl_tree_arch_parser";
import {OWLTreeController} from "./owl_tree_controller";
import {OWLTreeModel} from "./owl_tree_model";
import {OWLTreeRenderer} from "./owl_tree_renderer";

export const owlTreeView = {
    type: "owl_tree",
    display_name: _t("OWL Treee"),
    icon: "fa-indent",
    multiRecord: true,
    Controller: OWLTreeController,
    ArchParser: OWLTreeArchParser,
    Model: OWLTreeModel,
    Renderer: OWLTreeRenderer,

    props(genericProps, view) {
        const {ArchParser} = view;
        const {arch, relatedModels} = genericProps;
        const archInfo = new ArchParser().parse(arch);
        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    },
};

registry.category("views").add("owl_tree", owlTreeView);
