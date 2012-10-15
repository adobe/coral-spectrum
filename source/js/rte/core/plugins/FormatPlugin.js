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
 * @class CQ.form.rte.plugins.FormatPlugin
 * @extends CQ.form.rte.plugins.SimpleFormatPlugin
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
CQ.form.rte.plugins.FormatPlugin = new Class({

    toString: "FormatPlugin",

    extend: CQ.form.rte.plugins.SimpleFormatPlugin,

    _init: function(editorKernel) {
        var plg = CQ.form.rte.plugins;
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
        CQ.Util.applyDefaults(pluginConfig, {
            "features": "*",
            "tooltips": {
                "bold": {
                    "title": CQ.I18n.getMessage("Bold (Ctrl+B)"),
                    "text": CQ.I18n.getMessage("Make the selected text bold.")
                },
                "italic": {
                    "title": CQ.I18n.getMessage("Italic (Ctrl+I)"),
                    "text": CQ.I18n.getMessage("Make the selected text italic.")
                },
                "underline": {
                    "title": CQ.I18n.getMessage("Underline (Ctrl+U)"),
                    "text": CQ.I18n.getMessage("Underline the selected text.")
                }
            }
        });
        this.config = pluginConfig;
    }

});


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("format", CQ.form.rte.plugins.FormatPlugin);