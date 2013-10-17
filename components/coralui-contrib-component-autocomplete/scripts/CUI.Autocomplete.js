(function ($, window, undefined) {
    CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
        toString: 'Autocomplete',

        extend: CUI.Widget,

        defaults: {
            mode: 'starts', // filter mode ['starts', 'contains']
            delay: 500,
            showtypeahead: true,
            showsuggestions: false,
            //showclearbutton: false,
            showtags: false,

            selectlistConfig: null,
            tagConfig: null,

            // future feature 3.0, 
            // allows to bypass element search and pass elements
            predefine: {}
        },

        construct: function () {
            var self = this;

            // find elements
            this._input = this.options.predefine.input || this.$element.children('input');
            this._selectlist = this.options.predefine.selectlist || this.$element.find('.selectlist');
            this._tags = this.options.predefine.tags || this.$element.find('.taglist');
            this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.autocomplete-suggestion-toggle');


            // apply
            this.applyOptions();
        },

        applyOptions: function () {
            //this._setClearButton();

            this._setTags();
            this._setSelectlist();
            this._setTypeahead();
            this._setSuggestions();
        },

        /**
         * initialize the clear button
         * @private
         */
        /*_setClearButton: function () {
            var self = this;

            if (this.options.showclearbutton) {

                // create button if not there
                if (!this._clearBtn) {
                    this._clearBtn = $('<button/>', {
                        'class': 'autocomplete-clear icon-close'
                    }).fipo('tap', 'click', function (event) {
                        event.preventDefault();

                        self.clear();
                        self._input.focus();
                    }).finger('click', false);
                }

                this._clearBtn.appendTo(this.$element);
                this._input.on('keyup.autocomplete-clearbtn', this._refreshClear.bind(this));
                this._refreshClear();
            } else {
                if (this._clearBtn) {
                    this._clearBtn.detach();
                }
                this._input.off('keyup.autocomplete-clearbtn');
            }
        },*/

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
            if (this.options.showtags) {

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
                self.handleInput(self._input.val());
            }

            if (this.options.showtypeahead) {

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
                    self.handleInput();
                }).finger('click', false);

                // add class to input to to increase padding right for the button
                this._input.addClass('autocomplete-has-suggestion-btn');
            } else {
                this._suggestionsBtn.remove();
                this._input.removeClass('autocomplete-has-suggestion-btn');
            }
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

        _handleSelected: function (event) {
            this._selectListWidget.hide();
            
            if (this.options.showtags) {
                this._tagList.addItem(event.displayedValue);
            } else {
                this._input.val(event.displayedValue);
            }

            this._input.trigger('focus');
        },

        /**
         * @fires Autocomplete#query
         * @param  {String} val null if all values need to be shown
         * @return {[type]}     [description]
         */
        handleInput: function (val) {
            // fire event to allow notifications
            this.$element.trigger($.Event('query', {
                value: val
            }));

            // actually handle the filter
            if (this._selectListWidget.options.type === 'static') {
                this._handleStaticFilter();
            } else if (this._selectListWidget.options.type === 'dynamic') {
                this._handleDynamicFilter();
            }

            this._selectListWidget.toggleVisibility();
        },

        /*_refreshClear: function () {
            this._clearBtn.toggleClass('hide', this._input.val().length === 0);
        },*/

        /**
         * handles a static list filter (type == static) based on the defined mode
         * @param  {jQuery.Event} event
         */
        _handleStaticFilter: function (event) {
            this._selectList.find('[role="option"]').each(function (i, e) {

            });
        },

        /**
         * handles a static list filter (type == static) based on the defined mode
         * @param  {jQuery.Event} event
         */
        _handleDynamicFilter: function (val) {
            this._selectListWidget.set('dataadditional', {
                query: val
            });
            this._selectListWidget.show();
            this._selectListWidget.triggerLoadData(true);
        },

        /**
         * clears the autocomplete input field
         */
        /*clear: function () {
            this._input.val('');
            this._refreshClear();
        },*/

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
