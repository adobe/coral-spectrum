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
 * @class CUI.rte.commands.Paste
 * @extends CUI.rte.commands.Command
 * @private
 */
CUI.rte.commands.Paste = new Class({

    toString: "Paste",

    extend: CUI.rte.commands.Command,

    /**
     * Pre-processing module (DOM-based)
     * @private
     * @type CUI.rte.DomCleanup
     */
    domPreProcessor: null,

    construct: function() {
        this.domPreProcessor = new CUI.rte.DomCleanup({
            "tagsToRemove": [ "font" ]
        });
    },

    pasteAsPlainText: function(execDef) {

        var hpr = CUI.rte.HtmlProcessor;
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;

        var html = execDef.value.html;
        var text = execDef.value.text;
        var context = execDef.editContext;

        // preprocess plain text if necessary
        var plainText;
        if (text) {
            plainText = text;
        } else {
            plainText = (new hpr.StripTags()).strip(html);
            plainText = hpr.stripSurroundingWhitespace(plainText, true);
            if (execDef.value.stripHtmlTags) {
                plainText = CUI.rte.Utils.htmlDecode(plainText);
                plainText = CUI.rte.Utils.stripTags(plainText);
            }
        }

        // insert paragraph by paragraph (indicated by two linefeeds); different mode if
        // paste is executed inside a list
        var pSel = sel.createProcessingSelection(context);
        var insertNode = pSel.startNode;
        var insertOffset = pSel.startOffset;
        var isListPaste = com.containsTagInPath(context, insertNode, "li");
        // normalize linefeeds beforehand
        plainText = plainText.replace(/\r\n/g, "\n");
        plainText = plainText.replace(/\r/g, "\n");
        // use String for split, as IE will remove empty items/lines if a RegExp is used ...
        var splitRegEx = (isListPaste ? "\n" : "\n\n");
        var paras = plainText.split(splitRegEx);
        var paraCnt = paras.length;
        // Gecko-Bug: when everything is selected and something is pasted, it deletes
        // everything and we will have to ensure that we have an empty paragraph we can
        // paste to
        if (com.isRootNode(context, insertNode)) {
            insertNode = dpr.ensureMinimumContent(context);
            insertOffset = null;
        }
        for (var paraIndex = 0; paraIndex < paraCnt; paraIndex++) {
            if (paraIndex > 0) {
                // insertParagraph and insertText have different interpretations for
                // insertOffset == null -> insertParagraph interprets it as "behind
                // last child node", whereas insertText interprets it as "before first
                // child node"; insertOffset can only be null if an empty line gets
                // pasted (and inserttext gets never called), as insertText will never
                // return null as a new insertOffset
                if (insertOffset == null) {
                    var firstTextChild = com.getFirstTextChild(insertNode, true);
                    if (firstTextChild && !com.isOneCharacterNode(firstTextChild)) {
                        insertNode = firstTextChild;
                    }
                    insertOffset = 0;
                }
                insertNode = dpr.insertParagraph(context, insertNode, insertOffset);
                insertOffset = null;
            }
            var lines = paras[paraIndex].split("\n");
            var lineCnt = lines.length;
            for (var lineIndex = 0; lineIndex < lineCnt; lineIndex++) {
                var line = lines[lineIndex];
                if (lineIndex > 0) {
                    var brNode = context.createElement("br");
                    // begin of node
                    if (insertOffset == 0) {
                        if (!isListPaste) {
                            insertNode.parentNode.insertBefore(brNode, insertNode);
                        }
                    // end of node
                    } else if (insertOffset >= com.getNodeCharacterCnt(insertNode)) {
                        if (!isListPaste) {
                            insertNode.parentNode.insertBefore(brNode,
                                    insertNode.nextSibling);
                            insertNode = brNode.parentNode;
                            insertOffset = com.getChildIndex(brNode) + 1;
                        }
                    // middle of node
                    } else {
                        insertNode = dpr.splitTextNode(context, insertNode,
                                insertOffset)[1];
                        if (!isListPaste) {
                            insertNode.parentNode.insertBefore(brNode, insertNode);
                        }
                        insertOffset = 0;
                    }
                }
                if (line != "") {
                    var def = dpr.insertText(context, insertNode, insertOffset, line);
                    insertNode = def.node;
                    insertOffset = def.offset;
                }
            }
        }
        return {
            "startNode": insertNode,
            "startOffset": insertOffset
        };
    },

    /**
     * Cleans up DOM by adjusting the DOM structure (remove unnecessary whitespace,
     * correcting list nesting, removing invalid tags, etc.).
     * @param {CUI.rte.EditContext} context The edit context
     * @param {CUI.rte.EditorKernel} editorKernel The editor kernel
     * @param {HTMLElement} dom Root node to clean up
     * @param {Object} pasteRules The paste rules, as configured through the plugin
     * @private
     */
    cleanUpDom: function(context, editorKernel, dom, pasteRules) {
        var com = CUI.rte.Common;
        var pasteRemovalRules = [ {
                // extended additional cleanup for paste
                "fn": function(dom) {
                    // only handle structural nodes
                    if (dom.nodeType != 1) {
                        return false;
                    }
                    // remove images that point to a file:// location
                    if (com.isTag(dom, "img")) {
                        var src = dom["src"];
                        // if a RTE-specific SRC attribute is available, use it for more
                        // accuracy
                        if (dom[com.SRC_ATTRIB]) {
                            src = dom[com.SRC_ATTRIB];
                        }
                        // don't accept images that have a file:// protocol
                        if (!src || com.strStartsWith(src, "file://")) {
                            return true;
                        }
                    }
                    return false;
                },
                "keepChildren": false
            }, {
                // additional tags to remove
                "tagName": [ /* "span" */ "font" ],
                "keepChildren": true
            }
        ];
        CUI.rte.WhitespaceProcessor.process(context, dom, pasteRemovalRules, false);
        this.domPreProcessor.prepareHtmlPaste(editorKernel, dom, pasteRules);
    },

    /**
     * Pastes table content to an existing table, correctly extending it.
     * @param {Object} execDef Execution definition
     * @private
     */
    pasteTableToTable: function(execDef) {
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        var html;
        var pastedDom = execDef.value.dom;
        var pastedTable = com.getTags(pastedDom, "table");
        if (pastedTable.length != 1) {
            this.insertHtml(execDef);
            return;
        }
        var undoHtml = context.root.innerHTML;
        var selection = execDef.selection;
        var nodeList = execDef.nodeList;
        var destTable = com.getTagInPath(context, nodeList.commonAncestor, "table");
        var pasteMatrix = new CUI.rte.TableMatrix();
        pasteMatrix.createTableMatrix(pastedTable[0]);
        pasteMatrix.createFullMatrix();
        var destMatrix = new CUI.rte.TableMatrix();
        destMatrix.createTableMatrix(destTable);
        var selectedCell = null;
        var cells = null;
        var r, c, cellToInsert, insertBefore, insertBeforeDom, pNode;
        if (selection.cellSelection) {
            cells = selection.cellSelection.cells;
            if (cells && (cells.length == 1)) {
                selectedCell = cells[0];
            }
        } else {
            // On IE, there might be a single "td" selected if the caret is placed in an
            // empty cell. This must be handled/considered beforehand.
            if (nodeList.nodes && (nodeList.nodes.length == 1)) {
                var firstNode = nodeList.nodes[0].dom;
                if (com.isTag(firstNode, com.TABLE_CELLS)
                        && (firstNode.childNodes.length == 0)) {
                    selectedCell = firstNode;
                }
            }
            if (selectedCell == null) {
                selectedCell = com.getTagInPath(context, nodeList.commonAncestor,
                        com.TABLE_CELLS);
            }
        }
        if (selectedCell) {
            // Mode 1: if only one cell is selected, the existing table is being extended
            // to fit the pasted table.
            var selectedCellDef = destMatrix.getCellDef(selectedCell);
            var pasteSize = pasteMatrix.getTableSize();
            var destSize = destMatrix.getTableSize();
            var destCol = selectedCellDef.col;
            var destRow = selectedCellDef.row;
            var extendCols = (destCol + pasteSize.cols) - destSize.cols;
            var extendRows = (destRow + pasteSize.rows) - destSize.rows;
            extendCols = (extendCols >= 0 ? extendCols : 0);
            extendRows = (extendRows >= 0 ? extendRows : 0);
            destMatrix.extendBy(context, extendCols, extendRows);
            var insertCellDom = null;
            try {
                insertCellDom = destMatrix.mergeToSingleCell(context, destCol, destRow,
                        pasteSize.cols, pasteSize.rows);
            } catch (e) {
                context.root.innerHTML = undoHtml;
                if (e.message == "Invalid table structure.") {
                    // todo implement nicely
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Paste"),
                            CUI.rte.Utils.i18n("You are trying to paste table data into an existing table.<br>As this operation would result in invalid HTML, it has been cancelled.<br>Please try to simplify the table's structure and try again."));
                    return;
                }
                throw e;
            }
            destMatrix.createTableMatrix(destTable);
            destMatrix.createFullMatrix();
            insertCellDom.parentNode.removeChild(insertCellDom);
            for (r = 0; r < pasteSize.rows; r++) {
                for (c = 0; c < pasteSize.cols; c++) {
                    cellToInsert = pasteMatrix.fullMatrix[r][c];
                    if (cellToInsert.isOrigin) {
                        insertBefore = destMatrix.getFollowUpCell(c + destCol,
                                r + destRow);
                        insertBeforeDom = (insertBefore ? insertBefore.cellDom : null);
                        pNode = destMatrix.getRowDom(r + destRow);
                        var cellDom = cellToInsert.cellRef.cellDom;
                        var helperSpan = context.createElement("span");
                        // as dynamic table handling is completely screwed up in IE, we'll
                        // have to do it the hard way here ...
                        helperSpan.innerHTML = "<table><tr><td></td></tr></table>";
                        var tdDom = CUI.rte.Query.selectNode("td:first", helperSpan);
                        var trDom = tdDom.parentNode;
                        com.replaceNode(tdDom, cellDom);
                        html = trDom.innerHTML;
                        if (!html) {
                            html = "<td>" + (com.ua.isIE ? "&nbsp;" : "<br>") + "</td>";
                        }
                        if (com.ua.isIE) {
                            com.removeAllChildren(helperSpan);
                            helperSpan.innerHTML = "<table><tr>" + html + "</tr></table>";
                            trDom = CUI.rte.Query.selectNode("tr:first", helperSpan);
                        } else {
                            trDom.innerHTML = html;
                        }
                        pNode.insertBefore(trDom.childNodes[0], insertBeforeDom);
                    }
                }
            }
        } else if (cells) {
            // Mode 2: If more than one table cell is selected, the selected cells are
            // replaced by the table to be pasted if possible (must be a rectangular cell
            // selection). The table is pasted as a nested table.
            var cellSel = destMatrix.createSelection(selection.cellSelection.cells);
            if (!cellSel.selectionProps.isRect) {
                this.editorKernel.getDialogManager().alert(
                        CUI.rte.Utils.i18n("Paste"),
                        CUI.rte.Utils.i18n("You are trying to paste table data into an non-rectangular cell selection.<br>Please choose a rectangular cell selection and try again."));
                return;
            }
            try {
                insertCellDom = destMatrix.mergeToSingleCell(context,
                        cellSel.selectionProps.minCol, cellSel.selectionProps.minRow,
                        cellSel.selectionProps.cols, cellSel.selectionProps.rows);
            } catch (e) {
                context.root.innerHTML = undoHtml;
                if (e.message == "Invalid table structure.") {
                    // todo implement nicely
                    this.editorKernel.getDialogManager().alert(
                            CUI.rte.Utils.i18n("Paste"),
                            CUI.rte.Utils.i18n("You are trying to paste table data into an existing table.<br>As this operation would result in invalid HTML, it has been cancelled.<br>Please try to simplify the table's structure and try again."));
                    return;
                }
                throw e;
            }
            com.removeAllChildren(insertCellDom);
            insertCellDom.innerHTML = pastedDom.innerHTML;
        }
    },

    /**
     * <p>Removes superfluos DIVs.</p>
     * <p>For example: &lt;div&gt;&lt;p&gt;...&lt;/p&gt;&lt;div&gt; contains a superflous
     * div that has to be discarded (and the contained paragraphs have to be moved up
     * one hierarchical level).</p>
     * @param {HTMLElement} divDom The div to preprocess
     * @private
     */
    // todo move to DomCleanup?
    preprocessDiv: function(divDom) {
        var com = CUI.rte.Common;
        var c, divChildCnt, divChild;
        // recurse first
        divChildCnt = divDom.childNodes.length;
        for (c = divChildCnt - 1; c >= 0; c--) {
            divChild = divDom.childNodes[c];
            if (com.isTag(divChild, "div")) {
                this.preprocessDiv(divChild);
            }
        }
        // handle Block-Tags that are nested in DIVs correctly
        var hasBlockTags = false;
        divChildCnt = divDom.childNodes.length;
        for (c = divChildCnt - 1; c >= 0; c--) {
            divChild = divDom.childNodes[c];
            if (com.isTag(divChild, com.BLOCK_TAGS)) {
                if (!com.hasTextChild(divChild)) {
                    divDom.removeChild(divChild);
                } else {
                    hasBlockTags = true;
                }
            }
        }
        if (hasBlockTags) {
            divChildCnt = divDom.childNodes.length;
            for (c = divChildCnt - 1; c >= 0; c--) {
                divChild = divDom.childNodes[c];
                divDom.removeChild(divChild);
                if (divDom.nextSibling) {
                    divDom.parentNode.insertBefore(divChild, divDom.nextSibling);
                } else {
                    divDom.parentNode.appendChild(divChild);
                }
            }
            divDom.parentNode.removeChild(divDom);
        } else if (!com.hasTextChild(divDom, true)) {
            // if div is without content now, remove it
            divDom.parentNode.removeChild(divDom);
        }
    },

    insertInExistingNode: function(context, insertDef, insertParent) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        var insertNode = insertDef.startNode;
        var insertOffset = insertDef.startOffset;
        // we can't use insert node and offset if we are pointing behind the end of a
        // text node that's inside a link
        if (insertOffset == sel.getLastSelectionOffset(context, insertNode, false)) {
            var checkNode = insertNode;
            while (checkNode) {
                checkNode = com.getTagInPath(context, checkNode, "a");
                if (checkNode && com.isAttribDefined(checkNode, "href")) {
                    var nn = com.getNextNode(context, checkNode);
                    var ntn = null;
                    if (nn != null) {
                        ntn = com.getNextCharacterNode(context, nn, com.EDITBLOCK_TAGS);
                    }
                    if (ntn) {
                        insertNode = ntn;
                        insertOffset = sel.getFirstSelectionOffset(context, ntn);
                    } else {
                        insertNode = checkNode.parentNode;
                        insertOffset = null;
                    }
                    break;
                }
            }
        }
        // determine node insert position (we'll use a single node as insert point and
        // move the pasted content nodes before, behind or "as child of" that node insert
        // point)
        var insertBehind, insertAsChild;
        if (insertNode.nodeType == 3) {
            if (insertOffset == 0) {
                insertBehind = false;
                insertAsChild = false;
            } else if (insertOffset == com.getNodeCharacterCnt(insertNode)) {
                insertBehind = true;
                insertAsChild = false;
            } else {
                var splitText = dpr.splitTextNode(context, insertNode, insertOffset);
                insertNode = splitText[splitText.length - 1];
                insertBehind = false;
                insertAsChild = false;
            }
        } else if (com.isOneCharacterNode(insertNode)) {
            insertBehind = (insertOffset == 0) || com.isTag(insertNode, 'br');
            insertAsChild = false;
        } else if (insertNode.nodeType == 1) {
            if ((insertOffset == undefined)
                    || (insertOffset == insertNode.childNodes.length)) {
                insertBehind = false;
                insertAsChild = true;
            } else {
                insertNode = insertNode[insertOffset];
                insertBehind = false;
                insertAsChild = true;
            }
        }
        // insert child by child
        var insertChildren = com.childNodesAsArray(insertParent);
        var insertCnt = insertChildren.length;
        for (var i = 0; i < insertCnt; i++) {
            var childToMove = insertChildren[i];
            insertParent.removeChild(childToMove);
            if (insertAsChild) {
                insertNode.appendChild(childToMove);
            } else if (insertBehind) {
                com.insertBefore(insertNode.parentNode, childToMove,
                        insertNode.nextSibling);
                insertNode = childToMove;
            } else {
                com.insertBefore(insertNode.parentNode, childToMove, insertNode);
            }
        }
        // remove duplicate structures (<b>text <b>Pasted</b> text</b> ->
        // <b>text Pasted text</b>)
        var dupCheckEnd = insertChildren[insertCnt - 1];
        var finalNode = com.getLastChild(dupCheckEnd);
        if (finalNode != null) {
            dupCheckEnd = finalNode;
        }
        var def = dpr.removeDuplicateStructures(context, insertChildren[0], dupCheckEnd);
        return {
            "startNode": def.endNode,
            "startOffset": CUI.rte.Selection.getLastSelectionOffset(context,
                    def.endNode, false)
        };
    },

    insertAsSingleLine: function(context, insertDef, insertParent) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var emptyBlock = dpr.getEmptyLine(context, insertDef);
        if (emptyBlock != null) {
            // this one is easy: simply replace the empty block
            com.removeAllChildren(emptyBlock);
            com.moveChildren(insertParent, emptyBlock);
            return {
                "startNode": emptyBlock,
                "startOffset": undefined
            };
        }
        // otherwise, insert node-by-node at the specified starting point
        return this.insertInExistingNode(context, insertDef, insertParent);
    },

    // todo move to DomCleanup?
    ensureBlockStructure: function(context, dom) {
        var com = CUI.rte.Common;
        var children = dom.childNodes;
        var childCnt = children.length;
        for (var c = childCnt - 1; c >= 0; c--) {
            var childToProcess = children[c];
            if (!com.isTag(childToProcess, com.BLOCK_TAGS)) {
                var helperPara = context.createElement("p");
                var insertRef = childToProcess.nextSibling;
                dom.removeChild(childToProcess);
                helperPara.appendChild(childToProcess);
                while (c > 0) {
                    c--;
                    var childToCheck = children[c];
                    if (com.isTag(childToCheck, com.BLOCK_TAGS)) {
                        c++;
                        break;
                    }
                    dom.removeChild(childToCheck);
                    helperPara.insertBefore(childToCheck, helperPara.firstChild);
                }
                com.insertBefore(dom, helperPara, insertRef);
                childToProcess = helperPara;
            }
        }
    },

    preprocessPastedDom: function(editorKernel, pastedDom, pasteRules) {
        var com = CUI.rte.Common;
        var context = editorKernel.getEditContext();
        // preprocess: ensure correct top-level DOM structure of pasted content
        var childCnt = pastedDom.childNodes.length;
        var children = pastedDom.childNodes;
        for (var c = childCnt - 1; c >= 0; c--) {
            var childToPreProcess = children[c];
            if (com.isTag(childToPreProcess, com.BLOCK_TAGS)) {
                if (com.isTag(childToPreProcess, "div")) {
                    this.preprocessDiv(childToPreProcess);
                }
            }
        }
        // preprocess: ensure correct block structure
        this.ensureBlockStructure(context, pastedDom);
    },

    splitExistingNode: function(context, node, offset) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        // handle begin and end of editing block correctly (must not split there)
        var editBlock = com.getTagInPath(context, node, com.EDITBLOCK_TAGS);
        if (!editBlock) {
            throw new Error("No edit block found. Cannot split node.");
        }
        var firstChild = com.getFirstChild(editBlock);
        if (firstChild == node) {
            if (offset == sel.getFirstSelectionOffset(context, node)) {
                return {
                    "insertPoint": editBlock,
                    "insertBehind": false
                };
            }
        }
        var lastChild = com.getLastChild(editBlock);
        if (lastChild == node) {
            if (offset == sel.getLastSelectionOffset(context, node, false)) {
                return {
                    "insertPoint": editBlock,
                    "insertBehind": true
                };
            }
        }
        // include one character node if necessary
        if (com.isOneCharacterNode(node)) {
            if (offset == 0) {
                node = com.getNextNode(context, node);
                offset = null;
            }
        }
        // split
        insertPoint = dpr.splitToParent(editBlock, node, offset);
        insertBehind = false;
        return {
            "insertPoint": insertPoint,
            "insertBehind": insertBehind
        };
    },

    /**
     * Inserts the pasted content as HTML. Works around IE problems regarding inserting
     * tables and ensures paste results that are independent from browser-specific
     * implementations.
     * @param {Object} execDef Execution definition
     * @private
     */
    insertHtml: function(execDef) {

        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var atomicBlocks = CUI.rte.commands.Paste.ATOMIC_PROCESSING_BLOCKS;

        var context = execDef.editContext;
        var pastedDom = execDef.value.dom;
        var pSel = sel.createProcessingSelection(context);
        // handle multi cell selection by pasting to the first selected cell
        if (pSel.cellSelection && pSel.cellSelection.cells) {
            if (pSel.cellSelection.cells.length > 0) {
                var startNode = pSel.cellSelection.cells[0];
                var startOffset = null;
                var ftn = com.getFirstTextChild(startNode, true);
                if (ftn) {
                    startNode = ftn;
                    startOffset = sel.getFirstSelectionOffset(context, ftn);
                }
                pSel.startNode = startNode;
                pSel.startOffset = startOffset;
                pSel.endNode = null;
                pSel.endOffset = null;
            }
        }
        var isAtomic, insertLoc, c;
        var insertBehind = false;
        var insertAsChild = false;

        this.preprocessPastedDom(execDef.component, pastedDom, execDef.value.pasteRules);
        var children = pastedDom.childNodes;
        var childCnt = children.length;

        if (childCnt == 0) {
            // nothing to paste at all
            return null;
        }

        var caretNode = pSel.startNode;
        var isListInsert = com.getTagInPath(context, caretNode, [ "ul", "ol" ]);
        // if we got a list as the only thing to insert, and we're inserting in a list,
        // then we'll insert list items instead of an entire list
        if (childCnt == 1) {
            if (com.isTag(children[0], [ "ul", "ol" ])) {
                if (isListInsert) {
                    pastedDom = children[0];
                    children = pastedDom.childNodes;
                    childCnt = children.length;
                }
            }
        }

        // if we're inserting into a list, we'll convert all non-list related containers
        // to list items (<p>Para</p> -> <li>Para</li>)
        if (isListInsert) {
            var blueprint = context.createElement("li");
            for (c = childCnt - 1; c >= 0; c--) {
                var child = children[c];
                if (com.isTag(child, [ "ul", "ol" ])) {
                    // take list items
                    var items = child.childNodes;
                    while (items.length > 0) {
                        var itemToMove = items[0];
                        pastedDom.insertBefore(itemToMove, child);
                    }
                    pastedDom.removeChild(child);
                } else if (!com.isTag(child, "li")) {
                    dpr.changeContainerTag(context, [ child ], blueprint, false);
                }
            }
            childCnt = children.length;
        }

        if (childCnt == 1) {
            isAtomic = com.isTag(children[0], atomicBlocks);
            if (!isAtomic) {
                return this.insertAsSingleLine(context, pSel, children[0]);
            }
        }

        // if we are inserting multiple blocks into a table, ensure that the table cell
        // contains block content, as otherwise we would destroy the table's structure
        var tableCell = com.getTagInPath(context, caretNode, [ "td", "th" ]);
        if (tableCell != null) {
            this.ensureBlockStructure(context, tableCell);
        }

        // working on a copy of the block list ...
        children = com.childNodesAsArray(pastedDom);
        // if we are pasting to an empty block which is no table cell, we will replace this
        // block with the new content
        var emptyBlock = dpr.getEmptyLine(context, pSel);
        var isFullReplace = (emptyBlock != null) && !com.isTag(emptyBlock, [ "td", "th"]);
        var isEnforcedAtomic = false;
        if (isFullReplace) {
            insertLoc = emptyBlock;
            insertBehind = false;
            isEnforcedAtomic = true;
        }
        if ((emptyBlock != null) && !isFullReplace) {
            // Gecko will have a "br" node, which is recognized as "empty block" correctly;
            // get rid of it, as we'll replace the entire content
            com.removeAllChildren(emptyBlock);
            insertLoc = emptyBlock;
            insertAsChild = true;
            isEnforcedAtomic = true;
        }
        var finalSelection = null;
        // insert block-by-block
        for (c = 0; c < childCnt; c++) {
            var blockToProcess = children[c];
            isAtomic = com.isTag(blockToProcess, atomicBlocks) || isEnforcedAtomic;
            var isLastChild = (c == (childCnt - 1));
            var insertDef, splitDef, insertNode, insertOffset;
            var insertBlock = false;
            if ((c == 0) && !isAtomic) {
                // first block & non-atomic & no paste on empty block: append paste
                // block to existing content
                insertDef = this.insertInExistingNode(context, pSel, blockToProcess);
                insertNode = insertDef.startNode;
                insertOffset = insertDef.startOffset;
                splitDef = this.splitExistingNode(context, insertNode, insertOffset);
                insertLoc = splitDef.insertPoint;
                insertBehind = splitDef.insertBehind;
            } else if ((c == 0) && isAtomic) {
                // first block & atomic & no paste on empty block: split existing
                // content + insert in-between
                if (!insertAsChild) {
                    // handle paste to an empty cell correctly
                    splitDef = this.splitExistingNode(context, pSel.startNode,
                            pSel.startOffset);
                    insertLoc = splitDef.insertPoint;
                    insertBehind = splitDef.insertBehind;
                }
                insertBlock = true;
            } else if (isLastChild && !isAtomic && !isFullReplace) {
                // last block & non-atomic & no paste on empty block: prepend paste block
                // to existing content
                if (insertBehind) {
                    if (insertLoc.nextSibling) {
                        insertNode = com.getFirstTextChild(insertLoc.nextSibling, true);
                    } else {
                        // we're EOT/EOB; so we'll just insert the entire block
                        insertNode = null;
                        insertBlock = true;
                    }
                } else {
                    insertNode = com.getFirstTextChild(insertLoc, true);
                }
                if (insertNode != null) {
                    insertOffset = sel.getFirstSelectionOffset(context, insertNode);
                    insertDef = {
                        "startNode": insertNode,
                        "startOffset": insertOffset
                    };
                    insertDef = this.insertInExistingNode(context, insertDef,
                            blockToProcess);
                    finalSelection = insertDef;
                }
            } else {
                // others: insert behind previous block
                insertBlock = true;
            }
            if (insertBlock) {
                if (insertBehind) {
                    com.insertBefore(insertLoc.parentNode, blockToProcess,
                        insertLoc.nextSibling);
                    insertLoc = blockToProcess;
                } else if (insertAsChild) {
                    insertLoc.appendChild(blockToProcess);
                } else {
                    com.insertBefore(insertLoc.parentNode, blockToProcess, insertLoc);
                }
                // handle empty blocks correctly
                if (com.ua.isIE) {
                    dpr.fixEmptyEditingBlockIE(context, blockToProcess);
                } else {
                    var contentNodes = com.getCharacterNodes(blockToProcess);
                    if (contentNodes == 0) {
                        var placeholder = dpr.createEmptyLinePlaceholder(context, false);
                        if (placeholder) {
                            var placeholderParent = com.getFirstChild(blockToProcess);
                            if (placeholderParent == null) {
                                placeholderParent = blockToProcess;
                            }
                            placeholderParent.appendChild(placeholder);
                        }
                    }
                }
                // don't forget to calculate new caret position on last container
                if (isLastChild) {
                    finalSelection = {
                        "startNode": blockToProcess,
                        "startOffset": null
                    };
                }
            }
        }
        if (isFullReplace) {
            emptyBlock.parentNode.removeChild(emptyBlock);
        }
        return finalSelection;
    },

    /**
     * Executes pasting HTML code to the current selection.
     * @param {Object} execDef Execution definition
     * @private
     */
    pasteAsWordHtml: function(execDef) {

        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;

        var context = execDef.editContext;

        /*
        var startTc = new Date().getTime();
        */

        // cleanup first
        var pastedDom = execDef.value.dom;
        this.cleanUpDom(context, execDef.component, pastedDom, execDef.value.pasteRules);

        // detect if we're pasting a table into another table
        var pSel;
        var isTablePaste = com.containsTag(pastedDom, "table");
        var nodeList = execDef.nodeList;
        var isTableSelection = com.containsTagInPath(context, nodeList.commonAncestor,
                "table");
        if (isTableSelection && isTablePaste) {
            try {
                this.pasteTableToTable(execDef);
            } catch (e) {
                if (e.message != "Invalid paste structure.") {
                    throw e;
                }
                // todo alert user
            }
        } else {
            // pasting outside an existing table or pasting content not containing a table
            // into an existing table
            pSel = this.insertHtml(execDef);
        }

        /*
        var endTc = new Date().getTime();
        com.ieLog("paste: " + (endTc - startTc) + "ms", true);
        */

        var bookmark;
        if (pSel) {
            bookmark = sel.bookmarkFromProcessingSelection(context, pSel);
        } else {
            bookmark = sel.createSelectionBookmark(context);
        }
        // IE sometimes generates nested blocks, which we'll have to resolve to
        // keep the code consistent. For example: Given an existing content of
        // <h1>Heading</h1><p>Paragraph</p>. Select all. Paste something like <p>para1</p>
        // <p>para2</p>. This will unexpectedly result in <h1><p>para1</p><p>para2</p></h1>.
        // todo check: this should not be necessary anymore, as paste implementation has changed and should handle this differently
        // CUI.rte.DomProcessor.cleanupNestedBlocks(context.root);
        execDef.bookmark = bookmark;
    },

    isCommand: function(cmdStr) {
        if (cmdStr.toLowerCase() == "paste") {
            return true;
        }
    },

    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_BOOKMARK;
    },

    execute: function(execDef) {

        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var pcmd = CUI.rte.commands.Paste;
        var context = execDef.editContext;
        var value = execDef.value;
        var mode = value.mode;
        var pasteRange = value.pasteRange;

        // use browser's paste command if necessary
        if (mode == pcmd.MODE_BROWSER) {
            try {
                context.doc.execCommand("paste", false, null);
            } catch (e) {
                throw new Error("Cannot paste.");
            }
            return;
        }

        try {
            // clear selection content
            execDef.component.selectQualifiedRangeBookmark(context, pasteRange);
            var selection = sel.getSelection(context);
            var isCollapsed = (com.ua.isOldIE ? sel.isCollapsed(pasteRange.bookmark)
                    : selection.isCollapsed) && !pasteRange.cells;
            if (!isCollapsed) {
                var pSel = execDef.component.createQualifiedSelection(context);
                var cells = (pSel.cellSelection ? pSel.cellSelection.cells : undefined);
                if (!cells || cells.length == 0) {
                    CUI.rte.commands.Delete.executeDelete(context);
                } else {
                    for (var c = 0; c < cells.length; c++) {
                        var cell = cells[c];
                        com.removeAllChildren(cell);
                        dpr.ensureEmptyLinePlaceholders(context, cell);
                    }
                }
            }

            // provide correct selection/nodeList parameters
            execDef.selection = execDef.component.createQualifiedSelection(context);
            execDef.nodeList = dpr.createNodeList(context, execDef.selection);

            var finalPasteSelection;
            switch (mode) {
                case pcmd.MODE_PLAINTEXT:
                    finalPasteSelection = this.pasteAsPlainText(execDef);
                    break;
                case pcmd.MODE_WORDHTML:
                    finalPasteSelection = this.pasteAsWordHtml(execDef);
                    break;
                default:
                    throw new Error("Invalid paste mode: " + mode);
                    break;
            }

            var bookmark = execDef.bookmark;
            if (finalPasteSelection) {
                bookmark = sel.bookmarkFromProcessingSelection(context,
                        finalPasteSelection);
            }
            execDef.bookmark = bookmark;

            return {
                "calleeRet": {
                    "bookmark": bookmark,
                    "geckoEnsureCaretVisibility": true
                }
            };
        } catch (e) {
            try {
                console.log(e);
            } catch (e) {
                // ignore
            }
        }
        return {
                "calleeRet": {
                    "bookmark": execDef.bookmark,
                    "geckoEnsureCaretVisibility": true
                }
            };
    }

});

/**
 * Paste mode: use browser's paste implementation (should usually not be used, as this may
 * introduce unwanted markup)
 */
CUI.rte.commands.Paste.MODE_BROWSER = "browser";

/**
 * Paste mode: plain text inserts
 */
CUI.rte.commands.Paste.MODE_PLAINTEXT = "plaintext";

/**
 * Paste mode: Word-compatible HTML inserting
 */
CUI.rte.commands.Paste.MODE_WORDHTML = "wordhtml";

/**
 * Block nodes that require atomic pasting
 */
CUI.rte.commands.Paste.ATOMIC_PROCESSING_BLOCKS = [ "table", "ul", "ol" ];


// register command
CUI.rte.commands.CommandRegistry.register("paste", CUI.rte.commands.Paste);