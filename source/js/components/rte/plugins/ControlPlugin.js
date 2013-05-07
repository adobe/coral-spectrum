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
 * @class CUI.rte.plugins.ControlPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements some control functionality as a plugin.</p>
 * <p>The plugin ID is "<b>control</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>close</b> - adds a button that dispatches a "close" request</li>
 * </ul>
 */
CUI.rte.plugins.ControlPlugin = new Class({

    toString: "ControlPlugin",

    extend: CUI.rte.plugins.Plugin,


    getFeatures: function() {
        return [ "close" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("close")) {
            this.linkUI = tbGenerator.createElement("close", this, false,
                    this.getTooltip("close"));
            tbGenerator.addElement("control", plg.Plugin.SORT_LINKS, this.linkUI, 10);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "features": "*",
            "tooltips": {
                "close": {
                    "title": CUI.rte.Utils.i18n("Close"),
                    "text": CUI.rte.Utils.i18n("Finish editing the text.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmd, value, env) {
        if (cmd == "close") {
            this.editorKernel.fireUIEvent("requestClose");
        }
    },

    updateState: function(selDef) {
        // nothing to do
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("control", CUI.rte.plugins.ControlPlugin);