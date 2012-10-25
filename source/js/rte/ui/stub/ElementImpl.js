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

CUI.rte.ui.stub.ElementImpl = new Class({

    toString: "ElementImpl",

    extend: CUI.rte.ui.TbElement,

    dom: null,


    // Helpers -----------------------------------------------------------------------------

    notifyToolbar: function(toolbar) {
        this.toolbar = toolbar;
    },

    notifyGroupBorder: function(isFirst) {
        // TODO ...?
    },


    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        // TODO ...?
    },

    createToolbarDef: function() {
        return {
            "itemId": this.id
        };
    },

    setDisabled: function(isDisabled) {
        // TODO ...?
    },

    setSelected: function(isSelected, suppressEvent) {
        this._isSelected = isSelected;
    },

    isSelected: function() {
        return this._isSelected;
    }

});