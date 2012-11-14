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
 * @class CUI.rte.ListUtils
 * @static
 * @private
 * The ListUtils provides utility functions for handling lists.
 */
CUI.rte.ListUtils = function() {

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    return {

        // --- selection-related stuff -----------------------------------------------------

        /**
         * <p>Postprocesses a list of selected items that was created from a
         * {@link CUI.rte.NodeList NodeList}, using the
         * {@link CUI.rte.NodeList#getTags getTags} method.</p>
         * <p>This is required to remove parent items that are included in the node list
         * (as they are actually part of the DOM structure), but are not really selected
         * (instead, one or more nested list item is selected).</p>
         * @param {Object[]} listItems Array containing list items, as created by
         *        {@link CUI.rte.NodeList#getTags}
         */
        postprocessSelectedItems: function(listItems) {
            var nodeCnt = listItems.length;
            for (var n = nodeCnt - 1; n >= 0; n--) {
                var node = listItems[n];
                if (!node.isAncestor) {
                    var mustRemove = true;
                    var children = node.childNodes;
                    if (children) {
                        var childCnt = children.length;
                        for (var c = 0; c < childCnt; c++) {
                            var childDom = children[c].dom;
                            if (!com.isTag(childDom, com.LIST_TAGS)) {
                                mustRemove = false;
                                break;
                            }
                        }
                    } else {
                        // empty list tags must also be kept (may occur on IE)
                        mustRemove = false;
                    }
                    if (mustRemove) {
                        listItems.splice(n, 1);
                    }
                }
            }
        },


        // --- processing-related stuff ----------------------------------------------------

        /**
         * <p>Creates a new list from the specified list of edit blocks.</p>
         * <p>This method handles auxiliary root correctly by adding their content as
         * separate lists.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement[]} blockList List with edit blocks to be used for creating
         *        the list
         * @param {String} listType The list type ("ul", "ol")
         */
        createList: function(context, blockList, listType) {
            var lut = CUI.rte.ListUtils;
            // preprocess if a table cell is reported as the only edit block
            if ((blockList.length == 1) && com.isTag(blockList[0], com.TABLE_CELLS)) {
                var tempBlock = context.createElement("div");
                com.moveChildren(blockList[0], tempBlock);
                blockList[0].appendChild(tempBlock);
                blockList[0] = tempBlock;
            }
            // simplify block list by using lists instead of their respective list items
            var blockCnt = blockList.length;
            for (var b = 0; b < blockCnt; b++) {
                if (com.isTag(blockList[b], "li")) {
                    var listNode = blockList[b].parentNode;
                    blockList[b] = listNode;
                    for (var b1 = 0; b1 < b; b1++) {
                        if (blockList[b1] == listNode) {
                            blockList[b] = null;
                            break;
                        }
                    }
                }
            }
            // common list creation
            var listDom = context.createElement(listType);
            blockCnt = blockList.length;
            for (b = 0; b < blockCnt; b++) {
                var blockToProcess = blockList[b];
                if (blockToProcess) {
                    var mustRecurse = com.isTag(blockToProcess, dpr.AUXILIARY_ROOT_TAGS);
                    if (!mustRecurse) {
                        if (listDom.childNodes.length == 0) {
                            // first, insert the list
                            blockToProcess.parentNode.insertBefore(listDom, blockToProcess);
                        }
                        if (!com.isTag(blockToProcess, com.LIST_TAGS)) {
                            // normal blocks
                            var listItemDom = context.createElement("li");
                            listDom.appendChild(listItemDom);
                            com.moveChildren(blockToProcess, listItemDom, 0, true);
                            blockToProcess.parentNode.removeChild(blockToProcess);
                        } else {
                            // pre-existing list
                            com.moveChildren(blockToProcess, listDom, 0, true);
                            blockToProcess.parentNode.removeChild(blockToProcess);
                        }
                    } else {
                        // create list recursively
                        var subBlocks = [ ];
                        var sbCnt = blockToProcess.childNodes.length;
                        for (var c = 0; c < sbCnt; c++) {
                            var subBlock = blockToProcess.childNodes[c];
                            if (com.isTag(subBlock, com.EDITBLOCK_TAGS)) {
                                subBlocks.push(subBlock);
                            } else if (com.isTag(com.BLOCK_TAGS)) {
                                // todo nested tables
                            }
                        }
                        if (subBlocks.length == 0) {
                            subBlocks.push(blockToProcess);
                        }
                        lut.createList(context, subBlocks, listType);
                        // start a new list if a non-listable tag has been encountered
                        listDom = context.createElement(listType);
                    }
                }
            }
            // check if we can join adjacent lists
            var prevSib = listDom.previousSibling;
            if (prevSib && com.isTag(prevSib, listType)) {
                com.moveChildren(listDom, prevSib, 0, true);
                listDom.parentNode.removeChild(listDom);
                listDom = prevSib;
            }
            var nextSib = listDom.nextSibling;
            if (nextSib && com.isTag(nextSib, listType)) {
                com.moveChildren(nextSib, listDom, 0, true);
                nextSib.parentNode.removeChild(nextSib);
            }
        },

        /**
         * Converts the specified list item (which must be part of a top-level list) to
         * a edit block of the specified type.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} liDom The list item to be converted
         * @param {String} tagName The edit block tag to convert the item to
         * @param {Object} attribs Attribute definition for the edit block tag
         */
        convertListItem: function(context, liDom, tagName, attribs) {
            var itemIndex = com.getChildIndex(liDom);
            var originList = liDom.parentNode;
            var itemCnt = originList.childNodes.length;
            var pNode = dpr.createNode(context, tagName, attribs);
            com.moveChildren(liDom, pNode);
            originList.removeChild(liDom);
            if (itemIndex == 0) {
                // first item - can be simply removed without splitting the list in two
                originList.parentNode.insertBefore(pNode, originList);
            } else if (itemIndex == (itemCnt - 1)) {
                // last item
                originList.parentNode.insertBefore(pNode, originList.nextSibling);
            } else {
                // split list
                var splitList = originList.cloneNode(false);
                com.moveChildren(originList, splitList, itemIndex);
                originList.parentNode.insertBefore(splitList, originList.nextSibling);
                originList.parentNode.insertBefore(pNode, splitList);
            }
            return pNode;
        },

        /**
         * <p>Gets the list item (if available) the specified DOM element is contained in.
         * </p>
         * <p>If the specified DOM element is a list item, the DOM element (and not its
         * "super item") is returned.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element to determine the list item for
         * @return {HTMLElement} The respective list item; null if the DOM element is not
         *         contained in a list item
         */
        getItemForDom: function(context, dom) {
            while (dom) {
                if (com.isTag(dom, "li")) {
                    return dom;
                }
                dom = com.getParentNode(context, dom);
            }
            return null;
        },

        /**
         * <p>Gets the list the specified list item is contained in.</p>
         * <p>The specified list item may be any DOM element of the corresponding list item.
         * If a list is specified as list item, the "super list" (if available) is returned.
         * </p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} itemDom The list item to determine the corresponding list
         *        for; null if the DOM element is not contained in a list
         */
        getListForItem: function(context, itemDom) {
            itemDom = CUI.rte.ListUtils.getItemForDom(context, itemDom);
            var listDom = (itemDom ? com.getParentNode(context, itemDom) : null);
            if (listDom && !com.isTag(listDom, com.LIST_TAGS)) {
                listDom = null;
            }
            return listDom;
        },

        /**
         * Gets the top-level list the specified DOM element is part of.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {HTMLElement} The top-level list element; null if the specified DOM
         *         element is not part of a list
         */
        getTopListForItem: function(context, dom) {
            var listDom = null;
            while (dom) {
                if (com.isTag(dom, com.LIST_TAGS)) {
                    listDom = dom;
                }
                dom = com.getParentNode(context, dom);
            }
            return listDom;
        },

        /**
         * Gets the nesting level of the specified DOM element.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {Number} Nesting level (0 for top-level list; -1 if the specified DOM
         *         element is not part of a list
         */
        getNestingLevel: function(context, dom) {
            var nestingLevel = -1;
            while (dom) {
                if (com.isTag(dom, com.LIST_TAGS)) {
                    nestingLevel++;
                }
                dom = com.getParentNode(context, dom);
            }
            return nestingLevel;
        },

        /**
         * Checks if the specified DOM element is part of a top-level list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The DOM element
         * @return {Boolean} True if the DOM element is part of a top-level list
         */
        isTopLevelList: function(context, dom) {
            return (CUI.rte.ListUtils.getNestingLevel(context, dom) == 0);
        },

        /**
         * Checks if the specified DOM element is (part of) the very first list item of its
         * top-level list.
         * @param {CUI.rte.EditContext} context
         * @param {HTMLElement} dom The DOM element to check
         * @return {Boolean} true if the specified DOM element is the very first list item
         *         of its top-level list
         */
        isFirstListItem: function(context, dom) {
            var lut = CUI.rte.ListUtils;
            var tll = lut.getTopListForItem(context, dom);
            if (tll == null) {
                return false;
            }
            var itemDom = lut.getItemForDom(context, dom);
            return (tll.childNodes.length > 0) && (tll.childNodes[0] == itemDom);
        },

        /**
         * Checks if the specified DOM element is (part of) the very last list item of its
         * top-level list.
         * @param {CUI.rte.EditContext} context
         * @param {HTMLElement} dom The DOM element to check
         * @return {Boolean} true if the specified DOM element is the very last list item
         *         of its top-level list
         */
        isLastListItem: function(context, dom) {
            var lut = CUI.rte.ListUtils;
            var tll = lut.getTopListForItem(context, dom);
            var lastListNode = com.getLastChild(tll);
            if (lastListNode == null) {
                return false;
            }
            var lastItemNode = com.getTagInPath(context, lastListNode, "li");
            return (lastItemNode == dom);
        },

        /**
         * Moves the content of the specified list item to the specfied destination
         * element.
         * @param {HTMLElement} srcItem The list item to move content from
         * @param {HTMLElement} destDom The DOM element to move content to
         */
        moveItemContent: function(srcItem, destDom) {
            while (srcItem.childNodes.length > 0) {
                var childToMove = srcItem.childNodes[0];
                srcItem.removeChild(childToMove);
                destDom.appendChild(childToMove);
            }
        },

        /**
         * Checks if the specified list item has content other than nested lists.
         * @param {HTMLElement} itemDom The DOM element representing the list item
         * @return {Boolean} True if the specified list item has content other than
         *         nested lists
         */
        hasItemContent: function(itemDom) {
            var childCnt = itemDom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var childToProcess = itemDom.childNodes[c];
                if (!com.isTag(childToProcess, com.LIST_TAGS)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * <p>Checks if the specified list is empty.</p>
         * <p>A list is considered empty if it is actually empty or all items and nested
         * lists are empty.</p>
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} listDom The list's DOM element
         * @return {Boolean} True if the specified list is empty
         */
        isListEmpty: function(context, listDom) {
            if (listDom.childNodes.length == 0) {
                return true;
            }
            var itemCnt = listDom.childNodes.length;
            for (var i = 0; i < itemCnt; i++) {
                var itemToCheck = listDom.childNodes[i];
                if (com.isTag(itemToCheck, "li")) {
                    var childCnt = itemToCheck.childNodes.length;
                    for (var c = 0; c < childCnt; c++) {
                        var nodeToCheck = itemToCheck.childNodes[c];
                        if (com.isTag(nodeToCheck, com.LIST_TAGS)) {
                            var isListEmpty = CUI.rte.ListUtils.isListEmpty(context,
                                    nodeToCheck);
                            if (!isListEmpty) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                    // IE might have empty items that count as content, in that case
                    // the list is not really empty
                    if ((com.ua.isIE && childCnt == 0)) {
                        return false;
                    }
                }
            }
            return true;
        },

        /**
         * Checks if the specified list item is empty (has no content or only empty
         * nested lists).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} dom The list item to check
         */
        isItemEmpty: function(context, dom) {
            var lut = CUI.rte.ListUtils;
            dom = lut.getItemForDom(context, dom);
            var childCnt = dom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var childToProcess = dom.childNodes[c];
                if (com.isTag(childToProcess, com.LIST_TAGS)) {
                    if (!lut.isListEmpty(context, childToProcess)) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        },

        /**
         * Cleans up the specified list by removing empty list items (and empty nested
         * lists as well).
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} listDom The list to be cleaned
         * @param {Boolean} removeHelperAttribs True if helper attributes on list items have
         *        also to be removed
         */
        cleanUpList: function(context, listDom, removeHelperAttribs) {
            var lut = CUI.rte.ListUtils;
            var itemCnt = listDom.childNodes.length;
            for (var i = itemCnt - 1; i >= 0; i--) {
                var itemToProcess = listDom.childNodes[i];
                var childCnt = itemToProcess.childNodes.length;
                for (var c = childCnt - 1; c >= 0; c--) {
                    var childToProcess = itemToProcess.childNodes[c];
                    if (com.isTag(childToProcess, com.LIST_TAGS)) {
                        lut.cleanUpList(context, childToProcess, removeHelperAttribs);
                    }
                }
                if (lut.isItemEmpty(context, itemToProcess)
                        && (com.isAttribDefined(itemToProcess, lut.REMOVAL_MARKER)
                            || com.isAttribDefined(itemToProcess, lut.CLONED_MARKER))) {
                    listDom.removeChild(itemToProcess);
                } else if (removeHelperAttribs) {
                    com.removeAttribute(itemToProcess, lut.REMOVAL_MARKER);
                    com.removeAttribute(itemToProcess, lut.CLONED_MARKER);
                }
            }
            if (lut.isListEmpty(context, listDom)) {
                listDom.parentNode.removeChild(listDom);
            }
        },

        /**
         * Checks if both specified DOM elements are lists and both determine the same
         * list type.
         * @param {HTMLElement} dom1 First DOM element; may be null
         * @param {HTMLElement} dom2 Second DOM element; may be null
         * @return {Boolean} True if both elements are lists and the list type is the same
         */
        isSameType: function(dom1, dom2) {
            if (dom1 && dom2) {
                if (com.isTag(dom1, com.LIST_TAGS)) {
                    return (dom1.tagName.toLowerCase() == dom2.tagName.toLowerCase());
                }
            }
            return false;
        },

        /**
         * Gets all nested lists of the specified item if available.
         * @param {HTMLElement} itemDom The item's DOM element
         * @return {HTMLElement[]} List with all nested lists
         */
        getNestedLists: function(itemDom) {
            var nestedLists = [ ];
            var childCnt = itemDom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                var childToCheck = itemDom.childNodes[c];
                if (com.isTag(childToCheck, com.LIST_TAGS)) {
                    nestedLists.push(childToCheck);
                }
            }
            return nestedLists;
        },

        /**
         * Removes the specified item from the list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement[]} items Array of items to unlist; items must be adjacent
         *        (but may be on different hierarchical levels)
         * @param {Boolean} keepStructure True if the list structure should be kept if
         *        list splitting is required
         */
        unlistItems: function(context, items, keepStructure) {
            var lut = CUI.rte.ListUtils;
            var itemCnt = items.length;
            if (itemCnt == 0) {
                return;
            }
            var firstItem = items[0];
            var lastItem = items[itemCnt - 1];
            var tll = lut.getTopListForItem(context, firstItem.parentNode);
            var isFirstItemOfList = lut.isFirstListItem(context, firstItem);
            var isLastItemOfList = lut.isLastListItem(context, lastItem);
            var splitList = null;
            var insertRef = tll;
            for (var i = 0; i < itemCnt; i++) {
                // move item content to paragraph & insert paragraph after top level list
                var para = context.createElement("p");
                var item = items[i];
                com.setAttribute(item, lut.REMOVAL_MARKER, "true");
                var childCnt = item.childNodes.length;
                for (var c = childCnt - 1; c >= 0; c--) {
                    var childToMove = item.childNodes[c];
                    if (!com.isTag(childToMove, com.LIST_TAGS)) {
                        item.removeChild(childToMove);
                        com.insertBefore(para, childToMove, para.firstChild);
                    }
                }
                if (isFirstItemOfList) {
                    com.insertBefore(tll.parentNode, para, tll);
                    splitList = tll;
                } else {
                    com.insertBefore(tll.parentNode, para, insertRef.nextSibling);
                    insertRef = para;
                }
                dpr.fixEmptyEditingBlockIE(context, para);
            }
            var listToClone = lastItem.parentNode;
            // detect content that has to be additionally moved to the split list
            var listIndex = com.getChildIndex(listToClone);
            var elementsToMove = [ ];
            if (lut.getNestingLevel(context, listToClone) > 0) {
                var listParent = listToClone.parentNode;
                for (var m = listIndex + 1; m < listParent.childNodes.length; m++) {
                    elementsToMove.push(listParent.childNodes[m]);
                }
            }
            // split list if necessary
            if (!isLastItemOfList && !isFirstItemOfList) {
                var deepestItem = null;
                var isEmptyDeepestItem = false;
                while (listToClone) {
                    var clonedList = listToClone.cloneNode(false);
                    var clonedItem = context.createElement("li");
                    com.setAttribute(clonedItem, lut.CLONED_MARKER, "true");
                    if (deepestItem == null) {
                        deepestItem = clonedItem;
                        if (lastItem.childNodes.length == 0) {
                            isEmptyDeepestItem = true;
                        } else {
                            lut.moveItemContent(lastItem, deepestItem);
                        }
                    }
                    clonedList.appendChild(clonedItem);
                    if (splitList) {
                        clonedItem.appendChild(splitList);
                    }
                    splitList = clonedList;
                    listToClone = com.getParentNode(context, listToClone);
                    if (com.isTag(listToClone, "li")) {
                        listToClone = listToClone.parentNode;
                    } else {
                        listToClone = null;
                    }
                }
                // move content detected beforehand to split list
                var moveTarget = deepestItem.parentNode;
                for (m = 0; m < elementsToMove.length; m++) {
                    var domToMove = elementsToMove[m];
                    domToMove.parentNode.removeChild(domToMove);
                    com.insertBefore(moveTarget.parentNode, domToMove,
                            moveTarget.nextSibling);
                    moveTarget = domToMove;
                }
                // insert the split list
                com.insertBefore(para.parentNode, splitList, para.nextSibling);
                var copyItem = lastItem;
                var copyDest = deepestItem;
                while (copyItem) {
                    var childIndex = com.getChildIndex(copyItem);
                    var copyList = copyItem.parentNode;
                    var destList = copyDest.parentNode;
                    for (c = copyList.childNodes.length - 1; c > childIndex ; c--) {
                        var itemToMove = copyList.childNodes[c];
                        copyList.removeChild(itemToMove);
                        insertRef = (destList.childNodes.length > 1
                                ? destList.childNodes[1] : null);
                        com.insertBefore(destList, itemToMove, insertRef);
                    }
                    if ((copyDest == deepestItem) && isEmptyDeepestItem) {
                        destList.removeChild(copyDest);
                    }
                    copyItem = com.getParentNode(context, copyList);
                    if (!com.isTag(copyItem, "li")) {
                        copyItem = null;
                    }
                    copyDest = com.getParentNode(context, destList);
                }
            }
            // remove item & now-empty (nested) lists
            lut.cleanUpList(context, tll, false);
            if ((splitList != null) && (splitList != tll)) {
                lut.cleanUpList(context, splitList, false);
            }
            if (!isLastItemOfList && (splitList != null)) {
                // post-process structure to get a valid list again
                var itemToProcess = com.getFirstChild(splitList);
                itemToProcess = com.getTagInPath(context, itemToProcess, "li");
                if (itemToProcess) {
                    if (lut.isTopLevelList(context, itemToProcess)
                            && lut.isItemEmpty(context, itemToProcess)
                            && com.isAttribDefined(itemToProcess, lut.CLONED_MARKER)) {
                        // simply remove empty item if top-level (& clean up afterwards)
                        itemToProcess.parentNode.removeChild(itemToProcess);
                        lut.cleanUpList(context, splitList, true);
                    } else if (keepStructure) {
                        // keeping the list's structure intact: insert &nbsp; for all
                        // in-between hierarchical levels
                        while (itemToProcess) {
                            if (!lut.hasItemContent(itemToProcess)) {
                                com.insertBefore(itemToProcess,
                                        context.createTextNode(dpr.NBSP),
                                        itemToProcess.firstChild);
                            }
                            itemToProcess = com.getParentNode(context, itemToProcess);
                            while (itemToProcess && !com.isTag(itemToProcess, "li")) {
                                itemToProcess = com.getParentNode(context,
                                        itemToProcess);
                            }
                            lut.cleanUpList(context, splitList, true);
                        }
                    } else {
                        // adjusting the split list's structure - the algorithm used here
                        // works as follows:
                        // 1. start with the list that contains the first "real" list item
                        //    (may be nested deep in the hierarchy) -> source list.
                        // 2. insert the items of that list at the beginning of the
                        //    top-level list -> dest list
                        // 3. process the parent list of the previous source list
                        // 4. a) insert that parent list to the last item (shallow) of the
                        //       previous source list (that is now a top-level item, if
                        //       source and destination list are on different nesting levels
                        //    b) Merge source and destination list items otherwise
                        // 5. repeat 3 and 4 until the source list has reached nesting level
                        //    0 or both source and destination have reached the same
                        //    nesting level (which is step 4b)
                        // 6. clean up leftovers
                        var listsToClean = [ splitList ];
                        insertRef = splitList;
                        var deepestItemList = lut.getListForItem(context, itemToProcess);
                        var deepestListParent = lut.getItemForDom(context, deepestItemList);
                        if (deepestListParent == null) {
                            return;
                        }
                        var listToMove, l, moveDestList, mustMove;
                        var listsToMove = lut.getNestedLists(deepestListParent);
                        while (insertRef) {
                            var listCnt = listsToMove.length;
                            var baseListToMove = listsToMove[0];
                            var srcLevel = lut.getNestingLevel(context, baseListToMove);
                            // #5
                            if (srcLevel == 0) {
                                break;
                            }
                            var destLevel = lut.getNestingLevel(context, insertRef);
                            var parentList = lut.getListForItem(context, baseListToMove);
                            if (srcLevel == destLevel) {
                                // #4b/#5
                                moveDestList = (com.isTag(insertRef, "li")
                                        ? insertRef.parentNode : insertRef);
                                for (l = 0; l < listCnt; l++) {
                                    listToMove = listsToMove[l];
                                    mustMove = false;
                                    if (l == (listCnt - 1)) {
                                        if (lut.isSameType(listToMove, moveDestList)) {
                                            mustMove = true;
                                        }
                                    }
                                    if (mustMove) {
                                        com.moveChildren(listToMove, moveDestList, 0, true);
                                    } else {
                                        listToMove.parentNode.removeChild(listToMove);
                                        com.insertBefore(moveDestList.parentNode,
                                            listToMove, moveDestList.nextSibling);
                                        moveDestList = listToMove;
                                    }
                                }
                                break;
                            } else {
                                var lastList = listsToMove[listCnt - 1];
                                lastItem = lastList.childNodes[
                                        lastList.childNodes.length - 1];
                                if (com.isTag(insertRef, "li")) {
                                    // #4a
                                    for (l = 0; l < listCnt; l++) {
                                        listToMove = listsToMove[l];
                                        listToMove.parentNode.removeChild(listToMove);
                                        insertRef.appendChild(listToMove);
                                    }
                                } else {
                                    // #2
                                    moveDestList = insertRef;
                                    for (l = 0; l < listCnt; l++) {
                                        listToMove = listsToMove[l];
                                        mustMove = false;
                                        if (l == (listCnt - 1)) {
                                            if (lut.isSameType(listToMove, moveDestList)) {
                                                mustMove = true;
                                            }
                                        }
                                        if (mustMove) {
                                            com.moveChildren(listToMove, moveDestList);
                                        } else {
                                            listToMove.parentNode.removeChild(listToMove);
                                            com.insertBefore(moveDestList.parentNode,
                                                listToMove, moveDestList);
                                            listsToClean.push(listToMove);
                                        }
                                    }
                                }
                                // set insert ref to the last shallow item
                                insertRef = lastItem;
                            }
                            // #3 (use parent list(s))
                            if (lut.getNestingLevel(context, parentList) == 0) {
                                listsToMove = [ parentList ];
                            } else {
                                listsToMove = lut.getNestedLists(lut.getItemForDom(context,
                                        parentList));
                            }
                        }
                        // #6
                        for (l = 0; l < listsToClean.length; l++) {
                            lut.cleanUpList(context, listsToClean[l], true);
                        }
                    }
                }
            }
        },

        /**
         * Checks if the specified node/offset (as provided by a processing selection)
         * determines the position before a nested list.
         * @param {CUI.rte.EditContext} context The edit context
         * @param {HTMLElement} node The node
         * @param {Number} offset The offset
         * @return {Boolean} True if the specified node/offset determines the position
         *         before a nested list
         */
        isPositionBeforeNestedList: function(context, node, offset) {
            var editBlock = dpr.getEditBlock(context, node);
            if (!com.isTag(editBlock, "li")) {
                return false;
            }
            if (node.nodeType == 3) {
                var charCnt = com.getNodeCharacterCnt(node);
                if (charCnt > 0) {
                    if (offset < charCnt) {
                        return false;
                    }
                }
            } else if (com.isOneCharacterNode(node)) {
                if (offset != 0) {
                    return false;
                }
            }
            var nextChild = com.getNextNode(context, node);
            return com.isTag(nextChild, com.LIST_TAGS)
                    && (dpr.getEditBlock(context, nextChild) == editBlock);
        },

        /**
         * Marker attribute for empty list items that might be removed on clean up after
         * unlisting
         * @private
         * @type String
         */
        REMOVAL_MARKER: CUI.rte.Common.RTE_ATTRIB_PREFIX + "_invalid",

        /**
         * Marker attribute for list items that were cloned when an original list has been
         * split during unlisting (an) item(s)
         * @private
         * @type String
         */
        CLONED_MARKER: CUI.rte.Common.RTE_ATTRIB_PREFIX + "_cloned"

    };

}();