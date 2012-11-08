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

(function($) {

    CUI.rte.ui.cui.ElementImpl = new Class({

        toString: "ElementImpl",

        extend: CUI.rte.ui.TbElement,

        dom: null,

        $ui: null,


        notifyGroupBorder: function(isFirst) {
            // TODO ...?
        },


        // Interface implementation ------------------------------------------------------------

        addToToolbar: function(toolbar) {
            // not used here
        },

        notifyToolbar: function(toolbar) {
            this.toolbar = toolbar;
            var pluginId = this.plugin.pluginId;
            var $cont = $(toolbar.getToolbarContainer());
            this.$ui = $cont.find('a[href="#' + pluginId + '"][data-rte-command="' + this.id
                    + '"]');
        },

        createToolbarDef: function() {
            return {
                "id": this.id,
                "element": this
            };
        },

        setDisabled: function(isDisabled) {
            if (isDisabled) {
                this.$ui.addClass("rte-tbi-disabled");
            } else {
                this.$ui.removeClass("rte-tbi-disabled");
            }
        },

        setSelected: function(isSelected, suppressEvent) {
            this._isSelected = isSelected;
            if (isSelected) {
                this.$ui.addClass("rte-tbi-selected");
            } else {
                this.$ui.removeClass("rte-tbi-selected");
            }
        },

        isSelected: function() {
            return this._isSelected;
        }

    });

})(window.jQuery);