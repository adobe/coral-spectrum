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

CUI.rte.ConfigUtils = function() {

    function getPluginDef(action) {
        if (action) {
            var sepPos = action.indexOf("#");
            if (sepPos > 0) {
                var plugin = action.substring(0, sepPos);
                var feature = action.substring(sepPos + 1);
                return {
                    "plugin": plugin,
                    "feature": feature
                };
            }
        }
        return null;
    }

    return {

        createFeaturesFromToolbar: function($container, $toolbar) {
            var featureDefs = [ ];
            // first, analyze the toolbar
            var $buttons = $toolbar.find("button.item");
            $buttons.each(function() {
                var pluginDef = getPluginDef($(this).data("action"));
                if (pluginDef) {
                    featureDefs.push(pluginDef);
                }
            });
            // then, analyze popovers
            var $popovers = $container.find("div.rte-popover button.item");
            $popovers.each(function() {
                var pluginDef = getPluginDef($(this).data("action"));
                if (pluginDef) {
                    featureDefs.push(pluginDef);
                }
            });
            return featureDefs;
        },

        createToolbarFromConfig: function($editable) {
            // TODO implement
        },

        mergeConfigAndFeatures: function(config, features) {
            if (!features || (features.length === 0)) {
                return config;
            }
            var pluginConfig;
            if (config.hasOwnProperty("rtePlugins")) {
                pluginConfig = config["rtePlugins"];
            } else {
                pluginConfig = { };
                config["rtePlugins"] = pluginConfig;
            }
            var featureCnt = features.length;
            for (var f = 0; f < featureCnt; f++) {
                var feature = features[f];
                var pluginId = feature.plugin;
                var featureId = feature.feature;
                var cfg, plgFeature;
                if (!pluginConfig.hasOwnProperty(pluginId)) {
                    cfg = { };
                    pluginConfig[pluginId] = cfg;
                } else {
                    cfg = pluginConfig[pluginId];
                }
                if (cfg.hasOwnProperty("features")) {
                    plgFeature = cfg["features"];
                    if (CUI.rte.Utils.isArray(plgFeature)) {
                        plgFeature.push(featureId)
                    } else {
                        if (plgFeature !== "*") {
                            plgFeature = [ featureId ];
                            cfg["features"] = plgFeature;
                        }
                    }
                } else {
                    plgFeature = [ featureId ];
                    cfg["features"] = plgFeature;
                }
            }
            return config;
        },

        loadConfigAndStartEditing: function(rte, $editable) {
            var features;
            var $container = CUI.rte.UIUtils.getContainer($editable);
            var $toolbar = CUI.rte.UIUtils.getToolbar($editable);

            function processConfig(config) {
                config = CUI.rte.ConfigUtils.mergeConfigAndFeatures(config, features);
                rte.start(config);
            }

            if ($toolbar && ($toolbar.length > 0)) {
                features = CUI.rte.ConfigUtils.createFeaturesFromToolbar($container,
                        $toolbar);
            }
            var config = { };
            var configStr = $editable.data("config");
            if (configStr) {
                try {
                    config = $.parseJSON(configStr);
                } catch (e) {
                    // use default config
                }
                processConfig(config);
            } else {
                var configPath = $editable.data("config-path");
                if (configPath) {
                    $.ajax({
                        "url": configPath,
                        "success": function(data) {
                            processConfig(data);
                        },
                        "error": function() {
                            processConfig({ });
                        }
                    });
                } else {
                    processConfig(config);
                }
            }

        }

    };

}();