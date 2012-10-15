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
 * @class CQ.form.rte.commands.Style
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.Style = new Class({

    toString: "Style",

    extend: CQ.form.rte.commands.Command,

    /**
     * Formats the currently selected text fragment with the given CSS style.
     * <p>
     * The currently selected text will be surrounded with a <code>span</code> tag that
     * has the given style name as its <code>class</code> attribute..
     * <p>
     * Note that this method only works on text fragments that have no other styles
     * applied.
     * @private
     */
    addStyle: function(execDef) {
        var sel = CQ.form.rte.Selection;
        var com = CQ.form.rte.Common;
        var styleName = execDef.value;
        var selection = execDef.selection;
        // handle DOM elements
        var selectedDom = sel.getSelectedDom(selection);
        var styleableObjects = CQ.form.rte.plugins.StylesPlugin.STYLEABLE_OBJECTS;
        if (selectedDom && com.isTag(selectedDom, styleableObjects)) {
            com.removeAllClasses(selectedDom);
            com.addClass(selectedDom, styleName);
            return;
        }
        // handle text fragments
        var nodeList = execDef.nodeList;
        if (nodeList) {
            nodeList.surround(execDef.editContext, "span", {
                "className": styleName
            });
        }
    },

    /**
     * Removes the style of the text fragment that is under the current caret position.
     * <p>
     * This method does currently not work with selections. Therefore a selection is
     * collapsed to a single char if the method is called for a selection.
     * @private
     */
    removeStyle: function(execDef) {
        var com = CQ.form.rte.Common;
        var dpr = CQ.form.rte.DomProcessor;
        var sel = CQ.form.rte.Selection;
        var selection = execDef.selection;
        var context = execDef.editContext;
        var styleToRemove = execDef.value;
        var styleName, styleCnt, s;
        // handle DOM elements
        var selectedDom = sel.getSelectedDom(selection);
        var styleableObjects = CQ.form.rte.plugins.StylesPlugin.STYLEABLE_OBJECTS;
        if (selectedDom && com.isTag(selectedDom, styleableObjects)) {
            if (styleToRemove && !styleToRemove.styles) {
                com.removeClass(selectedDom, styleToRemove);
            } else if (styleToRemove && styleToRemove.styles) {
                styleCnt = styleToRemove.styles.length;
                for (s = 0; s < styleCnt; s++) {
                    styleName = styleToRemove.styles[s];
                    if ((typeof(styleName) == "object") && styleName.cssName) {
                        styleName = styleName.cssName;
                    }
                    if (com.hasCSS(selectedDom, styleName)) {
                        com.removeClass(selectedDom, styleName);
                    }
                }
            } else {
                com.removeAllClasses(selectedDom);
            }
            return;
        }
        // handle text selections
        var nodeList = execDef.nodeList;
        var spanTags = nodeList.getTags(context, [ {
                matcher: function(dom) {
                    return com.isTag(dom, "span");
                }
            } ], true);
        var spansToRemove = [ ];
        var spanCnt = spanTags.length;
        for (var spanIndex = 0; spanIndex < spanCnt; spanIndex++) {
            var spanToProcess = spanTags[spanIndex].dom;
            if (styleToRemove && !styleToRemove.styles) {
                if (com.hasCSS(spanToProcess, styleToRemove)) {
                    spansToRemove.push(spanToProcess);
                }
            } else if (styleToRemove && styleToRemove.styles) {
                styleCnt = styleToRemove.styles.length;
                for (s = 0; s < styleCnt; s++) {
                    styleName = styleToRemove.styles[s].cssName;
                    if (com.hasCSS(spanToProcess, styleName)) {
                        spansToRemove.push(spanToProcess);
                        break;
                    }
                }
            } else {
                if (spanToProcess.className) {
                    spansToRemove.push(spanToProcess);
                }
            }
        }
        var removeCnt = spansToRemove.length;
        for (var r = 0; r < removeCnt; r++) {
            var spanToRemove = spansToRemove[r];
            dpr.removeWithoutChildren(spanToRemove);
        }
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "applystyle") || (cmdLC == "removestyle");
    },

    getProcessingOptions: function() {
        var cmd = CQ.form.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "applystyle":
                this.addStyle(execDef);
                break;
            case "removestyle":
                this.removeStyle(execDef);
                break;
        }
    },

    queryState: function(selectionDef, cmd) {
        // todo find a meaningful implementation -> list of span tags?
        return false;
    }

});


// register command
CQ.form.rte.commands.CommandRegistry.register("style", CQ.form.rte.commands.Style);