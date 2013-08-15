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
         * @example
         * <caption>Initialize with custom paramters to load remotely</caption>
         * 
         * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot; data-type=&quot;dynamic&quot; data-dataurl=&quot;remotehtml.html&quot;&gt;
         *     
         * &lt;/ul&gt;
         *
         * @description Creates a new select list
         * @constructs
         * 
         * @param  {Object} options Component options
         * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
         * @param  {Object} options.relatedElement DOM element to position at
         * @param  {Boolean} [options.autofocus=true] automatically sets the focus on the list
         * @param  {Boolean} [options.autohide=true] automatically closes the list when it loses its focus
         * @param  {Array} [options.values] array of objects to be displayed in the list
         * @param  {String} [options.values.display] displayed text of an entry
         * @param  {String} [options.values.value] value of an entry
         * @param  {String} [options.values.addClass] additional css classes to be shown in the list
         * @param  {String} [options.dataurl] URL to receive values dynamically
         * @param  {String} [options.dataurlformat=html] format of the dynamic data load
         * @param  {Function} [options.loadData] function to be called if more data is needed. This must not be used with a set dataurl.
         *
         * @fires SelectList#selected
         * 
         */
        construct: function (options) {
            this.applyOptions();

            this.$element
                .on('change:type', this._setType.bind(this))
                .on('change:values', this._setValues.bind(this))
                .on('change:autohide', this._setAutohide.bind(this))
                .on('click', '[role="option"]', this._triggerSelected.bind(this));

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            type: 'static', // static or dynamic
            relatedElement: null,
            dataurl: null,
            dataurlformat: 'html',
            datapagesize: 10,
            loadData: $.noop, // function to receive more data
            position: 'center bottom-1',  // -1 to override the border
            autofocus: true, // autofocus on show
            autohide: true, // automatically hides the box if it loses focus
            values: null // [{display: "Banana", value: "banId"}]
        },

        applyOptions: function () {
            var self = this;

            this._setValues();
            this._setType();
        },

        /**
         * @private
         */
        _setValues: function () {
            if (this.options.values) {
                this.addItems(this.options.values);
            } else {
                this.options.values = [];
            }
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
                        clearTimeout(self._autohideTimer);
                        self._autohideTimer = setTimeout(function () {
                            if (!receivedFocus) {
                                self.hide();
                            }
                            receivedFocus = false;
                        }, 500);
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
            var self = this,
                timeout;

            function timeoutLoadFunc() {
                var elem = self.$element.get(0),
                    scrollHeight = elem.scrollHeight,
                    scrollTop = elem.scrollTop;

                if ((scrollHeight - self.$element.height()) <= (scrollTop + 30)) {
                    self._handleLoadData();
                }
            }

            // we have a dynamic list of values
            if (this.options.type === 'dynamic') {
                this.options.values.length = 0;

                this.$element.on('scroll.selectlist-dynamic-load', function (event) {
                    // debounce
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    if (self._loadingComplete || this._loadingIsActive) {
                        return;
                    }

                    timeout = setTimeout(timeoutLoadFunc, 500);
                });
            } else { // static
                this.$element.off('scroll.selectlist-dynamic-load');
            }
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

            this._makeAccessibleListOption(this.$element.find('li'));

            // setting tabindex
            this.$element.on('focusin focusout', 'li', function (event) {
                $(event.currentTarget).attr('tabindex', event.type === 'focusin' ? -1 : 0);
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
                        elem.trigger('click');
                        keymatch = false;
                        break;
                    case 27: //esc
                        elem.trigger('blur');
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
         * makes the list options accessible
         * @private
         * @param  {jQuery} elem
         */
        _makeAccessibleListOption: function (elem) {
            elem.attr({
                'role': 'option',
                'tabindex': 0
            });
        },

        /**
         * @private
         */
        _show: function () {
            var self = this;

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

            // if dynamic start loading
            if (this.options.type === 'dynamic') {
                this._handleLoadData().done(function () {
                    self.$element.find('li:first').trigger('focus');
                    this._setAutohide();
                });
            } else { // otherwise set autohide immediately
                this._setAutohide();
            }
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

            if (this.options.type === 'dynamic') {
                this.clearItems();
                this._pagestart = 0;
                this._loadingComplete = false;
            }
        },

        /**
         * triggers an event for the currently selected element
         * @private
         */
        _triggerSelected: function (event) {
            var cur = $(event.currentTarget),
                val = cur.data('value'),
                display = cur.text();

            this.hide();
            this.$element.trigger($.Event('selected', {
                selectedValue: val,
                displayedValue: display
            }));
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
        _addItem: function (item) {
            var li = $('<li/>', {
                    'role': 'option',
                    'tabindex': 0,
                    'data-value': item.value
                }),
                span = $('<span/>', {
                    'text': item.display || item.value,
                    'class': item.addClass || ''
                }).appendTo(li);

            this.$element.append(li);
        },

        /**
        * Append items to the end of the list.
        * @param {Array} [items] list of objects to add
        */
        addItems: function (items) {
            var self = this;

            $.each(items, function (i, item) {
                self._addItem(item);
            });
        },

        /**
         * deletes the item from the list and the dom
         */
        clearItems: function () {
            this.options.values.length = 0;
            this.$element.empty();
        },

        /**
         * current position for the pagination
         * @private
         * @type {Number}
         */
        _pagestart: 0,

        /**
         * indicates if all data was fetched
         * @private
         * @type {Boolean}
         */
        _loadingComplete: false,

        /**
         * indicates if currently data is fetched
         * @private
         * @type {Boolean}
         */
        _loadingIsActive: false,

        /**
         * handle asynchronous loading of data (type == dynamic)
         * @private
         */
        _handleLoadData: function () {
            var promise,
                self = this,
                end = this._pagestart + this.options.datapagesize,
                spinner = $('<div/>',{
                    'class': 'selectlist-spinner'
                }).append($('<span/>', {
                    'class': 'spinner'
                }));

            // activate fetching
            this._loadingIsActive = true;

            // add spinner
            this.$element.append(spinner);

            // load from given URL
            if (this.options.dataurl) {
                promise = $.ajax({
                    url: this.options.dataurl,
                    context: this,
                    dataType: this.options.dataurlformat,
                    data: {
                        start: this._pagestart,
                        end: end
                    }
                });

            } else { // expect custom function to handle
                promise = this.options.loadData.call(this, this._pagestart, end);
            }

            // increase to next page
            this._pagestart = end;

            promise.done(function (data) {
                var cnt = 0;

                if (self.options.dataurlformat === 'html') {
                    var elem = $(data).filter('li');

                    cnt = elem.length;

                    self._makeAccessibleListOption(elem);
                    self.$element.append(elem);
                } else if (self.options.dataurlformat === 'json') {
                    // TODO check if pagesize more then what came back

                    self.addItems(data);
                }

                // if not enough elements came back then the loading is complete
                if (cnt < self.options.datapagesize) {
                    this._loadingComplete = true;
                }

            }).always(function () {
                spinner.remove();
                this._loadingIsActive = false;
            });

            return promise;
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
