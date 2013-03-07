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
 * The DomProcessor provides utility functions to manipulate the DOM directly.
 */
CUI.rte.DomProcessor = function() {

    var com = CUI.rte.Common;

    return {

        getTagType: function(dom) {
            var dpr = CUI.rte.DomProcessor;
            var tagName = (dom instanceof String ? dom : dom.tagName).toLowerCase();
            var type = dpr.STRUCTURE;
            var typeTable = dpr.TYPE_TABLE;
            if (typeTable.hasOwnProperty(tagName)) {
                type = typeTable[tagName];
                if (typeof(type) != "string") {
                    type = type.type;
                }
            }
            return type;
        },

        resolveTagType: function(dom) {
            var dpr = CUI.rte.DomProcessor;
            var tagName = (dom instanceof String ? dom : dom.tagName).toLowerCase();
            var type = dpr.STRUCTURE;
            var typeTable = dpr.TYPE_TABLE;
            if (typeTable.hasOwnProperty(tagName)) {
                type = typeTable[tagName];
                if (typeof(type) != "string") {
                    if (type.type == dpr.DYNAMIC) {
                        if (type.getDynamicType) {
                            type = type.getDynamicType(dom);
                        } else {
                            type = dpr.STRUCTURE;
                        }
                    } else {
                        type = type.type;
                    }
                }
            }
            return type;
        },

        createNodeList: function(context, selection) {
            var nodeList = new CUI.rte.NodeList();
            if (selection.cellSelection && selection.cellSelection.cells) {
                nodeList.createFromDomNodes(context, selection.cellSelection.cells);
            } else {
                nodeList.createFromDocument(context, selection);
            }
            return nodeList;
        },

        getCommonAncestor: function(context, dom1, dom2) {
            if ((dom1 == null) || (dom2 == null)) {
                return null;
            }
            if (com.isAncestor(context, dom1, dom2)) {
                return dom1.parentNode;
            }
            if (com.isAncestor(context, dom2, dom1)) {
                return dom2.parentNode;
            }
            while (dom1) {
                var dom2Check = dom2;
                while (dom2Check) {
                    if (dom2Check == dom1) {
                        return dom1;
                    }
                    dom2Check = com.getParentNode(context, dom2Check);
                }
                dom1 = com.getParentNode(context, dom1);
            }
            return null;
        },

        /**
         * Splits the specified text node at the specified offset(s).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} textNode The text node to be split
         * @param {Number|Number[]} splitPoints Offsets to split the node
         * @return {HTMLElement[]} Array containing all split nodes in correct order
         */
        splitTextNode: function(context, textNode, splitPoints) {
            if (textNode.nodeType != 3) {
                throw new Error("splitTextNode() may only operate on text nodes.");
            }
            if (!CUI.rte.Utils.isArray(splitPoints)) {
                splitPoints = [ splitPoints ];
            }
            splitPoints.sort(function(c1, c2) {
                return c1 - c2;
            });
            var splitNodes = [ ];
            var startPos = 0;
            var textToSplit = textNode.nodeValue;
            var pointCnt = splitPoints.length;
            var parentNode = textNode.parentNode;
            var fragText, splitNode;
            for (var pointIndex = 0; pointIndex < pointCnt; pointIndex++) {
                var splitPos = splitPoints[pointIndex];
                fragText = textToSplit.substring(startPos, splitPos);
                splitNode = context.createTextNode(fragText);
                splitNodes.push(splitNode);
                parentNode.insertBefore(splitNode, textNode);
                startPos = splitPos;
            }
            fragText = textToSplit.substring(startPos, textToSplit.length);
            splitNode = context.createTextNode(fragText);
            splitNodes.push(splitNode);
            parentNode.insertBefore(splitNode, textNode);
            parentNode.removeChild(textNode);
            return splitNodes;
        },

        /**
         * <p>Creates a new DOM element with the specified attributes in a browser
         * independent way.</p>
         * <p>Note that you can use "class" or "className" for specifying the "class"
         * attribute and "style" to specify the "style" attribute.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {String} tagName The tag of the element to be created
         * @param {Object} attribs Attribute definition (key: attribute name; value:
         *        attribute value); null for a DOM element without attributes
         * @return {HTMLElement} The created DOM element
         */
        createNode: function(context, tagName, attribs) {
            // IE <= 7 is not able to create anchors the normal way, so we'll have to
            // create it in a single step; see bug #36231
            // http://msdn.microsoft.com/en-us/library/ms534184(v=VS.85).aspx
            var useInnerHTML = (com.ua.isIE6 || com.ua.isIE7)
                    && ((tagName.toLowerCase() == "a") && attribs.hasOwnProperty("name"));
            var node = (useInnerHTML ? null : context.createElement(tagName));
            var tagStr = null;
            if (useInnerHTML) {
                tagStr = "<" + tagName;
            }
            if (attribs) {
                for (var name in attribs) {
                    if (attribs.hasOwnProperty(name)) {
                        var value = attribs[name];
                        if (useInnerHTML) {
                            value = CUI.rte.Utils.htmlEncode(value);
                            tagStr += " " + name  + "=\"" + value + "\"";
                        } else {
                            name = (name == "className" ? "class" : name);
                            CUI.rte.Common.setAttribute(node, name, value);
                        }
                    }
                }
            }
            if (useInnerHTML) {
                tagStr += "></" + tagName + ">";
                node = context.createElement(tagStr);
            }
            return node;
        },

        /**
         * Inserts a new element with the specified tag name and attributes as a direct
         * parent node of the specified node. The specified node will be the only child
         * node of the newly created element.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node that will be the child of the newly created
         *        element
         * @param {String} tagName Tag name of the element to be created
         * @param {Object} attribs Attributes of the element to be created
         */
        insertAsParent: function(context, node, tagName, attribs) {
            var dpr = CUI.rte.DomProcessor;
            var nodeToInsert = dpr.createNode(context, tagName, attribs);
            var parentNode = node.parentNode;
            parentNode.insertBefore(nodeToInsert, node);
            parentNode.removeChild(node);
            nodeToInsert.appendChild(node);
            return nodeToInsert;
        },

        /**
         * Removes the specified node without removing its child nodes. The child nodes
         * will be inserted in the node's parent node at the position of the node to be
         * removed.
         * @param {HTMLElement} nodeToRemove The node to be removed
         */
        removeWithoutChildren: function(nodeToRemove) {
            var newParent = nodeToRemove.parentNode;
            while (nodeToRemove.childNodes.length > 0) {
                var nodeToMove = nodeToRemove.childNodes[0];
                nodeToRemove.removeChild(nodeToMove);
                newParent.insertBefore(nodeToMove, nodeToRemove);
            }
            newParent.removeChild(nodeToRemove);
        },

        /**
         * Moves the nodes, specified by the "nodes" list, to a newly created node, which
         * is created before the first node of the "nodes" list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} baseNode The parent of the nodes to be moved
         * @param {HTMLElement[]} nodes List of nodes to be moved (must be child nodes of
         *        baseNode)
         * @param {String} tagName Tag name of the node to be created
         * @param {Object} attribs Attributes of the node to be created
         */
        restructureAsChild: function(context, baseNode, nodes, tagName, attribs) {
            var dpr = CUI.rte.DomProcessor;
            var nodeToInsert = dpr.createNode(context, tagName, attribs);
            baseNode.insertBefore(nodeToInsert, nodes[0]);
            var nodeCnt = nodes.length;
            for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
                var nodeToRestructure = nodes[nodeIndex];
                baseNode.removeChild(nodeToRestructure);
                nodeToInsert.appendChild(nodeToRestructure);
            }
            return nodeToInsert;
        },

        /**
         * Determines if the given DOM node may represent a placeholder object.
         * @deprecated
         * @param {HTMLElement} node Node to check
         * @return {Boolean} True if the given DOM node may represent a placeholder object
         */
        isPlaceholderObject: function(node) {
            if (com.ua.isIE) {
                return ((node.nodeType == 3)
                        && (node.nodeValue == CUI.rte.DomProcessor.NBSP));
            } else {
                var isPlaceholder = com.isTag(node, "br");
                if (!isPlaceholder && com.isTag(node.parentNode, [ "td", "th" ])) {
                    isPlaceholder = ((node.nodeType == 3)
                            && (node.nodeValue == CUI.rte.DomProcessor.NBSP));
                }
                return isPlaceholder;
            }
        },

        /**
         * @deprecated
         */
        getEmptyLinePlaceholder: function(node) {
            if (node.nodeType != 1) {
                return null;
            }
            if (node.childNodes.length != 1) {
                return null;
            }
            var child = node.childNodes[0];
            if (CUI.rte.DomProcessor.isPlaceholderObject(child)) {
                return child;
            }
            return null;
        },

        /**
         * Checks if the given node represents an empty "line" (consisting of a placeholder
         * object only).
         * @deprecated
         * @param {HTMLElement} node Node to check
         */
        isEmptyLinePlaceholder: function(node) {
            return (CUI.rte.DomProcessor.getEmptyLinePlaceholder(node) != null);
        },

        /**
         * Creates a browser-specific empty line placeholder.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Boolean} createBlock True if a surrounding paragraph node has also to
         *        be created
         * @param {String} blockType (optional) The type of block to create; if none is
         *        specified, a "p" block is created by default
         * @return {HTMLElement} The placeholder element if one has been created (note that
         *         this might be null on IE when createBlock == false).
         */
        createEmptyLinePlaceholder: function(context, createBlock, blockType) {
            var placeholder;
            if (!com.ua.isIE) {
                placeholder = CUI.rte.DomProcessor.createGeckoPlaceholder(context);
            }
            if (createBlock) {
                var para = context.createElement(blockType || "p");
                if (placeholder) {
                    para.appendChild(placeholder);
                }
                placeholder = para;
            }
            return placeholder;
        },

        /**
         * Creates a Gecko-compatible placeholder br. Can also be used for Webkit browsers.
         * @param {CUI.rte.EditContext} context The edit context
         * @return {HTMLElement} The placeholder element
         */
        createGeckoPlaceholder: function(context) {
            var placeholder = context.createElement("br");
            if (com.ua.isGecko || com.ua.isWebKit) {
                com.setAttribute(placeholder, com.BR_TEMP_ATTRIB, "brEOB");
            }
            return placeholder;
        },

        /**
         * Ensures that a placeholder is available for an empty edit block.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} editBlockDom The edit block
         */
        ensureValidEmptyEditBlock: function(context, editBlockDom) {
            if (!com.isTag(editBlockDom, com.EDITBLOCK_TAGS)
                    || (editBlockDom.nodeType != 1)) {
                throw new Error("No valid edit block provided");
            }
            if (editBlockDom.childNodes.length == 0) {
                var dpr = CUI.rte.DomProcessor;
                if (!com.ua.isIE) {
                    editBlockDom.appendChild(dpr.createGeckoPlaceholder(context));
                }
                dpr.fixEmptyEditingBlockIE(context, editBlockDom);
            }
        },

        /**
         * @deprecated
         */
        ensureEmptyLinePlaceholders: function(context, node) {
            if (node.nodeType == 1) {
                var dpr = CUI.rte.DomProcessor;
                var sel = CUI.rte.Selection;
                if (dpr.getTagType(node) == dpr.CONTAINER) {
                    var textChild = com.getFirstTextChild(node, true);
                    if (textChild == null) {
                        var placeholderNode = dpr.getEmptyLinePlaceholder(node);
                        if (!placeholderNode) {
                            placeholderNode = dpr.createEmptyLinePlaceholder(context,
                                    false);
                            if (placeholderNode) {
                                var appendingNode = com.getFirstChild(node);
                                if (appendingNode == null) {
                                    appendingNode = node;
                                } else {
                                    // prevent appending the placeholder object to a named
                                    // anchor (or similar)
                                    while (sel.isNoInsertNode(appendingNode)) {
                                        appendingNode = appendingNode.parentNode;
                                        if (appendingNode == node) {
                                            break;
                                        }
                                    }
                                }
                                appendingNode.appendChild(placeholderNode);
                            }
                        }
                    } else {
                        // here we'll have to check if the structure is correct, as on Gecko
                        // we might get something like <p><b></b><br></p> which would
                        // prevent us from keeping formatting (see bug #22395)
                        if (dpr.isPlaceholderObject(textChild)) {
                            var firstChild = com.getFirstChild(node);
                            // prevent moving the placeholder object into a named anchor
                            // (or similar)
                            if (!sel.isNoInsertNode(firstChild)) {
                                if (firstChild != textChild) {
                                    textChild.parentNode.removeChild(textChild);
                                    firstChild.appendChild(textChild);
                                }
                            }
                        }
                    }
                }
            }
        },

        /**
         * Checks if the specified block node represents an empty line.
         * @param {HTMLElement} blockNode The block node to check
         * @return {Boolean} True if the specified block node represents an empty line
         */
        isEmptyLineBlock: function(blockNode) {
            var dpr = CUI.rte.DomProcessor;
            var isEmpty = dpr.isEmptyLinePlaceholder(blockNode);
            if (!isEmpty) {
                // handle completely empty blocks + Blocks containing a single &nbsp; node
                var characterNodes = com.getCharacterNodes(blockNode);
                if (characterNodes.length == 0) {
                    isEmpty = true;
                } else if (characterNodes.length == 1) {
                    var text = com.getNodeText(characterNodes[0]);
                    isEmpty = (text == dpr.NBSP);
                }
            }
            return isEmpty;
        },

        /**
         * <p>On Internet Explorer, this method should be called on each newly created,
         * empty edit block to ensure that it is actually editable.</p>
         * <p>Implicitly (= by RTE) inserted empty blocks are usually not editable due to
         * some internal IE issues, so there has to be some "selection magic" executed
         * to ensure the user can actually see and edit them.</p>
         * <p>Note that you may call the method on a deliberate node and even on Gecko
         * browsers, as it will automatically determine if the fix has to be applied or
         * not.</p>
         * <p>Note also that the node must have already been added to the DOM-tree of the
         * editor's document before this method is called. Otherwise IE will throw an
         * exception.</p>
         * <p>Also note that this method changes the behaviour of the outerHTML and
         * innerHTML properties: Before calling this method, an empty block is reported
         * - outerHTML for example has a value of &lt;p&gt;&lt;/p&gt;. Afterwards, an
         * additional &amp;nbsp; is visible - the outerHTML changes to
         * &lt;p&gt;&amp;nbsp;&lt;/p&gt;. The additional &amp;nbsp; is not actually present
         * in the DOM, cannot be iterated or removed.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} editBlock The editing block
         */
        fixEmptyEditingBlockIE: function(context, editBlock) {
            // Workaround to ensure that IE actually displays an empty block. It is not
            // really comprehensible when empty paragraphs are automatically displayed, and
            // when they have to be "made displayable" manually
            if (com.ua.isIE && com.isEmptyEditingBlock(editBlock, true)) {
                if (com.isTag(editBlock, com.TABLE_CELLS)) {
                    // not required and throwing an exception on table cells
                    return;
                }
                var dpr = CUI.rte.DomProcessor;
                // we'll have to provide another node before the span that is used for
                // "persisting" the block, as IE would remove the paragraph otherwise
                // if there is a "a name" at the end of the previous block
                var secNode = context.createTextNode(dpr.NBSP);
                editBlock.appendChild(secNode);
                var helperNode = context.createElement("span");
                editBlock.appendChild(helperNode);
                helperNode.appendChild(context.createTextNode(dpr.NBSP));
                // focus request required for IE >= 8 compatibility
                context.win.focus();
                // empty selection before creating the range - otherwise IE 9 might choke
                // on some edge cases
                context.doc.selection.empty();
                // select the temporary span ...
                var range = context.doc.selection.createRange();
                range.moveToElementText(helperNode);
                // ... and replace it by an empty String - this seems to finally make the
                // paragraph displayable
                range.pasteHTML("");
                editBlock.removeChild(secNode);
            }
        },

        /**
         * This fixes empty lines at the end of a block similar to the way
         * {@link #fixEmptyEditingBlockIE} does for empty blocks.
         * @param {CUI.rte.EditContext} context The editing context
         * @param {HTMLElement} brDom The linefeed (&lt;br&gt;) to be fixed
         */
        fixEmptyLinefeedIE: function(context, brDom) {
            if (com.ua.isIE) {
                var dpr = CUI.rte.DomProcessor;
                var helperNode = context.createElement("span");
                var insertRef = brDom.nextSibling;
                insertRef ? brDom.parentNode.insertBefore(helperNode, insertRef)
                        : brDom.parentNode.appendChild(helperNode);
                helperNode.appendChild(context.createTextNode(dpr.NBSP));
                context.win.focus();
                var range = context.doc.selection.createRange();
                range.moveToElementText(helperNode);
                range.pasteHTML("");
            }
        },

        /**
         * Ensure the minimum content that is required for the browser to work properly.
         * @private
         */
        ensureMinimumContent: function(context) {
            var dpr = CUI.rte.DomProcessor;
            var com = CUI.rte.Common;
            var sel = CUI.rte.Selection;
            var pNode = null;
            if (context.root.childNodes.length == 1) {
                var nodeToCheck = context.root.childNodes[0];
                if (com.isTag(nodeToCheck, "br")) {
                    context.root.removeChild(nodeToCheck);
                }
                if (com.isTag(nodeToCheck, "p")) {
                    dpr.ensureEmptyLinePlaceholders(context, nodeToCheck);
                }
            }
            var bookmark = dpr.ensureBlockContent(context, "p", null, false, true);
            if (bookmark) {
                sel.selectBookmark(context, bookmark);
            }
            if (context.root.childNodes.length == 0) {
                pNode = context.createElement("p");
                context.root.appendChild(pNode);
                dpr.ensureEmptyLinePlaceholders(context, pNode);
                sel.selectNode(context, pNode, true);
            }
            return pNode;
        },

        /**
         * Checks if the specified selection represents an empty line and returns the
         * block node for the empty line if there is one.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection Processing selection to check (as createad by
         *        {@link CUI.rte.Selection#createProcessingSelection})
         * @return {HTMLElement} The edit block node if there is an empty line; null if the
         *         selection doesn't specify an empty line
         */
        getEmptyLine: function(context, selection) {
            var dpr = CUI.rte.DomProcessor;
            var blockNode = dpr.getEditBlock(context, selection.startNode);
            if (!blockNode) {
                return null;
            }
            // check if the block nodes of start and end node are the same
            if (selection.endNode) {
                var blockEndNode = dpr.getEditBlock(context, selection.endNode);
                if (blockNode != blockEndNode) {
                    return null;
                }
            }
            return (dpr.isEmptyLineBlock(blockNode) ? blockNode : null);
        },

        /**
         * Checks if the specified selection represents an empty line.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection Processing selection to check (as createad by
         *        {@link CUI.rte.Selection#createProcessingSelection})
         * @return {Boolean} True if the selection represents an empty line
         */
        isEmptyLine: function(context, selection) {
            return (CUI.rte.DomProcessor.getEmptyLine(context, selection) != null);
        },

        /**
         * <p>Determines if the specified node determines an empty line.</p>
         * <p>This is the case for "br" nodes that have either another "br" node as
         * "previous character sibling" or no direct "previous character sibling". The
         * latter condition is valid for IE only.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The DOM element to check
         * @return {Boolean} True if the specified node determines an empty linefeed node
         */
        isEmptyLineDeterminator: function(context, node) {
            if (!com.isTag(node, "br")) {
                return false;
            }
            var prev = com.getPreviousCharacterNode(context, node, com.EDITBLOCK_TAGS);
            return (((prev == null) && com.ua.isIE) || com.isTag(prev, "br"));
        },

        /**
         * <p>Adjusts the table structure of the document represented by the specified
         * edit context.</p>
         * <p>Tables that are nested in paragraphs are moved out of this paragraph. Header
         * cells are moved from the "thead" section to the "tbody" section.</p>
         * @param {CUI.rte.EditContext} context The edit context
         */
        adjustTables: function(context) {
            var root = context.root;
            var blockNodes = root.childNodes;
            var i;
            for (i = 0; i < blockNodes.length; i++) {
                var nodeToCheck = blockNodes[i];
                if (com.isTag(nodeToCheck, "p")) {
                    if (nodeToCheck.childNodes.length == 1) {
                        var childNode = nodeToCheck.childNodes[0];
                        if (com.isTag(childNode, "table")) {
                            root.insertBefore(childNode, nodeToCheck);
                            root.removeChild(nodeToCheck);
                            nodeToCheck = childNode;
                        }
                    }
                }
                if (com.isTag(nodeToCheck, "table")) {
                    var header = com.getChildNodesByType(nodeToCheck, "thead");
                    if (header.length == 1) {
                        header = header[0];
                        var tBody = com.getChildNodesByType(nodeToCheck, "tbody");
                        if (tBody.length == 0) {
                            tBody.push(context.createElement("tbody"));
                        }
                        tBody = tBody[0];
                        var insertNode = null;
                        if (tBody.childNodes.length > 0) {
                            insertNode = tBody.childNodes[0];
                        }
                        for (i = header.childNodes.length - 1; i >= 0; i--) {
                            var rowToMove = header.childNodes[i];
                            header.removeChild(rowToMove);
                            tBody.insertBefore(rowToMove, insertNode);
                        }
                        nodeToCheck.removeChild(header);
                    }
                }
            }
        },

        /**
         * Removes all non-table blocks to ensure that only tables are left for editing.
         * @param {CUI.rte.EditContext} context The edit context
         */
        removeNonTableBlocks: function(context) {
            var root = context.root;
            var blocks = root.childNodes;
            for (var i = blocks.length - 1; i >= 0; i--) {
                if (!com.isTag(blocks[i], "table")) {
                    root.removeChild(blocks[i]);
                }
            }
        },

        /**
         * @private
         */
        hasSimilarParent: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            if (!dom || (dom.nodeType != 1)) {
                return false;
            }
            var checkDom = com.getParentNode(context, dom);
            while (checkDom) {
                if (dpr.getTagType(checkDom) == dpr.CONTAINER) {
                    return false;
                }
                if (checkDom.nodeType == 1) {
                    if (com.equals(dom, checkDom)) {
                        return true;
                    }
                }
                checkDom = com.getParentNode(context, checkDom);
            }
            return false;
        },

        /**
         * Removes duplicate DOM nodes. For example, the inner "b" node in &lt;b&gt;A bold
         * &lt;b&gt;text&lt;/b&gt;.&lt;/b&gt; gets removed, as it is unnecessary.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} startNode first node to check (inclusive)
         * @param {HTMLElement} endNode last node to check (inclusive)
         * @return {Object} Object that contains the valid start/end node after duplicates
         *         have been removed (properties: startNode, endNode)
         */
        removeDuplicateStructures: function(context, startNode, endNode) {
            var dpr = CUI.rte.DomProcessor;
            var node = startNode;
            while (node) {
                var isProcessed = false;
                if (node.nodeType == 1) {
                    if ((dpr.getTagType(node) != dpr.CONTAINER)
                            && dpr.hasSimilarParent(context, node)) {
                        var nextNode = com.getNextNode(context, node);
                        if (node == startNode) {
                            startNode = nextNode;
                        }
                        if (node == endNode) {
                            endNode = nextNode;
                        }
                        dpr.removeWithoutChildren(node);
                        node = nextNode;
                        isProcessed = true;
                    }
                }
                if (!isProcessed) {
                    if (node == endNode) {
                        break;
                    }
                    node = com.getNextNode(context, node);
                }
            }
            return {
                "startNode": startNode,
                "endNode": endNode
            };
        },

        /**
         * <p>Joins the specified DOM text node with the preceding or succeeding text node
         * structurally if possible.</p>
         * <p>For example: &lt;b&gt;ABC &lt;/b&gt;&lt;b&gt;DEF&lt;/b&gt; can be joined to
         * &lt;b&gt;ABC DEF&lt;/b&gt;</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom node to check; if this is no text node, the first
         *        descendant text node will be used instead
         * @param {Boolean} joinPreceding True if the specified DOM node should be joined
         *        with the preceding text node; False if the succeeding node should be used
         *        for joining
         */
        joinIdenticalStructures: function(context, dom, joinPreceding) {
            var dpr = CUI.rte.DomProcessor;
            if (dom.nodeType == 1) {
                dom = com.getFirstTextChild(dom) || dom;
            }
            var joinDom = (joinPreceding ? com.getPreviousCharacterNode(context, dom)
                    : com.getNextCharacterNode(context, dom));
            if (!dom || !joinDom) {
                return;
            }
            var domCheck = com.getParentNode(context, dom);
            var joinCheck = com.getParentNode(context, joinDom);
            var canJoin = true;
            var hasCommonAncestors = false;
            while (dpr.getTagType(domCheck) == dpr.STRUCTURE) {
                if (!com.equals(domCheck, joinCheck)) {
                    canJoin = false;
                    break;
                }
                hasCommonAncestors = true;
                domCheck = com.getParentNode(context, domCheck);
                joinCheck = com.getParentNode(context, joinCheck);
                if ((domCheck == null) || (joinCheck == null)) {
                    canJoin = (domCheck == joinCheck);
                    break;
                }
            }
            if (canJoin) {
                // must share the same container
                canJoin = (domCheck == joinCheck);
            }
            if (canJoin && hasCommonAncestors) {
                var destParent = dom.parentNode;
                var srcParent = joinDom.parentNode;
                // joining up the hierarchy
                while (destParent != srcParent) {
                    var newSrcParent = srcParent.parentNode;
                    if (joinPreceding) {
                        com.moveChildren(srcParent, destParent, 0, false);
                    } else {
                        com.moveChildren(srcParent, destParent, 0, true);
                    }
                    // clean up after every iteration
                    com.removeNodesWithoutContent(context, srcParent);
                    srcParent = newSrcParent;
                    destParent = destParent.parentNode;
                    if (dpr.getTagType(destParent) == dpr.CONTAINER) {
                        break;
                    }
                }
            }
        },

        splitToParent: function(splitParent, node, offset) {
            var sel = CUI.rte.Selection;
            var isNoInsertNode = sel.isNoInsertNode(node) && (offset == null);
            var clonedNode, parentNode, nodeToMove;
            var nodesToMove = [ ];
            var isOriginalNode = true;
            var childIndex;
            while (true) {
                if (!node) {
                    return null;
                }
                if (isNoInsertNode) {
                    // must mark all nodes "behind" the current node for moving, as the
                    // normal mechanism does not work for non-insertable nodes
                    childIndex = com.getChildIndex(node);
                    offset = childIndex;
                    var children = node.parentNode.childNodes;
                    for (; childIndex < children.length; childIndex++) {
                        nodeToMove = children[childIndex];
                        nodesToMove.push(nodeToMove);
                    }
                    node = node.parentNode;
                    isNoInsertNode = false;
                }
                parentNode = node.parentNode;
                if (node.nodeType == 3) {
                    if (offset == 0) {
                        // will be removed one hierarchy level up on moving
                        nodesToMove.push(node);
                    } else if (offset < com.getNodeCharacterCnt(node)) {
                        var nodeText = node.nodeValue;
                        node.nodeValue = nodeText.substring(0, offset);
                        clonedNode = node.cloneNode(false);
                        clonedNode.nodeValue = nodeText.substring(offset, nodeText.length);
                        nodesToMove.push(clonedNode);
                    }
                } else {
                    // edge case: splitting from a parent node offset
                    if (isOriginalNode) {
                        for (childIndex = offset; childIndex < node.childNodes.length;
                                childIndex++) {
                            nodesToMove.push(node.childNodes[childIndex]);
                        }
                    }
                    clonedNode = node.cloneNode(false);
                    var copyCnt = nodesToMove.length;
                    for (var moveIndex = 0; moveIndex < copyCnt; moveIndex++) {
                        nodeToMove = nodesToMove[moveIndex];
                        if (nodeToMove.parentNode) {
                            nodeToMove.parentNode.removeChild(nodeToMove);
                        }
                        clonedNode.appendChild(nodesToMove[moveIndex]);
                    }
                    nodesToMove.length = 0;
                    nodesToMove.push(clonedNode);
                }
                if (node != splitParent) {
                    childIndex = com.getChildIndex(node) + 1;
                    while (childIndex < parentNode.childNodes.length) {
                        nodeToMove = parentNode.childNodes[childIndex];
                        parentNode.removeChild(nodeToMove);
                        nodesToMove.push(nodeToMove);
                    }
                } else {
                    if (node.nextSibling) {
                        parentNode.insertBefore(clonedNode, node.nextSibling);
                    } else {
                        parentNode.appendChild(clonedNode);
                    }
                    return clonedNode;
                }
                node = parentNode;
                isOriginalNode = false;
            }
        },

        removeUnwantedEmptyTags: function(node, tagList) {
            if (com.matchesTagDefs(node, tagList)) {
                if (!com.hasTextChild(node, true)) {
                    node.parentNode.removeChild(node);
                    return;
                }
            }
            if (node.nodeType == 1) {
                var childCnt = node.childNodes.length;
                for (var c = childCnt - 1; c >= 0; c--) {
                    CUI.rte.DomProcessor.removeUnwantedEmptyTags(node.childNodes[c],
                            tagList);
                }
            }
        },

        /**
         * <p>Inserts a new paragraph at the specified text position.</p>
         * <p>Note that the node returned is the new paragraph in an
         * implementation-specific, technical way. It is always the latter of both affected
         * paragraphs contentwise. This may not always be what you'd expect: If inserting a
         * paragraph at the beginning of an existing paragraph, the existing paragraph seems
         * to be returned as "new paragraph". This is practically not the case, because the
         * method creates a new paragraph (which is actually returned), inserts it behind
         * the existing one and then (in the given case) moves all child nodes to the newly
         * created paragraph, seemingly returning the existing paragraph.</p>
         * <p>Interpretation of <code>offset</code>:</p>
         * <ul>
         *     <li>if node is a text node, it determines the character offset where the
         *     paragraph has to be inserted.</li>
         *     <li>if node is a structural node, it determines the index of child nodes
         *     where the paragraph has to be inserted before.</li>
         *     <li>if node is a "one character structural node" (&lt;bt&gt;, &lt;img&gt;),
         *     a value of 0 determines that the paragraph has to be inserted after the
         *     one character node.</li>
         *     <li>A value of null determines that the paragraph has to be inserted at
         *     the end of the child list of a structural node.</li>
         * </ul>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node Node that determines the insert position
         * @param {Number} offset (optional) Offset which determines the insert position
         * @return {HTMLElement} The newly created paragraph
         */
        insertParagraph: function(context, node, offset) {
            var dpr = CUI.rte.DomProcessor;
            var newPara;
            // inserting "behind" a one-character node must be handled differently:
            // use the next text node in the block if available or offset to parent DOM
            // instead
            if (com.isOneCharacterNode(node) && (offset == 0)) {
                var nextTextNode = com.getNextCharacterNode(context, node,
                        com.EDITBLOCK_TAGS);
                if (nextTextNode) {
                    node = nextTextNode;
                    offset = (node.nodeType == 3 ? 0 : null);
                } else {
                    offset = com.getChildIndex(node) + 1;
                    node = com.getParentNode(context, node);
                }
            }
            // handle EOT & EOL with objects
            if ((node.nodeType == 1) && !com.isOneCharacterNode(node)
                    && ((offset == null) || (offset == node.childNodes.length))) {
                if (offset == null) {
                    offset = node.childNodes.length;
                }
                if (com.isRootNode(context, node)) {
                    newPara = node.childNodes[offset - 1].cloneNode(false);
                    node.appendChild(newPara);
                    node = node.childNodes[offset - 1];
                } else {
                    newPara = node.cloneNode(false);
                    node.parentNode.insertBefore(newPara, node.nextSibling);
                }
                var clonedRoot = null;
                var copyNode = com.getLastTextChild(node);
                copyNode = copyNode ? copyNode : com.getLastChild(node);
                copyNode = copyNode ? copyNode : node;
                while (copyNode != node) {
                    if ((copyNode.nodeType == 1) && !dpr.isNoInsertNode(copyNode)) {
                        var clonedNode = copyNode.cloneNode(false);
                        if (clonedRoot != null) {
                            clonedNode.appendChild(clonedRoot);
                        }
                        clonedRoot = clonedNode;
                    }
                    copyNode = com.getParentNode(context, copyNode);
                }
                if (clonedRoot != null) {
                    newPara.appendChild(clonedRoot);
                }
                dpr.ensureEmptyLinePlaceholders(context, newPara);
                dpr.fixEmptyEditingBlockIE(context, newPara);
            } else {
                var scopedBlock = dpr.getScopedBlockNode(context, node);
                if (!scopedBlock) {
                    throw new Error("Inserting paragraph outside an existing format scope");
                }
                var containerNode = scopedBlock.dom;
                if (scopedBlock.isAuxiliaryRoot) {
                    // if a block is created explicitly inside an aux root (for example a
                    // table cell), move the existing content into a splitable paragraph
                    // first
                    var newParagraph = context.createElement("p");
                    com.moveChildren(containerNode, newParagraph);
                    containerNode.appendChild(newParagraph);
                    containerNode = newParagraph;
                }
                newPara = dpr.splitToParent(containerNode, node, offset);
                dpr.removeUnwantedEmptyTags(containerNode, dpr.EMPTYTEXT_EXCLUSIONS);
                var toCheck = com.getLastTextChild(containerNode, true, false);
                if (com.isTag(toCheck, "br")) {
                    toCheck.parentNode.removeChild(toCheck);
                }
                dpr.removeUnwantedEmptyTags(newPara, dpr.EMPTYTEXT_EXCLUSIONS);
                dpr.ensureEmptyLinePlaceholders(context, newPara);
                dpr.ensureEmptyLinePlaceholders(context, containerNode);
                dpr.fixEmptyEditingBlockIE(context, newPara);
                dpr.fixEmptyEditingBlockIE(context, containerNode);
            }
            return newPara;
        },

        /**
         * <p>Checks if the specified node is at the beginning of a block.</p>
         * <p>Note that in &lt;p&gt;&lt;b&gt;Test&lt;/b&gt;text&lt;/p&gt; both the
         * "b" tag and the first character of "Test" are recognized as residing at the
         * beginning of the "p" block.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The HTML element to check
         * @param {Number} offset The character offest (if dom is a text node) or the
         *        offset in dom's childNodes array
         */
        isBlockStart: function(context, dom, offset) {
            var dpr = CUI.rte.DomProcessor;
            var scopedBlock = dpr.getScopedBlockNode(context, dom);
            if (!scopedBlock) {
                return false;
            }
            scopedBlock = scopedBlock.dom;
            if (dom.nodeType == 3) {
                if (offset > 0) {
                    return false;
                }
                return (com.getFirstTextChild(scopedBlock, true) == dom);
            }
            if (offset != null) {
                if (offset > 0) {
                    return false;
                }
            }
            var walker = scopedBlock;
            while ((walker.nodeType == 1) && (walker.childNodes.length > 0)) {
                if (walker.childNodes[0] == dom) {
                    return true;
                }
                walker = walker.childNodes[0];
            }
            return false;
        },

        /**
         * <p>Checks if the specified node is at the end of a block.</p>
         * <p>Note that in &lt;p&gt;Test &lt;b&gt;text&lt;/b&gt;&lt;/p&gt; both the
         * "b" tag and the last character of "text" are recognized as residing at the
         * end of the "p" block.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The HTML element to check
         * @param {Number} offset The character offest (if dom is a text node) or the
         *        offset in dom's childNodes array
         */
        isBlockEnd: function(context, dom, offset) {
            var dpr = CUI.rte.DomProcessor;
            var scopedBlock = dpr.getScopedBlockNode(context, dom);
            if (!scopedBlock) {
                return false;
            }
            scopedBlock = scopedBlock.dom;
            if (dom.nodeType == 3) {
                if (offset < dom.nodeValue.length) {
                    return false;
                }
                return (com.getLastTextChild(scopedBlock, true) == dom);
            }
            if (offset != null) {
                if (offset < dom.childNodes.length - 1) {
                    return false;
                }
            }
            var walker = scopedBlock;
            while ((walker.nodeType == 1) && (walker.childNodes.length > 0)) {
                if (walker.childNodes[walker.childNodes.length - 1] == dom) {
                    return true;
                }
                walker = walker.childNodes[walker.childNodes.length - 1];
            }
            return false;
        },

        /**
         * <p>Get the container node (such as p, ul, etc.) for the specified DOM
         * element.</p>
         * <p>Note that only container nodes that are directly under the body node are
         * taken into account. "Auxiliary root nodes" (such as td, th) will not be included.
         * </p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom DOM element to determine container node for
         * @return {HTMLElement} container DOM node; null if no container node is present
         */
        getContainerNode: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            while (dom) {
                if (dom.nodeType == 1) {
                    if (!com.isTag(dom, dpr.AUXILIARY_ROOT_TAGS)) {
                        if (dpr.getTagType(dom) == dpr.CONTAINER) {
                            return dom;
                        }
                    }
                }
                dom = com.getParentNode(context, dom);
            }
            return null;
        },

        /**
         * Gets the edit block for the specified node.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element to get the edit block for
         */
        getEditBlock: function(context, dom) {
            return com.getTagInPath(context, dom, com.EDITBLOCK_TAGS);
        },

        /**
         * Gets all editable blocks under the specified auxiliary root.
         * @param {HTMLElement} auxRoot The auxiliary root (or the document's body element)
         * @param {HTMLElement[]} editBlocks (optional) The array containing all edit blocks
         *        found
         * @return {HTMLElement[]}  The array containing all edit blocks found
         */
        getEditBlocks: function(auxRoot, editBlocks) {
            var dpr = CUI.rte.DomProcessor;
            if (editBlocks === undefined) {
                editBlocks = [ ];
            }
            var childCnt = auxRoot.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var child = auxRoot.childNodes[c];
                if (!com.isTag(child, dpr.AUXILIARY_ROOT_TAGS)) {
                    if (com.isTag(child, com.EDITBLOCK_TAGS)) {
                        editBlocks.push(child)
                    }
                    dpr.getEditBlocks(child, editBlocks);
                }
            }
            return editBlocks;
        },

        /**
         * Checks if there are any editable blocks under the specified auxiliary root.
         * @param {HTMLElement} auxRoot The auxiliary root (or the document's body element)
         * @return {Boolean} True if there are editable blocks available
         */
        hasEditBlocks: function(auxRoot) {
            var dpr = CUI.rte.DomProcessor;
            var childCnt = auxRoot.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var child = auxRoot.childNodes[c];
                if (!com.isTag(child, dpr.AUXILIARY_ROOT_TAGS)) {
                    if (com.isTag(child, com.EDITBLOCK_TAGS)
                            || dpr.hasEditBlocks(child)) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * <p>Gets the "auxiliary root" for the specified node.</p>
         * <p>This is either one of the elements that is specified as an aux root (table
         * cells, etc.) or the document's body node.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element to determine the aux root for; if the
         *        specified element is an auxiliary root by itself, dom (and not dom's super
         *        auxiliary root) is returned
         * @return {HTMLElement} The auxiliary root (or the document's body node)
         */
        getAuxRootNode: function(context, dom) {
            while (dom) {
                if (com.isRootNode(context, dom)) {
                    return dom;
                }
                if (com.isTag(dom, CUI.rte.DomProcessor.AUXILIARY_ROOT_TAGS)) {
                    return dom;
                }
                dom = com.getParentNode(context, dom);
            }
            return context.root;
        },

        /**
         * <p>Get the container node (such as p, ul, etc.) for the specified DOM
         * element, considering it being the last container node in the document
         * (required for handling "end of text" situations.</p>
         * <p>Note that only container nodes that are directly under the body node are
         * taken into account. "Auxiliary root nodes" (such as td, th) will not be included.
         * </p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom DOM element to determine container node for
         * @return {HTMLElement} container DOM node; null if no container node is present
         */
        getLastContainerNode: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            var node = com.getLastChild(dom);
            while (node && (node != dom)) {
                if (node.nodeType == 1) {
                    if (dpr.getTagType(node) == dpr.CONTAINER) {
                        if (!com.isTag(node, dpr.AUXILIARY_ROOT_TAGS)) {
                            return node;
                        }
                    }
                }
                node = com.getPreviousNode(context, node);
            }
            return null;
        },

        /**
         * @private
         */
        getSiblingContainerNode: function(context, dom, delimiterDom, fn) {
            var dpr = CUI.rte.DomProcessor;
            while (dom) {
                if (dom == delimiterDom) {
                    return null;
                }
                if (dom.nodeType == 1) {
                    if (dpr.getTagType(dom) == dpr.CONTAINER) {
                        if (!com.isTag(dom, dpr.AUXILIARY_ROOT_TAGS)) {
                            return dom;
                        }
                    }
                }
                dom = fn(context, dom);
            }
            return null;
        },

        getFormatTagInPath: function(context, dom, formatDefs) {
            while (dom) {
                if (dom.nodeType == 1) {
                    if (com.isRootNode(context, dom)) {
                        return null;
                    }
                    var tagToCheck = dom.tagName.toLowerCase();
                    for (var formatId in formatDefs) {
                        if (formatDefs.hasOwnProperty(formatId)) {
                            var formatDef = formatDefs[formatId];
                            if (formatDef.tag && (formatDef.tag == tagToCheck)) {
                                return dom;
                            }
                        }
                    }
                }
                dom = dom.parentNode;
            }
            return null;
        },

        /**
         * <p>Creates a list of all "first level" container nodes (such as p, h1, etc.),
         * covered by the specified selection.</p>
         * <p>Note that only container nodes that are directly under the body node are
         * taken into account. "Auxiliary root nodes" (such as td, th) will not be included.
         * Also note that this method only includes "container" nodes (nodes that are
         * explicitly marked as such through {@link CUI.rte.DomProcessor.TYPE_TABLE}),
         * not block nodes.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection Selection to create container list from (as created by
         *        CUI.rte.Selection.createProcessingSelection()
         */
        createContainerList: function(context, selection) {
            var sel = CUI.rte.Selection;
            var dpr = CUI.rte.DomProcessor;
            selection = sel.adaptToInclusiveEndNode(context, selection);
            var startNode = selection.startNode;
            var endNode = selection.endNode;
            var node;
            if (!selection.isEOT) {
                node = dpr.getContainerNode(context, startNode);
            } else {
                node = dpr.getLastContainerNode(context, startNode);
            }
            if (!node && endNode && (endNode != startNode)) {
                // corner case: selection might start under an auxiliary root - then take
                // next container (only if there is a end node and the end node is different
                // from the start node)
                node = dpr.getSiblingContainerNode(context, startNode, endNode,
                        com.getNextNode);
            }
            if (!node) {
                return [ ];
            }
            if (!endNode) {
                return [ node ];
            }
            endNode = dpr.getContainerNode(context, endNode);
            if (!endNode) {
                endNode = dpr.getLastContainerNode(context, selection.endNode);
            }
            if (!endNode) {
                // corner case: selection might end under an auxiliary root - then take
                // previous container
                endNode = dpr.getSiblingContainerNode(context, selection.endNode, startNode,
                        com.getPreviousNode);
            }
            if (!endNode) {
                return [ node ];
            }
            var containerNodes = [ ];
            while (node) {
                if (node.nodeType == 1) {
                    // as auxiliary roots are usually also container tags, exclude them
                    // as we only cover first level container nodes
                    if (!com.isTag(node, dpr.AUXILIARY_ROOT_TAGS)) {
                        if (dpr.getTagType(node) == dpr.CONTAINER) {
                            containerNodes.push(node);
                        }
                    }
                }
                if (node == endNode) {
                    break;
                }
                node = com.getNextNode(context, node);
            }
            return containerNodes;
        },

        /**
         * <p>Creates a list of all block nodes (such as p, h1, etc.), covered by the
         * specified selection.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection Selection to create block list from (as created by
         *        CUI.rte.Selection.createProcessingSelection()
         * @deprecated
         */
        createBlockList: function(context, selection) {
            var sel = CUI.rte.Selection;
            selection = sel.adaptToInclusiveEndNode(context, selection);
            var startNode = selection.startNode;
            var endNode = selection.endNode;
            var node;
            if (!selection.isEOT) {
                node = com.getBlockNode(context, startNode);
            } else {
                node = com.getLastBlockNode(context, startNode);
            }
            if (!node) {
                return [ ];
            }
            if (!endNode) {
                return [ node ];
            }
            endNode = com.getBlockNode(context, endNode);
            if (!endNode) {
                return [ node ];
            }
            var blockNodes = [ ];
            while (node) {
                if (node.nodeType == 1) {
                    if (com.isBlockNode(context, node)) {
                        blockNodes.push(node);
                    }
                }
                if (node == endNode) {
                    break;
                }
                node = com.getNextNode(context, node);
            }
            return blockNodes;
        },

        /**
         * <p>Checks if the given node has any child that is a container node.</p>
         * <p>Note that this method does not work recursively (by nature). Hence the
         * specified node must be a body node or an auxiliary root node.</p>
         * @private
         */
        hasContainerChildNodes: function(dom) {
            var dpr = CUI.rte.DomProcessor;
            var childCnt = dom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var child = dom.childNodes[c];
                if (child.nodeType == 1) {
                    if (dpr.getTagType(child) == dpr.CONTAINER) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
         * <p>Creates a list of auxiliary root nodes for the given selection.</p>
         * <p>Note that only auxiliary roots without any containing container nodes are
         * returned. For example: &lt;td&gt;text&lt;/td&gt; is reported as an auxiliary
         * root, whereas &lt;td&gt;&gt;p&lt;para 1&gt;/p&lt;&gt;p&lt;para 2&gt;/p&lt;
         * &lt;/td&gt; is not reported as an auxiliary root.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Object} selection Processing selection
         * @return {Array} List of auxiliary roots
         */
        getAuxRoots: function(context, selection) {
            var sel = CUI.rte.Selection;
            var dpr = CUI.rte.DomProcessor;
            var auxRoots = [ ];
            // handle cell selection separately
            if (selection.cellSelection) {
                var cells = selection.cellSelection.cells;
                if (cells && (cells.length > 0)) {
                    for (var c = 0; c < cells.length; c++) {
                        auxRoots.push(cells[c]);
                    }
                    return auxRoots;
                }
            }
            selection = sel.adaptToInclusiveEndNode(context, selection);
            var node = selection.startNode;
            var endNode = selection.endNode;
            while (node) {
                if (node.nodeType == 1) {
                    if (dpr.getTagType(node) == dpr.CONTAINER) {
                        if (com.isTag(node, dpr.AUXILIARY_ROOT_TAGS)) {
                            auxRoots.push(node);
                        }
                        break;
                    }
                }
                node = com.getParentNode(context, node);
            }
            // corner case: we're starting on a non-container
            if (!node) {
                node = com.getTagInPath(context, selection.startNode, com.BLOCK_TAGS);
                if (!node) {
                    return auxRoots;
                }
            }
            if (endNode && (endNode != node)) {
                node = com.getNextNode(context, node);
                while (node) {
                    if (node.nodeType == 1) {
                        if (com.isTag(node, dpr.AUXILIARY_ROOT_TAGS)) {
                            if (!dpr.hasContainerChildNodes(node)) {
                                auxRoots.push(node);
                            }
                        }
                    }
                    if (node == endNode) {
                        break;
                    }
                    node = com.getNextNode(context, node);
                }
            }
            return auxRoots;
        },

        changeContainerTag: function(context, containerList, blueprintDom,
                ensurePlaceholder) {
            var dpr = CUI.rte.DomProcessor;
            var elCnt = containerList.length;
            var isToPre = com.isTag(blueprintDom, "pre");
            for (var elIndex = 0; elIndex < elCnt; elIndex++) {
                var containerEl = containerList[elIndex];
                var isFromPre = com.isTag(containerEl, "pre");
                var clonedDom = blueprintDom.cloneNode(blueprintDom);
                var txt = containerEl.innerHTML;
                com.replaceNode(containerEl, clonedDom);
                if (isFromPre != isToPre) {
                    if (isFromPre) {
                        // $todo handle multispaces
                        txt = txt.replace(/\n\r/g, "\n");
                        txt = txt.replace(/\r\n/g, "\n");
                        txt = txt.replace(/\r/g, "\n");
                        txt = txt.replace(/\n/g, "<br>");
                        clonedDom.innerHTML = txt;
                    }
                }
                if (ensurePlaceholder) {
                    dpr.ensureEmptyLinePlaceholders(context, clonedDom);
                }
                dpr.fixEmptyEditingBlockIE(context, clonedDom);
            }
        },

        getStyles: function(context, stylesDef, node) {
            var styles = stylesDef.styles;
            if (!styles) {
                styles = [ ];
                stylesDef.styles = styles;
            }
            while (!com.isRootNode(context, node)) {
                if (com.isTag(node, "span")) {
                    if (node.className) {
                        styles.push({
                            "dom": node,
                            "className": node.className
                        });
                    }
                }
                node = com.getParentNode(context, node);
            }
            stylesDef.isContinuousStyle = (styles.length == 1);
        },

        getScopedBlockNode: function(context, dom) {
            var dpr = CUI.rte.DomProcessor;
            while (dom) {
                if (com.isTag(dom, com.BLOCK_TAGS)) {
                    return {
                        "dom": dom,
                        "isAuxiliaryRoot": false
                    };
                }
                if (com.isTag(dom, dpr.AUXILIARY_ROOT_TAGS)) {
                    return {
                        "dom": dom,
                        "isAuxiliaryRoot": true
                    };
                }
                if (com.isRootNode(context, dom.parentNode)) {
                    return {
                        "dom": dom,
                        "isAuxiliaryRoot": false
                    };
                }
                dom = com.getParentNode(context, dom);
            }
            return null;
        },

        ensureBlockContent: function(context, tagName, attribs, brAsParDelimiter,
                                     createBookmark) {
            var com = CUI.rte.Common;
            var dpr = CUI.rte.DomProcessor;
            var sel = CUI.rte.Selection;
            var bookmark = null;
            var pNode = null;
            var root = context.root;
            var insertTag = null;
            var nodes = root.childNodes;
            for (var childIndex = nodes.length - 1; childIndex >= 0; childIndex--) {
                var nodeToProcess = nodes[childIndex];
                var isBr = com.isTag(nodeToProcess, "br");
                var isBlockNode = com.isTag(nodeToProcess, com.BLOCK_TAGS);
                if ((nodeToProcess.nodeType == 3) || (isBr && !brAsParDelimiter)
                        || (!isBr && !isBlockNode)) {
                    if ((bookmark == null) && createBookmark) {
                        bookmark = sel.createSelectionBookmark(context);
                    }
                    if (!pNode) {
                        pNode = dpr.createNode(context, tagName, attribs);
                        root.insertBefore(pNode, insertTag);
                        insertTag = pNode;
                    }
                    // Firefox 6 throws an exception if a node with _moz_editor_bogus_node
                    // attribute set to TRUE is removed from its parent (although it is
                    // physically present ...)
                    if (nodeToProcess.parentNode) {
                        root.removeChild(nodeToProcess);
                    }
                    pNode.insertBefore(nodeToProcess, pNode.firstChild);
                } else if (isBr) {
                    if ((bookmark == null) && createBookmark) {
                        bookmark = sel.createSelectionBookmark(context);
                    }
                    pNode = null;
                    root.removeChild(nodeToProcess);
                } else if (nodeToProcess.nodeType == 1) {
                    insertTag = nodeToProcess;
                    pNode = null;
                }
            }
            return bookmark;
        },

        /**
         * Inserts the specified plain text at the specified position.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node where the text will be inserted
         * @param {Number} offset Inserting offset; null (in conjunction with a structural
         *        node) means "insert at the first possible child position; for example
         *        if node is a "p" tag, the text gets inserted before the first character
         *        of that paragraph)
         * @param {String} text The text to insert
         */
        insertText: function(context, node, offset, text) {
            var root = context.root;
            var firstNode, nodeSave;
            if (node.nodeType == 1) {
                if (offset == null) {
                    nodeSave = node;
                    node = com.getFirstTextChild(node);
                    if (!node) {
                        var isBlockNode = false;
                        firstNode = com.getFirstChild(nodeSave);
                        if (!firstNode) {
                            if (!com.isOneCharacterNode(nodeSave)) {
                                // inserting in an empty structural node
                                firstNode = nodeSave;
                                isBlockNode = true;
                            } else {
                                // inserting before BR, IMG, A et al
                                firstNode = nodeSave;
                            }
                        }
                        else if (!com.isCharacterNode(firstNode)) {
                            isBlockNode = true;
                        }
                        node = context.createTextNode("");
                        if (isBlockNode) {
                            firstNode.appendChild(node);
                        } else {
                            firstNode.parentNode.insertBefore(node, firstNode);
                        }
                    }
                    offset = 0;
                } else {
                    var childCnt = node.childNodes.length;
                    if (childCnt > 0) {
                        if (offset >= childCnt) {
                            // EOL/EOT
                            node = com.getLastChild(node);
                            if (node.nodeType == 3) {
                                offset = com.getNodeCharacterCnt(node);
                            } else {
                                var pNode = node.parentNode;
                                node = context.createTextNode("");
                                pNode.appendChild(node);
                                offset = 0;
                            }
                        } else {
                            node = node.childNodes[offset];
                            if (node.nodeType == 1) {
                                node = com.getPreviousCharacterNode(context, node);
                                if (!node) {
                                    // BOT
                                    firstNode = com.getFirstChild(root);
                                    node = context.createTextNode("");
                                    firstNode.parentNode.insertBefore(node, firstNode);
                                } else if (node.nodeType == 1) {
                                    // if previous node is also a "one character node", we
                                    // will insert an empty text node behind
                                    var textNode = context.createTextNode("");
                                    node.parentNode.insertBefore(textNode,
                                            node.nextSibling);
                                    node = textNode;
                                }
                            }
                            offset = com.getNodeCharacterCnt(node);
                        }
                    } else {
                        node = com.getPreviousTextNode(context, node);
                        if (!node) {
                            // BOT
                            firstNode = com.getFirstChild(root);
                            node = context.createTextNode("");
                            firstNode.parentNode.insertBefore(node, firstNode);
                        }
                        offset = com.getNodeCharacterCnt(node);
                    }
                }
            }
            var currentText = node.nodeValue;
            if (currentText.length <= offset) {
                currentText += text;
            } else if (offset == 0) {
                currentText = text + currentText;
            } else {
                currentText = currentText.substring(0, offset) + text
                        + currentText.substring(offset, currentText.length);
            }
            node.nodeValue = currentText;
            return {
                "node": node,
                "offset": offset + text.length
            };
        },

        /**
         * Removes all elements that match the specified tag definitions from the DOM
         * recursively.
         * @param {HTMLElement} rootEl The root element to execute the removal on
         * @param {Object} tagDefsToRemove The definition of the tags to be removed. See
         *        {@link CUI.rte.Common#matchesTagDefs} for an explanation
         */
        removeTagsFromHierarchy: function(rootEl, tagDefsToRemove) {
            var dpr = CUI.rte.DomProcessor;
            var com = CUI.rte.Common;
            var childCnt = rootEl.childNodes.length;
            for (var childIndex = childCnt - 1; childIndex >= 0; childIndex--) {
                var childToProcess = rootEl.childNodes[childIndex];
                dpr.removeTagsFromHierarchy(childToProcess, tagDefsToRemove);
            }
            if (rootEl.nodeType == 1) {
                if (com.matchesTagDefs(rootEl, tagDefsToRemove)) {
                    dpr.removeWithoutChildren(rootEl);
                }
            }
        },

        saveChildNodes: function(dom) {
            var savedChildren = [ ];
            var children = dom.childNodes;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var savedChild = {
                    "dom": child
                };
                savedChildren.push(savedChild);
                if (child.nodeType == 1) {
                    savedChild.children = CUI.rte.DomProcessor.saveChildNodes(
                            child);
                } else {
                    savedChild.text = child.nodeValue;
                }
            }
            return savedChildren;
        },

        restoreChildNodes: function(dom, savedChildren) {
            while (dom.childNodes.length > 0) {
                dom.removeChild(dom.childNodes[0]);
            }
            for (var i = 0; i < savedChildren.length; i++) {
                var child = savedChildren[i];
                var domChild = child.dom;
                if (child.text !== undefined) {
                    domChild.nodeValue = child.text;
                }
                var children = child.children;
                dom.appendChild(domChild);
                if (children) {
                    CUI.rte.DomProcessor.restoreChildNodes(domChild, children);
                }
            }
        },

        /**
         * Inserts the specified DOM node at the specified location.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom Element to insert
         * @param {HTMLElement} insertNode Node of insert location
         * @param {Number} insertOffset Offset of insert location
         */
        insertElement: function(context, dom, insertNode, insertOffset) {
            var parent = insertNode.parentNode;
            if (insertNode.nodeType == 3) {
                // set marker inside a text node
                if (insertOffset == 0) {
                    parent.insertBefore(dom, insertNode);
                } else if (insertOffset >= com.getNodeCharacterCnt(insertNode)) {
                    parent.insertBefore(dom, insertNode.nextSibling);
                } else {
                    var splitNodes = CUI.rte.DomProcessor.splitTextNode(context,
                            insertNode, insertOffset);
                    parent.insertBefore(dom, splitNodes[1]);
                }
                return;
            }
            if (com.isOneCharacterNode(insertNode)) {
                if (insertOffset == null) {
                    com.insertBefore(parent, dom, insertNode);
                } else {
                    com.insertBefore(parent, dom, insertNode.nextSibling);
                }
            } else {
                var children = insertNode.childNodes;
                if ((insertOffset != null) && (insertOffset < children.length)) {
                    insertNode.insertBefore(dom, children[insertOffset]);
                } else {
                    insertNode.appendChild(dom);
                }
            }
        },

        /**
         * Creates a marker span.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node Node the marker is to be added
         * @param {Number} offset Offset of the marker (relative to node)
         * @return {HTMLElement} The marker span
         */
        createMarker: function(context, node, offset) {
            var markerDom = context.createElement("span");
            CUI.rte.DomProcessor.insertElement(context, markerDom, node, offset);
            return markerDom;
        },

        /**
         * Removes a marker span previously set by {@link #createMarker}.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} markerDom The marker span to be removed
         */
        removeMarker: function(context, markerDom) {
            var prevNode = markerDom.previousSibling;
            var nextNode = markerDom.nextSibling;
            com.removeNodesWithoutContent(context, markerDom);
            if (prevNode && nextNode) {
                if ((prevNode.nodeType == 3) && (nextNode.nodeType == 3)) {
                    prevNode.nodeValue += nextNode.nodeValue;
                    nextNode.parentNode.removeChild(nextNode);
                }
            }
        },

        /**
         * Creates a span that contains temporary content.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Boolean} removeImmediately True if the span should be removed
         *        immediately after the selection changes
         * @param {Boolean} keepChildren True if child nodes should be kept if the
         *        temporary span should get removed again
         * @param {Boolean} adjustInner True if child nodes chould be kept, but cleaned
         *        up (remove special placeholder characters, etc.))
         */
        createTempSpan: function(context, removeImmediately, keepChildren, adjustInner) {
            var com = CUI.rte.Common;
            var span = context.createElement("span");
            var value = (removeImmediately ? com.TEMP_EL_IMMEDIATE_REMOVAL
                    : com.TEMP_EL_REMOVE_ON_SERIALIZE);
            if (keepChildren) {
                value += ":keepChildren";
            }
            if (adjustInner) {
                value += ":adjustInner";
            }
            com.setAttribute(span, com.TEMP_EL_ATTRIB, value);
            return span;
        },

        /**
         * Removes all currently active temporary spans (as created by
         * {@link #createTempSpan}).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {Boolean} immediate True if all spans that were marked for immediate
         *        removal should get removed; fals for spans marked for removal after
         *        serialization
         */
        removeTempSpans: function(context, immediate) {
            var com = CUI.rte.Common;
            var dpr = CUI.rte.DomProcessor;
            var spans = context.doc.getElementsByTagName("span");
            var spanCnt = spans.length;
            var value = (immediate ? com.TEMP_EL_IMMEDIATE_REMOVAL
                    : com.TEMP_EL_REMOVE_ON_SERIALIZE);
            // on Webkit browsers, the selection may indirectly change,
            // so ensure that it is the same after the clean up again
            var hasSelectionChanged = false;
            var selection, restoreNode, restoreOffset;
            if (com.ua.isWebKit) {
                selection = context.win.getSelection();
                restoreNode = selection.anchorNode;
                restoreOffset = selection.anchorOffset;
            }
            for (var s = 0; s < spanCnt; s++) {
                var spanToRemove = spans[s];
                var attrValue = com.getAttribute(spanToRemove, com.TEMP_EL_ATTRIB, true);
                if (attrValue && com.strStartsWith(attrValue, value)) {
                    if (spanToRemove.parentNode) {
                        var splitAttrib = attrValue.split(":");
                        var keepChildren = com.arrayContains(splitAttrib, "keepChildren");
                        var adjustInner = com.arrayContains(splitAttrib, "adjustInner");
                        if (keepChildren) {
                            dpr.removeWithoutChildren(spanToRemove);
                        } else if (adjustInner) {
                            function cleanUp(dom) {
                                if (dom.nodeType === 3) {
                                    var text = dom.nodeValue;
                                    var isReplaced = false;
                                    var znbspPos;
                                    do {
                                        znbspPos = text.indexOf(dpr.ZERO_WIDTH_NBSP);
                                        if (znbspPos >= 0) {
                                            text = com.strReplace(text, znbspPos, znbspPos,
                                                "");
                                            if (com.ua.isWebKit && (dom === restoreNode)
                                                    && (znbspPos < restoreOffset)) {
                                                restoreOffset--;
                                                hasSelectionChanged = true;
                                            }
                                            isReplaced = true;
                                        }
                                    } while (znbspPos >= 0);
                                    if (isReplaced) {
                                        dom.nodeValue = text;
                                    }
                                } else if (dom.nodeType === 1) {
                                    var childCnt = dom.childNodes.length;
                                    for (var c = 0; c < childCnt; c++) {
                                        cleanUp(dom.childNodes[c]);
                                    }
                                }
                            }
                            cleanUp(spanToRemove);
                            dpr.removeWithoutChildren(spanToRemove);
                        } else {
                            spanToRemove.parentNode.removeChild(spanToRemove);
                        }
                    }
                }
            }
            if (com.ua.isWebKit && hasSelectionChanged) {
                var range = context.doc.createRange();
                range.setStart(restoreNode, restoreOffset);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },

        /**
         * Removes all DOM elements that are marked as temporary using the
         * {@link CUI.rte.Common#TEMP_EL_ATTRIB} attribute.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} treeRoot (optional) The sub tree to process
         */
        removeTempElements: function(context, treeRoot) {
            var com = CUI.rte.Common;
            var dpr = CUI.rte.DomProcessor;
            if (!treeRoot) {
                treeRoot = context.doc;
            }
            var childCnt = treeRoot.length;
            for (var c = 0; c < childCnt; c++) {
                var child = treeRoot.childNodes[c];
                if (child.nodeType === 1) {
                    var tempAttrib = com.getAttribute(child, com.TEMP_EL_ATTRIB, true);
                    if (tempAttrib) {
                        var splitAttrib = tempAttrib.split(":");
                        var keepChildren = com.arrayContains(splitAttrib, "keepChildren");
                        var emptyOnly = com.arrayContains(splitAttrib, "emptyOnly");
                        if (keepChildren) {
                            dpr.removeWithoutChildren(child);
                        } else {
                            if (emptyOnly) {
                                if (child.childNodes.length === 0) {
                                    child.parentNode.removeChild(child);
                                    continue;
                                } else {
                                    com.removeAttribute(child, com.TEMP_EL_ATTRIB);
                                }
                            } else {
                                child.parentNode.removeChild(child);
                                continue;
                            }
                        }
                    }
                    dpr.removeTempElements(context, child);
                }
            }
        },

        /**
         * Checks if the specified node represents a "zero width placeholder node".
         * @param {HTMLElement} dom The node to check
         * @return {Boolean} True if the specified node is a zero width placeholder node
         */
        isZeroSizePlaceholder: function(dom) {
            if (dom.nodeType === 1) {
                if (dom.childNodes.length != 1) {
                    return false;
                }
                dom = dom.childNodes[0];
            }
            if (dom.nodeType !== 3) {
                return false;
            }
            var text = com.getNodeText(dom);
            if (text.length !== 1) {
                return false;
            }
            return (text.charAt(0) === CUI.rte.DomProcessor.ZERO_WIDTH_NBSP);
        },

        /**
         * Gecko has several bugs (row-in-row, no table root element) that have to be
         * corrected. As content may theoretically be copied from Gecko to IE, this
         * method should also be called in IE's pasting mechanisms.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element that contains the pasted DOM to be
         *        corrected
         */
        correctGeckoCopyBugs: function(context, dom) {
            // fix "no table tag" issue
            var html = dom.innerHTML;
            var htmlLC = html.toLowerCase();
            if (com.strStartsWith(htmlLC, "<tr>") || com.strStartsWith(htmlLC, "<tr ")) {
                dom.innerHTML = "<table>" + html + "</table>";
            }
            // fix "row-in-row" issue (<table><tr><tr><td>...</td></tr></tr></table>
            var rows = com.getChildNodesByType(dom, "tr", true);
            var rowCnt = rows.length;
            for (var r = rowCnt - 1; r >= 0; r--) {
                var row = rows[r];
                var childRows = com.getChildNodesByType(row, "tr", false);
                if (childRows.length > 0) {
                    CUI.rte.DomProcessor.removeWithoutChildren(row);
                }
            }
        },

        /**
         * <p>Checks if the specified DOM element represents a named anchor and returns
         * additional information about it if appropriate.</p>
         * <p>Note that a named anchor must not necessarily be represented by a
         * corresponding "a" DOM element, but may also be substituted by another element,
         * for example a specially attributed image, as not all browsers support editing
         * named anchor elements correctly.</p>
         * @param {HTMLElement} dom The DOM element to check
         * @return {Object} Null if the specified DOM element does not represent a named
         *         anchor; otherwise an object with properties dom (the DOM object) name
         *         (the appropriate name attribute) and isAnchorTag (True if the DOM object
         *         is actually an "a" element, false if the "a" element is substituted by,
         *         for example, an "img" element)
         */
        checkNamedAnchor: function(dom) {
            if (com.ua.isWebKit) {
                // on Webkit, anchors are edited as img elements with a marker
                // attribute set accordingly
                if (com.isTag(dom, "img")) {
                    var nameReplacement = com.getAttribute(dom,
                            com.A_NAME_REPLACEMENT_ATTRIB);
                    if (nameReplacement != null) {
                        return {
                            "dom": dom,
                            "name": nameReplacement,
                            "isAnchorTag": false
                        };
                    }
                }
            } else {
                if (com.isTag(dom, "a") && com.isAttribDefined(dom, "name")) {
                    return {
                        "dom": dom,
                        "name": dom.name,
                        "isAnchorTag": true
                    };
                }
            }
            return null;
        },

        /**
         * <p>Calculates the "screen estate" the specified nodes/offsets span.</p>
         * <p>This method returns the top/left coordinates of the start node and the
         * bottom/right coordinates of the end node if available or of the start node.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} startNode The start node
         * @param {HTMLElement} startOffset The start offset
         * @param {HTMLElement} endNode (optional) The end node
         * @param {HTMLElement} endOffset (optional) The end offset
         */
        calcScreenEstate: function(context, startNode, startOffset, endNode, endOffset) {
            var dpr = CUI.rte.DomProcessor;
            if (!endNode) {
                endNode = startNode;
                endOffset = startOffset;
            }

            // get start and end block to limit the scope
            var startBlock = com.getTagInPath(context, startNode, com.BLOCK_TAGS);
            var endBlock = com.getTagInPath(context, endNode, com.BLOCK_TAGS);

            // we're working on cloned blocks to avoid implicit changes in the selection
            // if start/end reflects the start/end of a selection
            var clonedStartBlock = startBlock.cloneNode(true);
            var clonedEndBlock = endBlock.cloneNode(true);

            // match start and end nodes to their counterparts in the cloned block
            function getPath(node, parentNode) {
                var path = [ ];
                while (node && (node !== parentNode)) {
                    path.splice(0, 0, com.getChildIndex(node));
                    node = node.parentNode;
                }
                return path;
            }
            function applyPath(path, parent) {
                var node = parent;
                var pathCnt = path.length;
                for (var p = 0; p < pathCnt; p++) {
                    node = node.childNodes[path[p]];
                }
                return node;
            }
            var clonedStartNode = applyPath(getPath(startNode, startBlock),
                    clonedStartBlock);
            var clonedEndNode = applyPath(getPath(endNode, endBlock), clonedEndBlock);

            // insert marker to finally determine the position
            var startMarker = dpr.createMarker(context, clonedStartNode, startOffset);
            startMarker.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
            var endMarker = startMarker;
            if ((startOffset !== endOffset) || (startNode !== endNode)) {
                endMarker = dpr.createMarker(context, clonedEndNode, endOffset);
                endMarker.appendChild(context.createTextNode(dpr.ZERO_WIDTH_NBSP));
            }
            startBlock.parentNode.insertBefore(clonedStartBlock, startBlock);
            var startPos = CUI.rte.Utils.getPagePosition(startMarker);
            var startHeight = CUI.rte.Utils.getHeight(startMarker);
            var endPos = startPos;
            var endHeight = startHeight;
            startBlock.parentNode.removeChild(clonedStartBlock);
            if ((startOffset !== endOffset) || (startNode !== endNode)) {
                endBlock.parentNode.insertBefore(clonedEndBlock, endBlock);
                endPos = CUI.rte.Utils.getPagePosition(endMarker);
                endHeight = CUI.rte.Utils.getHeight(endMarker);
                endBlock.parentNode.removeChild(clonedEndBlock);
            }
            return {
                startX: startPos[0],
                startY: startPos[1],
                endX: endPos[0],
                endY: endPos[1] + endHeight
            }
        },

        /**
         * Main node type of a {@link CUI.rte.NodeList}'s node: Text node
         * @type String
         */
        TEXT_NODE: "text",

        /**
         * Main node type of a {@link CUI.rte.NodeList}'s node: Structural node
         * @type String
         */
        DOM_NODE: "dom",

        /**
         * Type of DOM/structural node: Container - containers (such as div, p) are
         * considered to be "stronger" than simple structures (such as b, i, u) and hence
         * handled differently, for example when being surrounded: the content of containers
         * always gets explicitly surrounded, for example <i>&lt;p&gt;&lt;span
         * class="test"&gt;Surrounded paragraph &lt;/span&gt;&lt;/p&gt;</i>
         * @type String
         */
        CONTAINER: "container",

        /**
         * Type of DOM/structural node: (Simple) Structure
         * @type String
         */
        STRUCTURE: "structure",

        /**
         * Type of DOM/structural node: Dynamic - the type of some tags is dependent on the
         * context they're used in. For example, "a" tags are sometimes handled as
         * containers, sometimes as structures, sometimes not at all
         * @type String
         */
        DYNAMIC: "dynamic",

        /**
         * Type of DOM/structural node: The node has to be ignored regarding processing
         * functions. For example, list nodes must not be included in any formatting
         * operation, but their item nodes must be included.
         * @type String
         */
        IGNORE: "ignore",

        /**
         * List of tags that may provide their own block tag root
         * @type Array
         */
        AUXILIARY_ROOT_TAGS: [
            "td", "th", "caption"
        ],

        /**
         * Constant that defines the &amp;nbsp; char code
         * @type Number
         */
        NBSP_CODE: 160,

        /**
         * Constant that defines the &amp;nbsp; character
         * @type String
         */
        NBSP: String.fromCharCode(160),

        /**
         * Constant that defines the char code for a non-breaking, zero-width character
         * @type String
         */
        ZERO_WIDTH_NBSP_CODE: 65279,

        /**
         * Constant that defines a non-breaking, zero-width character as a String
         * @type String
         */
        ZERO_WIDTH_NBSP: String.fromCharCode(65279),

        EMPTYTEXT_EXCLUSIONS: [ {
                "tagName": "a",
                "attribsDefined": [ "href" ],
                "attribsUndefined": [ "name" ]
            },
            { "tagName": "b" }, { "tagName": "i" }, { "tagName": "u" },
            { "tagName": "sub" }, { "tagName": "sup" },
            { "tagName": "span" }
        ]

    };

}();

/**
 * This table is used to determine the type (<code>STRUCTURE</code>,
 * <code>CONTAINER</p>, <p>DYNAMIC</p> of a tag. If nothing is specified
 * for a given tag, <code>STRUCTURE</code> is used as a default. Note: This table
 * may be changed if required. <i>But don't do so unless you are absolutely sure
 * about what you are doing!</i>
 */
CUI.rte.DomProcessor.TYPE_TABLE = {
    "h1": CUI.rte.DomProcessor.CONTAINER,
    "h2": CUI.rte.DomProcessor.CONTAINER,
    "h3": CUI.rte.DomProcessor.CONTAINER,
    "h4": CUI.rte.DomProcessor.CONTAINER,
    "h5": CUI.rte.DomProcessor.CONTAINER,
    "h6": CUI.rte.DomProcessor.CONTAINER,
    "p": CUI.rte.DomProcessor.CONTAINER,
    "div": CUI.rte.DomProcessor.CONTAINER,
    "li": CUI.rte.DomProcessor.CONTAINER,
    "ul": CUI.rte.DomProcessor.IGNORE,
    "ol": CUI.rte.DomProcessor.IGNORE,
    "table": CUI.rte.DomProcessor.IGNORE,
    "tbody": CUI.rte.DomProcessor.IGNORE,
    "thead": CUI.rte.DomProcessor.IGNORE,
    "tfoot": CUI.rte.DomProcessor.IGNORE,
    "tr": CUI.rte.DomProcessor.IGNORE,
    "td": CUI.rte.DomProcessor.CONTAINER,
    "th": CUI.rte.DomProcessor.CONTAINER,
    "caption": CUI.rte.DomProcessor.CONTAINER,
    "address": CUI.rte.DomProcessor.CONTAINER,
    "blockquote": CUI.rte.DomProcessor.CONTAINER,
    "pre": CUI.rte.DomProcessor.CONTAINER
};
