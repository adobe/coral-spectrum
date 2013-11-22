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
         *     <li data-value="expr1">Expression 1</li>
         *     <li data-value="expr2">Expression 2</li>
         *     <li data-value="expr3">Expression 3</li>
         * </ul>
         *
         * <ul class="selectlist" data-init="selectlist" data-multiple="true">
         *     <li class="optgroup">
         *         <span>Group 1</span>
         *         <ul>
         *             <li data-value="expr1">Expression 1</li>
         *             <li data-value="expr2">Expression 2</li>
         *             <li data-value="expr3">Expression 3</li>
         *         </ul>
         *     </li>
         *     <li class="optgroup">
         *         <span>Group 2</span>
         *         <ul>
         *             <li data-value="expr4">Expression 4</li>
         *             <li data-value="expr5">Expression 5</li>
         *         </ul>
         *     </li>
         * </ul>
         *
         * @example
         * <caption>Instantiate with Class</caption>
         * var selectlist = new CUI.SelectList({
         *     element: '#mySelectList'
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
         *     &lt;li data-value=&quot;expr1&quot;&gt;Expression 1&lt;/li&gt;
         *     &lt;li data-value=&quot;expr2&quot;&gt;Expression 2&lt;/li&gt;
         *     &lt;li data-value=&quot;expr3&quot;&gt;Expression 3&lt;/li&gt;
         * &lt;/ul&gt;
         *
         * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot; data-multiple=&quot;true&quot;&gt;
         *     &lt;li class=&quot;optgroup&quot;&gt;
         *         &lt;span&gt;Group 1&lt;/span&gt;
         *         &lt;ul&gt;
         *             &lt;li data-value=&quot;expr1&quot;&gt;Expression 1&lt;/li&gt;
         *             &lt;li data-value=&quot;expr2&quot;&gt;Expression 2&lt;/li&gt;
         *             &lt;li data-value=&quot;expr3&quot;&gt;Expression 3&lt;/li&gt;
         *         &lt;/ul&gt;
         *     &lt;/li&gt;
         *     &lt;li class=&quot;optgroup&quot;&gt;
         *         &lt;span&gt;Group 2&lt;/span&gt;
         *         &lt;ul&gt;
         *             &lt;li data-value=&quot;expr4&quot;&gt;Expression 4&lt;/li&gt;
         *             &lt;li data-value=&quot;expr5&quot;&gt;Expression 5&lt;/li&gt;
         *         &lt;/ul&gt;
         *     &lt;/li&gt;
         * &lt;/ul&gt;
         * 
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
         * @param  {String} [options.type=static] static or dynamic list
         * @param  {Boolean} [options.multiple=false] multiple selection or not
         * @param  {Object} options.relatedElement DOM element to position at
         * @param  {Boolean} [options.autofocus=true] automatically sets the
         * caret to the first item in the list
         * @param  {Boolean} [options.autohide=true] automatically closes the
         * list when clicking the toggle button or clicking outside of the list
         * @param  {String} [options.dataurl] URL to receive values dynamically
         * @param  {String} [options.dataurlformat=html] format of the dynamic data load
         * @param  {Object} [options.dataadditional] additonal data to be sent with a remote loading request
         * @param  {Function} [options.loadData] function to be called if more data is needed. This must not be used with a set dataurl.
         *
         * 
         */
        construct: function (options) {
            this.applyOptions();

            this.$element
                .on('change:type', this._setType.bind(this))
                .on('click', this._SELECTABLE_SELECTOR, this._triggerSelected.bind(this))
                .on('mouseenter', this._SELECTABLE_SELECTOR, this._handleMouseEnter.bind(this));

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            type: 'static', // static or dynamic
            multiple: false,
            relatedElement: null,
            autofocus: true, // autofocus on show
            autohide: true,
            dataurl: null,
            dataurlformat: 'html',
            datapaging: true,
            datapagesize: 10,
            dataadditional: null,
            loadData: $.noop, // function to receive more data
            position: 'center bottom-1'  // -1 to override the border
        },

        /**
         * Selector used to find selectable items.
         * @private
         */
        _SELECTABLE_SELECTOR: '[role="option"]:visible:not([aria-disabled="true"])',

        applyOptions: function () {
            this._setType();
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
            var self = this;

            this.$element.attr({
                'role': 'listbox',
                'tabindex': -1, // the list itself is not focusable
                'aria-controls': $(this.options.relatedElement).attr('id') || '',
                'aria-hidden': true,
                'aria-multiselectable': this.options.multiple
            });

            this._makeAccessibleListOption(this.$element.children());
        },

        /**
         * Handles key down events for accessibility purposes.
         * @param event The keydown event.
         * @private
         */
        _handleKeyDown: function(event) {
            // enables keyboard support
            var entries = this.$element.find(this._SELECTABLE_SELECTOR),
                    currentFocusEntry = entries.filter('.focus'),
                    currentFocusIndex = entries.index(currentFocusEntry),
                    newFocusEntry;

            if (!entries.length) {
                return;
            }

            switch (event.which) {
                case 13: // enter
                case 32: // space
                    // If the toggle button for the select list has focus and 
                    // the user hits enter or space when a list item is 
                    // highlighted, they would expect the item
                    // to be selected. If no item is highlighted, they 
                    // would expect the toggle to hide the list.
                    // This is why we only preventDefault() when an entry
                    // is highlighted.
                    if (currentFocusEntry.length) {
                        currentFocusEntry.trigger('click');
                        event.preventDefault();
                    }
                    break;
                case 27: //esc
                    this.hide();
                    event.preventDefault();
                    break;
                case 33: //page up
                case 37: //left arrow
                case 38: //up arrow
                    // According to spec, don't loop to the bottom of the list.
                    if (currentFocusIndex > 0) {
                        newFocusEntry = entries[currentFocusIndex-1];
                    } else if (currentFocusIndex == -1) {
                        newFocusEntry = entries[entries.length-1];
                    }
                    event.preventDefault();
                    break;
                case 34: //page down
                case 39: //right arrow 
                case 40: //down arrow
                    // According to spec, don't loop to the top of the list.
                    if (currentFocusIndex + 1 < entries.length) {
                        newFocusEntry = entries[currentFocusIndex+1];
                    }
                    event.preventDefault();
                    break;
                case 36: //home
                    newFocusEntry = entries[0];
                    event.preventDefault();
                    break;
                case 35: //end
                    newFocusEntry = entries[entries.length-1];
                    event.preventDefault();
                    break;
            }

            if (newFocusEntry !== undefined) {
                this.setCaretToItem($(newFocusEntry), true);
            }
        },

        /**
         * makes the list options accessible
         * @private
         * @param  {jQuery} elem
         */
        _makeAccessibleListOption: function (elem) {
            elem.each(function (i, e) {
                var entry = $(e);

                // group header
                if (entry.hasClass('optgroup')) {
                    entry.attr({
                        'role': 'presentation'
                    }).children('ul').attr({
                        'role': 'group'
                    }).children('li').attr({
                        'role': 'option'
                    });
                } else {
                    entry.attr({
                        'role': 'option'
                    });
                }
            });
        },
      
        /**
         * Visually focuses the provided list item and ensures it is within 
         * view.
         * @param {jQuery} $item The list item to focus.
         * @param {boolean} scrollToItem Whether to scroll to ensure the item 
         * is fully within view.
         */
        setCaretToItem: function($item, scrollToItem) {
            this.$element.find('[role="option"]').removeClass('focus');
            $item.addClass('focus');
            
            if (scrollToItem) {
                this.scrollToItem($item);    
            }
        },

        /**
         * Removes visual focus from list items and scrolls to the top.
         */
        resetCaret: function() {
            this.$element.find('[role="option"]').removeClass('focus');
            this.$element.scrollTop(0);
        },

        /**
         * Scrolls as necessary to ensure the list item is within view.
         * @param {jQuery} $item The list item
         */
        scrollToItem: function($item) {
            if (!$item.length) {
                return;
            }
            
            var itemTop = $item.position().top,
                itemHeight = $item.outerHeight(false),
                scrollNode = this.$element[0];
            
            var bottomOverflow = itemTop + itemHeight - scrollNode.clientHeight;
            
            if (bottomOverflow > 0) {
                scrollNode.scrollTop += bottomOverflow;
            } else if (itemTop < 0) {
                scrollNode.scrollTop += itemTop;
            }
        },

        show: function() {
            if (this.options.visible) {
              return this;
            } else {
              hideLists(); // Must come before the parent show method.
              return this.inherited(arguments);
            }
        },

        /**
         * @private
         */
        _show: function () {
            var self = this;

            this.$element
                .addClass('visible')
                .attr('aria-hidden', false);

            this.$element.position({
                my: 'top',
                at: this.options.position,
                of: this.options.relatedElement
            });

            if (this.options.autofocus) {
                this.setCaretToItem(
                    this.$element.find(this._SELECTABLE_SELECTOR).first(),
                    true);
            }

            // if dynamic start loading
            if (this.options.type === 'dynamic') {
                this._handleLoadData().done(function() {
                    if (self.options.autofocus) {
                        self.setCaretToItem(
                            self.$element.find(self._SELECTABLE_SELECTOR).first(),
                            true);    
                    }
                });
            }

            $(document).on('keydown.selectlist', this._handleKeyDown.bind(this));
        },

        /**
         * @private
         */
        _hide: function () {
            this.$element
                .removeClass('visible')
                .attr('aria-hidden', true);

            
            this.reset();

            $(document).off('keydown.selectlist');
        },

        /**
         * triggers an event for the currently selected element
         * @fires SelectList#selected
         * @private
         */
        _triggerSelected: function (event) {
            var cur = $(event.currentTarget),
                val = cur.data('value'),
                display = cur.text();

            cur.trigger($.Event('selected', {
                selectedValue: val,
                displayedValue: display
            }));
        },

        /**
         * handles the mousenter event on an option
         * this events sets the the focus to the current event
         * @param  {jQuery.Event} event
         */
        _handleMouseEnter: function (event) {
            this.setCaretToItem($(event.currentTarget), false);
        },

        /**
         * deletes the item from the dom
         */
        clearItems: function () {
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
                wait = $('<div/>',{
                    'class': 'selectlist-wait'
                }).append($('<span/>', {
                    'class': 'wait'
                }));

            if (this._loadingIsActive) { // immediately resolve
                return $.Deferred().resolve().promise();
            }

            // activate fetching
            this._loadingIsActive = true;

            // add wait
            this.$element.append(wait);

            // load from given URL
            if (this.options.dataurl) {
                promise = $.ajax({
                    url: this.options.dataurl,
                    context: this,
                    dataType: this.options.dataurlformat,
                    data: $.extend({
                        start: this._pagestart,
                        end: end
                    }, this.options.dataadditional || {})
                }).done(function (data) {
                    var cnt = 0;

                    if (self.options.dataurlformat === 'html') {
                        var elem = $(data);

                        cnt = elem.filter('li').length;

                        self._makeAccessibleListOption(elem);
                        self.$element.append(elem);
                    }

                    // if not enough elements came back then the loading is complete
                    if (cnt < self.options.datapagesize) {
                        this._loadingComplete = true;
                    }

                });

            } else { // expect custom function to handle
                promise = this.options.loadData.call(this, this._pagestart, end);
            }

            // increase to next page
            this._pagestart = end;

            promise.always(function () {
                wait.remove();
                self._loadingIsActive = false;
            });

            return promise;
        },

        /**
         * resets the dynamic loaded data
         */
        reset: function () {
            if (this.options.type === 'dynamic') {
                this.clearItems();
                this._pagestart = 0;
                this._loadingComplete = false;
            }
        },

        /**
         * triggers a loading operation 
         * this requires to have the selectlist in a dynamic configuration
         * @param  {Boolean} reset resets pagination
         */
        triggerLoadData: function (reset) {
            if (reset) {
                this.reset();
            }

            this._handleLoadData();
        }
    });

    CUI.Widget.registry.register("selectlist", CUI.SelectList);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
            CUI.SelectList.init($('[data-init~=selectlist]', event.target));
        });
    }

    var selectListSelector = '.selectlist',
            toggleSelector = '[data-toggle~=selectlist]';

    /**
     * Hides all select lists that have autohide enabled.
     * @ignore
     */
    var hideLists = function() {
        $('.selectlist').each(function() {
            var selectList = $(this).data('selectList');
            if (selectList.get('autohide')) {
                selectList.hide();
            }
        });
    };

    /**
     * From a toggle element, toggles the visibility of its target select list.
     * @ignore
     */
    var toggleList = function() {
        var $selectList = CUI.util.getDataTarget($(this));
        if ($selectList.length) {
            $selectList.data('selectList').toggleVisibility();
        }
        return false;
    };

    $(document)
        // If a click reaches the document, hide all open lists.
        .on('click.selectlist', hideLists)

        // If the click is from a select list, don't let it reach the document
        // to keep the listener above from hiding the list.
        .on('click.selectlist', selectListSelector, function(event) {
            event.stopPropagation();
        })

        // If a click is from a trigger button, toggle its menu.
        .on('click.selectlist', toggleSelector, toggleList);


    /**
     * Triggered when option was selected
     *
     * @name CUI.SelectList#selected
     * @event
     *
     * @param {Object} event Event object
     * @param {String} event.selectedValue value which was selected
     * @param {String} event.displayedValue displayed text of the selected element
     */
    
    /**
     * Triggered when option was unselected (not implemented)
     *
     * @name CUI.SelectList#unselected
     * @event
     *
     * @param {Object} event Event object
     * @param {String} event.selectedValue value which was unselected
     * @param {String} event.displayedValue displayed text of the unselected element
     */

}(jQuery, this));
