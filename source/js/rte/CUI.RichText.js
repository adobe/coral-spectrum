(function ($) {

    CUI.RichText = new Class(/** @lends CUI.RichText# */ {

        toString:'RichText',

        extend:CUI.Widget,

        editorKernel: null,

        construct:function (options) {
            this.options = options || { };
            // TODO ...
        },

        // Helpers -----------------------------------------------------------------------------------------------------

        getTextDiv: function(parentEl) {
            return parentEl;
        },

        isEmptyText: function() {
            return false;
            /*
            var spanDom = CQ.Ext.DomQuery.selectNode("span:first", this.textContainer);
            if (!spanDom) {
                return false;
            }
            var spanEl = CQ.Ext.get(spanDom);
            return spanEl.hasClass(CQ.themes.TextEditor.EMPTY_COMPONENT_CLASS);
            */
        },

        prepareForNewText: function() {
            /*
            CQ.form.rte.Common.removeAllChildren(this.textContainer);
            */
        },

        handleKeyUp: function(e) {
            /*
            if (!window.CQ_inplaceEditDialog) {
                if (e.getCharCode() == 27) {
                    this.editComponent.cancelInplaceEditing();
                } else {
                    this.checkBoxChanged(true);
                }
            }
            */
        },

        initializeEditorKernel: function(initialContent) {
            this.editorKernel.addUIListener("updatestate", this.updateState, this);
            this.editorKernel.addUIListener("dialogshow", this.onDialogShow, this);
            this.editorKernel.addUIListener("dialoghide", this.onDialogHide, this);
            this.editorKernel.initializeEditContext(window, document, this.textContainer);
            this.editorKernel.initializeEventHandling();
            this.editorKernel.setUnprocessedHtml(initialContent || "");
            this.editorKernel.initializeCaret(true);
            this.editorKernel.execCmd("initializeundo");
        },

        onDialogShow: function() {
            /*
            var context = this.editorKernel.getEditContext();
            this.savedSelection = this.editorKernel.createQualifiedRangeBookmark(context);
            this.editorKernel.disableEventHandling();
            window.CQ_inplaceEditDialog = true;
            */
        },

        onDialogHide: function() {
            /*
            CQ.form.rte.Utils.defer(function() {
                window.CQ_inplaceEditDialog = false;
                this.editorKernel.reenableEventHandling();
                var context = this.editorKernel.getEditContext();
                this.editorKernel.selectQualifiedRangeBookmark(context, this.savedSelection);
            }, 1, this);
            */
        },


        // Interface ---------------------------------------------------------------------------------------------------

        start: function() {
            console.log("Starting instance ...", this.$element);
            /*
            if (this.editorKernel == null) {
                this.editorKernel = new CUI.rte.DivKernel(this.config);
            }
            this.editorKernel.createToolbar();
            this.textContainer = this.getTextDiv(this.$element);
            this.currentSize = this.textContainer.getSize();
            var pos = el.getXY();
            this.currentPosition = {
                "x": pos[0],
                "y": pos[1]
            };
            // if the component includes the "empty text placeholder", the placeholder
            // has to be removed and prepared for richtext editing
            this.isEmptyContent = this.isEmptyText();
            if (this.isEmptyContent) {
                this.prepareForNewText();
            }
            this.savedSpellcheckAttrib = document.body.spellcheck;
            document.body.spellcheck = false;
            CUI.rte.Eventing.on(document.body, "keyup", this.handleKeyUp, this);
            this.textContainer.contentEditable = "true";
            if (CQ.Ext.isGecko) {
                this.savedOutlineStyle = this.textContainer.style.outlineStyle;
                this.textContainer.style.outlineStyle = "none";
            }
            this.initializeEditorKernel(initialContent);
            */
        }
    });

    // Register ...
    CUI.util.plugClass(CUI.RichText, "richEdit", function(rte) {
        rte.start();
    });

    // Data API
    if (CUI.options.dataAPI) {
        $(function () {
            $('body').on('click.rte.data-api', '.editable', function (e) {
                $(this).richEdit();
                e.preventDefault();
            });
        });
    }

})(window.jQuery);


