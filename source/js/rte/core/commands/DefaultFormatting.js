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
 * @class CQ.form.rte.commands.DefaultFormatting
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.DefaultFormatting = new Class({

    toString: "DefaultFormatting",

    extend: CQ.form.rte.commands.Command,

    /**
     * @private
     */
    containsTag: function(list, tagName) {
        var com = CQ.form.rte.Common;
        for (var key in list) {
            var dom = list[key];
            if (com.isTag(dom, tagName)) {
                return true;
            }
        }
        return false;
    },

    /**
     * @private
     */
    getTagNameForCommand: function(cmd) {
        var cmdLC = cmd.toLowerCase();
        var tagName = null;
        switch (cmdLC) {
            case "bold":
                tagName = "b";
                break;
            case "italic":
                tagName = "i";
                break;
            case "underline":
                tagName = "u";
                break;
            case "subscript":
                tagName = "sub";
                break;
            case "superscript":
                tagName = "sup";
                break;
        }
        return tagName;
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "bold") || (cmdLC == "italic") || (cmdLC == "underline")
                || (cmdLC == "subscript") || (cmdLC == "superscript");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        var com = CQ.form.rte.Common;
        var nodeList = execDef.nodeList;
        var selection = execDef.selection;
        var context = execDef.editContext;
        if (!CQ.form.rte.Selection.isSelection(selection)) {
            execDef.editContext.doc.execCommand(execDef.command, false, null);
            return;
        }
        var tagName = this.getTagNameForCommand(execDef.command);
        var attributes = execDef.value;
        // see queryState()
        var isActive = (com.getTagInPath(context, selection.startNode, tagName) != null);
        if (!isActive) {
            nodeList.surround(execDef.editContext, tagName, attributes);
        } else {
            nodeList.removeNodesByTag(execDef.editContext, tagName, attributes, true);
        }
    },

    queryState: function(selectionDef, cmd) {
        var com = CQ.form.rte.Common;
        if (!selectionDef.isSelection) {
            return selectionDef.editContext.doc.queryCommandState(cmd);
        }
        var context = selectionDef.editContext;
        var tagName = this.getTagNameForCommand(cmd);
        // use the start node to determine state - that's how the browsers would do it
        // if we could use queryCommandState
        var selection = selectionDef.selection;
        return (com.getTagInPath(context, selection.startNode, tagName) != null);
    }

});

// register command
CQ.form.rte.commands.CommandRegistry.register("defaultfmt",
        CQ.form.rte.commands.DefaultFormatting);