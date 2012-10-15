/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2012 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

/**
 * @class CUI.rte.commands.SurroundBase
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.SurroundBase = new Class({

    toString: "SurroundBase",

    extend: CUI.rte.commands.Command,

    tagName: null,

    attributes: null,

    construct: function(tagName, attributes) {
        this.tagName = tagName;
        this.attributes = attributes;
    },

    /**
     * @private
     */
    containsTag: function(list, tagName) {
        var com = CUI.rte.Common;
        for (var key in list) {
            var dom = list[key];
            if (com.isTag(dom, tagName)) {
                return true;
            }
        }
        return false;
    },

    isCommand: function(cmdStr) {
        return (cmdStr.toLowerCase() == this.tagName.toLowerCase());
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        var com = CUI.rte.Common;
        var nodeList = execDef.nodeList;
        var context = execDef.editContext;
        var isActive = com.containsTagInPath(context, nodeList.commonAncestor,
                this.tagName);
        if (!isActive) {
            nodeList.surround(execDef.editContext, this.tagName, this.attributes);
        } else {
            nodeList.removeNodesByTag(execDef.editContext, this.tagName, null, true);
        }
    },

    queryState: function(selectionDef, cmd) {
        var consistentFormatting = selectionDef.consistentFormatting;
        // todo check attributes
        return this.containsTag(consistentFormatting, this.tagName);
    }

});
