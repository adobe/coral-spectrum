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

/**
 * <p>This class implements a default internationalization that has no dependencies
 * on a specific environment.</p>
 */
CUI.rte.DefaultI18nProvider = new Class({

    extend: CUI.rte.I18nProvider,

    /**
     * The default language
     */
    _defaultLanguage: null,

    /**
     * Current language
     */
    _language: null,

    /**
     * Table with translations
     */
    _translations: null,

    construct: function(config) {
        config = config || {};
        this._defaultLanguage = config.defaultLanguage ? config.defaultLanguage : "en";
        this._translations = config.translations ? config.translations
                : CUI.rte.DefaultI18nProvider.DEFAULT_TRANSLATIONS;
        this._language = this._defaultLanguage;
    },

    setLanguage: function(lang) {
        this._language = lang;
    },

    getLanguage: function() {
        return this._language;
    },

    getText: function(id, values) {
        // TODO replace with CUI translation services when available
        var text = id;
        if (this._translations && this._translations.hasOwnProperty(id)) {
            var textDef = this._translations[id];
            if (textDef.hasOwnProperty(this._language)) {
                text = textDef[this._language];
            } else if (textDef.hasOwnProperty(this._defaultLanguage)) {
                text = textDef[this._defaultLanguage];
            }
        }
        if (values) {
            if (!CUI.rte.Utils.isArray(values)) {
                text = text.replace("{0}", values);
            } else {
                for (var s = 0; s < values.length; s++) {
                    text = text.replace("{" + s + "}", values[s])
                }
            }
        }
        return text;
    }

});

CUI.rte.DefaultI18nProvider.DEFAULT_TRANSLATIONS = {
        "kernel.alertTitlePaste": {
            "en": "Paste"
        },
        "kernel.alertSecurityPaste": {
            "en": "Could not paste due to security restrictions of the browser.<br>Please use Ctrl+V to paste directly."
        },
        "kernel.alertTitleCopy": {
            "en": "Copy"
        },
        "kernel.alertSecurityCopy": {
            "en": "Could not copy due to security restrictions of the browser.<br>Please use Ctrl+C to copy directly."
        },
        "kernel.alertTitleCut": {
            "en": "Cut"
        },
        "kernel.alertSecurityCut": {
            "en": "Could not cut due to security restrictions of the browser.<br>Please use Ctrl+X to cut directly."
        },
        "kernel.alertTitleError": {
            "en": "Error"
        },
        "kernel.alertIELimitation": {
            "en": "Could not insert text due to internal Internet Explorer limitations. Please try to select a smaller text fragment and try again."
        },
        "commands.paste.alertTitle": {
            "en": "Paste"
        },
        "commands.paste.alertTableError": {
            "en": "You are trying to paste table data into an existing table.<br>As this operation would result in invalid HTML, it has been cancelled.<br>Please try to simplify the table's structure and try again."
        },
        "commands.paste.alertCellSelectionError": {
            "en": "You are trying to paste table data into an non-rectangular cell selection.<br>Please choose a rectangular cell selection and try again."
        },
        "plugins.editTools.cutTitle": {
            "en": "Cut (Ctrl+X)"
        },
        "plugins.editTools.cutText": {
            "en": "Cuts the currently selected text and puts it in to the clipboard."
        },
        "plugins.editTools.copyTitle": {
            "en": "Copy (Ctrl+C)"
        },
        "plugins.editTools.copyText": {
            "en": "Copies the currently selected text to the clipboard."
        },
        "plugins.editTools.pasteDefaultTitle": {
            "en": "Paste (Ctrl+V)"
        },
        "plugins.editTools.pasteDefaultText": {
            "en": "Pastes the clipboard content with the default paste method."
        },
        "plugins.editTools.pastePlainTextTitle": {
            "en": "Paste as text"
        },
        "plugins.editTools.pastePlainTextText": {
            "en": "Pastes the clipboard content as plain text."
        },
        "plugins.editTools.pasteWordHtmlTitle": {
            "en": "Paste from Word"
        },
        "plugins.editTools.pasteWordHtmlText": {
            "en": "Pastes the clipboard content from Word, applying some cleanup."
        },
        "plugins.findReplace.findTitle": {
            "en": "Find"
        },
        "plugins.findReplace.replaceTitle": {
            "en": "Replace"
        },
        "plugins.findReplace.findReplaceTitle": {
            "en": "Find/Replace"
        },
        "plugins.findReplace.replaceAllTitle": {
            "en": "Replace all"
        },
        "plugins.findReplace.alertNoMoreResults": {
            "en": "No more occurences of '{0}' found in document.<br>Search will be continued from the top."
        },
        "plugins.findReplace.alertReplaceResults": {
            "en": "Text '{0}' has been replaced {1} time(s)."
        },
        "plugins.findReplace.alertNotFound": {
            "en": "Text '{0}' not found."
        },
        "plugins.findReplace.alertIEProblems": {
            "en": "Could not replace due to limited functionality in Internet Explorer."
        },
        "plugins.findReplace.tooltipFind": {
            "en": "Finds a text fragment in the text being edited."
        },
        "plugins.findReplace.tooltipReplace": {
            "en": "Replaces a text fragment with another fragment."
        },
        "plugins.format.boldTitle": {
            "en": "Bold (Ctrl+B)"
        },
        "plugins.format.boldText": {
            "en": "Make the selected text bold."
        },
        "plugins.format.italicTitle": {
            "en": "Italic (Ctrl+I)"
        },
        "plugins.format.italicText": {
            "en": "Make the selected text italic."
        },
        "plugins.format.underlineTitle": {
            "en": "Underline (Ctrl+U)"
        },
        "plugins.format.underlineText": {
            "en": "Underline the selected text."
        }
    };
