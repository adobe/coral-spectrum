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

    return {

        createFeaturesFromToolbar: function($container, $toolbar) {
            // first, analyze the toolbar
            var $buttons = $toolbar.find("button.item");
            console.log($buttons);
            // then, analyze popovers
            var $popovers = $container.find("button[data-action^=\"#\"]");
            console.log($popovers);
            return [ ];
        },

        createToolbarFromConfig: function($editable) {
            // TODO implement
        },

        getBaseConfig: function($editable) {
            // TODO implement
        },

        calculateConfig: function(rte, $editable) {
            var features;
            var $container = CUI.rte.UIUtils.getContainer($editable);
            var $toolbar = CUI.rte.UIUtils.getToolbar($editable);

            function processConfig(config) {
                rte.start(config);
            }

            if ($toolbar && ($toolbar.length > 0)) {
                features = CUI.rte.ConfigUtils.createFeaturesFromToolbar($container,
                        $toolbar);
                console.log("features", features);
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