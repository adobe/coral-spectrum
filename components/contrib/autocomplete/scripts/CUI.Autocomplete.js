(function ($, window, undefined) {
    CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
        toString: 'Autocomplete',

        extend: CUI.Widget,

        /**
         * @extends CUI.Widget
         * @classdesc Autocomplete is an input component which allows users
         * to search a list of items by typing into the input or, optionally,
         * clicking a toggle button. The list of items can be provided directly
         * or loaded dynamically from a remote endpoint. Depending on enabled
         * options, users can also create tags based on the text they have
         * entered or an item they have selected.
         *
         * <h2 class="line">Examples</h2>
         *
         * <span class="autocomplete icon-search" data-init="autocomplete" data-multiple="true">
         *   <input type="text" name="name1" placeholder="Search">
         *   <button class="autocomplete-suggestion-toggle"></button>
         *   <ul class="autocomplete-suggestions selectlist">
         *     <li data-value="af">Afghanistan</li>
         *     <li data-value="al">Albania</li>
         *     <li data-value="bs">Bahamas</li>
         *     <li data-value="bh">Bahrain</li>
         *     <li data-value="kh">Cambodia</li>
         *     <li data-value="cm">Cameroon</li>
         *     <li data-value="dk">Denmark</li>
         *     <li data-value="dj">Djibouti</li>
         *     <li data-value="ec">Ecuador</li>
         *     <li data-value="eg">Egypt</li>
         *   </ul>
         * </span>
         *
         * @example
         * <caption>Instantiate with Class</caption>
         * var selectlist = new CUI.Autocomplete({
         *   element: '#myAutocomplete'
         *   mode: 'contains',
         *   ignorecase: false,
         *   delay: 400,
         *   multiple: true,
         *   selectlistConfig: {
         *     ...
         *   },
         *   tagConfig: {
         *     ...
         *   }
         * });
         *
         * @example
         * <caption>Instantiate with jQuery</caption>
         * $('#myAutocomplete').autocomplete({
         *   mode: 'contains',
         *   ignorecase: false,
         *   delay: 400,
         *   multiple: true,
         *   selectlistConfig: {
         *     ...
         *   },
         *   tagConfig: {
         *     ...
         *   }
         * });
         *
         * @example
         * <caption>Data API: Instantiate, set options</caption>
&lt;span class=&quot;autocomplete icon-search&quot; data-init=&quot;autocomplete&quot;
    data-mode=&quot;contains&quot; data-ignorecase=&quot;false&quot;
    data-delay=&quot;400&quot; data-multiple=&quot;true&quot;&gt;
  &lt;input type=&quot;text&quot; name=&quot;name1&quot; placeholder=&quot;Search&quot;&gt;
  &lt;button class=&quot;autocomplete-suggestion-toggle&quot;&gt;&lt;/button&gt;
  &lt;ul class=&quot;autocomplete-suggestions selectlist&quot;&gt;
    &lt;li data-value=&quot;af&quot;&gt;Afghanistan&lt;/li&gt;
    &lt;li data-value=&quot;al&quot;&gt;Albania&lt;/li&gt;
    ...
  &lt;/ul&gt;
&lt;/span&gt;
         *
         *
         * @description Creates a new select
         * @constructs
         *
         * @param {Object} options Component options
         * @param {Mixed} options.element jQuery selector or DOM element to use
         * for the autocomplete element.
         * @param {String} [options.mode=starts] Search mode for
         * filtering on the client. Possible values are "starts" or "contains".
         * This has no effect if filtering is occurring remotely.
         * @param {Boolean} [options.ignorecase=true] Whether filtering on the
         * client should be case insensitive. This has no effect if filtering
         * is occurring remotely.
         * @param {Number} [options.delay=500] Amount of time, in milliseconds,
         * to wait after typing a character before a filter operation is
         * triggered.
         * @param {Boolean} [options.multiple=false] Allows multiple items
         * to be selected. Each item selection generates a tag.
         * @param {Object} [options.selectlistConfig] A configuration object
         * that is passed through to the select list. See {@link CUI.SelectList}
         * for more information.
         * @param {Object} [options.tagConfig] A configuration object
         * that is passed through to the tag list. See {@link CUI.TagList}
         * for more information.
         */
        construct: function () {
            // find elements
            this._input = this.options.predefine.input || this.$element.children('input');
            this._selectlist = this.options.predefine.selectlist || this.$element.find('.selectlist');
            this._tags = this.options.predefine.tags || this.$element.find('.taglist');
            this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.autocomplete-suggestion-toggle');

            // apply
            this.applyOptions();

            // accessibility
            this._makeAccessible();

            this._initTypeahead();
            this._setOptionListeners();
        },

        defaults: {
            mode: 'starts', // filter mode ['starts', 'contains']
            ignorecase: true,
            delay: 200,
            multiple: false,

            selectlistConfig: null,
            tagConfig: null,

            // @warning do not use this
            // 
            // future feature
            // allows to bypass element search and pass elements
            // will allow to evalute this solution
            predefine: {}
        },

        applyOptions: function () {
            this._setTags();
            this._setSelectlist();
            this._setSuggestions();
        },

        /**
         * The current query. Used as a basis for determining when the text
         * input value changes.
         * @private
         */
        _query: null,

        /**
         * Sets up listeners for option changes.
         * @private
         */
        _setOptionListeners: function() {
            this.on('change:multiple', this._setTags.bind(this));
        },

        /**
         * initializes the select list widget
         * @private
         */
        _setSelectlist: function () {
            // if the element is not there, create it
            if (this._selectlist.length === 0) {
                this._selectlist = $('<ul/>', {
                    'id': CUI.util.uuid(),
                    'class': 'selectlist'
                }).appendTo(this.$element);
            } else if (!this._selectlist.attr('id')) {
                this._selectlist.attr('id', CUI.util.uuid());
            }

            this._selectlist.selectList($.extend({
                relatedElement: this._input,
                autofocus: false,
                autohide: true
            }, this.options.selectlistConfig || {}));

            this._selectListWidget = this._selectlist.data('selectList');

            this._selectlist
                // receive the value from the list
                .on('selected.autocomplete', this._handleSelected.bind(this))
                .on('hide.autocomplete', this._handleSelectListHide.bind(this));
        },

        /**
         * initializes the tags for multiple options
         * @private
         */
        _setTags: function () {
            if (this.options.multiple && !this._tagList) {
                // if the element is not there, create it
                if (this._tags.length === 0) {
                    this._tags = $('<ul/>', {
                        'class': 'taglist'
                    }).appendTo(this.$element);
                }

                this._tags.tagList(this.options.tagConfig || {});
                this._tagList = this._tags.data('tagList');

                this._input.on('keydown.autocomplete-preventsubmit', function(event) {
                    if (event.which === 13) { // enter
                        // Prevent it from submitting a parent form.
                        event.preventDefault();
                        return false;
                    }
                }).on('keyup.autocomplete-addtag', this._addTag.bind(this));

            } else if (!this.options.multiple && this._tagList) {
                this._tags.remove();
                this._tags = null;
                this._tagList = null;
                this._input.off('keydown.autocomplete-preventsubmit ' +
                        'keyup.autocomplete-addtag');
            }
        },

        /**
         * initializes the typeahead functionality
         * @private
         */
        _initTypeahead: function () {
            var self = this,
                timeout;

            this._query = this._input.val();

            var timeoutLoadFunc = function(event) {
                var value = self._input.val();

                // This check prevents a query from occurring due to
                // events that haven't changed the input value.
                // A blacklist of keycodes is an option
                // but is susceptible to fringe cases.
                if (value !== self._query) {
                    self._query = value;
                    self.showSuggestions(
                        self._input.val(),
                        false,
                        self._selectListWidget);
                }
            };

            this._input.on('keyup.autocomplete cut.autocomplete ' +
                'paste.autocomplete', function(event) {

                // debounce
                if (timeout) {
                  clearTimeout(timeout);
                }

                timeout = setTimeout(timeoutLoadFunc, self.options.delay);
            });
        },

        /**
         * sets the suggestion button
         * @private
         */
        _setSuggestions: function () {
            var self = this;

            // if the button to trigger the suggestion box is not there,
            // then we add it
            if (this._suggestionsBtn.length) {
                // By default <button/> is type="submit" but we don't want
                // this submitting any parent form. Using prop() doesn't
                // work for Safari in this case.
                this._suggestionsBtn.attr('type', 'button');

                // handler to open suggestion box
                this._suggestionsBtn.fipo('tap.autocomplete',
                        'click.autocomplete', function (event) {
                    if (!self._selectListWidget.get('visible')) {
                        self.showSuggestions(
                            self._input.val(),
                            true,
                            self._selectListWidget);

                        // If the event were to bubble to the document the
                        // select list would be hidden.
                        event.stopPropagation();
                    }
                }).finger('click.autocomplete', false);

                // add class to input to to increase padding right for the button
                this._input.addClass('autocomplete-has-suggestion-btn');
            }
        },

        /**
         * adds some accessibility attributes and features
         * http://www.w3.org/WAI/PF/aria/roles#combobox
         * http://www.w3.org/WAI/PF/aria/states_and_properties#aria-autocomplete
         * @private
         */
        _makeAccessible: function () {
            this.$element.attr({
                'role': 'combobox',
                'aria-multiselectable': this.options.multiple,
                'aria-autocomplete': this.options.typeahead ? 'list' : '',
                'aria-owns': this._selectlist.attr('id') || ''
            });

            this._input.add(this._suggestionsBtn).on('keydown', function(event) {
                switch (event.which) {
                    case 40: // down arrow
                        this._selectListWidget.show();
                        this._selectlist
                            .find('[role="option"]:visible')
                            .first()
                            .focus();
                        event.preventDefault();
                        break;
                }
            }.bind(this));
        },

        /**
         * adds a new tag with the current input value
         * @private
         */
        _addTag: function (event) {
            if (event.which !== 13) {
                return;
            }

            this._tagList.addItem(this._input.val());
            this.clear();
            this._selectListWidget.hide();
        },

        /**
         * @private
         * @param  {jQuery.Event} event
         */
        _handleSelected: function (event) {
            this._selectListWidget.hide();
            
            if (this.options.multiple) {
                this._tagList.addItem({
                  display: event.displayedValue,
                  value: event.selectedValue
                });
                this.clear();
            } else {
                this._input.val(event.displayedValue);
                this._query = event.displayedValue;
            }

            this._input.trigger('focus');
        },

        /**
         * Prevents the select list from hiding then the text input has gained
         * focus and contains a value.
         * @private
         */
        _handleSelectListHide: function(event) {
            if (this._input.is(document.activeElement) &&
                    this._input.val().length) {
                event.preventDefault();
            }
        },

        /**
         * this function is triggered when a typeahead request needs to be done
         * override this function to acheive a custom handling on the client
         * 
         * @fires Autocomplete#query
         * @param {String} val null if all values need to be shown
         * @param {Boolean} fromToggle Whether the request was triggered
         * by the user clicking the suggestion toggle button.
         * @param {CUI.SelectList} selectlist instance to control the popup
         */
        showSuggestions: function (val, fromToggle, selectlist) { // selectlist argument is passed for custom implementations
            // fire event to allow notifications
            this.$element.trigger($.Event('query', {
                value: val
            }));

            if (val.length || fromToggle) {
                // actually handle the filter
                if (this._selectListWidget.options.type === 'static') {
                    this._handleStaticFilter(val);
                } else if (this._selectListWidget.options.type === 'dynamic') {
                    this._handleDynamicFilter(val);
                }

                this._selectListWidget.show();
            } else { // No input text and the user didn't click the toggle.
                this._selectListWidget.hide();
            }
        },

        /**
         * handles a static list filter (type == static) based on the defined mode
         * @private
         * @param  {jQuery.Event} event
         */
        _handleStaticFilter: function (val) {
            var self = this,
                entries = this._selectlist.find('[role="option"]'); // maybe received by the selectlist widget

            if (val) {
                entries.each(function (i, e) {
                    var entry = $(e),
                        display = entry.text(),
                        found;

                    if (self.options.ignorecase) {
                        display = display.toLowerCase();
                        val = val.toLowerCase();
                    }

                    // performance "starts": http://jsperf.com/js-startswith/6
                    // performance "contains": http://jsperf.com/string-compare-perf-test
                    found = self.options.mode === 'starts' ? display.lastIndexOf(val, 0) === 0 :
                        self.options.mode === 'contains' ? display.search(val) !== -1:
                        false;

                    entry.toggle(found);
                });
            } else { // show all
                entries.show();
            }

        },

        /**
         * handles a static list filter (type == static) based on the defined mode
         * @private
         * @param  {jQuery.Event} event
         */
        _handleDynamicFilter: function (val) {
            this._selectListWidget.set('dataadditional', {
                query: val
            });
            this._selectListWidget.triggerLoadData(true);
        },

        /**
         * clears the autocomplete input field
         */
        clear: function () {
          this._input.val('');
          this._query = '';
        },

        /**
         * disables the autocomplete
         */
        disable: function () {
            this.$element.addClass('disabled');
            this.$element.attr('aria-disabled', true);
            this._input.prop('disabled', true);
            this._suggestionsBtn.prop('disabled', true);
        },

        /**
         * enables the autocomplete
         */
        enable: function () {
            this.$element.removeClass('disabled');
            this.$element.attr('aria-disabled', false);
            this._input.prop('disabled', false);
            this._suggestionsBtn.prop('disabled', false);
        }
    });

    CUI.util.plugClass(CUI.Autocomplete);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (e) {
            $('[data-init~=autocomplete]', e.target).autocomplete();
        });
    }

}(jQuery, this));
