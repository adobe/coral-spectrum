(function ($, window, undefined) {
    CUI.DropDown2 = new Class(/** @lends CUI.DropDown2# */{
        toString: 'DropDown2',

        extend: CUI.Widget,

        defaults: {
            selectlistConfig: null
        },

        construct: function () {
            var self = this;

            // find elements
            this._button = this.$element.children('input[type=button]');
            this._select = this.$element.children('select');
            this._selectList = this.$element.children('selectlist');

            // apply
            this.applyOptions();
        },

        applyOptions: function () {
            this._setSelectList();
        },

        _setSelectList: function () {
            var self = this,
                values = [];

            // if the element is not there, create it
            if (this._selectList.length === 0) {
                this._selectList = $('<ul/>', {
                    'class': 'selectlist'
                }).appendTo(this.$element);
            }

            this._selectList.selectList($.extend({
                relatedElement: this._button
            }, this.options.selectlistConfig || {}));

            this._selectListWidget = this._selectList.data('selectList');

            // if a <select> is given we are handling a static list
            // otherwise it is dynamic
            if (this._select.length > 0) {
                // loop over all elements and add to array
                this._select.children('option').each(function (i, e) {
                    var opt = $(e);

                    values.push({
                        display: opt.text(),
                        value: opt.val()
                    });
                });

                this._selectListWidget.set('values', values);

            } else {
                this._selectListWidget.set('type', 'dynamic');
            }

            // handler to open usggestion box
            this._button.fipo('tap', 'click', function (event) {
                event.preventDefault();
                self._toggleList();
            }).finger('click', false);


            this._selectList
                // receive the value from the list
                .on('selected.dropdown', this._handleSelected.bind(this))
                // handle open/hide for the button
                .on('show.dropdown hide.dropdown', function (event) {
                    self._button.toggleClass('active', event.type === 'show');
                });
        },

        _handleSelected: function (event) {
            this._button.val(event.displayedValue);
            this._select.val(event.selectedValue);

            this._button.trigger('focus');
        },

        _toggleList: function () {
            this._selectListWidget.toggleVisibility();
        }
    });

    CUI.util.plugClass(CUI.DropDown2);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (e) {
            $('[data-init~=dropdown2]', e.target).dropDown2();
        });
    }

}(jQuery, this));
