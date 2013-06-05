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
 * @class CUI.rte.HtmlRules
 * This class and its sublasses represents the rules to be applied on HTML processing
 * from inside the {@link CQ.form.RichText RichText} component.
 * @since 5.3
 * @constructor
 * Creates a HtmlRules object.
 * @param {Object} config The configuration
 */
CUI.rte.HtmlRules = new Class({

    toString: "HtmlRules",

    /**
     * @cfg {Object} links
     * Defines how links are created/handled.
     */
    /**
     * @property links
     * Defines how links are created/handled.
     * @type CUI.rte.HtmlRules.Links
     */
    links: null,

    /**
     * @cfg {Object} serializer
     * Defines HTML serialization
     */
    /**
     * @property serializer
     * Defines HTML serialization
     * @type CUI.rte.HtmlRules.Serializer
     */
    serializer: null,

    /**
     * @cfg {Object} docType
     * Defines the doctype
     */
    /**
     * @property docType
     * Defines the doctype
     * @type CUI.rte.HtmlRules.DocType
     */
    docType: null,

    /**
     * @cfg {Object} blockHandling
     * Defines the rules for handling blocks (edit blocks, aux roots, and so on).
     */
    /**
     * @property blockHandling
     * Defines the rules for handling blocks (edit blocks, aux roots, and so on).
     * @type CUI.rte.HtmlRules.BlockHandling
     */
    blockHandling: null,



    construct: function(config) {
        config = config || { };
        var hrls = CUI.rte.HtmlRules;
        this.links = new hrls.Links(config.links);
        this.serializer = new hrls.Serializer(config.serializer);
        this.docType = new hrls.DocType(config.docType);
        this.blockHandling = new hrls.BlockHandling(config.blockHandling);
        delete config.links;
        delete config.serializer;
        delete config.docType;
        delete config.blockHandling;
        /*
        CUI.rte.Utils.applyDefaults(config, {
            "defaultEditBlockType": "p"
        });
        */
        CUI.rte.Utils.apply(this, config);
    }

});

/**
 * Removes the server prefix (http://hostname:port/context; deliberately inserted by the
 * browser) from an internal link.
 * @param {String} href URL where the server prefix should be removed
 * @param {String} type The type of the href (for example, image or hyperlink; use
 *        constants defined in class {@link CUI.rte.Utils})
 * @return {String} adjusted URL ("/content/foo/bar" for internal links;
 *         "http://hostname[:port]/foo/bar" for external links
 */
CUI.rte.HtmlRules.removePrefixForInternalLinks = function(href, type) {
    var currentUrl = location.href;
    var currentServerPrefix = CUI.rte.Utils.getServerPrefix(currentUrl) + "/";
    var prefixLen = currentServerPrefix.length;
    if (href.length > prefixLen) {
        if (href.substring(0, prefixLen) == currentServerPrefix) {
            var isSamePage = false;
            var hasQueryString = false;
            if (href.length > currentUrl.length) {
                if (href.substring(0, currentUrl.length) == currentUrl) {
                    var sepChar = href.charAt(currentUrl.length);
                    switch (sepChar) {
                        case "?":
                            hasQueryString = true;
                            isSamePage = true;
                            break;
                        case "#":
                            isSamePage = true;
                            break;
                    }
                }
            }
            if (isSamePage && !hasQueryString) {
                // anchor-only link: remove protocol, host, path
                href = href.substring(currentUrl.length, href.length);
            } else {
                href = href.substring(prefixLen - 1, href.length);
            }
        }
    }
    return href;
};


/**
 * @class CUI.rte.HtmlRules.Links
 * The HtmlRules.Links class represents the HTML rules used for creating links.
 * @since 5.3
 * @constructor
 * Creates a HtmlRules.Links object.
 * @param {Object} config The configuration
 */
