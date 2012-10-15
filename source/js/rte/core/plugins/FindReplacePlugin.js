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
 * @class CUI.rte.plugins.FindReplacePlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements find and replace as a plugin.</p>
 * <p>The plugin ID is "<b>findreplace</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>find</b> - adds a button to find text</li>
 *   <li><b>replace</b> - adds a button to find text and replace it with another text</li>
 * </ul>
 */
CUI.rte.plugins.FindReplacePlugin = new Class({

    toString: "FindReplacePlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    findUI: null,

    /**
     * @private
     */
    replaceUI: null,

    /**
     * @private
     */
    findDialog: null,

    /**
     * @private
     */
    replaceDialog: null,

    /**
     * @private
     */
    currentSearchDef: null,

    /**
     * @private
     */
    savedRange: null,


    find: function(context) {
        var com = CUI.rte.Common;
        var dm = this.editorKernel.getDialogManager();
        if (com.ua.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        if (!this.findDialog || dm.mustRecreate(this.findDialog)) {
            var config = {
                "editContext": context,
                "title": CQ.I18n.getMessage("Find"),
                "isReplace": false,
                "findFn": CUI.rte.Utils.scope(this.execFind, this),
                "cancelFn": CUI.rte.Utils.scope(this.execCancel, this)
            };
            this.findDialog = dm.create(CUI.rte.ui.DialogManager.DLG_FINDREPLACE,
                    config);
        }
        this.findDialog.setMode(true, false);
        dm.show(this.findDialog);
    },

    execFind: function(context, options, dialog) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        if (com.ua.isIE && this.savedRange) {
            this.savedRange.select();
        }
        var findText = options.findText;
        var matchCase = options.matchCase;
        if (this.currentSearchDef
                && ((this.currentSearchDef.findText != findText)
                        || (this.currentSearchDef.matchCase != matchCase))) {
            this.currentSearchDef = null;
        }
        var match, selection;
        if (!this.currentSearchDef) {
            selection = sel.createProcessingSelection(context);
            var startNode = selection.startNode;
            var startOffset = selection.startOffset;
            if (com.getNodeCharacterCnt(startNode) == 0) {
                startNode = com.getFirstTextChild(startNode, true);
                if (!startNode) {
                    startNode = com.getNextCharacterNode(context, selection.startNode);
                }
                if (startNode) {
                    startOffset = (startNode.nodeType == 1 ? null : 0);
                } else {
                    startOffset = null;
                }
            }
            var searchDoc = new CUI.rte.SearchableDocument();
            searchDoc.create(context.root);
            var config = {
                "ignoreCase": !matchCase
            };
            this.currentSearchDef = {
                "findText": findText,
                "matchCase": matchCase,
                "doc": searchDoc
            };
            var findPos = searchDoc.getRefForNode(startNode);
            if (findPos) {
                findPos = findPos.textPos + startOffset;
                config.startPos = findPos;
            }
            match = searchDoc.find(findText, config);
        } else {
            match = this.currentSearchDef.doc.findNext();
        }
        if (!match) {
            dialog.setMode(false, false);
            this.editorKernel.getDialogManager().alert(
                    CQ.I18n.getMessage("Find/Replace"),
                    CQ.I18n.getMessage("No more occurences of '{0}' found in document.<br>Search will be continued from the top.", [ findText ]),
                    CUI.rte.Utils.scope(this.findDialog.focusFindField, this.findDialog));

            this.currentSearchDef.doc.create(context.root);
        }
        if (match && (match.length > 0)) {
            dialog.setMode(false, true);
            var startDef = match[0];
            var endDef = match[match.length - 1];
            selection = {
                "startNode": startDef.node,
                "startOffset": startDef.matchPos - startDef.nodePos,
                "endNode": endDef.node,
                "endOffset": (endDef.matchPos - endDef.nodePos) + endDef.matchChars
            };
            if (com.ua.isIE) {
                this.editorKernel.focus(context);
            }
            var bookmark = sel.bookmarkFromProcessingSelection(context, selection);
            sel.selectBookmark(context, bookmark);
            if (!com.ua.isOldIE && context.iFrame) {
                // ensure correct scroll offsets for Gecko - which is a "little" bit tricky,
                // as we need to change the DOM and have to restore the DOM accordingly
                // afterwards
                var range = sel.getLeadRange(context);
                var parentNode = range.commonAncestorContainer;
                while (parentNode.nodeType == 3) {
                    parentNode = parentNode.parentNode;
                }
                var savedChildren = dpr.saveChildNodes(parentNode);
                var span = context.createElement("span");
                range.surroundContents(span);
                var top = span.offsetTop;
                var parent = span.offsetParent;
                while (parent) {
                    top += parent.offsetTop;
                    parent = parent.offsetParent;
                }
                var bottom = top + span.offsetHeight;
                var scrollTop = context.root.scrollTop;
                var iframeHeight = context.iFrame.clientHeight;
                var scrollBottom = scrollTop + iframeHeight;
                if (bottom < scrollTop) {
                    context.root.scrollTop = top;
                } else if (bottom > scrollBottom) {
                    var maxScroll = context.root.scrollHeight;
                    if ((maxScroll - bottom) < 8) {
                        bottom = maxScroll;
                    }
                    if (bottom > scrollBottom) {
                        context.root.scrollTop = bottom - iframeHeight;
                    }
                }
                dpr.removeWithoutChildren(span);
                parentNode.normalize();
                dpr.restoreChildNodes(parentNode, savedChildren);
                sel.selectBookmark(context, bookmark);
            }
            if (com.ua.isIE) {
                this.savedRange = context.doc.selection.createRange();
            }
        }
    },

    replace: function(context) {
        var com = CUI.rte.Common;
        var dm = this.editorKernel.getDialogManager();
        if (com.ua.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        if (!this.replaceDialog || dm.mustRecreate(this.replaceDialog)) {
            var config = {
                "editContext": context,
                "isReplace": true,
                "findFn": CUI.rte.Utils.scope(this.execFind, this),
                "replaceFn": CUI.rte.Utils.scope(this.execReplace, this),
                "cancelFn": CUI.rte.Utils.scope(this.execCancel, this)
            };
            this.replaceDialog = dm.create(CUI.rte.ui.DialogManager.DLG_FINDREPLACE,
                    config);
        }
        this.replaceDialog.setMode(true, false);
        dm.show(this.replaceDialog);
    },

    execReplace: function(context, options, dialog) {
        var com = CUI.rte.Common;
        var dm = this.editorKernel.getDialogManager();
        if (com.ua.isIE) {
            this.savedRange.select();
        }
        var sel = CUI.rte.Selection;
        if (options.replaceAll) {
            this.editorKernel.focus(context);
            var searchDoc = new CUI.rte.SearchableDocument();
            searchDoc.create(context.root);
            var config = {
                "ignoreCase": !options.matchCase
            };
            var replaceCnt = 0;
            var match = searchDoc.find(options.findText, config);
            while (match) {
                var startDef = match[0];
                var endDef = match[match.length - 1];
                var selection = {
                    "startNode": startDef.node,
                    "startOffset": startDef.matchPos - startDef.nodePos,
                    "endNode": endDef.node,
                    "endOffset": (endDef.matchPos - endDef.nodePos) + endDef.matchChars
                };
                var bookmark = sel.bookmarkFromProcessingSelection(context, selection);
                sel.selectBookmark(context, bookmark);
                this.editorKernel.execCmd("inserthtml", CUI.rte.Utils.htmlEncode(
                        options.replaceText));
                searchDoc.adjustToReplace(options.replaceText);
                replaceCnt++;
                // todo implent more efficently
                searchDoc.create(context.root);
                match = searchDoc.findNext();
            }
            dm.hide(dialog);
            if (replaceCnt > 0) {
                this.editorKernel.getDialogManager().alert(
                        CQ.I18n.getMessage("Replace all"),
                        CQ.I18n.getMessage("Text '{0}' has been replaced {1} time(s).",
                                [ options.findText, replaceCnt ]),
                        CUI.rte.Utils.scope(this.editorKernel.focus,
                                this.editorKernel));
            } else {
                this.editorKernel.getDialogManager().alert(
                        CQ.I18n.getMessage("Replace all"),
                        CQ.I18n.getMessage("Text '{0}' not found."),
                        CUI.rte.Utils.scope(this.editorKernel.focus,
                                this.editorKernel));
            }
            this.editorKernel.focus(context);
        } else {
            var preventFind = false;
            try {
                this.editorKernel.focus(context);
                this.editorKernel.execCmd("inserthtml", CUI.rte.Utils.htmlEncode(
                        options.replaceText));
                this.currentSearchDef.doc.adjustToReplace(options.replaceText);
                // todo find a more efficient way than to recreate the entire searchable doc
                this.currentSearchDef.doc.create(context.root);
            } catch (e) {
                if (e.message == "Could not insert html due to IE limitations.") {
                    this.editorKernel.getDialogManager().alert(
                            CQ.I18n.getMessage("Replace"),
                            CQ.I18n.getMessage("Could not replace due to limited functionality in Internet Explorer."));
                    preventFind = true;
                } else {
                    throw e;
                }
                this.editorKernel.focus(context);
            }
            this.editorKernel.updateToolbar();
            if (!preventFind) {
                if (com.ua.isIE) {
                    this.savedRange = null;
                }
                this.execFind(context, options, dialog);
            } else {
                if (com.ua.isIE) {
                    this.savedRange.select();
                }
                dialog.setMode(false, false);
            }
        }
    },

    execCancel: function() {
        this.currentSearchDef = null;
    },

    getFeatures: function() {
        return [ "find", "replace" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        if (this.isFeatureEnabled("find")) {
            this.findUI = tbGenerator.createElement("find", this, false,
                    this.getTooltip("find"));
            tbGenerator.addElement("findreplace", plg.Plugin.SORT_EDIT + 5, this.findUI,
                    100);
        }
        if (this.isFeatureEnabled("replace")) {
            this.replaceUI = tbGenerator.createElement("replace", this, false,
                    this.getTooltip("replace"));
            tbGenerator.addElement("findreplace", plg.Plugin.SORT_EDIT + 5, this.replaceUI,
                    110);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "tooltips": {
                "find": {
                    "title": CQ.I18n.getMessage("Find"),
                    "text": CQ.I18n.getMessage("Finds a text fragment in the text being edited.")
                },
                "replace": {
                    "title": CQ.I18n.getMessage("Replace"),
                    "text": CQ.I18n.getMessage("Replaces a text fragment with another fragment.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(id, value, env) {
        switch (id) {
            case "find":
                this.find(env.editContext);
                break;
            case "replace":
                this.replace(env.editContext);
                break;
        }

    },

    updateState: function(selDef) {
        // todo implement
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("findreplace",
        CUI.rte.plugins.FindReplacePlugin);