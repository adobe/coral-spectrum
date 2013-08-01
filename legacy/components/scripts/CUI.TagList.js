(function ($, window, undefined) {
    CUI.TagList = new Class(/** @lends CUI.TagList# */{
        toString: 'TagList',

        extend: CUI.Widget,

        /**
         * @extends CUI.Widget
         * @classdesc A tag list for input widgets. This widget is intended to be used by other widgets.
         *
         * <h2 class="line">Examples</h2>
         *  
         * <ol class="taglist">
         *     <li>
         *         <button class="icon-close"></button>
         *         Carrot
         *         <input type="hidden" value="Carrot"/>
         *     </li>
         *     <li>
         *         <button class="icon-close"></button>
         *         Banana
         *         <input type="hidden" value="Banana"/>
         *     </li>
         *     <li>
         *         <button class="icon-close"></button>
         *         Apple
         *         <input type="hidden" value="Apple"/>
         *     </li>
         * </ol>
         * 
         *
         * @description Creates a new tag list
         * @constructs
         * 
         * @param  {Object} options Component options
         * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
         * 
         */
        construct: function (options) {
            var self = this;

            this.applyOptions();

            this.$element
                .on('change:values', this._setValues.bind(this));

            this.$element.fipo('tap', 'click', 'button', function (event) {
                var elem = $(event.currentTarget).next('input');

                self.removeItem(elem.val());
            });

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            fieldname: "",
            values: null,
            tag: 'li'
        },

        applyOptions: function () {
            var self = this;

            this.options.values = this.options.values || [];

            // read values from markup
            if (this.options.values.length === 0) {
                this.$element.find('input').each(function (i, e) {
                    var elem = $(e);

                    // add to options.values
                    self.options.values.push(elem.attr('value'));
                });
            } else {
                this._setValues();
            }
        },

        /**
         * @private
         */
        _setValues: function () {
            var items = this.options.values;

            // remove list elements
            this.$element.empty();

            // clear options to readd
            this.options.values = [];
            // add elements again
            this.addItem(items);
        },

        /**
         * adds some accessibility attributes and features
         * http://www.w3.org/WAI/PF/aria/roles#list
         * @private
         */
        _makeAccessible: function () {
            this.$element.attr({
                'role': 'list'
            });

            this.$element.find(this.options.tag).attr({
                'role': 'listitem'
            });
        },

        /**
         * @private
         */
        _show: function () {
            this.$element
                .show()
                .attr('aria-hidden', false);
        },

        /**
         * @private
         */
        _hide: function () {
            this.$element
                .hide()
                .attr('aria-hidden', true);
        },

        /**
         * remove an item from the DOM
         * @param  {String} item
         */
        _removeItem: function (item) {
            var elem = this.$element.find('input[value="' + item + '"]');

            if (elem.length > 0) {
                elem.parent().remove();
            }
        },

        /**
         * adds a new item to the DOM
         * @private
         * @param  {String} item entry to be displayed
         */
        _appendItem: function (item) {
            var elem = $('<'+ this.options.tag +'/>', {
                    'role': 'listitem',
                    'text': item
                });

                $('<button/>', {
                    'class': 'icon-close'
                }).prependTo(elem);

                $('<input/>', {
                    'type': 'hidden',
                    'value': item
                }).appendTo(elem);

            this.$element.append(elem);
        },

        /**
         * @param {String} item
         */
        removeItem: function (item) {
            var idx = this.options.values.indexOf(item);

            this._removeItem(item);
            this.options.values.splice(idx, 1);
        },

        /**
         * @param  {String|Array} item
         */
        addItem: function (item) {
            var self = this,
                items = $.isArray(item) ? item : [item];

            $.each(items, function (i, item) {
                self._appendItem(item);
                self.options.values.push(item);
            });
        }
    });

    CUI.util.plugClass(CUI.TagList);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
            $('[data-init~=taglist]', event.target).tagList();
        });
    }

}(jQuery, this));
