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
 * @class CUI.rte.Selection
 * @static
 * @private
 * <p>The RichText.Selection provides utility functions to handle
 * text selections/ranges in a browser-independent way.</p>
 * <p>Bookmarks provide means to persist selections even if the underlying DOM changes,
 * as they use character positions to determine the selection. Bookmarks are also
 * browser-independent - a given character position addresses the same DOM node/offset
 * on each browser platform.</p>
 * <p>Ranges/processing selections rely on the underlying DOM being persistent, as they use
 * nodes and offsets to address the actual text fragment.</p>
 * <p>Rules for calculating character positions:</p>
 * <ul>
 *   <li>There must be no "invisible" whitespace. Hence, no tabs and linefeeds must be
 *     present in the DOM at all!</li>
 *   <li>Each character of a text node is counted "as is".</li>
 *   <li>Several structural nodes (such as "br") are counted as a single character. These
 *     node types are defined by {@link CUI.rte.Common#ONE_CHARACTER_NODES}.</li>
 *   <li>At the end of each edit block ("p", "h1", ...), an additional character is added.
 *     Edit blocks are defined by {@link CUI.rte.Common#EDITBLOCK_TAGS}.</li>
 *   <li>Special attention should be put on nested structures: If there are paragraphs
 *     ("p") present in a table cell ("td"/"th"), two character positions are added
 *     after the last paragraph of that cell (one for the closing "p", the other for the
 *     closing "td"/"th").</li>
 *   <li>The end of the last cell of a nested table is counted as only one character (the
 *     closing "td"/"th" is only counted once, regardless of how much table cells get
 *     actually closed over the hierarchy).</li>
 * </ul>
 */
CUI.rte.Selection = function() {

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    /**
     * Checks if the specified node definition is directly following up a DOM structure.
     * If so, the node definition is corrected to point behind the last character of that
     * structure (instead of pointing before the first character of the follow-up, which
     * is basically the same position, but described by a differend node/offset combination.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Object} nodeDef Node definition (will be adjusted accordingly)
     */
    var correctToPreviousStructure = function(context, nodeDef) {
        var node = nodeDef.node;
        var offs = nodeDef.offset;
        if (node && (offs == 0)) {
            // type: abc <b>def</b>| ghi -> abc <b>def|</b> ghi
            var prevSib = node.previousSibling;
            if (prevSib && (prevSib.nodeType == 1)) {
                if (com.getNodeCharacterCnt(prevSib) == 0) {
                    // no rule without an exception: don't correct if we'd enter a link
                    // (IE doesn't allow for that)
                    if (com.isTag(prevSib, "a") && com.isAttribDefined(prevSib, "href")) {
                        return;
                    }
                    node = com.getPreviousCharacterNode(context, node);
                    if (node) {
                        nodeDef.node = node;
                        nodeDef.offset = (node.nodeType == 3 ? node.nodeValue.length : 0);
                    }
                }
            }
            // type: <p>abc <b>|def</b> ghi -> <p>abc |<b>def</b> ghi
            else if (!prevSib && (offs == 0)) {
                node = com.getPreviousCharacterNode(context, node, com.EDITBLOCK_TAGS);
                if (node) {
                    nodeDef.node = node;
                    nodeDef.offset = (node.nodeType == 3 ? node.nodeValue.length : 0);
                }
            }
        }
    };

    /**
     * Adjusts, if necessary,  a node definition that references a structural node directly
     * to a pointer to its parent node + the child index of the originally referenced node.
     * This format is required by Gecko/Webkit to correctly handle selection on structural
     * nodes, such as "br" (which are handled as characters, but actually are structural
     * nodes).
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Object} nodeDef Node definition (will be adjusted accordingly)
     */
    var adjustNodeAndOffsetToParent = function(context, nodeDef) {
        if ((nodeDef.node.nodeType == 1) && (nodeDef.offset == null)) {
            nodeDef.offset = com.getChildIndex(nodeDef.node);
            nodeDef.node = com.getParentNode(context, nodeDef.node);
        } else if ((nodeDef.offset == 0) && com.isTag(nodeDef.node, "a")
                && com.isAttribDefined(nodeDef.node, "name")) {
            // take special care for a name="" to prevent inserting into the anchor
            nodeDef.offset = com.getChildIndex(nodeDef.node) + 1;
            nodeDef.node = com.getParentNode(context, nodeDef.node);
        }
    };

    /**
     * Adjusts parent node and offset as required for setting a range on IE to a certain
     * position. IE got several problems regarding anchors that are handled using this
     * method.
     */
    var adjustParentNodeAndOffset = function(context, nodeDef) {
        var node = nodeDef.node;
        var processingOffset = 0;
        var correctingOffset = 0;
        while (node) {
            node = com.getNextNode(context, node);
            if (!node) {
                break;
            }
            // handle anchors
            if (com.isTag(node, "a") && com.isAttribDefined(node, "name")) {
                correctingOffset++;
            }
            processingOffset += com.getNodeCharacterCnt(node);
            if (processingOffset > nodeDef.offset) {
                break;
            }
        }
        nodeDef.offset += correctingOffset;
    };

    /**
     * Determines if the specified node is an anchor (a name).
     * @param {HTMLElement} node The node to check
     */
    var isAnchor = function(node) {
        return com.isTag(node, "a") && com.isAttribDefined(node, "name");
    };

    /**
     * Checks if the specified node is at the very end of a table cell. This is required
     * for IE to workaround an issue that handles the end of a table cell different from
     * the end of other blocks.
     */
    var isTableCellCorner = function(context, node) {
        while (node) {
            if (com.isTag(node, [ "td", "th" ])) {
                return true;
            }
            var pNode = node.parentNode;
            if (com.getChildIndex(node) != (pNode.childNodes.length - 1)) {
                return false;
            }
            node = com.getParentNode(context, node);
        }
        return false;
    };

    /**
     * Maps the specified node and offset to a character node and offset if possible and
     * necessary.
     */
    var mapToCharNodeEquiv = function(context, node, offset, isEndOfSelection) {
        var sel = CUI.rte.Selection;
        if (node == null) {
            return null;
        }
        var isEmptyBlock = false;
        if ((node.nodeType == 1) && !com.isOneCharacterNode(node)) {
            var children = node.childNodes;
            var childCnt = children.length;
            var ftn, ltn, fn, ln;
            if ((offset != null) && (offset < childCnt)) {
                var child = children[offset];
                ftn = com.getFirstTextChild(child, true);
                if (ftn) {
                    node = ftn;
                    offset = sel.getFirstSelectionOffset(context, ftn);
                } else if (com.isEmptyEditingBlock(child)) {
                    // for example, empty list items are handled here
                    node = child;
                    offset = null;
                    isEmptyBlock = true;
                } else {
                    fn = com.getFirstChild(node);
                    if (fn) {
                        node = fn;
                        offset = null;
                    }
                }
            } else {
                ltn = com.getLastTextChild(node, true);
                if (ltn) {
                    node = ltn;
                    offset = sel.getLastSelectionOffset(context, ltn, isEndOfSelection);
                } else {
                    ln = com.getLastChild(node);
                    if (ln) {
                        node = ln;
                        offset = null;
                    } else {
                        // empty top-level editing blocks (<p></p>, <h1></h1>, etc.)
                        isEmptyBlock = com.isEmptyEditingBlock(node);
                    }
                }
            }
            return {
                "node": node,
                "offset": offset,
                "isEmptyBlock": isEmptyBlock
            };
        }
        return null;
    };

    var sharedProps = {

        getScrollOffsets: function(context) {
            return {
                "scrollTop": context.root.scrollTop,
                "scrollLeft": context.root.scrollLeft
            };
        },

        setScrollOffsets: function(context, scrollingInfo) {
            if ((scrollingInfo.scrollTop !== undefined)
                    && (scrollingInfo.scrollLeft !== undefined)) {
                context.root.scrollTop = scrollingInfo.scrollTop;
                context.root.scrollLeft = scrollingInfo.scrollLeft;
            }
        },

        /**
         * @private
         */
        hasWhitespaceOnly: function(text) {
            var whitespaces = " \n\r\t";
            if (com.ua.isGecko) {
                whitespaces += String.fromCharCode(160);
            }
            var charCnt = text.length;
            for (var charPos = 0; charPos < charCnt; charPos++) {
                var charToCheck = text.charAt(charPos);
                if (whitespaces.indexOf(charToCheck) < 0) {
                    return false;
                }
            }
            return true;
        },

        bookmarkFromProcessingSelection: function(context, selection) {
            var com = CUI.rte.Common;
            selection = {
                "startNode": selection.startNode,
                "startOffset": selection.startOffset,
                "endNode": selection.endNode,
                "endOffset": selection.endOffset
            };
            CUI.rte.Selection.normalizeProcessingSelection(context, selection);
            var startPos = com.getCharacterOffsetForNode(context, selection.startNode);
            if (com.isOneCharacterNode(selection.startNode)) {
                if ((selection.startOffset != null) && (selection.startOffset === 0)) {
                    startPos++;
                }
            } else if (selection.startOffset) {
                startPos += selection.startOffset;
            }
            var endPos = startPos;
            if (selection.endNode) {
                endPos = com.getCharacterOffsetForNode(context, selection.endNode);
                if (com.isOneCharacterNode(selection.endNode)) {
                    if ((selection.endOffset != null) && (selection.endOffset === 0)) {
                        endPos++;
                    }
                } else if (selection.endOffset) {
                    endPos += selection.endOffset;
                }
            }
            // todo probably at least insertObject should be calculated correctly
            return {
                "startPos": startPos,
                "charCnt": (endPos - startPos),
                "object": null,
                "insertObject": null
            };
        },

        /**
         * Compares the specified bookmarks.
         * @param {Object} bookmark1 First bookmark to compare (as created by
         *        {@link CUI.rte.Selection#createSelectionBookmark})
         * @param {Object} bookmark2 Second bookmark to compare (as created by
         *        {@link CUI.rte.Selection#createSelectionBookmark})
         */
        compareBookmarks: function(bookmark1, bookmark2) {
            if (bookmark1 == null) {
                return (bookmark2 == null);
            }
            if (bookmark2 == null) {
                return false;
            }
            return (bookmark1.startPos == bookmark2.startPos)
                    && (bookmark1.charCnt == bookmark2.charCnt)
                    && (bookmark1.object == bookmark2.object)
                    && (bookmark1.insertObject == bookmark2.insertObject);
        },

        /**
         * @private
         */
        isLineDelimiter: function(dom) {
            if (dom.nodeType != 1) {
                return false;
            }
            var lineDelimiters = CUI.rte.Selection.LINE_DELIMITING_TAGS;
            var lineDelTagCnt = lineDelimiters.length;
            var tagName = dom.tagName.toLowerCase();
            for (var tagIndex = 0; tagIndex < lineDelTagCnt; tagIndex++) {
                if (lineDelimiters[tagIndex] == tagName) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @private
         */
        getLineDelimiter: function(context, dom) {
            while (dom) {
                if (dom.nodeType == 1) {
                    if (CUI.rte.Selection.isLineDelimiter(dom)) {
                        return dom;
                    }
                }
                dom = com.getParentNode(context, dom);
            }
            return null;
        },

        /**
         * <p>Calculates the actual end node of a (processing) selection.</p>
         * <p>As processing selections contain a pointer to the first character/node that
         * is not actually included in the selection, this method is required if you need
         * a hold on the last item that is actually included in the selection.</p>
         * @param {Object} selection The selection as created by
         *        {@link CUI.rte.Selection#createProcessingSelection}
         * @return {Object} The adapted selections
         */
        adaptToInclusiveEndNode: function(context, selection) {
            var sel = CUI.rte.Selection;
            var adapted = {
                startNode: selection.startNode,
                startOffset: selection.startOffset
            };
            if (com.isRootNode(context, selection.startNode)
                    && (selection.startOffset == selection.startNode.childNodes.length)) {
                adapted.isEOT = true;
                return adapted;
            }
            var endNode = selection.endNode;
            var endOffset = selection.endOffset;
            if (endNode) {
                var moveAfterPrevCharNode = function() {
                    var pcn = com.getPreviousCharacterNode(context, endNode);
                    if (pcn) {
                        endNode = pcn;
                        endOffset = sel.getLastSelectionOffset(context, pcn, true);
                    }
                };
                if (com.isOneCharacterNode(endNode)) {
                    // one character, "structural" node
                    if (endOffset == 0) {
                        // selection ends after a "one character node" -> inclusive
                        // selection must contain the begin of the "one character node"
                        endOffset = null;
                    } else {
                        moveAfterPrevCharNode();
                    }
                } else if ((endNode.nodeType == 1)
                        && !com.isEmptyEditingBlock(endNode, true)) {
                    var ltn;
                    // other structural nodes
                    if ((endOffset == undefined)
                            || (endNode.childNodes.length == endOffset)) {
                        // EOB
                        ltn = com.getLastTextChild(endNode, true);
                        if (ltn) {
                            endNode = ltn;
                            endOffset = sel.getLastSelectionOffset(context, endNode, true);
                        } else {
                            // should not happen, as there should always be a character
                            // node
                            moveAfterPrevCharNode();
                        }
                    } else {
                        // directly pointing at (= before) a node
                        endNode = endNode.childNodes[endOffset];
                        endOffset = null;
                        ltn = com.getPreviousTextNode(context, endNode);
                        if (ltn) {
                            endNode = ltn;
                            endOffset = sel.getLastSelectionOffset(context, ltn, true);
                        }
                    }
                } else if (endNode.nodeType == 3) {
                    // text nodes
                    if (endOffset > 0) {
                        // adjusting inside a single text node
                        endOffset--;
                    } else {
                        // adjusting to previous character node; move over block borders
                        // must be handled as corner cases
                        moveAfterPrevCharNode();
                        var isBlockMove = (com.getNextCharacterNode(context, endNode,
                                com.EDITBLOCK_TAGS) == null);
                        if (!isBlockMove) {
                            if (com.isOneCharacterNode(endNode)) {
                                endOffset = null;
                            } else {
                                endOffset--;
                            }
                        }
                    }
                }
                // check for IE problem with empty blocks that might be between old
                // and new end node and must be taken instead
                var nodeToCheck = selection.endNode;
                if (nodeToCheck != endNode) {
                    // (don't consider end node itself!)
                    nodeToCheck = com.getPreviousNode(context, nodeToCheck);
                    while (nodeToCheck && (nodeToCheck != endNode)) {
                        if (com.isEmptyEditingBlock(nodeToCheck)) {
                            if ((selection.startNode == nodeToCheck)
                                    && (selection.startOffset == null)) {
                                endNode = null;
                            } else {
                                endNode = nodeToCheck;
                                endOffset = null;
                            }
                            break;
                        }
                        nodeToCheck = com.getPreviousNode(context, nodeToCheck);
                    }
                }
                if (endNode != null) {
                    adapted.endNode = endNode;
                    adapted.endOffset = endOffset;
                }
            }
            return adapted;
        },

        /**
         * <p>Expands the given selection to cover whole lines.</p>
         * <p>Multiline selections are handled correctly. Note that the trailing linefeed
         * (&lt;br&gt;) is included in the selection and has to be handled by the calling
         * method.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection The selection to be expanded
         */
        expandToLineBorders: function(context, selection) {
            var isLineDelimiter = CUI.rte.Selection.isLineDelimiter;
            var getLineDelimiter = CUI.rte.Selection.getLineDelimiter;
            var prevNode, tagNameLC;
            var startNode = selection.startNode;
            var endNode = selection.endNode;
            if (endNode == null) {
                endNode = startNode;
            }
            // expand start
            var lineStartNode = getLineDelimiter(context, startNode);
            if (lineStartNode == null) {
                var checkStartNode = startNode;
                while (checkStartNode) {
                    do {
                        prevNode = checkStartNode;
                        checkStartNode = com.getPreviousNode(context, checkStartNode);
                        if (!checkStartNode) {
                            break;
                        }
                        if (com.isRootNode(context, checkStartNode)) {
                            checkStartNode = null;
                            break;
                        }
                        if (getLineDelimiter(context, checkStartNode) != null) {
                            checkStartNode = null;
                            break;
                        }
                    } while (checkStartNode.nodeType == 3);
                    if (!checkStartNode) {
                        lineStartNode = prevNode;
                        break;
                    }
                    tagNameLC = checkStartNode.tagName.toLowerCase();
                    if (tagNameLC == "br") {
                        lineStartNode = prevNode;
                        break;
                    }
                }
            }

            // expand end
            var lineEndNode = getLineDelimiter(context, endNode);
            if (lineEndNode == null) {
                // corner case: whole line (incl. trailing "br") is already selected -
                // then we already found our end node
                if ((endNode.nodeType == 1) && (endNode.tagName.toLowerCase() == "br")) {
                    // handle empty lines correctly
                    lineEndNode = endNode;
                } else {
                    var checkEndNode = endNode;
                    while (checkEndNode) {
                        do {
                            prevNode = checkEndNode;
                            checkEndNode = com.getNextNode(context, checkEndNode);
                            if (!checkEndNode) {
                                break;
                            }
                            if (com.isRootNode(context, checkEndNode)) {
                                checkEndNode = null;
                                break;
                            }
                        } while (checkEndNode.nodeType == 3);
                        if (!checkEndNode || isLineDelimiter(checkEndNode)) {
                            lineEndNode = prevNode;
                            break;
                        }
                        tagNameLC = checkEndNode.tagName.toLowerCase();
                        if (tagNameLC == "br") {
                            lineEndNode = checkEndNode;
                            break;
                        }
                    }
                }
            }
            // handle container tags with content
            if (isLineDelimiter(lineStartNode)) {
                if (lineStartNode.childNodes.length > 0) {
                    lineStartNode = lineStartNode.childNodes[0];
                }
            }
            if (isLineDelimiter(lineEndNode)) {
                if (lineEndNode.childNodes.length > 0) {
                    lineEndNode = com.getLastChild(lineEndNode);
                }
            }
            return {
                "startNode": lineStartNode,
                "startOffset": (lineStartNode.nodeType == 3 ? 0 : null),
                "endNode": lineEndNode,
                "endOffset": (lineEndNode && lineEndNode.nodeType == 3
                        ? com.getNodeCharacterCnt(lineEndNode) : null)
            };
        },

        isNoInsertNode: function(node) {
            if (node.nodeType == 3) {
                return false;
            }
            var tagList = CUI.rte.Selection.NO_INSERT_TAGS;
            for (var i = 0; i < tagList.length; i++) {
                var isMatching = com.matchesTagDef(node, tagList[i]);
                if (isMatching) {
                    return true;
                }
            }
            return false;
        },

        /**
         * <p>Checks if the specified processing selection is a selection of at least one
         * character.</p>
         * <p>If this method returns false, either an object (for example an image)
         * is selected or the selection currently represents the caret. Note that this
         * method returns true if table cells are selected.</p>
         * @param {Object} selection The processing selection to be analyzed (as created by
         *        {@link CUI.rte.Selection#createProcessingSelection})
         * @return {Boolean} True if the specified processing selection represents an
         *         actual text selection as described above
         */
        isSelection: function(selection) {
            return (selection.endNode != null) || (selection.cellSelection != null);
        },

        /**
         * <p>Gets a single object that is currently selected through the specified
         * processing selection.</p>
         * <p>Note that this method only returns a valid DOM object if it is the only
         * selected object and no text selection exists.</p>
         * @param {Object} selection The processing selection to be analyzed (as created by
         *        {@link CUI.rte.Selection#createProcessingSelection})
         * @return {HTMLElement} The solely selected DOM element; null if there is no such
         *         element selected
         */
        getSelectedDom: function(selection) {
            var selectedDom = null;
            if ((selection.startNode && (selection.startOffset == null))
                    && !selection.endNode) {
                selectedDom = selection.startNode;
            }
            return selectedDom;
        },

        /**
         * <p>Gets the first possible selectable offset for the specified node.</p>
         * <p>This is 0 for a text node and null for structural nodes.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node to check
         * @return {Number} The last possible selection offset for the specified node
         */
        getFirstSelectionOffset: function(context, node) {
            return (node.nodeType == 3 ? 0 : null);
        },

        /**
         * <p>Gets the last possible selectable offset for the specified node.</p>
         * <p>This is the length of a text node, null for structural nodes, 0 for
         * structural nodes that are representing a character (img, a name, br).</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node to check
         * @param {Boolean} isEndOfSelection (optional) True if the last selection offset
         *        for the end of a selection should be determined. Due to limitations in a
         *        browser's implementation, the values might differ.
         * @return {Number} The last possible selection offset for the specified node
         */
        getLastSelectionOffset: function(context, node, isEndOfSelection) {
            if (node.nodeType == 3) {
                return node.nodeValue.length;
            }
            if (com.isOneCharacterNode(node)) {
                // Gecko cannot select "behind" a br at the end of a block
                if (com.ua.isGecko && com.isTag(node, "br") && !isEndOfSelection) {
                    var nextCharNode = com.getNextCharacterNode(context, node,
                            com.EDITBLOCK_TAGS);
                    if (nextCharNode == null) {
                        return null;
                    }
                }
                return 0;
            }
            return null;
        },

        /**
         * <p>Checks if the selection should be normalized before it is used for creating a
         * {@link CUI.rte.NodeList}).</p>
         * <p>A selection should be normalized if it represents a selection rather than
         * a caret and in some corner cases even if it is representing a caret (for example,
         * if it points behind a "br").</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection The processing selection to check
         */
        shouldNormalizePSelForNodeList: function(context, selection) {
            var sel = CUI.rte.Selection;
            if (sel.isSelection(selection)) {
                return true;
            }
            var startNode = selection.startNode;
            if (!startNode) {
                // Invalid start node might occur in several focus edge cases on IE -
                // simply ignore them
                return false;
            }
            var startOffset = selection.startOffset;
            if (com.isOneCharacterNode(startNode) && (startOffset == 0)) {
                // we should normalize if we are after the end of an object
                return true;
            }
            if ((startNode.nodeType == 3) && (startOffset >= startNode.nodeValue.length)) {
                // we should also normalize if we are after the end of a text node
                return true;
            }
            if (startNode.nodeType == 1) {
                // of course we must normalize EOT/EOB situations as well ...
                return true;
            }
            return false;
        },

        /**
         * <p>Checks if the selection should be normalized before using (for example for
         * analyzing a selection).</p>
         * <p>A selection should be normalized if it represents a selection rather than
         * a caret and in some corner cases even if it is representing a caret (for example,
         * if it represents an EOB/EOT situation).</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection The processing selection to check
         */
        shouldNormalizePSel: function(context, selection) {
            if (CUI.rte.Selection.isSelection(selection)) {
                return true;
            }
            var startNode = selection.startNode;
            if (startNode && (startNode.nodeType == 1) && !com.isOneCharacterNode(startNode)) {
                // we must normalize EOT/EOB situations as well ...
                return true;
            }
            return false;
        },

        /**
         * <p>Normalizes the specified processing selection as far as possible.</p>
         * <p>It is ensured that start and end node both point to character nodes as far
         * as it is somehow possible.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection The processing selection to be normalized (will be
         *        modified directly)
         */
        normalizeProcessingSelection: function(context, selection) {
            var sel = CUI.rte.Selection;
            var startNode = selection.startNode;
            var startOffset = selection.startOffset;
            var endNode = selection.endNode;
            var endOffset = selection.endOffset;
            if (startNode) {
                // map structural nodes to their character node equivalent
                var startDef = mapToCharNodeEquiv(context, startNode, startOffset, false);
                if (startDef != null) {
                    startNode = startDef.node;
                    startOffset = startDef.offset;
                }
                var endDef = mapToCharNodeEquiv(context, endNode, endOffset, true);
                if (endDef != null) {
                    endNode = endDef.node;
                    endOffset = endDef.offset;
                }
                // adjust start node if it points behind a character node
                if (com.isCharacterNode(startNode)) {
                    var mustCorrect = false;
                    var isCollapsed = false;
                    if (com.isOneCharacterNode(startNode)) {
                        mustCorrect = (startOffset == 0);
                    } else {
                        mustCorrect = (startOffset >= startNode.nodeValue.length);
                        isCollapsed = (startNode == endNode) && (startOffset == endOffset);
                    }
                    if (mustCorrect) {
                        var ntn = com.getNextCharacterNode(context, startNode,
                                com.EDITBLOCK_TAGS);
                        if (ntn) {
                            startNode = ntn;
                            startOffset = sel.getFirstSelectionOffset(context, ntn);
                            if (!isCollapsed) {
                                isCollapsed = (startNode == endNode)
                                        && (startOffset == endOffset);
                            }
                            if (isCollapsed) {
                                endNode = null;
                                endOffset = null;
                            }
                        }
                    }
                }
                selection.startNode = startNode;
                selection.startOffset = startOffset;
                selection.endNode = endNode;
                selection.endOffset = endOffset;
            }
        },

        /**
         * @private
         */
        LINE_DELIMITING_TAGS: [
            "p", "li", "h1", "h2", "h3", "h4", "h5", "h6"
        ],

        NO_INSERT_TAGS: [ {
                "tagName": "a",
                "attribsDefined": [ "name" ],
                "attribsUndefined": [ "href" ]
            }, {
                "tagName": "img"
            }, {
                "tagName": "span",
                "empty": true
            }
        ],

        /**
         * This list contains tag definitions for DOM objects that are individual items
         * of a selection.
         */
        SELECTION_INCLUSION_TAGS: [ {
                "tagName": "a",
                "attribsDefined": [ "name" ],
                "attribsUndefined": [ "href" ]
            }
        ]

    };

    // create browser specific variant of the helper class (using merge
    // is safe during initialization)
    return CUI.rte.Utils.merge(sharedProps, com.ua.isOldIE ? {

        /**
         * @private
         */
        getRangePosition: function(context, range) {
            range.collapse(true);
            var node = range.parentElement();
            // workaround for another IE problem: caret may be positioned directly
            // before/after a table, which leads to several problems
            if (node == context.root) {
                if ((range.htmlText.length == 0) && (range.text.length == 0)) {
                    var tmpRange = range.duplicate();
                    if (tmpRange.move("character", 1) == 1) {
                        range = tmpRange;
                        node = range.parentElement();
                    }
                }
            }
            var childCnt = node.childNodes.length;
            var nodePos = com.getCharacterOffsetForNode(context, node);
            // as always, there is a special case: if we got an "a name" as parent
            // element, actually the character behind that anchor is addressed
            if (com.isTag(node, "a") && com.isAttribDefined(node, "name")) {
                return nodePos + 1;
            }
            // text selection
            var textRange = range.duplicate();
            textRange.moveToElementText(node);
            textRange.collapse(true);
            textRange.setEndPoint("StartToEnd", range);
            var nodeRef = 0;
            var tmpOffs = 0;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToCheck = node.childNodes[childIndex];
                if (childToCheck.nodeType == 1) {
                    var correctingRange = textRange.duplicate();
                    correctingRange.moveToElementText(childToCheck);
                    correctingRange.collapse(false);
                    var cmp = (correctingRange.compareEndPoints("StartToStart", range));
                    if (cmp <= 0) {
                        nodeRef = childIndex + 1;
                        textRange.setEndPoint("StartToStart", correctingRange);
                        nodePos += tmpOffs;
                        if (cmp < 0) {
                            nodePos += com.getNodeTextLength(childToCheck);
                            tmpOffs = 0;
                        } else {
                            // there are cases where the range matches to the end of
                            // a non-character structure (for example at the end of a
                            // link, but not for "normal" structure tags as b, i, u, ...),
                            // hence this case covers these as well as "behind one-character
                            // structures" situations
                            nodePos += com.getNodeTextLength(childToCheck);
                            break;
                        }
                    } else {
                        break;
                    }
                } else {
                    tmpOffs += com.getNodeTextLength(childToCheck);
                }
            }
            var text = textRange.text.replace(/[\n\t\r]/g, "");
            nodePos += text.length;
            return nodePos;
        },

        /**
         * @private
         */
        setRangePosition: function(context, charPos, ensureEndPoint) {
            var sel = CUI.rte.Selection;
            var range = context.doc.selection.createRange();
            var nodeDef = com.getNodeAtPosition(context, charPos);
            if (nodeDef == null) {
                // EOT
                range.moveToElementText(context.root);
                range.collapse(false);
                return range;
            }
            if (nodeDef.isNodeSelection) {
                // a structural node is selected
                if (nodeDef.startOfElement || com.isEmptyEditingBlock(nodeDef.dom, true)) {
                    sel.setNodeToRange(context, range, nodeDef.dom, true);
                } else {
                    range.moveToElementText(nodeDef.dom);
                    range.collapse(false);
                    // EOB must "of course" be handled different, but beware of table
                    // cells and anchors ("a name") ... additionally, IPE adds some more
                    // complexity (must not correct the corrected selection if the
                    // parentElement already points to the context root)
                    var pNode = range.parentElement();
                    var checkRange = range.duplicate();
                    if (sel.isNoInsertNode(pNode)) {
                        range.move("character", -1);
                        range.move("character", 1);
                    } else if (!isTableCellCorner(context, pNode)
                            && (checkRange.move("character", 1) == 1)
                            && (checkRange.parentElement() != context.root)) {
                        range.move("character", -1);
                    }
                }
                return range;
            }
            var parentNode = nodeDef.parentDom;
            var parentOffset = nodeDef.parentOffset;
            if (!parentNode) {
                // handle end of text situation correctly
                var nodeBefore = nodeDef.nodeBefore;
                if (nodeBefore) {
                    if (nodeBefore.nodeType == 3) {
                        range.moveToElementText(nodeBefore.parentNode);
                    } else {
                        range.moveToElementText(nodeBefore);
                    }
                } else {
                    range.moveToElementText(context.root);
                }
                range.collapse(false);
                return range;
            }
            var requiresNestedListWorkaround = nodeDef.isUnregularNestedIssue;
            var nestedItem;
            if (requiresNestedListWorkaround) {
                nestedItem = nodeDef.nestedItemDom;
            }
            nodeDef = {
                "node": parentNode,
                "offset": parentOffset
            };
            adjustParentNodeAndOffset(context, nodeDef);
            sel.setNodeToRange(context, range, nodeDef.node, true);
            // There's another IE bug with standard-compliantly nested lists: The selection
            // may only be moved behind the last character of the list if the range is
            // collpsed. Found no workaround yet. It seems to work with non-collapsed
            // ranges, so we may create a range that can be used for setting the end point
            // of such a node
            if (requiresNestedListWorkaround) {
                range.moveToElementText(nestedItem);
                range.collapse(true);
                if (ensureEndPoint) {
                    range.move("character", -2);
                    range.moveEnd("character", 1);
                }
                return range;
            }
            if (nodeDef.offset > 0) {
                range.move("character", nodeDef.offset);
            }
            return range;
        },

        getSelection: function(context) {
            return context.doc.selection;
        },

        getLeadRange: function(context) {
            return context.doc.selection.createRange();
        },

        getCaretPos: function(context) {
            var range = context.doc.selection.createRange();
            return CUI.rte.Selection.getRangePosition(context, range);
        },

        setCaretPos: function(context, charPos) {
            var range = CUI.rte.Selection.setRangePosition(context, charPos);
            if (range) {
                range.select();
            }
        },

        createRange: function(context) {
            return context.doc.selection.createRange();
        },

        selectRange: function(context, rangeToSelect) {
            rangeToSelect.select();
        },

        createRangeBookmark: function(context) {
            return {
                "single": true,
                "bookmark": context.doc.selection.createRange()
            };
        },

        selectRangeBookmark: function(context, bookmark) {
            if (bookmark && bookmark.single && bookmark.bookmark) {
                bookmark.bookmark.select();
            }
        },

        getRangeTextContent: function(context, range) {
            return range.text;
        },

        createSelectionBookmark: function(context) {
            var sel = CUI.rte.Selection;
            var range = context.doc.selection.createRange();
            var selectionObject = null;
            var insertObject = null;
            var startPos, endPos;
            if (range.item) {
                selectionObject = range.item(0);
                startPos = com.getCharacterOffsetForNode(context, selectionObject);
                endPos = startPos;
            } else {
                var startRange = range.duplicate();
                startRange.collapse(true);
                startPos = sel.getRangePosition(context, startRange);
                var endRange = range.duplicate();
                endRange.collapse(false);
                endPos = sel.getRangePosition(context, endRange);
                if (startPos == endPos) {
                    var parentEl = range.parentElement();
                    if (parentEl) {
                        if (parentEl.childNodes.length == 0) {
                            insertObject = parentEl;
                            if (sel.isNoInsertNode(insertObject)) {
                                insertObject = null;
                            }
                        }
                    }
                }
            }
            return CUI.rte.Utils.apply({
                "startPos": startPos,
                "charCnt": (endPos - startPos),
                "object": selectionObject,
                "insertObject": insertObject
            }, sel.getScrollOffsets(context));
        },

        selectBookmark: function(context, bookmark) {
            var sel = CUI.rte.Selection;
            var objectToSelect = null;
            var isControlRange = false;
            if (bookmark.object) {
                objectToSelect = bookmark.object;
                isControlRange = true;
            } else if (bookmark.insertObject) {
                objectToSelect = bookmark.insertObject;
            }
            var range;
            if (objectToSelect) {
                try {
                    if (isControlRange) {
                        // todo check if correct
                        range = context.root.createControlRange();
                        range.addElement(objectToSelect);
                    } else {
                        range = context.doc.selection.createRange();
                        range.moveToElementText(objectToSelect);
                        range.collapse(true);
                    }
                } catch (e) {
                    // if the object is not available anymore (which might be the cause
                    // when undoing), use the caret-position instead
                    if (bookmark.startPos) {
                        objectToSelect = undefined;
                    }
                }
            }
            if (!objectToSelect) {
                range = sel.setRangePosition(context, bookmark.startPos);
                if (bookmark.charCnt > 0) {
                    // as IE selection module has a bug with correctly nested lists, we'll
                    // use the ensureEndPoint flag to ensure that the range has a valid end
                    // marker (but an invalid start marker, if the range is behind the
                    // last character of an item containing a nested list)
                    var endRange = sel.setRangePosition(context,
                            bookmark.startPos + bookmark.charCnt, true);
                    range.setEndPoint("EndToEnd", endRange);
                }
            }
            if (range) {
                range.select();
            }
            sel.setScrollOffsets(context, bookmark);
        },

        /**
         * Trims leading and trailing whitespace from the given range.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {TextRange} range The range to trim
         * @return {TextRange} A range that has no more trailing and/or leading whitespace
         */
        trimRangeWhitespace: function(context, range) {
            var sel = CUI.rte.Selection;
            var checkRange, tempRange;
            // don't do anything on object selections
            if (range.item) {
                return range;
            }
            // leading whitespace
            checkRange = range.duplicate();
            checkRange.collapse(true);
            var leadingCharsToTrim = 0;
            while (true) {
                tempRange = checkRange.duplicate();
                tempRange.moveEnd("character", leadingCharsToTrim + 1);
                if (!sel.hasWhitespaceOnly(tempRange.text)) {
                    break;
                }
                leadingCharsToTrim++;
            }
            // trailing whitespace
            checkRange = range.duplicate();
            checkRange.collapse(false);
            var trailingCharsToTrim = 0;
            while (true) {
                tempRange = checkRange.duplicate();
                tempRange.moveStart("character", -(trailingCharsToTrim + 1));
                if (!sel.hasWhitespaceOnly(tempRange.text)) {
                    break;
                }
                trailingCharsToTrim++;
            }
            // change range if necessary
            tempRange = range.duplicate();
            if (leadingCharsToTrim > 0) {
                tempRange.moveStart("character", leadingCharsToTrim);
            }
            if (trailingCharsToTrim > 0) {
                tempRange.moveEnd("character", -trailingCharsToTrim);
            }
            if (tempRange.text.length > 0) {
                range = tempRange;
            }
            return range;
        },

        /**
         * @private
         */
        getRangeNodeAndOffset: function(context, range, isSelection, isBeginOfSel) {
            // workaround for another IE bug: if the range is reported to be in some
            // container tags as <a name="">, take the first character of the next text node
            // as selection anchor
            var com = CUI.rte.Common;
            var sel = CUI.rte.Selection;
            var offset;
            var parentNode = range.parentElement();
            var parentRoot = (com.isRootNode(context, parentNode) ? parentNode : null);
            if (sel.isNoInsertNode(parentNode)) {
                var actualBlockNode = com.getTagInPath(context, parentNode,
                        com.EDITBLOCK_TAGS);
                var isEOT = false;
                parentNode = com.getNextCharacterNode(context, parentNode);
                // handle EOT corner case (where we won't get a succeeding character node)
                if (!parentNode) {
                    parentNode = actualBlockNode;
                    isEOT = true;
                }
                offset = sel.getFirstSelectionOffset(context, parentNode);
                // Handle EOL corner case
                var blockNode = com.getTagInPath(context, parentNode, com.EDITBLOCK_TAGS);
                if (!isEOT && (blockNode != actualBlockNode)) {
                    parentNode = actualBlockNode;
                    offset = null;
                }
                return {
                    "dom": parentNode,
                    "offset": offset
                };
            }
            var editElRange = range.duplicate();
            editElRange.moveEnd("character", 1);
            var colEditElRange = editElRange.duplicate();
            colEditElRange.collapse(false);
            var colEditElParent = colEditElRange.parentElement();
            var checkRange = range.duplicate();
            var node = range.parentElement();
            checkRange.moveToElementText(node);
            checkRange.collapse(true);
            if (checkRange.move("character", 1) == 1) {
                checkRange.move("character", -1);
            }
            // check if the selection is a structural node by checking the bounds of each
            // structural child nodes against the destination range
            var elNode = null;
            var elOffset = null;
            var childCnt = node.childNodes.length;
            var isStartToStart = false;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = node.childNodes[childIndex];
                if (childToProcess.nodeType == 1) {
                    var backupRange = checkRange.duplicate();
                    checkRange.moveToElementText(childToProcess);
                    var endRange = checkRange.duplicate();
                    checkRange.collapse(true);
                    endRange.collapse(false);
                    if (checkRange.compareEndPoints("StartToStart", editElRange) == 0) {
                        elNode = childToProcess;
                        isStartToStart = true;
                        break;
                    } else if (endRange.compareEndPoints("EndToEnd", editElRange) == 0) {
                        var checkPNode = checkRange.parentElement();
                        if (com.isTag(childToProcess, "img") && isAnchor(checkPNode)) {
                            // another lovely IE bug: if the last previous character node
                            // is a "a name", then a "img" at the begin of the succeeding
                            // block is reported as "EndToEnd", but has to be handled as
                            // "StartToStart"
                            var prevCharSibling = com.getPreviousCharacterNode(context,
                                    childToProcess, com.EDITBLOCK_TAGS);
                            if (prevCharSibling != checkPNode) {
                                isStartToStart = true;
                            }
                        }
                        elNode = childToProcess;
                        var ltn = com.getLastTextChild(elNode, true);
                        if (ltn) {
                            elNode = ltn;
                            elOffset = sel.getLastSelectionOffset(context, elNode,
                                    !isBeginOfSel);
                        }
                        break;
                    } else if (colEditElParent == childToProcess) {
                        if (com.isTag(colEditElParent, "table") && parentRoot) {
                            elNode = parentRoot;
                            elOffset = com.getChildIndex(colEditElParent);
                        } else {
                            elNode = childToProcess;
                        }
                        break;
                    }
                    var hasContent = com.hasTextChild(childToProcess);
                    if (com.isOneCharacterNode(childToProcess) || hasContent) {
                        checkRange.moveToElementText(childToProcess);
                        checkRange.collapse(false);
                    } else {
                        backupRange.move("character", 2);
                        checkRange = backupRange;
                    }
                }
            }
            if (!elNode) {
                // text selection - determine offset to the last directly selectable node
                var textRange = range.duplicate();
                textRange.moveToElementText(parentNode);
                textRange.collapse(true);
                textRange.setEndPoint("StartToEnd", range);
                var nodeRef = 0;
                for (childIndex = 0; childIndex < childCnt; childIndex++) {
                    var childToCheck = node.childNodes[childIndex];
                    if (childToCheck.nodeType == 1) {
                        var correctingRange = textRange.duplicate();
                        correctingRange.moveToElementText(childToCheck);
                        correctingRange.collapse(false);
                        var cmp = (correctingRange.compareEndPoints("StartToStart", range));
                        if (cmp < 0) {
                            nodeRef = childIndex + 1;
                            textRange.setEndPoint("StartToStart", correctingRange);
                        } else {
                            break;
                        }
                    }
                }
                var text = textRange.text.replace(/[\n\t\r]/g, "");
                var textLen = text.length;
                var offs = 0;
                for (childIndex = nodeRef; childIndex < childCnt; childIndex++) {
                    childToCheck = node.childNodes[childIndex];
                    var childLen = com.getNodeTextLength(childToCheck);
                    if ((offs + childLen) > textLen) {
                        elNode = childToCheck;
                        elOffset = textLen - offs;
                        break;
                    }
                    offs += childLen;
                }
            }
            // handle structural nodes correctly
            if (elNode && (elNode.nodeType == 1) && !com.isRootNode(context, elNode)) {
                if (!com.isOneCharacterNode(elNode)) {
                    // get first child node for structural nodes that may have content
                    var textNode = com.getFirstTextChild(elNode);
                    if (textNode) {
                        elNode = textNode;
                        elOffset = 0;
                    }
                } else if (com.isTag(elNode, "img")) {
                    // for images: adjust offset if we are handling the end of a selection
                    // to exclude the image
                    if (!isStartToStart) {
                        elOffset = 0;
                    }
                }
            }
            if (!elNode) {
                // element is not directly text-related; may be EOT or EOB/EOL
                if (parentRoot) {
                    // EOT
                    elNode = parentRoot;
                    elOffset = parentRoot.childNodes.length;
                } else {
                    elNode = com.getLastTextChild(parentNode, true);
                    // if range is between two nodes, prefer first character of succeeding
                    // node (if available) for the begin of a selection
                    if (elNode) {
                        if (isSelection && isBeginOfSel
                                && ((elNode.nodeType == 3) || com.isTag(elNode, "br"))) {
                            var nextTextNode = com.getNextCharacterNode(context, elNode,
                                    com.EDITBLOCK_TAGS);
                            if (nextTextNode) {
                                elNode = nextTextNode;
                                elOffset = sel.getFirstSelectionOffset(context, elNode);
                            } else {
                                elOffset = com.getNodeTextLength(elNode);
                            }
                        } else {
                            elOffset = sel.getLastSelectionOffset(context, elNode,
                                    !isBeginOfSel);
                        }
                    } else {
                        elNode = parentNode;
                    }
                }
            }
            return {
                "dom": elNode,
                "offset": elOffset
            };
        },

        createProcessingSelection: function(context) {
            var sel = CUI.rte.Selection;
            var range = context.doc.selection.createRange();
            if (range.item) {
                return {
                    "startNode": range.item(0)
                };
            }
            var startRange = range.duplicate();
            startRange.collapse(true);
            var endRange = range.duplicate();
            endRange.collapse(false);
            var startDef;
            var endDef = {
                "dom": null,
                "offset": null
            };
            if (startRange.compareEndPoints("StartToStart", endRange) == 0) {
                startDef = sel.getRangeNodeAndOffset(context, startRange, false);
            } else {
                startDef = sel.getRangeNodeAndOffset(context, startRange, true, true);
                endDef = sel.getRangeNodeAndOffset(context, endRange, true, false);
                // if an empty editing block is caught as end node, we'll have to move
                // further, as the editing block has to be included in the selection
                if (com.isEmptyEditingBlock(endDef.dom)) {
                    var nextNode = com.getNextNode(context, endDef.dom);
                    while (nextNode) {
                        var isSuitableNext = com.isEmptyEditingBlock(nextNode)
                                || com.isCharacterNode(nextNode);
                        if (isSuitableNext) {
                            break;
                        }
                        nextNode = com.getNextNode(context, nextNode);
                    }
                    if (!nextNode) {
                        // EOT situation
                        endDef.offset = com.getChildIndex(endDef.dom);
                        endDef.dom = com.getParentNode(context, endDef.dom);
                    } else {
                        endDef.dom = nextNode;
                        endDef.offset = sel.getFirstSelectionOffset(context, nextNode);
                    }
                }
            }
            if ((startDef.dom == endDef.dom) && (startDef.offset == endDef.offset)) {
                endDef.dom = null;
                endDef.offset = null;
            }
            // check if selection is actually valid (IE 8 sometimes returns invalid
            // selections!)
            if (!com.isAncestor(context, context.root, startDef.dom)) {
                return null;
            }
            return {
                "startNode": startDef.dom,
                "startOffset": startDef.offset,
                "endNode": endDef.dom,
                "endOffset": endDef.offset
            };
        },

        /**
         * @private
         */
        setNodeToRange: function(context, range, dom, asInsertPoint) {
            if (dom.nodeType == 3) {
                throw new Error("Cannot select text node");
            }
            try {
                // IE is extremely buggy here: collapse() alone does not work if a
                // paragraph gets selected and the last element of the previous paragraph
                // is an an anchor
                range.moveToElementText(dom);
                var pNode = range.parentElement();
                if (asInsertPoint) {
                    if (isAnchor(pNode)) {
                        range.collapse(true);
                        range.move("character", -1);
                        if (isAnchor(range.parentElement())) {
                            // even more nasty: if collapsing a paragraph to it's start and
                            // the preceding paragraph has an anchor as last object, the
                            // anchor of the preceding paragraph is selected instead ...
                            if (range.move("character", 2) == 2) {
                                range.move("character", -1);
                            }
                            // with multiple anchors directly following each other, things
                            // are getting nearly incredible nasty
                            if (isAnchor(range.parentElement())) {
                                range.move("character", -1);
                            }
                        } else {
                            // another kind of nastyness: the block has an object at its
                            // end and the preceding block has an object at its beginning
                            // then the workaround used above selects the beginning of the
                            // preceding block
                            pNode = range.parentElement();
                            if ((dom != pNode) && !com.isAncestor(context, dom, pNode)) {
                                if (!isAnchor(dom)) {
                                    range.moveToElementText(dom);
                                    range.collapse(true);
                                }
                            }
                        }
                    } else {
                        range.collapse(true);
                        var ptn = com.getPreviousCharacterNode(context, dom);
                        // positioning the caret doesn't work as expected if an anchor is at
                        // the end of the previous block or the previous block is a list and
                        // we'll try to position the caret on an empty block, hence we'll
                        // once more have to work around that issue accordingly
                        var requiresWorkaround = (com.isTag(dom, com.EDITBLOCK_TAGS)
                                    && com.isTag(ptn, "a")
                                    && com.isAttribDefined(ptn, "name"))
                                || (com.isEmptyEditingBlock(dom, true)
                                    && com.isTag(dom.previousSibling, com.LIST_TAGS));
                        if (requiresWorkaround) {
                            if (range.move("character", "-1") == -1) {
                                // offset of 1 doesn't work, but 2 does move the caret one
                                // block too far, so we'll correct that later
                                if (range.move("character", "2") == 2) {
                                    // handle EOT accordingly
                                    if (com.getNextNode(context, dom) != null) {
                                        range.move("character", "-1");
                                    }
                                }
                            }
                        } else {
                            // workaround is contraproductive for empty editing blocks
                            if (!com.isEmptyEditingBlock(dom, true)) {
                                // todo document which IE bug requires this to be worked around
                                if (range.move("character", 1) == 1) {
                                    range.move("character", -1);
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // There are situations where IE doesn't recognize range objects previously
                // created. At the moment, we're just ignoring that, as it occurs only in
                // situations where it doesn't really matter (when editing an anchor)
            }
        },

        selectNode: function(context, dom, asInsertPoint) {
            if (dom.nodeType == 3) {
                throw new Error("Selecting a text node is not supported.");
            }
            var range = context.doc.selection.createRange();
            CUI.rte.Selection.setNodeToRange(context, range, dom, asInsertPoint);
            range.select();
        },

        selectEmptyNode: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            var tempSpan = dpr.createTempSpan(context, true, false);
            tempSpan.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
            dom.appendChild(tempSpan);
            var range = context.doc.selection.createRange();
            range.moveToElementText(tempSpan);
            // required for the caret to appear/blink
            range.move("character", 1);
            range.select();
        },

        selectBeforeNode: function(context, dom) {
            var tempSpan = dpr.createTempSpan(context, true, false, true);
            tempSpan.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
            dom.parentNode.insertBefore(tempSpan, dom);
            var range = context.doc.selection.createRange();
            range.moveToElementText(tempSpan);
            range.collapse(true);
            range.select();
        },

        selectAfterNode: function(context, dom) {
            var range = context.doc.selection.createRange();
            var tempSpan = dpr.createTempSpan(context, true, false, true);
            tempSpan.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
            dom.parentNode.insertBefore(tempSpan, dom.nextSibling);
            range.moveToElementText(tempSpan);
            range.collapse(false);
            range.select();
        },

        resetSelection: function(context, mode) {
            var sel = CUI.rte.Selection;
            var range = context.doc.selection.createRange();
            var nodeToSelect = context.root;
            if (mode == "all") {
                range.moveToElementText(nodeToSelect);
            } else if (mode == "start") {
                var ftn = com.getNextEditableNode(context, context.root);
                if (ftn) {
                    nodeToSelect = ftn.parentNode;
                }
                sel.setNodeToRange(context, range, nodeToSelect, true);
            } else if (mode == "end") {
                var ltn = null;
                var ln = com.getLastChild(context.root);
                if (ln) {
                    if (com.isEditableNode(ln)) {
                        ltn = ln;
                    } else {
                        ltn = com.getPreviousEditableNode(context, context.root);
                    }
                    if (ltn) {
                        nodeToSelect = ltn.parentNode;
                    }
                }
                sel.setNodeToRange(context, range, nodeToSelect, false);
                range.collapse(false);
            }
            range.select();
        },

        /**
         * This method is currently Gecko-only. May be implemented if required by IE
         */
        flushSelection: function(context, keepSelection) {
            // may be implemented if necessary
        },

        /**
         * IE-only method to determine if the range specified is collapsed and therefore
         * represents a caret.
         * @param {TextRange} range The range to be checked
         * @return {Boolean} True if the range is collapsed
         */
        isCollapsed: function(range) {
            if (range.item) {
                return false;
            }
            var startRange = range.duplicate();
            startRange.collapse(true);
            var endRange = range.duplicate();
            endRange.collapse(false);
            return startRange.isEqual(endRange);
        }

    } : {

        /**
         * @private
         */
        getNodeCharacters: function(node) {
            var nodeText = node.nodeValue;
            if (nodeText) {
                return nodeText;
            }
            return "";
        },

        /**
         * @private
         */
        getCharPosition: function(context, node, offset) {
            var charPos = 0;
            var domWalker, nodeToProcess;
            // corner case: offset relative to a tag
            if ((node.nodeType == 1) && !com.isOneCharacterNode(node)) {
                // todo may also be a point of failure with div as root
                if (!com.isRootNode(context, node)) {
                    charPos = com.getCharacterOffsetForNode(context, node);
                }
                for (var childIndex = 0; childIndex < offset; childIndex++) {
                    var childToProcess = node.childNodes[childIndex];
                    charPos += com.getNodeCharacterCnt(childToProcess);
                    domWalker = context.doc.createTreeWalker(childToProcess,
                            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
                    while (true) {
                        try {
                            nodeToProcess = domWalker.nextNode();
                        } catch (ex) {
                            // on purpose: ignore nextNode() error because IE9 crashes if there is no next node
                        }
                        if (!nodeToProcess) {
                            break;
                        }
                        charPos += com.getNodeCharacterCnt(nodeToProcess);
                        if (com.isTag(nodeToProcess, com.EDITBLOCK_TAGS)) {
                            charPos++;
                        }
                    }
                    if (com.isTag(childToProcess, com.EDITBLOCK_TAGS)) {
                        charPos++;
                    }
                }
                return charPos;
            }
            // handle one character nodes (br, img) as required: if they are pointed
            // to directly, with offset 0, the caret is actually placed behind the node
            // (character offset is 1 there, according to the caret positioning rules)
            if (node.nodeType == 1) {
                if (offset == 0) {
                    offset = 1;
                }
            }
            // by default, calculate through text node and offset
            return com.getCharacterOffsetForNode(context, node) + offset;
        },

        /**
         * @private
         */
        calcNodeAndOffsetForPosition: function(context, charPos, handleSelectionEnd, dom,
                                               calcPos) {
            var sel = CUI.rte.Selection;
            // Parameters dom and calcPos are optional (used for recursion)
            if (!dom) {
                dom = context.root;
                calcPos = 0;
            }
            var isSuitableNodeEnd, offset;
            if (!com.isRootNode(context, dom)) {
                var charCnt = com.getNodeCharacterCnt(dom);
                // special case: The beginning of a nested list has also to be counted as
                // a single character
                var isNestedStruc = false;
                if (com.isTag(dom, com.EDITBLOCK_UNREGNEST_TAGS)) {
                    if ((com.getChildIndex(dom) == 0) &&
                            com.isFirstNestedList(context, dom.parentNode)) {
                        var pNode = dom;
                        do {
                            pNode = com.getParentNode(context, pNode);
                            if (pNode && com.isTag(pNode, com.EDITBLOCK_UNREGNEST_TAGS)) {
                                charCnt++;
                                isNestedStruc = true;
                                break;
                            }
                        } while (pNode);
                    }
                }
                isSuitableNodeEnd = (charCnt > 0)
                        && (handleSelectionEnd ? (charPos <= (calcPos + charCnt))
                            : (charPos < (calcPos + charCnt)));
                if ((charPos >= calcPos) && isSuitableNodeEnd) {
                    if (isNestedStruc) {
                        offset = null;
                        var textDom = com.getPreviousCharacterNode(context, dom);
                        if (textDom) {
                            dom = textDom;
                            offset = sel.getLastSelectionOffset(context, dom,
                                    handleSelectionEnd);
                        }
                        return {
                            "node": dom,
                            "offset": offset
                        };
                    }
                    offset = charPos - calcPos;
                    if (dom.nodeType == 1) {
                        offset = (offset == 0 ? null : 0);
                        // Gecko doesn't select "br"/0 as end of a selection as one would
                        // expect, so use the first character of the next text node
                        // instead (don't use break tags here, as we may encounter
                        // empty paragraphs as well)
                        if (com.isTag(dom, "br") && (offset == 0) && handleSelectionEnd) {
                            var nextTextNode = com.getNextCharacterNode(context, dom);
                            if (nextTextNode) {
                                dom = nextTextNode;
                                offset = sel.getFirstSelectionOffset(context, dom);
                            }
                        }
                    }
                    return {
                        "node": dom,
                        "offset": offset
                    };
                }
                calcPos += charCnt;
            }
            var childCnt = dom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var childToProcess = dom.childNodes[c];
                var ret = CUI.rte.Selection.calcNodeAndOffsetForPosition(context,
                        charPos, handleSelectionEnd, childToProcess, calcPos);
                if (typeof(ret) == "object") {
                    return ret;
                }
                calcPos = ret;
                if (com.isTag(childToProcess, com.EDITBLOCK_TAGS)) {
                    // "End of block" corner case
                    if (charPos == calcPos) {
                        var lastTextNode = com.getLastTextChild(childToProcess, true);
                        if (lastTextNode) {
                            offset = sel.getLastSelectionOffset(context, lastTextNode,
                                    handleSelectionEnd);
                            return {
                                "node": lastTextNode,
                                "offset": offset
                            };
                        }
                        // on IE, this means that we have an empty edit block and must
                        // continue to the next text node if possible
                        offset = null;
                        if (com.ua.isIE) {
                            var nextEditBlock = com.getNextEditableNode(context,
                                    childToProcess);
                            if (nextEditBlock) {
                                childToProcess = nextEditBlock;
                            } else {
                                // EOT
                                childToProcess = context.root;
                                offset = context.root.length;
                            }
                        }
                        return {
                            "node": childToProcess,
                            "offset": offset
                        };
                    }
                    // add another character at the end of a edit block, but no rule
                    // without exception: don't add at the end of a nested list or an
                    // empty edit block on W3C-compliant IE versions
                    var isValidEOEB = true;
                    var hasSpecialHandling = false;
                    if (com.isTag(childToProcess, com.EDITBLOCK_UNREGNEST_TAGS)) {
                        var itemParent = com.getParentNode(context, childToProcess);
                        var pIndex = com.getChildIndex(childToProcess);
                        var isLastChild = (pIndex == (itemParent.childNodes.length - 1));
                        var isNestedList = com.containsTagInPath(context, itemParent,
                                com.EDITBLOCK_UNREGNEST_TAGS);
                        isValidEOEB = !(isLastChild && isNestedList
                                && com.isLastNestedList(context, itemParent));
                        hasSpecialHandling = !isValidEOEB;
                    } else if (com.isTag(childToProcess, com.EDITBLOCK_NESTED_TAGS)) {
                        isValidEOEB = !com.isLastElementOfNestingLevel(context,
                                childToProcess);
                        hasSpecialHandling = !isValidEOEB;
                    }
                    if (com.ua.isIE && !hasSpecialHandling) {
                        isValidEOEB = !com.isEmptyEditingBlock(childToProcess, true);
                    }
                    if (isValidEOEB) {
                        calcPos++;
                    }
                }
            }
            // handle EOT corner case somehow ...
            if (com.isRootNode(context, dom)) {
                var node = com.getLastChild(dom);
                offset = sel.getLastSelectionOffset(context, node, handleSelectionEnd);
                return {
                    "node": node,
                    "offset": offset
                };
            }
            return calcPos;
        },

        /**
         * @private
         */
        getSelectionObject: function(selection) {
            if (selection.anchorNode != selection.focusNode) {
                return null;
            }
            if (Math.abs(selection.anchorOffset - selection.focusOffset) != 1) {
                return null;
            }
            var offset = (selection.anchorOffset < selection.focusOffset
                    ? selection.anchorOffset : selection.focusOffset);
            var selectedNode = selection.anchorNode.childNodes[offset];
            if (!selectedNode) {
                return null;
            }
            if (selectedNode.nodeType == 3) {
                return null;
            }
            if (com.isTag(selectedNode, com.EDITBLOCK_TAGS)) {
                return null;
            }
            return selectedNode;
        },

        /**
         * @private
         */
        getTableSelection: function(context) {
            var tableSelection = {
                "cells": [ ],
                "otherContent": false
            };
            var selection = context.win.getSelection();
            for (var i = 0; i < selection.rangeCount; i++) {
                var range = selection.getRangeAt(i);
                var cell = null;
                if (range.startContainer == range.endContainer) {
                    cell = range.startContainer;
                    if (com.isTag(cell, "tr")) {
                        if (range.startOffset == (range.endOffset - 1)) {
                            cell = cell.childNodes[range.startOffset];
                        } else {
                            cell = null;
                        }
                    } else if (!com.isTag(range.startContainer, [ "th", "td" ])) {
                        cell = null;
                    }
                }
                if (cell) {
                    tableSelection.cells.push(cell);
                } else {
                    tableSelection.otherContent = true;
                }
            }
            return ((tableSelection.cells.length > 0) ? tableSelection : null);
        },

        getSelection: function(context) {
            return context.win.getSelection();
        },

        getLeadRange: function(context) {
            return context.win.getSelection().getRangeAt(0);
        },

        getCaretPos: function(context) {
            var selection = context.win.getSelection();
            if ((selection.anchorNode != selection.focusNode)
                    || (selection.anchorOffset != selection.focusOffset)) {
                return -1;
            }
            return CUI.rte.Selection.getCharPosition(
                    context, selection.anchorNode, selection.anchorOffset);
        },

        setCaretPos: function(context, charPos) {
            if (charPos < 0) {
                charPos = 0;
            }
            var selection = context.win.getSelection();
            var range = context.doc.createRange();
            var nodeAndOffset = CUI.rte.Selection.calcNodeAndOffsetForPosition(
                    context, charPos);
            // to get similar results to IE, correct to previous structure if we are at the
            // character directly following such a structure
            correctToPreviousStructure(context, nodeAndOffset);
            adjustNodeAndOffsetToParent(context, nodeAndOffset);
            var node = nodeAndOffset.node;
            var offset = nodeAndOffset.offset;
            if (com.isTag(node, "img") && (offset == 0)) {
                // selecting images at the end of an edit block fails on Webkit if the
                // parent element + offset is selected; selecting the image and collapsing
                // the selection to its end seems to work though
                range.selectNode(node);
                range.collapse(false);
            } else {
                // handle the selection of empty blocks on IE versions that support the DOM
                // selection model
                var isIEEmptyBlockSel = false;
                if (com.ua.isIE) {
                    if ((node.nodeType == 1) && !isNaN(offset)) {
                        var potentialBlock = node.childNodes[offset];
                        if (com.isTag(potentialBlock, com.EDITBLOCK_TAGS)
                                && (potentialBlock.childNodes.length === 0)) {
                            node = potentialBlock;
                            isIEEmptyBlockSel = true;
                        }
                    }
                }
                if (!isIEEmptyBlockSel) {
                    range.setStart(node, offset);
                    range.setEnd(node, offset);
                } else {
                    range.selectNodeContents(node);
                }
            }
            selection.removeAllRanges();
            selection.addRange(range);
        },

        createRange: function(context) {
            return context.doc.createRange();
        },

        selectRange: function(context, rangeToSelect) {
            var selection = context.win.getSelection();
            selection.removeAllRanges();
            selection.addRange(rangeToSelect);
        },

        createRangeBookmark: function(context) {
            var selection = context.win.getSelection();
            if (selection.rangeCount == 1) {
                return {
                    "single": true,
                    "bookmark": selection.getRangeAt(0)
                };
            } else {
                var ranges = [ ];
                for (var r = 0; r < selection.rangeCount; r++) {
                    ranges.push(selection.getRangeAt(r));
                }
                return {
                    "single": false,
                    "bookmark": ranges
                };
            }
        },

        selectRangeBookmark: function(context, bookmark) {
            if (bookmark && bookmark.bookmark) {
                var selection = context.win.getSelection();
                selection.removeAllRanges();
                if (bookmark.single) {
                    selection.addRange(bookmark.bookmark);
                } else {
                    var ranges = bookmark.bookmark;
                    for (var r = 0; r < ranges.length; r++) {
                        selection.addRange(ranges[r]);
                    }
                }
            }
        },

        getRangeTextContent: function(context, range) {
            var selectionFrag = range.cloneContents();
            var fragTreeWalker = context.doc.createTreeWalker(selectionFrag,
                    NodeFilter.SHOW_TEXT, null, false);
            var textContent = "",
                nodeToProcess;
            while (true) {
                try {
                    nodeToProcess = fragTreeWalker.nextNode();
                } catch (ex) {
                    // on purpose: ignore nextNode() error because IE9 crashes if there is no next node
                }
                if (!nodeToProcess) {
                    break;
                }
                textContent += CUI.rte.Selection.getNodeCharacters(nodeToProcess);
            }
            return textContent;
        },

        createSelectionBookmark: function(context) {
            var sel = CUI.rte.Selection;
            var selection = context.win.getSelection();
            var selectionObject = CUI.rte.Selection.getSelectionObject(selection);
            var insertObject = null;
            var cells = null;
            var startPos, endPos, range;
            var rangeCnt = selection.rangeCount;
            if (rangeCnt == 1) {
                startPos = sel.getCharPosition(context, selection.anchorNode,
                        selection.anchorOffset);
                endPos = sel.getCharPosition(context, selection.focusNode,
                        selection.focusOffset);
            } else if (rangeCnt > 1) {
                cells = [ ];
                for (var r = 0; r < rangeCnt; r++) {
                    range = selection.getRangeAt(r);
                    var cell = range.startContainer;
                    if (com.isTag(cell, "tr")) {
                        cells.push(cell.childNodes[range.startOffset]);
                    }
                    var rangeStartPos = sel.getCharPosition(context, range.startContainer,
                            range.startOffset);
                    if ((r == 0) || (rangeStartPos < startPos)) {
                        startPos = rangeStartPos;
                        endPos = rangeStartPos;
                    }
                }
            } else if (rangeCnt == 0) {
                // pre-init/unfocused state: no valid range available, assuming caret at
                // position 0
                startPos = 0;
                endPos = 0;
            }
            if (endPos < startPos) {
                var swap = endPos;
                endPos = startPos;
                startPos = swap;
            }
            if ((startPos == endPos) && !cells && (rangeCnt == 1)) {
                range = selection.getRangeAt(0);
                var parentEl = range.commonAncestorContainer;
                if (parentEl.nodeType == 1) {
                    var childCnt = parentEl.childNodes.length;
                    // workaround: FF may insert a br in an empty list item
                    if ((childCnt == 0) || ((childCnt == 1)
                            && com.isTag(parentEl.childNodes[0], "br"))) {
                        insertObject = parentEl;
                        if (CUI.rte.Selection.isNoInsertNode(insertObject)) {
                            insertObject = null;
                        }
                    }
                }
            }
            return CUI.rte.Utils.apply({
                "startPos": startPos,
                "charCnt": endPos - startPos,
                "object": selectionObject,
                "insertObject": insertObject,
                "cells": cells
            }, CUI.rte.Selection.getScrollOffsets(context));
        },

        selectBookmark: function(context, bookmark) {
            var sel = CUI.rte.Selection;
            var doc = context.doc;
            var objectToSelect = null;
            var range, selection;
            var cells = bookmark.cells;
            // if table cells are bookmarked, we're trying to select them first and use
            // the caret position only if none of the cells are available
            if (cells) {
                selection = context.win.getSelection();
                selection.removeAllRanges();
                var hasValidCells = false;
                var cellCnt = cells.length;
                for (var c = 0; c < cellCnt; c++) {
                    var cellToProcess = cells[c];
                    if (cellToProcess && cellToProcess.ownerDocument == doc) {
                        range = doc.createRange();
                        var container = cellToProcess.parentNode;
                        var offset = com.getChildIndex(cellToProcess);
                        try {
                            range.setStart(container, offset);
                            range.setEnd(container, offset + 1);
                            selection.addRange(range);
                            hasValidCells = true;
                        } catch (e) {
                            // intentionally ignored; will be handled through hasValidCells
                        }
                    }
                }
                if (hasValidCells) {
                    return;
                }
            }
            // the default selection process
            if (bookmark.object) {
                objectToSelect = bookmark.object;
            } else if (bookmark.insertObject) {
                objectToSelect = bookmark.insertObject;
            }
            range = doc.createRange();
            if (objectToSelect) {
                try {
                    range.selectNode(objectToSelect);
                    range.collapse(true);
                } catch (e) {
                    // if the object is not available anymore (which might be the cause
                    // when undoing), use the caret-position instead
                    if (bookmark.startPos != null) {
                        objectToSelect = undefined;
                    }
                }
            }
            var isRangeCreated = !!objectToSelect;
            if (!isRangeCreated) {
                var startNodeAndOffset = sel.calcNodeAndOffsetForPosition(context,
                        bookmark.startPos);
                var endNodeAndOffset = startNodeAndOffset;
                if (bookmark.charCnt > 0) {
                    endNodeAndOffset = sel.calcNodeAndOffsetForPosition(context,
                            bookmark.startPos + bookmark.charCnt, true);
                } else if (com.ua.isIE) {
                    // selecting an empty edit block on IE causes problems if the
                    // setStart... methods are used
                    if (com.isEmptyEditingBlock(startNodeAndOffset.node, true)) {
                        range.selectNodeContents(startNodeAndOffset.node);
                        isRangeCreated = true;
                    }
                }
            }
            if (!isRangeCreated) {
                correctToPreviousStructure(context, startNodeAndOffset);
                if (com.ua.isGecko) {
                    adjustNodeAndOffsetToParent(context, startNodeAndOffset);
                }
                if (bookmark.charCnt > 0) {
                    if (com.ua.isGecko) {
                        adjustNodeAndOffsetToParent(context, endNodeAndOffset);
                    }
                }
                var startNode = startNodeAndOffset.node;
                var startOffset = startNodeAndOffset.offset;
                var endNode = endNodeAndOffset.node;
                var endOffset = endNodeAndOffset.offset;
                if (!com.ua.isGecko && (startNode.nodeType == 1)) {
                    if (startOffset == null) {
                        // TODO probably needs "empty block/table cell" fix for IE (use setEnd?)
                        range.setStartBefore(startNode);
                    } else {
                        range.setStartAfter(startNode);
                    }
                } else {
                    range.setStart(startNode, startOffset);
                }
                if (!com.ua.isGecko && (endNode.nodeType == 1)) {
                    if (endOffset == null) {
                        // TODO probably needs "empty block/table cell" fix for IE (use setEnd?)
                        range.setEndBefore(endNode);
                    } else {
                        range.setEndAfter(endNode);
                    }
                } else {
                    range.setEnd(endNode, endOffset);
                }
            }
            selection = context.win.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        },

        /**
         * Trims leading and trailing whitespace from the given range.
         * @param {TextRange} range The range to trim
         * @return {TextRange} A range that has no more trailing and/or leading whitespace
         */
        trimRangeWhitespace: function(context, range) {
            var sel = CUI.rte.Selection;
            var rangeText = sel.getRangeTextContent(context, range);
            var leadingWhitespaceCnt = 0;
            var checkPos = 1;
            var fragToCheck;
            while (checkPos < rangeText.length) {
                fragToCheck = rangeText.substring(0, checkPos++);
                if (!sel.hasWhitespaceOnly(fragToCheck)) {
                    break;
                }
                leadingWhitespaceCnt++;
            }
            var trailingWhitespaceCnt = 0;
            checkPos = rangeText.length;
            while (checkPos > 0) {
                fragToCheck = rangeText.substring(--checkPos, rangeText.length);
                if (!sel.hasWhitespaceOnly(fragToCheck)) {
                    break;
                }
                trailingWhitespaceCnt++;
            }
            if ((rangeText.length - leadingWhitespaceCnt - trailingWhitespaceCnt) > 0) {
                if (leadingWhitespaceCnt > 0) {
                    var startPos = sel.getCharPosition(context, range.startContainer,
                            range.startOffset);
                    startPos += leadingWhitespaceCnt;
                    var startNodeAndOffset = sel.calcNodeAndOffsetForPosition(context,
                            startPos);
                    range.setStart(startNodeAndOffset.node, startNodeAndOffset.offset);
                }
                if (trailingWhitespaceCnt > 0) {
                    var endPos = sel.getCharPosition(context, range.endContainer,
                            range.endOffset);
                    endPos -= trailingWhitespaceCnt;
                    var endNodeAndOffset = sel.calcNodeAndOffsetForPosition(context,
                            endPos);
                    range.setEnd(endNodeAndOffset.node, endNodeAndOffset.offset);
                }
            }
            return range;
        },

        createProcessingSelection: function(context) {
            var startNode, startOffset, endNode, endOffset;
            var selection = context.win.getSelection();
            var sel = CUI.rte.Selection;
            // table cell selection "support"
            var cellSelection = null;
            var isSingleCellSelected = false;
            if ((selection.focusNode == selection.anchorNode)
                    && (com.isTag(selection.focusNode, "tr"))) {
                isSingleCellSelected = true;
            }
            if ((selection.rangeCount > 1) || isSingleCellSelected) {
                cellSelection = sel.getTableSelection(context);
                var range = selection.getRangeAt(0);
                startNode = range.startContainer;
                startOffset = null;
                if (startNode.nodeType == 1) {
                    startNode = startNode.childNodes[range.startOffset];
                } else {
                    startOffset = range.startOffset;
                }
                range = selection.getRangeAt(selection.rangeCount - 1);
                endOffset = null;
                endNode = range.endContainer;
                if (endNode.nodeType == 1) {
                    if (range.endOffset < endNode.childNodes.length) {
                        endNode = com.getPreviousNode(context,
                                endNode.childNodes[range.endOffset]);
                    } else {
                        endNode = com.getLastChild(endNode);
                    }
                    if (endNode.nodeType == 3) {
                        endOffset = com.getNodeCharacterCnt(endNode);
                    }
                } else {
                    endOffset = range.endOffset;
                }
                return {
                    "startNode": startNode,
                    "startOffset": startOffset,
                    "endNode": endNode,
                    "endOffset": endOffset,
                    "isDiscontinuousSelection": true,
                    "cellSelection": cellSelection
                };
            }
            // selected "objects" (a name, img, etc.)
            var selectionObject = sel.getSelectionObject(selection);
            if (selectionObject) {
                return {
                    "startNode": selectionObject
                };
            }
            startNode = selection.anchorNode;
            startOffset = selection.anchorOffset;
            endNode = selection.focusNode;
            endOffset = selection.focusOffset;
            var isCollapsed = (startNode == endNode) && (startOffset == endOffset);
            var childCnt;
            // startNode might be null, so it's better to check that first
            if (startNode
                    && !com.isOneCharacterNode(startNode) && (startNode.nodeType == 1)) {
                childCnt = startNode.childNodes.length;
                if (childCnt == 0) {
                    startOffset = null;
                } else if (startOffset < childCnt) {
                    startNode = startNode.childNodes[startOffset];
                    startNode = com.getFirstChild(startNode) || startNode;
                    startOffset = (startNode.nodeType == 3 ? 0 : null);
                } else {
                    startNode = com.getLastChild(startNode);
                    if (startNode.nodeType == 3) {
                        startOffset = com.getNodeCharacterCnt(startNode);
                    } else if (com.isOneCharacterNode(startNode)) {
                        startOffset = 0;
                    } else {
                        startOffset = null;
                    }
                }
            }
            if (isCollapsed) {
                return {
                    "startNode": startNode,
                    "startOffset": startOffset,
                    "cellSelection": cellSelection
                };
            }
            if (!com.isOneCharacterNode(endNode) && (endNode.nodeType == 1)) {
                childCnt = endNode.childNodes.length;
                if (childCnt == 0) {
                    endOffset = null;
                } else if (endOffset < childCnt) {
                    endNode = endNode.childNodes[endOffset];
                    endNode = com.getFirstChild(endNode) || endNode;
                    endOffset = ((endNode.nodeType == 1)
                            && !com.hasTextChild(endNode, false) ? null : 0);
                } else {
                    endNode = com.getLastChild(endNode);
                    if (endNode.nodeType == 3) {
                        endOffset = com.getNodeCharacterCnt(endNode);
                    } else if (com.isOneCharacterNode(endNode)) {
                        endOffset = 0;
                    } else {
                        endOffset = null;
                    }
                }
            }
            var mustSwap = false;
            if (startNode == endNode) {
                mustSwap = (endOffset < startOffset);
            } else {
                var startIndex = com.createIndexPath(context, startNode);
                var endIndex = com.createIndexPath(context, endNode);
                mustSwap = (com.compareIndexPaths(startIndex, endIndex) < 0);
            }
            if (mustSwap) {
                var swap = endNode;
                endNode = startNode;
                startNode = swap;
                swap = endOffset;
                endOffset = startOffset;
                startOffset = swap;
            }
            return {
                "startNode": startNode,
                "startOffset": startOffset,
                "endNode": endNode,
                "endOffset": endOffset,
                "cellSelection": cellSelection
            };
        },

        selectNode: function(context, dom, asInsertPoint) {
            if (dom.nodeType == 3) {
                throw new Error("Selecting a text node is not supported.");
            }
            var selection = context.win.getSelection();
            var range = context.doc.createRange();
            if (asInsertPoint) {
                var textNode = com.getFirstTextChild(dom);
                if (textNode) {
                    range.setStart(textNode, 0);
                    range.setEnd(textNode, 0);
                } else {
                    // "empty line" handling
                    if ((dom.childNodes.length == 1)
                            && (dom.childNodes[0].nodeType == 1)) {
                        range.selectNode(dom.childNodes[0]);
                        range.collapse(true);
                    } else if (com.ua.isIE && com.isEmptyEditingBlock(dom, true)) {
                        // IE supporting W3C selection model needs special treatment
                        // for empty blocks
                        range.selectNodeContents(dom);
                    } else {
                        range.selectNode(dom);
                        range.collapse(true);
                    }
                }
            } else {
                range.selectNode(dom);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        },

        selectEmptyNode: function(context, dom) {
            var selection = context.win.getSelection();
            var range = context.doc.createRange();
            if (com.ua.isWebKit) {
                var tempSpan = dpr.createTempSpan(context, true, false, true);
                tempSpan.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
                dom.appendChild(tempSpan);
                range.selectNode(dom);
                range.collapse(false);
            } else {
                range.setStart(dom, 0);
                range.setEnd(dom, 0);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        },

        selectBeforeNode: function(context, dom) {
            var selection = context.win.getSelection();
            var range = context.doc.createRange();
            // Gecko is more reliable if the last character of the preceding character node
            // is selected instead of using setXxxBefore
            var isSelected = false;
            if (com.ua.isGecko) {
                var prevNode = com.getPreviousCharacterNode(context, dom,
                        com.EDITBLOCK_TAGS);
                if (prevNode && !com.isOneCharacterNode(prevNode)) {
                    var charCnt = prevNode.nodeValue.length;
                    range.setStart(prevNode, charCnt);
                    range.setEnd(prevNode, charCnt);
                    isSelected = true;
                }
            }
            if (!isSelected) {
                range.setStartBefore(dom);
                range.setEndBefore(dom);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        },

        selectAfterNode: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            var selection = context.win.getSelection();
            var range = context.doc.createRange();
            if (com.ua.isWebKit) {
                // selecting after a node does not work on WebKit, so we'll add another
                // workaround, add a temporary node and select behind that one instead
                var tempSpan = dpr.createTempSpan(context, true, false, true);
                tempSpan.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
                dom.parentNode.insertBefore(tempSpan, dom.nextSibling);
                dom = tempSpan;
            }
            range.setStartAfter(dom);
            range.setEndAfter(dom);
            selection.removeAllRanges();
            selection.addRange(range);
        },

        /**
         * This method is Gecko only, as only Gecko seems to have problems with the caret
         * getting out of the visible area of the editor iframe.
         */
        getPreferredScrollOffset: function(context) {
            return context.root.scrollTop;
        },

        /**
         * This method is Gecko/Webkit only, as IE does not seem to have problems with the
         * caret getting out of the visible area of the editor iframe.
         */
        ensureCaretVisibility: function(context, preferredScrollOffset) {
            var sel = CUI.rte.Selection;
            var range = sel.getLeadRange(context).cloneRange();
            // workaround for selected cells (insertNode() doesn't handle them as expected)
            if (range.startContainer.nodeType == 1) {
                var nodeToCheck = range.startContainer.childNodes[range.startOffset];
                if (com.isTag(nodeToCheck, [ "td", "th" ])) {
                    range.selectNodeContents(nodeToCheck);
                }
            }
            // use a helper span to exactly determine current caret position/size in pixels
            if (context.iFrame) {
                var locSpan = context.createElement("span");
                var nbsp = context.createTextNode(dpr.NBSP);
                locSpan.appendChild(nbsp);
                range.insertNode(locSpan);
                var top = locSpan.offsetTop;
                var op = locSpan;
                while (op.offsetParent) {
                    op = op.offsetParent;
                    top += op.offsetTop;
                }
                var height = locSpan.offsetHeight;
                var scrollTop = context.root.scrollTop;
                var iframeHeight = context.iFrame.clientHeight;
                var scrollBottom = scrollTop + iframeHeight;
                var bottom = top + height;
                var maxScroll = context.root.scrollHeight;
                if ((maxScroll - bottom) < 8) {
                    bottom = maxScroll;
                }
                if (preferredScrollOffset != null) {
                    var preferredBottom = preferredScrollOffset + iframeHeight;
                    if ((top >= preferredScrollOffset) && (bottom < preferredBottom)) {
                        context.root.scrollTop = preferredScrollOffset;
                    } else {
                        if (top < preferredScrollOffset) {
                            context.root.scrollTop = top;
                        } else {
                            context.root.scrollTop = bottom - iframeHeight;
                        }
                    }
                } else if (bottom > scrollBottom) {
                    context.root.scrollTop = bottom - iframeHeight;
                } else if (top < scrollTop) {
                    context.root.scrollTop = top;
                }
                var pNode = locSpan.parentNode;
                pNode.removeChild(locSpan);
                pNode.normalize();
            }
        },

        /**
         * This method is Gecko-only. Can be used as a workaround to ensure no selection
         * artifacts are displayed onscreen.
         */
        flushSelection: function(context, keepSelection) {
            var selection = context.win.getSelection();
            var savedRanges;
            if (keepSelection) {
                savedRanges = [ ];
                var rangeCnt = selection.rangeCount;
                for (var r = 0; r < rangeCnt; r++) {
                    savedRanges.push(selection.getRangeAt(r));
                }
            }
            selection.selectAllChildren(context.root);
            selection.collapseToStart();
            if (keepSelection) {
                selection.removeAllRanges();
                for (r = 0; r < rangeCnt; r++) {
                    selection.addRange(savedRanges[r]);
                }
            }
        },

        resetSelection: function(context, mode) {
            var range;
            var selection = context.win.getSelection();
            var nodeToSelect = context.root;
            if (mode == "all") {
                selection.selectAllChildren(nodeToSelect);
            } else if (mode == "start") {
                var ftn = com.getNextEditableNode(context, context.root);
                if (ftn) {
                    nodeToSelect = ftn.parentNode;
                }
                if (com.ua.isIE && com.isEmptyEditingBlock(ftn, true)) {
                    range = context.doc.createRange();
                    range.selectNodeContents(ftn);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    selection.selectAllChildren(nodeToSelect);
                    selection.collapseToStart();
                }
            } else if (mode == "end") {
                var ltn = null;
                var ln = com.getLastChild(context.root);
                if (ln) {
                    if (com.isEditableNode(ln)) {
                        ltn = ln;
                    } else {
                        ltn = com.getPreviousEditableNode(context, context.root);
                    }
                    if (ltn) {
                        nodeToSelect = ltn.parentNode;
                    }
                }
                if (com.ua.isIE && com.isEmptyEditingBlock(ltn, true)) {
                    range = context.doc.createRange();
                    range.selectNodeContents(ltn);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    selection.selectAllChildren(nodeToSelect);
                    selection.collapseToEnd();
                }
            }
        }

    });

}();