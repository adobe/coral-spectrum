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
 * @class CUI.rte.plugins.Plugin
 * <p>This class works as an interface and hence must be extended by all plugin
 * implementations.</p>
 * <p>Each plugin may provide one or more "features", that represent the actual editing
 * action and usually map 1:1 to a UI element (for example, a toolbar button or a context
 * menu entry).</p>
 * <p>Plugins should not be instantiated directly, but registred with
 * {@link CUI.rte.plugins.PluginRegistry} for implicit instantiation.</p>
 * @constructor
 * Creates a new Plugin.
 * @param {CUI.rte.EditorKernel} editorKernel The editor kernel the plugin is used by
 */
CUI.rte.plugins.Plugin = new Class({

    /**
     * @cfg {String/String[]} features
     * Defines which features of the plugin are activated. You may provide a String
     * value of "*" to enable all features of the respective plugin, or provide a String[]
     * that contains the IDs of active features. Features and their IDs are documented
     * at the corresponding plugin class. A String value of "-" can be used to explicitly
     * deactivate all features of the plugin.
     */
    features: null,

    /**
     * Back reference to the editor kernel the plugin is used from
     * @type CUI.rte.EditorKernel
     * @private
     */
    editorKernel: null,

    config: null,

    isFeatureEnabled: function(feature) {
        if (!this.config || !this.config.features || (this.config.features == '-')) {
            return false;
        }
        if (this.config.features === "*") {
            return true;
        }
        var featCnt = this.config.features.length;
        for (var featIndex = 0; featIndex < featCnt; featIndex++) {
            var featureToCheck = this.config.features[featIndex];
            if (featureToCheck == feature) {
                return true;
            }
        }
        return false;
    },

    construct: function(editorKernel) {
        this._init(editorKernel);
    },

    _init: function(editorKernel) {
        this.editorKernel = editorKernel;
    },

    getFeatures: function() {
        // must be overridden by implementing plugins
        return [ ];
    },

    reportStyles: function() {
        return null;
    },

    notifyPluginConfig: function(pluginConfig) {
        this.config = pluginConfig;
    },

    initializeUI: function(tbGenerator) {
        // must be overridden by implementing plugins
    },

    execute: function(pluginCommand, value, envOptions) {
        // must be overridden by implementing plugins
    },

    updateState: function(selDef) {
        // must be overridden by implementing plugins
    },

    handleContextMenu: function(menuBuilder, selDef, context) {
        // may be overridden by implementing plugins if context menu access is required
    },

    manipulateSelection: function(selectionDef) {
        // may be overridden by implementing plugins if manipulating a selection before
        // applying a command/evaluating a selection's state is required
    },

    saveRangeBookmark: function(rangeBookmark) {
        // may be overridden by implementing plugins if saving additional data to a range
        // bookamrk is required
    },

    restoreRangeBookmark: function(rangeBookmark) {
        // may be overridden by implementing plugins if restoring additional data from a
        // range bookamrk is required
    },

    interceptContent: function(contentType, defs) {
        // may be overridden by implementing plugins if they have to modify/intercept
        // HTML code creation at certain points of processing
        return null;
    },

    getTooltip: function(command) {
        return (this.config.tooltips ? this.config.tooltips[command] : null)
    }

});

/**
 * Default sort index for table controls in table edit mode
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.plugins.Plugin.SORT_TABLE_TABLEMODE = 0;

/**
 * Default sort index for edit tools (cut, copy, paste)
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_EDIT = 110;

/**
 * Default sort index for undo/redo
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_UNDO = 120;

/**
 * Default sort index for format tools (bold, italic, underlined)
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_FORMAT = 130;

/**
 * Default sort index for justification (left, center, right)
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_JUSTIFY = 140;

/**
 * Default sort index for link controls
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_LINKS = 150;

/**
 * Default sort index for list controls
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_LISTS = 160;

/**
 * Default sort index for image controls
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_IMAGE = 170;

/**
 * Default sort index for table controls
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.plugins.Plugin.SORT_TABLE = 180;

/**
 * Default sort index for styles
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_STYLES = 350;

/**
 * Default sort index for paragraph formats
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_PARAFORMAT = 360;

/**
 * Default sort index for the spellchecker
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_SPELLCHECK = 370;

/**
 * Default sort index for misc tools
 * @private
 * @static
 * @final
 * @type Number
 */
CUI.rte.plugins.Plugin.SORT_MISC = 1000;