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
 * @class CQ.form.rte.plugins.ImagePlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements the editing of image properties as a plugin.</p>
 * <p>The plugin ID is "<b>image</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>image</b> - adds context menu entries for setting some image properties
 *     (currently only alignment is supported)</li>
 * </ul>
 * @since 5.3
 */
CQ.form.rte.plugins.ImagePlugin = new Class({

    toString: "ImagePlugin",

    extend: CQ.form.rte.plugins.Plugin,


    getFeatures: function() {
        return [ "image" ];
    },

    notifyPluginConfig: function(pluginConfig) {
        this.config = pluginConfig;
    },

    initializeUI: function(tbGenerator) {
        // nothing to do yet, as we are not using the toolbar for images
    },

    execute: function(pluginCommand, value, envOptions) {
        // todo implement
        if (pluginCommand == "image") {
            this.editorKernel.relayCmd("image", value);
        }
    },

    updateState: function(selDef) {
        // must be overridden by implementing plugins
    },

    handleContextMenu: function(menuBuilder, selDef, context) {
        var subItems;
        var ui = CQ.form.rte.ui;
        if (this.isFeatureEnabled("image")) {
            if (this.editorKernel.queryState("image")) {
                subItems = [
                    {
                        "text": CQ.I18n.getMessage("Left"),
                        "plugin": this,
                        "cmd": "image",
                        "cmdValue": {
                            "style.float": "left"
                        }
                    }, {
                        "text": CQ.I18n.getMessage("Right"),
                        "plugin": this,
                        "cmd": "image",
                        "cmdValue": {
                            "style.float": "right"
                        }
                    }, {
                        "text": CQ.I18n.getMessage("None"),
                        "plugin": this,
                        "cmd": "image",
                        "cmdValue": {
                            "style.float": "none"
                        }
                    }, {
                        "text": CQ.I18n.getMessage("No alignment"),
                        "plugin": this,
                        "cmd": "image",
                        "cmdValue": {
                            "style.float": ""
                        }
                    }
                ];
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CQ.I18n.getMessage("Image alignment"),
                    "subItems": subItems
                }));
            }
        }
    }

});


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("image", CQ.form.rte.plugins.ImagePlugin);