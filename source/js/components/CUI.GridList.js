(function($) {

    var DISPLAY_GRID = "grid";

    var DISPLAY_LIST = "list";

    var DEFAULT_PARENT_EL_SELECTOR = "article";

    var DEFAULT_SELECTOR_CONFIG = {

        "view": {

        },
        "controller": {
            "selectElement": {
                "list": "i.select",
                "grid": "a"
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

    /*
     * This class represents a data model that is created via a selector from an existing
     * DOM.
     */
    var DirectMarkupModel = new Class({

        items: [ ],

        construct: function($el, itemSelector) {
            this.items = $el.find(itemSelector);
            console.log("*** ", $el, itemSelector);
            console.log("#" + this.getItemCount(), this.items);
        },

        getItemCount: function() {
            return this.items.length;
        },

        getItemAt: function(pos) {
            return this.items[pos];
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
            // internal event listeners
            this.on("change:gridlist.internal", function(e) {
                switch (e.origin) {
                    case "contoller":
                        if (e.type === "displayMode") {
                            this.setDisplayMode(e.widget, )
                        }
                        break;
                }
            })
        }

    });

    /*
     * This class implements the controller for data represented by DirectMarkupModel and
     * displayed by DirectMarkupController
     */
    var DirectMarkupController = new Class({

        $el: null,

        selectors: null,

        _isGridSelect: false,

        _displayMode: null,

        construct: function($el, selectors) {
            this.$el = $el;
            this._isGridSelect = false;
            this.setDisplayMode(this.$el.hasClass("list") ? DISPLAY_LIST : DISPLAY_GRID);
            this.$el.fipo("tap.gridlist.select", "click.gridlist.select")
        },

        isGridSelect: function() {
            return this._isGridSelect;
        },

        setGridSelect: function(isGridSelect) {
            if (this._isGridSelect !== isGridSelect) {
                this._isGridSelect = isGridSelect;
                this.$el.trigger($.Event("change:gridlist", {
                    "origin": "controller",
                    "widget": this,
                    "type": "gridSelect",
                    "oldValue": !isGridSelect,
                    "value": isGridSelect
                }));
            }
        },

        getDisplayMode: function(displayMode) {
            if (this._displayMode != displayMode) {
                var oldValue = this._displayMode;
                this._displayMode = displayMode;
                this.$el.trigger($.Event("change:gridlist", {
                    "origin": "controller",
                    "widget": this,
                    "type": "displayMode",
                    "oldValue": oldValue,
                    "value": displayMode
                }))
            }
        }
    });

    var DirectMarkupAdapter = new Class({

        itemSelector: null,

        construct: function(itemSelector, selectors) {
            this.itemSelector = itemSelector;
        },

        initialize: function(gridlist, $el) {
            gridlist.setModel(new DirectMarkupModel($el, this.itemSelector));
            gridlist.setView(new DirectMarkupView($el, this.itemSelector));
            gridlist.setController(new DirectMarkupController($el, this.itemSelector));
        }

    });

    CUI.GridListView = new Class(/** @lends CUI.GridListView# */{

        toString: 'GridList',

        extend: CUI.Widget,

        adapter: null,

        model: null,

        view: null,

        controller: null,

        construct: function(options) {
            instances.push(this);
            this.adapter = new DirectMarkupAdapter(DEFAULT_PARENT_EL_SELECTOR,
                    DEFAULT_SELECTOR_CONFIG);
            this.adapter.initialize(this, this.$element);
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
        }

    });

    CUI.GridListView.DISPLAY_GRID = DISPLAY_GRID;

    CUI.GridListView.DISPLAY_LIST = DISPLAY_LIST;

    CUI.util.plugClass(CUI.GridListView, "gridlist");

    // Data API
    if (CUI.options.dataAPI) {
        $(function() {
            var gridlists = $('body').find('[data-toggle="gridlist"]');
            for (var gl = 0; gl < gridlists.length; gl++) {
                var $gridlist = $(gridlists[gl]);
                if ($gridlist.data("gridlist") === undefined) {
                    $gridlist.gridlist();
                    this.$element.data("gridlist", this);
                }
            }
        });
    }

}(window.jQuery));