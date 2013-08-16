(function ($, window, undefined) {
    CUI.Select = new Class(/** @lends CUI.Select# */{
        toString: 'Select',

        extend: CUI.Widget,

        defaults: {
            type: 'static',
            nativewidget: false,
            nativewidgetonmobile: true,
            multiple: false,
            selectlistConfig: null
        },

        construct: function () {
            var self = this;

            // find elements
            this._button = this.$element.children('input[type=button]');
            this._select = this.$element.children('select');
            this._selectList = this.$element.children('.selectlist');
            this._tagList = this.$element.children('.taglist');
            this._valueInput = this.$element.children('input[type=hidden]');

            // apply
            this.applyOptions();
        },

        applyOptions: function () {
            // there is a select given so read the "native" config options
            if (this._select.length > 0) {
                // if multiple set multiple
                if (this._select.prop('multiple')) {
                    this.options.multiple = true;
                }
            }
            

            if (this.options.nativewidget) {
                this._setNativeWidget();
            } else {
                this._setSelectList();
            }
        },

        /**
         * this option is mainly supposed to be used on mobile
         * and will just work with static lists
         * @private
         * @param {Boolean} [force]
         */
        _setNativeWidget: function (force) {
            var self = this;

            if (this.options.nativewidget || force) {
                this._select.css({
                    display: 'block',
                    width: this._button.outerWidth(),
                    height: this._button.outerHeight(),
                    opacity: 0.01
                });

                this._select.position({
                    my: 'left top',
                    at: 'left top',
                    of: this._button
                });

                // if it is in single selection mode, 
                // then the btn receives the label of the selected item
                if (!this.options.multiple) {
                    this._select.on('change.dropdown', function (event) {
                        self._button.val(self._select.children('option:selected').text());
                    });
                }
            } else {
                this._select.off('change.dropdown');
            }
        },

        _parseMarkup: function () {
            var self = this,
                optgroup = this._select.children('optgroup');

            function parseGroup(parent, dest) {
                parent.children('option').each(function (i, e) {
                    var opt = $(e);

                    $('<li/>', {
                        'data-value': opt.val(),
                        'text': opt.text()
                    }).appendTo(dest);
                });
            }

            // optgroups are part of the select -> different markup
            if (optgroup.length > 0) {
                optgroup.each(function (i, e) {
                    var group = $(e),
                        entry = $('<li/>', {
                                'class': 'optgroup'
                            }).append($('<span/>', {
                                'text': group.attr('label')
                            }));

                    parseGroup(group, $('<ul/>').appendTo(entry));

                    self._selectList.append(entry);
                });
            } else { // flat select list
                parseGroup(this._select, this._selectList);
            }
        },

        /**
         * [_setSelectList description]
         */
        _setSelectList: function () {
            var self = this,
                type = 'static';

            // if the element is not there, create it
            if (this._selectList.length === 0) {
                this._selectList = $('<ul/>', {
                    'class': 'selectlist'
                }).appendTo(this.$element);
            }

            // read values from markup
            if (this._select.length > 0) {
                this._parseMarkup();
            } else { // if no <select> wa found then a dynamic list is expected
                type = 'dynamic';
            }

            this._selectList.selectList($.extend({
                relatedElement: this._button,
                type: type
            }, this.options.selectlistConfig || {}));

            this._selectListWidget = this._selectList.data('selectList');

            // handler to open usggestion box
            this._button.fipo('tap', 'click', function (event) {
                event.preventDefault();
                self._toggleList();
            }).finger('click', false);

            if (this.options.multiple) {
                // if the element is not there, create it
                if (this._tagList.length === 0) {
                    this._tagList = $('<ol/>', {
                        'class': 'taglist'
                    }).appendTo(this.$element);
                }

                this._tagList.tagList(this.options.tagConfig || {});

                this._tagListWidget = this._tagList.data('tagList');
            }


            this._selectList
                // receive the value from the list
                .on('selected.dropdown', this._handleSelected.bind(this))
                // handle open/hide for the button
                .on('show.dropdown hide.dropdown', function (event) {
                    self._button.toggleClass('active', event.type === 'show');
                });
        },

        _handleSelected: function (event) {
            // set select value
            this._select.val(event.selectedValue);

            if (this.options.multiple) {
                this._tagListWidget.addItem({
                    value: event.selectedValue,
                    display: event.displayedValue
                });
            } else {
                // set the button label
                this._button.val(event.displayedValue);
                // in case it is dynamic a value input should be existing
                this._valueInput.val(event.selectedValue);
            }

            this._button.trigger('focus');
        },

        _toggleList: function () {
            this._selectListWidget.toggleVisibility();
        }
    });

    CUI.util.plugClass(CUI.Select);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (e) {
            $('[data-init~=select]', e.target).select();
        });
    }

}(jQuery, this));
