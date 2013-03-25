/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
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

(function($) {

    CUI.rte.ui.cui.CuiToolbarBuilder = new Class({

        toString: "CuiToolbarBuilder",

        extend: CUI.rte.ui.ToolbarBuilder,


        // Toolbar management ------------------------------------------------------------------

        /**
         * Create the abstracted toolbar.
         * @return {CUI.rte.ui.Toolbar} The toolbar
         * @ignore
         */
        createToolbar: function(options) {
            var toolbarItems = [ ];
            var elements = [ ];
            var elementMap = { };
            var groupCnt = this.groups.length;
            // create data model
            var hasMembers = false;
            for (var groupIndex = 0; groupIndex < groupCnt; groupIndex++) {
                var groupElements = this.groups[groupIndex].elements;
                var elCnt = groupElements.length;
                for (var elIndex = 0; elIndex < elCnt; elIndex++) {
                    var element = groupElements[elIndex].def;
                    if ((elIndex == 0) && hasMembers) {
                        toolbarItems.push("-");
                        hasMembers = false;
                    }
                    var toolbarDef = element.createToolbarDef();
                    if (toolbarDef != null) {
                        if (!CUI.rte.Utils.isArray(toolbarDef)) {
                            toolbarDef = [ toolbarDef ];
                        }
                        var itemCnt = toolbarDef.length;
                        for (var i = 0; i < itemCnt; i++) {
                            var def = toolbarDef[i];
                            toolbarItems.push(def);
                            elementMap[def.id] = def;
                        }
                        elements.push(element);
                        hasMembers = true;
                    }
                }
            }
            // attach model to UI/create UI from model
            var $editable = options.$editable;
            var $toolbar = CUI.rte.UIUtils.getToolbar($editable);
            var elementCnt = elements.length;
            var e;
            if (!$toolbar) {
                // create new toolbar
                var items = [ ];
                for (e = 0; e < elementCnt; e++) {
                    elements[e].addToToolbar(items);
                }
                var toolbarMarkup = CUI.rte.Templates["toolbar"]({
                    "toolbarItems": items
                });
                var $container = $(CUI.rte.Templates["container"]({
                    "toolbar": toolbarMarkup
                }));
                $editable.before($container);
            }
            // use existing/newly created toolbar
            var toolbar = new CUI.rte.ui.cui.ToolbarImpl(elementMap, $editable);
            for (e = 0; e < elementCnt; e++) {
                elements[e].notifyToolbar(toolbar);
            }
            return toolbar;
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

})(window.jQuery);