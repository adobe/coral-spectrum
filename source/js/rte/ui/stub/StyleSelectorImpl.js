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

CUI.rte.ui.stub.StyleSelectorImpl = new Class({

    toString: "StyleSelectorImpl",

    extend: CUI.rte.ui.TbStyleSelector,

    // Helpers -----------------------------------------------------------------------------

    notifyGroupBorder: function() {
        // do nothing
    },


    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        // TODO ...?
    },

    notifyToolbar: function(toolbar) {
        this.toolbar = toolbar;
    },

    createToolbarDef: function() {
        // TODO ...?
        return [ ];
    },

    initializeSelector: function() {
        // TODO ...?
    },

    getSelectorDom: function() {
        return { };
    },

    getSelectedStyle: function() {
        return null;
    },

    setRemoveDisabled: function(isDisabled) {
        // TODO ...?
    }

});