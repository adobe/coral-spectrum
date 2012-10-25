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
 * @class CUI.rte.ui.ContextMenuBuilder
 * @private
 * This class is used to build the context menu from plugins in a implementation-independent
 * way.
 */
CUI.rte.ui.ContextMenuBuilder = new Class({

    toString: "ContextMenuBuilder",

    /**
     * List of items
     * @private
     * @type Array
     */
    items: null,

    /**
     * The menu built/managed
     * @private
     * @type Object
     */
    menu: null,


    construct: function(editorKernel) {
        this.items = [ ];
        this.editorKernel = editorKernel;
    },

    addItem: function(itemToAdd) {
        this.items.push(itemToAdd);
    },

    clear: function() {
        this.items.length = 0;
    },

    build: function(selectionContext, context) {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#build is not implemented.");
    },

    createItem: function(config) {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#createItem is not implemented.");
    },

    createSeparator: function() {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#createSeparator is not implemented.");
    },

    // TODO move to a separate class that abstracts the context menu itself

    showAt: function(x, y) {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#showAt is not implemented.");
    },

    hideAll: function() {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#hide is not implemented.");
    },

    isVisible: function() {
        // must be overridden by implementing classes
        throw new Error("ContextMenuBuilder#isVisible is not implemented.");
    }

});