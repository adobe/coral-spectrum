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
 * @class CUI.rte.commands.Justify
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.Justify = new Class({

    toString: "Justify",

    extend: CUI.rte.commands.Command,

    isCommand: function(cmdStr) {
        var com = CUI.rte.Common;
        return com.strStartsWith(cmdStr.toLowerCase(), "justify");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_SELECTION | cmd.PO_BOOKMARK;
    },

    alignTableCells: function(context, cellSelection, alignment) {
        var com = CUI.rte.Common;
        var cells = cellSelection.cells;
        var cellCnt = cells.length;
        for (var c = 0; c < cellCnt; c++) {
            var cellToAlign = cells[c];
            var baseStyle = com.getStyleProp(context, cellToAlign.parentNode, "textAlign");
            baseStyle = (baseStyle ? baseStyle : "left");
            if (baseStyle != alignment) {
                cellToAlign.style.textAlign = alignment;
            } else {
                cellToAlign.style.textAlign = "";
            }
        }
    },

    execute: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var selection = execDef.selection;
        var cmd = execDef.command;
        var context = execDef.editContext;
        var textAlign = cmd.substring(7, cmd.length);
        if (selection.cellSelection) {
            this.alignTableCells(context, selection.cellSelection, textAlign);
        } else {
            var baseStyle;
            var containers = dpr.createContainerList(context, selection);
            var selectionTextAlign = com.getConsistentStyle(context, containers,
                    "textAlign", "left");
            var toggleStyle = (selectionTextAlign != null);
            var containerCnt = containers.length;
            for (var containerIndex = 0; containerIndex < containerCnt; containerIndex++) {
                var containerToChange = containers[containerIndex];
                baseStyle = com.getStyleProp(context, containerToChange.parentNode,
                        "textAlign");
                baseStyle = (baseStyle ? baseStyle : "left");
                var isPlainStyle = (baseStyle == textAlign);
                if (toggleStyle) {
                    if (isPlainStyle) {
                        containerToChange.style.textAlign = "";
                    } else {
                        containerToChange.style.textAlign = textAlign;
                    }
                } else {
                    containerToChange.style.textAlign = (isPlainStyle ? "" : textAlign);
                }
            }
            var auxRoots = dpr.getAuxRoots(context, selection);
            var rootCnt = auxRoots.length;
            for (var r = 0; r < rootCnt; r++) {
                var auxRootDom = auxRoots[r];
                if (com.isTag(auxRootDom, [ "td", "th" ])) {
                    baseStyle = com.getStyleProp(context, auxRootDom.parentNode,
                            "textAlign");
                    baseStyle = (baseStyle ? baseStyle : "left");
                    if (textAlign != baseStyle) {
                        auxRootDom.style.textAlign = textAlign;
                    } else {
                        auxRootDom.style.textAlign = "";
                    }
                }
            }
        }
    },

    queryState: function(selectionDef, cmd) {
        var com = CUI.rte.Common;
        var context = selectionDef.editContext;
        var containerList = com.arrayCopy(selectionDef.containerList);
        var auxRoots = selectionDef.auxRoots;
        var rootCnt = auxRoots.length;
        for (var r = 0; r < rootCnt; r++) {
            var root = auxRoots[r];
            if (com.isTag(root, [ "td", "th" ])) {
                containerList.push(root);
            }
        }
        var align = cmd.substring(7, cmd.length);
        var selTextAlign = com.getConsistentStyle(context, containerList, "textAlign",
                "left");
        return (align == selTextAlign);
    }

});


// register command
CUI.rte.commands.CommandRegistry.register("justify", CUI.rte.commands.Justify);