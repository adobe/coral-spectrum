/*
 * TODO - make it work with external addition/removal of classes (don't rely on state)
 * TODO - for that, delegate (for example) determining the selection to the view
 * TODO - provide a "sync" method that syncs view and model
 */

(function($) {

    var DISPLAY_GRID = "grid";

    var DISPLAY_LIST = "list";

    var DEFAULT_SELECTOR_CONFIG = {

        "itemSelector": "article",
        "view": {
            "selectedItem": {
                "list": {
                    "selector": "> i.select",
                    "cls": "selected"
                },
                "grid": {
                    "cls": "selected"
                }
            },
            "selectedItems": {
                "list": {
                    "selector": "> i.select",
                    "resolver": function($el) {
                        return $el.parents("article");
                    }
                },
                "grid": {
                    // not yet required
                }
            }
        },
        "controller": {
            "selectElement": {
                "list": "article > i.select",
                "grid": "article > a"
            },
            "moveHandleElement": {
                "list": "article > i.move"
            },
            "targetToItem": {
                "list": function($target) {
                    return $target.parents("article");
                },
                "grid": function($target) {
                    return $target.parents("article");
                }
            },
            "gridSelect": {
                "cls": "selection-mode"
            }
        }

    };

    var instances = [ ];

    var getInstance = function($el) {
        if ($el.length !== 1) {
            return undefined;
        }
        var instCnt = instances.length;
        for (var i = 0; i < instCnt; i++) {
            if (instances[i].$element[0] === $el[0]) {
                return instances[i];
            }
        }
        return undefined;
    };

    var Utils = {

        equals: function($1, $2) {
            return ($1.length === $2.length) && ($1.length === $1.filter($2).length);
        },

        getWidget: function($el) {
            return $el.data("gridList");
        }

    };

    /*
     * This class represents a single item in the list model.
     */
    var Item = new Class({

        $itemEl: null,

        construct: function($itemEl) {
            this.$itemEl = $itemEl;
            this.$itemEl.data("gridlist-item", this);
        },

        getItemEl: function() {
            return this.$itemEl;
        }

    });

    /*
     * This class represents a data model that is created via a selector from an existing
     * DOM.
     */
    var DirectMarkupModel = new Class({

        items: [ ],

        construct: function($el, selectors) {
            var $items = $el.find(selectors.itemSelector);
            var itemCnt = $items.length;
            for (var i = 0; i < itemCnt; i++) {
                this.items.push(new Item($($items[i])));
            }
        },

        getItemCount: function() {
            return this.items.length;
        },

        getItemAt: function(pos) {
            return this.items[pos];
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

        getDisplayMode: function() {
            return Utils.getWidget(this.$el).getDisplayMode();
        },

        setSelectionState: function(item, selectionState) {
            var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            if (selectionState === "selected") {
                $itemEl.addClass(selectorDef.cls);
            } else if (selectionState === "unselected") {
                $itemEl.removeClass(selectorDef.cls);
            }
        },

        getSelectionState: function(item) {
            var selectorDef = this.selectors.view.selectedItem[this.getDisplayMode()];
            var $itemEl = item.getItemEl();
            if (selectorDef.selector) {
                $itemEl = $itemEl.find(selectorDef.selector);
            }
            return ($itemEl.hasClass(selectorDef.cls) ? "selected" : "unselected");
        },

        getSelectedItems: function() {
            var selectorDef = this.selectors.view.selectedItems[this.getDisplayMode()];
            var $selectedItems = this.$el.find(selectorDef.selector);
            if (selectorDef.resolver) {
                $selectedItems = selectorDef.resolver(selectorDef.resolver($selectedItems));
            }
            return $selectedItems;
        }

    });

    /*
     * This class implements the controller for data represented by DirectMarkupModel and
     * displayed by DirectMarkupController
     */
    var DirectMarkupController = new Class({

        $el: null,

        selectors: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this.selectors = selectors;
            this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
            var self = this;
            this.$el.fipo("tap.gridlist.select", "click.gridlist.select",
                    this.selectors.controller.selectElement.list, function(e) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        var widget = Utils.getWidget(self.$el);
                        if (widget.getDisplayMode() === DISPLAY_LIST) {
                            Utils.getWidget(self.$el).toggleSelection(item);
                        }
                    });
            this.$el.fipo("tap.gridlist.select", "click.gridlist.select",
                    this.selectors.controller.selectElement.grid, function(e) {
                        var item = ensureItem(self.getItemElFromEvent(e));
                        var widget = Utils.getWidget(self.$el);
                        if (widget.getDisplayMode() === DISPLAY_GRID) {
                            Utils.getWidget(self.$el).toggleSelection(item);
                        }
                    });
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
                }
                this.$el.trigger($.Event("change:gridlist", {
                    params: {
                        "origin": "controller",
                        "widget": this.$el.data("gridList"),
                        "type": "gridSelect",
                        "oldValue": !isGridSelect,
                        "value": isGridSelect
                    }
                }));
            }
        },

        getDisplayMode: function() {
            if (this.$el.hasClass("list")) {
                return DISPLAY_LIST;
            }
            return DISPLAY_GRID;
        },

        setDisplayMode: function(displayMode) {
            if (this.getDisplayMode() !== displayMode) {
                var oldValue = this.getDisplayMode();
                switch (displayMode) {
                    case DISPLAY_GRID:
                        this.$el.removeClass("list");
                        this.$el.addClass("grid");
                        break;
                    case DISPLAY_LIST:
                        this.$el.removeClass("grid");
                        this.$el.addClass("list");
                        break;
                }
                this.$el.trigger($.Event("change:gridlist", {
                    "params": {
                        "origin": "controller",
                        "widget": this.$el.data("gridList"),
                        "type": "displayMode",
                        "oldValue": oldValue,
                        "value": displayMode
                    }
                }));
            }
        }

    });

    var DirectMarkupAdapter = new Class({

        selectors: null,

        model: null,

        view: null,

        controller: null,

        construct: function(selectors) {
            this.selectors = selectors;
        },

        initialize: function(gridlist, $el) {
            this.setModel(new DirectMarkupModel($el, this.selectors));
            this.setView(new DirectMarkupView($el, this.selectors));
            this.setController(new DirectMarkupController($el, this.selectors));
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

        getDisplayMode: function() {
            return this.controller.getDisplayMode();
        },

        setDisplayMode: function(selectionMode) {
            this.controller.setDisplayMode(selectionMode);
        }

    });

    var ensureItem = function(item) {
        if (item.jquery) {
            return item.data("gridlist-item");
        }
        return item;
    };

    CUI.GridList = new Class(/** @lends CUI.GridList# */{

        toString: 'GridList',

        extend: CUI.Widget,

        adapter: null,


        construct: function(options) {
            instances.push(this);
            this.adapter = new DirectMarkupAdapter(DEFAULT_SELECTOR_CONFIG);
            this.adapter.initialize(this, this.$element);
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

        select: function(item) {
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (!isSelected) {
                this.adapter.setSelected(item, true);
                this.$element.trigger($.Event("change:gridlist", {
                    "params": {
                        "type": "select",
                        "origin": "widget",
                        "widget": this,
                        "item": item,
                        "isSelected": true
                    }
                }));
            }
        },

        deselect: function(item) {
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            if (!isSelected) {
                this.adapter.setSelected(item, false);
                this.$element.trigger($.Event("change:gridlist", {
                    "params": {
                        "type": "select",
                        "origin": "widget",
                        "widget": this,
                        "item": item,
                        "isSelected": false
                    }
                }));
            }
        },

        toggleSelection: function(item) {
            item = ensureItem(item);
            var isSelected = this.adapter.isSelected(item);
            this.adapter.setSelected(item, !isSelected);
            this.$element.trigger($.Event("change:gridlist", {
                "params": {
                    "type": "select",
                    "origin": "widget",
                    "widget": this,
                    "item": item,
                    "isSelected": !isSelected
                }
            }));
        },

        layout: function() {
            this.$element.cuigridlayout();
        },

        relayout: function() {
            this.$element.cuigridlayout("layout");
        }

    });

    CUI.GridList.DISPLAY_GRID = DISPLAY_GRID;

    CUI.GridList.DISPLAY_LIST = DISPLAY_LIST;

    CUI.util.plugClass(CUI.GridList);

    // Data API
    if (CUI.options.dataAPI) {
        $(function() {
            var gridlists = $('body').find('[data-toggle="gridlist"]');
            for (var gl = 0; gl < gridlists.length; gl++) {
                var $gridlist = $(gridlists[gl]);
                if (!$gridlist.data("gridlist")) {
                    $gridlist.gridList();
                }
            }
        });
    }

}(window.jQuery));