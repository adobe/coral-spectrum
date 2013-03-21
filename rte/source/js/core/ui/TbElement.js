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
 * @class CUI.rte.ui.TbElement
 * @private
 * This class represents a single element for use in
 * {@link CUI.rte.ui.ToolbarBuilder}.
 */
CUI.rte.ui.TbElement = new Class({

    toString: "TbElement",

    id: null,

    plugin: null,

    toggle: null,

    tooltip: null,

    toolbar: null,

    construct: function(id, plugin, toggle, tooltip, css, cmdDef) {
        this._init.apply(this, arguments);
    },

    _init: function(id, plugin, toggle, tooltip, css, cmdDef) {
        this.id = id;
        this.plugin = plugin;
        this.toggle = toggle;
        this.css = (css ? css : "x-edit-" + id);
        this.cmdDef = cmdDef;
        if (tooltip) {
            this.tooltip = tooltip;
            this.tooltip.cls = "x-html-editor-tip";
        } else {
            this.tooltip = null;
        }
    },

    getToolbar: function() {
        return CUI.rte.ui.ToolbarBuilder.MAIN_TOOLBAR;
    },

    addToToolbar: function(toolbar) {
        throw new Error("TbElement#addToToolbar is not implemented.");
    },

    notifyToolbar: function(toolbar) {
        throw new Error("TbElement#notifyToolbar is not implemented.");
    },

    createToolbarDef: function() {
        throw new Error("TbElement#createToolbarDef is not implemented.");
    },

    setDisabled: function(isDisabled) {
        throw new Error("TbElement#setDisabled is not implemented.");
    },

    setSelected: function(isSelected, suppressEvent) {
        throw new Error("TbElement#setSelected is not implemented.");
    }

});