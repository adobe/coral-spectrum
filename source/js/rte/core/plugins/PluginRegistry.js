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
 * @class CUI.rte.plugins.PluginRegistry
 * This class is used to manage plugins available for rich text editing. Each plugin has a
 * respective identifier by which it can be referenced.
 * @private
 * @since 5.3
 */
CUI.rte.plugins.PluginRegistry = function() {

    var pluginRegistry = { };

    return {

        /**
         * Registers the specified class as a rich text editing plugin.
         * @param {String} pluginId The plugin ID
         * @param {Function} cls The plugin class (must implement
         *        {@link CUI.rte.plugins.Plugin})
         */
        register: function(pluginId, cls) {
            pluginRegistry[pluginId] = cls;
        },

        /**
         * <p>Creates an associatve array, containing instances of all currently registered
         * plugins.</p>
         * <p>The created object may be used by a single {@link CUI.rte.EditorKernel}
         * instance.</p>
         * @param {CUI.rte.EditorKernel} editorKernel The EditorKernel the plugins are
         *        used by
         * @return {Object} Instantiated plugins
         */
        createRegisteredPlugins: function(editorKernel) {
            var registeredPlugins = { };
            for (var pluginId in pluginRegistry) {
                if (pluginRegistry.hasOwnProperty(pluginId)) {
                    var plugin = new pluginRegistry[pluginId](editorKernel, pluginId);
                    plugin = CUI.rte.Utils.onPluginCreated(plugin);
                    registeredPlugins[pluginId] = plugin;
                }
            }
            return registeredPlugins;
        }

    };

}();