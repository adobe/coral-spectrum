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

    CUI.rte.ui.cui.AbstractDialog = new Class({

        config: null,

        dialogHelper: null,

        range: null,

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
            var self = this;
            var killEvent = function(e) {
                var $target = $(e.target);
                if ($target.is("input") && !$target.is("input:text")) {
                    self.editorKernel.focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                }
            };
            this.$dialog = CUI.rte.UIUtils.getDialog(
                    this.getDataType(), undefined, this.$container);
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

        initializeEdit: function(editorKernel, objToEdit, applyFn) {
            this.editorKernel = editorKernel;
            this.popoverManager = this.editorKernel.toolbar.popover;
            this.objToEdit = objToEdit;
            this.applyFn = applyFn;
            // TODO adjust to custom config (post 5.6.1)
            this.fromModel();
        },

        show: function() {
            this.range = CUI.rte.Selection.createRangeBookmark(
                    this.editorKernel.getEditContext());
            this.popoverManager.hide();
            if (this.$dialog) {
                this.popoverManager.use(this.$dialog, this.$trigger, this.$toolbar);
                this.editorKernel.lock();
                this.editorKernel.fireUIEvent("dialogshow");
            }
        },

        hide: function() {
            this.popoverManager.hide();
            this.editorKernel.focus();
            this.editorKernel.unlock();
            CUI.rte.Selection.selectRangeBookmark(this.editorKernel.getEditContext(),
                    this.range);
            this.editorKernel.fireUIEvent("dialoghide");
        },

        apply: function() {
            if (this.validate()) {
                this.toModel();
                this.hide();
                if (this.applyFn) {
                    this.applyFn(this.editContext, this.objToEdit);
                }
            }
        },

        cancel: function() {
            this.hide();
        },

        getFieldByType: function(name) {
            var $field = this.$dialog.find("*[data-type=\"" + name + "\"]");
            if ($field.length > 0) {
                return $field;
            }
            return undefined;
        },

        /**
         * Gets a dialog parameter by its name.
         * @param {String} name The parameter's name
         * @return {Object} The parameter's value; null if no such parameter is defined
         */
        getParameter: function(name) {
            var params = this.config.parameters;
            if (params && params[name]) {
                return params[name];
            }
            return undefined;
        },

        getDataType: function() {
            throw new Error("DialogImpl#getDataType must be overridden.");
        },

        preprocessModel: function() {
            // this method may be overridden by implementing dialogs to pre-process
            // the model before the fromModel()-methods are being executed
        },

        dlgFromModel: function() {
            // this method may be overridden by implementing dialogs to transfer basic data
            // from model to view
        },

        fromModel: function() {
            this.preprocessModel();
            // TODO handle additional fields (backwards compatibility)
            this.dlgFromModel();
        },

        validate: function() {
            // may be overridden by implementing dialog
            return true;
        },

        dlgToModel: function() {
            // this method may be overridden by implementing dialogs to transfer basic data
            // from view to model
        },

        postprocessModel: function() {
            // this method may be overridden by implementing dialogs to post-process
            // the model after all toModel()-methods have been executed
        },

        toModel: function() {
            this.dlgToModel();
            // TODO handle additional fields (backwards compatibility)
            this.postprocessModel();
        }

    });

})(window.jQuery);