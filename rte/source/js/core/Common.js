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
 * @class CUI.rte.Common
 * @static
 * @private
 * The Common provides some commonly used utility functionality.
 */
CUI.rte.Common = function() {

    var docMode = window.document.documentMode, // documentMode property explanation: http://msdn.microsoft.com/en-us/library/ie/cc196988%28v=vs.85%29.aspx
        ua = navigator.userAgent.toLowerCase(),
        check = function(r){
            return r.test(ua);
        },
        isWebkit = check(/webkit/),
        isGecko = !isWebkit && check(/gecko/), // because the Webkit user agent string sometimes contains "like Gecko"
        isIE = check(/msie/),
        // TODO ambigious browser detection, see CUI-447
        isIE6 = isIE && (check(/msie 6/) || (docMode === 5)), // docMode === 5 indicates "Quirks Mode"
        isIE7 = isIE && (check(/msie 7/) || docMode === 7),
        isIE8 = isIE && (check(/msie 8/) || docMode === 8),
        isIE9 = isIE && (check(/msie 9/) || docMode === 9),
        isIE10 = isIE && (check(/msie 10/) || docMode === 10),
        isOldIE = isIE && (isIE6 || isIE7 || isIE8), // indicator that this IE versions are using the old proprietary behavior (especially selection)
        isW3cIE = isIE && !isOldIE,
        isMac = check(/macintosh|mac os x/),
        isChrome = isWebkit && check(/\bchrome\b/),
        isSafari = isWebkit && !isChrome && check(/safari/),
        isTouch = "ontouchstart" in window,
        isIPad = isTouch && isSafari && check(/ipad/),
        isIPhone = isTouch && isSafari && check(/iphone/),
        calloutHeight = (isIPad || isIPhone ? 56 : 0),
        screenKeyHeightPortrait = (isIPad ? 308 : (isIPhone ? 260 : 0)),
        screenKeyHeightLandscape = (isIPad ? 396 : (isIPhone ? 206 : 0)),
        selectionHandlesHeight = (isIPad ? 32 : (isIPhone ? 20 : 0)); // TODO check iPhone?

    /**
     * Flag if the internal logging mechanism is enabled (used for ieLog())
     */
    var isLogEnabled = true;

    /**
     * Recursive part of getNodeAtPosition.
     */
    var getNodeAtPositionRec = function(context, node, state, pos) {
        var com = CUI.rte.Common;
        if (node.nodeType == 3) {
            var textLen = com.getNodeCharacterCnt(node);
            var endPos = state.charPos + textLen;
            if ((pos >= state.charPos) && (pos < endPos)) {
                state.node = {
                    "dom": node,
                    "start": state.charPos,
                    "offset": pos - state.charPos,
                    "nodeBefore": state.nodeBefore
                };
                return;
            } else if (pos == endPos) {
                state.nodeBefore = node;
                state.startBefore = state.charPos;
            }
            state.charPos += textLen;
        } else if (node.nodeType == 1) {
            if (com.isOneCharacterNode(node)) {
                if (state.charPos == pos) {
                    state.node = {
                        "isNodeSelection": true,
                        "startOfElement": true,
                        "dom": node
                    };
                    return;
                }
                state.charPos++;
            } else {
                // if we got the first item of an irregularily nested edit block
                // (nested lists), we'll have to correct one character position before
                // we calculate anything else
                if (com.isTag(node, com.EDITBLOCK_UNREGNEST_TAGS)) {
                    if ((com.getChildIndex(node) == 0)
                            && com.isFirstNestedList(context, node.parentNode)) {
                        var pNode = node;
                        do {
                            pNode = com.getParentNode(context, pNode);
                            if (pNode && com.isTag(pNode,
                                    com.EDITBLOCK_UNREGNEST_TAGS)) {
                                if (state.charPos == pos) {
                                    var superItem = state.nodeBefore;
                                    var offset = com.getNodeCharacterCnt(superItem);
                                    var itemParent = superItem.parentNode;
                                    state.node = {
                                        "dom": superItem,
                                        "offset": offset,
                                        "parentDom": itemParent,
                                        "isUnregularNestedIssue": true,
                                        "nestedItemDom": node
                                    };
                                    return;
                                }
                                state.charPos++;
                                break;
                            }
                        } while (pNode);
                    }
                }
                var myCharPos = state.charPos;
                var childCnt = node.childNodes.length;
                for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                    getNodeAtPositionRec(context, node.childNodes[childIndex], state, pos);
                    if (state.node) {
                        if (!state.node.parentDom) {
                            state.node.parentDom = node;
                            state.node.parentStart = myCharPos;
                            state.node.parentOffset = pos - myCharPos;
                        }
                        return;
                    }
                }
                if (com.isTag(node, com.EDITBLOCK_TAGS)) {
                    // as always, there are corner cases we have to handle differently -
                    // if we are at the last element of a nested structure, we will
                    // usually directly move to the next nested element, without the
                    // additional character position that is added when entering the
                    // nested structure
                    var isValidEOEB = true;
                    var nestingType = null;
                    if (com.isTag(node, com.EDITBLOCK_NESTED_TAGS)) {
                        nestingType = com.EDITBLOCK_NESTED_TAGS;
                    } else if (com.isTag(node, com.EDITBLOCK_UNREGNEST_TAGS)) {
                        nestingType = com.EDITBLOCK_UNREGNEST_TAGS;
                    }
                    if (nestingType != null) {
                        isValidEOEB = !com.isLastChildDeep(node, nestingType);
                    }
                    if (isValidEOEB) {
                        if (state.charPos == pos) {
                            state.node = {
                                "isNodeSelection": true,
                                "startOfElement": false,
                                "dom": node
                            };
                            return;
                        }
                        state.charPos++;
                    }
                }
            }
        }
    };

    /**
     * Recursive part of getCharacterOffsetForNode.
     * @param {Object} context
     * @param {Node} node
     * @param {Number} charPos
     * @param {Node} processingNode
     */
    var getCharacterOffsetForNodeRec = function(context, node, charPos, processingNode) {
        var com = CUI.rte.Common;
        // if we got the first item of an irregularily nested edit block (nested lists),
        // we'll have to correct one character position before we calculate anything
        if (com.isTag(processingNode, com.EDITBLOCK_UNREGNEST_TAGS)) {
            if ((com.getChildIndex(processingNode) == 0)
                    && com.isFirstNestedList(context, processingNode.parentNode)) {
                var pNode = processingNode;
                do {
                    pNode = com.getParentNode(context, pNode);
                    if (pNode && com.isTag(pNode, com.EDITBLOCK_UNREGNEST_TAGS)) {
                        charPos++;
                        break;
                    }
                } while (pNode);
            }
        }
        if (processingNode == node) {
            return {
                "isFound": true,
                "charPos": charPos
            };
        }
        if (processingNode.nodeType == 3) {
            charPos += com.getNodeCharacterCnt(processingNode);
            return {
                "isFound": false,
                "charPos": charPos
            };
        }
        if (processingNode.nodeType == 1) {
            if (com.isOneCharacterNode(processingNode)) {
                charPos++;
            } else {
                var childCnt = processingNode.childNodes.length;
                for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                    var childResult = getCharacterOffsetForNodeRec(context,
                            node, charPos, processingNode.childNodes[childIndex]);
                    if (childResult.isFound) {
                        return childResult;
                    }
                    charPos = childResult.charPos;
                }
                // we'll have to add one character at the end of "edit blocks", to
                // distinguish the end of an edit block from the begin of the
                // succeeding edit block
                if (com.isTag(processingNode, com.EDITBLOCK_TAGS)) {
                    var addCharPos = true;
                    // as always, there are corner cases we have to handle differently -
                    // if we are at the last element of a nested structure, we will
                    // usually directly move to the next nested element, without the
                    // additional character position that is added when entering the
                    // nested structure
                    if (com.isTag(processingNode, com.EDITBLOCK_NESTED_TAGS)) {
                        // if a table cell being closed is the last element of the
                        // edit element, we must not add the character offset
                        addCharPos = !com.isLastElementOfNestingLevel(context,
                                processingNode);
                    } else if (com.isTag(processingNode,
                            com.EDITBLOCK_UNREGNEST_TAGS)) {
                        // if a list item being closed has a nested list as last
                        // element, we must not add the character offset
                        addCharPos = !com.isLastChildDeep(processingNode,
                                com.EDITBLOCK_UNREGNEST_TAGS);
                    }
                    if (addCharPos) {
                        charPos++;
                    }
                }
            }
            return {
                "isFound": false,
                "charPos": charPos
            };
        }
        return {
            "isFound": false,
            "charPos": -1
        };
    };


    return {

        /**
         * user agent information.
         * @type {Object} allows to check the browser/engine type and version
         */
        ua: {
            /**
             * True if the detected browser uses WebKit.
             * @type Boolean
             */
            isWebKit: isWebkit,
            /**
             * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
             * @type Boolean
             */
            isGecko : isGecko,
            /**
             * True if the detected browser is Internet Explorer.
             * @type {Boolean}
             */
            isIE: isIE,
            /**
             * True if the detected browser is Internet Explorer 6.x.
             * @type {Boolean}
             */
            isIE6: isIE6,
            /**
             * True if the detected browser is Internet Explorer 7.x.
             * @type {Boolean}
             */
            isIE7: isIE7,
            /**
             * True if the detected browser is Internet Explorer 8.x.
             * @type {Boolean}
             */
            isIE8: isIE8,
            /**
             * True if the detected browser is Internet Explorer 9.x.
             * @type {Boolean}
             */
            isIE9: isIE9,
            /**
             * True if the detected browser is Internet Explorer 10.x.
             * @type Boolean
             */
            isIE10: isIE10,
            /**
             * True if the detected browser is a Internet Explorer which uses the old proprietary selection mode
             * @type {Boolean}
             */
            isOldIE: isOldIE,
            /**
             * True if the detected browser is a Internet Explorer which uses the W3C selection mode
             * @type {Boolean}
             */
            isW3cIE: isW3cIE,
            /**
             * True if the detected platform is Mac OS.
             * @type Boolean
             */
            isMac: isMac,
            /**
             * True if the detected browser is Chrome
             */
            isChrome: isChrome,
            /**
             * True if the detected browser is Safari
             */
            isSafari: isSafari,
            /**
             * True if a touch-enabled device is used
             */
            isTouch: isTouch,
            /**
             * True if an iPad is used
             */
            isIPad: isIPad,
            /**
             * True if an iPhone is used
             */
            isIPhone: isIPhone,
            /**
             * Height of a potentially used "callout"; 0 on non-iOS browsers
             */
            calloutHeight: calloutHeight,
            /**
             * Height of a potentially shown screen keyboard in Portrait mode
             */
            screenKeyHeightPortrait: screenKeyHeightPortrait,
            /**
             * Height of a potentially shown screen keyboard in Landscape mode
             */
            screenKeyHeightLandscape: screenKeyHeightLandscape,
            /**
             * Height of sensitive area for selection handles
             */
            selectionHandlesHeight: selectionHandlesHeight,
            /**
             * Determines if the editor is used on a touch platform inside an iframe;
             * must be initialized using {@link #initializeTouchInIframe}; if set to true,
             * no touch events must be used
             */
            isTouchInIframe: false
        },

        /**
         * Check if the given DOM node is the root node of the current editing context.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Node} dom DOM node to check
         * @return {Boolean} True if the given Node is a body node
         */
        isRootNode: function(context, dom) {
            return (context.root == dom);
        },

        /**
         * Check if the given DOM node has (one of) the given tag name(s).
         * <p>
         * Note that the method works case-insensitive; e.g. <code>isTag(dom, "IMG")</code>
         * and <code>isTag(dom, "img")</code> would both match an image tag.
         * @param {Node} dom dom DOM node to check
         * @param {String|Array} tagName name of the tag the node has to be checked against;
         *        if an array, the node will be checked if one of the specified tag names
         *        does match
         * @return {Boolean} True if the given node matches (one of) the given tag name(s)
         */
        isTag: function(dom, tagName) {
            if (!dom || (dom.nodeType != 1)) {
                return false;
            }
            var domTag = dom.tagName.toLowerCase();
            if (!CUI.rte.Utils.isArray(tagName)) {
                return (domTag == tagName.toLowerCase());
            }
            var tagCnt = tagName.length;
            for (var tagIndex = 0; tagIndex < tagCnt; tagIndex++) {
                if (domTag == tagName[tagIndex].toLowerCase()) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets the namespace for the specified DOM element.
         * @param {HTMLElement} dom The DOM element to retrieve the namespace for
         * @return {String} The namespace of the specified DOM element; null if no namespace
         *         is available (= default HTML namespace)
         */
        getNamespace: function(dom) {
            var com = CUI.rte.Common;

            if (dom && dom.nodeType == 1) {
                // IE 10 doesn't support scopeName in Standards mode anymore, so check
                // before using it and rely on standard compliant behaviour otherwise
                if (com.ua.isIE && dom.scopeName) {
                    if (dom.scopeName != "HTML") {
                        return dom.scopeName.toLowerCase();
                    }
                } else {
                    var tagName = dom.tagName;
                    var sepPos = tagName.indexOf(":");
                    if (sepPos > 0) {
                        return tagName.substring(0, sepPos).toLowerCase();
                    }
                }
            }
            return null;
        },

        /**
         * Inserts the specified node before the second specified node in a
         * browser-independent way.
         * @param {HTMLElement} parentDom The parent node
         * @param {HTMLElement} dom The DOM element to insert
         * @param {HTMLElement} domRef The reference element; null to insert at the end
         *        of the existing child nodes of parentDom
         */
        insertBefore: function(parentDom, dom, domRef) {
            if (domRef != null) {
                parentDom.insertBefore(dom, domRef);
            } else {
                // IE6 bombs if we are using insertBefore(dom, null), so we are using
                // appendChild instead
                parentDom.appendChild(dom);
            }
        },

        /**
         * <p>Checks if the given DOM object has the specified attributes.</p>
         * <p>It is required that all attributes defined in the specified attribute
         * definition have equivalent values in the DOM object for this method to return
         * true.</p>
         * <p>Note that you can use "_class" or "className" to specifiy the name of the
         * class attribute.</p>
         * @param {HTMLElement} dom DOM object to check
         * @param {Object} attribs Attribute definition
         */
        hasAttributes: function(dom, attribs) {
            if (!dom || (dom.nodeType != 1)) {
                return false;
            }
            for (var name in attribs) {
                if (attribs.hasOwnProperty(name)) {
                    if ((name == "_class") || (name == "className")) {
                        name = "class";
                    }
                    var cmpValue = CUI.rte.Common.getAttribute(dom, name);
                    if (cmpValue != attribs[name]) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * <p>Check if an attribute of the specified name is defined for the specified DOM
         * node.</p>
         * <p>The method will also return false if the attribute is defined, but has no
         * content (attrib=""). This is required for IE(6) compoatibility.</p>
         * <p>Note that you can address the "class" attribute of the node through "class"
         * and the "style" attribute through "style".</p>
         * @param {HTMLElement} dom The DOM node to check
         * @param {String} attribName The attribute name to check
         * @return {Boolean} True, if the attribute is defined for the DOM node
         */
        isAttribDefined: function(dom, attribName) {
            var attribValue = CUI.rte.Common.getAttribute(dom, attribName, true);
            return (attribValue != null);
        },

        /**
         * <p>Gets the value of the attribute with the specified name in an
         * browser-independent way.</p>
         * <p>Note that you can address the "class" attribute of the node through "class"
         * and the "style" attribute through "style".</p>
         * @param {HTMLElement} dom The DOM node containing the attribute
         * @param {String} attribName The name of the attribute to retrieve
         * @param {Boolean} normalize True if empty attribute values (attrib="") should be
         *        returned as null rather than a String of length 0
         * @return {String} The attribute's value
         */
        getAttribute: function(dom, attribName, normalize) {
            var com = CUI.rte.Common;

            if (!dom) {
                return null;
            }
            var attribNameLC = attribName.toLowerCase();
            var attribValue;
            if ((attribNameLC == "style") && com.ua.isOldIE) {
                attribValue = dom.style.cssText;
            } else {
                // the "name" attribute of an "a" tag must be retrieved through the
                // "attributes" collection for IE 6/7; see bug #36231
                var tagName = dom.tagName.toLowerCase();
                if ((com.ua.isIE6 || com.ua.isIE7)
                        && ((attribNameLC == "name") && (tagName == "a"))) {
                    attribValue = dom.attributes["name"].nodeValue;
                } else {
                    attribValue = dom.getAttribute(
                            CUI.rte.Common.getIEAttributeName(attribName));
                }
            }
            if (normalize && ((attribValue != null) && (attribValue.length == 0))) {
                attribValue = null;
            }
            if (normalize && (attribValue != null)) {
                if ((attribNameLC == "colspan") || (attribNameLC == "rowspan")) {
                    try {
                        if (parseInt(attribValue) == 1) {
                            attribValue = null;
                        }
                    } catch (e) {
                        // ignored
                    }
                }
            }
            return attribValue;
        },

        /**
         * <p>Sets the value of the attribute with the specified name to the specified value
         * in a browser-independent way.</p>
         * <p>Note that you can address the "class" attribute of the node through "class"
         * and the "style" attribute through "style".</p>
         * @param {HTMLElement} dom The DOM element
         * @param {String} attribName The name of the attribute to be set
         * @param {String} attribValue The attribute value to be set
         */
        setAttribute: function(dom, attribName, attribValue) {
            var com = CUI.rte.Common,
                attribNameLC = attribName.toLowerCase();
            if (typeof attribValue != String) {
                attribValue = String(attribValue);
            }
            if ((attribNameLC == "style") && com.ua.isOldIE) {
                dom.style.cssText = attribValue;
                return;
            }
            // the "name" attribute of an "a" tag must be set through the "attributes"
            // collection for IE 6/7; see bug #36231
            if ((com.ua.isIE6 || com.ua.isIE7)
                    && ((attribNameLC == "name") && (dom.tagName.toLowerCase() == "a"))) {
                dom.attributes["name"].nodeValue = attribValue;
                return;
            }
            attribName = CUI.rte.Common.getIEAttributeName(attribName);
            dom.setAttribute(attribName, attribValue);
        },

        /**
         * Removes the specified attribute from the specified DOM element.
         * @param {HTMLElement} dom The DOM element
         * @param {String} attribName Name of attribute to remove
         */
        removeAttribute: function(dom, attribName) {
            var com = CUI.rte.Common;

            if (com.ua.isOldIE) {
                if (attribName == "style") {
                    dom.style.cssText = null;
                    return;
                }
            }
            dom.removeAttribute(CUI.rte.Common.getIEAttributeName(attribName));
        },

        /**
         * Copies an attribute from dom1 to dom2 if it is actually available on dom1.
         * @param {HTMLElement} dom1 The source DOM element
         * @param {HTMLElement} dom2 The destination DOM element
         * @param {String} attribName The name of the attribute to be copied
         */
        copyAttribute: function(dom1, dom2, attribName) {
            var attribValue = dom1[attribName];
            if (attribValue != null) {
                dom2[attribName] = attribValue;
            }
        },

        /**
         * Copies all available attributes from dom1 to dom2.
         * @param {HTMLElement} dom1 The source DOM element
         * @param {HTMLElement} dom2 The destination DOM element
         * @param {String[]} excludedAttribs (optional) List of attribute names to be
         *        excluded from copying
         */
        copyAttributes: function(dom1, dom2, excludedAttribs) {
            var com = CUI.rte.Common;
            var a, attributeCnt, attrib, attribName;
            if (com.ua.isIE6 || com.ua.isIE7) {
                // IE needs a special way of handling things again ...
                var attribNames = com.getIEAttributeNames(dom1, true);
                attributeCnt = attribNames.length;
                for (a = 0; a < attributeCnt; a++) {
                    attribName = attribNames[a];
                    if ((excludedAttribs == null)
                            || !com.arrayContains(excludedAttribs, attribName)) {
                        var attribValue;
                        var attribNameLC = attribName.toLowerCase();
                        if (attribNameLC == "style") {
                           attribValue = dom1.style.cssText;
                        } else if (attribNameLC == "class") {
                            attribValue = dom1.getAttribute("className");
                            attribName = "className";
                        } else if (com.isTag(dom1, "a") && (attribNameLC == "name")) {
                            attribValue = dom1.attributes["name"].nodeValue;
                        } else {
                            attribValue = dom1.getAttribute(attribName);
                        }
                        if (attribValue != null) {
                            if (attribNameLC == "style") {
                                dom2.style.cssText = attribValue;
                            } else if (com.isTag(dom2, "a") && (attribNameLC == "name")) {
                                dom2.attributes["name"].nodeValue = attribValue;
                            } else {
                                dom2.setAttribute(attribName, attribValue);
                            }
                        }
                    }
                }
                return;
            }
            var attribs = dom1.attributes;
            attributeCnt = attribs.length;
            for (a = 0; a < attributeCnt; a++) {
                attrib = attribs[a];
                attribName = attrib.name;
                attribName = (com.ua.isIE8 ? attribName.toLowerCase() : attribName);
                if ((excludedAttribs == null)
                        || !com.arrayContains(excludedAttribs, attribName)) {
                    // don't need colspan/rowspan's of 1, as reported by IE 8
                    var value = attrib.value;
                    if (com.ua.isIE8) {
                        if ((attribName == "colspan") || (attribName == "rowspan")) {
                            if (value == "1") {
                                value = null;
                            }
                        }
                    }
                    if (value != null) {
                        dom2.setAttribute(attribName, attrib.value);
                    }
                }
            }
        },

        /**
         * <p>Compares the attributes of the specified DOM elements.</p>
         * <p>Note that attributes that are reported to be empty are omitted.</p>
         * @param {HTMLElement} dom1 The first element
         * @param {HTMLElement} dom2 The second element
         * @return {Boolean} True if both elements share the same attributes
         */
        compareAttributes: function(dom1, dom2) {
            var com = CUI.rte.Common;
            var name, value, cmpValue;
            var attribs1 = dom1.attributes;
            var attribs2 = dom2.attributes;
            var a1Cnt = attribs1.length;
            for (var a1 = 0; a1 < a1Cnt; a1++) {
                name = attribs1[a1].name;
                value = com.getAttribute(dom1, name, true);
                if (value != null) {
                    cmpValue = com.getAttribute(dom2, name, true);
                    if (cmpValue != value) {
                        return false;
                    }
                }
            }
            var a2Cnt = attribs2.length;
            for (var a2 = 0; a2 < a2Cnt; a2++) {
                name = attribs2[a2].name;
                value = com.getAttribute(dom2, name, true);
                if (value != null) {
                    cmpValue = com.getAttribute(dom1, name, true);
                    if (cmpValue != value) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * Creates an array with the names of all attributes of the specified DOM element.
         * @param {HTMLElement} dom The DOM element
         * @param {Boolean} keepCase (optional) True if the case of attribute names should
         *        be preserved
         * @param {Function} filter (optional) A filter method that allows to filter out a
         *        specific attribute; gets the DOM element, the attribute name and the
         *        lower case representation of the attribute's name as parameters; must
         *        return true to filter out the attribute.
         * @return {String[]} Array with all attribute names
         */
        getAttributeNames: function(dom, keepCase, filter) {
            var com = CUI.rte.Common;

            if (com.ua.isOldIE) {
                return CUI.rte.Common.getIEAttributeNames(dom, keepCase, filter);
            }
            // this is the correct method to determine valid DOM attributes on other
            // browsers
            var attribNames = [ ];
            var attribCnt = dom.attributes.length;
            for (var a = 0; a < attribCnt; a++) {
                var attribName = dom.attributes.item(a).nodeName;
                var attribNameLC = attribName.toLowerCase();
                var isFilteredOut = false;
                if (filter) {
                    isFilteredOut = filter(dom, attribName, attribNameLC);
                }
                if (!isFilteredOut) {
                    attribNames.push(keepCase ? attribName : attribNameLC);
                }
            }
            return attribNames;
        },

        /**
         * Gets all DOM nodes below the specified node (including the node itself) that are
         * of the specified type.
         * @param {HTMLElement} dom DOM node to check (recursively)
         * @param {String|String[]} tagName Tag name(s) of the specified type(s)
         * @return {HTMLElement[]} Array containing all specified tags
         */
        getTags: function(dom, tagName, nodes) {
            if (!nodes) {
                nodes = [ ];
            }
            var com = CUI.rte.Common;
            if (com.isTag(dom, tagName)) {
                nodes.push(dom);
            }
            if (dom.nodeType == 1) {
                var childCnt = dom.childNodes.length;
                for (var c = 0; c < childCnt; c++) {
                    com.getTags(dom.childNodes[c], tagName, nodes);
                }
            }
            return nodes;
        },

        /**
         * Checks if the specified DOM node or one of its descendants is of the specified
         * type.
         * @param {HTMLElement} dom DOM node to check (recursively)
         * @param {String} tagName Tag name of the specified type
         */
        containsTag: function(dom, tagName) {
            var com = CUI.rte.Common;
            if (com.isTag(dom, tagName)) {
                return true;
            }
            if (dom.nodeType == 1) {
                var childCnt = dom.childNodes.length;
                for (var c = 0; c < childCnt; c++) {
                    if (com.containsTag(dom.childNodes[c], tagName)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * Checks if the specified DOM nodes are equal. This is the case if both nodes
         * share the same tag name and all attributes (structure nodes) or their text
         * contents are equal (text nodes).
         * @param {HTMLElement} dom1 first DOM node
         * @param {HTMLElement} dom2 second DOM node
         * @return {Boolean} true if both DOM nodes are equal according to the rules
         *         specified above
         */
        equals: function(dom1, dom2) {
            var com = CUI.rte.Common;
            if (dom1.nodeType != dom2.nodeType) {
                return false;
            }
            if (dom1.nodeType == 3) {
                return (dom1.nodeValue == dom2.nodeValue);
            }
            if (dom1.tagName.toLowerCase() != dom2.tagName.toLowerCase()) {
                return false;
            }
            return com.compareAttributes(dom1, dom2);
        },

        /**
         * Checks for null in a relaxed way - both null and undefined are accepted.
         * @param {Object} obj The object to check
         * @return {Boolean} True if the specified object is null or undefined
         */
        isNull: function(obj) {
            return (obj === null) || (obj === undefined);
        },

        /**
         * <p>Adds the specified text node to the specified parentNode. If nodeBefore is
         * specified, the text node is inserted before that node. Otherwise, it is appended
         * to the current list of child nodes.</p>
         * <p>Note that this method merges the node with existing text nodes if possible.
         * It returns the actual node and character offset, if the text node has been
         * merged.</p>
         * @param {HTMLElement} dom Text node to append
         * @param {HTMLElement} parentNode Parent node
         * @param {HTMLElement} nodeBefore The node the text has to be inserted before
         * @return {Object} Object defining the actual insert operation; properties:
         *         dom, startPos, charCnt
         */
        addTextNode: function(dom, parentNode, nodeBefore) {
            var text = dom.nodeValue;
            var charCnt = text.length;
            var childCnt = parentNode.childNodes.length;
            if (childCnt == 0) {
                parentNode.appendChild(dom);
                return {
                    "dom": dom,
                    "startPos": 0,
                    "charCnt": charCnt
                };
            }
            var nextSibling = nodeBefore;
            if (nextSibling && (nextSibling.nodeType != 3)) {
                nextSibling = null;
            }
            var prevSibling;
            if (nodeBefore) {
                prevSibling = nodeBefore.previousSibling;
            } else {
                prevSibling = parentNode.lastChild;
            }
            if (prevSibling && (prevSibling.nodeType != 3)) {
                prevSibling = null;
            }
            var startOffs = (prevSibling ? prevSibling.nodeValue.length : 0);
            if (nextSibling && prevSibling) {
                prevSibling.nodeValue += text + nextSibling.nodeValue;
                dom = prevSibling;
                parentNode.removeChild(nextSibling);
            } else if (nextSibling) {
                nextSibling.nodeValue = text + nextSibling.nodeValue;
                dom = nextSibling;
            } else if (prevSibling) {
                prevSibling.nodeValue += text;
                dom = prevSibling;
            } else {
                if (nodeBefore) {
                    parentNode.insertBefore(dom, nodeBefore);
                } else {
                    parentNode.appendChild(dom);
                }
            }
            return {
                "dom": dom,
                "startPos": startOffs,
                "charCnt": charCnt
            };
        },

        /**
         * Get the textual "payload" of the given text node.
         * <p>
         * The payload is the character data that is actually relevant for node/character
         * calculations. It does not have any whitespace in it.
         * @param {Node} node text DOM node (<code>nodeType == 3</code>)
         * @return {String} the textual payload of the given text node
         */
        getNodeText: function(node) {
            if (node.nodeType != 3) {
                return "";
            }
            var nodeText = node.nodeValue;
            if (nodeText) {
                nodeText = nodeText.replace(/[\n\t\r]/g, "");
            }
            return nodeText;
        },

        /**
         * <p>Checks if the specified DOM element represents a (structural) node that must
         * be counted as a character, rather than being ignored for character position
         * calculation. (For example: br, img, a name).</p>
         * <p>Please note that this method does not count empty edit blocks
         * (&lt;p&gt;&lt;/p&gt;) as one character nodes, although they are actually counted
         * as one character nodes due to invalid recursion.</p>
         * @param {HTMLElement} dom The DOM element to be checked
         * @return {Boolean} True if the DOM element must be counted as a character
         */
        isOneCharacterNode: function(dom) {
            if (!dom || (dom.nodeType == 3)) {
                return false;
            }
            var com = CUI.rte.Common;
            var tagList = com.ONE_CHARACTER_NODES;
            for (var i = 0; i < tagList.length; i++) {
                var isMatching = com.matchesTagDef(dom, tagList[i]);
                if (isMatching) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Checks if the specified DOM element represents a character node. A character node
         * is a node that must be counted as a character (regarding caret movement et al).
         * All text nodes are character node. Additionally, several structural nodes (like
         * "a name", "br", "img") are character nodes.
         * @param {HTMLElement} dom The DOM element to be checked
         * @return {Boolean} True if the DOM element is a character
         */
        isCharacterNode: function(dom) {
            if (!dom) {
                return false;
            }
            return (dom.nodeType == 3) || CUI.rte.Common.isOneCharacterNode(dom);
        },

        /**
         * Checks if the specified DOM element represents an editable node. A editable
         * node is a text node, a "one character" structural node and empty edit blocks.
         * @param {HTMLElement} dom The DOM element to be checked
         * @return {Boolean} True if the DOM element is an editable node
         */
        isEditableNode: function(dom) {
            if (!dom) {
                return false;
            }
            var com = CUI.rte.Common;
            return com.isCharacterNode(dom) || com.isEmptyEditingBlock(dom, true);
        },

        /**
         * Checks if the specified node is a or contains at least one character node (as a
         * child node).
         * @param {HTMLElement} dom The DOM element to be checked
         * @return {Boolean} True if the DOM element contains at least one character
         */
        containsCharacterNode: function(dom) {
            var com = CUI.rte.Common;
            if (com.isCharacterNode(dom)) {
                return true;
            }
            if (dom.nodeType != 1) {
                return false;
            }
            var children = dom.childNodes;
            var childCnt = children.length;
            for (var c = 0; c < childCnt; c++) {
                if (com.containsCharacterNode(children[c])) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Determines all character nodes for the subtree starting at the specified node.
         * @param {HTMLElement} dom
         * @return {HTMLElement[]} Array containing all character nodes
         */
        getCharacterNodes: function(dom, array) {
            var com = CUI.rte.Common;
            if (!array) {
                array = [ ];
            }
            if (com.isCharacterNode(dom)) {
                array.push(dom);
            }
            if (dom.nodeType == 1) {
                var children = dom.childNodes;
                var childCnt = children.length;
                for (var c = 0; c < childCnt; c++) {
                    com.getCharacterNodes(children[c], array);
                }
            }
            return array;
        },

        /**
         * Checks if the specified node is an empty edit block tag (ie &lt;p&gt;&lt;/p&gt;,
         * which is used by IE).
         * @param {HTMLElement} dom The DOM element to be checked
         * @param {Boolean} checkDeep (optional) True if the specified node will qualify
         *        as "empty" if it has no "character" child nodes. False, if the specified
         *        node must only qualify as "empty" if it has no child nodes
         * @return {Boolean} True if the DOM element is an empty edit block
         */
        isEmptyEditingBlock: function(dom, checkDeep) {
            var com = CUI.rte.Common;
            if (dom.nodeType == 3) {
                return false;
            }
            if (!com.isTag(dom, com.EDITBLOCK_TAGS)) {
                return false;
            }
            if (!checkDeep) {
                return (dom.childNodes.length == 0);
            }
            return !com.containsCharacterNode(dom);
        },

        /**
         * Get the number of characters of the given node that are relevant for the
         * calculation of character positions.
         * <p>
         * Note that this method does not work recursively.
         * @see CUI.rte.Common.getNodeText
         * @param {Node} node DOM node
         * @return {Number} Number of relevant characters
         */
        getNodeCharacterCnt: function(node) {
            var com = CUI.rte.Common;
            if (node.nodeType == 1) {
                if (com.isOneCharacterNode(node)) {
                    return 1;
                }
                // consider empty edit blocks as well
                if (com.isEmptyEditingBlock(node, true)) {
                    return 1;
                }
                return 0;
            }
            var nodeText = CUI.rte.Common.getNodeText(node);
            if (nodeText) {
                return nodeText.length;
            }
            return 0;
        },

        /**
         * <p>Gets the number of characters of the specified node and all of its subnodes
         * that are relevant for the calculation of character positions.</p>
         * <p>Note that this method works recursively and doesn't consider edit block roots
         * ("p", "td", "li").</p>
         * .
         * @see CUI.rte.Common.getNodeText
         * @param {Node} node DOM node
         * @return {Number} Number of relevant characters
         */
        getNodeTextLength: function(node) {
            var com = CUI.rte.Common;
            if (node.nodeType == 3) {
                return com.getNodeCharacterCnt(node);
            } else if (node.nodeType == 1) {
                var charCnt = com.getNodeCharacterCnt(node);
                var childCnt = node.childNodes.length;
                for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                    var childToProcess = node.childNodes[childIndex];
                    charCnt += com.getNodeTextLength(childToProcess);
                }
                return charCnt;
            }
            return 0;
        },

        /**
         * Get the node at the given character position.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Number} pos character position to be calculated
         * @return {Object} definition of the DOM node at the given character position
         */
        getNodeAtPosition: function(context, pos) {
            var state = {
                "node": null,
                "charPos": 0,
                "nodeBefore": null
            };
            getNodeAtPositionRec(context, context.root, state, pos);
            var node = state.node;
            if (!node) {
                if (!state.nodeBefore) {
                    return null;
                }
                node = {
                    "dom": null,
                    "nodeBefore": state.nodeBefore
                };
            }
            return node;
        },

        /**
         * Calculates the character position of the given node.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Node} node DOM node for which the character offset is to be calculated
         * @return {Number} Character position for the given node
         */
        getCharacterOffsetForNode: function(context, node) {
            return getCharacterOffsetForNodeRec(context, node, 0, context.root).charPos;
        },

        /**
         * <p>Get the previous sibling of the specified DOM node.</p>
         * <p>This method considers multiple hierarchical levels (whereas
         * HTMLElement.nextSibling only works on the same hierarchical level) and can be
         * used for DOM walking.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} previous sibling of dom; <code>null</code> if
         *         there is no previous sibling
         */
        getPreviousNode: function(context, node) {
            if (node.previousSibling) {
                node = node.previousSibling;
                while (true) {
                    var childCnt = node.childNodes.length;
                    if (childCnt == 0) {
                        return node;
                    }
                    node = node.childNodes[childCnt - 1];
                }
            }
            return CUI.rte.Common.getParentNode(context, node);
        },

        /**
         * <p>Get the previous text sibling of the given DOM node.</p>
         * <p>Note that "text like" structural elements (like br or img) are not considered
         * by this method.</p>
         * <p>Note on handling break tags: the method will not return a previous node if
         * break tags are specified and the initial node's type is one of the break tags.
         * This is contrary to the behaviour of {@link #getNextTextNode}, but correct in
         * the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} previous text sibling of dom; null if there is no previous
         *         sibling
         */
        getPreviousTextNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            if (breakTags && com.isTag(node, breakTags)) {
                return null;
            }
            do {
                node = com.getPreviousNode(context, node);
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && (node.nodeType != 3));
            return node;
        },

        /**
         * <p>Get the previous sibling of the given DOM node that is handled as a character
         * node in the context of positioning the caret.</p>
         * <p>Hence "text like" structural elements (like br or img) are considered by this
         * method.</p>
         * <p>Note on handling break tags: the method will not return a previous node if
         * break tags are specified and the initial node's type is one of the break tags.
         * This is contrary to the behaviour of {@link #getNextCharacterNode}, but
         * correct in the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} previous sibling of dom that is a text node or has to be
         *         handled like a character for caret positioning; null if there is no
         *         previous sibling
         */
        getPreviousCharacterNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            // if we're looking for a previous node, we'll have to check the starting
            // node also, contrary to getNextCharacterNode
            if ((breakTags && com.isTag(node, breakTags)) || (node === context.root)) {
                return null;
            }
            do {
                node = com.getPreviousNode(context, node);
                if (node === context.root) {
                    node = null;
                    break;
                }
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && (com.getNodeCharacterCnt(node) === 0));
            return node;
        },

        /**
         * <p>Get the previous sibling of the given DOM node that is editable.</p>
         * <p>This method returns text nodes, "one character" structural nodes and
         * empty editing blocks (IE only).</p>
         * <p>Note on handling break tags: the method will not return a previous node if
         * break tags are specified and the initial node's type is one of the break tags.
         * This is contrary to the behaviour of {@link #getNextTextNode}, but correct in
         * the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} next sibling of dom that is a text node or has to be
         *         handled like a character for caret positioning; null if there is no
         *         next sibling
         */
        getPreviousEditableNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            if (!node) {
                return null;
            }
            if (breakTags && com.isTag(node, breakTags)) {
                return null;
            }
            do {
                node = com.getPreviousNode(context, node);
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && !com.isEditableNode(node));
            return node;
        },

        /**
         * <p>Get the next sibling of the specified DOM node.</p>
         * <p>This method considers multiple hierarchical levels (whereas
         * HTMLElement.nextSibling only works on the same hierarchical level) and can be
         * used for DOM walking.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} next sibling of dom; null if there is no next sibling
         */
        getNextNode: function(context, node) {
            if (node.childNodes.length > 0) {
                return node.childNodes[0];
            }
            if (node.nextSibling) {
                return node.nextSibling;
            }
            while (true) {
                node = CUI.rte.Common.getParentNode(context, node);
                if (!node || (node === context.root)) {
                    return null;
                }
                if (node.nextSibling) {
                    return node.nextSibling;
                }
            }
        },

        /**
         * <p>Get the next text sibling of the specified DOM node.</p>
         * <p>Note that "text like" structural elements (like br or img) are not considered
         * by this method.</p>
         * <p>Note on handling break tags: the method will return a next node if break tags
         * are specified and the initial node's type is one of the break tags. This is
         * contrary to the behaviour of {@link #getPreviousTextNode}, but correct in
         * the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} next text sibling of dom; null if there is no previous
         *         sibling
         */
        getNextTextNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            do {
                node = com.getNextNode(context, node);
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && (node.nodeType != 3));
            return node;
        },

        /**
         * <p>Get the next sibling of the given DOM node that is handled as a character
         * node in the context of positioning the caret.</p>
         * <p>Hence "text like" structural elements (like br or img) are considered by this
         * method.</p>
         * <p>Note on handling break tags: the method will return a next node if break tags
         * are specified and the initial node's type is one of the break tags. This is
         * contrary to the behaviour of {@link #getPreviousCharacterNode}, but correct in
         * the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} next sibling of dom that is a text node or has to be
         *         handled like a character for caret positioning; null if there is no
         *         next sibling
         */
        getNextCharacterNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            do {
                node = com.getNextNode(context, node);
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && (com.getNodeCharacterCnt(node) == 0));
            return node;
        },

        /**
         * <p>Get the next sibling of the given DOM node that is editable.</p>
         * <p>This method returns text nodes, "one character" structural nodes and
         * empty editing blocks (IE only).</p>
         * <p>Note on handling break tags: the method will return a next node if break tags
         * are specified and the initial node's type is one of the break tags. This is
         * contrary to the behaviour of {@link #getPreviousEditableNode}, but correct in
         * the context of DOM traversal.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM node
         * @return {HTMLElement} next sibling of dom that is a text node or has to be
         *         handled like a character for caret positioning; null if there is no
         *         next sibling
         */
        getNextEditableNode: function(context, node, breakTags) {
            var com = CUI.rte.Common;
            if (!node) {
                return null;
            }
            do {
                node = com.getNextNode(context, node);
                if (breakTags && com.isTag(node, breakTags)) {
                    node = null;
                    break;
                }
            } while (node && !com.isEditableNode(node));
            return node;
        },

        /**
         * <p>Check if dom1 is an ancestor node of dom2.</p>
         * <p>Note that this method will (correctly) return false if dom1 == dom2.</p>
         * @param {HTMLElement} dom1 potential DOM ancestor node
         * @param {HTMLElement} dom2 potential DOM descendant node
         * @return {Boolean} True if <code>dom1</code> is an ancestor node
         *         of <code>dom2</code>
         */
        isAncestor: function(context, dom1, dom2) {
            if (!dom1 || !dom2) {
                return false;
            }
            do {
                dom2 = CUI.rte.Common.getParentNode(context, dom2);
                if (dom2) {
                    if (dom2 == dom1) {
                        return true;
                    }
                }
            } while (dom2);
            return false;
        },

        /**
         * Checks if any of the descendant nodes of the specified sub-tree root has any of
         * the specified tags.
         * @param {HTMLElement} subTreeRoot The sub-tree root to check (node not included)
         * @param {String/String[]} tags The tag(s) to check against
         */
        isLastChildDeep: function(subTreeRoot, tags) {
            var com = CUI.rte.Common;
            var checkNode = subTreeRoot;
            do {
                if (checkNode.nodeType != 1) {
                    return false;
                }
                var children = checkNode.childNodes;
                if (children.length == 0) {
                    return false;
                }
                checkNode = children[children.length - 1];
                if (com.isTag(checkNode, tags)) {
                    return true;
                }
            } while (true);
        },

        /**
         * Checks if the specified element is the last element of a nesting level, for
         * example the last cell of a table that is nested into another table.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node to check
         */
        isLastElementOfNestingLevel: function(context, node) {
            var com = CUI.rte.Common;
            // get the corresponding nesting element
            while (!com.isTag(node, com.EDITBLOCK_NESTED_TAGS)
                    && !com.isTag(node, com.EDITBLOCK_UNREGNEST_TAGS)) {
                node = com.getParent(context, node);
                if (!node) {
                    return false;
                }
            }
            var pNode = com.getParentNode(context, node);
            if (!pNode) {
                return false;
            }
            var maxChild = pNode.childNodes.length - 1;
            if (com.getChildIndex(node) != maxChild) {
                return false;
            }
            // this is only valid for nested tags, so ensure that we are actually in a
            // nested context
            // todo check if this is true for mixed nestings (list in a table/table in a list)
            if (!com.containsTagInPath(context, pNode, com.EDITBLOCK_UNREGNEST_TAGS)
                    && !com.containsTagInPath(context, pNode, com.EDITBLOCK_NESTED_TAGS)) {
                return false;
            }
            // ok, we are last in the list of the parent element; this may not be enough
            // (we may have found last cell of a row, but not of the entire table), so
            // we'll do some further element-specific stuff here
            if (com.isTag(node, [ "td", "th" ])) {
                var tBody = com.getParentNode(context, pNode);
                if (!tBody) {
                    return false;
                }
                maxChild = tBody.childNodes.length - 1;
                return (com.getChildIndex(pNode) == maxChild);
            }
            // in case of a list item, we can have multiple adjacent nested lists on the
            // same hierarchical level; this method must return false for all nested list
            // items besides the very last item
            if (com.isTag(node, "li")) {
                var list = node.parentNode;
                return com.isLastNestedList(context, list);
            }
            return true;
        },

        /**
         * Gets the index that the given DOM node has in the <code>childNodes</code> array
         * of its parent node.
         * @param {HTMLElement} node The DOM node to check
         * @return {Number} child index in dom's parent node; -1 if the specified DOM node
         *         has no parent
         */
        getChildIndex: function(node) {
            if (!node.parentNode) {
                return -1;
            }
            var childCnt = node.parentNode.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                if (node.parentNode.childNodes[childIndex] == node) {
                    return childIndex;
                }
            }
            return -1;
        },

        /**
         * Get the last "deep-child" of the given node.
         * <p>
         * This method works recursively. It will actually get the last descendant node.
         * @param {HTMLElement} node DOM node
         * @return {HTMLElement} The last descendant node; null if there are no
         *         descendant nodes
         */
        getLastChild: function(node, isRecCall) {
            var com = CUI.rte.Common;
            if (node.nodeType == 3) {
                return node;
            }
            var childCnt = node.childNodes.length;
            if (childCnt == 0) {
                return (isRecCall ? node : null);
            }
            return com.getLastChild(node.childNodes[childCnt - 1], true);
        },

        /**
         * <p>Get the first "deep-child" of the given node.</p>
         * <p>This method works recursively. It will actually get the first descendant node.
         * </p>
         * @param {HTMLElement} node DOM node
         * @return {HTMLElement} The first descendant node; null if there are no
         *         descendant nodes
         */
        getFirstChild: function(node, isRecCall) {
            var com = CUI.rte.Common;
            if (node.nodeType == 3) {
                return node;
            }
            var childCnt = node.childNodes.length;
            if (childCnt == 0) {
                return (isRecCall ? node : null);
            }
            return com.getFirstChild(node.childNodes[0], true);
        },

        /**
         * Check if the given node has a textual descendant node (or is itself a textual
         * node).
         * <p>
         * Note on using useTextLen: If set to true, this method will also consider
         * "text-like" structural DOM nodes (such as br) as text.
         * @param {HTMLElement} node Node to check
         * @param {Boolean} useTextLen True if the text length should be used (instead of
         *        the actual nodeType) to determine if a given node has a textual descendant
         *        node
         * @return {Boolean} True if the given node has a textual descendant, else false
         */
        hasTextChild: function(node, useTextLen) {
            return (CUI.rte.Common.getFirstTextChild(node, useTextLen) != null);
        },

        /**
         * <p>Get the first descendant text node of the given node.</p>
         * <p>Note on using useTextLen: If set to true, this method will also consider
         * "text-like" structural DOM nodes (such as br) as text. So be aware that you
         * might get a non-textual node as a result if you are setting this option.</i>
         * @param {HTMLElement} node Node for which the text node has to be determined
         * @param {Boolean} useTextLen True if the text length should be used (instead of
         *        the actual nodeType) to determine if a given node contains text
         * @param {Boolean} includeSelf True if the specified node itself is considered as
         *        a potential text node
         * @return {HTMLElement} The first descendant text node; null, if there is no
         *         text node available
         */
        getFirstTextChild: function(node, useTextLen, includeSelf) {
            var com = CUI.rte.Common;
            if (includeSelf) {
                if (useTextLen) {
                    if (com.getNodeCharacterCnt(node) > 0) {
                        return node;
                    }
                } else if (node.nodeType == 3) {
                    return node;
                }
            }
            var childCnt = node.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var textNode = com.getFirstTextChild(node.childNodes[c], useTextLen, true);
                if (textNode) {
                    return textNode;
                }
            }
            return null;
        },

        /**
         * Get the last descendant text node of the given node.
         * @param {HTMLElement} node Node for which the text node has to be determined
         * @param {Boolean} useTextLen True if the text length should be used (instead of
         *        the actual nodeType) to determine if a given node contains text
         * @param {Boolean} includeSelf True if the specified node itself is considered as
         *        a potential text node
         * @return {HTMLElement} The last descendant text node; null, if there is no
         *         text node available
         */
        getLastTextChild: function(node, useTextLen, includeSelf) {
            var com = CUI.rte.Common;
            if (includeSelf) {
                if (useTextLen) {
                    if (com.getNodeCharacterCnt(node) > 0) {
                        return node;
                    }
                } else if (node.nodeType == 3) {
                    return node;
                }
            }
            var childCnt = node.childNodes.length;
            for (var c = childCnt - 1; c >= 0; c--) {
                var textNode = com.getLastTextChild(node.childNodes[c], useTextLen, true);
                if (textNode) {
                    return textNode;
                }
            }
            return null;
        },

        /**
         * Creates an (independent) array of the specified node's child nodes.
         * @param {HTMLElement} dom The node to create the child's list from
         * @return {HTMLElement[]} List of child nodes
         */
        childNodesAsArray: function(dom) {
            var array = [ ];
            if (dom.nodeType == 1) {
                var childCnt = dom.childNodes.length;
                for (var c = 0; c < childCnt; c++) {
                    array.push(dom.childNodes[c]);
                }
            }
            return array;
        },

        /**
         * Get the parent node of the given DOM node, up to (and including) the
         * document's root node.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node DOM node for which the parent node has to be determined
         * @return {HTMLElement} parent node; <code>null</code> if the given node has no
         *         more "content" parent nodes
         */
        getParentNode: function(context, node) {
            if (node == context.root) {
                return null;
            }
            return node.parentNode;
        },

        /**
         * Gets the window object for the specified document.
         * @param {document} doc The document
         * @returns {window} The corresponding window object
         */
        getWindowForDocument: function(doc) {
            return (CUI.rte.Common.ua.isIE ? doc.parentWindow : doc.defaultView)
        },

        /**
         * Determines the parent element that contains the reference of the document's
         * window object, for example the parent iframe object.
         * @param {CUI.rte.EditContext} context The edit context
         * @returns {HTMLElement} The element that "hosts" the document's window object
         */
        getParentWindowRef: function(context) {
            var win = context.win;
            if (win.frameElement) {
                return win.frameElement;
            }
            return undefined;
        },

        /**
         * Initializes the "touch in iframe" user agent property. If the RTE is used
         * inside an iframe on a touch device, no touch events may be used, as Safari
         * goes crazy if they are used.
         * @param {CUI.rte.EditContext} context The edit context
         */
        initializeTouchInIframe: function(context) {
            var com = CUI.rte.Common;
            com.ua.isTouchInIframe = com.ua.isTouch && com.getParentWindowRef(context);
        },

        /**
         * <p>Checks if the specified node is a "zombie node".</p>
         * <p>Later Gecko versions introduced the behaviour that sometimes nodes get
         * referenced (for example by the selection) that are not connected to the
         * document anymore. This method can be used to detect such cases.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM node to check
         * @return {Boolean} True if the specified node is a zombie node
         */
        isZombieNode: function(context, dom) {
            while (dom) {
                if (dom == context.root) {
                    return false;
                }
                dom = dom.parentNode;
            }
            return true;
        },

        /**
         * Get the "block node" for the given DOM node.
         * <p>
         * Note that this method does only return the ancestor node (of <code>dom</code>)
         * that is a direct child of the document's root element. For proper block node
         * detection see the {@link #BLOCK_TAGS} array.
         * @see CUI.rte.DomProcessor#getScopedBlockNode
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom DOM node for which the "block node" has to be determined
         * @deprecated Use proper detection of block nodes instead
         */
        getBlockNode: function(context, dom) {
            var com = CUI.rte.Common;
            while (dom) {
                if (com.getParentNode(context, dom.parentNode) == null) {
                    return dom;
                }
                dom = dom.parentNode;
            }
            return null;
        },

        /**
         * Checks if the given DOM node is a "block node".
         * <p>
         * Note that this method only checks if the given node is a direct child of the
         * document's body tag. For proper block node detection see the {@link #BLOCK_TAGS}
         * array.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom DOM node to check
         * @return {Boolean} True if the given DOM node is a direct child of
         *         the document's body element
         * @deprecated Use proper detection of block nodes instead
         */
        isBlockNode: function(context, dom) {
            return (dom && dom.parentNode
                    && CUI.rte.Common.isRootNode(context, dom.parentNode));
        },

        /**
         * @deprecated Use proper detection of block nodes instead
         */
        getLastBlockNode: function(context, dom) {
            while (!CUI.rte.Common.isRootNode(context, dom)) {
                dom = dom.parentNode;
            }
            var blocks = context.root.childNodes;
            if (blocks.length == 0) {
                return null;
            }
            return blocks[blocks.length - 1];
        },

        hasContent: function(dom) {
            if (dom.nodeType == 3) {
                return true;
            }
            var childCnt = dom.childNodes.length;
            if (childCnt == 0) {
                return false;
            }
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = dom.childNodes[childIndex];
                if (childToProcess.nodeType == 3) {
                    var text = childToProcess.nodeValue;
                    text = text.replace(/[\n\t\r \u00A0]/g, "");
                    if (text.length > 0) {
                        return true;
                    }
                } else {
                    var hasChildContent = CUI.rte.Common.hasContent(
                            childToProcess);
                    if (hasChildContent) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * <p>Gets the first node "up the DOM tree" that matches the specified tag
         * definition (tag name and attributes).</p>
         * <p>If the specified DOM matches the tag definition itself, it is returned instead
         * of any super matching element.</p>
         * @param {CUI.rte.EditContext} context
         * @param {HTMLElement} dom The DOM element to start DOM traversal with
         * @param {String} tagName The tag name to check for
         * @param {Object} attribs Attribute definition
         * @return {HTMLElement} The first super element that matches the specified
         *         tag definition; null if no such element exists
         */
        getTagInPath: function(context, dom, tagName, attribs) {
            var com = CUI.rte.Common;
            while (dom) {
                if (dom.nodeType == 1) {
                    if (dom == context.root) {
                        return null;
                    }
                    if (com.isTag(dom, tagName)) {
                        if (!attribs || com.hasAttributes(dom, attribs)) {
                            return dom;
                        }
                    }
                }
                dom = com.getParentNode(context, dom);
            }
            return null;
        },

        containsTagInPath: function(context, dom, tagName, attribs) {
            return (CUI.rte.Common.getTagInPath(context, dom, tagName, attribs)
                    != null);
        },

        matchesTagDefs: function(dom, tagDefs) {
            var com = CUI.rte.Common;
            if (!CUI.rte.Utils.isArray(tagDefs)) {
                return com.matchesTagDef(dom, tagDefs);
            }
            var defCnt = tagDefs.length;
            for (var t = 0; t < defCnt; t++) {
                if (CUI.rte.Common.matchesTagDef(dom, tagDefs[t])) {
                    return true;
                }
            }
            return false;
        },

        matchesTagDef: function(dom, tagDef) {
            var com = CUI.rte.Common;
            if (!com.isTag(dom, tagDef.tagName)) {
                return false;
            }
            var attribIndex, attribCnt, attribToCheck;
            if (tagDef.attribsDefined) {
                attribCnt = tagDef.attribsDefined.length;
                for (attribIndex = 0; attribIndex < attribCnt; attribIndex++) {
                    attribToCheck = tagDef.attribsDefined[attribIndex];
                    if (!com.isAttribDefined(dom, attribToCheck)) {
                        return false;
                    }
                }
            }
            if (tagDef.attribsUndefined) {
                attribCnt = tagDef.attribsUndefined.length;
                for (attribIndex = 0; attribIndex < attribCnt; attribIndex++) {
                    attribToCheck = tagDef.attribsUndefined[attribIndex];
                    if (com.isAttribDefined(dom, attribToCheck)) {
                        return false;
                    }
                }
            }
            if (tagDef.attribValues) {
                var def = tagDef.attribValues;
                for (var name in def) {
                    if (def.hasOwnProperty(name)) {
                        attribToCheck = com.getAttribute(dom, name, true);
                        if (!attribToCheck) {
                            return false;
                        }
                        if (attribToCheck != def[name]) {
                            return false;
                        }
                    }
                }
            }
            if (tagDef.empty) {
                if (dom.childNodes.length > 0) {
                    return false;
                }
            }
            return true;
        },

        /**
         * <p>Gets the list nesting level for the specified DOM element.</p>
         * <p>If the specified DOM element is a list itself, it does not add as another
         * list level.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element to determine list nesting for
         * @return {Number} The list nesting level of the specified DOM element
         */
        getListLevel: function(context, dom) {
            var com = CUI.rte.Common;
            var indentLevel = 0;
            while (dom) {
                dom = com.getParentNode(context, dom);
                if (dom && (com.isTag(dom, "ul") || com.isTag(dom, "ol"))) {
                    indentLevel++;
                }
            }
            return indentLevel;
        },

        /**
         * Checks if the specified list DOM is the first nested list.
         * @param {HTMLElement} listDom DOM of list to check
         * @return {Boolean} True if the specified list DOM is the first nested list
         */
        isFirstNestedList: function(context, listDom) {
            // todo adapt if other unregular nested structures are supported in the future
            var com = CUI.rte.Common;
            var itemDom = com.getTagInPath(context, listDom, "li");
            if (!itemDom) {
                return false;
            }
            var childCnt = itemDom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var childToCheck = itemDom.childNodes[c];
                if (childToCheck == listDom) {
                    return true;
                }
                if (com.isTag(childToCheck, com.LIST_TAGS)) {
                    return false;
                }
            }
            return false;
        },

        /**
         * Checks if the specified list DOM is the last nested list.
         * @param {HTMLElement} listDom DOM of list to check
         * @return {Boolean} True if the specified list DOM is the first nested list
         */
        isLastNestedList: function(context, listDom) {
            var com = CUI.rte.Common;
            var itemDom = com.getTagInPath(context, listDom, "li");
            if (!itemDom) {
                return false;
            }
            var childCnt = itemDom.childNodes.length;
            for (var c = childCnt - 1; c >= 0; c--) {
                var childToCheck = itemDom.childNodes[c];
                if (childToCheck == listDom) {
                    return true;
                }
                if (com.isTag(childToCheck, com.LIST_TAGS)) {
                    return false;
                }
            }
            return false;
        },

        /**
         * Gets all child nodes of the specified DOM element that are of a specified type.
         * @param {HTMLElement} dom The DOM element
         * @param {String|String[]} tagName Type(s) to look for
         * @param {Boolean} isRecursive True if the search should be executed recursively
         * @param {String|String[]} stopTag Tag(s) to stop further recursion. For example,
         *        if "table" is specified here, nested tables will not be considered by
         *        the search.
         * @param {HTMLElement[]} result (optional) Array the results have to be added to
         * @return {HTMLElement[]} Array with all child nodes that match the specified
         *         criteria
         */
        getChildNodesByType: function(dom, tagName, isRecursive, stopTag, result) {
            var com = CUI.rte.Common;
            result = result || [ ];
            var children = dom.childNodes;
            var childCnt = children.length;
            for (var i = 0; i < childCnt; i++) {
                var child = children[i];
                if (com.isTag(child, tagName)) {
                    result.push(child);
                }
                if (isRecursive && (child.nodeType == 1)) {
                    var isStopTag = stopTag && com.isTag(child, stopTag);
                    if (!isStopTag) {
                        com.getChildNodesByType(child, tagName, isRecursive, stopTag,
                                result);
                    }
                }
            }
            return result;
        },

        getConsistentStyle: function(context, domList, styleName, defaultValue) {
            var nodeCnt = domList.length;
            var consistentStyle;
            for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
                var dom = domList[nodeIndex];
                var styleAttrib = CUI.rte.Common.getStyleProp(context, dom, styleName);
                styleAttrib = (styleAttrib ? styleAttrib : defaultValue);
                if (nodeIndex == 0) {
                    consistentStyle = styleAttrib;
                } else if (styleAttrib != consistentStyle) {
                    return null;
                }
            }
            return consistentStyle;
        },


        // --- DOM processing --------------------------------------------------------------

        // TODO check if this can be replaced by DomProcessor.insertElement
        insertNode: function(dom, node, offset) {
            var com = CUI.rte.Common;
            if (node.nodeType == 1) {
                if (!offset) {
                    if (com.isOneCharacterNode(node)) {
                        node.parentNode.insertBefore(dom, node);
                    } else {
                        node.appendChild(dom);
                    }
                } else if (offset >= node.childNodes.length) {
                    node.parentNode.append(dom);
                } else {
                    var insertRef = node.childNodes[offset];
                    node.parentNode.insertBefore(dom, insertRef);
                }
                return;
            }
            if (offset == 0) {
                node.parentNode.insertBefore(dom, node);
            } else if (offset >= com.getNodeCharacterCnt(node)) {
                node.parentNode.insertBefore(dom, node.nextSibling);
            } else {
                var nodeText = node.nodeValue;
                node.nodeValue = nodeText.substring(0, offset);
                var splitTextNode = node.cloneNode(false);
                splitTextNode.nodeValue = nodeText.substring(offset, nodeText.length);
                var nextSibling = node.nextSibling;
                var pNode = node.parentNode;
                pNode.insertBefore(dom, nextSibling);
                pNode.insertBefore(splitTextNode, nextSibling);
            }
        },

        /**
         * <p>Replaces one DOM element with another without changing the DOM structure
         * (other than replacing the DOM element).</p>
         * <p>If the replacement is an entire structure, you should specify childParent,
         * which specifies the node to which the child nodes of the replaced node are
         * moved.</p>
         * @param {HTMLElement} toReplace The node to be replaced
         * @param {HTMLElement} replacement The node (or substructure) to replace with
         * @param {HTMLElement} childParent (optional, if a substructure is specified as
         *        replacement) The node the child nodes of toReplace will be moved to
         */
        replaceNode: function(toReplace, replacement, childParent) {
            var children = toReplace.childNodes;
            if (!childParent) {
                childParent = replacement;
            }
            while (children.length > 0) {
                var child = children[0];
                toReplace.removeChild(child);
                childParent.appendChild(child);
            }
            toReplace.parentNode.replaceChild(replacement, toReplace);
        },

        /**
         * Moves the children of one node to another node.
         * @param {HTMLElement} src Node to move children from
         * @param {HTMLElement} dest Node to move children to
         * @param {Number} startIndex Index of first node to move (0/null to move all nodes)
         * @param {Boolean} insertAtEnd True if the moved nodes should be appended at the
         *        end of the destination node's existing child nodes
         */
        moveChildren: function(src, dest, startIndex, insertAtEnd) {
            var com = CUI.rte.Common;
            if (startIndex == null) {
                startIndex = 0;
            }
            var moveCnt = src.childNodes.length;
            var moveIndex = 0;
            for (var c = moveCnt - 1; c >= startIndex; c--) {
                var childToMove = src.childNodes[c];
                src.removeChild(childToMove);
                if (!insertAtEnd) {
                    com.insertBefore(dest, childToMove, dest.firstChild);
                } else {
                    if (moveIndex == 0) {
                        dest.appendChild(childToMove);
                    } else {
                        var insertRef = dest.childNodes[dest.childNodes.length - moveIndex];
                        com.insertBefore(dest, childToMove, insertRef);
                    }
                    moveIndex++;
                }
            }
        },

        /**
         * Removes all child nodes of the specified DOM node.
         * @param {HTMLElement} dom DOM node to remove child nodes from
         */
        removeAllChildren: function(dom) {
            if (dom.nodeType != 1) {
                return;
            }
            while (dom.childNodes.length > 0) {
                dom.removeChild(dom.childNodes[0]);
            }
        },

        /**
         * Removes all nodes with no child nodes "up the hierarchy", starting from the
         * given DOM node.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Node} dom DOM node to start
         */
        removeNodesWithoutContent: function(context, dom) {
            while (dom && !CUI.rte.Common.isRootNode(context, dom)) {
                if (dom.childNodes.length > 0) {
                    break;
                }
                var removeParent = dom.parentNode;
                removeParent.removeChild(dom);
                dom = removeParent;
            }
        },

        /**
         * Get the value for the given style attribute name that is actually valid for
         * the specified DOM element. If necessary, the value is taken from a parent element
         * accordingly.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom DOM element
         * @param {String} styleName Name of the style attribute
         * @return {String} Style value; null if no applicable style value has been found
         */
        getStyleProp: function(context, dom, styleName) {
            if (dom == context.root) {
                return null;
            }
            while (dom) {
                if (dom.nodeType == 1) {
                    if (dom.style && dom.style[styleName]) {
                        return dom.style[styleName];
                    }
                }
                dom = CUI.rte.Common.getParentNode(context, dom);
            }
            return null;
        },


        // --- CSS processing --------------------------------------------------------------

        /**
         * Parse the CSS classes of the specified DOM node to an array.
         * @param {HTMLElement} dom DOM node for which the CSS classes should be determined
         * @return {Array} Array (of Strings) containing all classes applied to the given
         *         DOM node
         */
        parseCSS: function(dom) {
            if (dom.nodeType != 1) {
                return [ ];
            }
            var classNames = CUI.rte.Common.getAttribute(dom, "class");
            if (!classNames) {
                return [ ];
            }
            return classNames.split(" ");
        },

        /**
         * Check if the specified DOM node has the given CSS class applied.
         * @param {HTMLElement} dom DOM node to check
         * @param {String} className CSS class name to check
         * @return {Boolean} True, if the given CSS class is applied to the
         *         given DOM node
         */
        hasCSS: function(dom, className) {
            if (dom.nodeType != 1) {
                return false;
            }
            var classes = CUI.rte.Common.parseCSS(dom);
            var clsCnt = classes.length;
            for (var c = 0; c < clsCnt; c++) {
                if (classes[c] == className) {
                    return true;
                }
            }
            return false;
        },

        /**
         * <p>Applies the specified CSS class to the specified DOM node.</p>
         * <p>If the DOM node already has the CSS class applied, the call is simply ignored.
         * </p>
         * @param {HTMLElement} dom DOM node
         * @param {String} className CSS class name to be applied
         */
        addClass: function(dom, className) {
            var com = CUI.rte.Common;
            if (!com.hasCSS(dom, className)) {
                var domClassName = com.getAttribute(dom, "class");
                if (domClassName) {
                    domClassName += " " + className;
                } else {
                    domClassName = className;
                }
                com.setAttribute(dom, "class", domClassName);
            }
        },

        /**
         * <p>Removes the specified CSS class from the specified DOM node.</p>
         * <p>If the DOM node doesn't have the CSS class applied, the call is simply
         * ignored.</p>
         * @param {HTMLElement} dom The DOM node
         * @param {String} className CSS class name to be removed
         */
        removeClass: function(dom, className) {
            var com = CUI.rte.Common;
            var classNames = com.parseCSS(dom);
            var recreateStr = "";
            var mustSet = false;
            for (var i = 0; i < classNames.length; i++) {
                if (classNames[i] == className) {
                    mustSet = true;
                } else {
                    if (recreateStr.length > 0) {
                        recreateStr += " ";
                    }
                    recreateStr += classNames[i];
                }
            }
            if (mustSet) {
                if (recreateStr) {
                    com.setAttribute(dom, "class", recreateStr);
                } else {
                    com.removeAllClasses(dom);
                }
            }
        },

        /**
         * <p>Removes all CSS classes from the specified DOM node.</p>
         * <p>If the DOM node doesn't have the CSS class applied, the call is simply
         * ignored.</p>
         * @param {HTMLElement} dom DOM node
         */
        removeAllClasses: function(dom) {
            CUI.rte.Common.removeAttribute(dom, "class");
        },


        // --- Browser-specific stuff ------------------------------------------------------

        /**
         * <p>Gets the translated IE attribute name if required.</p>
         * <p>IE does not implement attribute functions correctly. Mainly, the names
         * are differing. These method is used to work around that problem. Note that
         * there are other issues (handling of style attribute), which are not handled
         * by this method.</p>
         * <p>Note that you can call the method on other browsers as well.</p>
         * @param {String} attribName The attribute name to translate
         * @return {String} The attribute name as suitable for IE
         */
        getIEAttributeName: function(attribName) {
            var com = CUI.rte.Common;

            if (com.ua.isOldIE) {
                var attribNameLC = attribName.toLowerCase();
                // handle "class" attribute seperately, as "class" is a JavaScript keyword
                // and we can't imagine in what kind of browser hell we're running in if
                // we are using it as a key in an "associative array"
                if ((attribNameLC == "class") && (com.ua.isIE6 || com.ua.isIE7)) {
                    return "className";
                }
                // use table for other attribute names
                var translatedAttribName = CUI.rte.Common.IE_ATTRIB_NAMES[attribNameLC];
                if (translatedAttribName != null) {
                    attribName = translatedAttribName;
                }
            }
            return attribName;
        },

        /**
         * Gets all valid(!) attribute names for IE, as IE's implementation of the
         * attributes property is quite unusable for determining this.
         * @param {HTMLElement} dom The DOM element to get the list of attributes for
         * @param {Boolean} keepCase (optional) True if the case of the attribute names
         *        should be kept (this might be required for some IE issues to be worked
         *        around)
         * @param {Function} filter (optional) A filter method that allows to filter out a
         *        specific attribute; gets the DOM element, the attribute name and the
         *        lower case representation of the attribute's name as parameters; must
         *        return true to filter out the attribute.
         * @return {String[]} Array of all valid attribute names
         */
        getIEAttributeNames: function(dom, keepCase, filter) {
            var attributeNames = [ ];
            // IE bugs around again, so we'll use outerHTML to determine all *valid*
            // attributes
            var domHtml = dom.outerHTML;
            var tagEndPos = domHtml.indexOf(">");
            domHtml = domHtml.substring(0, tagEndPos + 1);
            var parsed = CUI.rte.HtmlProcessor.parseTag(domHtml);
            var attributes = parsed.attributes;
            for (var attribName in attributes) {
                var isFilteredOut = false;
                var attrib = attributes[attribName];
                if (filter) {
                    isFilteredOut = filter(dom, attrib.originalName, attribName);
                }
                if (!isFilteredOut) {
                    if (keepCase) {
                        attributeNames.push(attrib.originalName);
                    } else {
                        attributeNames.push(attribName);
                    }
                }
            }
            return attributeNames;
        },


        // --- Miscellaneous & Debugging ---------------------------------------------------

        /**
         * Removes all JCR-specific data from the given object.
         * <p>
         * You'll need this method to clean up collections with generic content before
         * iterating over them using something like <code>for (var key in coll)</code>.
         * Note that this method does intentionally not work recursively!
         * @param {Object} coll "Collection" to be cleaned
         */
        removeJcrData: function(coll) {
            for (var key in coll) {
                if (coll.hasOwnProperty(key)) {
                    if (CUI.rte.Common.strStartsWith(key, "jcr:")) {
                        delete coll[key];
                    } else if (key == "xtype") {
                        delete coll[key];
                    }
                }
            }
        },

        /**
         * Check if the given array contains the given object.
         * @param {Array} array Array to check
         * @param {Object} object Object to be checked
         * @param {Function} cmp (optional) Function that is used to determine if two array
         *        elements equal each other
         * @return {Boolean} True</code> if <code>object is an element of
         *         <code>array/code>
         */
        arrayContains: function(array, object, cmp) {
            return (CUI.rte.Common.arrayIndex(array, object, cmp) >= 0);
        },

        /**
         * Adds the content of the specified array to the other specified array. All
         * elements are inserted at the end of the existing array.
         * @param {Array} array The base array; elements will be added to this array.
         * @param {Array} arrayToAdd The array to add; elements will be added at the end
         *                           of the object specified by parameter array
         */
        arrayAdd: function(array, arrayToAdd) {
            var copyCnt = arrayToAdd.length;
            for (var c = 0; c < copyCnt; c++) {
                array.push(arrayToAdd[c]);
            }
        },

        /**
         * Get the index of the given object within the given array.
         * @param {Array} array Array to check
         * @param {Object} object Object to be checked
         * @param {Function} cmp (optional) Function that is used to determine if two array
         *        elements equal each other
         * @return {Number} array index of the given object; <code>-1</code> if
         *         <code>object</code> is not an element of <code>array/code>
         */
        arrayIndex: function(array, object, cmp) {
            for (var i = 0; i < array.length; i++) {
                if (!cmp) {
                    if (array[i] == object) {
                        return i;
                    }
                } else if (cmp(array[i], object)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * Creates a 1:1 copy of the specified array.
         * @param {Array} arrayToCopy Array to copy
         * @return {Array} The copied array
         */
        arrayCopy: function(arrayToCopy) {
            var copy = [ ];
            var itemCnt = arrayToCopy.length;
            for (var i = 0; i < itemCnt; i++) {
                copy.push(arrayToCopy[i]);
            }
            return copy;
        },

        /**
         * Ensures that the specified object is an array. If it is an object, it is
         * converted into an array, losing the object keys.
         * @param {Object} obj The object to check/convert
         * @param {String} keyName (optional) If specified, name/value pairs are converted
         *        into objects that consist of two properties: The key (of the original
         *        object) is set as a property with the name specified by keyName; the
         *        value (of the original object) is set as a property with the name
         *        specified by valueName; for exampe: "propName": "propValue" is transformed
         *        into { [keyName]: "propName", [valueName]: "propValue" }
         * @param {String} valueName (optional) If specified, name/value pairs are converted
         *        into objects that consist of two properties: The key (of the original
         *        object) is set as a property with the name specified by keyName; the
         *        value (of the original object) is set as a property with the name
         *        specified by valueName; for exampe: "propName": "propValue" is transformed
         *        into { [keyName]: "propName", [valueName]: "propValue" }
         * @return {Array} The object (if it is already an array) or the converted object or
         *         null, if the object could not be converted to an array
         */
        toArray: function(obj, keyName, valueName) {
            if (!obj) {
                return null;
            }
            if (CUI.rte.Utils.isArray(obj)) {
                return obj;
            }
            if (typeof(obj) == "object") {
                var array = [ ];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (!keyName || !valueName) {
                            array.push(obj[key]);
                        } else {
                            var convObj = { };
                            convObj[keyName] = key;
                            convObj[valueName] = obj[key];
                            array.push(convObj);
                        }
                    }
                }
                return array;
            }
            return [ obj ];
        },

        /**
         * Check if the given string starts with the given partial string.
         * @param {String} str String to check
         * @param {String} partialStr partial String
         * @return {Boolean} True, if str starts with partialStr, else false
         */
        strStartsWith: function(str, partialStr) {
            if (!str || !partialStr) {
                return false;
            }
            var pLen = partialStr.length;
            if (str.length >= pLen) {
                return (str.substring(0, pLen) == partialStr);
            }
            return false;
        },

        /**
         * Check if the given string ends with the given partial string.
         * @param {String} str String to check
         * @param {String} partialStr partial String
         * @return {Boolean} True, if str ends with partialStr, else false
         */
        strEndsWith: function(str, partialStr) {
            if (!str || !partialStr) {
                return false;
            }
            var sLen = str.length;
            var pLen = partialStr.length;
            if (sLen >= pLen) {
                return (str.substring(sLen - pLen, sLen) == partialStr);
            }
            return false;
        },

        /**
         * Executes a simple String replacement.
         * @param {String} text The source text
         * @param {Number} startPos The first character to be replaced
         * @param {Number} endPosIncl The last character (inclusive) to be replaced
         * @param {String} replacement The replacement
         * @return {String} The result of the replacement
         */
        strReplace: function(text, startPos, endPosIncl, replacement) {
            var preStr = "";
            if (startPos > 0) {
                preStr = text.substring(0, startPos);
            }
            var postStr = "";
            if ((endPosIncl + 1) < text.length) {
                postStr = text.substring(endPosIncl + 1, text.length);
            }
            return preStr + replacement + postStr;
        },

        /**
         * Create an index path for the given DOM node.
         * <p>
         * An index path consists of the respective child positions up to the body node.
         * The index path may be used to determine if a node is "before" or "behind"
         * another node.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Node} node DOM node for which the index path has to be created
         * @return {Array} index path for the given node
         */
        createIndexPath: function(context, node) {
            var parentNode = CUI.rte.Common.getParentNode(context, node);
            if (!parentNode) {
                return [];
            }
            var sortIndex = CUI.rte.Common.getChildIndex(node);
            var sortIndices = CUI.rte.Common.createIndexPath(context, parentNode);
            sortIndices.push(sortIndex);
            return sortIndices;
        },

        /**
         * Compare two index paths.
         * <p>
         * An index path consists of the respective child positions up to the body node.
         * The index path may be used to determine if a node is "before" or "behind"
         * another node.
         * @param {Array} index1 first index path
         * @param {Array} index2 second index path
         * @return {Number} 0 if both index paths are the same;
         *         1 if <code>index1</code> is "before" <code>index2</code>;
         *         -1 if <code>index1</code> is "behind" <code>index2</code>
         */
        compareIndexPaths: function(index1, index2) {
            var i1Cnt = index1.length;
            var i2Cnt = index2.length;
            var index = 0;
            while (true) {
                if (index >= i1Cnt) {
                    if (index >= i2Cnt) {
                        // same node
                        return 0;
                    }
                    // 1 is parent of 2
                    return 1;
                }
                if (index >= i2Cnt) {
                    // 2 is parent of 1
                    return -1;
                }
                if (index1[index] < index2[index]) {
                    return 1;
                }
                if (index1[index] > index2[index]) {
                    return -1;
                }
                index++;
            }
        },

        /**
         * Blocks execution of JavaScript for the given amount of time and, if specified,
         * under the given condition.
         * @param {Number} ms Time to block JavaScript execution thread in milliseconds
         * @param {Boolean} cond (optional) A condition that has to be true for the block
         *        to be executed
         */
        block: function(ms, cond) {
            if ((typeof cond === "undefined") || cond) {
                var endTime = new Date().getTime() + ms;
                while (new Date().getTime() < endTime);
            }
        },

        /**
         * Gets the "outer html" of the specified DOM node (= the HTML code that represents
         * the specified node and all of its child nodes, recursively).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The HTML element to get the outer HTML for
         */
        getOuterHTML: function(context, dom) {
            var com = CUI.rte.Common;
            if (com.ua.isIE) {
                return dom.outerHTML;
            }
            var fakeSpan = context.createElement("span");
            fakeSpan.appendChild(dom.cloneNode(true));
            return fakeSpan.innerHTML;
        },

        /**
         * Determines if the application is run in Portrait mode.
         * @return {Boolean} True if the application is run in Portrait mode
         */
        isPortrait: function() {
            return (window.innerHeight > window.innerWidth);
        },

        /**
         * Dump the given DOM node.
         * @param {Node} node DOM node to dump
         * @param {String} prefix text prefix (optional)
         * @param {String} suffix text suffix (optional)
         */
        dumpNode: function(node, prefix, suffix) {
            var text = (prefix ? prefix : "");
            if (node) {
                var childNo = CUI.rte.Common.getChildIndex(node);
                if (node.nodeType == 1) {
                    text += node.tagName;
                } else if (node.nodeType == 3) {
                    text += "\"" + node.nodeValue + "\"";
                } else if (node.nodeType == 8) {
                    text += "(comment) " + node.nodeValue;
                } else {
                    text += "(nodeType #" + node.nodeType + ")";
                }
                text += " (parentNode.childNodes[" + childNo + "])";
            } else {
                text += "[No node]";
            }
            if (suffix) {
                text += suffix;
            }
            return text;
        },

        /**
         * Dump the given DOM node recursively.
         * @param {Node} node DOM node to dump
         * @param {Number} indent indent (spaces) of the current recursion (optional)
         */
        dumpNodeRecursively: function(node, indent) {
            if (!indent) {
                indent = 0;
            }
            var text = "";
            for (var indentIndex = 0; indentIndex < indent; indentIndex++) {
                text += "   ";
            }
            text += CUI.rte.Common.dumpNode(node) + "\n";
            if (node && (node.nodeType == 1)) {
                var childCnt = node.childNodes.length;
                for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                    text += CUI.rte.Common.dumpNodeRecursively(
                            node.childNodes[childIndex], indent + 1);
                }
            }
            return text;
        },

        /**
         * Dump the specified JavaScript object recursively.
         * @param {Object} obj Object to dump
         * @param {Number} indent indent (spaces) of the current recursion (optional)
         * @param {Boolean} dumpDomRecursively True if DOM nodes that are
         *        contained in the object hierarchy should be dumped recursively
         */
        dumpObject: function(obj, indent, dumpDomRecursively) {
            var com = CUI.rte.Common;
            var dump = "";
            if (!indent) {
                indent = 0;
            }
            var indentStr = "";
            for (var indentPos = 0; indentPos < indent; indentPos++) {
                indentStr += " ";
            }
            if (!obj) {
                return indentStr + "---";
            }
            if (obj.hasOwnProperty) {
                for (var name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        var value = obj[name];
                        dump += indentStr + name + ":";
                        if ((value === null) || (value === undefined)) {
                            dump += " [undefined]\n";
                        } else if (typeof(value) == "object") {
                            if (value.nodeType && (value.tagName || value.nodeValue)) {
                                if (dumpDomRecursively) {
                                    dump += "\n" + com.dumpNodeRecursively(value,
                                            indent + 2);
                                } else {
                                    dump += com.dumpNode(value) + "\n";
                                }
                            } else {
                                dump += "\n" + com.dumpObject(value,
                                        indent + 2);
                            }
                        } else {
                            dump += " " + value + "\n";
                        }
                    }
                }
            } else {
                if (obj.nodeType) {
                    if (dumpDomRecursively) {
                        dump += com.dumpNodeRecursively(obj, indent);
                    } else {
                        dump += indentStr + com.dumpNode(obj) + "\n";
                    }
                } else {
                    dump += indentStr + "[native object]\n";
                }
            }
            return dump;
        },

        /**
         * Provides simple logging facilities for IE, which requires a DOM element with
         * id == "debug" to be present. If no such DOM element is found, the logging
         * request is simply ignored.
         * @param {String} msg The message to be logged
         * @param {Boolean} enforceDebuggingDiv True if the debugging DIV should be enforced
         */
        ieLog: function(msg, enforceDebuggingDiv) {
            if (!isLogEnabled) {
                return;
            }
            var div = document.getElementById("cuiRTEdebug");
            if (!div && enforceDebuggingDiv) {
                var doc = window.document;
                var width = doc.body.clientWidth - 310;
                div = doc.createElement("div");
                div.id = "cuiRTEdebug";
                div.style.width = "300px";
                div.style.height = "300px";
                div.style.position = "absolute";
                div.style.top = "10px";
                div.style.left = width + "px";
                div.style.zIndex = 10000;
                div.style.overflowY = "scroll";
                div.style.border = "1px solid";
                div.style.fontFamily = "sans-serif";
                div.style.fontSize = "12px";
                div.style.backgroundColor = "#ffffff";
                doc.body.appendChild(div);
            }
            if (div) {
                if (!msg) {
                    msg = "";
                }
                msg = CUI.rte.Utils.htmlEncode(msg);
                var addBr = true;
                if ((msg.length > 0) && (msg.charAt(msg.length - 1) == "\n")) {
                    addBr = false;
                }
                msg = msg.replace(/\n/g, "<br>");
                msg = msg.replace(/ /g, "&nbsp;");
                div.innerHTML = div.innerHTML + msg + (addBr ? "<br>" : "");
            }
        },

        /**
         * Enables or disables the logging facilities provided by {@link #ieLog}.
         * @param {Boolean} isEnabled True to enable logging through {@link #ieLog}
         */
        setLogEnabled: function(isEnabled) {
            isLogEnabled = isEnabled;
            if (isLogEnabled) {
                CUI.rte.Common.ieLog(null, true);
            }
        },

        /**
         * Array that contains the tag name of nodes that are treated as one character
         * when counting characters
         * @type String[]
         * @static
         * @final
         */
        ONE_CHARACTER_NODES: [
            {
                "tagName": "a",
                "attribsDefined": [ "name" ],
                "attribsUndefined": [ "href" ]
            }, {
                "tagName": "img"
            }, {
                "tagName": "br"
            }
        ],

        /**
         * List of actual block tags
         * @type String[]
         */
        BLOCK_TAGS: [
            "p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "ol", "ul", "pre", "table",
            "address", "blockquote", "center", "dl", "fieldset", "form", "hr", "marquee",
            "noscript", "script"
        ],

        /**
         * List of edit fragment tags - editing fragments are DOM structures that are
         * considered to be edited as some kind of a block. The most important difference
         * to the average structure is that their end is counted as an extra space in
         * functions that map node/offset to a character position
         * @type String[]
         */
        EDITBLOCK_TAGS: [
            "p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "li", "pre", "td", "th",
            "address", "blockquote", "center", "caption"
        ],

        /**
         * List of edit fragment tags that may be nested
         * @type String[]
         */
        EDITBLOCK_NESTED_TAGS: [
            "td", "th"
        ],

        /**
         * List of edit fragment tags that may be nested and if so, are nested irregularily.
         * This is currently the case for list items only.
         * @type String[]
         */
        EDITBLOCK_UNREGNEST_TAGS: [
            "li"
        ],

        /**
         * Prefix for RTE-specific attributes
         */
        RTE_ATTRIB_PREFIX: "_rte",

        /**
         * Helper attribute for providing "stable" HREF support - the HREF of a link is
         * stored both in the href attribute (which may be changed by browser deliberately)
         * and the attribute defined by this constant (which is supposed to not being
         * touched by the browser)
         */
        HREF_ATTRIB: "_rte_href",

        /**
         * Helper attribute for providing "stable" SRC support - the SRC of an image is
         * stored both in the href attribute (which may be changed by browser deliberately)
         * and the attribute defined by this constant (which is supposed to not being
         * touched by the browser)
         */
        SRC_ATTRIB: "_rte_src",

        /**
         * Helper attribute for determining helper line breaks used for working around
         * Webkit and Gecko issues
         */
        BR_TEMP_ATTRIB: "_rte_temp_br",

        /**
         * Helper attribute for images that are used as placeholders for named anchors
         */
        A_NAME_REPLACEMENT_ATTRIB: "_rte_a_name_repl",

        /**
         * Attribute for elements that are only used temporarily
         */
        TEMP_EL_ATTRIB: "_rte_temp_el",

        /**
         * Attribute value ({@see #TEMP_EL_ATTRIB} for a temporary element that should be
         * removed "immediately" after a selection changes
         */
        TEMP_EL_IMMEDIATE_REMOVAL: "immediate",

        /**
         * Attribute value ({@see #TEMP_EL_ATTRIB} for a temporary element that should be
         * removed when the DOM gets serialized
         */
        TEMP_EL_REMOVE_ON_SERIALIZE: "serialize",

        /**
         * Array of tags that are defining a table cell
         * @type String[]
         * @private
         */
        TABLE_CELLS: [ "td", "th" ],

        /**
         * Array of tags that are defining lists
         * @type String[]
         * @private
         */
        LIST_TAGS: [ "ul", "ol" ],

        /**
         * Table of attribute names that have to be translated for IE to work correctly
         */
        IE_ATTRIB_NAMES: {
            "cellpadding": "cellPadding",
            "cellspacing": "cellSpacing",
            "valign": "vAlign",
            "bgcolor": "bgColor",
            "rowspan": "rowSpan",
            "colspan": "colSpan"
        },

        /**
         * Attribute filter for temporary Gecko-stuff
         * @param {HTMLElement} dom The DOM element
         * @param {String} attribName Attribute name (browser-dependent)
         * @param {String} attribNameLC Lower case version of the attribute name
         */
        FILTER_GECKO_TEMPORARY_ATTRIBS: function(dom, attribName, attribNameLC) {
            var com = CUI.rte.Common;
            // exclude temporary Mozilla attributes (as far as currently known)
            return com.strStartsWith(attribNameLC, "_moz")
                || (com.isTag(dom, "br") && (attribNameLC == "type"));
        }

    };

}();