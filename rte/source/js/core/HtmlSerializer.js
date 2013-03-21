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
 * @class CUI.rte.HtmlSerializer
 * @extends CUI.rte.Serializer
 * The HtmlSerializer is used to serialize a DOM (sub-) tree to its HTML (String)
 * equivalent.
 * @constructor
 * Creates a new HtmlSerializer.
 * @param {Object} config The configuration object
 */
CUI.rte.HtmlSerializer = new Class({

    toString: "HtmlSerializer",

    extend: CUI.rte.Serializer,

    /**
     * The edit context
     * @private
     * @type CUI.rte.EditContext
     */
    context: null,

    /**
     * HTML code that should be added to the next structural node that has no more child
     * nodes
     * @private
     * @type String
     */
    deepestChildAddHtml: null,

    /**
     * @cfg {String[]} nonClosingTags
     * Array that contains tags that must not be closed. Defaults to: [ "br", "hr", "img",
     * "area", "input", "col" ]
     */
    nonClosingTags: null,

    /**
     * @cfg {String} tagCase
     * Defines the case of tags; valid values are: "upper" (for uppercase tags), "lower"
     * (for lowercase tags), "keep" (to keep tag names as they are according to DOM).
     * Defaults to "lower".
     */
    tagCase: null,

    /**
     * @cfg {String} attribNameCase
     * Defines the case of attribute names; valid values are: "upper" (for uppercase tags),
     * "lower" (for lowercase tags), "keep" (to keep tag names as they are according to
     * DOM). Defaults to "lower".
     */
    attribNameCase: null,

    /**
     * @cfg {String} styleAttribNameCase
     * Defines the case of style attribute names; valid values are: "upper" (for uppercase
     * tags), "lower" for (lowercase tags), "keep" (to keep tag names as they are according
     * to DOM). Defaults to "lower"
     */
    styleAttribNameCase: null,

    /**
     * @cfg {String} idAttribMode
     * Defines how to handle the ID attribute; valid values are: "remove" (for removing
     * ID attributes), "keep" (to keep them). Defaults to "remove"
     */
    idAttribMode: null,

    /**
     * @cfg {Function} beautifier
     * A function that is called on every node. This function may add whitespace to
     * "beautify" the generated HTML. The function gets the edit context, the DOM object and
     * a flag that determines if the function is called before (true) or after (false)
     * processing the DOM object. The function may return "null" (= do nothing) or some
     * text to be added. The text to be added must be specified as an Object with
     * properties "before" and "after", defining the text to be inserted before/after
     * the opening resp. closing tag.
     */
    beautifier: null,

    construct: function(config) {
        this._init(config);
    },

    _init: function(config) {
        config = config || { };
        CUI.rte.Utils.applyDefaults(config, {
            "nonClosingTags": CUI.rte.HtmlSerializer.NON_CLOSING_TAGS,
            "tagCase": "lower",
            "attribNameCase": "lower",
            "styleAttribNameCase": "lower",
            "idAttribMode": "remove",
            "beautifier": CUI.rte.HtmlSerializer.defaultBeautifier
        });
        CUI.rte.Utils.apply(this, config);
    },

    /**
     * <p>Browser-independent way to get attribute values.</p>
     * <p>Contrary to {@link CUI.rte.Common#getAttribute}, this method does not do
     * any attribute-name translations, but works around an IE bug with cloned nodes (some
     * attributes are returned as 0 if accessed regularily) that the former method doesn't
     * work around.</p>
     * @param {HTMLElement} dom The DOM element to get the attribute value from
     * @param {String} attribName The attribute's name
     * @return {String} The attribute's value
     */
    getAttribValue: function(dom, attribName) {
        var com = CUI.rte.Common;
        // IE <= 7 handles named anchors differently; see bug #36231
        if (com.ua.isIE6 || com.ua.isIE7) {
            var nameLC = attribName.toLowerCase();
            if (CUI.rte.Common.isTag(dom, "a") && (nameLC == "name")) {
                return dom.attributes["name"].nodeValue;
            }
        }
        return com.ua.isOldIE ? dom.getAttribute(attribName, 2) : dom.getAttribute(attribName);
    },

    /**
     * Helper that determines if an attribute has actually to be serialized according to
     * the serializer's settings.
     * @param {Attr} attrib The attribute to check
     * @return {Boolean} True if the attribute must not be serialized
     */
    ignoreAttribute: function(attrib) {
        var com = CUI.rte.Common;
        var attrName = attrib.nodeName.toLowerCase();
        if ((attrName == "id") && (this.idAttribMode == "remove")) {
            return true;
        }
        return com.arrayContains(CUI.rte.HtmlSerializer.HELPER_ATTRIBUTES, attrName);
    },

    /**
     * Adjusts the case of the specified string.
     * @private
     */
    adjustCase: function(str, strCase) {
        switch (strCase) {
            case "upper":
                str = str.toUpperCase();
                break;
            case "lower":
                str = str.toLowerCase();
                break;
        }
        return str;
    },

    /**
     * Creates the tag name string for the specified DOM element.
     * @param {HTMLElement} dom The DOM element to create the tag name for
     * @return {String} The tag name ("img", "IMG", "a", "table", ...)
     */
    createTagStr: function(dom) {
        return this.adjustCase(dom.tagName, this.tagCase);
    },

    /**
     * Serializes the specified attribute of the specified DOM element.
     * @param {String} name The name of the attribute to serialize
     * @param {String} value The value of the attribute to serialize
     */
    serializeAttribute: function(name, value) {
        name = this.adjustCase(name, this.attribNameCase);
        var nameLC = name.toLowerCase();
        if ((nameLC == "style") && (this.styleAttribNameCase != "keep")) {
            var styleDef = CUI.rte.HtmlProcessor.parseStyleDef(value);
            value = "";
            for (var styleName in styleDef) {
                if (styleDef.hasOwnProperty(styleName)) {
                    var styleValue = styleDef[styleName];
                    // IE 9 may report empty style parts; ignore them
                    if (styleValue && (styleValue.length > 0)) {
                        if (value.length > 0) {
                            value += " ";
                        }
                        styleName = this.adjustCase(styleName, this.styleAttribNameCase);
                        value += styleName + ": " + styleValue + ";";
                    }
                }
            }
        }
        // don't write empty attributes, they don't make sense at all ...
        if ((value == null) || (value.length == 0)) {
            return "";
        }
        // ignore colspan/rowspan of "1"
        if ((nameLC == "colspan") || (nameLC == "rowspan")) {
            if (parseInt(value) == 1) {
                return "";
            }
        }
        return name + "=\"" + CUI.rte.Utils.htmlEncode(value) + "\"";
    },

    /**
     * Serializes the attributes of the specified DOM element.
     * @param {HTMLElement} dom The DOM element
     */
    serializeAttributes: function(dom) {
        var com = CUI.rte.Common;
        var attribFilter = (com.ua.isGecko ? com.FILTER_GECKO_TEMPORARY_ATTRIBS : null);
        var attributeNames = com.getAttributeNames(dom, true, attribFilter);
        var attribCnt = attributeNames.length;
        var attribsStr = "";
        var isFirstAttrib = true;
        for (var a = 0; a < attribCnt; a++) {
            var attrib = dom.attributes.getNamedItem(attributeNames[a]);
            if (!this.ignoreAttribute(attrib)) {
                var attrName = attrib.nodeName;
                var attrNameLC = attrName.toLowerCase();
                // IE bugs around, at least if DOM is cloned, so again use a special
                // treatment
                var attrValue = this.getAttribValue(dom, attrName);
                if (!attrValue) {
                    if (attrNameLC == "style") {
                        attrValue = dom.style.cssText;
                    } else if (attrNameLC == "class") {
                        attrValue = dom.className;
                    }
                }
                // handle helper attributes
                var tagNameLC = dom.tagName.toLowerCase();
                var attribMapping = CUI.rte.HtmlSerializer.HELPER_ATTRIB_MAPPINGS[
                        tagNameLC];
                if (attribMapping) {
                    for (var m = 0; m < attribMapping.length; m += 2) {
                        var srcAttrib = attribMapping[m];
                        if (attrNameLC == srcAttrib) {
                            attrValue = this.getAttribValue(dom, attribMapping[m + 1]);
                            break;
                        }
                    }
                }
                // at last, do the actual serializing
                var serializedAttrib = this.serializeAttribute(attrName, attrValue);
                if (serializedAttrib.length > 0) {
                    if (!isFirstAttrib) {
                        attribsStr += " ";
                    } else {
                        isFirstAttrib = false;
                    }
                    attribsStr += serializedAttrib;
                }
            }
        }
        return attribsStr;
    },

    /**
     * Serializes the specified text node.
     * @param {HTMLElement} dom The text node to be serialized (must be a text node!)
     * @return {String} The serialized representation of the text node
     */
    serializeTextNode: function(dom) {
        var markup = CUI.rte.Utils.htmlEncode(dom.nodeValue);
        return markup.replace(/\u00A0/g, "&nbsp;");
    },

    /**
     * Serializes the specified DOM node on "entering" the node (= before
     * processing/serializing child nodes).
     * @param {HTMLElement} dom DOM node to serialize
     * @return {String} The serialized representation of the DOM node
     */
    serializeNodeEnter: function(dom) {
        var com = CUI.rte.Common;
        if (dom.nodeType == 3) {
            return this.serializeTextNode(dom);
        }
        var html = "<" + this.createTagStr(dom);
        var attribsStr = this.serializeAttributes(dom);
        if (attribsStr.length > 0) {
            html += " " + attribsStr;
        }
        html += ">";
        // insert an additional linebreak after opening "pre" tags
        if (com.isTag(dom, "pre")) {
            html += "\n";
        }
        // add &nbsp; to empty editing blocks
        if (com.isEmptyEditingBlock(dom, true)) {
            this.deepestChildAddHtml = "&nbsp;";
        }
        if (this.deepestChildAddHtml != null) {
            if (dom.childNodes.length == 0) {
                html += this.deepestChildAddHtml;
                this.deepestChildAddHtml = null;
            }
        }
        return html;
    },

    /**
     * Serializes the specified DOM node on "leaving" the node (= after
     * processing/serializing child nodes).
     * @param {HTMLElement} dom DOM node to serialize
     * @return {String} The serialized representation of the DOM node
     */
    serializeNodeLeave: function(dom) {
        if (dom.nodeType == 3) {
            return "";
        }
        var com = CUI.rte.Common;
        var html = "";
        if (!com.isTag(dom, this.nonClosingTags)) {
            html = "</" + this.createTagStr(dom) + ">";
            if (com.isTag(dom, "pre")) {
                html = "\n" + html;
            }
        }
        return html;
    },

    /**
     * Serializes the specified subtree, including the specified subtree root.
     * @param {HTMLElement} dom The subtree root
     * @return {String} The serialized representation of the specified subtree
     */
    serializeSubTree: function(dom) {
        var preHtml = this.beautifier(this.context, dom, true);
        var html = "";
        var nodeHtml = this.serializeNodeEnter(dom);
        if (preHtml) {
            if (preHtml.before) {
                html = preHtml.before;
            }
            html += nodeHtml;
            if (preHtml.after) {
                html += preHtml.after;
            }
        }
        else {
            html = nodeHtml;
        }
        var childCnt = dom.childNodes.length;
        for (var c = 0; c < childCnt; c++) {
            html += this.serializeSubTree(dom.childNodes[c]);
        }
        nodeHtml = this.serializeNodeLeave(dom);
        var postHtml = this.beautifier(this.context, dom, false);
        if (postHtml) {
            if (postHtml.before) {
                html += postHtml.before;
            }
            html += nodeHtml;
            if (postHtml.after) {
                html += postHtml.after;
            }
        } else {
            html += nodeHtml;
        }
        return html;
    },

    /**
     * <p>Serializes the specified DOM (sub-) tree.</p>
     * <p>Note that the specified DOM element itself doesn't get serialized.</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} dom The DOM (sub-) tree to serialize
     * @return {String} The serialized representation of the DOM (sub-) tree
     */
    serialize: function(context, dom) {
        this.context = context;
        this.deepestChildAddHtml = null;
        var html = "";
        var childCnt = dom.childNodes.length;
        for (var c = 0; c < childCnt; c++) {
            html += this.serializeSubTree(dom.childNodes[c]);
        }
        return html;
    }

});

