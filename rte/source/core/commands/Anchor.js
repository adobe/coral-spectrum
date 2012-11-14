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
 * @class CUI.rte.commands.Anchor
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.Anchor = new Class({

    toString: "Anchor",

    extend: CUI.rte.commands.Command,

    addAnchorToDom: function(execDef) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var nodeList = execDef.nodeList;
        var name = execDef.value;
        var context = execDef.editContext;
        var anchors = [ ];
        nodeList.getNamedAnchors(context, anchors, false);
        if (anchors.length > 0) {
            // modify existing anchor(s)
            for (var i = 0; i < anchors.length; i++) {
                this.applyAnchorProperties(anchors[i].dom, name);
            }
        } else {
            // create new anchor
            var tagName;
            var attributes =  {
                "class": CUI.rte.Theme.ANCHOR_CLASS
            };
            // Webkit can't edit "a" elements directly, hence substitute to "img" element
            if (com.ua.isWebKit) {
                tagName = "img";
                attributes[com.A_NAME_REPLACEMENT_ATTRIB] = name;
            } else {
                tagName = "a";
                attributes["name"] = name;
            }
            var selection = execDef.selection;
            var dom = dpr.createNode(execDef.editContext, tagName, attributes);
            com.insertNode(dom, selection.startNode, selection.startOffset);
        }
    },

    /**
     * Applies anchor properties (name) to the given anchor dom element.
     * @param {HTMLElement} dom DOM element the link properties will be applied
     * @param {String} name Name of the anchor
     * @private
     */
    applyAnchorProperties: function(dom, name) {
        var com = CUI.rte.Common;
        // some browsers may use a substitute, so we'll have to use a special attribute
        // instead
        if (!com.isTag(dom, "a")) {
            com.setAttribute(dom, com.A_NAME_REPLACEMENT_ATTRIB, name);
        } else {
            com.setAttribute(dom, "name", name);
        }
        com.setAttribute(dom, "class", CUI.rte.Theme.ANCHOR_CLASS);
    },

    removeAnchorFromDom: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var anchors = [ ];
        nodeList.getNamedAnchors(context, anchors, true);
        for (var i = 0; i < anchors.length; i++) {
            dpr.removeWithoutChildren(anchors[i].dom);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "anchor");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        if (execDef.value) {
            this.addAnchorToDom(execDef);
        } else {
            this.removeAnchorFromDom(execDef);
        }
    },

    queryState: function(selectionDef, cmd) {
        return (selectionDef.namedAnchorCount > 0);
    }

});

// register command
CUI.rte.commands.CommandRegistry.register("anchor", CUI.rte.commands.Anchor);