(function($) {

    /**
     * Implements a stub editor used for testing purposes.
     */
    CUI.rte.testing.StubEditor = new Class({

        editorKernel: null,

        construct: function(config) {
            config.uiToolkit = config.uiToolkit || "stub";
            this.editorKernel = new CUI.rte.DivKernel(config);
            this.$textContainer = config.$el;
            this.textContainer = this.$textContainer[0];
            this.editorKernel.createToolbar();
            this.savedSpellcheckAttrib = document.body.spellcheck;
            document.body.spellcheck = false;
            var initialContent = config.initialContent || this.$textContainer.html();
            this.$textContainer[0].contentEditable = "true";
            var ua = CUI.rte.Common.ua;
            if (ua.isGecko || ua.isWebKit) {
                this.savedOutlineStyle = this.textContainer.style.outlineStyle;
                this.textContainer.style.outlineStyle = "none";
            }
            this.editorKernel.initializeEditContext(window, document, this.textContainer);
            this.editorKernel.initializeEventHandling();
            this.setValue(initialContent || "");
        },

        setValue: function(value) {
            this.editorKernel.setUnprocessedHtml(value);
            CUI.rte.Utils.defer(function() {
                this.editorKernel.initializeCaret();
                this.editorKernel.execCmd("initializeundo");
            }, 1, this);
        },

        getValue: function() {
            return this.editorKernel.getProcessedHtml();
        },

        focus: function() {
            this.editorKernel.focus();
        }


    });

})(window.jQuery);