/**
 * Array containing (default) tags that should not have a closing tag in HTML
 * @type String[]
 * @private
 */
CUI.rte.HtmlSerializer.NON_CLOSING_TAGS = [ "br", "hr", "img", "area", "input", "col" ];

/**
 * Array that defines helper attributes that will not be serialized
 * @type String[]
 * @private
 */
CUI.rte.HtmlSerializer.HELPER_ATTRIBUTES = [
    CUI.rte.Common.HREF_ATTRIB,
    CUI.rte.Common.SRC_ATTRIB
];

/**
 * Object that defines the mapping of helper attributes
 * @type Object
 * @private
 */
CUI.rte.HtmlSerializer.HELPER_ATTRIB_MAPPINGS = {
    "a": [ "href", CUI.rte.Common.HREF_ATTRIB ],
    "img": [ "src", CUI.rte.Common.SRC_ATTRIB ]
};

CUI.rte.HtmlSerializer.defaultBeautifier = function(context, dom, isNodeEnter) {
    var com = CUI.rte.Common;
    if (com.isTag(dom, com.BLOCK_TAGS)) {
        if (isNodeEnter) {
            if (!com.isTag(dom, com.EDITBLOCK_TAGS)) {
                return {
                    "before": null,
                    "after": "\n"
                };
            }
        } else {
            return {
                "before": null,
                "after": "\n"
            };
        }
        return null;
    }
    if (com.isTag(dom, com.EDITBLOCK_TAGS)) {
        if (!isNodeEnter) {
            return {
                "before": null,
                "after": "\n"
            };
        }
        return null;
    }
    if (com.isTag(dom, "br")) {
        if (!isNodeEnter) {
            // don't add \n if we have a Gecko/WebKit empty line placeholder
            if (!com.ua.isIE) {
                var editBlock = com.getTagInPath(context, dom, com.EDITBLOCK_TAGS);
                if (editBlock) {
                    var contentNodes = com.getCharacterNodes(editBlock);
                    if (contentNodes.length == 1) {
                        return null;
                    }
                }
            }
            return {
                "before": null,
                "after": "\n"
            };
        }
    }
    return null;
};