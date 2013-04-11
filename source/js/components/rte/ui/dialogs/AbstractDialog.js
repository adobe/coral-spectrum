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

    function requiresFocus(dom) {
        var $dom = $(dom);
        return $dom.is("input:text");
    }

    CUI.rte.ui.cui.AbstractDialog = new Class({

        config: null,

        dialogHelper: null,

        range: null,

        $editable: null,

        $container: null,

        $toolbar: null,

        $trigger: null,

        $dialog: null,

        mask: null,

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
            var dataType = this.getDataType();
            var mode = config.mode;
            this.$dialog = CUI.rte.UIUtils.getDialog(dataType, mode, this.$container);
            if (!this.$dialog.length) {
                this.$dialog = $(CUI.rte.Templates["dlg-" + dataType](config));
                var $container = CUI.rte.UIUtils.getUIContainer(this.$editable);
                var space = mode || "global";
                var $dlgSpace = CUI.rte.UIUtils.getSpace(space, $container);
                $dlgSpace.append(this.$dialog);
            }
            this.$dialog.finger("tap.rte-dialog click.rte-dialog", function(e) {
                if (!requiresFocus(e.target)) {
                    self.editorKernel.focus();
                    if (self.range) {
                        CUI.rte.Selection.selectRangeBookmark(
                                self.editorKernel.getEditContext(), self.range);
                    }
                } else {
                    CUI.rte.UIUtils.killEvent(e);
                }
            });
            this.$dialog.on("click.rte-dialog", "button[data-type=\"apply\"]",
                    function(e) {
                        self.apply();
                        e.stopPropagation();
                    });
            this.$dialog.on("click.rte-dialog", "button[data-type=\"cancel\"]",
                    function(e) {
                        self.cancel();
                        e.stopPropagation();
                    });
            this.mask = new CUI.rte.ui.cui.Mask();
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
                this.mask.show();
                // maually do the layout - is required here because the editor is already
                // locked, so automatic update will not work
                this.editorKernel.toolbar.triggerUIUpdate();
            }
        },

        hide: function() {
            this.popoverManager.hide();
            this.editorKernel.focus();
            this.editorKernel.unlock();
            CUI.rte.Selection.selectRangeBookmark(this.editorKernel.getEditContext(),
                    this.range);
            this.editorKernel.fireUIEvent("dialoghide");
            this.mask.hide();
            // hide the toolbar temporarily on touch devices, as the device will most
            // likely do some screen updates immediately after the command is executed and
            // the dialog is hidden - so this should result in a less disruptive UI behavior
            if (CUI.rte.Common.ua.isTouch) {
                this.editorKernel.toolbar.hideTemporarily();
            }
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