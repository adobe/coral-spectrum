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

CUI.rte.ui.stub.ParaFormatterImpl = new Class({

    toString: "ParaFormatterImpl",

    extend: CUI.rte.ui.TbParaFormatter,


    // Stuff -------------------------------------------------------------------------------

    notifyGroupBorder: function() {
        // do nothing
    },


    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        this.toolbar = toolbar;
        // TODO ...?
    },

    createToolbarDef: function() {
        return {
            "itemId": this.id
        };
    },

    initializeSelector: function() {
        // TODO ...?
    },

    selectFormat: function(formatToSelect, auxRoot, formatCnt, noFormatCnt) {
        // TODO ...?
    },

    getSelectorDom: function() {
        return null;
    },

    getSelectedFormat: function() {
        return null;
    }

});
