/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
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

(function($) {

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

        $clipParent: null,

        /**
         * @type CUI.rte.ui.cui.PopoverManager
         */
        popover: null,

        preferredToolbarPos: null,

        _popoverStyleSheet: null,

        _tbHideTimeout: null,

        _recordedScrollTop: null,

        _offsets: null,

        _isClipped: false,


        construct: function(elementMap, $editable, tbType) {
            this.elementMap = elementMap;
            this.$editable = $editable;
            this.tbType = (tbType || "inline");
            this.$container = CUI.rte.UIUtils.getUIContainer(this.$editable);
            this.$toolbar = CUI.rte.UIUtils.getToolbar(this.$editable, tbType);
            this.popover = new CUI.rte.ui.cui.PopoverManager(this.$container, tbType);
        },

        /**
         * Calculates the internal offsets for the toolbar. Those are required to correctly
         * position a toolbar that is contained in another document than the edited div.
         * @private
         * @return {{top:Number,left:Number}} The offsets
         */
        _calcInternalOffsets: function() {
            this._isClipped = CUI.rte.UIUtils.isUnder(this.$clipParent, this.$container);
            if (this._isClipped) {
                return this.$clipParent.offset();
            }
            return CUI.rte.UIUtils.getEditorOffsets();
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
         * <p>Calculates the vertical coordinates of the "forbidden area" where the toolbar
         * should not be positioned if possible.</p>
         * <p>This is usually the vertical screen estate the current selection takes. On
         * touch devices, approximal values for native elements (the notorious "callout"
         * ...) are added.</p>
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
                var isSel = sel.isSelection(selection);
                var area = dpr.calcScreenEstate(context, startNode, startOffset, endNode,
                        endOffset);
                var yStart = area.startY - (isSel ? com.ua.calloutHeight : 0);
                var yEnd = area.endY;
                if (this._isClipped) {
                    var scrollOffs = this.$clipParent.scrollTop();
                    yStart -= scrollOffs;
                    yEnd -= scrollOffs;
                }
                forbidden = {
                    "start": yStart - (isSel ? com.ua.selectionHandlesHeight : 0),
                    "end": yEnd + (isSel ? com.ua.selectionHandlesHeight : 0)
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
            var clipY = (this.$clipParent && !this._isClipped ?
                    this.$clipParent.offset().top : 0);
            var minY = Math.max(scrollTop, clipY);
            var screenKeyboardHeight = (com.isPortrait() ? com.ua.screenKeyHeightPortrait
                    : com.ua.screenKeyHeightLandscape);
            var maxY = $win.height() - screenKeyboardHeight + scrollTop;    // TODO consider clipping as well
            if (this._isClipped) {
                maxY -= this.$clipParent.offset().top;
            }
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
            var popoverData = this.popover.calc();
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
            // see if the toolbar still fits into the screen
            if (tbTop < avail.min) {
                tbTop = avail.min;
            } else if ((tbTop + tbHeight) > avail.max) {
                tbTop = avail.max - totalHeight;
                popoverAlign = "bottom";
            } else {
                // if we can keep the toolbar at the same position by changing the alignment of
                // the popover, we try it
                if ((tbTop - popoverData.height) < avail.min) {
                    popoverAlign = "bottom";
                }
            }
            // check if we need to move the toolbar due to current selection state and
            // what has probably been added to screen by the browser (for example, the callout
            // and the screen keyboard on an iPad)
            var forbidden = this._calcForbidden(selection);
            if (forbidden) {
                var totalPos = this._calcUITotal(tbTop, tbHeight, popoverData.height,
                        popoverAlign);
                if ((totalPos.y2 > forbidden.start) && (totalPos.y1 < forbidden.end)) {
                    // The toolbar is in the "forbidden area", overlapping either the
                    // current selection and/or the callout (iPad). In such cases, we first
                    // check if we can place it above the forbidden area if we allow moving
                    // the toolbar, starting with an optimal position ...
                    if (((optimum.top - popoverData.height) > avail.min) &&
                            ((optimum.top + tbHeight) < forbidden.start)) {
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
                        // if that is not possible, we move it as far to the bottom as
                        // possible, which will hide part of the selection, but should avoid
                        // conflicting with the (potential) callout completely
                        popoverAlign = "bottom";
                        tbTop = avail.max - totalHeight;
                    }
                }
            }
            // calculate popover position
            var popoverTop = (popoverAlign === "top" ?
                    tbTop - popoverData.height : tbTop + tbHeight + popoverData.arrowHeight);
            this.preferredToolbarPos = {
                "left": tbLeft,
                "top": tbTop
            };
            return {
                "toolbar": {
                    "left": tbLeft + this._offsets.left,
                    "top": tbTop + this._offsets.top
                },
                "popover": {
                    "left": tbLeft + this._offsets.left,
                    "top": popoverTop + this._offsets.top,
                    "align": popoverAlign,
                    "arrow": (popoverAlign === "top" ? "bottom" : "top")
                }
            };
        },

        _updateUI: function() {
            var pos = this._calcUIPosition();
            if (pos) {
                this.$toolbar.offset(pos["toolbar"]);
                this.popover.setPosition(pos["popover"]);
            }
        },

        _handleScrolling: function(e) {
            var context = this.editorKernel.getEditContext();
            var scrollTop = (this.$clipParent || $(context.win)).scrollTop();
            if (this._recordedScrollTop !== scrollTop) {
                if (CUI.rte.Common.ua.isTouch && !this.editorKernel.isLocked()) {
                    this.hideTemporarily();
                } else {
                    this._updateUI();
                }
                this._recordedScrollTop = scrollTop;
            }
        },

        _handleUpdateState: function(e) {
            if (!this.editorKernel.isLocked()) {
                switch (e.origin) {
                    case "event":
                        break;
                    case "command":
                        this.popover.hide();
                        break;
                }
                this._updateUI();
            }
        },

        _initializePopovers: function() {
            var self = this;
            this.$container.on("click.rte-toolbar", "button[data-action^=\"#\"]",
                    function(e) {
                        var $trigger = $(this);
                        if (!$trigger.hasClass(CUI.rte.Theme.TOOLBARITEM_DISABLED_CLASS)) {
                            var show = !self.popover.isShown() ||
                                    !self.popover.isTriggeredBy($trigger);
                            self.popover.hide();
                            if (show) {
                                self.popover.use($(e.target).data("action").substring(1),
                                        $trigger, self.$toolbar);
                            }
                            self._updateUI();
                            self.editorKernel.focus();
                            e.stopPropagation();
                        }
                    });
            this.$container.find(".rte-popover").each(function() {
                $(this).pointer("click.rte-toolbar", function(e) {
                    if ($(e.target).attr("disabled") === "disabled") {
                        e.stopPropagation();
                    }
                });
            });
            // initialize single selection triggers (that adapt the icon to the currently
            // chosen child element)
            var $singleSelectTriggers = this.$toolbar.find(".trigger.single-select");
            $singleSelectTriggers.each(function() {
                var icon = CUI.rte.UIUtils.determineIconClass(this);
                var $this = $(this);
                $this.data("base-icon", icon);
                $this.data("current-icon", icon);
            })
        },

        hide: function() {
            this.popover.hide();
            // use "visibility" property instead of "display" - the latter would destroy the
            // layout on show() on Safari Mobile
            this.$toolbar.css("visibility", "hidden");
        },

        isHidden: function() {
            return (this.$toolbar.css("visibility") === "hidden");
        },

        hideTemporarily: function(onShowCallback) {
            if (this._tbHideTimeout) {
                window.clearTimeout(this._tbHideTimeout);
                this._tbHideTimeout = undefined;
            }
            if (!this.isHidden()) {
                this.hide();
            }
            var self = this;
            this._tbHideTimeout = window.setTimeout(function() {
                self.show();
                self._tbHideTimeout = undefined;
                if (onShowCallback) {
                    onShowCallback();
                }
            }, 1000);
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

        getItem: function(itemId) {
            return this.elementMap[itemId];
        },

        getHeight: function() {
            return 0;
        },

        getPopoverManager: function() {
            return this.popover;
        },

        createPopoverTriggerToElementMapping: function() {
            for (var id in this.elementMap) {
                if (this.elementMap.hasOwnProperty(id)) {
                    var elementDef = this.elementMap[id].element;
                    var action = elementDef.plugin.pluginId + "#" + elementDef.id;
                    var $element = CUI.rte.UIUtils.getElement(action, this.tbType,
                            this.$container);
                    var $popover = $element.parent(".rte-popover");
                    if ($popover.length) {
                        var popoverRef = "#" + $popover.data("popover");
                        var $trigger = CUI.rte.UIUtils.getPopoverTrigger(popoverRef,
                                this.tbType, this.$toolbar);
                        this.popover.addTriggerToElement($trigger, $element);
                    }
                }
            }
        },

        triggerUIUpdate: function() {
            this._updateUI();
        },

        startEditing: function(editorKernel) {
            this.editorKernel = editorKernel;
            this.editorKernel.addUIListener("updatestate", this._handleUpdateState, this);
            this.$toolbar.addClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
            this.$clipParent = CUI.rte.UIUtils.getClippingParent(this.$container);
            this._offsets = this._calcInternalOffsets();
            this._initializePopovers();
            this._updateUI();
            var self = this;
            // Several browsers propagate click events on disabled items to parent elements,
            // others don't. To be sure, cancel all click events that arrive at the toolbar.
            this.$toolbar.pointer("click.rte-toolbar", function(e) {
                if ($(e.target).attr("disabled") === "disabled") {
                    e.stopPropagation();
                }
            });
            // Clicking a button in the toolbar leads to an unwanted focus transfer; ignore
            // it by disabling focus handling on mousedown and enabling it again on
            // mouseup (after blur); event order is: (touchstart) -> (touchend) -> (tap)
            // -> mousedown -> blur (on opposite component) -> mouseup -> (click)
            this.$container.on("mousedown.rte-toolbar", ".item",
                    function(e) {
                        self.editorKernel.disableFocusHandling();
                    });
            $(document).on("mouseup.rte-toolbar",
                    function(e) {
                        self.editorKernel.enableFocusHandling();
                    });
            $(window).on("scroll.rte-toolbar", function(e) {
                self._handleScrolling(e);
            });
            if (this.$clipParent) {
                // provide a onclick handler for the clip parent, as otherwise no click
                // events would be sent to finish editing
                this.$clipParent.on("click.rte-toolbar", function() {
                    // do nothing
                });
                // handle scrolling of the clip parent
                this.$clipParent.on("scroll.rte-toolbar", function(e) {
                    self._handleScrolling(e);
                });
            }
        },

        finishEditing: function() {
            this.popover.hide();
            this.$toolbar.removeClass(CUI.rte.Theme.TOOLBAR_ACTIVE);
            $(window).off("scroll.rte-toolbar");
            this.$container.off("mousedown.rte-toolbar click.rte-toolbar");
            $(document).off("mouseup.rte-toolbar");
            if (this.$clipParent) {
                this.$clipParent.off("scroll.rte-toolbar");
                this.$clipParent.off("click.rte-toolbar");
                this.$clipParent = undefined;
            }
            this.editorKernel.removeUIListener("updatestate", this._handleUpdateState,
                    this);
            this.$container.find(".rte-popover").each(function() {
                $(this).off("click.rte-toolbar");
            });
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
            if (!this.editorKernel.isLocked()) {
                for (var itemId in this.elementMap) {
                    if (this.elementMap.hasOwnProperty(itemId)) {
                        if (!excludeItems || (excludeItems.indexOf(itemId) < 0)) {
                            var item = this.elementMap[itemId].element;
                            item.setDisabled(true);
                        }
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

})(window.jQuery);