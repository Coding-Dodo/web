/** @odoo-module **/

/** @typedef {import("./owl_tree_arch_parser").ArchInfo} ArchInfo */
import {KeepLast} from "@web/core/utils/concurrency";

export class OWLTreeModel {
    /**
     * @param {import("@web/core/orm_service").ORM} orm
     * @param {string} resModel
     * @param {Object<string, import("odoo/addons/spreadsheet/static/src/data_sources/metadata_repository").Field>} fields
     * @param {import("./owl_tree_arch_parser").ArchInfo} archInfo
     * @param {any[]} domain
     * @param {Object<string, Object|Array|number|string|null|boolean>} context
     * @param {import("@web/core/network/rpc_service").jsonrpc} rpc
     */
    constructor(orm, resModel, fields, archInfo, domain, context, rpc) {
        this.orm = orm;
        /** @type {rpc} */
        this.rpc = rpc;
        /** @type {string} */
        this.resModel = resModel;
        /** @type {string} */
        this.countField = archInfo.countField;
        /** @type {Object} */
        this.context = context;
        this.domain = domain;
        this.data = [];
        /** @type {KeepLast} */
        this.keepLast = new KeepLast();
    }

    /**
     * Make an RPC 'write' method call to update the parent_id of
     * an existing record.
     *
     * @param {number} id ID Of the item we want to update
     * @param {number} parent_id The parent item ID
     */
    async changeParent(id, parent_id) {
        await this.orm.write(this.resModel, [id], {parent_id: parent_id});
    }

    /**
     * Refresh a node get fresh data from the server for a given item.
     * A search_read is executed via RPC Call and then the item is modified
     * in place in the hierarchical tree structure.
     *
     * @param {number} id ID Of the item we want to refresh
     */
    async refreshNode(id) {
        var self = this;
        var result = null;
        let itemUpdated = await this.orm.read(this.resModel, [id], []);

        let path = itemUpdated[0].parent_path;
        let target_node = self.__target_parent_node_with_path(
            path.split("/").filter((i) => i),
            self.data
        );
        target_node = itemUpdated[0];
        result = itemUpdated[0];
        return result;
    }

    /**
     * Make an RPC call to get the child of the target itm then navigates
     * the nodes to the target the item and assign its "children" property
     * to the result of the RPC call.
     *
     * @param {number} parentId Category we will "open/expand"
     * @param {string} path The parent_path represents the parents ids like "1/3/32/123/"
     */
    async expandChildrenOf(parentId, path) {
        let children = await this.orm.searchRead(this.resModel, [["parent_id", "=", parentId]]);
        var target_node = this.__target_parent_node_with_path(
            path.split("/").filter((i) => i),
            this.data
        );
        target_node.children = children;
        target_node.child_id = children.map((i) => i.id);
        target_node.childrenVisible = true;
    }

    async toggleChildrenVisibleForItem(item) {
        var target_node = this.__target_parent_node_with_path(
            item.parent_path.split("/").filter((i) => i),
            this.data
        );
        target_node.childrenVisible = !target_node.childrenVisible;
    }

    async _recursivelyOpenParents(item) {
        if (item.parent_id) {
            let parent = await this.orm.read(this.resModel, [item.parent_id[0]], []);
            const directParent = parent[0];
            directParent.children = [item];
            directParent.childrenVisible = true;
            return await this._recursivelyOpenParents(directParent);
        } else {
            return [item];
        }
    }
    /**
     * Search for the Node corresponding to the given path.
     * Paths are present in the property `parent_path` of any nested item they are
     * in the form "1/3/32/123/" we have to split the string to manipulate an Array.
     * Each item in the Array will correspond to an item ID in the tree, each one
     * level deeper than the last.
     *
     * @private
     * @param {Array} path for example ["1", "3", "32", "123"]
     * @param {Array} items the items to search in
     * @param {number} n The current index of deep inside the tree
     * @returns {Object|undefined} the tree Node corresponding to the path
     **/
    __target_parent_node_with_path(path, items, n = 0) {
        for (const item of items) {
            if (item.id == parseInt(path[n])) {
                if (n < path.length - 1) {
                    return this.__target_parent_node_with_path(path, item.children, n + 1);
                } else {
                    return item;
                }
            }
        }
        return undefined;
    }

    async load() {
        let isSearch = false;
        let domain = [["parent_id", "=", false]];
        if (this.domain && this.domain.length > 0) {
            isSearch = true;
            domain = this.domain;
        }
        let result = await this.keepLast.add(this.orm.searchRead(this.resModel, domain, []));
        if (isSearch) {
            for (const item of result) {
                this.data = await this._recursivelyOpenParents(item);
            }
        } else {
            this.data = result;
        }
    }
}
