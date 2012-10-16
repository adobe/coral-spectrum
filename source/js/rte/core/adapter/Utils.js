/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2012 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

CUI.rte.Utils = function() {

    var hooks = null;
    var getHooks = function() {
        if (!hooks) {
            hooks = new CUI.rte.Hooks();
        }
        return hooks;
    };

    var commons = {

        scope: function(fn, scope) {
            return function() {
                fn.apply(scope, arguments);
            };
        },

        defer: function(fn, ms, scope, args) {
            var callFn = fn;
            if (scope) {
                callFn = function() {
                    if (args) {
                        fn.apply(scope, args);
                    } else {
                        fn.call(scope);
                    }
                };
            } else if (args) {
                callFn = function() {
                    fn.apply(scope, args);
                }
            }
            return window.setTimeout(callFn, ms);
        },

        htmlEncode: function(str) {
            if (str) {
                str = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;");
            }
            return str;
        },

        htmlDecode: function(str) {
            if (str) {
                str = str.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                        .replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
            }
            return str;
        },

        stripTags: function(str) {
            if (str) {
                str = str.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "");
            }
            return str;
        },

        i18n: function(str, values) {
            // TODO replace with correct internationalization when available ...
            if (values) {
                if (CUI.rte.Utils.isArray(values)) {
                    str = str.replace("{0}", values);
                } else {
                    for (var s = 0; s < values.length; s++) {
                        str = str.replace("{" + s + "}", values[s])
                    }
                }
            }
            return str;
        },

        // "hooked" calls

        copyObject: function(obj) {
            return getHooks().copyObject(obj);
        },

        applyDefaults: function(obj, defaults) {
            return getHooks().applyDefaults(obj, defaults);
        },

        getMainWindow: function() {
            return getHooks().getMainWindow();
        },

        processUrl: function(url, type) {
            return getHooks().processUrl(url, type);
        },

        URL_IMAGE: "image"

    };

    var specific = (CUI.rte._adapter == "ext" ? {

        isArray: function(obj) {
            return CQ.Ext.isArray(obj);
        },

        isString: function(obj) {
            return CQ.Ext.isString(obj);
        },

        apply: function(obj, config, defaults) {
            return CQ.Ext.apply(obj, config, defaults);
        },

        getPagePosition: function(dom) {
            return CQ.Ext.get(dom).getXY();
        },

        jsonDecode: function(str) {
            return CQ.Ext.util.JSON.decode(str);
        },

        BLANK_IMAGE_URL: CQ.Ext.BLANK_IMAGE_URL

    } : function($) {

        return {

            isArray: function(obj) {
                return $.isArray(obj);
            },

            isString: function(obj) {
                return $.isString(obj);
            },

            apply: function(obj, config, defaults) {
                return $.extend(obj, config, defaults);
            },

            getPagePosition: function(dom) {
               var pos = $(dom).offset();
               return [ pos.left, pos.top ];
            },

            jsonDecode: function(str) {
                return $.parseJSON(str);
            },

            BLANK_IMAGE_URL: "../images/components/rte/blank.png"

        };

    }(window.jQuery));

    return specific.apply(specific, commons);

}();
