(function ($, window, undefined) {
    var storageKey = 'cui-state',
        store = {},
        loaded = false;

    /**
     * state object to enable UI page refresh stable states
     * TODO:
     *  - all states are global, lack of an auto restore mode which is aware of the URL
     *  - client side only (localStorage)
     *  - lack of an abstraction layer for the client side storage
     * @type {Object}
     */
    CUI.util.state = {

        /*saveForm: function (form, elem) {

        },*/

        /**
         * Persist attributes of a DOM node
         *
         * @param {String} selector
         * @param {String|Array} [attribute] single attribute or list of attributes to be saved. If null then all attributes will be saved
         * @param {Boolean} [autorestore]
         */
        save: function (selector, attribute, autorestore) {
            var elem = $(selector),
                saveLoop = function (i, attr) {
                    store.global[selector] = store.global[selector] || {};
                    store.global[selector][attr] = store.global[selector][attr] || {};
                    store.global[selector][attr].val = elem.attr(attr);
                    store.global[selector][attr].autorestore = autorestore || false;
                };

            
            if (attribute) { // save single or multiple attributes
                if ($.isArray(attribute)) { // multiple values to save
                    $.each(attribute, saveLoop);
                } else { // save all attributes
                    saveLoop(0, attribute);
                }
            } else { // save all attributes
                // TODO
                // not supported yet because the browser implementation of Node.attributes is a mess
                // https://developer.mozilla.org/en-US/docs/DOM/Node.attributes
            }

            localStorage.setItem(storageKey, JSON.stringify(store));
        },

        /**
         *
         * @param {String} [selector]
         * @param {Function} [filter] filter function for the attributes of the given selector
         */
        restore: function (selector, filter) {
            var check = filter || function () {
                    return true;
                },
                sel,
                elem,
                selectorLoop = function (item, noop) {
                    sel = item;
                    elem = $(sel);
                    $.each(store.global[sel], restoreLoop);
                },
                restoreLoop = function (attr, obj) {
                    if (check(sel, attr, obj)) {
                        elem.attr(attr, obj.val);
                    }
                };

            if (!loaded) {
                loaded = CUI.util.state.load();
            }

            
            if (selector) { // restore single selector
                selectorLoop(selector);
            } else { // restore everything
                $.each(store.global, selectorLoop);
            }
        },

        load: function () {
            var val = localStorage.getItem(storageKey);

            store = val ? JSON.parse(val) : {
                global: {}
            };

            return true;
        }
    };

    $(document).ready(function () {
        CUI.util.state.restore(null, function (selector, attr, val) {
            if (val.autorestore) {
                return true;
            }

            return false;
        });
    });
}(jQuery, this));