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
 * @class CUI.rte.plugins.ListPlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements the list functionality as a plugin.</p>
 * <p>The plugin ID is "<b>lists</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>ordered</b> - adds a button to create or remove an ordered list</li>
 *   <li><b>unordered</b> - adds a button to create or remove an unordered list</li>
 *   <li><b>indent</b> - adds a button to indent list items or blocks</li>
 *   <li><b>outdent</b> - adds a button to outdent list items or blocks</li>
 * </ul>
 */
CUI.rte.plugins.ListPlugin = new Class({

    toString: "ListPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @cfg {Number} indentSize
     * The size of an indent level in pixels (defaults to 40). Note that this setting
     * only takes effect if the "indent"/"outdent" features of the plugin are enabled and
     * if the indent is applied outside a list.
     * @since 5.3
     */

    /**
     * @cfg {Boolean} keepStructureOnUnlist
     * Defines how to handle the unlisting of nested list items. If set to true, the
     * structure of the two lists will be kept identically by inserting empty list items
     * accordingly. For example: In the given list
<pre>
<ul>
  <li>Item 1</li>
  <li>Item 2
    <ul>
      <li>Item 2.1</li>
      <li>Item 2.2</li>
    </ul>
  </li>
  <li>Item 3</li>
</pre>
     * Item 2.1 is unlisted. This will result in the following markup if
     * keepStructureOnUnlist == true:
<pre>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
<p>Item 2.1</p>
<ul>
  <li>&nbsp;
    <ul>
      <li>Item 2.2</li>
    </ul>
  </li>
  <li>Item 3</li>
</ul>
</pre>
     * Respectively, if keepStructureOnUnlist == false:
<pre>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
  <p>Item 2.1</p>
  <ul>
    <li>Item 2.2</li>
    <li>Item 3</li>
  </ul>
</ul>
</pre>
     * Defaults to false.
     */

    /**
     * @private
     */
    orderedListUI: null,

    /**
     * @private
     */
    unorderedListUI: null,

    /**
     * @private
     */
    indentUI: null,

    /**
     * @private
     */
    outdentUI: null,

    _init: function(editorKernel) {
        this.inherited(arguments);
        editorKernel.addPluginListener('beforekeydown', this.handleOnKey, this, this, false);
    },

    /**
     * This function creates new list entries (<li>) by pressing CRTL+ENTER
     * This workaround should be used if there is a block node within a list entry
     *
     * @param event
     */
    handleOnKey: function (event) {
        var range, rangeNode, parentNode, parentParentNode, newListNode;

        if (event.isEnter() && event.isCtrl()) {
            try {
                if (window.getSelection) {  // all browsers, except IE before version 9
                    range = CUI.rte.Selection.getLeadRange(event.editContext);
                }
                else {
                    if (document.selection) {   // Internet Explorer 6/7/8
                        range = document.selection.createRange();
                    }
                }

                rangeNode = range.commonAncestorContainer ? range.commonAncestorContainer :
                    range.parentElement ? range.parentElement() : range.item(0);
                parentNode = rangeNode.parentNode ? rangeNode.parentNode : rangeNode.parentElement();

                while (rangeNode !== parentNode && parentNode.tagName !== 'LI') {
                    rangeNode = rangeNode.parentNode ? rangeNode.parentNode : rangeNode.parentElement();
                    parentNode = rangeNode.parentNode ? rangeNode.parentNode : rangeNode.parentElement();
                }

                if (rangeNode.tagName && rangeNode.tagName !== 'LI' && parentNode.tagName === 'LI') {
                    parentParentNode = parentNode.parentNode ? parentNode.parentNode : parentNode.parentElement();

                    newListNode = event.editContext.doc.createElement('li');
                    newListNode.appendChild(rangeNode);

                    if (parentNode.nextSibling) {
                        parentParentNode.insertBefore(newListNode, parentNode.nextSibling);
                    } else {
                        parentParentNode.appendChild(newListNode);
                    }

                    CUI.rte.Selection.selectNode(event.editContext, newListNode, 1);
                }
            } catch (err) {
                // sometimes a node might be undefined
            }
        }
    },

    getFeatures: function() {
        return [ "ordered", "unordered", "indent", "outdent" ];
    },

    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        if (this.isFeatureEnabled("unordered")) {
            this.unorderedListUI = tbGenerator.createElement("insertunorderedlist", this,
                    true, this.getTooltip("insertunorderedlist"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.unorderedListUI,
                    10);
        }
        if (this.isFeatureEnabled("ordered")) {
            this.orderedListUI = tbGenerator.createElement("insertorderedlist", this, true,
                    this.getTooltip("insertorderedlist"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.orderedListUI, 20);
        }
        if (this.isFeatureEnabled("indent")) {
            this.indentUI = tbGenerator.createElement("indent", this, false,
                    this.getTooltip("indent"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.indentUI, 40);
        }
        if (this.isFeatureEnabled("outdent")) {
            this.outdentUI = tbGenerator.createElement("outdent", this, false,
                    this.getTooltip("outdent"));
            tbGenerator.addElement("lists", plg.Plugin.SORT_LISTS, this.outdentUI, 30);
        }
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "features": "*",
            "indentSize": 40,
            "keepStructureOnUnlist": false,
            "tooltips": {
                "insertunorderedlist": {
                    "title": CUI.rte.Utils.i18n("plugins.list.ulTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.list.ulText")
                },
                "insertorderedlist": {
                    "title": CUI.rte.Utils.i18n("plugins.list.olTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.list.olText")
                },
                "indent": {
                    "title": CUI.rte.Utils.i18n("plugins.list.indentTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.list.indentText")
                },
                "outdent": {
                    "title": CUI.rte.Utils.i18n("plugins.list.outdentTitle"),
                    "text": CUI.rte.Utils.i18n("plugins.list.outdentText")
                }
            }
        });
        this.config = pluginConfig;
    },

    execute: function(id) {
        var value = undefined;
        if ((id == "indent") || (id == "outdent")) {
            value = this.config.indentSize;
        } else if (CUI.rte.Common.strStartsWith(id, "insert")) {
            value = this.config.keepStructureOnUnlist;
        }
        this.editorKernel.relayCmd(id, value);
    },

    updateState: function(selDef) {
        var context = selDef.editContext;
        var state, isDisabled;
        if (this.orderedListUI) {
            state = this.editorKernel.queryState("insertorderedlist", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.List.NO_LIST_AVAILABLE);
            this.orderedListUI.setSelected((state === true) || (state == null));
            this.orderedListUI.setDisabled(isDisabled);
        }
        if (this.unorderedListUI) {
            state = this.editorKernel.queryState("insertunorderedlist", selDef);
            isDisabled = (state == null)
                    || (state == CUI.rte.commands.List.NO_LIST_AVAILABLE);
            this.unorderedListUI.setSelected((state === true) || (state == null));
            this.unorderedListUI.setDisabled(isDisabled);
        }
        if (this.outdentUI) {
            // outdent is only available if the current selection has some indent
            this.outdentUI.setDisabled(!this.editorKernel.queryState("indent", selDef));
        }
        if (this.indentUI) {
            // indent is basically always available - but not if the selection contains
            // "first items", which cannot be indented using reasonable HTML
            var isEnabled = true;
            var listItems = selDef.nodeList.getTags(context, [ {
                    "matcher": function(dom) {
                        return CUI.rte.Common.isTag(dom, "li");
                    }
                }
            ], true, true);
            var itemCnt = listItems.length;
            for (var i = 0; i < itemCnt; i++) {
                var itemDom = listItems[i].dom;
                if (!itemDom.previousSibling) {
                    var parentItemDom = itemDom.parentNode.parentNode;
                    var isParentInSelection = false;
                    for (var c = 0; c < itemCnt; c++) {
                        if (listItems[c].dom == parentItemDom) {
                            isParentInSelection = true;
                            break;
                        }
                    }
                    if (!isParentInSelection) {
                        isEnabled = false;
                        break;
                    }
                }
            }
            this.indentUI.setDisabled(!isEnabled);
        }
    }

});


// register plugin
CUI.rte.plugins.PluginRegistry.register("lists", CUI.rte.plugins.ListPlugin);