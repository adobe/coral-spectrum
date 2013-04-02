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

    var TYPE_TO_DATATYPE = {
        "rtelinkdialog": "link"
    };

    CUI.rte.ui.cui.CuiDialogHelper = new Class({

        toString: "CuiDialogHelper",

        extend: CUI.rte.ui.DialogHelper,

        /**
         * @protected
         * @ignore
         */
        instantiateDialog: function(dialogConfig) {
            var type = dialogConfig.type;
            if (!TYPE_TO_DATATYPE.hasOwnProperty(type)) {
                throw new Error("Unknown dialog type: " + type);
            }
            var dataType = TYPE_TO_DATATYPE[type];
            var context = this.editorKernel.getEditContext();
            var $editable = $(context.root);
            var $container = CUI.rte.UIUtils.getUIContainer($editable);
            var $dialog = CUI.rte.UIUtils.getDialog(dataType, undefined, $container);
            var $toolbar = this.editorKernel.toolbar.$toolbar;
            var $trigger = $toolbar.parent().find(
                    "button[data-action=\"" + dialogConfig.parameters.command + "\"]");
            return {
                "config": dialogConfig,
                "dataType": dataType,
                "$editable": $editable,
                "$container": $container,
                "$toolbar": $toolbar,
                "$trigger": $trigger,
                "$dialog": $dialog,
                "initializeEdit": function(editorKernel, cfg) {
                    // TODO ...?
                }
            };
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
        },

        calculateInitialPosition: function() {
            // TODO how to handle? we'll have different initial positions each time the dialog is shown
        }

    });

})(window.jQuery);