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

    CUI.rte.ui.cui.DialogImpl = new Class({

        config: null,

        dataType: null,

        $editable: null,

        $container: null,

        $toolbar: null,

        $trigger: null,

        $dialog: null,


        construct: function(config) {
            CUI.rte.Utils.apply(this, config);
        },

        initializeEdit: function(editorKernel, cfg) {
            this.$dialog.on("click.rte-dialog", "button[data-type=\"apply\"]",
                    function(e) {
                        // console.log("Apply");
                    });
        }

    });

})(window.jQuery);