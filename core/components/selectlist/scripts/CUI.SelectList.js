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
         *     <li data-value="expr1"><span>Expression 1</span></li>
         *     <li data-value="expr2"><span>Expression 2</span></li>
         *     <li data-value="expr3"><span>Expression 3</span></li>
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
         *     &lt;li data-value=&quot;expr1&quot;&gt;&lt;span&gt;Expression 1&lt;/span&gt;&lt;/li&gt;
         *     &lt;li data-value=&quot;expr2&quot;&gt;&lt;span&gt;Expression 2&lt;/span&gt;&lt;/li&gt;
         *     &lt;li data-value=&quot;expr3&quot;&gt;&lt;span&gt;Expression 3&lt;/span&gt;&lt;/li&gt;
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
         * @param  {Boolean} [options.values.autofocus=true] automatically sets the focus on the list
         * @param  {Boolean} [options.values.autohide=true] automatically closes the list when it loses its focus
         * @param  {String} [options.values.addClass] additional css classes to be shown in the list
         * 
         */
        construct: function (options) {
            this.applyOptions();

            this.$element
                .on('change:type', this._setType.bind(this))
                .on('change:values', this._setValues.bind(this));

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            type: 'static', // static or dynamic (WIP)
            relatedElement: null,
            position: 'center bottom-1',  // -1 to override the border
            autofocus: true, // autofocus on show
            autohide: true, // automatically hides the box if it loses focus
            values: null // [{display: "Banana", value: "banId"}]
        },

        applyOptions: function () {
            var self = this;

            this.options.values = this.options.values || [];

            // read values from markup
            if (this.options.values.length === 0) {
                this.$element.find('li').each(function (i, e) {
                    var elem = $(e),
                        txt = elem.text();

                    // add to options.values
                    self.options.values.push({
                        display: txt,
                        value: elem.data('value') || txt
                    });
                });
            }

            this._setValues();
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
            this.addItems(items);
        },

        /**
         * @private
         */
        _setAutohide: function () {
            var self = this,
                receivedFocus = false;

            if (this.options.autohide) {
                this.$element
                    .on('focusout.selectlist-autohide', function (event) {
                        self._autohideTimer = setTimeout(function () {
                            if (!receivedFocus) {
                                self.hide();
                            }
                            receivedFocus = false;
                        }, 50);
                    })
                    .on('focusin.selectlist-autohide', function (event) {
                        receivedFocus = true;
                    });
            } else {
                this.$element.off('focusout.selectlist-autohide focusin.selectlist-autohide');
            }
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

            // keyboard handling
            this.$element.on('keydown', 'li', function (event) {
                // enables keyboard support

                var elem = $(event.currentTarget),
                    entries = $(event.delegateTarget)
                        .find('[role="option"]')
                        .not('[aria-disabled="true"]'), // ignore disabled
                    focusElem = elem,
                    keymatch = true,
                    idx = entries.index(elem);

                switch (event.which) {
                    case 13: // enter
                    case 32: // space
                        // choose element
                        
                        keymatch = false;
                        break;
                    case 33: //page up
                    case 37: //left arrow
                    case 38: //up arrow
                        focusElem = idx-1 > -1 ? entries[idx-1] : entries[entries.length-1];
                        break;
                    case 34: //page down
                    case 39: //right arrow 
                    case 40: //down arrow
                        focusElem = idx+1 < entries.length ? entries[idx+1] : entries[0];
                        break;
                    case 36: //home
                        focusElem = entries[0];
                        break;
                    case 35: //end
                        focusElem = entries[entries.length-1];
                        break;
                    default:
                        keymatch = false;
                        break;
                }

                if (keymatch) { // if a key matched then we set the currently focused element
                    event.preventDefault();
                    $(focusElem).trigger('focus');
                }
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

            this._setAutohide();
        },

        /**
         * @private
         */
        _hide: function () {
            if (this._autohideTimer) {
                clearTimeout(this._autohideTimer);
            }
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
                    'tabindex': 0,
                    'data-id': id,
                    'data-value': item.value
                }),
                a = $('<span/>', {
                    'text': item.display || item.value,
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
