(function ($, window, undefined) {
    CUI.SelectList = new Class(/** @lends CUI.SelectList# */{
        toString: 'SelectList',

        extend: CUI.Widget,

        /**
         * @extends CUI.Widget
         * @classdesc A select list for drop down widgets. This widget is intended to be used by other widgets.
         *
         * <h2 class="line">Examples</h2>
         * 
         * <ul class="selectlist" data-init="selectlist">
         *     <li><a href="#" data-value="expr1">Expression 1</a></li>
         *     <li><a href="#" data-value="expr2">Expression 2</a></li>
         *     <li><a href="#" data-value="expr3">Expression 3</a></li>
         * </ul>
         *
         * @example
         * <caption>Instantiate with Class</caption>
         * var selectlist = new CUI.SelectList({
         *     element: '#mySelectList'
         * });
         *
         * //Add values through configuration
         * var selectlist = new CUI.SelectList({
         *     element: '#mySelectList',
         *     values: [
         *         {
         *             display: 'My Entry',
         *             value: 'val1',
         *             addClass: 'icon-usa'
         *         },
         *         {
         *             display: 'Another Entry',
         *             value: 'val2',
         *             addClass: 'icon-coral'
         *         }
         *     ]
         * });
         *
         * // show the select list
         * selectlist.show();
         *
         * @example
         * <caption>Instantiate with jQuery</caption>
         * $('#mySelectList').selectList({
         *
         * });
         *
         * // jQuery style works as well for show/hide
         * $('#mySelectList').selectList('show');
         *
         * @example
         * <caption>Data API: Instantiate, set options, and show</caption>
         *
         * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot;&gt;
         *     &lt;li&gt;&lt;a href=&quot;#&quot; data-value=&quot;expr1&quot;&gt;Expression 1&lt;/a&gt;&lt;/li&gt;
         *     &lt;li&gt;&lt;a href=&quot;#&quot; data-value=&quot;expr2&quot;&gt;Expression 2&lt;/a&gt;&lt;/li&gt;
         *     &lt;li&gt;&lt;a href=&quot;#&quot; data-value=&quot;expr3&quot;&gt;Expression 3&lt;/a&gt;&lt;/li&gt;
         * &lt;/ul&gt;
         *
         * @description Creates a new select list
         * @constructs
         * 
         * @param  {Object} options Component options
         * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
         * @param  {Object} options.relatedElement DOM element
         * @param  {Array} [options.values] array of objects to be displayed in the list
         * @param  {String} [options.values.display] displayed text of an entry
         * @param  {String} [options.values.value] value of an entry
         * @param  {String} [options.values.addClass] additional css classes to be shown in the list
         * 
         */
        construct: function (options) {
            this.applyOptions();

            this.$element
                .on('change:type', this._setType.bind(this))
                .on('change:values', this._setOptions.bind(this));

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            type: 'static', // static or dynamic (WIP)
            relatedElement: null,
            position: 'bottom-1',  // -1 to override the border
            autofocus: true, // autofocus on show
            values: null // [{display: "Banana", value: "banId"}]
        },

        applyOptions: function () {
            var self = this;

            this.options.values = this.options.values || [];

            // read values from markup
            if (this.options.values.length === 0) {
                this.$element.find('a').each(function (i, e) {
                    var elem = $(e);

                    // add to options.values
                    self.options.values.push({
                        display: elem.text(),
                        value: elem.data('value')
                    });
                });
            }

            this._setOptions();
        },

        /**
         * @private
         */
        _setOptions: function () {
            var items = this.options.values;

            // remove list elements
            this.$element.empty();

            // clear options to readd
            this.options.values = [];
            // add elements again
            this.addItems(items);
        },

        /**
         * @private
         */
        _setType: function () {

        },

        /**
         * adds some accessibility attributes and features
         * http://www.w3.org/WAI/PF/aria/roles#listbox
         * @private
         */
        _makeAccessible: function () {
            this.$element.attr({
                'role': 'listbox',
                'aria-hidden': true
            });
        },

        /**
         * @private
         */
        _show: function () {
            this.$element
                .show()
                .attr('aria-hidden', false);

            this.$element.position({
                my: 'top',
                at: this.options.position,
                of: this.options.relatedElement
            });

            if (this.options.autofocus) {
                this.$element.find('li:first').trigger('focus');
            }
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
         * adds a new item to the DOM
         * @private
         * @param  {Number} id index of the entry in the options
         * @param  {Object} item entry to be displayed
         * @param  {String} [item.display]
         * @param  {String} [item.value]
         * @param  {String} [item.addClass]
         */
        _addItem: function (id, item) {
            var li = $('<li/>', {
                    'role': 'option',
                    'tabindex': 0
                }),
                a = $('<span/>', {
                    'text': item.display || item.value,
                    'data-id': id,
                    'data-value': item.value,
                    'class': item.addClass
                }).appendTo(li);

            this.$element.append(li);
        },

        /**
        * Append items to the end of the list.
        */
        addItems: function (items) {
            var self = this,
                offset = this.options.values.length;

            $.each(items, function (i, item) {
                self._addItem(offset + i, item);
                self.options.values.push(item);
            });
        }
    });

    CUI.util.plugClass(CUI.SelectList);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
            $('[data-init~=selectlist]', event.target).selectList();
        });
    }

}(jQuery, this));
