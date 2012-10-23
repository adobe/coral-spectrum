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
 * @class CUI.rte.commands.Indent
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.Indent = new Class({

    toString: "Indent",

    extend: CUI.rte.commands.Command,

    isCommand: function(cmdStr) {
        return (cmdStr.toLowerCase() == "indent");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        var retValue = {
            "selOffset": {
                collapse: true
            }
        };
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var selection = execDef.selection;
        var nodeList = execDef.nodeList;
        var context = execDef.editContext;
        var tagExcl = CUI.rte.commands.Indent.TAGEXCL;
        var indents = nodeList.getTags(context, [ {
            "matcher": function(dom) {
                if (com.isTag(dom, com.BLOCK_TAGS) && !com.isTag(dom, tagExcl)) {
                    return true;
                }
                return com.isTag(dom, "li");
            }
        } ], true, true);
        // change auxiliary roots and add them to the indents list
        var auxRoots = dpr.getAuxRoots(context, selection);
        var rootCnt = auxRoots.length;
        for (var r = 0; r < rootCnt; r++) {
            var rootToProcess = auxRoots[r];
            var pNode = context.createElement("p");
            com.moveChildren(rootToProcess, pNode);
            rootToProcess.appendChild(pNode);
            indents.push({
                "dom": pNode
            });
        }
        // change indents of all detected block nodes
        var nodeCnt = indents.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = indents[nodeIndex];
            var dom = nodeToProcess.dom;
            if (com.isTag(dom, com.BLOCK_TAGS)) {
                // block nodes
                var marginLeft = 0;
                if (dom.style.marginLeft) {
                    marginLeft = parseInt(dom.style.marginLeft);
                }
                marginLeft += execDef.value
                        || CUI.rte.commands.Indent.DEFAULT_INDENT_SIZE;
                dom.style.marginLeft = marginLeft + "px";
            } else {
                // list items
                var listProcessor = new CUI.rte.ListRepresentation();
                listProcessor.fromItem(context, dom);
                listProcessor.ensureHierarchy(context);
                listProcessor.indent(context, dom);
            }
        }
        return retValue;
    },

    queryState: function(selectionDef, cmd) {
        var com = CUI.rte.Common;
        var context = selectionDef.editContext;
        var tagExcl = CUI.rte.commands.Indent.TAGEXCL;
        var indents = selectionDef.nodeList.getTags(context, [ {
                "matcher": function(dom) {
                    if (com.isTag(dom, com.BLOCK_TAGS) && !com.isTag(dom, tagExcl)) {
                        return !!dom.style.marginLeft;
                    }
                    return com.isTag(dom, "li");
                }
            }
        ], true, true);
        return (indents.length > 0);
    }

});

/**
 * Block-tags that are excluded from being indented/outdented
 * @static
 * @final
 * @type String[]
 * @private
 */
CUI.rte.commands.Indent.TAGEXCL = [ "ul", "ol", "table" ];

/**
 * Default indent size
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.commands.Indent.DEFAULT_INDENT_SIZE = 40;


// register command
CUI.rte.commands.CommandRegistry.register("indent", CUI.rte.commands.Indent);