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
 * @class CUI.rte.ui.TbParaFormatter
 * @extends CUI.rte.ui.TbElement
 * @private
 * This class represents a paragraph formatter element for use in
 * {@link CUI.rte.ui.ToolbarBuilder}.
 */
CUI.rte.ui.TbParaFormatter = new Class({

    extend: CUI.rte.ui.TbElement,

    formatSelector: null,

    formats: null,

    construct: function() {
        // Dummy constructor to keep constructor chain alive
    },

    _init: function(id, plugin, toggle, tooltip, css, cmdDef, formats) {
        this.inherited(arguments);
        this.formats = formats;
    },

    notifyToolbar: function(toolbar) {
        this.toolbar = toolbar;
    },

    getToolbar: function() {
        return CUI.rte.ui.ToolbarBuilder.STYLE_TOOLBAR;
    },

    initializeSelector: function() {
        // must be overridden by implementing classes
        throw new Error("tbParaFormatter#initializeSelector is not implemented.");
    },

    getSelectorDom: function() {
        // must be overridden by implementing classes
        throw new Error("TbParaFormatter#getSelectorDom is not implemented.");
    },

    getSelectedFormat: function() {
        // must be overridden by implementing classes
        throw new Error("TbParaFormatter#getSelectedFormat is not implemented.");
    },

    selectFormat: function(formatToSelect, auxRoot, formatCnt, noFormatCnt) {
        throw new Error("TbParaFormatter#selectFormat is not implemented.");
    }

});