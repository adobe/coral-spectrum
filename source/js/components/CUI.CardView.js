/*
 * TODO - provide a "sync" method that syncs view and model
 * TODO - remove list items
 * TODO - auto scrolling
 * TODO - reordering animation in list view
 */

(function($) {

    var DISPLAY_GRID = "grid";

    var DISPLAY_LIST = "list";

    var SELECTION_MODE_COUNT_SINGLE = "single";

    var SELECTION_MODE_COUNT_MULTI = "multiple";

    var DEFAULT_SELECTOR_CONFIG = {

        "itemSelector": "article",                      // selector for getting items
        "headerSelector": "header",                     // selector for headers
        "dataContainer": "grid-0",                      // class name of the data container
        "enableImageMultiply": true,                    // flag if images should be multiplied
        "view": {
            "selectedItem": {                           // defines what classes (cls) on what elements (selector; optional) are used to mark a selection
                "list": {
                    "cls": "selected"
                },
                "grid": {
                    "cls": "selected"
                }
            },
            "selectedItems": {                          // defines the selector that is used for determining the current selection; a resolver function may be specified that adjusts the selection (for exmaple by determining a suitable parent element)
                "list": {
                    "selector": "article.selected"
                },
                "grid": {
                    "selector": "article.selected"
                }
            }
        },
        "controller": {
            "selectElement": {                          // defines the selector that is used for installing the tap/click handlers
                "list": "article > i.select",
                /* "listNavElement": "article", */      // may be used to determine the element that is responsible for navigating in list view (required only if different from the Grid's select item)
                "grid": "article"
            },
            "moveHandleElement": {                      // defines the selector that is used to determine the object that is responsible for moving an item in list view
                "list": "article > i.move"
            },
            "targetToItem": {                           // defines methods that are used to resolve the event target of a tap/click event to a card view item
                "list": function($target) {
                    return $target.closest("article");
                },
                "grid": function($target) {
                    return $target.closest("article");
                },
                "header": function($target) {
                    return $target.closest("header");
                }
            },
            "gridSelect": {                             // defines the class that is used to trigger the grid selection mode
                "cls": "selection-mode"
            },
            "selectAll": {                              // defines the "select all" config (list view only)
                "selector": "header > i.select",
                "cls": "selected"
            }
        }

    };

    var ensureItem = function(item) {
        if (item.jquery) {
            return item.data("cardView-item");
        }
        return item;
    };

    var Utils = {

        equals: function($1, $2) {
            return ($1.length === $2.length) && ($1.length === $1.filter($2).length);
        },

        getWidget: function($el) {
            var widget;
            if ($el.length > 0) {
                widget = $($el[0]).data("cardView");
            }
            return widget;
        },

        resolve: function($el, fn) {
            var resolved = [ ];
            $el.each(function() {
                resolved.push.apply(resolved, fn($(this)).toArray());
            });
            return $(resolved);
        },

        /**
         * Multiplies the image with the provided color, this will insert a canvas element before the img element.
         * image: image element to multiply with the color
         * color: RGB array of values between 0 and 1
         */
        multiplyImage: function(image, color) {
            var canvas = $("<canvas class='" + image.className + " multiplied' width='" +
                        image.naturalWidth + "' height='" + image.naturalHeight+"'></canvas>")
                    .insertBefore(image)[0];

            var context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;

            for (var i = 0, l = data.length; i < l; i += 4) {
                data[i] *= color[0];
                data[i+1] *= color[1];
                data[i+2] *= color[2];
            }

            context.putImageData(imageData, 0, 0);
        }

    };

    var ListItemAutoScroller = new Class({

        $el: null,

        $containerEl: null,

        stepSize: 0,

        iid: undefined,

        autoMoveOffset: 0,

        scrollMax: 0,


        construct: function($el, stepSize, autoMoveFn, limitBottom) {
            this.$el = $el;
            this.stepSize = stepSize;
            this.$containerEl = this._getScrollingContainer($el);
            var cont = this.$containerEl[0];
            this.maxScrollTop = Math.max(cont.scrollHeight - cont.clientHeight, 0);
            this.autoMoveFn = autoMoveFn;
        },

        _getScrollingContainer: function($el) {
            while (($el.length > 0) && !$el.is("body")) {
                var ovflY =  $el.css("overflowY");
                var pos = $el.css("position");
                if (((ovflY === "auto") || (ovflY === "visible")) && (pos === "absolute")) {
                    return $el;
                }
                $el = $el.parent();
            }
            return $(window);
        },

        _execute: function() {
            var cont = this.$containerEl[0];
            var clientHeight = cont.clientHeight;
            var scrollTop = cont.scrollTop;
            var itemTop = this.$el.offset().top - this.$containerEl.offset().top;
            var itemBottom = itemTop + this.$el.height();
            var isAutoScroll = false;
            if (itemTop <= 0) {
                // auto scroll upwards
                if (scrollTop > 0) {
                    scrollTop -= this.stepSize;
                    this.autoMoveOffset = -this.stepSize;
                    if (scrollTop < 0) {
                        scrollTop = 0;
                    }
                    cont.scrollTop = scrollTop;
                    isAutoScroll = true;
                }
            } else if (itemBottom >= clientHeight) {
                // auto scroll downwards
                if (scrollTop < this.maxScrollTop) {
                    scrollTop += this.stepSize;
                    this.autoMoveOffset = this.stepSize;
                    if (scrollTop > this.maxScrollTop) {
                        scrollTop = this.maxScrollTop;
                    }
                    cont.scrollTop = scrollTop;
                    isAutoScroll = true;
                }
            }
            return isAutoScroll;
        },

        _autoMove: function() {
            if (this.autoMoveOffset && this.autoMoveFn) {
                var itemOffs = this.$el.offset();
                var itemTop = itemOffs.top + this.autoMoveOffset;
                this.autoMoveFn(itemOffs.left, itemTop);
            }
        },

        check: function(limitBottom) {
            var self = this;
            this.stop();
            var isAutoScroll = this._execute(limitBottom);
            if (isAutoScroll) {
                this.iid = window.setTimeout(function() {
                    self.iid = undefined;
                    self._autoMove();
                }, 50);
            }
        },

        stop: function() {
            if (this.iid !== undefined) {
                window.clearTimeout(this.iid);
                this.autoMoveOffset = 0;
                this.iid = undefined;
            }
        }

    });

    var ListItemMoveHandler = new Class({

        $listEl: null,

        $itemEl: null,

        $items: null,

        $doc: null,

        $oldBefore: null,

        dragCls: null,

        fixHorizontalPosition: false,

        autoScroller: null,

        construct: function(config) {
            var self = this;
            this.$listEl = config.$listEl;
            this.$itemEl = config.$itemEl;
            this.$items = config.$items;
            this.dragCls = config.dragCls;
            this.fixHorizontalPosition = (config.fixHorizontalPosition !== false);
            this.autoScroller = (config.autoScrolling ?
                    new ListItemAutoScroller(this.$itemEl, 8, function(x, y) {
                        self._autoMove(x, y);
                    }) : undefined);
        },

        _getEventCoords: function(e) {
            if (!e.originalEvent.touches) {
                return {
                    x: e.pageX,
                    y: e.pageY
                };
            }
            return (e.originalEvent.touches.length > 0 ? {
                x: e.originalEvent.touches[0].pageX,
                y: e.originalEvent.touches[0].pageY
            } : e.originalEvent.changedTouches.length > 0 ? {
                x: e.originalEvent.changedTouches[0].pageX,
                y: e.originalEvent.changedTouches[0].pageY
            } : {
                x: e.pageX,
                y: e.pageY
            });
        },

        _limit: function(top, left) {
            if (left < this.listOffset.left) {
                left = this.listOffset.left;
            }
            if (top < this.listOffset.top) {
                top = this.listOffset.top;
            }
            var right = left + this.size.width;
            var bottom = top + this.size.height;
            var limitRight = this.listOffset.left + this.listSize.width;
            var limitBottom = this.listOffset - top + this.listSize.height;
            if (right > limitRight) {
                left = limitRight - this.size.width;
            }
            if (bottom > limitBottom) {
                top = limitBottom - this.size.height;
            }
            if (this.fixHorizontalPosition) {
                left = this.listOffset.left;
            }
            return {
                "top": top,
                "left": left
            };
        },

        _getEventPos: function(e) {
            var evtPos = this._getEventCoords(e);
            return {
                x: evtPos.x - this.delta.left,
                y: evtPos.y - this.delta.top
            };
        },

        _adjustPosition: function(x, y) {
            this.$itemEl.offset(this._limit(y, x));
            if (this.autoScroller) {
                this.autoScroller.check();
            }
        },

        _changeOrderIfRequired: function() {
            var itemPos = this.$itemEl.offset();
            var hotX = itemPos.left + (this.size.width / 2);
            var hotY = itemPos.top + (this.size.height / 2);
            var $newTarget = null;
            // check if we are overlapping another item at least 50% -> then we will take
            // its position
            var isInsertBefore = false;
            for (var i = 0; i < this.$items.length; i++) {
                var $item = $(this.$items[i]);
                if (!Utils.equals($item, this.$itemEl)) {
                    var offs = $item.offset();
                    var width = $item.width();
                    var height = $item.height();
                    var bottom = offs.top + height;
                    if ((hotX >= offs.left) && (hotX < offs.left + width) &&
                            (hotY >= offs.top) && (hotY < bottom)) {
                        isInsertBefore = ((hotY - offs.top) > (bottom - hotY));
                        $newTarget = $item;
                        break;
                    }
                }
            }
            if ($newTarget) {
                var _offs = this.$itemEl.offset();
                if (isInsertBefore) {
                    $newTarget.before(this.$itemEl);
                } else {
                    $newTarget.after(this.$itemEl);
                }
                this.$itemEl.offset(_offs);
            }
        },

        start: function(e) {
            this.$oldBefore = this.$itemEl.prev();
            var evtPos = this._getEventCoords(e);
            if (this.dragCls) {
                this.$itemEl.addClass(this.dragCls);
            }
            var self = this;
            this.$doc = $(document);
            this.$doc.fipo("touchmove.listview.drag", "mousemove.listview.drag",
                function(e) {
                    self.move(e);
                });
            this.$doc.fipo("touchend.listview.drag", "mouseup.listview.drag",
                function(e) {
                    self.end(e);
                });
            this.offset = this.$itemEl.offset();
            this.delta = {
                "left": evtPos.x - this.offset.left,
                "top": evtPos.y - this.offset.top
            };
            this.size = {
                "width": this.$itemEl.width(),
                "height": this.$itemEl.height()
            };
            this.listOffset = this.$listEl.offset();
            this.listSize = {
                "width": this.$listEl.width(),
                "height": this.$listEl.height()
            };
            e.stopPropagation();
            e.preventDefault();
            /*
            console.log("offset", this.offset, "delta", this.delta, "size", this.size,
                "listoffs", this.listOffset, "listsize", this.listSize);
            */
        },

        move: function(e) {
            // console.log("move", e);
            var pos = this._getEventPos(e);
            this._adjustPosition(pos.x, pos.y);
            this._changeOrderIfRequired();
            e.stopPropagation();
            e.preventDefault();
        },

        _autoMove: function(x, y) {
            this._adjustPosition(x, y);
            this._changeOrderIfRequired();
        },

        end: function(e) {
            var pos = this._getEventPos(e);
            this._adjustPosition(pos.x, pos.y);
            // console.log("end", e);
            if (this.dragCls) {
                this.$itemEl.removeClass(this.dragCls);
            }
            if (this.autoScroller) {
                this.autoScroller.stop();
            }
            this.$itemEl.css("position", "");
            this.$itemEl.css("top", "");
            this.$itemEl.css("left", "");
            this.$doc.off("touchmove.listview.drag");
            this.$doc.off("mousemove.listview.drag");
            this.$doc.off("touchend.listview.drag");
            this.$doc.off("mouseup.listview.drag");
            var $newBefore = this.$itemEl.prev();
            this.$itemEl.trigger($.Event("drop", {
                newBefore: $newBefore,
                oldBefore: this.$oldBefore,
                hasMoved: !Utils.equals($newBefore, this.$oldBefore)
            }));
            e.stopPropagation();
            e.preventDefault();
        }

    });

    /*
     * This class represents a single item in the list model.
     */
    var Item = new Class({

        $itemEl: null,

        construct: function($itemEl) {
            this.$itemEl = $itemEl;
            this.reference();
        },

        getItemEl: function() {
            return this.$itemEl;
        },

        reference: function() {
            var self = this;
            this.$itemEl.data("cardView-item", this);
        }

    });

    var Header = new Class({

        $headerEl: null,

        itemRef: null,

        construct: function($headerEl, itemRef) {
            this.$headerEl = $headerEl;
            this.itemRef = itemRef;
        },

        getHeaderEl: function() {
            return this.$headerEl;
        },

        getItemRef: function() {
            return this.itemRef;
        },

        setItemRef: function(itemRef) {
            this.itemRef = itemRef;
        }

    });

    /*
     * This class represents a data model that is created via a selector from an existing
     * DOM.
     */
    var DirectMarkupModel = new Class({

        $el: null,

        items: null,

        headers: null,

        selectors: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this.items = [ ];
            this.selectors = selectors;
            var $items = this.$el.find(selectors.itemSelector);
            var itemCnt = $items.length;
            for (var i = 0; i < itemCnt; i++) {
                this.items.push(new Item($($items[i])));
            }
            this.headers = [ ];
            var $headers = this.$el.find(selectors.headerSelector);
            var headerCnt = $headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var $header = $($headers[h]);
                var $itemRef = $header.nextAll(selectors.itemSelector);
                var itemRef = ($itemRef.length > 0 ?
                        this.getItemForEl($($itemRef[0])) : undefined);
                this.headers.push(new Header($header, itemRef));
            }
        },

        initialize: function() {
            var self = this;
            this.$el.on("drop", this.selectors.itemSelector, function(e) {
                if (e.hasMoved) {
                    self._reorder(e);
                }
            });
        },

        _reorder: function(e) {
            var itemToMove = this.getItemForEl($(e.target));
            var newBefore = this.getItemForEl(e.newBefore);
            var isHeaderInsert = false;
            var header;
            if (!newBefore) {
                header = this.getHeaderForEl(e.newBefore);
                if (header) {
                    isHeaderInsert = true;
                    var refPos = this.getItemIndex(header.getItemRef());
                    if (refPos > 0) {
                        newBefore = this.getItemAt(refPos - 1);
                    }
                }
            }
            var oldPos = this.getItemIndex(itemToMove);
            this.items.splice(oldPos, 1);
            // if the item to move is directly following a header, the header's item ref
            // has to be updated
            var headerRef = this._getHeaderByItemRef(itemToMove);
            if (headerRef) {
                headerRef.setItemRef(this.getItemAt(oldPos));
            }
            var insertPos = (newBefore ? this.getItemIndex(newBefore) + 1 : 0);
            this.items.splice(insertPos, 0, itemToMove);
            if (isHeaderInsert) {
                header.setItemRef(itemToMove);
            }
            // console.log(itemToMove, newBefore, isHeaderInsert);
        },

        getItemCount: function() {
            return this.items.length;
        },

        getItemAt: function(pos) {
            return this.items[pos];
        },

        getItemIndex: function(item) {
            for (var i = 0; i < this.items.length; i++) {
                if (item === this.items[i]) {
                    return i;
                }
            }
            return -1;
        },

        getItemForEl: function($el) {
            var itemCnt = this.items.length;
            for (var i = 0; i < itemCnt; i++) {
                var item = this.items[i];
                if (Utils.equals(item.getItemEl(), $el)) {
                    return item;
                }
            }
            return undefined;
        },

        insertItemAt: function($items, pos, beforeHeader) {
            if (!$.isArray($items)) {
                $items = $items.toArray();
            }
            for (var i = $items.length - 1; i >= 0; i--) {

                var $item = $items[i];
                if (!$item.jquery) {
                    $item = $($item);
                }

                // adjust model
                var followupItem;
                var item = new Item($item);
                if ((pos === undefined) || (pos === null)) {
                    this.items.push(item);
                    pos = this.items.length - 1;
                } else {
                    followupItem = this.items[pos];
                    this.items.splice(pos, 0, item);
                }
                var insert = {
                    "item": followupItem,
                    "mode": "item"
                };

                // adjust header references if item is inserted directly behind a header
                var headerCnt = this.headers.length;
                for (var h = 0; h < headerCnt; h++) {
                    var header = this.headers[h];
                    if (header.getItemRef() === followupItem) {
                        if (beforeHeader) {
                            insert = {
                                "item": header,
                                "mode": "header"
                            };
                            break;
                        } else {
                            header.setItemRef(item);
                        }
                    }
                }

                // trigger event
                this.$el.trigger($.Event("change:insertitem", {
                    "insertPoint": insert,
                    "followupItem": followupItem,
                    "item": item,
                    "pos": pos,
                    "widget": Utils.getWidget(this.$el),
                    "moreItems": (i > 0)
                }));
            }
        },

        getHeaderCount: function() {
            return this.headers.length;
        },

        getHeaderAt: function(pos) {
            return this.headers[pos];
        },

        getHeaders: function() {
            var headers = [ ];
            headers.push.apply(headers, this.headers);
            return headers;
        },

        getHeaderForEl: function($el) {
            var headerCnt = this.headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = this.headers[h];
                if (Utils.equals(header.getHeaderEl(), $el)) {
                    return header;
                }
            }
            return undefined;
        },

        _getHeaderByItemRef: function(itemRef) {
            for (var h = 0; h < this.headers.length; h++) {
                if (this.headers[h].getItemRef() === itemRef) {
                    return this.headers[h];
                }
            }
            return undefined;
        },

        getItemsForHeader: function(header) {
            // TODO does not handle empty headers yet
            var itemRef = header.getItemRef();
            var headerCnt = this.headers.length;
            var itemCnt = this.items.length;
            var itemsForHeader = [ ];
            var isInRange = false;
            for (var i = 0; i < itemCnt; i++) {
                var item = this.items[i];
                if (isInRange) {
                    for (var h = 0; h < headerCnt; h++) {
                        if (this.headers[h].getItemRef() === item) {
                            isInRange = false;
                            break;
                        }
                    }
                    if (isInRange) {
                        itemsForHeader.push(item);
                    } else {
                        break;
                    }
                } else {
                    if (item === itemRef) {
                        isInRange = true;
                        itemsForHeader.push(itemRef);
                    }
                }
            }
            return itemsForHeader;
        },

        fromItemElements: function($elements) {
            var items = [ ];
            $elements.each(function() {
                var item = $(this).data("cardView-item");
                if (item) {
                    items.push(item);
                }
            });
            return items;
        },

        reference: function() {
            var itemCnt = this.items.length;
            for (var i = 0; i < itemCnt; i++) {
                this.items[i].reference();
            }
        },

        removeAllItemsSilently: function() {
            this.items.length = 0;
            for (var h = 0; h < this.headers.length; h++) {
                this.headers[h].setItemRef(undefined);
            }
        }

    });

    /*
     * This class represents a view for data represented by DirectMarkupModel.
     */
    var DirectMarkupView = new Class({

        $el: null,

        selectors: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this.selectors = selectors;
        },

        initialize: function() {
            var self = this;
            this.$el.on("change:displayMode", function(e) {
                var oldMode = e.oldValue;
                var newMode = e.value;
                self.cleanupAfterLayoutMode(oldMode);
                self.prepareLayoutMode(newMode);
            });
            this.$el.on("change:insertitem", function(e) {
                self._onItemInserted(e);
            });
        },

        _onItemInserted: function(e) {
            var $dataRoot = this.$el;
            if (this.selectors.dataContainer) {
                $dataRoot = $dataRoot.find("." + this.selectors.dataContainer);
            }
            var $item = e.item.getItemEl();
            var followupItem = e.followupItem;
            switch (this.getDisplayMode()) {
                case DISPLAY_LIST:
                    if (!followupItem) {
                        $dataRoot.append($item);
                    } else {
                        var insert = e.insertPoint;
                        var item = insert.item;
                        var $ref = (insert.mode === "item" ?
                            item.getItemEl() : item.getHeaderEl());
                        $ref.before($item);
                    }
                    break;
                case DISPLAY_GRID:
                    if (!e.moreItems) {
                        var widget = Utils.getWidget(this.$el);
                        widget._restore();
                        widget.layout();
                    }
                    break;
            }
        },

        getDisplayMode: function() {
            return Utils.getWidget(this.$el).getDisplayMode();
        },

        setSelectionState: function(item, selectionState) {
            var displayMode = this.getDisplayMode();
            var selectorDef = this.selectors.view.selectedItem[displayMode];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            if (selectionState === "selected") {
                $itemEl.addClass(selectorDef.cls);
                if (displayMode === DISPLAY_GRID) {
                    this._drawSelectedGrid(item);
                }
            } else if (selectionState === "unselected") {
                $itemEl.removeClass(selectorDef.cls);
                if (displayMode === DISPLAY_GRID) {
                    this._removeSelectedGrid(item);
                }
            }
        },

        getSelectionState: function(item) {
            var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            var cls = selectorDef.cls.split(" ");
            for (var c = 0; c < cls.length; c++) {
                if (!$itemEl.hasClass(cls[c])) {
                    return "unselected";
                }
            }
            return "selected";
        },

        getSelectedItems: function() {
            var selectorDef = this.selectors.view.selectedItems[this.getDisplayMode()];
            var $selectedItems = this.$el.find(selectorDef.selector);
            if (selectorDef.resolver) {
                $selectedItems = selectorDef.resolver($selectedItems);
            }
            return $selectedItems;
        },

        restore: function(model, restoreHeaders) {
            var $container = $("<div class='" + this.selectors.dataContainer + "'>");
            this.$el.empty();
            this.$el.append($container);
            var itemCnt = model.getItemCount();
            for (var i = 0; i < itemCnt; i++) {
                $container.append(model.getItemAt(i).getItemEl());
            }
            if (restoreHeaders) {
                var headerCnt = model.getHeaderCount();
                for (var h = 0; h < headerCnt; h++) {
                    var header = model.getHeaderAt(h);
                    var $headerEl = header.getHeaderEl();
                    var itemRef = header.getItemRef();
                    if (itemRef) {
                        itemRef.getItemEl().before($headerEl);
                    } else {
                        $container.append($headerEl);
                    }
                }
            }
        },

        prepareLayoutMode: function(layoutMode) {
            if (layoutMode === DISPLAY_GRID) {
                this._drawAllSelectedGrid();
            }
        },

        cleanupAfterLayoutMode: function(layoutMode) {
            if (layoutMode === DISPLAY_GRID) {
                this._removeAllSelectedGrid();
            }
        },

        _drawImage: function($image) {
            var color256   = $image.closest("a").css("background-color");     // Let's grab the color form the card background
            var colorFloat = $.map(color256.match(/(\d+)/g), function (val) { // RGB values between 0 and 1
                return val/255;
            });
            Utils.multiplyImage($image[0], colorFloat);
        },

        _drawAllSelectedGrid: function() {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var selector = this.selectors.view.selectedItems.grid.selector + " img:visible";
            var self = this;
            $(selector).each(function() {
                self._drawImage($(this));
            });
            $(selector).load(function() {
                self._removeSelectedGrid($(this).closest(self.selectors.itemSelector));
                self._drawImage($(this));
            });
        },

        _removeAllSelectedGrid: function() {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var selector = this.selectors.view.selectedItems.grid.selector +
                    " canvas.multiplied";
            $(selector).remove();
        },

        _drawSelectedGrid: function(item) {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var $img = item.getItemEl().find("img:visible");
            this._drawImage($img);
            // redraw if image has not been loaded (fully) yet
            var self = this;
            $img.load(function() {
                self._removeSelectedGrid(item);
                self._drawImage($(this));
            });
        },

        _removeSelectedGrid: function(item) {
            if (!this.selectors.enableImageMultiply) {
                return;
            }
            var $itemEl = item;
            if (!$itemEl.jquery) {
                $itemEl = item.getItemEl();
            }
            $itemEl.find("canvas.multiplied").remove();
        },

        removeAllItemsSilently: function() {
            this.$el.find(this.selectors.itemSelector).remove();
        }

    });

    /*
     * This class implements the controller for data represented by DirectMarkupModel and
     * displayed by DirectMarkupController
     */
    var DirectMarkupController = new Class({

        $el: null,

        selectors: null,

        selectionModeCount: null,

        _listSelect: false,

        construct: function($el, selectors) {
            this.$el = $el;
            this.selectors = selectors;
            this.selectionModeCount = SELECTION_MODE_COUNT_MULTI;
        },

        initialize: function() {
            this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
            var self = this;
            // Selection
            this.$el.fipo("tap.cardview.select", "click.cardview.select",
                this.selectors.controller.selectElement.list, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if (widget.getDisplayMode() === DISPLAY_LIST) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        if (widget.toggleSelection(item)) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        if (e.type === "tap") {
                            self._listSelect = true;
                        }
                    }
                });
            this.$el.fipo("tap.cardview.select", "click.cardview.select",
                this.selectors.controller.selectElement.grid, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if ((widget.getDisplayMode() === DISPLAY_GRID) &&
                            widget.isGridSelectionMode()) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        if (widget.toggleSelection(item)) {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                });
            // list header
            this.$el.fipo("tap.cardview.selectall", "click.cardview.selectall",
                this.selectors.controller.selectAll.selector, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    if (widget.getDisplayMode() === DISPLAY_LIST) {
                        var cls = self.selectors.controller.selectAll.cls;
                        var $header = self.selectors.controller.targetToItem.header(
                                $(e.target));
                        var header = widget.getModel().getHeaderForEl($header);
                        if ($header.hasClass(cls)) {
                            widget.deselectAll(header);
                        } else {
                            widget.selectAll(header);
                        }
                    }
                });
            // block click event for cards on touch devices
            this.$el.finger("click.cardview.select",
                this.selectors.controller.selectElement.grid, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    var dispMode = widget.getDisplayMode();
                    if ((dispMode === DISPLAY_GRID) && widget.isGridSelectionMode()) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                });
            // block click event for list items on touch devices if the click actually
            // represents a change in selection rather than navigating
            var listNavElement = this.selectors.controller.selectElement.listNavElement ||
                    this.selectors.controller.selectElement.grid;
            this.$el.finger("click.cardview.select",
                listNavElement, function(e) {
                    var widget = Utils.getWidget(self.$el);
                    var dispMode = widget.getDisplayMode();
                    if ((dispMode === DISPLAY_LIST) && self._listSelect) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    self._listSelect = false;
                });
            // reordering
            this.$el.fipo("touchstart.cardview.reorder", "mousedown.cardview.reorder",
                this.selectors.controller.moveHandleElement.list, function(e) {
                    var $itemEl = self.getItemElFromEvent(e);
                    var handler = new ListItemMoveHandler({
                        $listEl: self.$el,
                        $itemEl: $itemEl,
                        $items: $(self.selectors.itemSelector),
                        dragCls: "dragging",
                        autoScrolling: true
                    });
                    handler.start(e);
                });
            // handle select all state
            this.$el.on("change:selection", function(e) {
                if (e.moreSelectionChanges) {
                    return;
                }
                self._adjustSelectAllState(e.widget);
            });
            this.$el.on("change:insertitem", function(e) {
                if (e.moreItems) {
                    return;
                }
                self._adjustSelectAllState(e.widget);
            });
        },

        _adjustSelectAllState: function(widget) {
            var cls = this.selectors.controller.selectAll.cls;
            var selectionState = widget.getHeaderSelectionState();
            var headers = selectionState.headers;
            var headerCnt = headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = headers[h];
                var $header = header.header.getHeaderEl();
                if (header.hasUnselected) {
                    $header.removeClass(cls);
                } else {
                    $header.addClass(cls);
                }
            }
        },

        getItemElFromEvent: function(e) {
            var $target = $(e.target);
            var resolver = this.selectors.controller.targetToItem[this.getDisplayMode()];
            if ($.isFunction(resolver)) {
                return resolver($target);
            }
            return $target.find(resolver);
        },

        isGridSelect: function() {
            var selectorDef = this.selectors.controller.gridSelect;
            var $el = this.$el;
            if (selectorDef.selector) {
                $el = $el.find(selectorDef.selector);
            }
            return $el.hasClass(selectorDef.cls);
        },

        setGridSelect: function(isGridSelect) {
            if (this.isGridSelect() !== isGridSelect) {
                var selectorDef = this.selectors.controller.gridSelect;
                var $el = this.$el;
                if (selectorDef.selector) {
                    $el = $el.find(selectorDef.selector);
                }
                if (isGridSelect) {
                    $el.addClass(selectorDef.cls);
                } else {
                    $el.removeClass(selectorDef.cls);
                    Utils.getWidget($el).clearSelection();
                }
                this.$el.trigger($.Event("change:gridSelect", {
                    "widget": this.$el.data("cardView"),
                    "oldValue": !isGridSelect,
                    "value": isGridSelect
                }));
            }
        },

        getDisplayMode: function() {
            if (this.$el.hasClass("list")) {
                return DISPLAY_LIST;
            }
            if (this.$el.hasClass("grid")) {
                return DISPLAY_GRID;
            }
            return null;
        },

        setDisplayMode: function(displayMode) {
            var oldValue = this.getDisplayMode();
            if (oldValue !== displayMode) {
                var widget = Utils.getWidget(this.$el);
                widget._restore(displayMode === DISPLAY_LIST);
                switch (displayMode) {
                    case DISPLAY_GRID:
                        this.$el.removeClass("list");
                        this.$el.addClass("grid");
                        if (oldValue !== null) {
                            var selection = widget.getSelection();
                            this.setGridSelect(selection.length > 0);
                            widget.layout();
                        }
                        break;
                    case DISPLAY_LIST:
                        this.$el.cuigridlayout("destroy");
                        this.$el.removeClass("grid");
                        this.$el.addClass("list");
                        break;
                }
                this.$el.trigger($.Event("change:displayMode", {
                    "widget": this.$el.data("cardView"),
                    "oldValue": oldValue,
                    "value": displayMode
                }));
            }
        },

        getSelectionModeCount: function() {
            return this.selectionModeCount;
        },

        setSelectionModeCount: function(modeCount) {
            this.selectionModeCount = modeCount;
        }
    });

    var DirectMarkupAdapter = new Class({

        $el: null,

        selectors: null,

        model: null,

        view: null,

        controller: null,

        construct: function(selectors) {
            this.selectors = selectors;
        },

        initialize: function($el) {
            this.$el = $el;
            this.setModel(new DirectMarkupModel($el, this.selectors));
            this.setView(new DirectMarkupView($el, this.selectors));
            this.setController(new DirectMarkupController($el, this.selectors));
            this.model.initialize();
            this.view.initialize();
            this.controller.initialize();
        },

        setModel: function(model) {
            this.model = model;
        },

        getModel: function() {
            return this.model;
        },

        setView: function(view) {
            this.view = view;
        },

        getView: function() {
            return this.view;
        },

        setController: function(controller) {
            this.controller = controller;
        },

        getController: function() {
            return this.controller;
        },

        isSelected: function(item) {
            var selectionState = this.view.getSelectionState(item);
            return (selectionState === "selected");
        },

        setSelected: function(item, isSelected) {
            var selectionState = (isSelected ? "selected" : "unselected");
            this.view.setSelectionState(item, selectionState);
        },

        getSelection: function(useModel) {
            var selection = this.view.getSelectedItems();
            if (useModel === true) {
                selection = this.model.fromItemElements(selection);
            }
            return selection;
        },

        getDisplayMode: function() {
            return this.controller.getDisplayMode();
        },

        setDisplayMode: function(selectionMode) {
            this.controller.setDisplayMode(selectionMode);
        },

        isGridSelectionMode: function() {
            return this.controller.isGridSelect();
        },

        setGridSelectionMode: function(isSelectionMode) {
            this.controller.setGridSelect(isSelectionMode);
        },

        getSelectionModeCount: function() {
            return this.controller.getSelectionModeCount();
        },

        setSelectionModeCount: function(modeCount) {
            this.controller.setSelectionModeCount(modeCount);
        },

        _restore: function(restoreHeaders) {
            this.view.restore(this.model, restoreHeaders);
            this.model.reference();
        },

        removeAllItems: function() {
            var widget = Utils.getWidget(this.$el);
            widget.clearSelection();
            this.model.removeAllItemsSilently();
            this.view.removeAllItemsSilently();
        }

    });

    CUI.CardView = new Class(/** @lends CUI.CardView# */{

        toString: 'CardView',

        extend: CUI.Widget,

        adapter: null,


        construct: function(options) {
            var selectorConfig = options.selectorConfig || DEFAULT_SELECTOR_CONFIG; // TODO this must be merged instead of just overwriting the whole config
            this.adapter = new DirectMarkupAdapter(selectorConfig);
            this.adapter.initialize(this.$element);
            this.layout();
        },

        getModel: function() {
            return this.adapter.getModel();
        },

        setModel: function(model) {
            this.adapter.setModel(model);
        },

        isSelected: function(item) {
            return this.adapter.isSelected(item);
        },

        getDisplayMode: function() {
            return this.adapter.getDisplayMode();
        },

        setDisplayMode: function(displayMode) {
            this.adapter.setDisplayMode(displayMode);
        },

        isGridSelectionMode: function() {
            return this.adapter.isGridSelectionMode();
        },

        setGridSelectionMode: function(isSelection) {
            this.adapter.setGridSelectionMode(isSelection);
        },

        toggleGridSelectionMode: function() {
            this.setGridSelectionMode(!this.isGridSelectionMode());
        },

        getSelectionModeCount: function() {
            return this.adapter.getSelectionModeCount();
        },

        setSelectionModeCount: function(modeCount) {
            this.adapter.setSelectionModeCount(modeCount);
        },

        select: function(item, moreSelectionChanges) {
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (!isSelected) {
                if (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE &&
                    this.getSelection().length > 0) {
                    this.clearSelection();
                }

                this.adapter.setSelected(item, true);
                this.$element.trigger($.Event("change:selection", {
                    "widget": this,
                    "item": item,
                    "isSelected": true,
                    "moreSelectionChanges": (moreSelectionChanges === true)
                }));
            }
        },

        deselect: function(item, moreSelectionChanges) {
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (isSelected) {
                this.adapter.setSelected(item, false);
                this.$element.trigger($.Event("change:selection", {
                    "widget": this,
                    "item": item,
                    "isSelected": false,
                    "moreSelectionChanges": moreSelectionChanges
                }));
            }
        },

        toggleSelection: function(item, moreSelectionChanges) {
            item = ensureItem(item);

            var beforeEvent = $.Event("beforeselect", {

                selectionCancelled: false,

                item: item,

                cancelSelection: function() {
                    this.selectionCancelled = true;
                }
            });
            this.$element.trigger(beforeEvent);
            if (beforeEvent.selectionCancelled) {
                return false;
            }

            var isSelected = this.isSelected(item);
            if (!isSelected &&
                    (this.getSelectionModeCount() === SELECTION_MODE_COUNT_SINGLE) &&
                    (this.getSelection().length > 0)) {
                this.clearSelection();
            }

            this.adapter.setSelected(item, !isSelected);
            this.$element.trigger($.Event("change:selection", {
                "widget": this,
                "item": item,
                "isSelected": !isSelected,
                "moreSelectionChanges": moreSelectionChanges
            }));
            return true;
        },

        getSelection: function(useModel) {
            return this.adapter.getSelection(useModel === true);
        },

        clearSelection: function() {
            var selection = this.getSelection(true);
            var itemCnt = selection.length;
            var finalItem = (itemCnt - 1);
            for (var i = 0; i < itemCnt; i++) {
                this.deselect(selection[i], (i < finalItem));
            }
        },

        _headerSel: function(headers, selectFn, lastValidItemFn) {
            var model = this.adapter.getModel();
            if (headers == null) {
                headers = model.getHeaders();
            }
            if (!$.isArray(headers)) {
                headers = [ headers ];
            }
            var headerCnt = headers.length;
            for (var h = 0; h < headerCnt; h++) {
                var header = headers[h];
                if (header.jquery) {
                    header = model.getHeaderForEl(header);
                }
                var itemsToSelect = model.getItemsForHeader(header);
                var itemCnt = itemsToSelect.length;
                for (var i = 0; i < itemCnt; i++) {
                    selectFn.call(this,
                            itemsToSelect[i], !lastValidItemFn(i, itemsToSelect));
                }
            }
        },

        selectAll: function(headers) {
            if (this.getSelectionModeCount() !== SELECTION_MODE_COUNT_MULTI) return;

            var self = this;
            this._headerSel(headers, this.select, function(i, items) {
                for (++i; i < items.length; i++) {
                    if (!self.isSelected(items[i])) {
                        return false;
                    }
                }
                return true;
            });
        },

        deselectAll: function(headers) {
            var self = this;
            this._headerSel(headers, this.deselect, function(i, items) {
                for (++i; i < items.length; i++) {
                    if (self.isSelected(items[i])) {
                        return false;
                    }
                }
                return true;
            });
        },

        getHeaderSelectionState: function() {
            var model = this.getModel();
            var curHeader = null;
            var state = {
                "selected": [ ],
                "hasUnselected": false,
                "headers": [ ]
            };
            var headerCnt = model.getHeaderCount();
            var itemCnt = model.getItemCount();
            for (var i = 0; i < itemCnt; i++) {
                var item = model.getItemAt(i);
                for (var h = 0; h < headerCnt; h++) {
                    var header = model.getHeaderAt(h);
                    if (header.getItemRef() === item) {
                        curHeader = {
                            "header": header,
                            "selected": [ ],
                            "hasUnselected": false
                        };
                        state.headers.push(curHeader);
                        break;
                    }
                }
                if (this.isSelected(item)) {
                    if (curHeader !== null) {
                        curHeader.selected.push(item);
                    } else {
                        state.selected.push(item);
                    }
                } else {
                    if (curHeader !== null) {
                        curHeader.hasUnselected = true;
                    } else {
                        state.hasUnselected = true;
                    }
                }
            }
            return state;
        },

        layout: function() {
            if (this.getDisplayMode() !== DISPLAY_GRID) {
                return;
            }
            if (this.$element.data('cuigridlayout')) {
                this.$element.cuigridlayout("destroy");
            }
            this.$element.cuigridlayout();
        },

        relayout: function() {
            if (this.getDisplayMode() !== DISPLAY_GRID) {
                return;
            }
            this.$element.cuigridlayout("layout");
        },

        _restore: function(restoreHeaders) {
            this.adapter._restore(restoreHeaders);
        },

        append: function($items) {
            this.adapter.getModel().insertItemAt($items, null, false);
        },

        prepend: function($items) {
            this.adapter.getModel().insertItemAt($items, 0, false);
        },

        removeAllItems: function() {
            this.adapter.removeAllItems();
            if (this.getDisplayMode() === DISPLAY_GRID) {
                this.relayout();
            }
            this.$element.trigger($.Event("change:removeAll", {
                widget: this
            }));
        }

    });

    CUI.CardView.DISPLAY_GRID = DISPLAY_GRID;

    CUI.CardView.DISPLAY_LIST = DISPLAY_LIST;

    CUI.CardView.get = function($el) {
        var cardView = Utils.getWidget($el);
        if (!cardView) {
            cardView = Utils.getWidget($el.cardView());
        }
        return cardView;
    };

    CUI.util.plugClass(CUI.CardView);

    // Data API
    if (CUI.options.dataAPI) {
        $(function() {
            var cardViews = $('body').find('[data-toggle="cardview"]');
            for (var gl = 0; gl < cardViews.length; gl++) {
                var $cardView = $(cardViews[gl]);
                if (!$cardView.data("cardview")) {
                    $cardView.cardView();
                }
            }
        });
    }

}(window.jQuery));