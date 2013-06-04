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
            if (CUI.rte.Utils.isArray(values)) {
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
        }
    };
