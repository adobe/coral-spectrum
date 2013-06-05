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
 * @class CUI.rte.plugins.SubSuperScriptPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements sub- and superscript as a plugin.</p>
 * <p>The plugin ID is "<b>subsuperscript</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>subscript</b> - adds a button to format the selected text with subscript</li>
 *   <li><b>superscript</b> - adds a button to format the selected text with superscript
 *     </li>
 * </ul>
 */
CUI.rte.plugins.SubSuperScriptPlugin = new Class({

    toString: "SubSuperScriptPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    subscriptUI: null,

    /**
     * @private
     */
    superscriptUI: null,


    getFeatures: function() {
        return [ "subscript", "superscript" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("subscript")) {
            this.subscriptUI = tbGenerator.createElement("subscript", this, true,
                    this.getTooltip("subscript"));
            tbGenerator.addElement("format", plg.Plugin.SORT_FORMAT, this.subscriptUI, 100);
        }
        if (this.isFeatureEnabled("superscript")) {
            this.superscriptUI = tbGenerator.createElement("superscript", this, true,
                    this.getTooltip("superscript"));
            tbGenerator.addElement("format", plg.Plugin.SORT_FORMAT, this.superscriptUI,
                    110);
        }
    },

    execute: function(id) {
        this.editorKernel.relayCmd(id);
    },

    updateState: function(selDef) {
        var hasSubscript = this.editorKernel.queryState("subscript", selDef);
        var hasSuperscript = this.editorKernel.queryState("superscript", selDef);
        if (this.subscriptUI != null) {
            this.subscriptUI.setSelected(hasSubscript);
        }
        if (this.superscriptUI != null) {
            this.superscriptUI.setSelected(hasSuperscript);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        // configuring "special characters" dialog
        pluginConfig = pluginConfig || { };
        var defaults = {
            "tooltips": {
                "subscript": {
                    "title": CUI.rte.Utils.i18n("plugins.subSuperScript.subTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.subSuperScript.subText")
                },
                "superscript": {
                    "title": CUI.rte.Utils.i18n("plugins.subSuperScript.superTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.subSuperScript.superText")
                }
            }
        };
        CUI.rte.Utils.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("subsuperscript",
        CUI.rte.plugins.SubSuperScriptPlugin);