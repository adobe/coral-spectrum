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

    CUI.rte.ui.cui.ParaFormatterImpl = new Class({

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
                "id": this.id,
                "element": this
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
        },

        setDisabled: function(isDisabled) {
            /*
            if (isDisabled) {
                this.$ui.addClass("rte-tbi-disabled");
            } else {
                this.$ui.removeClass("rte-tbi-disabled");
            }
            */
        },

        setSelected: function(isSelected, suppressEvent) {
            this._isSelected = isSelected;
            /*
            if (isSelected) {
                this.$ui.addClass("rte-tbi-selected");
            } else {
                this.$ui.removeClass("rte-tbi-selected");
            }
            */
        },

        isSelected: function() {
            return this._isSelected;
        }

    });

})(window.jQuery);