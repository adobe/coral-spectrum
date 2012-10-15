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
 * @class CQ.form.rte.XhtmlDeserializer
 * @extends CQ.form.rte.HtmlDeserializer
 * The HtmlDeserializer is used to deserialize XHTML code to a suitable DOM tree.
 * @constructor
 * Creates a new XhtmlDeserializer.
 * @param {Object} config The configuration object
 */
CQ.form.rte.XhtmlDeserializer = new Class({

    toString: "XhtmlDeserializer",

    extend: CQ.form.rte.HtmlDeserializer,

    _init: function() {
        this.inherited(arguments)
        // build Regex to remove unnecessary/harmful closing tags
        var nct = CQ.form.rte.HtmlSerializer.NON_CLOSING_TAGS;
        var regExpStr = "<\\/(";
        for (var n = 0; n < nct.length; n++) {
            if (n > 0) {
                regExpStr += "|";
            }
            regExpStr += nct[n];
        }
        regExpStr += ")>";
        this.regExp = new RegExp(regExpStr, "gi");
    },

    /**
     * Expands XHTML "short tags", as they confuse Internet Explorer.
     * @param {String} xhtml The XHTML to expand
     * @return {String} The expanded XHTML
     */
    expandShortTags: function(xhtml) {
        var xds = CQ.form.rte.XhtmlDeserializer;
        var expanded = xhtml.replace(xds.EXPAND_SHORT_XHTML,
                xds.XHTML_EXPANSION_REPLACEMENT);
        return expanded.replace(this.regExp, "");
    },

    /**
     * Deserializes the specified XHTML-compliant HTML code to the specified DOM element.
     * </p>
     * @param {CQ.form.rte.EditContext} context The edit context
     * @param {String} xhtml The HTML to be deserialized
     * @param {HTMLElement} rootDom The DOM (sub-) tree to deserialize the HTML to
     */
    deserialize: function(context, xhtml, rootDom) {
        // preprocess short tags
        xhtml = this.expandShortTags(xhtml);
        xhtml = this.duplicateReferences(xhtml);
        rootDom.innerHTML = xhtml;
    }

});

/**
 * Regular expression that is used to expand XHTML short tags
 * (&lt;a name="xyz"/&gt; -&gt; &lt;a name="xyz&gt;&lt;/a&gt;
 */
CQ.form.rte.XhtmlDeserializer.EXPAND_SHORT_XHTML = /<([^\/][^\n\r\t >]*)([^>]*)(\/>)/gi;

/**
 * Replacement pattern that is used to expand XHTML short tags
 */
CQ.form.rte.XhtmlDeserializer.XHTML_EXPANSION_REPLACEMENT = "<$1$2></$1>";