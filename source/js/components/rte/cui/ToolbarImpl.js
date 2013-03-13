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

    $popover: null,

    $clipParent: null,

    _getClippingParent: function($dom) {
        var $clipParent = undefined;
        var $body = $(document.body);
        while ($dom[0] !== $body[0]) {
            var ovf = $dom.css("overflow");
            var ovfX = $dom.css("overflowX");
            var ovfY = $dom.css("overflowY");
            if ((ovfX !== "visible") || (ovfY !== "visible") || (ovf !== "visible")) {
                $clipParent = $dom;
                break;
            }
            $dom = $dom.parent();
        }
        return $clipParent;
    },

    /**
     * Calculates the height of the current popover.
     * @private
     */
    _calcPopover: function() {
        var $p = this.$popover;
        if (!$p) {
            return {
                "height": 0,
                "arrowHeight": 0
            };
        }
        // arrow height calculation taken from CUI.Popover
        var arrowHeight = Math.round(($p.outerWidth() - $p.width()) / 1.5);
        return {
            "height": $p.outerHeight() + arrowHeight,
            "arrowHeight": arrowHeight
        };
    },

    _calcUIPosition: function($win, selection) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        $win = $win || $(window);
        // first, calculate the "optimal" position (directly above the editable's top
        // corner
        // var $clipParent = this._getClippingParent(this.$container);
        var scrollTop = $win.scrollTop();
        // the scroll offsets of the clipping parent are handled by jQuery automatically,
        // so we don't have to take care of it here
        var clipY = (this.$clipParent ? this.$clipParent.offset().top : 0);
        var minY = Math.max(scrollTop, clipY);
        var editablePos = this.$editable.offset();
        var tbHeight = this.$toolbar.outerHeight();
        var popoverData = this._calcPopover();
        var popoverHeight = popoverData.height;
        var totalHeight = tbHeight + popoverHeight;
        var tbTop = editablePos.top - tbHeight;
        var left = editablePos.left;
        if ((tbTop - popoverHeight) < minY) {
            tbTop = minY + popoverHeight;
        }
        var popoverAlign = "top";
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
            var maxY = $win.height() - screenKeyboardHeight + scrollTop;    // TODO consider clipping as well
            var totalY = tbTop - popoverHeight;
            var totalY2 = tbTop + tbHeight;
            // console.log(tbTop, tbHeight, popoverHeight);
            // console.log(totalY, totalY2, " <--> ", yStart, yEnd);
            if ((totalY2 > yStart) && (totalY <= yEnd)) {
                // The toolbar is in the "forbidden area", overlapping either the current
                // selection and/or the callout (iPad). In such cases, we try to move the
                // toolbar under the selection
                if ((yEnd + totalHeight) <= maxY) {
                    popoverAlign = "bottom";
                    tbTop = yEnd;
                } else if ((yStart - totalHeight) > minY) {
                    // in this case, there's enough place between the browser window's
                    // top corner and the top of the callout (which is above the editable's
                    // top corner)
                    tbTop = yStart - tbHeight;
                } else {
                    // if that is not possible, we move it as far to the bottom as possible,
                    // which will hide part of the selection, but should avoid conflicting
                    // with the (potential) callout completely
                    popoverAlign = "bottom";
                    tbTop = maxY - totalHeight;
                }
            }
        }
        // calculate popover position
        var popoverLeft = left;         // TODO check if we need to change this; if not, inline it
        var popoverTop = (popoverAlign === "top" ?
                tbTop - popoverHeight : tbTop + tbHeight + popoverData.arrowHeight);
        return {
            "toolbar": {
                "left": left,
                "top": tbTop
            },
            "popover": {
                "left": popoverLeft,
                "top": popoverTop,
                "align": popoverAlign,
                "arrow": (popoverAlign === "top" ? "bottom" : "top")
            }
        };
    },

    _updateUI: function() {
        var pos = this._calcUIPosition();
        if (pos) {
            this.$toolbar.offset(pos["toolbar"]);
            if (this.$popover) {
                var popoverPos = pos["popover"];
                this.$popover.removeClass("arrow-bottom  arrow-top");
                this.$popover.addClass("arrow-" + popoverPos["arrow"]);
                this.$popover.offset(popoverPos);
            }
        }
    },

    _handleScrolling: function(e) {
        this._updateUI();
    },

    _handleUpdateState: function(e) {
        // this._hidePopover();
        this._updateUI();
    },

    _usePopover: function(ref) {
        this.$popover = this.$container.find("div[data-popover=\"" + ref + "\"]");
        if (this.$popover.length) {
            // must be shown before calculating positions, as jQuery will miscalculate
            // position:absolute otherwise
            this.$popover.popover().show();
            this._updateUI();
        } else {
            this.$popover = null;
        }
    },

    _hidePopover: function() {
        if (this.$popover) {
            this.$popover.popover().hide();
            this.$popover = null;
        }
    },

    _initializePopovers: function() {
        var $popoverLinks = this.$container.find("button[data-action^=\"#\"]");
        var self = this;
        $popoverLinks.bind("click.rte.handler", function(e) {
            if (self.$popover) {
                self._hidePopover();
            } else {
                self._usePopover($(e.target).data("action").substring(1));
            }
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
        this.$clipParent = this._getClippingParent(this.$container);
        this._initializePopovers();
        this._updateUI();
        var self = this;
        $(window).on("scroll.rte", function(e) {
            self._handleScrolling(e);
        });
        if (this.$clipParent) {
            this.$clipParent.on("scroll.rte", function(e) {
                self._handleScrolling(e);
            });
        }
    },

    finishEditing: function() {
        this._hidePopover();
        this.$toolbar.removeClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
        $(window).off("scroll.rte");
        if (this.$clipParent) {
            this.$clipParent.off("scroll.rte");
            this.$clipParent = undefined;
        }
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