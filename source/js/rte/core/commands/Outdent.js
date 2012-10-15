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
 * @class CQ.form.rte.commands.Outdent
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.Outdent = new Class({

    toString: "Outdent",

    extend: CQ.form.rte.commands.Command,

    isCommand: function(cmdStr) {
        return (cmdStr.toLowerCase() == "outdent");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        var retValue = {
            "selOffset": {
                "start": 0,
                "collapse": true
            }
        };
        var com = CQ.form.rte.Common;
        var nodeList = execDef.nodeList;
        var context = execDef.editContext;
        var tagExcl = CQ.form.rte.commands.Indent.TAGEXCL;
        var indents = nodeList.getTags(context, [ {
                "matcher": function(dom) {
                    if (com.isTag(dom, com.BLOCK_TAGS) && !com.isTag(dom, tagExcl)) {
                        return !!dom.style.marginLeft;
                    }
                    return com.isTag(dom, "li");
                }
            }
        ], true, true);
        // check each item if it is actually contained in the selection (may be not the
        // case for nested lists in several situations)
        CQ.form.rte.ListUtils.postprocessSelectedItems(indents);
        // finally, execute the outdenting
        var nodeCnt = indents.length;
        var lists = [ ];
        var listItemsToOutdent = [ ];
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = indents[nodeIndex];
            var dom = nodeToProcess.dom;
            if (com.isTag(dom, com.BLOCK_TAGS)) {
                // handle block nodes ourselves
                var marginLeft = 0;
                if (dom.style.marginLeft) {
                    marginLeft = parseInt(dom.style.marginLeft);
                    marginLeft -= execDef.value
                        || CQ.form.rte.commands.Indent.DEFAULT_INDENT_SIZE;
                    if (marginLeft <= 0) {
                        dom.style.marginLeft = null;
                    } else {
                        dom.style.marginLeft = marginLeft + "px";
                    }
                }
            } else {
                // list items
                var listDom = CQ.form.rte.ListUtils.getTopListForItem(context, dom);
                var listIndex = com.arrayIndex(lists, listDom);
                if (listIndex < 0) {
                    lists.push(listDom);
                    listItemsToOutdent.push([ dom ]);
                } else {
                    listItemsToOutdent[listIndex].push(dom);
                }
            }
        }
        for (var l = 0; l < lists.length; l++) {
            // outdent list items (per top level list)
            var listProcessor = new CQ.form.rte.ListRepresentation();
            listProcessor.fromList(lists[l]);
            listProcessor.ensureHierarchy(context);
            listProcessor.outdent(context, listItemsToOutdent[l]);
        }
        return retValue;
    }

});


// register command
CQ.form.rte.commands.CommandRegistry.register("outdent", CQ.form.rte.commands.Outdent);