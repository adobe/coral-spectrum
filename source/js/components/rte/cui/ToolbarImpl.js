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

    preferredToolbarPos: null,


    /**
     * <p>Determines the "clipping parent" of the specified DOM object.</p>
     * <p>The clipping parent is a DOM object that might clip the visible area of the
     * specified DOM object by specifiying a suitable "overflow" attribute.</p>
     * @param {jQuery} $dom The jQuery-wrapped DOM object
     * @return {jQuery} The clipping parent as a jQuery object; undefined if no clipping
     *         parent exists
     * @private
     */
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
     * Calculates the optimal toolbart position, which is directly above the editable div.
     * The position might not be valid; this has to be considered separately.
     * @private
     */
    _calcOptimum: function(popoverData) {
         var editablePos = this.$editable.offset();
         var tbHeight = this.$toolbar.outerHeight();
         return {
             "left": editablePos.left,
             "top": editablePos.top - tbHeight
         };
    },

    /**
     * Calculates the height of the current popover.
     * @return {{height: Number, arrowHeight: Number}} The total height height and the
     *         height of the "arrow" of the popover; both values are 0 if no popover is
     *         currently shown
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

    /**
     * <p>Calculates the vertical coordinates of the "forbidden area" where the toolbar
     * should not be positioned if possible.</p>
     * <p>This is usually the vertical screen estate the current selection takes. On
     * touch devices, approximal values for native elements (the notorious "callout" ...)
     * are added.</p>
     * @param {Object} selection The current processing selection
     * @return {{start: Number, end: Number}} The vertical screen estate reserved for
     *         selection + native stuff; undefined for invalid selections
     * @private
     */
    _calcForbidden: function(selection) {
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var forbidden = undefined;
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
            forbidden = {
                "start": yStart,
                "end": yEnd
            }
        }
        return forbidden;
    },

    /**
     * Calculates the vertical screen estate that is actually available (approximately).
     * @param {jQuery} $win The window object, wrapped in a jQuery object
     * @return {{min: Number, max: Number}} The minimum/maximum vertical coordinates that
     *         are available
     * @private
     */
    _calcAvail: function($win) {
        var com = CUI.rte.Common;
        var scrollTop = $win.scrollTop();
        // the scroll offsets of the clipping parent are handled by jQuery automatically,
        // so we don't have to take care of it here
        var clipY = (this.$clipParent ? this.$clipParent.offset().top : 0);
        var minY = Math.max(scrollTop, clipY);
        var screenKeyboardHeight = (com.isPortrait() ? com.ua.screenKeyHeightPortrait
                : com.ua.screenKeyHeightLandscape);
        var maxY = $win.height() - screenKeyboardHeight + scrollTop;    // TODO consider clipping as well
        return {
            "min": minY,
            "max": maxY
        }
    },

    /**
     * Calculates the vertical coordinates of the UI (toolbar + popover/if applicable).
     * @param {Number} tbTop The toolbar's top coordinate
     * @param {Number} tbHeight The toolbar's height
     * @param {Number} popoverHeight The popover's height; 0 if no popover is shown
     * @param {String} popoverAlign The popover's alignment ("top" or "bottom")
     * @return {{y1: Number, y2: Number}} The top and bottom coordinates of the UI
     * @private
     */
    _calcUITotal: function(tbTop, tbHeight, popoverHeight, popoverAlign) {
        var y1 = tbTop;
        var y2 = tbTop + tbHeight;
        if (popoverAlign === "top") {
            y1 -= popoverHeight;
        } else {
            y2 += popoverHeight;
        }
        return {
            "y1": y1,
            "y2": y2
        };
    },

    _calcUIPosition: function($win, selection) {
        var popoverData = this._calcPopover();
        var optimum = this._calcOptimum(popoverData);
        if (!this.preferredToolbarPos) {
            this.preferredToolbarPos = optimum;
        }
        var tbHeight = this.$toolbar.outerHeight();
        var totalHeight = tbHeight + popoverData.height;
        var tbLeft = this.preferredToolbarPos.left;
        var tbTop = this.preferredToolbarPos.top;
        var popoverAlign = "top";
        var avail = this._calcAvail($win || $(window));
        // if we can keep the toolbar at the same position by changing the alignment of
        // the popover, we try it
        if ((tbTop - popoverData.height) < avail.min) {
            popoverAlign = "bottom";
        }
        // check if we need to move the toolbar due to current selection state and
        // what has probably been added to screen by the browser (for example, the callout
        // and the screen keyboard on an iPad)
        var forbidden = this._calcForbidden(selection);
        if (forbidden) {
            var totalPos = this._calcUITotal(tbTop, tbHeight, popoverData.height,
                    popoverAlign);
            if ((totalPos.y2 > forbidden.start) && (totalPos.y1 < forbidden.end)) {
                /*
                console.log("reposition", totalPos.y2 + "<->" + forbidden.start,
                        totalPos.y1 + "<->" + forbidden.end);
                */
                // The toolbar is in the "forbidden area", overlapping either the current
                // selection and/or the callout (iPad). In such cases, we first see, if we
                // can place it above the forbidden area if we allow moving the toolbar,
                // starting with an optimal position ...
                if ((optimum.top - popoverData.height) > avail.min) {
                    popoverAlign = "top";
                    tbTop = optimum.top;
                } else if ((forbidden.start - totalHeight) > avail.min) {
                    // ..., otherwise see if it fits above somewhere else than at the
                    // optimal position, ...
                    popoverAlign = "top";
                    tbTop = forbidden.start - tbHeight;
                } else if ((forbidden.end + totalHeight) <= avail.max) {
                    // ..., otherwise we try to move the toolbar under the selection
                    popoverAlign = "bottom";
                    tbTop = forbidden.end;
                } else {
                    // if that is not possible, we move it as far to the bottom as possible,
                    // which will hide part of the selection, but should avoid conflicting
                    // with the (potential) callout completely
                    popoverAlign = "bottom";
                    tbTop = avail.max - totalHeight;
                }
            }
        }
        // calculate popover position
        var popoverLeft = tbLeft;         // TODO check if we need to change this; if not, inline it
        var popoverTop = (popoverAlign === "top" ?
                tbTop - popoverData.height : tbTop + tbHeight + popoverData.arrowHeight);
        this.preferredToolbarPos = {
            "left": tbLeft,
            "top": tbTop
        };
        return {
            "toolbar": this.preferredToolbarPos,
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
        switch (e.origin) {
            case "event":
                break;
            case "command":
                this._hidePopover();
                break;
        }
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
        var mustHide = !!this.$popover;
        if (mustHide) {
            this.$popover.popover().hide();
            this.$popover = null;
        }
        return mustHide;
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
            e.stopPropagation();
        });
        $popoverLinks.fipo("touchstart.rte.handler", "mousedown.rte.handler", function(e) {
            self.editorKernel.disableFocusHandling();
        });
    },

    hide: function() {
        this._hidePopover();
        // use "visibility" property instead of "display" - the latter would destroy the
        // layout on show() on Safari Mobile
        this.$toolbar.css("visibility", "hidden");
    },

    show: function() {
        // use "visibility" property instead of "display" - the latter would destroy the
        // layout on Safari Mobile
        this.$toolbar.css("visibility", "visible");
        this._updateUI();
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
            // provide a onclick handler for the clip parent, as otherwise no click
            // events would be sent to finish editing
            this.$clipParent.on("click.rte.clipparent", function() {
                // do nothing
            });
            // handle scrolling of the clip parent
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
            this.$clipParent.off("click.rte.clipparent");
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