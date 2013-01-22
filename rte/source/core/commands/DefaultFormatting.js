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
 * @class CUI.rte.commands.DefaultFormatting
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.DefaultFormatting = new Class({

    toString: "DefaultFormatting",

    extend: CUI.rte.commands.Command,

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

    setCaretTo: function(execDef) {
        var com = CUI.rte.Common;
        var tag = this.getTagNameForCommand(execDef.command);
        if (tag) {
            var context = execDef.editContext;
            var sel = execDef.selection;
            var startNode = sel.startNode;
            var existing = com.getTagInPath(context, startNode, tag);
            if (!existing) {
                // switch on style
                var el = context.createElement(tag);
                com.setAttribute(el, com.TEMP_EL_ATTRIB, com.TEMP_EL_REMOVE_ON_SERIALIZE
                        + ":emptyOnly");
                CUI.rte.DomProcessor.insertElement(context, el, sel.startNode,
                        sel.startOffset);
                CUI.rte.Selection.selectEmptyNode(context, el);
                return {
                    "preventBookmarkRestore": true
                };
            } else {
                // switch off style
                var path = [ ];
                var dom = startNode;
                while (dom && (dom !== existing)) {
                    if (dom.nodeType === 1) {
                        path.push(dom);
                    }
                    dom = com.getParentNode(context, dom);
                }
                if (path.length === 0) {
                    console.log("Reposition caret");
                } else {
                    console.log("Re-create structure ...");
                }
            }
        }
        return undefined;
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "bold") || (cmdLC == "italic") || (cmdLC == "underline")
                || (cmdLC == "subscript") || (cmdLC == "superscript");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        var com = CUI.rte.Common;
        var nodeList = execDef.nodeList;
        var selection = execDef.selection;
        var context = execDef.editContext;
        if (!CUI.rte.Selection.isSelection(selection)) {
            // execDef.editContext.doc.execCommand(execDef.command, false, null);
            return this.setCaretTo(execDef);
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
        var com = CUI.rte.Common;
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
CUI.rte.commands.CommandRegistry.register("defaultfmt",
        CUI.rte.commands.DefaultFormatting);