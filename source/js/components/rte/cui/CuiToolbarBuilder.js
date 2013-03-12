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
            var elementsToNotify = [ ];
            var elementMap = { };
            var groupCnt = this.groups.length;
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
                        elementsToNotify.push(element);
                        hasMembers = true;
                    }
                }
            }
            var toolbar = new CUI.rte.ui.cui.ToolbarImpl(elementMap, options.$toolbarRoot);
            var notifyCnt = elementsToNotify.length;
            for (var n = 0; n < notifyCnt; n++) {
                elementsToNotify[n].notifyToolbar(toolbar);
            }
            // handle popovers
            var $tbRoot = options.$toolbarRoot;
            var $popoverLinks = $tbRoot.find("button[data-action^=\"#\"]");
            $popoverLinks.bind("click.rte.handler", function(e) {
                var ref = $(e.target).data("action").substring(1);
                var $popover = $tbRoot.find("div[data-popover=\"" + ref + "\"]");
                $popover.popover().show();
            });
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