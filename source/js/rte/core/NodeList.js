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
 * @class CUI.rte.NodeList
 * @private
 * <p>Class that implements a node list that can be used to manipulate document ranges
 * more easily.</p>
 * <p>Some explanation on the terms used:</p>
 * <ul>
 *   <li>Document range - is a fragment of a document, determined by its first character
 *   position and the number of characters. This is the same model as used by
 *   {@link CUI.rte.Selection}.</li>
 *   <li>Common ancestor - refers to the DOM node that is the direct parent of all nodes of
 *   the represented document range.</li>
 *   <li>"Aligned" - most often, document ranges will start and end in the middle of a DOM
 *   text node. This is referred to as "unaligned". If a document range starts or ends at
 *   the beginning/end of a DOM text node, it is referred to as "aligned".</li>
 * </ul>
 * <p>Some explanation on how this class works:</p>
 * <ul>
 *   <li>Use {@link CUI.rte.DomProcessor#createNodeList} to create a corresponding
 *   node list.</li>
 *   <li>Use {@link #surround} to surround the document range with a certain tag. For
 *   example, you could surround the document range with a "span" tag that contains
 *   a "class" attribute to style the range accordingly. {@link #surround} will handle
 *   some common rules to ensure a correct nesting of tags. See the documentation of
 *   {@link #surround} for further information about what is supported.</li>
 * </ul>
 */
CUI.rte.NodeList = new Class({

    toString: "NodeList",

    /**
     * @property nodes
     */
    nodes: null,

    /**
     * @property commonAncestor
     */
    commonAncestor: null,

    /**
     * @property nodesChanged
     */
    nodesChanged: null,

    /**
     * @cfg {Boolean} removeExistingStructuresOnSurround
     * True if existing structures of the surrounding tags should be removed; defaults to
     * true; example: Surrounding "This is &lt;b&gt;bold&lt;/b&gt;" will result in
     * "&lt;b&gt;This is bold&lt;/b&gt;" if this option has been set to true; else
     * "&lt;b&gt;This is &lt;b&gt;bold&lt;/b&gt;&lt;/b&gt;"
     */
    removeExistingStructuresOnSurround: false,


    construct: function(config) {
        config = config || { };
        CQ.Util.applyDefaults(config, {
            "removeExistingStructuresOnSurround": true
        });
        CUI.rte.Utils.apply(this, config);
        this.nodes = [ ];
        this.nodesChanged = [ ];
    },

    /**
     * @private
     */
    addChildNode: function(nodeToAdd, nodeList, index) {
        nodeToAdd.parentNode = null;
        nodeToAdd.nodeList = nodeList;
        if (!index || (index >= this.nodes.length)) {
            this.nodes.push(nodeToAdd);
        } else {
            this.nodes.splice(index, 0, nodeToAdd);
        }
    },

    /**
     * @private
     */
    removeChildNode: function(node) {
        var removeIndex = this.getTopLevelNodeIndex(node);
        if (removeIndex < 0) {
            return -1;
        }
        this.nodes.splice(removeIndex, 1);
        return removeIndex;
    },

    /**
     * @private
     */
    createTextNode: function(dom, startOffs, endOffs, parentNode) {
        var textLen = CUI.rte.Common.getNodeCharacterCnt(dom);
        if (textLen > 0) {
            var offset = 0;
            var charCnt = textLen;
            if (startOffs != null) {
                offset = startOffs;
                charCnt -= startOffs;
            }
            if (endOffs != null) {
                charCnt -= (textLen - endOffs);
            }
            // there are situations where charCnt can get invalid (when selecting the
            // [virtual] character "behind" an edit block), which we have to correct to
            // a charCnt inside the boundaries of the node
            if ((offset + charCnt) > textLen) {
                charCnt = textLen - offset;
            }
            var textNode = new CUI.rte.DomProcessor.TextNode(dom, offset, charCnt);
            if (!parentNode) {
                this.addChildNode(textNode, this);
            } else {
                parentNode.addChildNode(textNode, this);
            }
        }
    },

    /**
     * @private
     */
    createStructuralNode: function(dom, parentNode) {
        var strucNode = new CUI.rte.DomProcessor.StructuralNode(dom);
        if (!parentNode) {
            this.addChildNode(strucNode, this);
        } else {
            parentNode.addChildNode(strucNode, this);
        }
        return strucNode;
    },

    /**
     * @private
     */
    createAncestors: function(context, node, startOffs, endOffs) {
        var com = CUI.rte.Common;
        var isInitialNodeSkipped = com.isOneCharacterNode(node) && (startOffs == 0);
        var addNode = !isInitialNodeSkipped;
        var path = [ ];
        if (node == this.commonAncestor) {
            if (addNode) {
                path.push(node);
            }
        } else {
            do {
                if (addNode) {
                    path.push(node);
                } else {
                    addNode = true;
                }
                node = com.getParentNode(context, node);
            } while (node && (node != this.commonAncestor));
        }
        var parentNode = null;
        var pathCnt = path.length;
        var commonNode = null;
        for (var pathIndex = pathCnt - 1; pathIndex >= 0; pathIndex--) {
            var i;
            if (pathIndex == (pathCnt - 1)) {
                for (i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].dom == path[pathIndex]) {
                        commonNode = this.nodes[i];
                        break;
                    }
                }
            } else if (commonNode) {
                var newCommonNode = null;
                for (i = 0; i < commonNode.childNodes.length; i++) {
                    if (commonNode.childNodes[i].dom == path[pathIndex]) {
                        newCommonNode = commonNode.childNodes[i];
                        break;
                    }
                }
                commonNode = newCommonNode;
            }
            if (!commonNode) {
                if (path[pathIndex].nodeType == 1) {
                    parentNode = this.createStructuralNode(path[pathIndex], parentNode);
                } else if (path[pathIndex].nodeType == 3) {
                    this.createTextNode(path[pathIndex], startOffs, endOffs, parentNode);
                }
            } else {
                parentNode = commonNode;
            }
        }
        return {
            "parentNode": parentNode,
            "isInitialNodeSkipped": isInitialNodeSkipped
        };
    },

    /**
     * @private
     */
    createList: function(context, selection) {
        var com = CUI.rte.Common;
        var startNode = selection.startNode;
        var endNode = selection.endNode;
        if (endNode == null) {
            endNode = startNode;
        }
        var startOffs = selection.startOffset;
        var endOffs = null;
        // build ancestor nodes
        var processingNode = selection.startNode;
        if (processingNode.nodeType == 3) {
            if (startNode == endNode) {
                if (selection.endOffset != null) {
                    endOffs = selection.endOffset + 1;
                } else {
                    endOffs = selection.startOffset;
                }
            }
        }
        var ancestorDef = this.createAncestors(context, processingNode, startOffs, endOffs);
        var parentNode = ancestorDef.parentNode;
        if (startNode == endNode) {
            return;
        }

        var isInitialNodeSkipped = ancestorDef.isInitialNodeSkipped;
        var isFirstNode = true;
        while (true) {
            // determine next node to process
            var children = processingNode.childNodes;
            if (children.length > 0) {
                processingNode = processingNode.firstChild;
            } else {
                if (!(isInitialNodeSkipped && isFirstNode)) {
                    if ((processingNode.nodeType == 1) && parentNode) {
                        parentNode = parentNode.parentNode;
                    }
                }
                if (processingNode.nextSibling) {
                    processingNode = processingNode.nextSibling;
                } else {
                    while (true) {
                        processingNode = com.getParentNode(context, processingNode);
                        parentNode = parentNode.parentNode;
                        if (!processingNode) {
                            break;
                        }
                        if (processingNode.nextSibling) {
                            processingNode = processingNode.nextSibling;
                            break;
                        }
                    }
                }
            }
            isFirstNode = false;
            // handle end node
            startOffs = null;
            endOffs = null;
            if (processingNode == endNode) {
                if (endNode.nodeType == 3) {
                    endOffs = selection.endOffset + 1;
                }
            }
            // add node
            if (processingNode.nodeType == 1) {
                parentNode = this.createStructuralNode(processingNode, parentNode);
            } else if (processingNode.nodeType == 3) {
                this.createTextNode(processingNode, startOffs, endOffs, parentNode);
            }
            // check for end condition
            if (processingNode == endNode) {
                break;
            }
        }
    },

    createFromDocument: function(context, selection) {
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        this.nodes.length = 0;
        // corner case: invalid selection - may happen on IE while focus transfer
        if (!selection.startNode) {
            return selection;
        }
        // work on a copy of the processing selection, as it gets altered
        selection = {
            "startNode": selection.startNode,
            "startOffset": selection.startOffset,
            "endNode": selection.endNode,
            "endOffset": selection.endOffset,
            "isEOT": selection.isEOT
        };
        // Use normalized selection if we have a selection to ensure
        // start node does not point "behind" a node, but points to the
        // first actually included node. If the selection represents a caret,
        // we'll have to use the un-normalized selection, because the position
        // behind a node may have different impact than the position before
        // the succeeding node (for example, t|<b>ex</b>t will insert a
        // character in plaintext, whereas t<b>|ex</b>t will insert a bold
        // character.
        if (sel.shouldNormalizePSelForNodeList(context, selection)) {
            sel.normalizeProcessingSelection(context, selection);
        }
        // corner case: caret at end of the text will create an empty list
        if (selection.isEOT) {
            var children = context.root.childNodes;
            this.commonAncestor = children[children.length - 1];
            return selection;
        }
        // adjust end node to point to the last inclusive node
        selection = sel.adaptToInclusiveEndNode(context, selection);
        if ((selection.startNode == selection.endNode) || (selection.endNode == null)) {
            this.commonAncestor = selection.startNode.parentNode;
        } else {
            this.commonAncestor = dpr.getCommonAncestor(context, selection.startNode,
                    selection.endNode);
        }
        if (!this.commonAncestor) {
            throw new Error("No common ancestor found, cannot continue.");
        }
        this.createList(context, selection);
        return selection;
    },

    /**
     * @private
     */
    createDomChildren: function(dom, parentNode) {
        var children = dom.childNodes;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                var listNode = this.createStructuralNode(child, parentNode);
                this.createDomChildren(child, listNode);
            } else if (child.nodeType == 3) {
                this.createTextNode(child, null, null, parentNode);
            }
        }
    },

    createFromDomNodes: function(context, domNodes) {
        var dpr = CUI.rte.DomProcessor;
        this.commonAncestor = domNodes[0];
        var nodeCnt = domNodes.length;
        for (var i = 1; i < nodeCnt; i++) {
            if (!CUI.rte.Common.isAncestor(context, this.commonAncestor, domNodes[i])) {
                this.commonAncestor = dpr.getCommonAncestor(context, this.commonAncestor,
                        domNodes[i]);
            }
        }
        if (!this.commonAncestor) {
            throw new Error("No common ancestor found, cannot continue.");
        }
        for (i = 0; i < nodeCnt; i++) {
            var dom = domNodes[i];
            var ancestorDef = this.createAncestors(context, dom, null, null);
            this.createDomChildren(dom, ancestorDef.parentNode);
        }
    },

    /**
     * <p>Removes empty side-structures from the node list.</p>
     * <p>Side-structures are selection-leftovers, for example if a selection begins after
     * the last character of an editing block.</p>
     */
    removeEmptySideStructures: function() {
        var com = CUI.rte.Common;
        if (this.nodes.length > 0) {
            var nodeToCheck = this.nodes[0];
            if (nodeToCheck.isEmptySideStructure()) {
                this.nodes.splice(0, 1);
            }
            if (this.nodes.length > 0) {
                var nodeIndex = this.nodes.length - 1;
                nodeToCheck = this.nodes[nodeIndex];
                if (nodeToCheck.isEmptySideStructure()) {
                    this.nodes.splice(nodeIndex, 1);
                }
            }
            // adjust to new ancestor if possible
            while (this.nodes.length == 1) {
                var newCommonAncestor = this.nodes[0];
                if (!com.isCharacterNode(newCommonAncestor.dom)) {
                    this.commonAncestor = newCommonAncestor.dom;
                    this.nodes.length = 0;
                    if (newCommonAncestor.childNodes) {
                        var childCnt = newCommonAncestor.childNodes.length;
                        for (var c = 0; c < childCnt; c++) {
                            var childToMove = newCommonAncestor.childNodes[c];
                            childToMove.parentNode = null;
                            this.nodes.push(childToMove);
                        }
                    }
                } else {
                    break;
                }
            }
        }
    },

    hasContainers: function() {
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.hasContainers()) {
                return true;
            }
        }
        return false;
    },

    isAligned: function(fn) {
        if (!fn) {
            fn = function(node) {
                return node.isAligned();
            };
        }
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (!fn(nodeToProcess)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Creates a list of all edit blocks contained in the node list.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Boolean} considerAncestors True if ancestor nodes should also be considered
     *        if no edit blocks were found in the node list itself
     */
    getEditBlocksByAuxRoots: function(context, considerAncestors) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var nodeCnt = this.nodes.length;
        var b, editBlocks;
        var segmentedBlocks = [ ];
        var currentAuxRoot = null;
        for (var n = 0; n < nodeCnt; n++) {
            this.nodes[n].execRecursively(function(node) {
                var dom = node.dom;
                if (com.isTag(dom, dpr.AUXILIARY_ROOT_TAGS)) {
                    editBlocks = [ ];
                    segmentedBlocks.push(editBlocks);
                    editBlocks.push(dom);
                    currentAuxRoot = dom;
                } else if (com.isTag(dom, com.EDITBLOCK_TAGS)) {
                    var nodeAuxRoot = dpr.getAuxRootNode(context, dom);
                    if (nodeAuxRoot != currentAuxRoot) {
                        editBlocks = [ ];
                        segmentedBlocks.push(editBlocks);
                        currentAuxRoot = nodeAuxRoot;
                    }
                    editBlocks.push(dom);
                }
            });
        }
        if ((segmentedBlocks.length == 0) && considerAncestors) {
            var domToCheck = this.commonAncestor;
            while (domToCheck) {
                if (com.isTag(domToCheck, com.EDITBLOCK_TAGS)) {
                    segmentedBlocks.push([ domToCheck ]);
                    break;
                }
                domToCheck = com.getParentNode(context, domToCheck);
            }
        }
        for (b = segmentedBlocks.length - 1; b >= 0; b--) {
            var blocks = segmentedBlocks[b];
            var bl = blocks.length;
            if (bl == 0) {
                segmentedBlocks.splice(b, 1);
            } else if (com.isTag(blocks[0], dpr.AUXILIARY_ROOT_TAGS)) {
                if (bl > 1) {
                    blocks.splice(0, 1)
                } else if (dpr.hasEditBlocks(blocks[0])) {
                    segmentedBlocks.splice(b, 1);
                }
            }
        }
        return segmentedBlocks;
    },

    normalize: function() {
        var invalidatedNodes = [ ];
        var childCnt = this.nodes.length;
        for (var c = 0; c < childCnt; c++) {
            this.nodes[c].normalize(this, invalidatedNodes);
        }
        var removeCnt = invalidatedNodes.length;
        for (var r = 0; r < removeCnt; r++) {
            this.remove(invalidatedNodes[r]);
        }
    },

    /**
     * @private
     */
    createTopLevelDomNodes: function() {
        var domNodes = [ ];
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            domNodes.push(this.nodes[nodeIndex].dom);
        }
        return domNodes;
    },

    /**
     * @private
     */
    getTopLevelNodeIndex: function(node) {
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess == node) {
                return nodeIndex;
            }
        }
        return -1;
    },

    /**
     * <p>"Surrounds" the node list (document range) with the given tag.</p>
     * <p>The method can handle the following use-cases ("|" marks the start/end of the
     * document range; surrounding tag is &lt;span class="test"&gt;:</p>
     * <ul>
     *   <li>Splitting simple text nodes: <i>Ex|amp|le</i> -&gt;
     *   <i>Ex&lt;span class="test"&gt;amp&lt;/span&gt;le</i></li>
     *   <li>Handling structural nodes (as "b", "i", "u", ...): <i>This |is
     *   &lt;b&gt;bold&lt;/b&gt;| text</i> -&gt; <i>This &lt;span class="test"&gt;i
     *   &lt;b&gt;bold&lt;/b&gt;&lt;/span&gt; text</i></li>
     *   <li>Handling container nodes (as "div", "p"): <i>|&lt;p&gt;Paragraph 1&lt;/p&gt;
     *   &lt;p&gt;Paragraph 2&lt;/p&gt;|</i> -&gt; <i>|&lt;p&gt;&lt;span class="test"&gt;
     *   Paragraph 1&lt;/span&gt;&lt;/p&gt; &lt;p&gt;&lt;span class="test"&gt;Paragraph 2
     *   &lt;/span&gt;&lt;/p&gt;|</i></li>
     * </ul>
     * <p>This method does not optimize the sub tree (for example, remove unnecessary nodes
     * that will be created if for example <i>|this is &lt;b&gt;bold&lt;/b&gt;|</i> is
     * surrounded by another "b" tag (the result would then be
     * <i>&lt;b&gt;this is &lt;b&gt;bold&lt;/b&gt;&lt;/b&gt;</i>).</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {String} tag Name of tag the document range has to be surrounded with
     * @param {Object} attribs Table of attributes to be used with the surrounding tag
     * @return {Array} Array with all additionally created nodes
     */
    surround: function(context, tag, attribs) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        this.removeEmptySideStructures();
        this.nodesChanged.length = 0;
        var nodeCnt, nodeIndex;
        var nodesAdded = [ ];
        // normalize text nodes
        this.normalize();
        // if everything is "aligned" and there are no containers, we can simply
        // insert a new structure node in between the existing nodes
        var doComplexSurround = true;
        if (this.isAligned() && !this.hasContainers()) {
            var containerNode = dpr.restructureAsChild(context, this.commonAncestor,
                    this.createTopLevelDomNodes(), tag, attribs);
            var nodesToCopy = this.nodes;
            this.nodes = [ ];
            var parentNode = this.createStructuralNode(containerNode, null);
            this.nodes.push(parentNode);
            nodeCnt = nodesToCopy.length;
            for (nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
                parentNode.addChildNode(nodesToCopy[nodeIndex], this);
            }
            this.nodesChanged.push(containerNode);
            doComplexSurround = false;
            nodesAdded.push(containerNode);
        }
        if (doComplexSurround) {
            // must do the surround node by node, unfortunately ...
            nodeCnt = this.nodes.length;
            var surroundingNode = null;
            for (nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
                var nodeToSurround = this.nodes[nodeIndex];
                surroundingNode = nodeToSurround.surround(context, surroundingNode, tag,
                        attribs, nodesAdded);
            }
        }
        if (this.nodesChanged.length > 0) {
            var startNode = this.nodesChanged[0];
            var endNode = this.nodesChanged[this.nodesChanged.length - 1];
            if (startNode == endNode) {
                endNode = com.getLastChild(startNode);
            }
            var selection = dpr.removeDuplicateStructures(context, startNode, endNode);
            dpr.joinIdenticalStructures(context, selection.startNode, true);
            dpr.joinIdenticalStructures(context, selection.endNode, false);
            if (doComplexSurround) {
                // todo table cell selection cannot work this way, as selection is derived from changed nodes
                if (selection.cellSelection && selection.cellSelection.cells) {
                    this.createFromDomNodes(context, selection.cellSelection.cells);
                } else {
                    var normalizeNode = function(node, isStart) {
                        var offset = null;
                        if (com.isOneCharacterNode(node)) {
                            offset = (isStart ? null : 0);
                        } else if (node.nodeType == 3) {
                            offset = (isStart ? 0 : node.nodeValue.length);
                        } else if (node.nodeType == 1) {
                            var ftn = com.getFirstTextChild(node, true);
                            if (ftn) {
                                node = ftn;
                                offset = (isStart
                                        ? sel.getFirstSelectionOffset(context, ftn)
                                        : sel.getLastSelectionOffset(context, ftn, true));
                            }
                        }
                        return {
                            "node": node,
                            "offset": offset
                        };
                    };
                    var startDef = normalizeNode(selection.startNode, true);
                    selection.startNode = startDef.node;
                    selection.startOffset = startDef.offset;
                    var endDef = normalizeNode(selection.endNode, false);
                    selection.endNode = endDef.node;
                    selection.endOffset = endDef.offset;
                    this.createFromDocument(context, selection);
                }
            }
        }
        return nodesAdded;
    },

    removeUnnecessaryLinebreaks: function(context, processAncestors) {
        var ancestorContainer;
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        if (processAncestors) {
            var dom = this.commonAncestor;
            while (dom) {
                if (dom.nodeType == 1) {
                    if (com.isRootNode(context, dom)) {
                        break;
                    }
                    if (dpr.getTagType(dom) == dpr.CONTAINER) {
                        ancestorContainer = dom;
                        break;
                    }
                }
                dom = com.getParentNode(context, dom);
            }
        }
        var nodeCnt = this.nodes.length;
        var nodesToRemove = [ ];
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.nodeType == dpr.DOM_NODE) {
                nodeToProcess.getUnnecessaryLinebreaks(ancestorContainer, nodesToRemove);
            }
        }
        var removeCnt = nodesToRemove.length;
        for (var removeIndex = 0; removeIndex < removeCnt; removeIndex++) {
            var nodeToRemove = nodesToRemove[removeIndex];
            var parent = nodeToRemove.parentNode;
            parent = (parent ? parent : this);
            dpr.removeWithoutChildren(nodeToRemove.dom);
            parent.removeChildNode(nodeToRemove);
        }
    },

    /**
     * @private
     */
    getByDomRec: function(node, dom) {
        if (node.dom == dom) {
            return node;
        }
        if (node.childNodes) {
            var childCnt = node.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var nodeFound = this.getByDomRec(node.childNodes[c], dom);
                if (nodeFound) {
                    return nodeFound;
                }
            }
        }
        return null;
    },

    getByDom: function(dom, isRecursive) {
        var nodeCnt = this.nodes.length;
        for (var n = 0; n < nodeCnt; n++) {
            var nodeToCheck = this.nodes[n];
            if (nodeToCheck.dom == dom) {
                return nodeToCheck;
            }
            if (isRecursive) {
                var nodeFound = this.getByDomRec(nodeToCheck, dom);
                if (nodeFound) {
                    return nodeFound;
                }
            }
        }
        return null;
    },

    contains: function(dom, isRecursive) {
        return (this.getByDom(dom, isRecursive) != null);
    },

    /**
     * @private
     */
    isolateNode: function(node, leftTarget, rightTarget) {
        var com = CUI.rte.Common;
        var childIndex = com.getChildIndex(node);
        var parent = node.parentNode;
        var childToMove, c;
        for (c = 0; c < childIndex; c++) {
            childToMove = parent.childNodes[0];
            parent.removeChild(childToMove);
            leftTarget.appendChild(childToMove);
        }
        var childCnt = parent.childNodes.length;
        for (c = childCnt - 1; c >= 1; c--) {
            childToMove = parent.childNodes[c];
            parent.removeChild(childToMove);
            rightTarget.insertBefore(childToMove, rightTarget.firstChild);
        }
    },

    /**
     * @private
     */
    handleAlignment: function(context, parentNodes) {
        var dpr = CUI.rte.DomProcessor;
        var parentLeft = parentNodes[1];
        var parentRight = parentNodes[2];
        // handle node list
        var childCnt = this.nodes.length;
        for (var c = 0; c < childCnt; c++) {
            var childToProcess = this.nodes[c];
            if (childToProcess.nodeType == dpr.TEXT_NODE) {
                // handle text nodes here
                childToProcess.split(context, parentLeft, parentRight);
            }
        }
    },

    /**
     * Removes all instances the specified element from the node list.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {String} tag Name of the tag to be removed
     * @param {Object} attribs Attribute list; may be null
     * @param {Boolean} processAncestors True, if the node list's ancestor nodes should also
     *        be considered for removing
     */
    removeNodesByTag: function(context, tag, attribs, processAncestors) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        // normalize text nodes
        this.normalize();
        var c, childCnt;
        var pNode = null;
        if (processAncestors) {
            // handle removals in ancestor nodes
            var nodeToProcess = this.commonAncestor;
            var path = [ ];
            var copy1, copy2, pNode1, pNode2;
            while (nodeToProcess) {
                var nodeParent = com.getParentNode(context, nodeToProcess);
                if (nodeToProcess.nodeType == 1) {
                    if (dpr.getTagType(nodeToProcess) == dpr.CONTAINER) {
                        break;
                    }
                    if (com.isTag(nodeToProcess, tag)
                            && (!attribs || com.hasAttributes(nodeToProcess, attribs))) {
                        pNode = nodeToProcess.parentNode;
                        pNode1 = nodeToProcess.cloneNode(false);
                        pNode.insertBefore(pNode1, nodeToProcess);
                        pNode2 = nodeToProcess.cloneNode(false);
                        pNode.insertBefore(pNode2, nodeToProcess.nextSibling);
                        pNode = nodeToProcess;
                        while (path.length > 0) {
                            pNode = path.pop();
                            this.isolateNode(pNode, pNode1, pNode2);
                            copy1 = pNode.cloneNode(false);
                            pNode1.appendChild(copy1);
                            pNode1 = copy1;
                            copy2 = pNode.cloneNode(false);
                            pNode2.insertBefore(copy2, pNode2.firstChild);
                            pNode2 = copy2;
                        }
                        this.handleAlignment(context, [ pNode, pNode1, pNode2]);
                        com.removeNodesWithoutContent(context, pNode1);
                        com.removeNodesWithoutContent(context, pNode2);
                        dpr.removeWithoutChildren(nodeToProcess);
                        break;
                    }
                    path.push(nodeToProcess);
                }
                nodeToProcess = nodeParent;
            }
        }
        // handle child removal
        childCnt = this.nodes.length;
        for (c = childCnt - 1; c >= 0; c--) {
            var childToProcess = this.nodes[c];
            if (childToProcess.nodeType == dpr.DOM_NODE) {
                childToProcess.removeNodesByTag(context, tag, attribs, this);
            }
        }
    },

    /**
     * Removes a node from the list and the DOM.
     * <p>
     * Child nodes are preserved.
     * @param {Node} node The node to be removed
     */
    remove: function(node) {
        var removeIndex = this.getTopLevelNodeIndex(node);
        if (removeIndex < 0) {
            node.parentNode.removeChild(node);
            return;
        }
        // DOM processing
        if (!node.isInvalidatedByNormalization) {
            CUI.rte.DomProcessor.removeWithoutChildren(node.dom);
        }
        // node list processing
        this.nodes.splice(removeIndex, 1);
        if (node.childNodes) {
            var childrenToMove = node.childNodes;
            var childCnt = childrenToMove.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToMove = childrenToMove[childIndex];
                childToMove.parentNode = this;
                this.nodes.splice(removeIndex + childIndex, 0, childToMove);
            }
        }
    },

    getAnchors: function(context, anchors, checkAncestors) {
        var com = CUI.rte.Common;
        if (checkAncestors) {
            var nodeToCheck = this.commonAncestor;
            while (nodeToCheck) {
                if (nodeToCheck.nodeType == 1) {
                    if (com.isRootNode(context, nodeToCheck)) {
                        break;
                    }
                    var tagLC = nodeToCheck.tagName.toLowerCase();
                    if (tagLC == "a") {
                        if (com.isAttribDefined(nodeToCheck, "href")) {
                            var anchor = {
                                "dom": nodeToCheck,
                                "href": com.getAttribute(nodeToCheck, com.HREF_ATTRIB)
                                        || com.getAttribute(nodeToCheck, "href")
                            };
                            if (nodeToCheck.className) {
                                anchor["cssClass"] = nodeToCheck.className;
                            }
                            if (nodeToCheck.target) {
                                anchor["target"] = nodeToCheck.target;
                            }
                            anchors.push(anchor);
                        }
                    }
                }
                nodeToCheck = com.getParentNode(context, nodeToCheck);
            }
        }
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                nodeToProcess.getAnchors(anchors);
            }
        }
    },

    getNamedAnchors: function(context, namedAnchors, checkAncestors) {
        var com = CUI.rte.Common;
        if (checkAncestors) {
            var nodeToCheck = this.commonAncestor;
            while (nodeToCheck) {
                if (nodeToCheck.nodeType == 1) {
                    if (com.isRootNode(context, nodeToCheck)) {
                        break;
                    }
                    var anchorDef = CUI.rte.DomProcessor.checkNamedAnchor(nodeToCheck);
                    if (anchorDef) {
                        namedAnchors.push(anchorDef);
                    }
                }
                nodeToCheck = com.getParentNode(context, nodeToCheck);
            }
        }
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                nodeToProcess.getNamedAnchors(namedAnchors);
            }
        }
    },

    getStyles: function(context, stylesDef, checkAncestors) {
        var com = CUI.rte.Common;
        var styles = stylesDef.styles;
        if (!styles) {
            styles = [ ];
            stylesDef.styles = styles;
        }
        var hasParentStyle = false;
        if (checkAncestors) {
            var nodeToCheck = this.commonAncestor;
            while (nodeToCheck) {
                if (nodeToCheck.nodeType == 1) {
                    if (com.isRootNode(context, nodeToCheck)) {
                        break;
                    }
                    var tagLC = nodeToCheck.tagName.toLowerCase();
                    if (tagLC == "span") {
                        if (nodeToCheck.className) {
                            hasParentStyle = true;
                            styles.push({
                                "dom": nodeToCheck,
                                "className": nodeToCheck.className
                            });
                        }
                    }
                }
                nodeToCheck = com.getParentNode(context, nodeToCheck);
            }
        }
        var continuousStyle = null;
        var hasTopLevelText = false;
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                var nodeState = nodeToProcess.getStyles(styles);
                continuousStyle = CUI.rte.NodeList.calcNewContState(
                        continuousStyle, nodeState);
            } else {
                hasTopLevelText = true;
            }
        }
        if (continuousStyle == null) {
            continuousStyle = "unstyled";
        }
        stylesDef.isContinuousStyle = (hasParentStyle && (continuousStyle == "unstyled"))
                || (!hasParentStyle && (continuousStyle == "single") && !hasTopLevelText);
    },

    containsTag: function(tagName) {
        tagName = tagName.toLowerCase();
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToProcess = this.nodes[nodeIndex];
            if (nodeToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                if (nodeToProcess.containsTag(tagName)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @private
     */
    executeMatcherOnDom: function(dom, tagMatcher) {
        var com = CUI.rte.Common;
        var isMatching = false;
        var matcherCnt = tagMatcher.length;
        for (var matcherIndex = 0; matcherIndex < matcherCnt; matcherIndex++) {
            var matcher = tagMatcher[matcherIndex];
            if (matcher.extMatcher) {
                var result = matcher.extMatcher(dom);
                if (result.isMatching) {
                    isMatching = true;
                    break;
                }
            } else if (matcher.matcher) {
                if (matcher.matcher(dom)) {
                    isMatching = true;
                    break;
                }
            } else {
                if (com.matchesTagDef(dom, matcher)) {
                    isMatching = true;
                    break;
                }
            }
        }
        return isMatching;
    },

    /**
     * <p>Gets a list of all DOM nodes (contained in the node list) that are matched by the
     * specified tag matcher(s).</p>
     * <p>You can also include ancestor nodes that match the tag matcher to be included in
     * the results. If you are using this option, you can force the method to include only:
     * </p>
     * <ul>
     *   <li>Elements that are contained in the node list. If there are elements contained
     *     in the node list, the common ancestor is also checked and included if suitable
     *     (this is necessary for selections that contain a single item of a list + item(s)
     *     of a nested list, as the selection covers the text of that single item only, not
     *     the item itself).</li>
     *   <li>If no suitable elements are contained in the node list, take the first suitable
     *     ancestor element (if any).</li>
     * </ul>
     * <p>This behaviour is suitable for getting the most suitable, selected element(s)
     * inside nested structures; for example the actually selected cell(s) of a table or
     * item(s) of a list, rather than including all parent cells/list items.</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Object[]} tagMatcher Array of tag matchers to be applied
     * @param {Boolean} checkAncestors True, if suitable ancestor elements should also be
     *        included in the results
     * @param {Boolean} breakOnFound True, if the rules defined above should be used
     *        (= consider first suitable ancestor element *only* if the node list (incl.
     *        child nodes) doesn't contain a suitable element); is considered only if
     *        checkAncestors == true
     * @return {Object[]} Array with all matching tags (properties: nodeType, isAncestor,
     *         dom)
     */
    getTags: function(context, tagMatcher, checkAncestors, breakOnFound) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var tags = [ ];
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            if (this.nodes[nodeIndex].nodeType == dpr.DOM_NODE) {
                this.nodes[nodeIndex].getTags(tagMatcher, tags);
            }
        }
        if (breakOnFound && (tags.length > 0)) {
            if (this.executeMatcherOnDom(this.commonAncestor, tagMatcher)) {
                tags.splice(0, 0, {
                    "nodeType": null,
                    "isAncestor": true,
                    "dom": this.commonAncestor
                });
            }
            return tags;
        }
        if (checkAncestors) {
            var dom = this.commonAncestor;
            while (dom) {
                if (this.executeMatcherOnDom(dom, tagMatcher)) {
                    tags.splice(0, 0, {
                        "nodeType": null,
                        "isAncestor": true,
                        "dom": dom
                    });
                    if (breakOnFound) {
                        return tags;
                    }
                }
                dom = com.getParentNode(context, dom);
            }
        }
        return tags;
    },

    hasContent: function() {
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            if (this.nodes[nodeIndex].nodeType == CUI.rte.DomProcessor.TEXT_NODE) {
                return true;
            } else {
                if (this.nodes[nodeIndex].hasContent()) {
                    return true;
                }
            }
        }
        return false;
    },

    hasCharacterNodes: function() {
        var nodeCnt = this.nodes.length;
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            if (this.nodes[nodeIndex].hasCharacterNodes()) {
                return true;
            }
        }
        return false;
    },

    /**
     * Gets the first node (deep) of the node list.
     * @return {CUI.rte.DomProcessor.TextNode|CUI.rte.DomProcessor.StructuralNode}
     *         The first node (deep) of the node list; null if the node list is empty
     */
    getFirstNode: function() {
        if (this.nodes.length == 0) {
            return null;
        }
        var node = this.nodes[0];
        while (node.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
            if (!node.childNodes || (node.childNodes.length == 0)) {
                break;
            }
            node = node.childNodes[0];
        }
        return node;
    },

    /**
     * Gets the last node (deep) of the node list.
     * @return {CUI.rte.DomProcessor.TextNode|CUI.rte.DomProcessor.StructuralNode}
     *         The last node (deep) of the node list; null if the node list is empty
     */
    getLastNode: function() {
        var nodeCnt = this.nodes.length;
        if (nodeCnt == 0) {
            return null;
        }
        var node = this.nodes[nodeCnt - 1];
        while (node.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
            if (!node.childNodes) {
                break;
            }
            var childCnt = node.childNodes.length;
            if (childCnt == 0) {
                break;
            }
            node = node.childNodes[childCnt - 1];
        }
        return node;
    },

    createDump: function() {
        var nodeCnt = this.nodes.length;
        var ancestorDef = "---";
        if (this.commonAncestor.nodeType == 1) {
            ancestorDef = this.commonAncestor.tagName;
        } else {
            ancestorDef = this.commonAncestor.nodeValue;
        }
        var dump = "Common ancestor: " + ancestorDef + "\n";
        dump += "Nodes in list: "
                + nodeCnt + "\n";
        for (var nodeIndex = 0; nodeIndex < nodeCnt; nodeIndex++) {
            var nodeToDump = this.nodes[nodeIndex];
            dump += nodeToDump.createDump() + "\n";
        }
        return dump;
    }

});


