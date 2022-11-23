/** @odoo-module */

/**
 *
 *
 * @typedef {Object} ArchInfo
 * @property {string} arch
 * @property {string} countField
 */

import {XMLParser} from "@web/core/utils/xml";

export class OWLTreeArchParser extends XMLParser {
    parse(arch) {
        const xmlDoc = this.parseXML(arch);
        const countField = xmlDoc.getAttribute("count_field");
        /** @type { ArchInfo} */
        return {
            arch,
            countField,
        };
    }
}
