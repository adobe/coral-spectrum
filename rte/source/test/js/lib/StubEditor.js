(function($) {

    /**
     * Implements a stub editor used for testing purposes.
     */
    CUI.rte.testing.StubEditor = new Class({

        editorKernel: null,

        isIFrame: false,

        $textContainer: null,

        $iframeContainer: null,

        $iframe: null,


        construct: function(config) {
            config.uiToolkit = config.uiToolkit || "stub";
            this.isIFrame = !!config.iframe;
            if (this.isIFrame) {
                this.initializeIFrame(config);
            } else {
                this.initializeDiv(config);
            }
        },

        initializeDiv: function(config) {
            var ua = CUI.rte.Common.ua;
            this.editorKernel = new CUI.rte.DivKernel(config);
            this.$textContainer = config.$el;
            this.textContainer = this.$textContainer[0];
            this.editorKernel.createToolbar();
            this.savedSpellcheckAttrib = document.body.spellcheck;
            document.body.spellcheck = false;
            this.$textContainer[0].contentEditable = "true";
            if (ua.isGecko || ua.isWebKit) {
                this.savedOutlineStyle = this.textContainer.style.outlineStyle;
                this.textContainer.style.outlineStyle = "none";
            }
            this.editorKernel.initializeEditContext(window, document, this.textContainer);
            this.editorKernel.initializeEventHandling();
            var initialContent = config.initialContent || this.$textContainer.html();
            this.setValue(initialContent || "");
        },

        initializeIFrame: function(config) {
            var isIE = CUI.rte.Common.ua.isIE;
            this.editorKernel = new CUI.rte.IFrameKernel(config);
            var markup = "<html><head>" +
                    "<style type=\"text/css\">body{ border: 0; margin: 0; " +
                    "padding: 3px; height: 3px; cursor: text }</style>" +
                    "<link rel=\"stylesheet\" href=\"rte.css\">" +
                    "</head>" +
                    "<body id=\"test\"></body></html>";
            this.$iframe = $(
                    "<iframe src=\"javascript:;\" name=\"rteTest\" frameborder=\"0\" " +
                        "style=\"width: 100%; height: 400px; overflow: auto;\">" +
                    "</iframe>");
            this.$iframeContainer = config.$el;
            this.$iframeContainer.append(this.$iframe);
            var iframe = this.$iframe[0];
            var win, doc;
            if (isIE) {
                doc = iframe.contentWindow.document;
                win = iframe.contentWindow;
            } else {
                doc = (iframe.contentDocument || window.frames[iframe.name].document);
                win = window.frames["rteTest"];
            }
            doc.open();
            doc.write(markup);
            doc.close();
            var body = doc.body || doc.documentElement;
            if (isIE) {
                doc.body.contentEditable = "true";
            } else {
                doc.designMode = "on";
            }
            this.editorKernel.createToolbar();
            this.editorKernel.initializeEditContext(iframe, win, doc, body);
            this.editorKernel.initializeEventHandling();
            var initialContent = config.initialContent;
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