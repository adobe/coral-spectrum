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
 * @class CUI.rte.ui.ToolbarBuilder
 * @private
 * <p>This class is used to build toolbars from plugins.</p>
 * <p>Each toolbar consists of several groups of toolbar items. Each group is separated
 * from other groups visually. Each group has a sorting index to determine its position
 * relative to other groups. Each toolbar item has a sorting index to determine its position
 * relative to other icons of the same group.</p>
 * @constructor
 * Creates a new ToolbarBuilder
 */
CUI.rte.ui.ToolbarBuilder = new Class({

    toString: "ToolbarBuilder",

    /**
     * @private
     */
    groups: null,

    construct: function() {
        this.groups = [ ];
    },

    /**
     * @private
     */
    insertInArray: function(array, element) {
        var sort = element.sort;
        var itemCnt = array.length;
        for (var i = 0; i < itemCnt; i++) {
            if (array[i].sort && array[i].sort > sort) {
                array.splice(i, 0, element);
                return;
            }
        }
        array.push(element);
    },

    /**
     * @private
     */
    getGroupById: function(groupId) {
        var groupCnt = this.groups.length;
        for (var i = 0; i < groupCnt; i++) {
            if (this.groups[i].id == groupId) {
                return this.groups[i];
            }
        }
    },

    /**
     * Add a new toolbar item.
     * @param {String} groupId ID of the group the item belongs to
     * @param {Number} groupSort Group sorting index
     * @param {CUI.rte.ui.TbElement} element Toolbar item to add
     * @param {Number} elementSort Element sorting index
     */
    addElement: function(groupId, groupSort, element, elementSort) {
        var group = this.getGroupById(groupId);
        if (!group) {
            group = {
                "id": groupId,
                "sort": groupSort,
                "elements": [ ]
            };
            this.insertInArray(this.groups, group);
        }
        this.insertInArray(group.elements, {
            "sort": elementSort,
            "def": element
        });
    },

    /**
     * Create the toolbar as a suitable Ext component.
     * @return {CUI.rte.ui.Toolbar} The toolbar
     */
    createToolbar: function(editorKernel, options) {
        // must be overridden by the implementing class
        return null;
    },

    createElement: function(id, plugin, toggle, tooltip, css, cmdDef) {
        // must be overridden by the implementing class
        throw new Error("ToolbarBuilder#createElement is not implemented.");
    },

    createParaFormatter: function(id, plugin, tooltip, formats) {
        // must be overridden by the implementing class
        throw new Error("ToolbarBuilder#createParaFormatter is not implemented.");
    },

    createStyleSelector: function(id, plugin, tooltip, styles) {
        // must be overridden by the implementing class
        throw new Error("ToolbarBuilder#createStyleSelector is not implemented.");
    }

});

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.ui.ToolbarBuilder.MAIN_TOOLBAR = 0;

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.ui.ToolbarBuilder.STYLE_TOOLBAR = 1;