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
 * @class CUI.rte.HtmlDeserializer
 * @extends CUI.rte.Deserializer
 * The HtmlDeserializer is used to deserialize HTML code to a suitable DOM tree.
 * @constructor
 * Creates a new HtmlDeserializer.
 * @param {Object} config The configuration object
 */
CUI.rte.HtmlDeserializer = new Class({

    toString: "HtmlDeserializer",

    extend: CUI.rte.Deserializer,

    construct: function(config) {
        this._init(config);
    },

    _init: function() {
        // may be overridden
    },

    /**
     * <p>Duplicates references to temporary attributes that are safe from being
     * changed deliberately by the browser.</p>
     * <p>For example, &lt;a href="/content/bla/en/blubb.html"&gt; is changed into
     * &lt;a href="/content/bla/en/blubb.html" _rte_href="/content/bla/en/blubb.html"&gt;.
     * </p>
     * @param {String} html The HTML code to process
     * @return {String} The processed HTML code
     */
    duplicateReferences: function(html) {
        var rules = CUI.rte.HtmlDeserializer.DUPLICATE_RULES;
        var ruleCnt = rules.length;
        for (var r = 0; r < ruleCnt; r++) {
            var rule = rules[r];
            html = html.replace(rule[0], rule[1]);
        }
        return html;
    },

    /**
     * Deserializes the specified HTML code to the specified DOM element.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {String} html The HTML to be deserialized
     * @param {HTMLElement} rootDom The DOM (sub-) tree to deserialize the HTML to
     */
    deserialize: function(context, html, rootDom) {
        html = this.duplicateReferences(html);
        rootDom.innerHTML = html;
    }

});

/**
 * Array that defines the rules required for duplicating references to temporary attributes
 * that are safe from being changed deliberately by the browser. Each element consists of
 * two sub-elements. The first contains the regular expression used to match tags that
 * require attribute duplication; the second element contains the replacement string that
 * does the actual duplication .
 * @type Object[][]
 * @private
 */
CUI.rte.HtmlDeserializer.DUPLICATE_RULES = [ [
        /(<a[^>]*?href=")([^"]*?)(")((.|\n|\r)*?>)/gi,
        "$1$2$3 " + CUI.rte.Common.HREF_ATTRIB + "=\"$2\"$4"
    ], [
        /(<img[^>]*?src=")([^"]*?)(")((.|\n|\r)*?>)/gi,
        "$1$2$3 " + CUI.rte.Common.SRC_ATTRIB + "=\"$2\"$4"
    ]
];