CUI.rte.HtmlRules.Links = new Class({

    toString: "HtmlRules.Links",

    /**
     * @cfg {String} cssMode
     * <p>Defines the CSS mode for links. Possible values are:</p>
     * <ul>
     *   <li>"remove" - removes class elements on links</li>
     *   <li>"keep" - keeps manually added classes "as is"</li>
     *   <li>"replace" - replaces manually added classes by using the classes defined by
     *     {@link #cssInternal} and {@link #cssExternal}.</li>
     *   <li>"auto" - (default) determines the cssMode through the settings of
     *     {@link #cssInternal} and {@link #cssExternal}. If at least one of these
     *     properties is set, mode "replace" is used. If none is set, mode "keep" is
     *     used instead.</li>
     * </ul>
     * @since 5.3
     */
    cssMode: null,

    /**
     * @cfg {String} cssInternal
     * CSS class to use for internal links
     */
    cssInternal: null,

    /**
     * @cfg {String} cssExternal
     * CSS class to use for external links
     */
    cssExternal: null,

    /**
     * @cfg {String[]} protocols
     * A list of available prototcols; use the entire protocol prefix (e.g. "http://",
     * "ftp://"). Note that internal links are always available.
     */
    protocols: null,

    /**
     * @cfg {String} defaultProtocol
     * The default protocol value; must be one of the values in {@link #protocols}
     */
    defaultProtocol: null,

    /**
     * @cfg {Object} targetConfig
     * <p>Defines how to handle the "target" attribute of the link being edited. Properties:
     * </p>
     * <ul>
     *   <li><code>mode</code> : String<br>
     *     Specifies the target mode; valid values are: "auto" - means that an automatic
     *     target is chosen (specified by the "targetExternal" property for external
     *     links and "targetInternal" for internal links). "manual" - means that the
     *     user can specify a target through an input field. "blank" - means that there
     *     is a checkbox to select if a link should be opened in a new window. "none" if no
     *     target attribute may be provided.</li>
     *   <li><code>targetInternal</code> : String<br>
     *     The target for internal links (only if mode == "auto")</li>
     *   <li><code>targetExternal</code> : String<br>
     *     The target for external links (only if mode == "auto")</li>
     * </ul>
     */
    targetConfig: null,

    /**
     * @cfg {Boolean} ensureInternalLinkExt
     * True if a proper extension (.html) should be ensured for internal links. False
     * if it's the user's responsibility to enter internal links correctly. Defaults to
     * true.
     * @since 5.4
     */
    ensureInternalLinkExt: false,

    /**
     * @cfg {RegExp} relativeLinkRegExp
     * A regular expression that is used to detect relative links. Relative links are
     * not prepended with an http:// link.
     * @since 5.5
     */
    relativeLinkRegExp: null,


    construct: function(config) {
        config = config || { };
        var defaults = {
            "cssMode": "auto",
            "protocols": [
                "http://",
                "https://",
                "ftp://",
                "mailto:"
            ],
            "targetConfig": {
                "mode": "blank"
            },
            "ensureInternalLinkExt": true
        };
        CUI.rte.Utils.applyDefaults(config, defaults);
        CUI.rte.Utils.apply(this, config);
        // adjust regexp
        CUI.rte.Compatibility.adjustRegExp(this, "relativeLinkRegExp",
                CUI.rte.HtmlRules.Links.REL_LINK_DEFAULT_REGEXP);
    },

    /**
     * Get the protocol (if containes in the protocol array) of the specified HREF.
     * @param {String} href The HREF (i.e. "http://host.domain.tld/path/to/file.ext")
     * @return {String} The protocol; null if no or no valid/allowed protocol is available
     */
    getProtocol: function(href) {
        if (this.protocols) {
            var pCnt = this.protocols.length;
            for (var p = 0; p < pCnt; p++) {
                var protocol = this.protocols[p];
                if (CUI.rte.Common.strStartsWith(href, protocol)) {
                    return protocol;
                }
            }
        }
        return null;
    },

    /**
     * <p>Checks if the specified HREF generally has (most probably) a protocol prefix.</p>
     * <p>The protocol is not checked against the protocols array.</p>
     * @param {String} href The HREF (i.e. "http://host.domain.tld/path/to/file.ext")
     * @return {Boolean} True, if a protocol has been detected for the specified HREF
     */
    hasProtocol: function(href) {
        return CUI.rte.HtmlRules.Links.hasProtocol(href);
    },

    /**
     * Checks if the specified HREF represents an internal link.
     * @param {String} href The HREF (i.e. "http://host.domain.tld/path/to/file.ext")
     * @return {Boolean} True, if the specified HREF represents an internal link
     */
    isInternalLink: function(href) {
        return CUI.rte.HtmlRules.Links.isInternalLink(href);
    },

    /**
     * Checks if the specified HREF represents a relative link.
     * @param {String} href the HREF (i.e. "http://host.domain.tld/path/to/file.ext")
     */
    isRelativeLink: function(href) {
        return CUI.rte.HtmlRules.Links.isRelativeLink(href, this.relativeLinkRegExp);
    },

    /**
     * <p>Validates the specified HREF.</p>
     * <p>The HREF is considered valid if:</p>
     * <ul>
     *   <li>It has a valid protocol.</li>
     *   <li>Or represents an internal link (note that the internal link is not verified
     *     to point to a valid node).</li>
     *   <li>Or is recognized as a link without protocol (i.e. "www.day.com",
     *     "localhost:80")</li>
     * </ul>
     * @param {String} href The HREF to validate
     * @return {Boolean} True if the HREF could be validated
     */
    validateHref: function(href) {
        var protocol = this.getProtocol(href);
        if (protocol) {
            // valid protocol prepended
            return true;
        }
        // internal & relative links
        if (this.isInternalLink(href)) {
            return true;
        }
        if (this.isRelativeLink(href)) {
            return true;
        }
        // invalid protocol?
        if (this.hasProtocol(href)) {
            return false;
        }
        // link without protocol (i.e. www.day.com) or empty link
        return !!(href && (href.length > 0));
    },

    /**
     * Applies the link rules to the specified DOM object.
     * @param {HTMLElement|Object} obj DOM object or JavaScript stub object to apply rules
     *        to
     */
    applyToObject: function(obj) {
        var com = CUI.rte.Common;
        var isDomObject = (obj.nodeType && (obj.nodeType == 1));
        var href;
        if (isDomObject) {
            href = CUI.rte.HtmlRules.Links.getLinkHref(obj);
        } else {
            href = obj.href || "";
        }
        var cssMode = this.cssMode;
        if (cssMode == "auto") {
            if ((this.cssInternal != null) || (this.cssExternal != null)) {
                cssMode = "replace";
            } else {
                cssMode = "keep";
            }
        }
        if (cssMode == "remove") {
            if (isDomObject) {
                com.removeAttribute(obj, "class");
            } else {
                obj.cssClass = null;
            }
        } else if (cssMode == "replace") {
            var cssClass = null;
            if (this.cssInternal && this.isInternalLink(href)) {
                cssClass = this.cssInternal;
            }
            if (this.cssExternal && !this.isInternalLink(href)) {
                cssClass = this.cssExternal;
            }
            if (isDomObject) {
                if (cssClass != null) {
                    com.setAttribute(obj, "class", cssClass);
                } else {
                    com.removeAttribute(obj, "class");
                }
            } else {
                obj.cssClass = cssClass;
            }
        }
        if (this.targetConfig) {
            switch (this.targetConfig.mode) {
                case "none":
                    if (isDomObject) {
                        com.removeAttribute(obj, "target");
                    } else {
                        obj.target = null;
                    }
                    break;
                case "auto":
                    var target = (this.isInternalLink(href)
                            ? this.targetConfig.targetInternal
                            : this.targetConfig.targetExternal);
                    if (isDomObject) {
                        if (target != null) {
                            com.setAttribute(obj, "target", target);
                        } else {
                            com.removeAttribute(obj, "target");
                        }
                    } else {
                        obj.target = target;
                    }
                    break;
            }
        }
        if (this.isInternalLink(href) || this.isRelativeLink(href)) {
            var anchorPos = href.indexOf("#");
            if (anchorPos == 0) {
                // change nothing if we have an "anchor only"-HREF
                return;
            }
            // add extension to internal links if necessary (relative links are considered
            // internal links as well)
            if (this.ensureInternalLinkExt && this.isPage(href)) {
                var anchor = "";
                if (anchorPos > 0) {
                    anchor = href.substring(anchorPos, href.length);
                    href = href.substring(0, anchorPos);
                }
                var query = "";
                var queryPos = href.indexOf("?");
                if (queryPos > 0) {
                    query = href.substring(queryPos, href.length);
                    href = href.substring(0, queryPos);
                }
                // add extension to href if necessary
                var extSepPos = href.lastIndexOf(".");
                var slashPos = href.lastIndexOf("/");
                var hasClosingSlash = (slashPos == (href.length - 1));
                if (((extSepPos <= 0) || (extSepPos < slashPos)) && !hasClosingSlash) {
                    obj.href = href + CUI.rte.Constants.EXTENSION_HTML + query + anchor;
                }
            }
        } else if ((this.getProtocol(href) == null) && !this.hasProtocol(href)) {
            // Two cases will end up here: either we have a relative link:
            //    relative/path/to/resource.html
            // or we have an absolute link where the user failed to specify the protocol:
            //    www.adobe.com/somePage.html
            // Trouble is, there's no definitive way to tell which we have.  So we apply
            // a few heuristics:
            if (this.isPage(href)) {
                // relative internal link to a page; doesn't need a protocol added
            } else {
                var slash = href.indexOf("/");
                var hostname = (slash > 0 ? href.substring(0, slash) : href);
                if (CUI.rte.HtmlRules.Links.PROBABLE_HOST_REGEXP.test(hostname)) {
                    // user forgot to type a protocol; give them a default one:
                    var protocol = this.defaultProtocol || "http://";
                    obj.href = protocol + href;
                } else {
                    // still might be a host which failed our PROBABLE_HOST_REGEXP test, but
                    // better to have a false-negative and do nothing than to wreck a user's
                    // valid relative URL.  (See bugs CQ5-10876 and CQ5-13109.)
                }
            }
        }
    },

    /**
     * Returns true if the href points to a page.
     * @param {String} href A relative or absolute path
     */
    isPage: function(href) {
        var path;
        if (this.isRelativeLink(href)) {
            path = CUI.rte.Utils.resolveRelativePath(href);
        } else if (this.isInternalLink(href)) {
            path = href;
        }

        if (!path) {
            return false;
        } else if (path.indexOf("?") >= 0) {
            path = path.substring(0, path.indexOf("?"));    // trim query parameter
        } else if (path.indexOf("#") >= 0) {
            path = path.substring(0, path.indexOf("#"));    // trim fragment identifier
        }

        // links are already considered URL encoded, so we'll have to decode them
        // before passing the path to #getPageInfo()
        return CUI.rte.Utils.isExistingPage(path);
    }

});

