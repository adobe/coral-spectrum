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
 * @class CUI.rte.plugins.FormatPlugin
 * @extends CUI.rte.plugins.SimpleFormatPlugin
 * <p>This class implements simple character formatting (bold, italic, underlined) as a
 * plugin.</p>
 * <p>The plugin ID is "<b>format</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>bold</b> - adds the "bold" button</li>
 *   <li><b>italic</b> - adds the "italic" button</li>
 *   <li><b>underline</b> - adds the "underline" button</li>
 * </ul>
 */
CUI.rte.plugins.FormatPlugin = new Class({

    toString: "FormatPlugin",

    extend: CUI.rte.plugins.SimpleFormatPlugin,

    _init: function(editorKernel) {
        var plg = CUI.rte.plugins;
        plg.FormatPlugin.prototype.superClass._init.call(this, editorKernel, "format",
                plg.Plugin.SORT_FORMAT, [ {
                    "command": "bold",
                    "shortcut": "b"
                }, {
                    "command": "italic",
                    "shortcut": "i"
                }, {
                    "command": "underline",
                    "shortcut": "u"
                }]);
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "features": "*",
            "tooltips": {
                "bold": {
                    "title": CUI.rte.Utils.i18n("plugins.format.boldTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.format.boldText")
                },
                "italic": {
                    "title": CUI.rte.Utils.i18n("plugins.format.italicTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.format.italicText")
                },
                "underline": {
                    "title": CUI.rte.Utils.i18n("plugins.format.underlineTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.format.underlineText")
                }
            }
        });
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("format", CUI.rte.plugins.FormatPlugin);