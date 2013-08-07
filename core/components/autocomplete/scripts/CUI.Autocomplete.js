(function ($, window, undefined) {
    CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
        toString: 'Autocomplete',

        extend: CUI.Widget,

        defaults: {
            showsuggestions: true,
            showclearbutton: true,
            showtags: true
        },

        construct: function () {
            var self = this;

            // find elements
            this._input = this.$element.children('input');
            this._suggestions = this.$element.find('.autocomplete-suggestions');
            this._suggestionsBtn = this.$element.find('.autocomplete-suggestion-toggle');
            this._tags = this.$element.find('.autocomplete-tags');

            // create additional objects
            this._clearBtn = $('<button/>', {
                'class': 'autocomplete-clear icon-close'
            }).fipo('tap', 'click', function (event) {
                event.preventDefault();

                self.clear();
                self._input.focus();
            }).finger('click', false);

            // apply
            this.applyOptions();
        },

        applyOptions: function () {
            this._setClearButton();
            this._setSuggestions();
            this._setTags();
        },

        _setClearButton: function () {
            if (this.options.showclearbutton) {
                this._clearBtn.appendTo(this.$element);
                this._input.on('keyup.autocomplete-clearbtn', this._refreshClear.bind(this));
                this._refreshClear();
            } else {
                this._clearBtn.detach();
                this._input.off('keyup.autocomplete-clearbtn');
            }
        },

        _setSuggestions: function () {
            var self = this;

            if (this.options.showsuggestions) {

                // if the element is not there, create it
                if (this._suggestions.length === 0) {
                    this._suggestions = $('<ul/>', {
                        'class': 'selectlist'
                    }).appendTo(this.$element);
                }

                this._selectList = new CUI.SelectList({
                    element: this._suggestions,
                    relatedElement: this._input
                });

                // if the button to trigger the suggestion box is not there, 
                // then we add it
                if (this._suggestionsBtn.length === 0) {

                    this._suggestionsBtn = $('<button/>', {
                        'class': 'autocomplete-suggestion-toggle icon-chevrondown'
                    });

                    this._suggestionsBtn.appendTo(this.$element);
                }

                // handler to open usggestion box
                this._suggestionsBtn.fipo('tap', 'click', function (event) {
                    event.preventDefault();
                    self._toggleSuggestions();
                }).finger('click', false);

                // receive the value from the list
                this._suggestions.on('selected.autcomplete-suggestion-selected', this._handleSuggestionSelected.bind(this));

                // add class to input to to increase padding right for the button
                this._input.addClass('autocomplete-has-suggestion-btn');
            } else {
                this._suggestionsBtn.detach();
                this._suggestions.off('selected.autcomplete-suggestion-selected');
                this._input.removeClass('autocomplete-has-suggestion-btn');
            }
        },

        _setTags: function () {
            if (this.options.showtags) {

                // if the element is not there, create it
                if (this._tags.length === 0) {
                    this._tags = $('<ul/>', {
                        'class': 'taglist'
                    }).appendTo(this.$element);
                }

                this._tagList = new CUI.TagList({
                    element: this._tags
                });

                this._input.on('keyup.autocomplete-addtag', this._addTag.bind(this));

            } else {
                this._input.off('keyup.autocomplete-addtag');
            }
        },

        _addTag: function (event) {
            if (event.which !== 13) {
                return;
            }

            this._tagList.addItem(this._input.val());
            this.clear();
        },

        _handleSuggestionSelected: function (event) {
            this._input.val(event.displayedValue);
        },

        _toggleSuggestions: function () {
            this._selectList.toggleVisibility();
        },

        _refreshClear: function () {
            this._clearBtn.toggleClass('hide', this._input.val().length === 0);
        },

        clear: function () {
            this._input.val('');
            this._refreshClear();
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