/**
 * The default regular expression used for detecting hostnames
 */
CUI.rte.HtmlRules.Links.PROBABLE_HOST_REGEXP = /^(localhost)|([\w\d\-\u0081-\uffff]+\.[\w\d\-\u0081-\uffff]+\.[\w\d\-\u0081-\uffff]+)$/;

/**
 * Checks if the specified HREF has a protocol prefix (http://, mailto:, etc.).
 * @param {String} href HREF to check
 * @return {Boolean} <i>true</i> if the specified HREF has a protocol prefix
 */
CUI.rte.HtmlRules.Links.hasProtocol = function(href) {
    return /^[A-Za-z][A-Za-z\d+\-.]*:(\/\/)?([^\d]|[\d]+@|$)/.test(href);
};

/**
 * Checks if the specified HREF defines an internal link.
 * @param {String} href HREF to check
 */
CUI.rte.HtmlRules.Links.isInternalLink = function(href) {
    return href && (href.length > 0)
            && ((href.charAt(0) == "/") || (href.charAt(0) == '#'));
};

/**
 * Checks if the specified HREF represents a relative link.
 * @param {String} href the HREF (i.e. "http://host.domain.tld/path/to/file.ext")
 * @param {RegExp} regEx The regular expression to be used for detecting the relative link;
 *        if null, no relative link detection is applied on the HREF.
 */
