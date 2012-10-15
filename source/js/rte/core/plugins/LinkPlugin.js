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
 * @class CUI.rte.plugins.LinkPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements links and anchors as a plugin.</p>
 * <p>The plugin ID is "<b>links</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>modifylink</b> - adds a button to create and modify links</li>
 *   <li><b>unlink</b> - adds a button to remove existing links</li>
 *   <li><b>anchor</b> - adds a button to define anchors</li>
 * </ul>
 * <p><b>Additional config requirements (CQ 5.2)</b></p>
 * <p>Plugin configuration has not been moved to the respective plugin completely yet.
 * Therefore, the following plugin-specific settings must currently (CQ 5.2) be configured
 * through the corresponding {@link CQ.form.RichText} widget:</p>
 * <ul>
 *   <li>The dialog that is used to create and modify links must be configured using
 *     {@link CQ.form.RichText#linkbrowseConfig}.</li>
 *   <li>The dialog that is used to define an anchor must be provided through
 *     {@link CQ.form.RichText#anchordialogConfig}.</li>
 * </ul>
 */
CUI.rte.plugins.LinkPlugin = new Class({

    toString: "LinkPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @cfg {Boolean} trimLinkSelection
     * True if leading and trailing whitespace should removed from the selection (not from
     * the actual text/content!) before creating a new link (defaults to true).
     * @since 5.3
     */

    /**
     * @cfg {Object} linkDialogConfig
     * @since 5.3
     */

    /**
     * @cfg {Object} anchorDialogConfig
     * Configuration of the anchor dialog (defaults to { }). You may specify the same
     * config options as for {@link CQ.Dialog}. Note that the default value
     * of null implies using a default dialog.
     * @since 5.3
     */

    /**
     * @private
     */
    linkDialog: null,

    /**
     * @private
     */
    anchorDialog: null,

    /**
     * @private
     */
    linkUI: null,

    /**
     * @private
     */
    removeLinkUI: null,

    /**
     * @private
     */
    anchorUI: null,

    getFeatures: function() {
        return [ "modifylink", "unlink", "anchor" ];
    },

    /**
     * Creates a link using the internal link dialog.
     * @private
     */
    modifyLink: function(context) {
        var com = CUI.rte.Common;
        var dm = this.editorKernel.getDialogManager();
        var dh = CUI.rte.ui.DialogHelper;
        if (!this.linkDialog || dm.mustRecreate(this.linkDialog)) {
            var dialogHelper = dm.createDialogHelper();
            var linkRules = this.editorKernel.htmlRules.links;
            var dialogConfig = {
                "configVersion": 1,
                "defaultDialog": {
                    "dialogClass": {
                        "type": dh.TYPE_DIALOG
                    }
                },
                "parameters": {
                    "linkRules": linkRules,
                    "editorKernel": this.editorKernel
                }
            };
            if (this.config.linkDialogConfig) {
                var addDialogConfig = this.config.linkDialogConfig;
                if (addDialogConfig.linkAttributes) {
                    com.removeJcrData(addDialogConfig.linkAttributes);
                    var linkAttribs = com.toArray(addDialogConfig.linkAttributes);
                    dialogConfig.additionalFields = [ ];
                    var attribCnt = linkAttribs.length;
                    for (var a = 0; a < attribCnt; a++) {
                        var attrib = linkAttribs[a];
                        var type = attrib.type || attrib.xtype;
                        var attribName = attrib.attribute;
                        var attribLabel = attrib.label || attrib.fieldLabel;
                        var itemData = {
                            "item": dialogHelper.createItem(type, attribName, attribLabel),
                            "fromModel": function(obj, field) {
                                if (dialogHelper.getItemType(field) == dh.TYPE_HIDDEN) {
                                    return;
                                }
                                var attribName = dialogHelper.getItemName(field);
                                var attribValue = com.getAttribute(obj.dom, attribName);
                                if (attribValue) {
                                    dialogHelper.setItemValue(field, attribValue);
                                } else {
                                    dialogHelper.setItemValue(field, "");
                                }
                            },
                            "toModel": function(obj, field) {
                                var attribName = dialogHelper.getItemName(field);
                                if (!obj.attributes) {
                                    obj.attributes = { };
                                }
                                var value = dialogHelper.getItemValue(field);
                                if (value && (value.length > 0)) {
                                    obj.attributes[attribName] = value;
                                } else {
                                    obj.attributes[attribName] =
                                        CUI.rte.commands.Link.REMOVE_ATTRIBUTE;
                                }
                            }
                        };
                        delete attrib.attribute;
                        delete attrib.type;
                        delete attrib.xtype;
                        delete attrib.label;
                        delete attrib.fieldLabel;
                        CQ.Util.applyDefaults(itemData.item, attrib);
                        dialogConfig.additionalFields.push(itemData);
                    }
                    delete addDialogConfig.linkAttributes;
                }
                dialogConfig.dialogProperties = addDialogConfig;
            }
            if (linkRules.targetConfig) {
                if (linkRules.targetConfig.mode != "blank") {
                    dialogConfig.disabledDefaultFields = [ "targetBlank" ];
                }
                if (linkRules.targetConfig.mode == "manual") {
                    if (!dialogConfig.additionalFields) {
                        dialogConfig.additionalFields = { };
                    }
                    var targetItem = dialogHelper.createItem(dh.TYPE_TEXTFIELD, "target",
                            CQ.I18n.getMessage("Anchor"));
                    dialogConfig.additionalFields.push({
                        "item": targetItem,
                        "fromModel": function(obj, field) {
                            if (obj.dom && obj.dom["target"]) {
                                dialogHelper.setItemValue(field, obj.dom["target"]);
                            }
                        },
                        "toModel": function(obj, field) {
                            if (!obj.attributes) {
                                obj.attributes = { };
                            }
                            var value = dialogHelper.getItemValue(field);
                            if (value && (value.length > 0)) {
                                obj.attributes["target"] = value;
                            } else {
                                obj.attributes["target"] = null;
                            }
                        }
                    });
                }
            }
            CQ.Util.applyDefaults(dialogConfig, this.config.linkDialogConfig || { });
            dialogHelper.configure(dialogConfig);
            this.linkDialog = dialogHelper.create();
            dialogHelper.calculateInitialPosition();
        }
        var linkToEdit = null;
        var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.anchorCount == 1) {
            linkToEdit = selectionDef.anchors[0];
        }
        linkToEdit = linkToEdit || { };
        if (typeof linkToEdit.attributes === 'undefined')
            linkToEdit.attributes = { };
        this.linkDialog.initializeEdit(this.editorKernel, linkToEdit,
                CUI.rte.Utils.scope(this.applyLink, this));
        if (com.ua.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        dm.show(this.linkDialog);
    },

    applyLink: function(context) {
        var com = CUI.rte.Common;
        var linkObj = this.linkDialog.objToEdit;
        if (linkObj) {
            var linkUrl = linkObj.href;
            var cssClass = linkObj.cssClass;
            var target = linkObj.target;
            if (com.ua.isIE) {
                this.savedRange.select();
            }
            this.editorKernel.relayCmd("modifylink", {
                "url": linkUrl,
                "css": cssClass,
                "target": target,
                "trimLinkSelection": this.config.trimLinkSelection,
                "attributes": linkObj.attributes
            });
        }
    },

    /**
     * Creates an anchor using the anchor dialog.
     * @private
     */
    modifyAnchor: function(context) {
        var com = CUI.rte.Common;
        var dm = this.editorKernel.getDialogManager();
        if (!this.anchorDialog || dm.mustRecreate(this.anchorDialog)) {
            var editorKernel = this.editorKernel;
            var plugin = this;
            var defaultConfig = {
                execute: function(value) {
                    if (com.ua.isIE) {
                        plugin.savedRange.select();
                    }
                    editorKernel.relayCmd("anchor", value);
                }
            };
            var dialogConfig = this.config.anchorDialogConfig || { };
            CQ.Util.applyDefaults(dialogConfig, defaultConfig);
            this.anchorDialog = dm.create(CUI.rte.ui.DialogManager.DLG_ANCHOR,
                    dialogConfig);
        } else {
            this.anchorDialog.resetValues();
        }
        var selectionDef = this.editorKernel.analyzeSelection();
        if (selectionDef.namedAnchorCount == 1) {
            this.anchorDialog.setAnchor(selectionDef.namedAnchors[0]);
        }
        if (com.ua.isIE) {
            this.savedRange = context.doc.selection.createRange();
        }
        dm.show(this.anchorDialog);
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("modifylink")) {
            this.linkUI = tbGenerator.createElement("modifylink", this, false,
                    this.getTooltip("modifylink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.linkUI, 10);
        }
        if (this.isFeatureEnabled("unlink")) {
            this.removeLinkUI = tbGenerator.createElement("unlink", this, false,
                    this.getTooltip("unlink"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.removeLinkUI, 20);
        }
        if (this.isFeatureEnabled("anchor")) {
            this.anchorUI = tbGenerator.createElement("anchor", this, true,
                    this.getTooltip("anchor"));
            tbGenerator.addElement("links", plg.Plugin.SORT_LINKS, this.anchorUI, 30);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CQ.Util.applyDefaults(pluginConfig, {
            "features": "*",
            "trimLinkSelection": true,
            "linkDialogConfig": {
                "targetConfig": {
                    "mode": "manual"
                }
            },
            "anchorDialogConfig": {
                // empty by default
            },
            "tooltips": {
                "modifylink": {
                    "title": CQ.I18n.getMessage("Hyperlink"),
                    "text": CQ.I18n.getMessage("Create or modify a hyperlink.")
                },
                "unlink": {
                    "title": CQ.I18n.getMessage("Unlink"),
                    "text": CQ.I18n.getMessage("Remove an existing hyperlink from the selected text.")
                },
                "anchor": {
                    "title": CQ.I18n.getMessage("Anchor"),
                    "text": CQ.I18n.getMessage("Add or edit an anchor.")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(cmd, value, env) {
        if (cmd == "modifylink") {
            this.modifyLink(env.editContext);
        } else if (cmd == "anchor") {
            this.modifyAnchor(env.editContext);
        } else {
            this.editorKernel.relayCmd(cmd);
        }
    },

    updateState: function(selDef) {
        var hasSingleAnchor = selDef.anchorCount == 1;
        var hasNoAnchor = selDef.anchorCount == 0;
        var selectedNode = selDef.selectedDom;
        var isLinkableObject = false;
        if (selectedNode) {
            isLinkableObject = CUI.rte.Common.isTag(selectedNode,
                    CUI.rte.plugins.LinkPlugin.LINKABLE_OBJECTS);
        }
        var isCreateLinkEnabled = hasSingleAnchor
                || ((selDef.isSelection || isLinkableObject) && hasNoAnchor);
        if (this.linkUI) {
            this.linkUI.setDisabled(!isCreateLinkEnabled);
        }
        if (this.removeLinkUI) {
            this.removeLinkUI.setDisabled(!hasSingleAnchor);
        }
        if (this.anchorUI) {
            var hasSingleNamedAnchor = (selDef.namedAnchorCount == 1);
            this.anchorUI.setSelected(hasSingleNamedAnchor);
        }
    }

});

/**
 * Array with tag names that define objects (like images) that are linkable when selected
 * @private
 * @static
 * @final
 * @type String[]
 */
CUI.rte.plugins.LinkPlugin.LINKABLE_OBJECTS = [
    "img"
];


// register plugin
CUI.rte.plugins.PluginRegistry.register("links", CUI.rte.plugins.LinkPlugin);