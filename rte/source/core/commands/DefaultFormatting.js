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

    /**
     * @private
     */
    isStrucStart: function(context, node, offset) {
        var parentNode = node.parentNode;
        if (!parentNode) {
            return false;
        }
        if (node !== parentNode.firstChild) {
            return false;
        }
        if (node.nodeType === 3) {
            return (offset === 0);
        }
        if (CUI.rte.Common.isOneCharacterNode(node)) {
            return (offset === undefined) || (offset === null);
        }
        return true;
    },

    /**
     * @private
     */
    isStrucEnd: function(context, node, offset) {
        var com = CUI.rte.Common;
        var parentNode = node.parentNode;
        if (!parentNode) {
            return false;
        }
        if (node !== parentNode.lastChild) {
            return false;
        }
        if (node.nodeType === 3) {
            return (offset === com.getNodeCharacterCnt(node));
        }
        if (com.isOneCharacterNode(node)) {
            return (offset === 0);
        }
        return true;
    },

    /**
     * @private
     */
    setCaretTo: function(execDef) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var tag = this.getTagNameForCommand(execDef.command);
        if (tag) {
            var context = execDef.editContext;
            var selection = execDef.selection;
            var startNode = selection.startNode;
            var startOffset = selection.startOffset;
            var existing = com.getTagInPath(context, startNode, tag);
            if (!existing) {
                // switch on style
                var el = context.createElement(tag);
                com.setAttribute(el, com.TEMP_EL_ATTRIB, com.TEMP_EL_REMOVE_ON_SERIALIZE
                        + ":emptyOnly");
                CUI.rte.DomProcessor.insertElement(context, el, startNode, startOffset);
                CUI.rte.Selection.selectEmptyNode(context, el);
            } else {
                // switch off style
                var path = [ ];
                var dom = startNode;
                while (dom && (dom !== existing)) {
                    if ((dom.nodeType === 1) && !dpr.isZeroSizePlaceholder(dom)) {
                        path.push(dom);
                    }
                    dom = com.getParentNode(context, dom);
                }

                var isPlaceholder = dpr.isZeroSizePlaceholder(startNode);
                var pathCnt = path.length;
                var parentNode;
                if (pathCnt === 0) {
                    // switching off current style
                    parentNode = com.getParentNode(context, startNode);
                    if (!isPlaceholder &&
                            this.isStrucStart(context, startNode, startOffset)) {
                        sel.selectBeforeNode(context, parentNode);
                    } else if (!isPlaceholder &&
                            this.isStrucEnd(context, startNode, startOffset)) {
                        sel.selectAfterNode(context, parentNode);
                    } else {
                        if (com.isCharacterNode(startNode) || isPlaceholder) {
                            var textNode;
                            // handle empty (placeholder) elements
                            if (isPlaceholder) {
                                var spanNode = ((startNode.nodeType === 3) ?
                                        startNode.parentNode : startNode);
                                textNode = spanNode.firstChild;
                                dpr.removeWithoutChildren(spanNode);
                                startNode = textNode;
                                startOffset = 0;
                                parentNode = com.getParentNode(context, startNode);
                            }
                            // split structure at caret and remove old placeholder if
                            // necessary
                            dpr.splitToParent(parentNode, startNode, startOffset);
                            if (textNode) {
                                textNode.parentNode.removeChild(textNode);
                            }
                            // clean up right side if neccessary
                            var right = parentNode.nextSibling;
                            if (right && (right.childNodes.length === 0)) {
                                right.parentNode.removeChild(right);
                            }
                            // select behind split point (an empty element will be created
                            // automatically)
                            sel.selectAfterNode(context, parentNode);
                            // clean up left side if necessary (AFTER using it as a
                            // reference for selecting)
                            if (parentNode.childNodes.length === 0) {
                                parentNode.parentNode.removeChild(parentNode);
                            }
                        } else {
                            var tempSpan = dpr.createTempSpan(context, true, false, true);
                            tempSpan.appendChild(context.createTextNode(
                                    dpr.ZERO_WIDTH_NBSP));
                            startNode.parentNode.insertBefore(tempSpan, startNode);
                            startNode.parentNode.removeChild(startNode);
                            sel.selectEmptyNode(context, tempSpan);
                        }
                    }
                } else {
                    // switching off a style that's somewhere up in the hierarchy
                    var duplicatedNode;
                    for (var p = 0; p < pathCnt; p++) {
                        var node = path[p].cloneNode(false);
                        if (parentNode) {
                            parentNode.appendChild(node);
                        } else {
                            duplicatedNode = node;
                        }
                        parentNode = node;
                    }
                    if (com.isCharacterNode(startNode) && !isPlaceholder) {
                        dpr.splitToParent(existing, startNode, startOffset);
                    } else {
                        var splitIndex = com.getChildIndex(path[0]);
                        for (p = pathCnt - 1; p >= 0; p--) {
                            path[p].parentNode.removeChild(path[p]);
                        }
                        var splitNode = existing.cloneNode(false);
                        existing.parentNode.insertBefore(splitNode, existing.nextSibling);
                        com.moveChildren(existing, splitNode, splitIndex);
                    }
                    existing.parentNode.insertBefore(duplicatedNode, existing.nextSibling);
                    sel.selectEmptyNode(context, com.getFirstChild(duplicatedNode) ||
                            duplicatedNode);
                }
            }
            return {
                "preventBookmarkRestore": true
            };
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
        var tagName = this.getTagNameForCommand(cmd);
        var context = selectionDef.editContext;
        var selection = selectionDef.selection;
        return (com.getTagInPath(context, selection.startNode, tagName) != null);
    }

});

// register command
CUI.rte.commands.CommandRegistry.register("defaultfmt",
        CUI.rte.commands.DefaultFormatting);