CUI.rte.HtmlRules.Links.isRelativeLink = function(href, regEx) {
    if (!regEx) {
        return false;
    }
    // console.log(regEx.test(href));
    return regEx.test(href);
};

/**
 * The default regular expression used for detecting relative links
 */
CUI.rte.HtmlRules.Links.REL_LINK_DEFAULT_REGEXP = /^\.{1,2}\/(.*)/;

/**
 * <p>Returns the HREF of the specified DOM element.</p>
 * <p>This method uses the proprietary RTE attribute if available. Otherwise, the
 * HREF attribute is taken and a guess is made if the HREF represents an internal link.
 * If so, the HREF is adjusted accordingly.</p>
 * @param {HTMLElement} dom The link element to check
 * @return {String} The link element's HREF attribute
 */
CUI.rte.HtmlRules.Links.getLinkHref = function(dom) {
    var com = CUI.rte.Common;
    var href;
    if (com.isAttribDefined(dom, com.HREF_ATTRIB)) {
        href = com.getAttribute(dom, com.HREF_ATTRIB);
    } else {
        href = com.getAttribute(dom, "href");
        if (href) {
            href = CUI.rte.HtmlRules.removePrefixForInternalLinks(href,
                    CUI.rte.Utils.URL_LINK);
        }
    }
    return href;
};

