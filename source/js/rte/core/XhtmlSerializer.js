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
 * @class CUI.rte.XhtmlSerializer
 * @extends CUI.rte.HtmlSerializer
 * The XhtmlSerializer is used to serialize a DOM (sub-) tree to its XHTML (String)
 * equivalent.
 * @constructor
 * Creates a new XHtmlSerializer.
 * @param {Object} config The configuration object
 */
CUI.rte.XhtmlSerializer = new Class({

    toString: "XhtmlSerializer",

    extend: CUI.rte.HtmlSerializer,

    /**
     * @cfg {String[]} nonClosingTags
     * @hide
     * Must be set to [ ] for XHTML conformity
     */

    /**
     * @cfg {String} tagCase
     * @hide
     * Must be set to "lower" for XHTML conformity
     */

    /**
     * @cfg {String} attribNameCase
     * @hide
     * Must be set to "lower" for XHTML conformity
     */

    /**
     * @cfg {Boolean} useShortTags
     * Determines if "short tags" (i.e. &lt;br /&gt; should be used for empty elements;
     * defaults to false
     */
    useShortTags: false,


    _init: function(config) {
        config = config || { };
        delete config.tagCase;
        delete config.attribNameCase;
        delete config.nonClosingTags;
        CUI.rte.Utils.applyDefaults(config, {
            "tagCase": "lower",
            "attribNameCase": "lower",
            "useShortTags": false,
            "nonClosingTags": [ ]
        });
        this.inherited(arguments);
    },

    isShortTag: function(dom) {
        var com = CUI.rte.Common;
        if (com.isTag(dom, "a") && com.isAttribDefined(dom, "name")) {
            return false;
        }
        return (dom.childNodes.length == 0);
    },

    serializeNodeEnter: function(dom) {
        var com = CUI.rte.Common;
        if (dom.nodeType == 1) {
            if (this.useShortTags && this.isShortTag(dom)) {
                // Handle short tags that are no edit blocks here. If the empty
                // node is an edit block, the superclass will convert it to (for example)
                // <p>&nbsp;</p> instead of the (invalid) <p />.
                if (!com.isTag(dom, com.EDITBLOCK_TAGS)) {
                    var html = "<" + this.createTagStr(dom);
                    var attribsStr = this.serializeAttributes(dom);
                    if (attribsStr.length > 0) {
                        html += " " + attribsStr;
                    }
                    if (this.deepestChildAddHtml != null) {
                        html += ">" + this.deepestChildAddHtml;
                        html += "</" + this.createTagStr(dom) + ">";
                    } else {
                        html += " />";
                    }
                    return html;
                }
            }
        }
        return this.inherited(arguments);
    },

    serializeNodeLeave: function(dom) {
        var com = CUI.rte.Common;
        if (dom.nodeType == 1) {
            if (!com.isTag(dom, com.EDITBLOCK_TAGS)) {
                if (this.useShortTags && this.isShortTag(dom)) {
                    return "";
                }
            }
        }
        return this.inherited(arguments);
    }

});