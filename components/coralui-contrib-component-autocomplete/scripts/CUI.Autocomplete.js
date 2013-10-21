(function ($, window, undefined) {
    CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
        toString: 'Autocomplete',

        extend: CUI.Widget,

        /**
         * @extends CUI.Widget
         * @classdesc 
         *
         * <h2 class="line">Examples</h2>
         *
         * 
         *
         * @example
         * <caption>Instantiate with Class</caption>
         * var selectlist = new CUI.Autocomplete({
         *     element: '#myAutocomplete'
         * });
         *
         * @example
         * <caption>Instantiate with jQuery</caption>
         * $('#myAutocomplete').autocomplete({
         *
         * });
         *
         * @example
         * <caption>Data API: Instantiate, set options</caption>
         *
         * 
         *
         * @description Creates a new select
         * @constructs
         *
         * @param {Object} options Component options
         * @param {Mixed} options.element jQuery selector or DOM element to use for panel
         * @param {String} [options.mode=starts] search mode for static list, either "starts" or "contains"
         * @param {Boolean} [options.ignorecase=true] case sensitivity parameter for the static search
         * @param {Number} [options.delay=500] typing delay in ms before a filter operation is triggered
         * @param {Boolean} [option.typeahead=true] triggers filtering while typing
         * @param {Boolean} [options.showsuggestions=false] enables a suggestion button to show all available options 
         * @param {Boolean} [options.multiple=false] allows multiple selections
         * 
         */
        construct: function () {
            var self = this;

            // find elements
            this._input = this.options.predefine.input || this.$element.children('input');
            this._selectlist = this.options.predefine.selectlist || this.$element.find('.selectlist');
            this._tags = this.options.predefine.tags || this.$element.find('.taglist');
            this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.autocomplete-suggestion-toggle');

            // apply
            this.applyOptions();

            // accessibility
            this._makeAccessible();
        },

        defaults: {
            mode: 'contains', // filter mode ['starts', 'contains']
            ignorecase: true,
            delay: 500,
            typeahead: true,
            showsuggestions: false,
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
            //this._setClearButton();

            this._setTags();
            this._setSelectlist();
            this._setTypeahead();
            this._setSuggestions();
        },

        /**
         * initializes the select list widget
         * @private
         */
        _setSelectlist: function () {
            var self = this;

            // if the element is not there, create it
            if (this._selectlist.length === 0) {
                this._selectlist = $('<ul/>', {
                    'class': 'selectlist'
                }).appendTo(this.$element);
            }

            this._selectlist.selectList($.extend({
                relatedElement: this._input,
                autofocus: false,
                autohide: false
            }, this.options.selectlistConfig || {}));

            this._selectListWidget = this._selectlist.data('selectList');

            this._selectlist
                // receive the value from the list
                .on('selected.autcomplete', this._handleSelected.bind(this));
        },

        /**
         * initializes the tags for multiple options
         * @private
         */
        _setTags: function () {
            if (this.options.multiple) {

                // if the element is not there, create it
                if (this._tags.length === 0) {
                    this._tags = $('<ul/>', {
                        'class': 'taglist'
                    }).appendTo(this.$element);
                }

                this._tags.tagList(this.options.tagConfig || {});
                this._tagList = this._tags.data('tagList');

                this._input.on('keyup.autocomplete-addtag', this._addTag.bind(this));

            } else {
                this._input.off('keyup.autocomplete-addtag');
            }
        },

        /**
         * initializes the typeahead functionality
         * @private
         */
        _setTypeahead: function () {
            var self = this,
                timeout;

            function timeoutLoadFunc() {
                self.handleInput(self._input.val(), self._selectListWidget);
            }

            if (this.options.typeahead) {

                // bind keyboard input listening
                this._input.on('keyup.autocomplete', function (event) {
                    // debounce
                    if (timeout) {
                        clearTimeout(timeout);
                    }

                    timeout = setTimeout(timeoutLoadFunc, self.options.delay);
                });

            } else {
                this._input.off('keyup.autocomplete');
            }
        },

        /**
         * sets the suggestion button
         * @private
         */
        _setSuggestions: function () {
            var self = this;

            if (this.options.showsuggestions) {

                // if the button to trigger the suggestion box is not there, 
                // then we add it
                if (this._suggestionsBtn.length === 0) {

                    this._suggestionsBtn = $('<button/>', {
                        'class': 'autocomplete-suggestion-toggle'
                    });

                    this._suggestionsBtn.appendTo(this.$element);
                }

                // handler to open usggestion box
                this._suggestionsBtn.fipo('tap', 'click', function (event) {
                    event.preventDefault();
                    
                    if (self._selectListWidget.options.visible) { // list is already open -> close it
                        self._selectListWidget.hide();
                    } else {
                        self.handleInput(null, self._selectListWidget);
                    }
                    
                }).finger('click', false);

                // add class to input to to increase padding right for the button
                this._input.addClass('autocomplete-has-suggestion-btn');
            } else {
                this._suggestionsBtn.remove();
                this._input.removeClass('autocomplete-has-suggestion-btn');
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

            // keyboard handling
            this.$element.on('keydown', 'li[role="option"]', function (event) {
                // enables keyboard support

                var elem = $(event.currentTarget);

                switch (event.which) {
                    case 13: // enter
                        // choose first element
                        break;
                    case 27: //esc
                        // close suggestions
                        break;
                    case 40: //down arrow
                        // focus first element
                        break;
                }
            });
        },

        /**
         * adds a new tag when pressed button was Enter
         * @private
         * @param {jQuery.Event} event
         */
        _addTag: function (event) {
            if (event.which !== 13) {
                return;
            }

            this._tagList.addItem(this._input.val());
            this.clear();
        },

        /**
         * @private
         * @param  {jQuery.Event} event
         */
        _handleSelected: function (event) {
            this._selectListWidget.hide();
            
            if (this.options.multiple) {
                this._tagList.addItem(event.displayedValue);
            } else {
                this._input.val(event.displayedValue);
            }

            this._input.trigger('focus');
        },

        /**
         * this function is triggered when a typeahead request needs to be done
         * override this function to acheive a custom handling on the client
         * 
         * @fires Autocomplete#query
         * @param  {String} val null if all values need to be shown
         * @param {CUI.SelectList} selectlist instance to control the popup
         */
        handleInput: function (val, selectlist) { // selectlist argument is passed for custom implementations
            // fire event to allow notifications
            this.$element.trigger($.Event('query', {
                value: val
            }));

            // actually handle the filter
            if (this._selectListWidget.options.type === 'static') {
                this._handleStaticFilter(val);
            } else if (this._selectListWidget.options.type === 'dynamic') {
                this._handleDynamicFilter(val);
            }

            this._selectListWidget.show();
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