/**
 * Removes the server prefix (http://hostname:port/context; deliberately inserted by the
 * browser) from an internal link.
 * @param {String} href URL where the server prefix should be removed
 * @return {String} adjusted URL ("/content/foo/bar" for internal links;
 *         "http://hostname[:port]/foo/bar" for external links
 * @deprecated use {@link CUI.rte.HtmlRules#removePrefixForInternalLinks instead
 */
CUI.rte.HtmlRules.Links.removePrefixForInternalLinks = function(href) {
    return CUI.rte.HtmlRules.removePrefixForInternalLinks(href, CUI.rte.Utils.URL_LINK);
};


/**
 * @class CUI.rte.HtmlRules.Serializer
 * The HtmlRules.Serializer class represents the rules used for serializing and
 * deserializing HTML from/to DOM objects.
 * @since 5.3
 * @constructor
 * Creates a HtmlRules.Serializer object.
 * @param {Object} config The configuration
 */
CUI.rte.HtmlRules.Serializer = new Class({

    toString: "HtmlRules.Serializer",

    /**
     * @cfg {String} mode
     * <p>Serializer mode. Valid settings are:</p>
     * <ul>
     *   <li>"auto" - uses the a suitable default serializer.</li>
     *   <li>"customized" - uses customized serializer and deserializer; must be provided
     *     through the {@link #serializer} and {@link #deserializer} config options.</li>
     * </ul>
     * <p>Defaults to "auto".</p>
     */
    mode: null,

    /**
     * @cfg {Object} config
     * Configuration if a standard serializer ({@link CUI.rte.HtmlSerializer},
     * {@link CUI.rte.XhtmlSerializer} is used. See the corresponding class for
     * respective config options. Ignored if mode == "customized". Defaults to null to use
     * the serializer's default configuration.
     */
    config: null,

    /**
     * @cfg {CUI.rte.Serializer} serializer
     * Provides a customized serializer. Ignored if mode != "customized". Defaults to null.
     */
    serializer: null,

    /**
     * @cfg {CUI.rte.Serializer} deserializer
     * Provides a customized deserializer. Ignored if mode != "customized". Defaults to
     * null.
     */
    deserializer: null,


    construct: function(config) {
        config = config || { };
        CUI.rte.Utils.applyDefaults(config, {
            "mode": "auto",
            "config": null,
            "serializer": null,
            "deserializer": null
        });
        CUI.rte.Utils.apply(this, config);
    },

    /**
     * Serializes the specified DOM tree.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} dom The root node of the DOM tree to be serialized; the root
     *        node itself is not serialized
     * @param {CUI.rte.HtmlRules.DocType} docType The doc type
     * @return {String} The serialized representation of the DOM tree
     */
    serialize: function(context, dom, docType) {
        // create serializer if necessary
        if (this.serializer == null) {
            switch (this.mode) {
                case "auto":
                    if (docType.baseType == "html") {
                        this.serializer = new CUI.rte.HtmlSerializer(this.config);
                    } else if (docType.baseType == "xhtml") {
                        this.serializer = new CUI.rte.XhtmlSerializer(this.config);
                    }
                    break;
                case "customized":
                    throw new Error("Using 'customized' serialization, but no custonized "
                            + "serializing object configured (use 'serializer' config "
                            + "option)");
                    break;
                default:
                    throw new Error("Invalid serialization mode: '" + this.mode + "'");
                    break;
            }
        }
        return this.serializer.serialize(context, dom);
    },

    /**
     * Deserializes the specified HTML fragment to the specified root DOM element.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {String} html The HTML code to deserialize
     * @param {HTMLElement} dom The root node of the DOM tree the HTML is deserialized to
     * @param {CUI.rte.HtmlRules.DocType} docType The doc type
     */
    deserialize: function(context, html, dom, docType) {
        // create deserializer if necessary
        if (this.deserializer == null) {
            switch (this.mode) {
                case "auto":
                    if (docType.baseType == "html") {
                        this.deserializer = new CUI.rte.HtmlDeserializer(this.config);
                    } else if (docType.baseType == "xhtml") {
                        this.deserializer = new CUI.rte.XhtmlDeserializer(this.config);
                    }
                    break;
                case "customized":
                    throw new Error("Using 'customized' serialization, but no custonized "
                            + "deserializing object configured (use 'deserializer' config "
                            + "option)");
                    break;
                default:
                    throw new Error("Invalid serialization mode: '" + this.mode + "'");
                    break;
            }
        }
        return this.deserializer.deserialize(context, html, dom);
    }

});


