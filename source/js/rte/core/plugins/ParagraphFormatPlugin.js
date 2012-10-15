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
 * @class CUI.rte.plugins.ParagraphFormatPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements paragraph formats (h1, h2, p, etc.)  as a plugin.</p>
 * <p>The plugin ID is "<b>paraformat</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>paraformat</b> - adds a format selector (formats will always be applied on block
 *     scope).</li>
 * </ul>
 */
CUI.rte.plugins.ParagraphFormatPlugin = new Class({

    toString: "ParagraphFormatPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @cfg {Object/Object[]} formats
     * <p>Defines the block formats (p, h1, h2, h3, ...) that are applicable to paragraphs.
     * </p>
     * <p>You can choose a deliberate (but unique) property name for each format, if you
     * chosoe to provide an Object rather than a Object[]. Each element (of the Array) or
     * property value (if choosing the Object representation) must have the following
     * properties:</p>
     * <ul>
     *   <li><code>tag</code> : String<br>
     *     The name of the tag that represents the block format (for example: "p", "h1",
     *     "h2", ...)</li>
     *   <li><code>description</code> : String<br>
     *     The text that represents the paragraph format in the format selector</li>
     * </uL>
     * <p>Note that this configuration only takes effect if the
     * {@link CUI.rte.plugins.ParagraphFormatPlugin "paraformat" plugin} is enabled.
     * Also note that you can't set additional DOM attributes using the "paraformat"
     * plugin.</p>
     * <p>Defaults to:</p>
<pre>
[
    {
        "tag": "p",
        "description": CUI.rte.Utils.i18n("Paragraph")
    }, {
        "tag": "h1",
        "description": CUI.rte.Utils.i18n("Heading 1")
    }, {
        "tag": "h2",
        "description": CUI.rte.Utils.i18n("Heading 2")
    }, {
        "tag": "h3",
        "description": CUI.rte.Utils.i18n("Heading 3")
    }
]
</pre>
     * @since 5.3
     */

    /**
     * @private
     */
    cachedFormats: null,

    /**
     * @private
     */
    formatUI: null,

    getFeatures: function() {
        return [ "paraformat" ];
    },

    /**
     * @private
     */
    getFormatId: function(dom) {
        var tagName = dom.tagName.toLowerCase();
        var formats = this.getFormats();
        var formatCnt = formats.length;
        for (var f = 0; f < formatCnt; f++) {
            var formatDef = formats[f];
            if (formatDef.tag && (formatDef.tag == tagName)) {
                return formatDef.tag;
            }
        }
        return null;
    },

    getFormats: function() {
        var com = CUI.rte.Common;
        if (this.cachedFormats == null) {
            this.cachedFormats = this.config.formats || { };
            com.removeJcrData(this.cachedFormats);
            this.cachedFormats = com.toArray(this.cachedFormats, "tag", "description");
        }
        return this.cachedFormats;
    },

    getFormatById: function(formats, id) {
        var formatCnt = formats.length;
        for (var f = 0; f < formatCnt; f++) {
            if (formats[f].tag == id) {
                return formats[f];
            }
        }
        return null;
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("paraformat")) {
            this.formatUI = tbGenerator.createParaFormatter("paraformat", this, null,
                    this.getFormats());
            tbGenerator.addElement("paraformat", plg.Plugin.SORT_PARAFORMAT, this.formatUI,
                    10);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        var defaults = {
            "formats": [ {
                    "tag": "p",
                    "description": CUI.rte.Utils.i18n("Paragraph")
                }, {
                    "tag": "h1",
                    "description": CUI.rte.Utils.i18n("Heading 1")
                }, {
                    "tag": "h2",
                    "description": CUI.rte.Utils.i18n("Heading 2")
                }, {
                    "tag": "h3",
                    "description": CUI.rte.Utils.i18n("Heading 3")
                }
            ]
        };
        // remove predefined formats if userdefined formats are specified; otherwise both
        // would get merged
        if (pluginConfig.formats) {
            delete defaults.formats;
        }
        CQ.Util.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
    },

    execute: function(cmd) {
        if (this.formatUI) {
            var formatId = this.formatUI.getSelectedFormat();
            if (formatId) {
                this.editorKernel.relayCmd("format", this.getFormatById(this.getFormats(),
                        formatId));
            }
        }
    },

    updateState: function(selDef) {
        if (!this.formatUI) {
            return;
        }
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var formatToSelect = null;
        var nodeList = selDef.nodeList;
        var nodeToCheck = nodeList.commonAncestor;
        var hasParentFormat = false;
        var formats = { };
        var noFormatCnt = 0;
        var formatCnt = 0;
        var auxRoot = null;
        while (nodeToCheck) {
            if (nodeToCheck.nodeType == 1) {
                formatToSelect = this.getFormatId(nodeToCheck);
                if (formatToSelect) {
                    formats[formatToSelect] = true;
                    hasParentFormat = true;
                    formatCnt++;
                    break;
                } else if (com.isTag(nodeToCheck, dpr.AUXILIARY_ROOT_TAGS)) {
                    if (auxRoot == null) {
                        auxRoot = nodeToCheck;
                    }
                }
            }
            nodeToCheck = nodeToCheck.parentNode;
        }
        // check first level nodes also, if no parent format has been detected
        if (!hasParentFormat) {
            var nodeCnt = nodeList.nodes.length;
            for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
                nodeToCheck = nodeList.nodes[nodeIndex];
                if (nodeToCheck.dom.nodeType == 1) {
                    var newFormat = this.getFormatId(nodeToCheck.dom);
                    if (newFormat) {
                        if (!formats[newFormat]) {
                            formats[newFormat] = true;
                            formatCnt++;
                        }
                        if (formatToSelect == null) {
                            formatToSelect = newFormat;
                        }
                    } else {
                        noFormatCnt++;
                    }
                } else {
                    noFormatCnt++;
                }
            }
        }
        this.formatUI.selectFormat(formatToSelect, auxRoot, formatCnt, noFormatCnt);
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("paraformat",
        CUI.rte.plugins.ParagraphFormatPlugin);