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

CUI.rte.ui.cui.CuiDialogHelper = new Class({

    toString: "CuiDialogHelper",

    extend: CUI.rte.ui.DialogHelper,

    /**
     * @protected
     */
    instantiateDialog: function(dialogConfig) {
        return { };
    },

    createItem: function(type, name, label) {
        return { };
    },

    getItemType: function(item) {
        return "unknown";
    },

    getItemName: function(item) {
        if (!item.id) {
            item.id = "id-" + new Date().getTime();
        }
        return item.id;
    },

    getItemValue: function(item) {
        return item.value;
    },

    setItemValue: function(item, value) {
        item.value = value;
    }

});