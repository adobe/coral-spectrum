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
 * @class CUI.rte.plugins.SpellCheckerPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements the spellchecker functionality as a plugin.</p>
 * <p>The plugin ID is "<b>spellcheck</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>checktext</b> - adds a button to spellcheck the entire text</li>
 * </ul>
 * @since 5.3
 */
CUI.rte.plugins.SpellCheckerPlugin = new Class({

    toString: "SpellCheckerPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    checkTextUI: null,

    /**
     * @cfg {String} method
     * The HTTP method to be used for spellchecking requests. Defaults to "POST"
     */

    /**
     * @cfg {String} spellcheckerUrl
     * URL that is used for requesting the spellchecker. The specified URL is automatically
     * being externalized (the webapp context path is prepended if necessary). Defaults
     * to "/bin/spellcheck"
     */

    /**
     * @cfg {String} invalidStyle
     * Style definition that is used to mark wrongly spelled words; defaults to
     * "background-color: #ffffaa;"
     */

    /**
     * @cfg {String} invalidClass
     * CSS class that is used to mark wrongly spelled words; defaults to null
     */

    /**
     * @private
     */
    checkText: function(context) {
        this.clearInvalidationMarks(context);
        var url = this.config.spellcheckerUrl;
        var callback = function(options, isSuccess, response) {
            if (isSuccess) {
                this.checkSuccess(context, response);
            } else {
                this.checkFailure();
            }
        };
        var params = {
            "_charset_": "utf-8",
            "mode": "text",
            "html": "true",
            "text": context.root.innerHTML,
            "cp": this.editorKernel.getContentPath()
        };
        switch (this.config.method.toLowerCase()) {
            case "post":
                _g.shared.HTTP.post(url, callback, params, this, true, false);
                break;
            case "get":
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        url = _g.shared.HTTP.addParameter(url, key, params[key]);
                    }
                }
                _g.shared.HTTP.get(url, callback, this, false);
                break;
        }
    },

    checkSuccess: function(context, response) {
        var isError = true;
        try {
            var spellcheckResults;
            var method = this.config.method.toLowerCase();
            if (method == "post") {
                if (response && response.headers && response.headers.json) {
                    spellcheckResults = CUI.rte.Utils.jsonDecode(response.headers.json);
                    isError = false;
                }
            } else if (method == "get") {
                if (response && response.body) {
                    spellcheckResults = CUI.rte.Utils.jsonDecode(response.body);
                    isError = false;
                }
            }
        } catch (e) {
           // ignore by default
        }
        if (isError) {
            this.editorKernel.getDialogManager().alert(
                    CUI.rte.Utils.i18n("Spell checking"),
                    CUI.rte.Utils.i18n("Spell checking failed."));
            return;
        }
        var hasErrors = false;
        var words = spellcheckResults.words;
        var wordCnt = words.length;
        for (var w = 0; w < wordCnt; w++) {
            var word = words[w];
            var result = word.result;
            if (!result.isCorrect) {
                var startPos = word.start;
                var charCnt = word.chars;
                var suggestions = result.suggestions;
                this.markInvalidWord(context, startPos, charCnt, suggestions);
                hasErrors = true;
            }
        }
        if (!hasErrors) {
            this.editorKernel.getDialogManager().alert(
                    CUI.rte.Utils.i18n("Spell checking"),
                    CUI.rte.Utils.i18n("No spelling mistakes found."));
        }
    },

    checkFailure: function() {
        this.checkTextUI.setSelected(false);
        this.editorKernel.getDialogManager().alert(
                CUI.rte.Utils.i18n("Spell checking"),
                CUI.rte.Utils.i18n("Spell checking failed."));
    },

    markInvalidWord: function(context, startPos, charCnt, suggestions) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var startDef = com.getNodeAtPosition(context, startPos);
        var endDef = com.getNodeAtPosition(context, startPos + charCnt);
        // handle EOP situations correctly
        var endNode = endDef.dom;
        var endOffset = endDef.offset;
        if ((endNode.nodeType == 1) && (endDef.offset == null)) {
            var baseEndNode = endNode;
            endNode = com.getLastTextChild(baseEndNode);
            if (!endNode) {
                endNode = com.getPreviousTextNode(context, baseEndNode);
            }
            endOffset = com.getNodeCharacterCnt(endNode);
        }
        var nodeList = dpr.createNodeList(context, {
            "startNode": startDef.dom,
            "startOffset": startDef.offset,
            "endNode": endNode,
            "endOffset": endOffset
        });
        var suggAttrib = null;
        if (suggestions != null) {
            var suggCnt = suggestions.length;
            for (var s = 0; s < suggCnt; s++) {
                var suggestion = suggestions[s];
                if (s == 0) {
                    suggAttrib = suggestion;
                } else {
                    suggAttrib += "|" + suggestion;
                }
            }
        }
        var attribs = {
            "_rtetemp": "spchk"
        };
        if (this.config.invalidStyle) {
            attribs["style"] = this.config.invalidStyle;
        }
        if (this.config.invalidClass) {
            attribs["className"] = this.config.invalidClass;
        }
        if (suggAttrib != null) {
            attribs["_rtespchksugg"] = suggAttrib;
        }
        nodeList.surround(context, "span", attribs);
    },

    clearInvalidationMarks: function(context) {
        var dpr = CUI.rte.DomProcessor;
        dpr.removeTagsFromHierarchy(context.root, {
            "tagName": "span",
            "attribValues": { "_rtetemp": "spchk" }
        });
    },

    _init: function(editorKernel) {
        this.inherited(arguments);
        editorKernel.addPluginListener("keyup", this.handleOnKey, this, this, false);
        editorKernel.addPluginListener("sourceedit", this.handleSourceEdit, this, this,
                false);
    },

    handleOnKey: function(e) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var context = e.editContext;
        if (!e.isCaretMovement()) {
            var pSel = sel.createProcessingSelection(context);
            if (pSel && !pSel.endNode) {
                var isRemoved = false;
                var bookmark = sel.bookmarkFromProcessingSelection(context, pSel);
                var nodeToProcess = pSel.startNode;
                while (nodeToProcess) {
                    var pNode = com.getParentNode(context, nodeToProcess);
                    if (com.isTag(nodeToProcess, "span")) {
                        if (com.getAttribute(nodeToProcess, "_rtetemp") == "spchk") {
                            dpr.removeWithoutChildren(nodeToProcess);
                            isRemoved = true;
                        }
                    }
                    nodeToProcess = pNode;
                }
                if (isRemoved) {
                    sel.selectBookmark(context, bookmark);
                }
            }
        }
    },

    handleSourceEdit: function(e) {
        // deselect spellcheck button if sourceedit mode has been enabled, as results will
        // get invalid and highlights be removed anyway
        if (e.enabled && this.checkTextUI) {
            this.checkTextUI.setSelected(false, true);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "invalidStyle": "background-color: #ffffaa;",
            "invalidClass": null,
            "method": "POST",
            "spellcheckerUrl": "/libs/cq/ui/rte/spellcheck",
            "tooltips": {
                "checktext": {
                    "title": CUI.rte.Utils.i18n("Check spelling"),
                    "text": CUI.rte.Utils.i18n("Checks the spelling of the entire text.")
                }
            }
        });
        this.config = pluginConfig;
    },

    getFeatures: function() {
        return [ "checktext" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("checktext")) {
            this.checkTextUI = tbGenerator.createElement("checktext", this, true,
                    this.getTooltip("checktext"));
            tbGenerator.addElement("spellcheck", plg.Plugin.SORT_LISTS, this.checkTextUI,
                    10);
        }
    },

    execute: function(id, value, env) {
        var dpr = CUI.rte.DomProcessor;
        switch (id) {
            case "checktext":
                if (this.checkTextUI.isSelected()) {
                    this.checkText(env.editContext);
                } else {
                    this.clearInvalidationMarks(env.editContext);
                }
                break;
            case "replace":
                value.dom.innerHTML = value.replacement;
                dpr.removeWithoutChildren(value.dom);
                break;
        }
    },

    updateState: function(selDef) {
        // nothing to do here
    },

    /**
     * @private
     */
    handleContextMenu: function(menuBuilder, selDef, context) {
        var com = CUI.rte.Common;
        var ui = CUI.rte.ui;
        var nodeList = selDef.nodeList;
        var spchkSpan = com.getTagInPath(context, nodeList.commonAncestor, "span", {
            "_rtetemp": "spchk"
        });
        if (spchkSpan) {
            var suggestions = com.getAttribute(spchkSpan, "_rtespchksugg");
            var subItems = [ ];
            if (suggestions) {
                suggestions = suggestions.split("|");
                var suggestCnt = suggestions.length;
                for (var s = 0; s < suggestCnt; s++) {
                    subItems.push({
                        "text": suggestions[s],
                        "plugin": this,
                        "cmd": "replace",
                        "cmdValue": {
                            "dom": spchkSpan,
                            "replacement": suggestions[s]
                        }
                    });
                }
            } else {
                subItems.push({
                    "text": CUI.rte.Utils.i18n("No suggestions available."),
                    "disabled": true
                });
            }
            menuBuilder.addItem(menuBuilder.createItem({
                "text": CUI.rte.Utils.i18n("Spelling suggestions"),
                "subItems": subItems
            }));
        }
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("spellcheck",
        CUI.rte.plugins.SpellCheckerPlugin);
