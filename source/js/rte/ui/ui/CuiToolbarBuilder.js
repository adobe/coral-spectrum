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

CUI.rte.ui.cui.CuiToolbarBuilder = new Class({

    toString: "CuiToolbarBuilder",

    extend: CUI.rte.ui.ToolbarBuilder,


    // Toolbar management ------------------------------------------------------------------

    /**
     * Create the toolbar as a suitable Ext component.
     * @return {Array} Array with physically available toolbar component; elements of type
     *         {@link CQ.WrappingToolbar}
     */
    createToolbar: function(options) {
        var elementMap = { };
        var toolbarDiv = $CQ(document.createElement("div"));
        toolbarDiv.addClass("CUI_FormField");
        toolbarDiv.addClass("CUI_Selector");
        var elementsToNotify = [ ];
        var groupCnt = this.groups.length;
        var hasMembers = false;
        for (var groupIndex = 0; groupIndex < groupCnt; groupIndex++) {
            var groupElements = this.groups[groupIndex].elements;
            var elCnt = groupElements.length;
            if (elCnt > 0) {
                for (var elIndex = 0; elIndex < elCnt; elIndex++) {
                    var element = groupElements[elIndex].def;
                    var toolbarDef = element.createToolbarDef();
                    if (toolbarDef != null) {
                        if (!CUI.rte.Utils.isArray(toolbarDef)) {
                            toolbarDef = [ toolbarDef ];
                        }
                        var itemCnt = toolbarDef.length;
                        for (var i = 0; i < itemCnt; i++) {
                            var item = toolbarDef[i].dom;
                            if (!item) {
                                continue;
                            }
                            if (i == 0) {
                                element.notifyGroupBorder(true);
                            }
                            elementMap[toolbarDef.itemId] = element;
                            if (i == (itemCnt - 1)) {
                                element.notifyGroupBorder(false);
                            }
                            toolbarDiv.append(item);
                        }
                        elementsToNotify.push(element);
                        hasMembers = true;
                    }
                }
            }
        }
        var notifyCnt = elementsToNotify.length;
        for (var n = 0; n < notifyCnt; n++) {
            // TODO remove check after format/style selectors are available
            if (elementsToNotify[n].notifyToolbar) {
                elementsToNotify[n].notifyToolbar(toolbarDiv);
            }
        }
        // TODO add toolbar to DOM in a more specific way ...
        $CQ("#CQ .x-html-editor-tb").append(toolbarDiv);
        // $CQ(document.body).append(toolbarDiv);
        return new CUI.rte.ui.cui.ToolbarImpl(toolbarDiv, elementMap);
    },


    // Creating elements -------------------------------------------------------------------

    createElement: function(id, plugin, toggle, tooltip, css, cmdDef) {
        return new CUI.rte.ui.cui.ElementImpl(id, plugin, toggle, tooltip, css,
                cmdDef);
    },

    createParaFormatter: function(id, plugin, tooltip, formats) {
        return new CUI.rte.ui.cui.ParaFormatterImpl(id, plugin, false, tooltip, false,
                undefined, formats);
    },

    createStyleSelector: function(id, plugin, tooltip, styles) {
        return new CUI.rte.ui.cui.StyleSelectorImpl(id, plugin, false, tooltip, false,
                undefined, styles);
    }

});