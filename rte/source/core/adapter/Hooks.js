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

/**
 * <p>This class allows to hook some special functionality into the RichTextEditor.</p>
 * <p>The provided default implementation depends on jQuery.</p>
 * <p>The class may be overridden in page-load time with application-specific functionality.
 */
CUI.rte.Hooks = new Class({

    copyObject: function(obj) {
        var newObj;
        if (CUI.rte.Utils.isArray(obj)) {
            newObj = [ ];
            for (var i = 0; i < obj.length; i++) {
                newObj.push(this.copyObject(obj[i]))
            }
        } else if (typeof(obj) == "object") {
            newObj = { };
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    newObj[k] = this.copyObject(obj[k])
                }
            }
        } else {
            newObj = obj;
        }
        return newObj;
    },

    applyDefaults: function(obj, defaults) {
        obj = obj || { };
        defaults = defaults || { };
        if (typeof(obj) === "object") {
            for (var k in defaults) {
                if (defaults.hasOwnProperty(k)) {
                    var v = defaults[k];
                    if (v && (typeof(v) === "object") && !CUI.rte.Utils.isArray(v)) {
                        obj[k] = this.applyDefaults(obj[k], v);
                    } else if (typeof(obj[k]) === "undefined") {
                        obj[k] = v;
                    }
                }
            }
        }
        return obj;
    },

    getMainWindow: function() {
        return window;
    },

    processUrl: function(url, type) {
        return url;
    },

    onPluginCreated: function(plugin) {
        return plugin;
    },

    resolveRelativePath: function(relPath) {
        var path = document.location.pathname;
        var parentPath = path.substring(0, path.lastIndexOf("/"));
        var parts = parentPath.split("/");
        var relParts = relPath.split("/");
        for (var r = 0; r < relParts.length; r++) {
            var relPart = relParts[r];
            if (relPart === "..") {
                if (parts.length <= 1) {
                    throw new Error("Invalid relative path: " + relPath);
                }
                parts.splice(parts.length - 1, 1);
            } else if (relPart !== ".") {
                parts.push(relPart);
            }
        }
        return parts.join("/");
    },

    isExistingPage: function(path) {
        return true;
    },

    getServerPrefix: function(url) {
        var protSepPos = url.indexOf("://");
        if (protSepPos < 0) {
            return "";
        }
        var afterProtPos = url.indexOf("/", protSepPos + 3);
        return afterProtPos < 0 ? url : url.substring(0, afterProtPos);
    }

});
