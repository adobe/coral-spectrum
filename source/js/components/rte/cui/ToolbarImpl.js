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


    _calculatePosition: function($win, selection) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        $win = $win || $(window);
        // first, calculate the "optimal" position (directly above the editable's top
        // corner
        var scrollTop = $win.scrollTop();
        var editablePos = this.$editable.offset();
        var tbHeight = this.$toolbar.outerHeight();
        var top = editablePos.top - tbHeight;
        var left = editablePos.left;
        if (top < scrollTop) {
            top = scrollTop;
        }
        // then, check if we need to move the toolbar due to current selection state and
        // what has probably been added to screen by the browser (for example, the callout
        // and the screen keyboard on an iPad)
        var context = this.editorKernel.getEditContext();
        selection = selection || this.editorKernel.createQualifiedSelection(context);
        if (selection && selection.startNode) {
            var startNode = selection.startNode;
            var startOffset = selection.startOffset;
            var endNode = selection.endNode;
            var endOffset = selection.endOffset;
            var area = dpr.calcScreenEstate(context, startNode, startOffset, endNode,
                    endOffset);
            var yStart = area.startY - (sel.isSelection(selection) ? com.ua.calloutHeight
                    : 0);
            var yEnd = area.endY;
            var screenKeyboardHeight = (com.isPortrait() ? com.ua.screenKeyHeightPortrait
                    : com.ua.screenKeyHeightLandscape);
            var maxY = $win.height() - screenKeyboardHeight + scrollTop;
            var tbY = top;
            var tbY2 = top + tbHeight;
            // console.log(tbY, tbY2, " <--> ", yStart, yEnd);
            if ((tbY2 > yStart) && (tbY <= yEnd)) {
                // The toolbar is in the "forbidden area", overlapping either the current
                // selection and/or the callout (iPad). In such cases, we try to move the
                // toolbar under the selection
                if ((yEnd + tbHeight) <= maxY) {
                    top = yEnd;
                } else if ((yStart - tbHeight) > scrollTop) {
                    // in this case, there's enough place between the browser window's
                    // top corner and the top of the callout (which is above the editable's
                    // top corner)
                    top = yStart - tbHeight;
                } else {
                    // if that is not possible, we move it as far to the bottom as possible,
                    // which will hide part of the selection, but should avoid conflicting
                    // with the (potential) callout completely
                    top = maxY - tbHeight;
                }
            }
        }
        return {
            "left": left,
            "top": top
        };
    },

    _handleScrolling: function(e) {
        this.$toolbar.offset(this._calculatePosition());
    },

    _handleUpdateState: function(e) {
        this.$toolbar.offset(this._calculatePosition());
    },

    _initializePopovers: function() {
        var $popoverLinks = this.$container.find("button[data-action^=\"#\"]");
        var self = this;
        $popoverLinks.bind("click.rte.handler", function(e) {
            // TODO determine suitable position
            var ref = $(e.target).data("action").substring(1);
            var $popover = self.$container.find("div[data-popover=\"" + ref + "\"]");
            var pos = self.$toolbar.offset();
            // console.log(pos, $popover.outerHeight());
            $popover.offset({
                "left": pos.left,
                "top": pos.top - $popover.outerHeight()
            });
            // console.log(pos.left, pos.top - $popover.outerHeight());
            $popover.popover().show();
            self.editorKernel.focus();
        });
        $popoverLinks.fipo("touchstart.rte.handler", "mousedown.rte.handler", function(e) {
            self.editorKernel.disableFocusHandling();
        });
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
        this.editorKernel.addUIListener("updatestate", this._handleUpdateState, this);
        this.$toolbar.addClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
        this.$toolbar.offset(this._calculatePosition());
        this._initializePopovers();
        var self = this;
        $(window).on("scroll.rte", function(e) {
            self._handleScrolling(e);
        });
    },

    finishEditing: function() {
        this.$toolbar.removeClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
        $(window).off("scroll.rte");
        this.editorKernel.removeUIListener("updatestate", this._handleUpdateState, this);
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