/**
 * @class CUI.rte.HtmlRules.DocType
 * <p>The HtmlRules.DocType class represents some rules regarding document types.</p>
 * <p>It mostly influences the way HTML code is generated from the DOM (using some of the
 * {@link CUI.rte.HtmlProcessor} modules, especially the Postprocessor that is
 * responsible for the final HTML result.</p>
 * @constructor
 * Creates a new HtmlRules.DocType object.
 * @param {Object} config The configuration object
 */
CUI.rte.HtmlRules.DocType = new Class({

    toString: "HtmlRules.DocType",

    /**
     * @cfg {String} baseType
     * Basic document type; allowed values: "html", "xhtml"; defaults to "html"
     */
    baseType: null,

    /**
     * @cfg {String} version
     * Doctype version; only valid values: "4.0" for baseType == "html"; "1.0" for
     * baseType == "xhtml". Note that you'll have to provide the version as a String
     * object, not as a Number.
     */
    version: null,

    /**
     * @cfg {Object} typeConfig
     * Type-specific configuration. Currently supported config options:
     * <ul>
     *   <li><code>useSemanticMarkup</code> : Boolean<br>
     *     True if semantic markup should be used in favour of "physical style" markup
     *     (for example, use "strong" instead of "b" tags). The mapping of semantic to
     *     physical style tags is defined by semanticMarkupMap.</li>
     *   <li><code>semanticMarkupMap</code> : Object<br>
     *     Defines the mapping between physical style tags (key) and semantic markup tags
     *     (value). Note that you must specify a valid map, even if useSemanticMarkup is
     *     set to false.</li>
     *   <li><code>isXhtmlStrict</code> : Boolean<br>
     *     Defines if strict XHTML 1.0 has to be used (only if {@link #baseType} ==
     *     "xhtml"). Note that XHTML 1.0 strict has some limitations; for example the
     *     "u" tag is no longer supported.</li>
     * </ul>
     */
    typeConfig: null,

    /**
     * "Blacklist" of (RTE supported) tags that are not allowed by the current doc type
     * @private
     * @type String[]
     */
    tagBlacklist: null,

    construct: function(config) {
        config = config || { };
        CUI.rte.Utils.applyDefaults(config, {
            "baseType": "html",
            "version": "4.0",
            "typeConfig": {
                "useSemanticMarkup": false,
                "semanticMarkupMap": {
                    "b": "strong",
                    "i": "em"
                }
            }
        });
        CUI.rte.Utils.apply(this, config);
        if ((this.baseType != "html") && (this.baseType != "xhtml")) {
            throw new Error("Invalid doctype; must be 'html' or 'xhtml'");
        }
        this.tagBlackList = [ ];
        if (this.baseType == "html") {
            if (this.version != "4.0") {
                throw new Error("Invalid version; must be '4.0' for doctype 'html'.");
            }
        }
        if (this.baseType == "xhtml") {
            if (this.version != "1.0") {
                throw new Error("Invalid version; must be '1.0' for doctype 'xhtml'.");
            }
            if (this.typeConfig.isXhtmlStrict) {
                this.tagBlackList.push("u");
            }
        }
    },

    /**
     * <p>Checks if the specified tag is allowed by the current document type.</p>
     * <p>Note that this method currently does not use the DTD to detect invalid tags,
     * but a blacklist is used.</p>
     * @param {String} tagName The tag name to be checked
     * @return {Boolean} True if the specified tag name is allowed for the doctype
     */
    isAllowed: function(tagName) {
        return !CUI.rte.Common.arrayContains(this.tagBlackList, tagName.toLowerCase());
    },

    /**
     * Checks if the specified tag is listed as semantic markup and returns the
     * corresponding physical style markup.
     * @param {String} tagName The tag name to be checked
     * @return {String} The corresponding physical style tag; null, if the specified tag
     *         name is not registered as semantic markup
     */
    convertToPhysicalStyle: function(tagName) {
        var markupMap = this.typeConfig.semanticMarkupMap;
        if (!markupMap) {
            return null;
        }
        tagName = tagName.toLowerCase();
        for (var physStyle in markupMap) {
            if (markupMap.hasOwnProperty(physStyle)) {
                if (markupMap[physStyle] == tagName) {
                    return physStyle;
                }
            }
        }
        return null;
    },

    /**
     * Checks if the specified tag is listed as a physical style and returns the
     * corresponding semantic markup.
     * @param {String} tagName The tag name to be checked
     * @return {String} The corresponding semantic tag; null, if the specified tag
     *         name is not registered as a physical style
     */
    convertToSemanticMarkup: function(tagName) {
        if (!this.typeConfig.semanticMarkupMap) {
            return null;
        }
        tagName = tagName.toLowerCase();
        if (this.typeConfig.semanticMarkupMap.hasOwnProperty(tagName)) {
            return this.typeConfig.semanticMarkupMap[tagName];
        }
        return null;
    },

    /**
     * Adjusts the specified tag to the document type's requirements.
     * @param {String} tagName The name of the tag to adjust
     * @return {String} Adjusted tag name; null if nothing has to be adjusted; "" if the
     *         tag has to be ignored as it is not supported by the doctype
     */
    adjustToDocType: function(tagName) {
        if (this.typeConfig.useSemanticMarkup) {
            var convertedTag = this.convertToSemanticMarkup(tagName);
            if (convertedTag != null) {
                return (this.isAllowed(convertedTag) ? convertedTag : "");
            }
        }
        if (!this.isAllowed(tagName)) {
            return "";
        }
        return null;
    },

    /**
     * Adjusts the specified tag to the requirements of RTE.
     * @param {String} tagName The name of the tag to adjust
     * @return {String} Adjusted tag name; null if nothing has to be adjusted
     */
    adjustToRaw: function(tagName) {
        return this.convertToPhysicalStyle(tagName);
    }

});

