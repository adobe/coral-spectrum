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

CUI.rte.ui.cui.ToolbarImpl = new Class({

    toString: "ToolbarImpl",

    /**
     * @type CUI.rte.EditorKernel
     */
    editorKernel: null,

    extend: CUI.rte.ui.Toolbar,

    elementMap: null,

    $container: null,

    $editable: null,

    $toolbar: null,


    _calculatePosition: function($win) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        $win = $win || $(window);
        var scrollTop = $win.scrollTop();
        var editablePos = this.$editable.offset();
        var toolbarHeight = this.$toolbar.outerHeight() + 4; // TODO investigate why an initial(!) offset of 4 is required (defer?)
        var top = editablePos.top - toolbarHeight;
        var left = editablePos.left;
        if (top < scrollTop) {
            top = scrollTop;
        }
        var context = this.editorKernel.getEditContext();
        var selection = this.editorKernel.createQualifiedSelection(context);
        if (selection && selection.startNode) {
            var startNode = selection.startNode;
            var startOffset = selection.startOffset;
            var endNode = selection.endNode;
            var endOffset = selection.endOffset;
            var rect = dpr.calcScreenEstate(context, startNode, startOffset, endNode,
                    endOffset);
            console.log(rect);
        }
        return {
            "left": left,
            "top": top
        };
    },

    _handleScrolling: function(e) {
        this.$toolbar.offset(this._calculatePosition());
    },

    getToolbarContainer: function() {
        return this.$container;
    },

    construct: function(elementMap, $container) {
        this.elementMap = elementMap;
        this.$container = $container;
        this.$toolbar = $container.find("nav");
        this.$editable = $container.find(".editable");
    },

    getItem: function(itemId) {
        return this.elementMap[itemId];
    },

    getHeight: function() {
        return 0;
    },

    startEditing: function(editorKernel) {
        this.editorKernel = editorKernel;
        this.$toolbar.addClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
        this.$toolbar.offset(this._calculatePosition());
        var self = this;
        $(window).on("scroll.rte", function(e) {
            self._handleScrolling(e);
        });
    },

    finishEditing: function() {
        this.$toolbar.removeClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
        $(window).off("scroll.rte");
    },

    enable: function() {
        for (var itemId in this.elementMap) {
            if (this.elementMap.hasOwnProperty(itemId)) {
                var item = this.elementMap[itemId].element;
                item.setDisabled(false);
            }
        }
    },

    disable: function(excludeItems) {
        for (var itemId in this.elementMap) {
            if (this.elementMap.hasOwnProperty(itemId)) {
                if (!excludeItems || (excludeItems.indexOf(itemId) < 0)) {
                    var item = this.elementMap[itemId].element;
                    item.setDisabled(true);
                }
            }
        }
    },

    destroy: function() {
        // as the toolbar items might be kept on the screen visually, we're disabling
        // them before destroying the data model; otherwise the toolbar will stay active in
        // serveral situations where the blur event doesn't kick in (mainly with mobile
        // devices)
        this.disable();
        for (var itemId in this.elementMap) {
            if (this.elementMap.hasOwnProperty(itemId)) {
                var item = this.elementMap[itemId].element;
                if (item.destroy) {
                    item.destroy();
                }
            }
        }
        this.elementMap = { };
    }

});