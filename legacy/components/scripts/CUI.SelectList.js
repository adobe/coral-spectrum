(function ($, window, undefined) {
    CUI.SelectList = new Class(/** @lends CUI.SelectList# */{
        toString: 'SelectList',

        extend: CUI.Widget,

        defaults: {
            mode: 'static', // dynamic
            position: 'bottom',
            values: [] // ["Apples", "Pears", "Bananas", "Strawberries"]
        },

        construct: function (options) {
            this.applyOptions();

            // accessibility
            this._makeAccessible();
        },

        applyOptions: function () {
            if (this.options.values.length > 0) {
                this._setOptions();
            }
        },

        _setOptions: function () {

        },

        _makeAccessible: function () {

        },

        show: function () {
            this.$element.show();
        },

        hide: function () {
            this.$element.hide();
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
