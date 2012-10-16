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
 * @class CUI.rte.commands.Image
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.Image = new Class({

    toString: "Image",

    extend: CUI.rte.commands.Command,

    createImage: function(execDef) {
        var value = execDef.value;
        var url = null;
        if (value.path) {
            url = CUI.rte.Utils.processUrl(value.path, CUI.rte.Utils.URL_IMAGE);
        }
        var alt = (value.alt ? value.alt : "");
        var width = (value.width ? value.width : null);
        var height = (value.height ? value.height : null);
        // todo encoding(?)
        if (url) {
            var imgHtml = "<img src=\"" + url + "\" alt=\"" + alt + "\"";
            imgHtml += " " + CUI.rte.Common.SRC_ATTRIB + "=\"" + value.path + "\"";
            if (width) {
                imgHtml += " width=\"" + width + "\"";
            }
            if (height) {
                imgHtml += " height=\"" + height + "\"";
            }
            imgHtml += ">";
            execDef.component.execCmd("inserthtml", imgHtml);
        }
    },

    applyProperties: function(execDef) {
        var props = execDef.value;
        var com = CUI.rte.Common;
        var selection = execDef.selection;
        if (selection.startNode && (selection.startOffset == undefined)
                && !selection.endNode) {
            var node = selection.startNode;
            if (!com.isTag(node, "img")) {
                return;
            }
            var stylePrefix = "style.";
            for (var propName in props) {
                if (props.hasOwnProperty(propName)) {
                    if (com.strStartsWith(propName, stylePrefix)) {
                        var styleName =
                                propName.substring(stylePrefix.length, propName.length);
                        if (styleName == "float") {
                            // IE < 9 requires to use node.style.styleFloat http://msdn.microsoft.com/en-us/library/ie/ms530755%28v=vs.85%29.aspx
                            // All other browsers and IE9 or newer allow node.style.cssFloat http://msdn.microsoft.com/en-us/library/ie/ff974668%28v=vs.85%29.aspx
                            if (com.ua.isIE6 || com.ua.isIE7 || com.ua.isIE8) {
                                styleName = "styleFloat";
                            } else {
                                styleName = "cssFloat";
                            }
                        }
                        node.style[styleName] = props[propName];
                    } else {
                        node.setAttribute(propName, props[propName]);
                    }
                }
            }
            if (com.ua.isGecko) {
                CUI.rte.Selection.flushSelection(execDef.editContext);
            }
        }
    },

    isCommand: function(cmdStr) {
        return (cmdStr.toLowerCase() == "insertimg");
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION;
    },

    execute: function(execDef) {
        switch (execDef.command.toLowerCase()) {
            case "insertimg":
                this.createImage(execDef);
                break;
            case "image":
                this.applyProperties(execDef);
                break;
        }
    },

    queryState: function(selectionDef, cmd) {
        var com = CUI.rte.Common;
        if (cmd.toLowerCase() == "image") {
            var selection = selectionDef.selection;
            if (selection.startNode && (selection.startOffset == undefined)
                    && !selection.endNode) {
                var node = selection.startNode;
                return com.isTag(node, "img");
            }
        }
        return false;
    }

});


// register command
CUI.rte.commands.CommandRegistry.register("image", CUI.rte.commands.Image);