CUI.rte.HtmlRules.BlockHandling = new Class({

    toString: "HtmlRules.BlockHandling",

    /**
     * @cfg {String} defaultEditBlock
     * The default edit block type to use; defaults to "p"
     * @since 5.4
     */
    /**
     * @property defaultEditBlockType
     * The default edit block type to use
     * @type String
     * @since 5.4
     */
    defaultEditBlockType: null,

    /**
     * @cfg {Boolean} removeSingleParagraphContainer
     * True if the paragraph element of texts that consist only of a single paragraph
     * should be removed on postprocessing (defaults to false).
     * For example, if a text is &lt;p&gt;Single paragraph text&lt;/p&gt;, the surrounding
     * "p" tag would get removed if this option was set to true. This option is mainly for
     * backward compatibility with CQ 5.1, where container tags had not yet been available.
     * Hence texts that were created by a CQ 5.1 instance will be surrounded by a single "p"
     * element before they are edited in a CQ 5.2+ instance. By setting this option to true,
     * this automatically added "p" tag will get removed before the text is saved, at least
     * if no other paragraphs or containers were added.
     */
    removeSingleParagraphContainer: false,

    /**
     * @cfg {String} singleParagraphContainerReplacement
     * Specifies the name of the tag that has to be used if a paragraph container cannot
     * be simply removed because it carries additional info (for example, alignment and/or
     * CSS classes; defaults to "div"). Note that this setting only takes effect if
     * {@link #removeSingleParagraphContainer} is set to true.
     */
    singleParagraphContainerReplacement: null,

    construct: function(config) {
        config = config || { };
        CUI.rte.Utils.applyDefaults(config, {
            "defaultEditBlockType": "p",
            "removeSingleParagraphContainer": false,
            "singleParagraphContainerReplacement": "div"
        });
        CUI.rte.Utils.apply(this, config);
    }

});