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
 * @class CQ.form.rte.plugins.JustifyPlugin
 * @extends CQ.form.rte.plugins.SimpleFormatPlugin
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
CQ.form.rte.plugins.JustifyPlugin = new Class({

    toString: "JustifyPlugin",

    extend: CQ.form.rte.plugins.SimpleFormatPlugin,

    _init: function(editorKernel) {
        var plg = CQ.form.rte.plugins;
        plg.JustifyPlugin.prototype.superClass._init.call(this, editorKernel, "justify",
                plg.Plugin.SORT_JUSTIFY, [ "justifyleft", "justifycenter", "justifyright"]);
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "features": "*",
            "tooltips": {
                "justifyleft": {
                    "title": CQ.I18n.getMessage("Align Text Left"),
                    "text": CQ.I18n.getMessage("Align text to the left.")
                },
                "justifycenter": {
                    "title": CQ.I18n.getMessage("Center Text"),
                    "text": CQ.I18n.getMessage("Center text in the editor.")
                },
                "justifyright": {
                    "title": CQ.I18n.getMessage("Align Text Right"),
                    "text": CQ.I18n.getMessage("Align text to the right.")
                }
            }
        });
        this.config = pluginConfig;
    }

});


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("justify", CQ.form.rte.plugins.JustifyPlugin);