/**
 * @class CUI.rte.DomProcessor.TextNode
 * @private
 * This class represents a text node inside a node list.
 */
CUI.rte.DomProcessor.TextNode = new Class({

    toString: "TextNode",

    nodeType: CUI.rte.DomProcessor.TEXT_NODE,

    nodeList: null,

    parentNode: null,

    dom: null,

    startPos: 0,

    charCnt: 0,

    nodeLength: 0,

    /**
     * Flag if the node has been invalidated through text node normalization
     * @private
     * @type Boolean
     */
    isInvalidatedByNormalization: false,

    construct: function(dom, startPos, charCnt) {
        this.dom = dom;
        this.startPos = startPos;
        this.charCnt = charCnt;
        this.nodeLength = CUI.rte.Common.getNodeCharacterCnt(dom);
    },

    /**
     * Executes the specified function for the node and all child nodes.
     * @param {Function} fn The function to execute. Gets the node as parameter.
     */
    execRecursively: function(fn) {
        fn(this);
    },

    isStartAligned: function() {
        return (this.startPos == 0);
    },

    isEndAligned: function() {
        return ((this.startPos + this.charCnt) == this.nodeLength);
    },

    isAligned: function() {
        return this.isStartAligned() && this.isEndAligned();
    },

    hasContainers: function() {
        return false;
    },

    /**
     * Gets the actual text content that is included by this node (considering the
     * alignment of the node).
     * @return {String} The actual content of the node
     */
    getActualTextContent: function() {
        var nodeText = this.dom.nodeValue;
        if (this.startPos >= this.nodeLength) {
            return "";
        }
        return nodeText.substring(this.startPos, this.startPos + this.charCnt);
    },

    /**
     * Gets the text content of the underlying DOM text node that is <i>not</i> included
     * in this node.
     * @return {String} The excluded text content
     */
    getExcludedTextContent: function() {
        var nodeText = this.dom.nodeValue;
        if (this.startPos == 0) {
            return nodeText.substring(this.charCnt);
        }
        return nodeText.substring(0, this.startPos);
    },

    hasCharacterNodes: function() {
        return true;
    },

    isEmptySideStructure: function() {
        return (this.charCnt == 0);
    },

    normalize: function(nodeList, invalidatedNodes) {
        if (this.isInvalidatedByNormalization) {
            return;
        }
        var nodeInList;
        while (true) {
            var prevNode = this.dom.previousSibling;
            if (!prevNode || (prevNode.nodeType != 3)) {
                break;
            }
            this.dom.nodeValue = prevNode.nodeValue + this.dom.nodeValue;
            this.startPos += prevNode.nodeValue.length;
            nodeInList = nodeList.getByDom(prevNode, true);
            if (nodeInList) {
                if (this.startPos != 0) {
                    throw new Error(
                            "Trying to mormalize something that can't be normalized.");
                }
                this.startPos -= nodeInList.charCnt;
                this.charCnt += nodeInList.charCnt;
                nodeInList.isInvalidatedByNormalization = true;
                invalidatedNodes.push(nodeInList);
            }
            prevNode.parentNode.removeChild(prevNode);
            this.nodeLength = this.dom.nodeValue.length;
        }
        while (true) {
            var nextNode = this.dom.nextSibling;
            if (!nextNode || (nextNode.nodeType != 3)) {
                break;
            }
            this.dom.nodeValue += nextNode.nodeValue;
            nodeInList = nodeList.getByDom(nextNode, true);
            if (nodeInList) {
                if ((this.startPos + this.charCnt) < this.nodeLength) {
                    throw new Error(
                            "Trying to mormalize something that can't be normalized.");
                }
                this.charCnt += nodeInList.charCnt;
                nodeInList.isInvalidatedByNormalization = true;
                invalidatedNodes.push(nodeInList);
            }
            nextNode.parentNode.removeChild(nextNode);
            this.nodeLength = this.dom.nodeValue.length;
        }
    },

    /**
     * "Surrounds" the text node with a tag of the given name/attribute or adds the text
     * node to an existing "surrounding node" in a suitable way.
     * <p>
     * The method handles the possibly necessary splitting of the node accordingly.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Node} surroundingNode "surrounding node" to work on; <code>null</code> if no
     *                               "surrounding node" is yet existing
     * @param {String} tagName tag name of the "surrounding node" (if one has to be created)
     * @param {Object} attributes attributes of the "surrounding node" (if one has to be
     *                            created)
     * @return {Node} the "surrounding node" to continue working on
     */
    surround: function(context, surroundingNode, tagName, attributes) {
        var insertNode = this.dom;
        var splitNodeIndex = 0;
        var splitPoints = [ ];
        if (!this.isStartAligned()) {
            splitPoints.push(this.startPos);
            splitNodeIndex = 1;
        }
        if (!this.isEndAligned()) {
            splitPoints.push(this.startPos + this.charCnt);
        }
        if (splitPoints.length > 0) {
            // this.dom gets invalid here
            var splitNodes = CUI.rte.DomProcessor.splitTextNode(context, this.dom,
                    splitPoints);
            insertNode = splitNodes[splitNodeIndex];
        }
        if (surroundingNode != null) {
            insertNode.parentNode.removeChild(insertNode);
            surroundingNode.appendChild(insertNode);
        } else {
            surroundingNode = CUI.rte.DomProcessor.insertAsParent(context,
                    insertNode, tagName, attributes);
            this.nodeList.nodesChanged.push(surroundingNode);
        }
        this.dom = insertNode;
        this.nodeList.nodesChanged.push(insertNode);
        return surroundingNode;
    },

    /**
     * Creates a new DOM text node from the actual text of the node.
     * @param {CUI.rte.EditContext} context The edit context
     * @return {HTMLElement} The DOM text node
     */
    createNewTextNode: function(context) {
        return context.createTextNode(this.getActualTextContent());
    },

    split: function(context, outerLeft, outerRight) {
        var com = CUI.rte.Common;
        var nodeText = this.dom.nodeValue;
        if (!this.isAligned()) {
            this.dom.nodeValue = nodeText.substring(this.startPos,
                    this.startPos + this.charCnt);
            var textNode;
            if (!this.isStartAligned()) {
                textNode = context.createTextNode(nodeText.substring(0, this.startPos));
                com.addTextNode(textNode, outerLeft);
                // outerLeft.appendChild(textNode);
            }
            if (!this.isEndAligned()) {
                textNode = context.createTextNode(nodeText.substring(
                        this.startPos + this.charCnt, nodeText.length));
                com.addTextNode(textNode, outerRight);
                // outerRight.appendChild(textNode);
            }
            this.startPos = 0;
            this.charCnt = this.dom.nodeValue.length;
        }
    },

    createDump: function() {
        var content;
        var nodeText = this.dom.nodeValue;
        if (this.charCnt == 0) {
            if (this.startPos < (nodeText.length - 1)) {
                content = "(" + nodeText.substring(this.startPos, this.startPos + 1) + ")";
            } else {
                content = "(behind text)";
            }
        } else {
            content = nodeText.substring(this.startPos, this.startPos + this.charCnt);
        }
        content = content.replace(/ /g, "*");
        return "Text node (s:" + this.startPos + "/l:" + this.charCnt + "/tl:"
                + this.nodeLength + "): " + content;
    }

});

