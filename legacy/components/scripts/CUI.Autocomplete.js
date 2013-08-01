(function ($, window, undefined) {
    CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
        toString: 'Autocomplete',

        extend: CUI.Widget,

        defaults: {
            showClearButton: true,
            showSuggestions: true,
            showTags: true
        },

        construct: function () {
            var self = this;

            // find elements
            this._input = this.$element.children('input');
            this._suggestions = this.$element.find('.selectlist');
            this._tags = this.$element.find('.taglist');

            // create additional objects
            this._clearBtn = $('<button/>', {
                'class': 'autocomplete-clear icon-close'
            }).fipo('tap', 'click', function (event) {
                event.preventDefault();

                self.clear();
                self._input.focus();
            });

            // apply
            this.applyOptions(); 
        },

        applyOptions: function () {
            this._setClearButton();
            this._setSuggestions();
            this._setTags();
        },

        _setClearButton: function () {
            if (this.options.showClearButton) {

                this._clearBtn.appendTo(this.$element);
                this._input.on('keyup.clearBtn', this._refreshClear.bind(this));
                this._refreshClear();

            } else {

                this._clearBtn.detach();
                this._input.off('keyup.clearBtn');

            }
        },

        _setSuggestions: function () {
            if (this.options.showSuggestions) {

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

                // TODO add opening link
            } else {
                // remove opening link
            }
        },

        _setTags: function () {
            if (this.options.showTags) {

                // if the element is not there, create it
                if (this._tags.length === 0) {
                    this._tags = $('<ul/>', {
                        'class': 'taglist'
                    }).appendTo(this.$element);
                }

                this._tagList = new CUI.TagList({
                    element: this._tags
                });

                // TODO add link
            } else {
                // remove tag view
                // remove link
            }
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
