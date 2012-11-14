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

CUI.rte.ui.stub.StubDialogManager = new Class({

    toString: "StubDialogManager",

    extend: CUI.rte.ui.DialogManager,

    create: function(dialogId, config) {
        return { };
    },

    mustRecreate: function(dialog) {
        return false;
    },

    show: function(dialog) {
        // TODO ...?
    },

    hide: function(dialog) {
        // TODO ...?
    },

    alert: function(title, message, fn) {
        // TODO ...?
    },

    createDialogHelper: function() {
        return new CUI.rte.ui.stub.StubDialogHelper();
    }

});