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

    CUI.rte.ui.cui.Mask = new Class({

        $mask: null,

        show: function() {
            // ignore on touch devices - will not work; SafariMobile screws up completely
            if (!CUI.rte.Common.ua.isTouch) {
                var $body = $("body");
                this.$mask = $("<div></div>");
                this.$mask.addClass("rte-dialog-mask");
                var maskHeight = document.body.scrollHeight;
                this.$mask.height(maskHeight);
                $body.append(this.$mask);
            }
        },

        hide: function() {
            if (!CUI.rte.Common.ua.isTouch) {
                this.$mask.off("click.rte-dialog-mask");
                this.$mask.remove();
            }
        }

    });

})(window.jQuery);