/**
 * @private
 * @static
 */
CUI.rte.NodeList.calcNewContState = function(state, stateToAdd) {
    if (state == null) {
        state = stateToAdd;
    } else if ((state == "unstyled") || (state == "single")) {
        if ((stateToAdd == "single") || (stateToAdd == "multiple")) {
            state = "multiple";
        } else if (state == "single" && (state == "unstyled")) {
            state = "multiple";
        }
    } else if (stateToAdd == "multiple") {
        state = "multiple";
    }
    return state;
};

/**
 * @class CUI.rte.DomProcessor.StructuralNode
 * @private
 * This class represents a structural node (= tag) inside a node list.
 */
CUI.rte.DomProcessor.StructuralNode = new Class({

    toString: "DomProcessor.StructuralNode",

    nodeType: CUI.rte.DomProcessor.DOM_NODE,

    parentNode: null,

    tagName: null,

    dom: null,

    nodeList: null,

    type: null,

    childNodes: null,

    /**
     * Flag if the node has been invalidated through text node normalization; is always
     * false for structural nodes
     * @private
     * @type Boolean
     */
    isInvalidatedByNormalization: false,

    construct: function(dom) {
        this.dom = dom;
        this.tagName = dom.tagName.toLowerCase();
        this.type = CUI.rte.DomProcessor.getTagType(dom);
    },

    /**
     * Executes the specified function for the node and all child nodes.
     * @param {Function} fn The function to execute. Gets the node as parameter. If it
     *        returns true, the recursion is cancelled for the sub-tree starting at this
     *        node
     */
    execRecursively: function(fn) {
        var breakRecursion = fn(this);
        if (this.childNodes && (breakRecursion !== true)) {
            var childCnt = this.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                this.childNodes[c].execRecursively(fn);
            }
        }
    },

    addChildNode: function(nodeToAdd, nodeList, index) {
        if (!this.childNodes) {
            this.childNodes = [ ];
        }
        nodeToAdd.parentNode = this;
        nodeToAdd.nodeList = nodeList;
        if (!index || (index >= this.childNodes.length)) {
            this.childNodes.push(nodeToAdd);
        } else {
            this.childNodes.splice(index, 0, nodeToAdd);
        }
    },

    removeChildNode: function(nodeToRemove) {
        var removeIndex = this.getChildIndex(nodeToRemove);
        if (removeIndex < 0) {
            return -1;
        }
        this.childNodes.splice(removeIndex, 1);
        if (this.childNodes.length == 0) {
            this.childNodes = null;
        }
        return removeIndex;
    },

    /**
     * @private
     */
    getActualParent: function() {
        return (this.parentNode ? this.parent : this.nodeList);
    },

    isStartAligned: function() {
        if (this.childNodes == null) {
            return true;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var isAligned = childToProcess.isStartAligned();
            if (!isAligned) {
                return false;
            }
        }
        return true;
    },

    isEndAligned: function() {
        if (this.childNodes == null) {
            return true;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var isAligned = childToProcess.isEndAligned();
            if (!isAligned) {
                return false;
            }
        }
        return true;
    },

    isAligned: function() {
        if (this.childNodes == null) {
            return true;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var isAligned = childToProcess.isAligned();
            if (!isAligned) {
                return false;
            }
        }
        return true;
    },

    hasContainers: function(excludeSelf) {
        var dpr = CUI.rte.DomProcessor;
        var isContainer;
        if (this.type == dpr.DYNAMIC) {
            isContainer = true;
            if (dpr.TYPE_TABLE.hasOwnProperty(this.tagName)) {
                var tagDef = dpr.TYPE_TABLE[this.tagName];
                if (tagDef && tagDef.getDynamicType) {
                    isContainer = (tagDef.getDynamicType(this.dom) == dpr.CONTAINER);
                }
            }
        } else {
            isContainer = (this.type == dpr.CONTAINER);
        }
        if ((excludeSelf !== true) && isContainer) {
            return true;
        }
        if (this.childNodes != null) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                if (this.childNodes[childIndex].hasContainers()) {
                    return true;
                }
            }
        }
        return false;
    },

    containsTag: function(tagName) {
        if (this.tagName == tagName) {
            return true;
        }
        if (this.childNodes) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = this.childNodes[childIndex];
                if (childToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                    if (childToProcess.containsTag(tagName)) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    getTags: function(tagMatcher, tags) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var matcherCnt = tagMatcher.length;
        var preventSubTreeRecursion = false;
        for (var matcherIndex = 0; matcherIndex < matcherCnt; matcherIndex++) {
            var matcher = tagMatcher[matcherIndex];
            if (matcher.extMatcher) {
                var result = matcher.extMatcher(this.dom);
                if (result.isMatching) {
                    tags.push(this);
                    preventSubTreeRecursion = result.preventRecursionIfMatching;
                    break;
                }
                if (result.preventRecursion === true) {
                    preventSubTreeRecursion = true;
                }
            } else if (matcher.matcher) {
                if (matcher.matcher(this.dom)) {
                    tags.push(this);
                    break;
                }
            } else {
                if (com.matchesTagDef(this.dom, matcher)) {
                    tags.push(this);
                    break;
                }
            }
        }
        if (this.childNodes && !preventSubTreeRecursion) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                if (this.childNodes[childIndex].nodeType == dpr.DOM_NODE) {
                    this.childNodes[childIndex].getTags(tagMatcher, tags);
                }
            }
        }
        return tags;
    },

    normalize: function(nodeList, invalidatedNodes) {
        if (this.childNodes) {
            var childCnt = this.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                this.childNodes[c].normalize(nodeList, invalidatedNodes);
            }
        }
    },

    hasContent: function() {
        if (!this.childNodes) {
            return false;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            if (childToProcess.nodeType == CUI.rte.DomProcessor.TEXT_NODE) {
                return true;
            } else {
                if (childToProcess.hasContent()) {
                    return true;
                }
            }
        }
        return false;
    },

    hasCharacterNodes: function() {
        var com = CUI.rte.Common;
        if (com.isCharacterNode(this.dom)) {
            return true;
        }
        if (this.childNodes != null) {
            var childCnt = this.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                if (this.childNodes[c].hasCharacterNodes()) {
                    return true;
                }
            }
        }
    },

    isEmptySideStructure: function(excludeSelf) {
        var com = CUI.rte.Common;
        if (!excludeSelf) {
            if (com.isCharacterNode(this.dom)) {
                return false;
            }
            if (com.isEmptyEditingBlock(this.dom)) {
                return false;
            }
        }
        if (this.childNodes != null) {
            var childCnt = this.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                if (!this.childNodes[c].isEmptySideStructure()) {
                    return false;
                }
            }
        }
        return true;
    },

    getAnchors: function(anchors) {
        var com = CUI.rte.Common;
        if ((this.tagName == "a") && !this.isEmptySideStructure(true)) {
            if (com.isAttribDefined(this.dom, "href")) {
                var anchor = {
                    "dom": this.dom,
                    "href": com.getAttribute(this.dom, com.HREF_ATTRIB)
                        || com.getAttribute(this.dom, "href")
                };
                if (this.dom.target) {
                    anchor["target"] = this.dom.target;
                }
                anchors.push(anchor);
            }
        }
        if (this.childNodes != null) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = this.childNodes[childIndex];
                if (childToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                    childToProcess.getAnchors(anchors);
                }
            }
        }
    },

    getNamedAnchors: function(anchors) {
        var anchorDef = CUI.rte.DomProcessor.checkNamedAnchor(this.dom);
        if (anchorDef) {
            anchors.push(anchorDef);
        }
        if (this.childNodes != null) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = this.childNodes[childIndex];
                if (childToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                    childToProcess.getNamedAnchors(anchors);
                }
            }
        }
    },

    getStyles: function(styles) {
        var continuousState = "unstyled";
        if (this.tagName == "span") {
            if (this.dom.className) {
                styles.push({
                    "dom": this.dom,
                    "className": this.dom.className
                });
                continuousState = "single";
            }
        }
        if (this.childNodes != null) {
            var hasText = false;
            var childrenState = null;
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = this.childNodes[childIndex];
                if (childToProcess.nodeType == CUI.rte.DomProcessor.DOM_NODE) {
                    var childState = childToProcess.getStyles(styles);
                    childrenState = CUI.rte.NodeList.calcNewContState(childrenState,
                            childState);
                } else {
                    hasText = true;
                }
            }
            if (childrenState == null) {
                childrenState = "unstyled";
            }
            if (continuousState == "unstyled") {
                if (childrenState != "unstyled") {
                    continuousState = (hasText ? "multiple" : childrenState);
                }
            } else {
                continuousState = (childrenState == "unstyled" ? continuousState
                        : "multiple");
            }
        }
        return continuousState;
    },

    /**
     * @private
     */
    createChildDomNodes: function() {
        var nodes = [ ];
        if (this.childNodes == null) {
            return nodes;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            nodes.push(this.childNodes[childIndex].dom);
        }
        return nodes;
    },

    /**
     * @private
     */
    addChangedNodes: function(root) {
        this.nodeList.nodesChanged.push(root);
        if (root.nodeType == 1) {
            var childCnt = root.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                this.addChangedNodes(root.childNodes[childIndex]);
            }
        }
    },

    /**
     * Implementation of <code>surround()</code> for structural nodes.
     * @private
     */
    surroundStructure: function(context, surroundingNode, tag, attribs, nodesAdded,
                                config) {
        var dpr = CUI.rte.DomProcessor;
        var isApplicable = true;
        if (config && config.isApplicable) {
            isApplicable = config.isApplicable(this.dom, tag, attribs);
        }
        if (!isApplicable) {
            return null;
        }
        if (this.isAligned()) {
            // if the whole structure is aligned, we can just change the structure
            if (surroundingNode != null) {
                this.dom.parentNode.removeChild(this.dom);
                surroundingNode.appendChild(this.dom);
                this.nodeList.nodesChanged.push(this.dom);
            } else {
                surroundingNode = dpr.insertAsParent(context, this.dom, tag, attribs);
                nodesAdded.push(surroundingNode);
                this.nodeList.nodesChanged.push(surroundingNode);
                this.nodeList.nodesChanged.push(this.dom);
            }
        } else {
            // if the structure is unaligned, we'll have to process the "left" and "right"
            // subtrees accordingly
            var subtreeToMove;
            if (!this.isStartAligned()) {
                // console.log("processLeftSubtree");
                subtreeToMove = this.processLeftSubtree(context);
                surroundingNode = dpr.createNode(context, tag, attribs);
                nodesAdded.push(surroundingNode);
                surroundingNode.appendChild(subtreeToMove);
                this.dom.parentNode.insertBefore(surroundingNode, this.dom.nextSibling);
                this.addChangedNodes(surroundingNode);
            }
            if (!this.isEndAligned()) {
                // console.log("processRightSubtree");
                subtreeToMove = this.processRightSubtree(context);
                surroundingNode.appendChild(subtreeToMove);
                this.addChangedNodes(subtreeToMove);
            }
        }
        return surroundingNode;
    },

    /**
     * Implementation of <code>surround()</code> for container nodes.
     * @private
     */
    surroundContainer: function(context, surroundingNode, tag, attribs, nodesAdded,
                                config) {
        var dpr = CUI.rte.DomProcessor;
        var isApplicable = true;
        if (config && config.isApplicable) {
            isApplicable = config.isApplicable(this.dom, tag, attribs);
        }
        if (!isApplicable) {
            return null;
        }
        if (this.childNodes == null) {
            return surroundingNode;
        }
        if (this.isAligned()) {
            if (!this.hasContainers(true)) {
                // if the whole structure is aligned, we can just change the structure
                var childNodes = this.createChildDomNodes();
                var nodeAdded = dpr.restructureAsChild(context, this.dom, childNodes, tag,
                        attribs);
                nodesAdded.push(nodeAdded);
                this.addChangedNodes(nodeAdded);
            } else {
                if (this.childNodes != null) {
                    var childCnt = this.childNodes.length;
                    for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                        var childToProcess = this.childNodes[childIndex];
                        childToProcess.surround(context, surroundingNode, tag, attribs,
                                nodesAdded);
                    }
                }
            }
        } else {
            surroundingNode = dpr.createNode(context, tag, attribs);
            nodesAdded.push(surroundingNode);
            // if the structure is unaligned, we'll have to process the "left" and "right"
            // subtrees accordingly
            if (!this.isStartAligned()) {
                this.processLeftContainerSubtree(context, surroundingNode, true);
                this.dom.appendChild(surroundingNode);
            }
            if (!this.isEndAligned()) {
                this.processRightContainerSubtree(context, surroundingNode, true);
                this.dom.insertBefore(surroundingNode, this.dom.firstChild);
            }
            this.addChangedNodes(surroundingNode);
        }
        return null;
    },

    /**
     * "Surrounds" the structural node (and all of its successor nodes) with a tag of the
     * given name/attribute or adds the represented structure to an existing "surrounding
     * node" in a suitable way.
     * <p>
     * The method handles the possibly necessary splitting of text nodes accordingly.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Node} surroundingNode "surrounding node" to work on; <code>null</code> if no
     *                               "surrounding node" is yet existing
     * @param {String} tag tag name of the "surrounding node" (if one has to be created)
     * @param {Object} attribs attributes of the "surrounding node" (if one has to be
     *                         created)
     * @param {Array} nodesAdded Array where all newly created nodes are recorded to
     * @return {Node} the "surrounding node" to continue working on
     */
    surround: function(context, surroundingNode, tag, attribs, nodesAdded) {
        var dpr = CUI.rte.DomProcessor;
        switch (this.type) {
            case dpr.STRUCTURE:
                surroundingNode = this.surroundStructure(context, surroundingNode, tag,
                        attribs, nodesAdded);
                break;
            case dpr.CONTAINER:
                surroundingNode = this.surroundContainer(context, surroundingNode, tag,
                        attribs, nodesAdded);
                break;
            case dpr.DYNAMIC:
                var config = null;
                var containerTag = this.tagName;
                var typeTable = dpr.TYPE_TABLE;
                if (typeTable.hasOwnProperty(containerTag)) {
                    var tagDef = typeTable[containerTag];
                    if (typeof(tagDef) == "object") {
                        config = tagDef;
                    }
                }
                var isContainer = true;
                if (config && config.getDynamicType) {
                    isContainer = (config.getDynamicType(this.dom) == dpr.CONTAINER);
                }
                if (isContainer) {
                    surroundingNode = this.surroundContainer(context, surroundingNode, tag,
                            attribs, nodesAdded, config);
                } else {
                    surroundingNode = this.surroundStructure(context, surroundingNode, tag,
                            attribs, nodesAdded, config);
                }
                break;
            case dpr.IGNORE:
                if (this.childNodes) {
                    var childCnt = this.childNodes.length;
                    for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                        var child = this.childNodes[childIndex];
                        if (child.nodeType == dpr.DOM_NODE) {
                            surroundingNode = child.surround(context, surroundingNode, tag,
                                    attribs, nodesAdded);
                        }
                    }
                }
                break;
        }
        return surroundingNode;
    },

    /**
     * This method does the necessary processing for surrounding structures that are
     * unaligned at the start ("left" subtree).
     * <p>
     * For example, <i>&lt;b&gt;Bold |text&lt;/b&gt; is great!|</i> has to be processed as
     * follows to preserve a valid tag nesting: <i>&lt;b&gt;Bold &lt;span class="test"&gt;
     * text&lt;/span&gt;&lt;/b&gt;&lt;span class="test"&gt; is great!&lt;/span&gt;</i>.
     * <p>
     * This method processes the initial "b" structure and:
     * <ul>
     * <li>Splits the "Bold text" DOM text node in two separate "Bold " and "text" nodes.
     * </li>
     * <li>Removes the "Bold text" DOM text node from the existing DOM tree and adds
     * the "Bold " text node instead.</li>
     * <li>Creates a copy of the DOM structure (the "b" node in this case).</li>
     * <li>Adds the "text" DOM text node to the copy of the "b" node).</li>
     * <li>Returns the copied DOM structure, including the split text node, so the caller
     * can use this for executing the surrounding operation.</li>
     * </ul>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} subTreeRoot (optional) root node to start with
     * @return {HTMLElement} the DOM subtree to be used for the surrounding operation
     */
    processLeftSubtree: function(context, subTreeRoot) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        // we'll create a clone of the current node as part of the subtree that actually
        // gets surrounded
        var clonedNode = this.dom.cloneNode(false);
        if (!subTreeRoot) {
            subTreeRoot = clonedNode;
        } else {
            subTreeRoot.appendChild(clonedNode);
        }
        // process child nodes
        if (this.childNodes == null) {
            return subTreeRoot;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var nodeType = childToProcess.nodeType;
            if (nodeType == dpr.DOM_NODE) {
                var dom = childToProcess.dom;
                if (com.isOneCharacterNode(dom)) {
                    // br, img, etc.: move to cloned subtrees if included in node list;
                    // keep it otherwise
                    if (childToProcess.isAligned()) {
                        dom.parentNode.removeChild(dom);
                        clonedNode.appendChild(dom);
                    }
                } else {
                    childToProcess.processLeftSubtree(context, clonedNode);
                }
            } else if (nodeType == dpr.TEXT_NODE) {
                var childText = childToProcess.dom;
                if (childToProcess.isAligned()) {
                    // here we can handle the entire node "at once"
                    var removalParent = childText.parentNode;
                    removalParent.removeChild(childText);
                    com.removeNodesWithoutContent(context, removalParent);
                    com.addTextNode(childText, clonedNode);
                } else {
                    // here we must split the text node and assign one half to the
                    // sub tree that stays the same and the other one to the sub tree
                    // that gets actually surrounded
                    clonedNode.appendChild(childToProcess.createNewTextNode(context));
                    var overflowParent = childText.parentNode;  // == this.dom
                    var overflowRef = childText.nextSibling;
                    overflowParent.removeChild(childText);
                    if (childToProcess.startPos > 0) {
                        var overflowText = childToProcess.getExcludedTextContent();
                        com.addTextNode(context.createTextNode(overflowText),
                                overflowParent, overflowRef);
                    } else {
                        com.removeNodesWithoutContent(context, overflowParent);
                    }
                }
            }
        }
        return subTreeRoot;
    },

    /**
     * This method does the necessary processing for surrounding structures that are
     * unaligned at the end ("right" subtree).
     * <p>
     * For example, <i>Let's try |some &lt;i&gt;italic| text&lt;/i&gt;.</i> has to be
     * processed as follows to preserve a valid tag nesting: <i>Let's try
     * &lt;span class="test"&gt;some &lt;/span&gt;&lt;i&gt;&lt;span class="test"&gt;italic
     * &lt;/span&gt; text&lt;/i&gt;</i>.
     * <p>
     * This method processes the "i" structure at the end and:
     * <ul>
     * <li>Splits the "italic text" DOM text node in two separate "italic " and "text"
     * nodes.
     * </li>
     * <li>Removes the "italic text" DOM text node from the existing DOM tree and adds
     * the " text" text node instead.</li>
     * <li>Creates a copy of the DOM structure (the "i" node in this case).</li>
     * <li>Adds the "italic " DOM text node to the copy of the "i" node).</li>
     * <li>Returns the copied DOM structure, including the split text node, so the caller
     * can use this for executing the surrounding operation.</li>
     * </ul>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} subTreeRoot (optional) root node to start with
     * @return {HTMLElement} the DOM subtree to be used for the surrounding operation
     */
    processRightSubtree: function(context, subTreeRoot) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var clonedNode = this.dom.cloneNode(false);
        if (!subTreeRoot) {
            subTreeRoot = clonedNode;
        } else {
            subTreeRoot.appendChild(clonedNode);
        }
        // process child nodes
        if (this.childNodes == null) {
            return subTreeRoot;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var nodeType = childToProcess.nodeType;
            if (nodeType == dpr.DOM_NODE) {
                var dom = childToProcess.dom;
                if (com.isOneCharacterNode(dom)) {
                    // br, img, etc.: move to cloned subtrees if included in node list;
                    // keep it otherwise
                    if (childToProcess.isAligned()) {
                        dom.parentNode.removeChild(dom);
                        clonedNode.appendChild(dom);
                    }
                } else {
                    childToProcess.processRightSubtree(context, clonedNode);
                }
            } else if (nodeType == dpr.TEXT_NODE) {
                var childText = childToProcess.dom;
                if (childToProcess.isAligned()) {
                    var removalParent = childText.parentNode;
                    removalParent.removeChild(childText);
                    com.removeNodesWithoutContent(context, removalParent);
                    com.addTextNode(childText, clonedNode);
                } else {
                    clonedNode.appendChild(childToProcess.createNewTextNode(context));
                    var overflowParent = childText.parentNode;
                    var overflowRef = childText.nextSibling;
                    overflowParent.removeChild(childText);
                    var actualCharCnt = childToProcess.startPos + childToProcess.charCnt;
                    if (actualCharCnt < childToProcess.nodeLength) {
                        var overflowText = childToProcess.getExcludedTextContent();
                        com.addTextNode(context.createTextNode(overflowText),
                                overflowParent, overflowRef);
                    } else {
                        com.removeNodesWithoutContent(context, overflowParent);
                    }
                }
            }
        }
        return subTreeRoot;
    },

    /**
     * This method does the necessary processing for surrounding containers that are
     * unaligned at the start ("left" subtree).
     * <p>
     * This method works similar to <code>processLeftContainer()</code>, but is
     * adjusted to work with containers correctly (other move rules apply there).
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} subTreeRoot root node to start with
     * @param {Boolean} skipContent True if the content of <code>this</code>
     *                              should be skipped, so only the content of child nodes
     *                              is getting processed
     */
    processLeftContainerSubtree: function(context, subTreeRoot, skipContent) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var baseNode;
        if (!skipContent) {
            if (this.isAligned()) {
                this.dom.parentNode.removeChild(this.dom);
                subTreeRoot.appendChild(this.dom);
                return;
            }
            baseNode = this.dom.cloneNode(false);
            subTreeRoot.appendChild(baseNode);
        } else {
            baseNode = subTreeRoot;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var nodeType = childToProcess.nodeType;
            if (nodeType == dpr.DOM_NODE) {
                childToProcess.processLeftContainerSubtree(context, baseNode);
            } else if (nodeType == dpr.TEXT_NODE) {
                var childText = childToProcess.dom;
                if (childToProcess.isAligned()) {
                    var removalParent = childText.parentNode;
                    removalParent.removeChild(childText);
                    com.removeNodesWithoutContent(context, removalParent);
                    com.addTextNode(childText, baseNode);
                } else {
                    baseNode.appendChild(childToProcess.createNewTextNode(context));
                    var overflowParent = childText.parentNode;
                    overflowParent.removeChild(childText);
                    if (childToProcess.startPos > 0) {
                        var overflowText = childText.nodeValue.substring(0,
                                childToProcess.startPos);
                        com.addTextNode(context.createTextNode(overflowText),
                                overflowParent);
                    } else {
                        com.removeNodesWithoutContent(context, overflowParent);
                    }
                }
            }
        }
    },

    /**
     * This method does the necessary processing for surrounding containers that are
     * unaligned at the end ("right" subtree).
     * <p>
     * This method works similar to <code>processRightContainer()</code>, but is
     * adjusted to work with containers correctly (other move rules apply there).
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} subTreeRoot root node to start with
     * @param {Boolean} skipContent True if the content of <code>this</code>
     *                              should be skipped, so only the content of child nodes
     *                              is getting processed
     */
    processRightContainerSubtree: function(context, subTreeRoot, skipContent) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var baseNode;
        if (!skipContent) {
            if (this.isAligned()) {
                this.dom.parentNode.removeChild(this.dom);
                subTreeRoot.appendChild(this.dom);
                return;
            }
            baseNode = this.dom.cloneNode(false);
            subTreeRoot.appendChild(baseNode);
        } else {
            baseNode = subTreeRoot;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            var nodeType = childToProcess.nodeType;
            if (nodeType == dpr.DOM_NODE) {
                childToProcess.processRightContainerSubtree(context, baseNode);
            } else if (nodeType == dpr.TEXT_NODE) {
                var childText = childToProcess.dom;
                if (childToProcess.isAligned()) {
                    var removalParent = childText.parentNode;
                    removalParent.removeChild(childText);
                    com.removeNodesWithoutContent(context, removalParent);
                    com.addTextNode(childText, baseNode);
                } else {
                    baseNode.appendChild(childToProcess.createNewTextNode(context));
                    var overflowParent = childText.parentNode;
                    overflowParent.removeChild(childText);
                    var actualCharCnt = childToProcess.startPos + childToProcess.charCnt;
                    if (actualCharCnt < childToProcess.nodeLength) {
                        var overflowText = childText.nodeValue.substring(
                                actualCharCnt, childToProcess.nodeLength);
                        com.addTextNode(context.createTextNode(overflowText),
                                overflowParent, overflowParent.firstChild);
                    } else {
                        com.removeNodesWithoutContent(context, overflowParent);
                    }
                }
            }
        }
    },

    matches: function(tag, attribs) {
        var com = CUI.rte.Common;
        if (com.isTag(this.dom, tag)) {
            if (!attribs || com.hasAttributes(attribs)) {
                return true;
            }
        }
        return false;
    },

    removeNodesByTag: function(context, tag, attribs, nodeList) {
        var dpr = CUI.rte.DomProcessor;
        if (this.childNodes) {
            var childCnt = this.childNodes.length;
            for (var c = childCnt - 1; c >= 0; c--) {
                var childToProcess = this.childNodes[c];
                if (childToProcess.nodeType == dpr.DOM_NODE) {
                    childToProcess.removeNodesByTag(context, tag, attribs, nodeList);
                }
            }
        }
        if (this.matches(tag, attribs)) {
            var overflow;
            if (!this.isStartAligned()) {
                if (this.type == dpr.STRUCTURE) {
                    overflow = this.processLeftSubtree(context);
                    if (overflow) {
                        this.dom.parentNode.insertBefore(overflow, this.dom.nextSibling);
                        this.dom = overflow;
                    }
                }
            }
            if (!this.isEndAligned()) {
                if (this.type == dpr.STRUCTURE) {
                    overflow = this.processRightSubtree(context);
                    if (overflow) {
                        this.dom.parentNode.insertBefore(overflow, this.dom);
                        this.dom = overflow;
                    }
                }
            }
            nodeList.remove(this);
        }
    },

    getUnnecessaryLinebreaks: function(container, nodesToRemove) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        if (this.tagName == "br") {
            // this node may potentially be removed if:
            // - there is a container node
            // - the linebreak is the last child node of this container
            if (container) {
                if (com.getLastChild(container) == this.dom) {
                    nodesToRemove.push(this);
                }
            }
        } else if (this.type == dpr.CONTAINER) {
            container = this.dom;
        }
        if (this.childNodes) {
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToProcess = this.childNodes[childIndex];
                if (childToProcess.nodeType == dpr.DOM_NODE) {
                    childToProcess.getUnnecessaryLinebreaks(container, nodesToRemove);
                }
            }
        }
    },

    /**
     * @private
     */
    getChildIndex: function(node) {
        if (!this.childNodes) {
            return -1;
        }
        var childCnt = this.childNodes.length;
        for (var childIndex = 0; childIndex < childCnt; childIndex++) {
            var childToProcess = this.childNodes[childIndex];
            if (childToProcess == node) {
                return childIndex;
            }
        }
        return -1;
    },

    /**
     * @private
     */
    removeChild: function(childToRemove) {
        var childIndex, childCnt;
        if (this.childNodes) {
            var removeIndex = this.getChildIndex(childToRemove);
            if (removeIndex >= 0) {
                // DOM processing
                if (!childToRemove.isInvalidatedByNormalization) {
                    CUI.rte.DomProcessor.removeWithoutChildren(childToRemove.dom);
                }
                // node list processing
                this.childNodes.splice(removeIndex, 1);
                if (childToRemove.childNodes) {
                    var childrenToMove = childToRemove.childNodes;
                    childCnt = childrenToMove.length;
                    for (childIndex = 0; childIndex < childCnt; childIndex++) {
                        var childToMove = childrenToMove[childIndex];
                        childToMove.parentNode = this;
                        this.childNodes.splice(removeIndex + childIndex, 0, childToMove);
                    }
                }
            }
        }
    },

    createDump: function(indent) {
        if (!this.childNodes) {
            return "DOM node; tag name: " + this.tagName;
        } else {
            var indentStr = "";
            if (indent) {
                for (var spc = 0; spc < indent; spc++) {
                    indentStr += "   ";
                }
            } else {
                indent = 0;
            }
            var dump = "DOM node; tag name: " + this.tagName;
            indentStr += "   ";
            var childCnt = this.childNodes.length;
            for (var childIndex = 0; childIndex < childCnt; childIndex++) {
                var childToDump = this.childNodes[childIndex];
                dump += "\n" + indentStr + childToDump.createDump(indent + 1);
            }
            return dump;
        }
    }

});