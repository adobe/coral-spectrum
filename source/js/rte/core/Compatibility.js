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
 * @class CQ.form.rte.Compatibility
 * @private
 * @since 5.3
 */
CQ.form.rte.Compatibility = function() {

    var com = CQ.form.rte.Common;

    return {

        moveDeprecatedPluginConfig: function(config) {
            var compat = CQ.form.rte.Compatibility;
            compat.correctConfigOption(config, "defaultPasteMode",
                    "rtePlugins.edit.defaultPasteMode");
            compat.correctConfigOption(config, "stripHtmlTags",
                    "rtePlugins.edit.stripHtmlTags");
            compat.correctConfigOption(config, "tabSize",
                    "rtePlugins.keys.tabSize");
            compat.correctConfigOption(config, "trimLinkSelection",
                    "rtePlugins.links.trimLinkSelection");
            compat.correctConfigOption(config, "anchordialogConfig",
                    "rtePlugins.links.anchorDialogConfig");
            compat.correctConfigOption(config, "indentSize",
                    "rtePlugins.lists.indentSize");
            compat.correctConfigOption(config, "specialCharsConfig",
                    "rtePlugins.misctools.specialCharsConfig");
            compat.correctConfigOption(config, "formats",
                    "rtePlugins.paraformat.formats");
            compat.correctConfigOption(config, "cssStyles",
                    "rtePlugins.styles.styles");
            compat.correctConfigOption(config, "editMode",
                    "rtePlugins.table.editMode");
            compat.correctConfigOption(config,
                    "rtePlugins.table.tablePropConfig.tableStyles",
                    "rtePlugins.table.tableStyles");
            var tableStyles = compat.getConfigValue(config, "rtePlugins.table.tableStyles");
            if (tableStyles) {
                tableStyles = compat.convertToArray(tableStyles, "cssName", "text");
                compat.changeDeprecatedPropertyName(tableStyles, "className", "cssName");
                compat.setConfigValue(config, "rtePlugins.table.tableStyles", tableStyles);
            }
            compat.correctConfigOption(config,
                    "rtePlugins.table.tablePropConfig.defaultValues",
                    "rtePlugins.table.defaultValues");
            compat.correctConfigOption(config,
                    "rtePlugins.table.cellPropConfig.cellStyles",
                    "rtePlugins.table.cellStyles");
            var cellStyles = compat.getConfigValue(config, "rtePlugins.table.cellStyles");
            if (cellStyles) {
                cellStyles = compat.convertToArray(cellStyles, "cssName", "text");
                compat.changeDeprecatedPropertyName(cellStyles, "className", "cssName");
                compat.setConfigValue(config, "rtePlugins.table.cellStyles", cellStyles);
            }
        },

        moveDeprecatedHtmlRules: function(config) {
            var compat = CQ.form.rte.Compatibility;
            var filteredConfig = compat.createFilteredConfig(config, "linkbrowseConfig", [
                "cssInternal",
                "cssExternal",
                "protocols",
                "defaultProtocol",
                "targetConfig"
            ], true);
            var ruleConfig = filteredConfig[0];
            if (ruleConfig != null) {
                compat.setConfigValue(config, "htmlRules.links",
                        new CQ.form.rte.HtmlRules.Links(ruleConfig));
            }
            var dialogConfig = filteredConfig[1];
            if (dialogConfig != null) {
                compat.setConfigValue(config, "rtePlugins.links.linkDialogConfig",
                        dialogConfig);
            }
            compat.correctConfigOption(config, "removeSingleParagraphContainer",
                    "htmlRules.blockHandling.removeSingleParagraphContainer");
            compat.correctConfigOption(config, "singleParagraphContainerReplacement",
                    "htmlRules.blockHandling.singleParagraphContainerReplacement");
        },

        createFilteredConfig: function(config, path, filterIncl, removeJcrLeftovers) {
            var compat = CQ.form.rte.Compatibility;
            var configObj = compat.getConfigValue(config, path);
            if (configObj == null) {
                return [ null, null ];
            }
            if (filterIncl == null) {
                return [ configObj, null ];
            }
            if (removeJcrLeftovers) {
                compat.filterJcrLeftovers(configObj);
            }
            var filteredConfig = { };
            var leftoverConfig = null;
            for (var propName in configObj) {
                if (com.arrayContains(filterIncl, propName)) {
                    filteredConfig[propName] = configObj[propName];
                } else {
                    if (leftoverConfig == null) {
                        leftoverConfig = { };
                    }
                    leftoverConfig[propName] = configObj[propName];
                }
            }
            return [ filteredConfig, leftoverConfig ];
        },

        filterJcrLeftovers: function(obj) {
            if (obj["jcr:primaryType"]) {
                delete obj["jcr:primaryType"];
            }
            if (obj["xtype"] && (obj["xtype"] == "nt:unstructured")) {
                delete obj["xtype"];
            }
        },

        correctConfigOption: function(config, deprecatedPath, currentPath) {
            var compat = CQ.form.rte.Compatibility;
            var deprecatedValue = compat.getConfigValue(config, deprecatedPath);
            if (deprecatedValue != null) {
                compat.setConfigValue(config, currentPath, deprecatedValue);
                compat.removeConfigValue(config, deprecatedPath);
            }
        },

        getConfigValue: function(config, path) {
            var configObj = config;
            var parts = path.split(".");
            for (var p = 0; p < parts.length; p++) {
                configObj = configObj[parts[p]];
                if (configObj == null) {
                    return null;
                }
            }
            return configObj;
        },

        setConfigValue: function(config, path, value) {
            var configObj = config;
            var parts = path.split(".");
            var partCnt = parts.length;
            if (partCnt == 0) {
                return;
            }
            for (var p = 0; p < (partCnt - 1); p++) {
                var configParent = configObj;
                configObj = configObj[parts[p]];
                if (configObj == null) {
                    configObj = { };
                    configParent[parts[p]] = configObj;
                }
            }
            configObj[parts[partCnt - 1]] = value;
        },

        removeConfigValue: function(config, path) {
            var configObj = config;
            var parts = path.split(".");
            var partCnt = parts.length;
            if (partCnt == 0) {
                return;
            }
            for (var p = 0; p < (partCnt - 1); p++) {
                configObj = configObj[parts[p]];
                if (configObj == null) {
                    return;
                }
            }
            delete configObj[parts[partCnt - 1]];
        },

        /**
         * This method provides backwards-compatibility for the "enableXXX"-style
         * configuration that is now deprecated in favor of
         * {@link CQ.form.RichText#rtePlugins}.
         * @param {Object} config The config object to be used for configuration
         * @param {CQ.form.rte.EditorKernel} editorKernel The editor kernel
         * @private
         */
        configurePlugins: function(config, editorKernel) {
            var isButtonEnabled = function(group, buttonId) {
                var isGroupEnabled = false;
                var groupConfig = null;
                if (group == "format") {
                    isGroupEnabled = config.enableFormat;
                    groupConfig = config.formatButtons;
                } else if (group == "alignments") {
                    isGroupEnabled = config.enableAlignments;
                    groupConfig = config.alignmentButtons;
                } else if (group == "lists") {
                    isGroupEnabled = config.enableLists;
                    groupConfig = config.listButtons;
                } else if (group == "links") {
                    isGroupEnabled = config.enableLinks;
                    groupConfig = config.linkButtons;
                } else if (group == "edit") {
                    isGroupEnabled = config.enableEditTools;
                    groupConfig = config.editToolButtons;
                }
                var isEnabled = (isGroupEnabled === undefined ? undefined : false);
                if (isGroupEnabled) {
                    if (groupConfig) {
                        isEnabled = !!groupConfig[buttonId];
                    } else {
                        isEnabled = true;
                    }
                }
                return isEnabled;
            };
            var checkPluginConfig = function(pluginId, feature) {
                var groupId = pluginId;
                switch (pluginId) {
                    case "format":
                        break;
                    case "justify":
                        groupId = "alignments";
                        feature = feature.substring(7, feature.length);
                        break;
                    case "lists":
                        break;
                    case "subsuperscript":
                        return config.enableSubSuperScript;
                    case "links":
                        if (feature == "modifylink") {
                            feature = "createlink";
                        }
                        break;
                    case "paraformat":
                        return config.enableParagraphFormat;
                    case "styles":
                        return config.enableStyle;
                    case "misctools":
                        if (feature == "sourceedit") {
                            return config.enableSourceEdit;
                        }
                        if (feature == "specialchars") {
                            return config.enableSpecialChars;
                        }
                        break;
                }
                return isButtonEnabled(groupId, feature);
            };
            var pluginConfig = config.rtePlugins;
            for (var pluginId in editorKernel.registeredPlugins) {
                if (editorKernel.registeredPlugins.hasOwnProperty(pluginId)) {
                    var plugin = editorKernel.registeredPlugins[pluginId];
                    var plgConfig = { };
                    var features = plugin.getFeatures();
                    var featCnt = features.length;
                    for (var f = 0; f < featCnt; f++) {
                        var isEnabled = checkPluginConfig(pluginId, features[f]);
                        if (isEnabled !== undefined) {
                            if (!plgConfig.features) {
                                plgConfig.features = [ ];
                            }
                            if (isEnabled) {
                                plgConfig.features.push(features[f]);
                            }
                        }
                    }
                    if (pluginConfig && pluginConfig[pluginId]) {
                        CQ.form.rte.Utils.apply(plgConfig, pluginConfig[pluginId]);
                    }
                    plugin.notifyPluginConfig(plgConfig);
                }
            }
        },

        /**
         * Ensures that the specified config object is an array. If it is not an array,
         * an array is created from the properties of the specified object: Each
         * property is converted to an array element that has two properties: one named
         * as specified by keyProp, containing the original property's name; another named
         * as specified by valueProp, containing the original property's value.
         * @param {Object} obj The object to ensure that it is an array.
         * @param {String} keyProp Name of the property containing converted property's name
         * @param {String} valueProp Name of the property containing converted property's
         *        value
         */
        convertToArray: function(obj, keyProp, valueProp) {
            if (!obj) {
                return null;
            }
            com.removeJcrData(obj);
            if (CQ.form.rte.Utils.isArray(obj)) {
                return obj;
            }
            var array = [ ];
            var item;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var value = obj[key];
                    if (typeof(value) == "object") {
                        if (value[keyProp] && value[valueProp]) {
                            array.push(value);
                        } else {
                            item = { };
                            item[keyProp] = key;
                            item[valueProp] = value;
                            array.push(item);
                        }
                    } else {
                        item = { };
                        item[keyProp] = key;
                        item[valueProp] = value;
                        array.push(item);
                    }
                }
            }
            return array;
        },

        /**
         * <p>Changes a deprecated property name (in an array of objects) to the current
         * name.</p>
         * <p>For example: [ { deprecated: "A" }, "deprecated": "B" } ] is converted to
         * [ { "current": "A" }, { "current": "B" } ] (if called with "deprecated" as
         * parameter deprecatedName and "current" as parameter currentName).</p>
         * @param {Object[]} array The array to be converted
         * @param {String} deprecatedName Deprecated property name
         * @param {String} currentName Current property name
         */
        changeDeprecatedPropertyName: function(array, deprecatedName, currentName) {
            if (array == null) {
                return;
            }
            var itemCnt = array.length;
            for (var i = 0; i < itemCnt; i++) {
                var itemToCheck = array[i];
                if (itemToCheck.hasOwnProperty(deprecatedName)) {
                    if (!itemToCheck.hasOwnProperty(currentName)) {
                        itemToCheck[currentName] = itemToCheck[deprecatedName];
                        delete itemToCheck[deprecatedName];
                    }
                }
            }
        },

        /**
         * <p>Ensures that the specified property of the specified object is actually a
         * regular expression and handles default values.</p>
         * <p>This is a workaround for several issues around RegExp handling with CRX.</p>
         * <p>If the specified property does not exist or is undefined/null, the default
         * value is set. If the property value is a String, either a RegExp with the string
         * is created or the value is set to null if an empty string is found. Otherwise,
         * the property is kept "as is".</p>
         * @param {Object} obj The object
         * @param {String} prop The property name
         * @param {RegExp} defaultValue The default value
         * @since 5.5
         */
        adjustRegExp: function(obj, prop, defaultValue) {
            if (obj[prop] == null) {
                obj[prop] = defaultValue;
            } else if (CQ.form.rte.Util.isString(obj[prop])) {
                var propValue = obj[prop];
                var opts = undefined;
                if (com.strStartsWith(propValue, "/")) {
                    var finalSlash = propValue.lastIndexOf("/");
                    if (finalSlash > 0) {
                        if (finalSlash < (propValue.length - 1)) {
                            opts = propValue.substring(finalSlash + 1, propValue.length);
                        }
                        propValue = propValue.substring(1, finalSlash);
                    }
                }
                obj[prop] = (propValue.length == 0 ? null : new RegExp(propValue, opts));
            }
        }

    };

}();