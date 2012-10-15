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
 * @class CQ.form.rte.commands.Link
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.Link = new Class({

    toString: "Link",

    extend: CQ.form.rte.commands.Command,

    /**
     * Creates a styled link from the current selection.
     * @private
     */
    addLinkToDom: function(execDef) {
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var url = execDef.value.url;
        var styleName = execDef.value.css;
        var target = execDef.value.target;
        var attributes = execDef.value.attributes || { };
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        if (links.length > 0) {
            // modify existing link(s)
            for (var i = 0; i < links.length; i++) {
                this.applyLinkProperties(links[i].dom, url, styleName, target, attributes);
            }
        } else {
            // create new link
            var sel = CQ.form.rte.Selection;
            var dpr = CQ.form.rte.DomProcessor;
            if (execDef.value.trimLinkSelection === true) {
                var range = sel.getLeadRange(context);
                range = sel.trimRangeWhitespace(context, range);
                sel.selectRange(context, range);
                nodeList = dpr.createNodeList(context, sel.createProcessingSelection(
                        context));
            }
            // handle HREF problems on IE with undo (IE will deliberately change the
            // HREF, causing the undo mechanism to fail):
            var helperSpan = context.createElement("span");
            helperSpan.innerHTML = "<a href=\"" + url + "\"></a>";
            attributes.href = helperSpan.childNodes[0].href;
            attributes[CQ.form.rte.Common.HREF_ATTRIB] = url;
            if (styleName) {
                attributes.className = styleName;
            }
            if (target) {
                attributes.target = target;
            } else {
                delete attributes.target;
            }
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    var attribValue = attributes[key];
                    if ((attribValue == null) || (attribValue.length == 0)
                            || (attribValue == CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                        delete attributes[key];
                    }
                }
            }
            nodeList.surround(context, "a", attributes);
        }
    },

    /**
     * Applies link properties (href, style, target) to the given anchor dom element.
     * @param {HTMLElement} dom DOM element the link properties will be applied (should be
     * @param {String} url URL/href to set
     * @param {String} styleName Name of CSS class to apply
     * @param {String} target target frame of the link
     * @param {Object} addAttributes additional attributes
     * @private
     */
    applyLinkProperties: function(dom, url, styleName, target, addAttributes) {
        var com = CQ.form.rte.Common;
        dom.href = url;
        dom.setAttribute(CQ.form.rte.Common.HREF_ATTRIB, url);
        if (target) {
            com.setAttribute(dom, "target", target);
        } else {
            com.removeAttribute(dom, "target");
        }
        if (styleName) {
            com.setAttribute(dom, "class", styleName);
        } else {
            com.removeAttribute(dom, "class");
        }
        for (var attribName in addAttributes) {
            if (addAttributes.hasOwnProperty(attribName)) {
                var attribValue = addAttributes[attribName];
                if (attribValue && (attribValue.length > 0)
                        && (attribValue != CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE)) {
                    com.setAttribute(dom, attribName, attribValue);
                } else {
                    com.removeAttribute(dom, attribName);
                }
            }
        }
    },

    /**
     * Removes a styled link according to the current selection.
     * @private
     */
    removeLinkFromDom: function(execDef) {
        var dpr = CQ.form.rte.DomProcessor;
        var context = execDef.editContext;
        var nodeList = execDef.nodeList;
        var links = [ ];
        nodeList.getAnchors(context, links, true);
        for (var i = 0; i < links.length; i++) {
            dpr.removeWithoutChildren(links[i].dom);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "modifylink") || (cmdLC == "unlink");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "modifylink":
                this.addLinkToDom(execDef);
                break;
            case "unlink":
                this.removeLinkFromDom(execDef);
                break;
        }
    },

    queryState: function(selectionDef, cmd) {
        return (selectionDef.anchorCount > 0);
    }

});

/**
 * Placeholder object for explicitly removing an attribute
 */
CQ.form.rte.commands.Link.REMOVE_ATTRIBUTE = new Object();


// register command
CQ.form.rte.commands.CommandRegistry.register("link", CQ.form.rte.commands.Link);