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
 * @class CUI.rte.plugins.JustifyPlugin
 * @extends CUI.rte.plugins.SimpleFormatPlugin
 * <p>This class implements simple character formatting (bold, italic, underlined) as a
 * plugin.</p>
 * <p>The plugin ID is "<b>justify</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>justifyleft</b> - adds a button to left-align the selected block</li>
 *   <li><b>justifyright</b> - adds a button to right-align the selected block</li>
 *   <li><b>justifycenter</b> - adds a button to center the selected block</li>
 * </ul>
 */
CUI.rte.plugins.JustifyPlugin = new Class({

    toString: "JustifyPlugin",

    extend: CUI.rte.plugins.SimpleFormatPlugin,

    _init: function(editorKernel) {
        var plg = CUI.rte.plugins;
        plg.JustifyPlugin.prototype.superClass._init.call(this, editorKernel, "justify",
                plg.Plugin.SORT_JUSTIFY, [ "justifyleft", "justifycenter", "justifyright"]);
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "features": "*",
            "tooltips": {
                "justifyleft": {
                    "title": CUI.rte.Utils.i18n("plugins.justify.leftTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.justify.leftText")
                },
                "justifycenter": {
                    "title": CUI.rte.Utils.i18n("plugins.justify.centerTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.justify.centerText")
                },
                "justifyright": {
                    "title": CUI.rte.Utils.i18n("plugins.justify.rightTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.justify.rightText")
                }
            }
        });
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("justify", CUI.rte.plugins.JustifyPlugin);