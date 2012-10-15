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

CQ.form.rte.ui.cui.StyleSelectorImpl = new Class({

    toString: "StyleSelectorImpl",

    extend: CQ.form.rte.ui.TbStyleSelector,

    // Helpers -----------------------------------------------------------------------------

    notifyGroupBorder: function() {
        // do nothing
    },

    getRemoveButtonUI: function() {
        return this.toolbar.items.map[this.id + "_remove"];
    },

    createRemoveButton: function() {
        return {
            "itemId": this.id + "_remove",
            "cls": "x-btn-icon",
            "iconCls": "x-edit-removestyle",
            "enableToggle": (this.toggle !== false),
            "scope": this,
            "handler": function() {
                this.plugin.execute(this.id + "_remove");
            },
            "clickEvent": "mousedown",
            "tabIndex": -1
        };
    },

    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        var com = CQ.form.rte.Common;
        // TODO remove Ext dependency once we can ...
        this.toolbar = toolbar;
        if (com.ua.isIE) {
            // the regular way doesn't work for IE anymore with Ext 3.1.1, hence working
            // around
            var helperDom = document.createElement("span");
            helperDom.innerHTML = "<select class=\"x-font-select\">"
                    + this.createStyleOptions() + "</span>";
            this.styleSelector = CQ.Ext.get(helperDom.childNodes[0]);
        } else {
            this.styleSelector = CQ.Ext.get(CQ.Ext.DomHelper.createDom({
                tag: "select",
                cls: "x-font-select",
                html: this.createStyleOptions()
            }));
        }
        this.initializeSelector();
        toolbar.add(
            CQ.I18n.getMessage("Style"),
            " ",
            this.styleSelector.dom,
            this.createRemoveButton()
        );
    },

    createToolbarDef: function() {
        // TODO remove Ext dependency once we can ...
        return [ {
                "xtype": "panel",
                "itemId": this.id,
                "html": "<select class=\"x-font-select\">"
                    + this.createStyleOptions() + "</span>",
                "listeners": {
                    "afterrender": function() {
                        var item = this.toolbar.items.get(this.id);
                        if (item && item.body) {
                            this.styleSelector = CQ.Ext.get(item.body.dom.childNodes[0]);
                            this.initializeSelector();
                        }
                    },
                    "scope": this
                }
            },
            this.createRemoveButton()
        ];
    },

    initializeSelector: function() {
        this.styleSelector.on('change', function() {
            var style = this.styleSelector.dom.value;
            if (style.length > 0) {
                this.plugin.execute(this.id);
            }
        }, this);
        this.styleSelector.on('focus', function() {
            this.plugin.editorKernel.isTemporaryBlur = true;
        }, this);
        // fix for a Firefox problem that adjusts the combobox' height to the height
        // of the largest entry
        this.styleSelector.setHeight(19);
    },

    getSelectorDom: function() {
        return this.styleSelector.dom;
    },

    getSelectedStyle: function() {
        var style = this.styleSelector.dom.value;
        if (style.length > 0) {
            return style;
        }
        return null;
    },

    setRemoveDisabled: function(isDisabled) {
        var removeBtn = this.getRemoveButtonUI();
        removeBtn.setDisabled(isDisabled);
    }

});