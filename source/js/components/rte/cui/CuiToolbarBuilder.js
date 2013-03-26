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


        // Helpers -------------------------------------------------------------------------

        _buildToolbar: function($editable, elements, options) {

            function getItem(id) {
                var itemCnt = items.length;
                for (var i = 0; i < itemCnt; i++) {
                    if (items[i].ref === id) {
                        return items[i];
                    }
                }
                return null;
            }

            function getPopover(id) {
                if (!popoverDefs) {
                    return undefined;
                }
                for (var def in popoverDefs) {
                    if (popoverDefs.hasOwnProperty(def)) {
                        if (popoverDefs[def].ref === id) {
                            return popoverDefs[def];
                        }
                    }
                }
                return null;
            }

            var com = CUI.rte.Common;
            var uiSettings = undefined;
            if (options && options.uiSettings && options.uiSettings.cui) {
                uiSettings = options.uiSettings.cui;
            } else {
                uiSettings = CUI.rte.ui.cui.DEFAULT_UI_SETTINGS;
            }
            var items = [ ];
            for (var e = 0; e < elements.length; e++) {
                elements[e].addToToolbar(items);
            }
            // reorder according to settings
            com.removeJcrData(uiSettings);
            var toolbars = [ ];
            var toolbarTpl = CUI.rte.Templates["toolbar"];
            var itemTpl = CUI.rte.Templates["toolbar-item"];
            var triggerTpl = CUI.rte.Templates["popover-trigger"];
            var popoverTpl = CUI.rte.Templates["popover"];
            var popoverItemTpl = CUI.rte.Templates["popover-item"];
            for (var tbId in uiSettings) {
                if (uiSettings.hasOwnProperty(tbId)) {
                    var toolbar = uiSettings[tbId];
                    var tbItems = [ ];
                    var popovers = [ ];
                    var itemDefs = toolbar.toolbar;
                    var popoverDefs = toolbar.popovers;
                    // toolbar
                    var itemCnt = itemDefs.length;
                    for (var i = 0; i < itemCnt; i++) {
                        var itemToAdd = itemDefs[i];
                        if (itemToAdd && itemToAdd.length) {
                            if (itemToAdd.charAt(0) === "#") {
                                // popover trigger
                                var popover = getPopover(itemToAdd.substring(1));
                                tbItems.push(triggerTpl({
                                    "ref": itemToAdd,
                                    "icon": (popover && popover.icon
                                            ? popover.icon : "text")
                                }));
                            } else {
                                // regular item
                                var element = getItem(itemToAdd);
                                if (element) {
                                    tbItems.push(itemTpl(element));
                                }
                            }
                        }
                    }
                    // popovers
                    com.removeJcrData(popoverDefs);
                    for (var p in popoverDefs) {
                        if (popoverDefs.hasOwnProperty(p)) {
                            var poItems = [ ];
                            var popoverToProcess = popoverDefs[p];
                            var poItemDefs = popoverToProcess.items;
                            var poItemCnt = poItemDefs.length;
                            for (var pi = 0; pi < poItemCnt; pi++) {
                                var poItem = getItem(poItemDefs[pi]);
                                if (poItem) {
                                    poItems.push(popoverItemTpl(poItem));
                                }
                            }
                            popovers.push(popoverTpl({
                                "ref": popoverToProcess.ref,
                                "popoverItems": poItems
                            }));
                        }
                    }
                    // add representation
                    toolbars.push({
                        "id": tbId,
                        "toolbar": toolbarTpl({
                            "toolbarItems": tbItems
                        }),
                        "popovers": popovers
                    });
                }
            }
            $editable.before($(CUI.rte.Templates["container"]({
                "toolbars": toolbars
            })));
        },


        // Toolbar management --------------------------------------------------------------

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
                // create new toolbar if none is present yet
                this._buildToolbar($editable, elements, options);
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

    CUI.rte.ui.cui.DEFAULT_UI_SETTINGS = {
        "inline": {
            "toolbar": [
                "#format",
                "#justify",
                "#lists"
            ],
            "popovers": {
                "format": {
                    "ref": "format",
                    "icon": "text",
                    "items": [
                        "format#bold",
                        "format#italic",
                        "format#underline"
                    ]
                },
                "justify": {
                    "ref": "justify",
                    "icon": "text",
                    "items": [
                        "justify#justifyleft",
                        "justify#justifycenter",
                        "justify#justifyright"
                    ]
                },
                "lists": {
                    "ref": "lists",
                    "icon": "text",
                    "items": [
                        "lists#insertunorderedlist",
                        "lists#insertorderedlist",
                        "lists#outdent",
                        "lists#indent"
                    ]
                }
            }
        }
        // TODO add default config for full screen mode; introduce * wildcard there
    };

})(window.jQuery);