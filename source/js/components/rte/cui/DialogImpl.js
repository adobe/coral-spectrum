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

        /**
         * @private
         */
        editorKernel: null,

        /**
         * @private
         */
        popoverManager: null,


        construct: function(config) {
            CUI.rte.Utils.apply(this, config);
            var killEvent = function(e) {
                e.stopPropagation();
                e.preventDefault();
            };
            var self = this;
            this.$dialog.finger("tap.rte-dialog", killEvent);
            this.$dialog.on("click.rte-dialog", killEvent);
            this.$dialog.on("click.rte-dialog", "button[data-type=\"apply\"]",
                    function(e) {
                        self.apply();
                    });
            this.$dialog.on("click.rte-dialog", "button[data-type=\"cancel\"]",
                    function(e) {
                        self.cancel();
                    });
        },

        initializeEdit: function(editorKernel, cfg) {
            this.editorKernel = editorKernel;
            this.popoverManager = this.editorKernel.toolbar.popover;
            // TODO adjust to custom config (post 5.6.1)
        },

        show: function() {
            this.popoverManager.hide();
            if (this.$dialog) {
                this.popoverManager.use(this.$dialog, this.$trigger, this.$toolbar);
                this.editorKernel.lock();
            }
        },

        hide: function() {
            this.popoverManager.hide();
            this.editorKernel.unlock();
        },

        apply: function() {
            // console.log("apply");
            this.hide();
        },

        cancel: function() {
            // console.log("cancel");
            this.hide();
        }

    });

})(window.jQuery);