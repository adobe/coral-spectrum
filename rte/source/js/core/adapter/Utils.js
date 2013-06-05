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

    var i18nProvider = null;
    var getI18nProvider = function() {
        if (!i18nProvider) {
            i18nProvider = new CUI.rte.I18nProvider();
        }
        return i18nProvider;
    };

    return {

        scope: function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
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
                str = String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            }
            return str;
        },

        htmlDecode: function(str) {
            if (str) {
                str = String(str).replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                        .replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
            }
            return str;
        },

        stripTags: function(str) {
            if (str) {
                str = String(str).replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "");
            }
            return str;
        },

        merge: function(obj1, obj2) {
            for (var name in obj2) {
                if (obj2.hasOwnProperty(name)) {
                    obj1[name] = obj2[name];
                }
            }
            return obj1;
        },

        setI18nProvider: function(provider) {
            i18nProvider = provider;
        },

        i18n: function(id, values) {
            return getI18nProvider().getText(id, values);
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

        onPluginCreated: function(plugin) {
            return getHooks().onPluginCreated(plugin);
        },

        resolveRelativePath: function(relPath) {
            return getHooks().resolveRelativePath(relPath);
        },

        isExistingPage: function(path) {
            return getHooks().isExistingPage(path);
        },

        getServerPrefix: function(url) {
            return getHooks().getServerPrefix(url);
        },

        URL_IMAGE: "image",

        URL_LINK: "link",


        // mapping adapter specific stuff:

        isArray: CUI.rte.AdapterUtils.isArray,

        isString: CUI.rte.AdapterUtils.isString,

        apply: CUI.rte.AdapterUtils.apply,

        getPagePosition: CUI.rte.AdapterUtils.getPagePosition,

        getWidth: CUI.rte.AdapterUtils.getWidth,

        getHeight: CUI.rte.AdapterUtils.getHeight,

        jsonDecode: CUI.rte.AdapterUtils.jsonDecode,

        getBlankImageUrl: CUI.rte.AdapterUtils.getBlankImageUrl

    };

}();
