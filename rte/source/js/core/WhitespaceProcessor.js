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
 * @class CUI.rte.DomProcessor
 * @static
 * @private
 * The WhitespaceProcessor provides utility functions to remove unnecessary whitespace
 * from the DOM.
 */
CUI.rte.WhitespaceProcessor = function() {

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    return {

        /**
         * Normalizes whitespace in the specified text by:
         * <ul>
         *   <li>Replacing different types (tab, linefeed) of whitespace by simple spaces.
         *     </li>
         *   <li>Removing double/multiple spaces by single spaces</li>
         *   <li>Removing leading and trailing spaces if specified<li>
         * </ul>
         * @param {String} text The text to be normalized
         * @param {Boolean} trimLeft True if leading spaces should be trimmed
         * @param {Boolean} trimRight True if trailing spaces should be timmed
         * @return {String} The normalized text
         */
        normalizeWhitespace: function(text, trimLeft, trimRight) {
            var wsp = CUI.rte.WhitespaceProcessor;
            text = text.replace(wsp.WHITESPACE_REGEX, " ");
            text = text.replace(wsp.MULTISPACE_REGEX, " ");
            var charPos;
            if (trimLeft) {
                charPos = 0;
                while ((charPos < text.length) && (text.charAt(charPos) == " ")) {
                    charPos++;
                }
                if (charPos < text.length) {
                    text = text.substring(charPos, text.length);
                } else {
                    text = "";
                }
            }
            if (trimRight) {
                charPos = text.length - 1;
                while ((charPos >= 0) && (text.charAt(charPos) == " ")) {
                    charPos--;
                }
                if (charPos >= 0) {
                    text = text.substring(0, charPos + 1);
                } else {
                    text = "";
                }
            }
            return text;
        },

        /**
         * <p>Handles the whitespace of a text block.</p>
         * <p>A text block are any number of adjacent text nodes, sharing the same
         * parent node.</p>
         * <p>Note that adjacent text nodes are merged into one single text node if
         * necessary.</p>
         * @param {String} text The text of the text block (to be normalized)
         * @param {HTMLElement[]} children Array with child nodes of the parent node
         * @param {Number} startIndex Index of first child the text block is consisting of
         * @param {Number} endIndex Index of last child the text block is consisting of
         * @param {Array} nodesToRemove Array that is filled with nodes that have to be
         *        removed because of joined text nodes
         * @param {Boolean} trimEdges True if trailing and leading whitespace has to be
         *        trimmed
         */
        handleTextBlock: function(text, children, startIndex, endIndex, nodesToRemove,
                                  trimEdges) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var childCnt = children.length;
            var trimLeft = (startIndex == 0) && trimEdges;
            if (!trimLeft && trimEdges) {
                if (com.isTag(children[startIndex - 1], "br")) {
                    trimLeft = true;
                }
            }
            var trimRight = (endIndex == (childCnt - 1)) && trimEdges;
            if (!trimRight && trimEdges) {
                if (com.isTag(children[endIndex + 1], "br")) {
                    trimRight = true;
                }
            }
            text = wsp.normalizeWhitespace(text, trimLeft, trimRight);
            children[startIndex].nodeValue = text;
            if (text.length == 0) {
                nodesToRemove.push(children[startIndex]);
            }
            for (var mr = startIndex + 1; mr <= endIndex; mr++) {
                nodesToRemove.push(children[mr]);
            }
        },

        /**
         * <p>Handles "no text" structures.</p>
         * <p>"No text" structures have a certain parent element that does not allow to
         * have text nodes (directly) under it. For example, text under a "table" node
         * must not have (editable) text, hence all text nodes under it can safely be
         * removed.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The "no text" parent node
         * @param {Object[]} removalRules Rules that define the nodes that have to be
         *        removed before whitespace processing is being applied
         */
        handleNoTextStructure: function(context, dom, removalRules) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var children = dom.childNodes;
            var childCnt = children.length;
            // remove all text nodes if the current node is a "no text" tag
            for (var c = childCnt - 1; c >= 0; c--) {
                var child = children[c];
                if (child.nodeType == 3) {
                    dom.removeChild(child);
                } else {
                    var isEditBlock = com.isTag(child, com.EDITBLOCK_TAGS);
                    wsp.processStructure(context, child, isEditBlock, removalRules);
                }
            }
        },

        /**
         * <p>Cleans the text nodes of an "average" structural node.</p>
         * <p>Unnecessary whitespace is removed. The method works recursively. Trailing
         * and leading whitespace (as specified by the trimEdges parameter) should only be
         * trimmed for edit block parent nodes such as "p", "h1", "td", etc.</p>
         * <p>Note that adjacent text nodes are merged by this method.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The parental structural node
         * @param {Boolean} trimEdges True if trailing and leading whitspace has to be
         *        trimmed
         * @param {Object[]} removalRules Rules that define the nodes that have to be
         *        removed before whitespace processing is being applied
         */
        cleanTextNodes: function(context, dom, trimEdges, removalRules) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var children = dom.childNodes;
            // join all text nodes as far as possible and execute whitespace processing on
            // them
            var text = "";
            var textStartIndex = 0;
            var childrenToRemove = [ ];
            for (var c = 0; c < children.length; c++) {
                var child = children[c];
                if (child.nodeType == 3) {
                    text += child.nodeValue;
                    if (c == (children.length - 1)) {
                        wsp.handleTextBlock(text, children, textStartIndex, c,
                                childrenToRemove, trimEdges);
                    }
                } else {
                    if (textStartIndex < c) {
                        wsp.handleTextBlock(text, children, textStartIndex, c - 1,
                                childrenToRemove, trimEdges);
                    }
                    textStartIndex = c + 1;
                    text = "";
                    wsp.processStructure(context, child, com.isTag(child,
                            com.EDITBLOCK_TAGS), removalRules);
                }
            }
            // remove blocks that are superfluous by now
            for (var r = 0; r < childrenToRemove.length; r++) {
                dom.removeChild(childrenToRemove[r]);
            }
        },

        /**
         * <p>Executes some "super-structural" normalizing.</p>
         * <p>"Super-structural" means that the text nodes of several hierarchical levels
         * are considered for normalizing whitespace. For example,
         * "Some.&lt;b&gt;.text.&lt;/b&gt;" should be normalized to
         * "Some.&lt;b&gt;text&lt;/b&gt;", which can only be done by considering text
         * nodes on different hierarchical levels.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The structural node to be normalized
         */
        normalizeSuperStructural: function(context, dom) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var children = dom.childNodes;
            var childCnt = children.length;
            var childrenToRemove = [ ];
            var child;
            for (var c = 1; c < childCnt; c++) {
                child = children[c];
                if (!com.isTag(child, wsp.AS_IS_TAGS)) {
                    var prevChild = children[c - 1];
                    var textChild = com.getFirstTextChild(child, false, true);
                    var prevTextChild = com.getLastTextChild(prevChild, false, true);
                    if (textChild && prevTextChild) {
                        var text = textChild.nodeValue;
                        var prevText = prevTextChild.nodeValue;
                        if (com.strStartsWith(text, " ")
                                && com.strEndsWith(prevText, " ")) {
                            if ((child.nodeType == 3) && (prevChild.nodeType == 1)) {
                                // convert "a <b> b </b> c" to "a <b>b</b> c" rather than to
                                // "a <b>b </b>c"
                                prevText = wsp.normalizeWhitespace(prevText, false, true);
                                prevTextChild.nodeValue = prevText;
                                if (prevText.length == 0) {
                                    childrenToRemove.push(prevTextChild);
                                }
                            } else {
                                text = wsp.normalizeWhitespace(text, true, false);
                                textChild.nodeValue = text;
                                if (text.length == 0) {
                                    childrenToRemove.push(textChild);
                                }
                            }
                        }
                    }
                }
            }
            // remove blocks that are superfluous by now
            for (var r = 0; r < childrenToRemove.length; r++) {
                child = childrenToRemove[r];
                child.parentNode.removeChild(child);
            }
        },

        /**
         * <p>Trims and removes empty text nodes between blocks of the specified parent
         * node.</p>
         * <p>For example, "&lt;td&gt;...&lt;p&gt;Para&lt;/p&gt;....&lt;/td&gt;" should be
         * normalized to "&lt;td&gt;&lt;p&gt;Para&lt;/p&gt;&lt;/td&gt;";
         * "&lt;td&gt;..Text..&lt;p&gt;Para&lt;/p&gt;..Text..&lt;/td&gt;" to
         * "&lt;td&gt;Text&lt;p&gt;Para&lt;/p&gt;Text&lt;/td&gt;"
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The parent node to be processed
         */
        handleTextNodesBetweenBlocks: function(context, dom) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var children = dom.childNodes;
            var childCnt = children.length;
            // remove all empty text nodes if they are preceded or succeed by a block
            for (var c = childCnt - 1; c >= 0; c--) {
                var child = children[c];
                if (child.nodeType == 3) {
                    var text = child.nodeValue;
                    var noTextCheck = text.replace(wsp.WHITESPACEONLY_REGEX, "");
                    var hasBlockSiblingLeft = false;
                    var hasBlockSiblingRight = false;
                    var prevSib = child.previousSibling;
                    if (prevSib) {
                        hasBlockSiblingLeft = com.isTag(prevSib, com.BLOCK_TAGS)
                                || com.isTag(prevSib, com.EDITBLOCK_TAGS);
                    }
                    var nextSib = child.nextSibling;
                    if (nextSib) {
                        hasBlockSiblingRight = com.isTag(nextSib, com.BLOCK_TAGS)
                                || com.isTag(nextSib, com.EDITBLOCK_TAGS);
                    }
                    if (hasBlockSiblingLeft || hasBlockSiblingRight) {
                        if (noTextCheck.length == 0) {
                            dom.removeChild(child);
                        } else {
                            text = wsp.normalizeWhitespace(text, hasBlockSiblingLeft,
                                    hasBlockSiblingRight);
                            if (text.length > 0) {
                                child.nodeValue = text;
                            } else {
                                dom.removeChild(child);
                            }
                        }
                    }
                }
            }
        },

        /**
         * <p>Removes all child nodes that match the specified removal rules.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The parent node
         * @param {Object[]} removalRules Rules that define the nodes that have to be
         *        removed before whitespace processing is being applied
         */
        removeUnsupportedNodes: function(context, dom, removalRules) {
            if (!removalRules) {
                return;
            }
            var children = dom.childNodes;
            var childCnt = children.length;
            var ruleCnt = removalRules.length;
            for (var c = childCnt - 1; c >= 0; c--) {
                var child = children[c];
                for (var r = 0; r < ruleCnt; r++) {
                    var rule = removalRules[r];
                    var mustRemove = false;
                    if ((rule.tagName != null) && com.isTag(child, rule.tagName)) {
                        mustRemove = true;
                    } else if ((rule.namespace != null)) {
                        var namespace = com.getNamespace(child);
                        if (namespace != null) {
                            var nspcRules = rule.namespace;
                            if (!CUI.rte.Utils.isArray(nspcRules)) {
                                nspcRules = [ nspcRules ];
                            }
                            var nspcRuleCnt = nspcRules.length;
                            for (var n = 0; n < nspcRuleCnt; n++) {
                                var ruleNspc = nspcRules[n];
                                if ((ruleNspc == "*") || (namespace == ruleNspc)) {
                                    mustRemove = true;
                                    break;
                                }
                            }
                        }
                    } else if ((rule.nodeType != null)
                            && (child.nodeType == rule.nodeType)) {
                        mustRemove = true;
                    } else if ((rule.fn != null) && (rule.fn(child))) {
                        mustRemove = true;
                    }
                    if (mustRemove) {
                        if (!rule.keepChildren) {
                            dom.removeChild(child);
                        } else {
                            var delta = child.childNodes.length;
                            dpr.removeWithoutChildren(child);
                            // re-scan moved nodes
                            if (delta > 0) {
                                c += delta;
                            }
                        }
                        break;
                    }
                }
            }
        },

        /**
         * <p>Processes a DOM structure recursively.</p>
         * <p>Note that leading and trailing whitespace (as specified by the trimEdges
         * parameter) should be trimmed for edit block elements only.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The structural DOM node to be processed
         * @param {Boolean} trimEdges True if trailing and leading whitespace must be
         *        trimmed
         * @param {Object[]} removalRules Rules that define the nodes that have to be
         *        removed before whitespace processing is being applied
         * @private
         */
        processStructure: function(context, dom, trimEdges, removalRules) {
            var wsp = CUI.rte.WhitespaceProcessor;
            // keep "as is tags" as they are (don't change anything for "pre" tag, etc.)
            if (com.isTag(dom, wsp.AS_IS_TAGS)) {
                return;
            }
            wsp.removeUnsupportedNodes(context, dom, removalRules);
            if (com.isTag(dom, wsp.NO_TEXT_TAGS)) {
                wsp.handleNoTextStructure(context, dom, removalRules);
                return;
            }
            wsp.cleanTextNodes(context, dom, trimEdges, removalRules);
            wsp.normalizeSuperStructural(context, dom);
            wsp.handleTextNodesBetweenBlocks(context, dom);
        },

        /**
         * <p>Processes the specified node recursively by removing all unnecessary
         * whitespace.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The element to be processed
         * @param {Object[]} removalRules Rules that define what nodes will be removed
         *        before whitespace rules are applied
         * @param {Boolean} omitDefaultRemoveRules True if default remove rules will be
         *        omitted; false if default remove rules have to be be applied
         */
        process: function(context, dom, removalRules, omitDefaultRemoveRules) {
            var wsp = CUI.rte.WhitespaceProcessor;
            if (!omitDefaultRemoveRules) {
                if (removalRules != null) {
                    removalRules = com.arrayCopy(removalRules);
                    com.arrayAdd(removalRules, wsp.DEFAULT_REMOVAL_RULES);
                } else {
                    removalRules = wsp.DEFAULT_REMOVAL_RULES;
                }
            }
            if (com.isTag(dom, com.EDITBLOCK_TAGS)) {
                wsp.processStructure(context, dom, true, removalRules);
            } else if (!com.isTag(dom, wsp.AS_IS_TAGS)) {
                if (dom.nodeType == 1) {
                    wsp.processStructure(context, dom, true, removalRules);
                } else if (dom.nodeType == 3) {
                    var text = dom.nodeValue;
                    dom.nodeValue = wsp.normalizeWhitespace(text, true, true);
                } else {
                    // nodes of an unsupported type get removed immediately
                    dom.parentNode.removeChild(dom);
                }
            }
        },

        AS_IS_TAGS: [ "pre" ],

        NO_TEXT_TAGS: [ "table", "tbody", "thead", "tr", "ul", "ol" ],

        WHITESPACE_REGEX: /[ \n\r\t]/g,

        MULTISPACE_REGEX: / {2,}/g,

        WHITESPACEONLY_REGEX: / /g,

        DEFAULT_REMOVAL_RULES: [ {
                // Commentary nodes
                "nodeType": 8
            }, {
                // Processing instructions
                "nodeType": 7
            }, {
                // tags that are not suitable for content
                "tagName": [ "meta", "link", "style", "script" ],
                "keepChildren": false
            }, {
                // MS Word specific, namespaced tags, to keep content for
                "namespace": [ "st1" ],
                "keepChildren": true
            }, {
                // other namedspace tags, to be removed completely
                "namespace": [ "*" ]
            }
        ]

    };

}();