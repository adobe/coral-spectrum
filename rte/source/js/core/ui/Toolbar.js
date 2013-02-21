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

CUI.rte.ui.Toolbar = new Class({

    toString: "Toolbar",

    /**
     * The toolkit-specific representation of the toolbar
     */
    toolkitRep: null,

    construct: function(toolkitRep) {
        this.toolkitRep = toolkitRep;
    },

    getToolkitRep: function() {
        return this.toolkitRep;
    },

    getItem: function(itemId) {
        throw new Error("Toolbar#getItem is not implemented.");
    },

    getHeight: function() {
        throw new Error("Toolbar#getHeight is not implemented.");
    },

    adjustToWidth: function(width) {
        // may be overridden by implementing toolbar if adjustments to the available width
        // for the toolbar are required
    },

    enable: function() {
        throw new Error("Toolbar#enable is not implemented.");
    },

    disable: function(excludeItems) {
        throw new Error("Toolbar#disable is not implemented.");
    },

    destroy: function() {
        throw new Error("Toolbar#destroy is not implemented.");
    }

});