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

CQ.form.rte.ui.cui.ToolbarImpl = new Class({

    toString: "ToolbarImpl",

    extend: CQ.form.rte.ui.Toolbar,

    toolbarParent: null,

    elementMap: null,


    construct: function(toolkitRep, elementMap) {
        this.tb = toolkitRep;
        this.elementMap = elementMap;
    },

    getItem: function(itemId) {
        return this.elementMap[itemId];
    },

    getHeight: function() {
        if (this.toolbarParent == null) {
            return 0;
        }
        return this.toolbarParent.height();
    },

    enable: function() {
        for (var itemId in this.elementMap) {
            if (this.elementMap.hasOwnProperty(itemId)) {
                var item = this.elementMap[itemId];
                item.setDisabled(false);
            }
        }
    },

    disable: function(excludeItems) {
        for (var itemId in this.elementMap) {
            if (this.elementMap.hasOwnProperty(itemId)) {
                if (!excludeItems || (excludeItems.indexOf(itemId) < 0)) {
                    var item = this.elementMap[itemId];
                    item.setDisabled(true);
                }
            }
        }
    },

    destroy: function() {
        this.toolbarParent.remove();
    }

});