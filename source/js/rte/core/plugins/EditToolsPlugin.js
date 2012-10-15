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

/**
 * @class CUI.rte.plugins.EditToolsPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements the basic editing functions (cut, copy, paste) as a plugin.</p>
 * <p>The plugin ID is "<b>edit</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>cut</b> - adds the "cut" button</li>
 *   <li><b>copy</b> - adds the "copy" button</li>
 *   <li><b>paste-default</b> - adds a button that allows pasting using the default paste
 *     behaviour (see {@link CQ.form.RichText#defaultPasteMode})</li>
 *   <li><b>paste-plaintext</b> - adds a button that allows pasting the clipboard content
 *     as plain text</li>
 *   <li><b>paste-wordhtml</b> - adds a button that allows pasting HTML-based content. Note
 *     that the HTML will be cleaned before inserting. This method is compatible with
 *     pasting content from Microsoft Word.</li>
 * </ul>
 */
CUI.rte.plugins.EditToolsPlugin = new Class({

    toString: "EditToolsPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @cfg {String} defaultPasteMode
     * <p>Default mode when pasting is executed using the Ctrl + V key or the main paste
     * button (defaults to "wordhtml").</p>
     * <p>Valid values are:</p>
     * <ul>
     *   <li>"browser" - use browser's paste implementation (should usually not be used, as
     *     this may introduce unwanted markup or markup that could cause the RichText
     *     component to crash);</li>
     *   <li>"plaintext" - for plain text inserts;</li>
     *   <li>"wordhtml" - for Word-compatible HTML pasting (this should suffice for most
     *     use cases, as it will keep most of the formatting, but removes unsuitable
     *     tags and attributes.</li>
     * </ul>
     * @since 5.3
     */

    /**
     * @cfg {Boolean} stripHtmlTags
     * <p>True if HTML tags should be stripped off before inserting it on paste (defaults to
     * true).</p>
     * <p>The use-case for this option is a bit hard to explain: The system clipboard works
     * MIME type-based. If you select text from a web page directly, the clipboard will
     * usually contain a text/plain and a text/html variant of the selected text. The plain
     * text variant will contain no HTML tags at all, the text/html variant will contain
     * HTML as we would expect it. On the other hand, if you copy HTML code from any
     * source view, you will get at least get a text/plain variant, containing all tags.
     * In some cases (for example if you are using Firefox' "View source"), you will get
     * an additional text/html variant, that will contain the HTML-tags in an entitiy
     * encoded way (&amp;lt;b&amp;gt;bold text&amp;lt;/b&amp;gt;). On paste, the browser
     * will paste the text/html variant if available, the text/plain variant otherwise.
     * Given the second use-case, the HTML tags will appear in the pasted content, as
     * they get either entity encoded by the browser (text/plain) or are already
     * entity-encoded (text/html) on paste. This is where this option kicks in: By setting
     * it to true, the HTML tags from such a source code paste get removed before the
     * pasted content is inserted in the text being edited.</p>
     * <p>Note that this optiion will only work if {@link #defaultPasteMode} is set to
     * "plaintext".</p>
     * @since 5.3
     */

    /**
     * @cfg {Object} htmlPasteRules
     * <p>Defines rules to be applied to HTML code when pasting in wordhtml mode.</p>
     * <ul>
     *   <li><code>allowBasics</code> : Object<br>
     *     Defines basic elements to be allowed. Elements are defined as boolean
     *     properties. Available property names are:
     *     <ul>
     *       <li>"bold"</li>
     *       <li>"italic"</li>
     *       <li>"underline"</li>
     *       <li>"subscript"</li>
     *       <li>"suprscript"</li>
     *       <li>"anchor" (for the a tag in common, e.g. links and named anchors)</li>
     *       <li>"image"</li>
     *     </ul>
     *   </li>
     *   <li><code>allowBlockTags</code> : String[]<br>
     *     Defines a list of all allowed block tags. Block tags are headlines (h1, h2, h3),
     *     paragraphs (p), lists (ol, ul), tables (table) and so on (see DTD for details).
     *     </li>
     *   <li><code>allowedAttributes</code> : Object<br>
     *     Added in CQ 5.4<br>
     *     Defines valid attributes for each (or all) elements of pasted content. Only valid
     *     if {@link #prepareHtmlPaste} is used. Defaults to:
 <pre><code>
  {
     "*": [
         "class"
     ],
     "table": [
         "width", "height", "cellspacing", "cellpadding", "border",
     ],
     "td": [
         "width", "height", "colspan", "rowspan"
     ]
 }
 </code></pre></li>
     *   <li><code>fallbackBlockTag</code> : String<br>
     *     Defines the block tag that is used for blocks that use a block tag that is not
     *     included in allowBlockTags. "p" should suffice in most cases.</li>
     *   <li><code>table</code> : Object<br>
     *     Defines the behaviour for tables. The following properties must be set:
     *     <ul>
     *       <li><code>allow</code> : Boolean<br>
     *         True if tables are allowed for pasting.</li>
     *       <li><code>ignoreMode</code> : String<br>
     *         If allow is set to false, this property defines how to handle table content.
     *         Valid values for ignoreMode are:
     *         <ul>
     *           <li>"remove" - removes table content</li>
     *           <li>"paragraph" - turns table cells into paragraphs</li>
     *         </ul>
     *       </li>
     *     </ul>
     *   </li>
     *   <li><code>list</code> : Object<br>
     *     Defines the behaviour for lists. The following properties must be set:
     *     <ul>
     *       <li><code>allow</code> : Boolean<br>
     *         True if lists are allowed for pasting.</li>
     *       <li><code>ignoreMode</code> : String<br>
     *         If allow is set to false, this property defines how to handle list content.
     *         Valid values for ignoreMode are:
     *         <ul>
     *           <li>"remove" - removes list content</li>
     *           <li>"paragraph" - turns list items into paragraphs</li>
     *         </ul>
     *       </li>
     *     </ul>
     *   </li>
     *   <li><code>cssMode</code> : String<br>
     *     Defines how to cope with CSS classes. Valid values are:
     *     <ul>
     *       <li>"keep" - keep all CSS classes "as they are". Note that you might get
     *         unwanted results when pasting from external sources/websites</li>
     *       <li>"remove" - (default) remove all CSS classes</li>
     *       <li>"whitelist" - keep all CSS classes that are whitelisted through
     *         {@link #allowedCssNames}, remove all others.</li>
     *     </ul>
     *   </li>
     *   <li><code>allowedCssNames</code> : String[]<br>
     *     A list of all allowed CSS class names. Only used if cssMode == "whitelist".</li>
     *   <li><code>linkRemoveRegEx</code> : String<br>
     *     A regular expression that defines links that have to be removed. Defaults to
     *     null</li>
     *   <li><code>removeHandlers</code> : Boolean<br>
     *     Determines if handlers (as defined by handlersToRemove) should be
     *     removed from pasted HTML. Defaults to true.</li>
     *   <li><code>handlersToRemove</code> : String[]<br>
     *     Array that contains all handlers to be removed. Defaults to [
     *     "onabort", "onblur", "onchange", "onclick", "ondblclick", "onerror",
     *     "onfocus", "onkeydown", "onkeypress", "onkeyup", "onload", "onmousedown",
     *     "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onreset",
     *     "onselect", "submit", "onunload" ]</li>
     * </ul>
     * @since 5.3
     */

    /**
     * Flag that determines if a paste operation is currently active.
     * @private
     * @type Boolean
     */
    isPasteOperation: false,

    /**
     * The paste range as a bookmark
     * @type Object
     * @private
     */
    pasteRange: null,

    /**
     * The hidden DIV that used to receive the clipboard data
     * @type HTMLElement
     * @private
     */
    clipboard: null,

    /**
     * Value that determines the preferred scrolling offset (Gecko only, for ensuring
     * caret visibility through {@link CUI.rte.Selection#ensureCaretVisibility}
     * @type Number
     * @private
     */
    geckoPreferredScrollingOffset: null,

    /**
     * @private
     */
    cutUI: null,

    /**
     * @private
     */
    copyUI: null,

    /**
     * @private
     */
    pasteDefaultUI: null,

    /**
     * @private
     */
    pastePlainTextUI: null,

    /**
     * @private
     */
    pasteAsWordUI: null,

    /**
     * @private
     */
    pasteDefaultDialog: null,

    /**
     * @private
     */
    pastePlainTextDialog: null,

    /**
     * @private
     */
    pasteWordHtmlDialog: null,

    _init: function(editorKernel) {
        this.inherited(arguments);
        if (!CUI.rte.Common.ua.isWebKit) {
            editorKernel.addPluginListener("beforekeydown", this.handleKeyDown, this, this,
                    false);
        } else {
            editorKernel.addPluginListener("paste", this.handlePaste, this, this, false);
        }
    },

    handleKeyDown: function(e) {
        if (e.cancelKey) {
            return;
        }
        var com = CUI.rte.Common;
        var key = e.getKey();
        if (this.config.defaultPasteMode != "browser") {
            var isPasteKey = false;
            if (com.ua.isMac) {
                isPasteKey = (e.isMeta() && (e.getCharCode() == 118))
                    || (e.isCtrl() && (key == 86));
            } else {
                isPasteKey = (e.isCtrl() && (key == 86))
                    || (e.isShift() && (key == 45));
            }
            if (isPasteKey) {
                this.beforePaste(e.editContext);
            }
        }
    },

    handlePaste: function(e) {
        if (this.config.defaultPasteMode != "browser") {
            this.beforePaste(e.editContext);
        }
    },

    /**
     * <p>Handler that is called when the paste shortcut is hit ("keydown" event) when
     * tags should get stripped from the pasted content.</p>
     * <p>It transfers the focus to a hidden div where pasting actually occurs. The pasted
     * string is later read and inserted in the actual content component (see
     * {@link #afterPaste}).</p>
     * @private
     */
    beforePaste: function(context) {

        if (this.isPasteOperation) {
            return;
        }

        var com = CUI.rte.Common;

        this.isPasteOperation = true;
        this.pasteRange = this.editorKernel.createQualifiedRangeBookmark(context);

        // can't use Ext functionality here, as it doesn't work correctly with the document
        // object of the iframe.
        this.clipboard = context.createElement("div");
        this.clipboard.style.position = "absolute";
        this.clipboard.style.left = "-10000px";
        this.clipboard.style.width = "9000px";
        this.clipboard.style.top = "0px";
        context.root.appendChild(this.clipboard);
        this.clipboard.appendChild(context.createElement("br"));

        var clipRange;
        if (com.ua.isOldIE) {
            clipRange = context.doc.selection.createRange();
            //force ie to calculate clipRange
            var w = clipRange.boundingWidth;
            clipRange.moveToElementText(this.clipboard);
            clipRange.select();
        } else {
            this.geckoPreferredScrollingOffset =
                    CUI.rte.Selection.getPreferredScrollOffset(context);
            clipRange = context.doc.createRange();
            clipRange.selectNodeContents(this.clipboard);
            var sel = context.win.getSelection();
            sel.removeAllRanges();
            sel.addRange(clipRange);
        }

        CUI.rte.Utils.defer(this.afterPaste, 1, this, [ context ]);
    },

    /**
     * <p>This is the second part of the "custom paste" implementation.</p>
     * <p>It reads the pasted content from the hidden div and inserts it into the regular
     * content.</p>
     * @private
     */
    afterPaste: function(context) {

        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;

        CUI.rte.DomProcessor.correctGeckoCopyBugs(context, this.clipboard);
        var clipboardHtml = this.clipboard.innerHTML;
        this.clipboard.parentNode.removeChild(this.clipboard);
        if (com.ua.isSafari) {
            CUI.rte.Selection.resetSelection(context, "start");
        }
        var execRet = this.editorKernel.execCmd("paste", {
            "html": clipboardHtml,
            "dom": this.clipboard,
            "mode": this.config.defaultPasteMode,
            "pasteRange": this.pasteRange,
            "stripHtmlTags": this.config.stripHtmlTags,
            "htmlRules": this.editorKernel.htmlRules,
            "pasteRules": this.config.htmlPasteRules
        });

        if (com.ua.isGecko) {
            if (execRet.geckoEnsureCaretVisibility && context.iFrame) {
                sel.ensureCaretVisibility(context, context.iframe,
                    this.geckoPreferredScrollingOffset);
            }
            if (execRet.bookmark) {
                sel.selectBookmark(context, execRet.bookmark);
            }
        } else if (com.ua.isWebKit) {
            if (execRet.geckoEnsureCaretVisibility && context.iFrame) {
                CUI.rte.Utils.defer(function() {
                    sel.ensureCaretVisibility(context, context.iframe,
                        this.geckoPreferredScrollingOffset);
                }, 1, this);
            }
        }

        this.clipboard = null;
        this.pasteRange = null;
        this.isPasteOperation = false;
        this.geckoPreferredScrollingOffset = null;
    },

    /**
     * @private
     */
    createPasteDialog: function(type, context, pasteFn) {
        var cfg = {
            "type": type,
            "editContext": context,
            "pasteFn": CUI.rte.Utils.scope(pasteFn, this),
            "cancelFn": CUI.rte.Utils.scope(function() {
                this.pasteRange = null;
            }, this)
        };
        return this.editorKernel.getDialogManager().create(
                CUI.rte.ui.DialogManager.DLG_PASTE, cfg);
    },

    /**
     * @private
     */
    showPasteDialog: function(dialog) {
        dialog.setValue("");
        this.editorKernel.getDialogManager().show(dialog);
    },

    /**
     * @private
     */
    pasteDefault: function(context) {
        var pcmd = CUI.rte.commands.Paste;
        var pasteMode = this.config.defaultPasteMode;
        var pasteDialogMode;
        switch (pasteMode) {
            case pcmd.MODE_BROWSER:
                this.editorKernel.relayCmd("paste", {
                    "mode": pasteMode
                });
                return;
            case pcmd.MODE_WORDHTML:
                pasteDialogMode = "iframe";
                break;
            case pcmd.MODE_PLAINTEXT:
                pasteDialogMode = "plaintext";
                break;
            default:
                throw new Error("Invalid default paste mode: '" + pasteMode + "'.");
        }
        if (!this.pasteDefaultDialog) {
            this.pasteDefaultDialog = this.createPasteDialog(pasteDialogMode, context,
                    this.execPasteDefault);
        }
        this.showPasteDialog(this.pasteDefaultDialog);
    },

    /**
     * @private
     */
    execPasteDefault: function(context, value, isHtml, dom) {
        if (isHtml) {
            this.execPasteWordHtml(context, value, isHtml, dom);
        } else {
            this.execPastePlainText(context, value);
        }
    },

    /**
     * @private
     */
    pastePlainText: function(context) {
        if (!this.pastePlainTextDialog) {
            this.pastePlainTextDialog = this.createPasteDialog("plaintext", context,
                    this.execPastePlainText);
        }
        this.showPasteDialog(this.pastePlainTextDialog);
    },

    /**
     * @private
     */
    execPastePlainText: function(context, value) {
        var pcmd = CUI.rte.commands.Paste;
        this.editorKernel.relayCmd("paste", {
            "mode": pcmd.MODE_PLAINTEXT,
            "text": value,
            "pasteRange": this.pasteRange,
            "stripHtmlTags": this.config.stripHtmlTags
        });
        this.pasteRange = null;
    },

    /**
     * @private
     */
    pasteWordHtml: function(context) {
        if (!this.pasteWordHtmlDialog) {
            this.pasteWordHtmlDialog = this.createPasteDialog("iframe", context,
                    this.execPasteWordHtml);
        }
        this.showPasteDialog(this.pasteWordHtmlDialog);
    },

    /**
     * @private
     */
    execPasteWordHtml: function(context, value, isHtml, dom) {
        var pcmd = CUI.rte.commands.Paste;
        this.editorKernel.relayCmd("paste", {
            "mode": pcmd.MODE_WORDHTML,
            "html": value,
            "dom": dom,
            "pasteRange": this.pasteRange,
            "htmlRules": this.editorKernel.htmlRules,
            "pasteRules": this.config.htmlPasteRules
        });
        this.pasteRange = null;
    },

    getFeatures: function() {
        return [ "cut", "copy", "paste-default", "paste-plaintext", "paste-wordhtml" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("cut")) {
            this.cutUI = tbGenerator.createElement("cut", this, false,
                    this.getTooltip("cut"));
            tbGenerator.addElement("edit", plg.Plugin.SORT_EDIT, this.cutUI, 10);
        }
        if (this.isFeatureEnabled("copy")) {
            this.copyUI = tbGenerator.createElement("copy", this, false,
                    this.getTooltip("copy"));
            tbGenerator.addElement("edit", plg.Plugin.SORT_EDIT, this.copyUI, 10);
        }
        if (this.isFeatureEnabled("paste-default")) {
            this.pasteDefaultUI = tbGenerator.createElement("paste-default", this, false,
                    this.getTooltip("paste-default"));
            tbGenerator.addElement("edit", plg.Plugin.SORT_EDIT, this.pasteDefaultUI, 30);
        }
        if (this.isFeatureEnabled("paste-plaintext")) {
            this.pastePlainTextUI = tbGenerator.createElement("paste-plaintext", this,
                    false, this.getTooltip("paste-plaintext"));
            tbGenerator.addElement("edit", plg.Plugin.SORT_EDIT, this.pastePlainTextUI, 40);
        }
        if (this.isFeatureEnabled("paste-wordhtml")) {
            this.pasteAsWordUI = tbGenerator.createElement("paste-wordhtml", this, false,
                    this.getTooltip("paste-wordhtml"));
            tbGenerator.addElement("edit", plg.Plugin.SORT_EDIT, this.pasteAsWordUI, 50);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        // workaround for a CQ.Util#applyDefaults problem (as it seems)
        var removeLinkRemoveRegEx = false;
        if (pluginConfig.htmlPasteRules) {
            removeLinkRemoveRegEx = (pluginConfig.htmlPasteRules.linkRemoveRegEx === "");
        }
        CQ.Util.applyDefaults(pluginConfig, {
            "defaultPasteMode": "wordhtml",
            "stripHtmlTags": true,
            "htmlPasteRules": {
                "allowBasics": {
                    "bold": true,
                    "italic": true,
                    "underline": true,
                    "anchor": true,
                    "image": true,
                    "subscript": true,
                    "superscript": true
                },
                "allowBlockTags": [
                    "p", "h1", "h2", "h3", "h4", "h5", "h6"
                ],
                "allowedAttributes": {
                    "*": [
                        "class"
                    ],
                    "table": [
                        "width", "height", "cellspacing", "cellpadding", "border"
                    ],
                    "td": [
                        "width", "height", "colspan", "rowspan", "valign"
                    ],
                    "a": [
                        "href", "name", "title", "alt"
                    ],
                    "img": [
                        "src", "title", "alt", "width", "height"
                    ],
                    "span": [
                        "class"
                    ]
                    /*

                    As we don't support changing list types at the moment, we should remove
                    it on paste as well to keep the markup in an editable state. Can be
                    re-enabled once we support editing the list type.

                    ,
                    "ul": [
                        "type"
                    ],
                    "ol": [
                        "type"
                    ]

                    */
                },
                "list": {
                    "allow": true
                },
                "table": {
                    "allow": true
                },
                "linkRemoveRegEx": null
            },
            "tooltips": {
                "cut": {
                    "title": CQ.I18n.getMessage("Cut (Ctrl+X)"),
                    "text": CQ.I18n.getMessage("Cuts the currently selected text and puts it in to the clipboard.")
                },
                "copy": {
                    "title": CQ.I18n.getMessage("Copy (Ctrl+C)"),
                    "text": CQ.I18n.getMessage("Copies the currently selected text to the clipboard.")
                },
                "paste-default": {
                    "title": CQ.I18n.getMessage("Paste (Ctrl+V)"),
                    "text": CQ.I18n.getMessage("Pastes the clipboard content with the default paste method.")
                },
                "paste-plaintext": {
                    "title": CQ.I18n.getMessage("Paste as text"),
                    "text": CQ.I18n.getMessage("Pastes the clipboard content as plain text.")
                },
                "paste-wordhtml": {
                    "title": CQ.I18n.getMessage("Paste from Word"),
                    "text": CQ.I18n.getMessage("Pastes the clipboard content from Word, applying some cleanup.")
                }
            }
        });
        this.config = pluginConfig;
        if (removeLinkRemoveRegEx) {
            delete this.config.htmlPasteRules.linkRemoveRegEx;
        }
        // some backward compatibility fixes
        if (pluginConfig.htmlPasteRules.table.allowed !== undefined) {
            this.config.htmlPasteRules.table.allow =
                    this.config.htmlPasteRules.table.allowed;
            delete this.config.htmlPasteRules.table.allowed;
        }
    },

    execute: function(id, value, env) {
        var context = env.editContext;
        this.pasteRange = this.editorKernel.createQualifiedRangeBookmark(context);
        var cmd = id.toLowerCase();
        switch (cmd) {
            case "cut":
            case "copy":
                this.editorKernel.relayCmd(cmd);
                break;
            case "paste-default":
                this.pasteDefault(context);
                break;
            case "paste-plaintext":
                this.pastePlainText(context);
                break;
            case "paste-wordhtml":
                this.pasteWordHtml(context);
                break;
        }
    },

    updateState: function(selDef) {
        if (this.cutUI) {
            this.cutUI.setDisabled(!selDef.isSelection);
        }
        if (this.copyUI) {
            this.copyUI.setDisabled(!selDef.isSelection);
        }
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("edit", CUI.rte.plugins.EditToolsPlugin);