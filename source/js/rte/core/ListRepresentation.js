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

// todo synchronize DOM & data model
// ListRepresentation and ListRepresenation.Item should get suitable processing methods
// that handle both data model and DOM manipulation, which would make the code much more
// readable as currently is (and could improve performance, as there was no more need
// to recreate the representation from DOM after processing it)

/**
 * @class CUI.rte.ListRepresentation
 * @private
 * <p>This class implements an abstract representation of a list for easier processing
 * &amp; editing (especially hierarchical management, such as indenting and outdenting
 * multiple list items and ensuring correct nesting of multi-level lists).</p>
 * <p>Note that most processing methods of this class do not adjust the data model (but only
 * the DOM), hence the list representation has to be recreated before another processing is
 * executed on the represented list.</p>
 * @constructor
 * Creates a new ListRepresentation.
 * @param {CUI.rte.ListRepresentation} parentList The parent list (if any)
 * @param {Boolean} isCorrectHierarchy (optional) True if the list is correctly nested
 *        (defaults to true)
 */
CUI.rte.ListRepresentation = new Class({

    toString: "ListRepresentation",

    /**
     * Parent list (if available)
     * @type CUI.rte.ListRepresentation
     * @private
     */
    parentList: null,

    /**
     * The DOM node representing the list.
     * @type HTMLElement
     * @private
     */
    listDom: null,

    /**
     * Array containing the items of the list.
     * @type CUI.rte.ListRepresentation.Item[]
     * @private
     */
    items: null,

    /**
     * Flag if the list is correctly included in the list hierarchy (correctly nested)
     * @type Boolean
     * @private
     */
    isCorrectHierarchy: false,

    construct: function(parentList, isCorrectHierarchy) {
        this.parentList = parentList;
        this.items = [ ];
        this.isCorrectHierarchy = isCorrectHierarchy !== false;
    },

    /**
     * Creates a list representation from the specified list DOM object.
     * @param {HTMLElement} listDom The DOM element of the list from which the list
     *        representation is to be build; must be of type "ul" or "ol"
     */
    fromList: function(listDom) {
        var com = CUI.rte.Common;
        this.items.length = 0;
        this.listDom = listDom;
        var children = listDom.childNodes;
        var childCnt = children.length;
        var validItem = null;
        for (var c = 0; c < childCnt; c++) {
            var childToProcess = children[c];
            if (com.isTag(childToProcess, com.LIST_TAGS)) {
                // detected an invalidly nested list
                if (validItem == null) {
                    validItem = new CUI.rte.ListRepresentation.Item(this, this.listDom);
                    this.items.push(validItem);
                }
                var subList = new CUI.rte.ListRepresentation(this, false);
                subList.fromList(childToProcess);
                validItem.addSubList(subList);
            } else if (com.isTag(childToProcess, "li")) {
                var item = new CUI.rte.ListRepresentation.Item(this, childToProcess);
                this.items.push(item);
                item.detectSubLists();
                validItem = item;
            }
        }
    },

    /**
     * <p>Creates a list representation of the top-level list the specified item is part of.
     * </p>
     * <p>Note that actually the top-level list is used - not the list that actually
     * contains the list item if the item is part of a nested list.</p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} itemDom The DOM element representing the list item (must be of
     *        type "li")
     */
    fromItem: function(context, itemDom) {
        var listDom = CUI.rte.ListUtils.getTopListForItem(context, itemDom);
        if (listDom == null) {
            throw new Error("Could not detect list node.");
        }
        this.fromList(listDom);
    },

    /**
     * <p>Gets the {@link CUI.rte.ListRepresentation.Item Item} that represents the
     * specified (DOM) list item.</p>
     * <p>The item is looked up recursively - you can always use the top-most list
     * representation to get a list item that is contained in a nested list.</p>
     * @param {HTMLElement} dom The DOM list item (must be of type "li")
     * @return {CUI.rte.ListRepresentation.Item} The Item representation; null if there
     *         is no suitable
     */
    getItemByDom: function(dom) {
        var itemCnt = this.items.length;
        for (var i = 0; i < itemCnt; i++) {
            var theItem = this.items[i].getItemByDom(dom);
            if (theItem != null) {
                return theItem;
            }
        }
        return null;
    },

    /**
     * <p>Gets the index (position in this list) of the specified
     * {@link CUI.rte.ListRepresentation.Item Item} in the represented list.</p>
     * <p>Note that this method does not work resursively, i.e. you must call it on the
     *{@link CUI.rte.ListRepresentation ListRepresentation} that actually contains the
     * specified {@link CUI.rte.ListRepresentation.Item Item}.</p>
     * @param {CUI.rte.ListRepresentation.Item} item The item
     * @return {Number} The index (list position) of the specified list item
     */
    getItemIndex: function(item) {
        return CUI.rte.Common.arrayIndex(this.items, item);
    },

    /**
     * <p>Removes the specified {@link CUI.rte.ListRepresentation.Item Item} from this
     * list.</p>
     * <p>Note that this method removes the item from the list representation only, keeping
     * the DOM as it is.</p>
     * @param {CUI.rte.ListRepresentation.Item} itemToRemove The item to remove
     */
    removeItem: function(itemToRemove) {
        var com = CUI.rte.Common;
        var removeIndex = com.arrayIndex(this.items, itemToRemove);
        if (removeIndex >= 0) {
            this.items.splice(removeIndex, 1);
        }
    },

    /**
     * Inserts the specified item after the specified reference item.
     * @param {CUI.rte.ListRepresentation.Item} itemToInsert The item to be inserted
     * @param {CUI.rte.ListRepresentation.Item} refItem The reference item; if null,
     *        the item is inserted at the beginning of the item list
     */
    insertItemAfter: function(itemToInsert, refItem) {
        if (refItem == null) {
            this.items.splice(0, 0, itemToInsert);
            return;
        }
        var refIndex = this.getItemIndex(refItem);
        if (refIndex < 0) {
            throw new Error("Invalid insert item; reference must be in 'this' list.");
        }
        this.items.splice(refIndex + 1, 0, itemToInsert);
    },

    /**
     * <p>Removes the specified {@link CUI.rte.ListRepresentation nested list} from this
     * list.</p>
     * <p>Note that this method removes the nested list from the list representation only,
     * keeping the DOM as it is.</p>
     * @param {CUI.rte.ListRepresentation} subList The nested list to remove
     */
    removeSubList: function(subList) {
        var itemCnt = this.items.length;
        var isRemoved = false;
        for (var i = 0; (i < itemCnt) && !isRemoved; i++) {
            var listsToCheck = this.items[i].subLists;
            var listCnt = listsToCheck.length;
            for (var l = 0; l < listCnt; l++) {
                if (listsToCheck[l] == subList) {
                    listsToCheck.splice(l, 1);
                    isRemoved = true;
                    break;
                } else {
                    isRemoved = listsToCheck[l].removeSubList(subList);
                    if (isRemoved) {
                        break;
                    }
                }
            }
        }
        return isRemoved;
    },

    /**
     * Indents the specified DOM list item.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement} itemDom The list item to indent (must be of type "li")
     */
    indent: function(context, itemDom) {
        var item = this.getItemByDom(itemDom);
        if (item == null) {
            throw new Error("Could not determine item to indent.");
        }
        item.indent(context);
    },

    /**
     * Outdents the specified DOM list items.
     * @param {CUI.rte.EditContext} context The edit context
     * @param {HTMLElement[]} items The list items to outdent (must be of type "li")
     */
    outdent: function(context, items) {
        var com = CUI.rte.Common;
        // outdent each item
        var itemCnt = items.length;
        for (var i = 0; i < itemCnt; i++) {
            var item = this.getItemByDom(items[i]);
            if (item == null) {
                throw new Error("Could not determine item to outdent.");
            }
            var itemsToExclude = item.outdent(context);
            for (var e = 0; e < itemsToExclude.length; e++) {
                var itemDom = itemsToExclude[e].itemDom;
                var itemIndex = com.arrayIndex(items, itemDom);
                if (itemIndex > i) {
                    items.splice(itemIndex, 1);
                    itemCnt--;
                }
            }
        }
    },

    /**
     * <p>Ensures the correct hierarchical nesting.</p>
     * <p>This method may be used to convert lists that handle nested lists similar to
     * list items (&lt;li&gt;...&lt;/li&gt;&lt;ul&gt;...&lt;/ul&gt;) instead of appending
     * them to an existing list item (&lt;li&gt;...&lt;ul&gt;...&lt;/ul&gt;&lt;/li&gt;).
     * </p>
     * @param {CUI.rte.EditContext} context The edit context
     */
    ensureHierarchy: function(context) {
        var itemCnt = this.items.length;
        for (var i = 0; i < itemCnt; i++) {
            var itemToProcess = this.items[i];
            itemToProcess.ensureHierarchy(context);
        }
    },

    /**
     * Flattens the represented list to a series of paragraphs.
     * @param {CUI.rte.EditContext} context The edit context
     */
    flatten: function(context, topLevelList) {
        if (topLevelList == null) {
            topLevelList = CUI.rte.ListUtils.getTopListForItem(context, this.listDom);
        }
        var itemCnt = this.items.length;
        for (var i = 0; i < itemCnt; i++) {
            var itemToProcess = this.items[i];
            itemToProcess.flatten(context, topLevelList);
        }
        this.listDom.parentNode.removeChild(this.listDom);
    },

    /**
     * Creates a "plain text" version of the current state of the list representation.
     * @param {Number} indent (optional) Indentation level
     */
    createDump: function(indent) {
        if (indent == null) {
            indent = 0;
        }
        var i;
        var indentStr = "";
        for (i = 0; i < indent; i++) {
            indentStr += "   ";
        }
        var dump = indentStr + "List, type " + this.listDom.tagName + "; "
                + (this.isCorrectHierarchy ? "correct hierarchy" : "invalid hierarchy")
                + "\n";
        dump += indentStr + " parent: " + (this.parentList ? "yes" : "no") + "\n";
        for (i = 0; i < this.items.length; i++) {
            dump += indentStr + " Item #" + (i + 1) + ":\n";
            dump += this.items[i].createDump(indent + 1);
        }
        return dump;
    }

});

/**
 * @class CUI.rte.ListRepresentation.Item
 * @private
 * <p>This class represents a single list item as part of a
 * {@link CUI.rte.ListRepresentation ListRepresentation}.</p>
 * <p>Note that most processing methods of this class do not adjust the data model (but only
 * the DOM), hence the list representation has to be recreated before another processing is
 * executed on the represented list.</p>
 * @constructor
 * Creates a new ListRepresentation.Item.
 * @param {CUI.rte.ListRepresentation} list The list the item is contained
 * @param {HTMLElement} itemDom DOM representation of the list item (must be of type "li")
 */
CUI.rte.ListRepresentation.Item = new Class({

    toString: "ListRepresentation.Item",

    /**
     * Back reference to the list the item is contained
     * @type CUI.rte.ListRepresentation
     * @private
     */
    list: null,

    /**
     * DOM element that contains the list item
     * @type HTMLElement
     * @private
     */
    itemDom: null,

    /**
     * Subordinate list (if any)
     * @type CUI.rte.ListRepresentation[]
     * @private
     */
    subLists: null,

    construct: function(list, itemDom) {
        this.list = list;
        this.itemDom = itemDom;
        this.subLists = [ ];
    },

    /**
     * <p>Adds the specified nested list explicitly.</p>
     * <p>Note that the specified list is not inspected for further nested lists. Use
     * {@link #detectSubLists} explicitly on the specified list.</P>
     * @param {CUI.rte.ListRepresentation} subList The list representation to add
     */
    addSubList: function(subList) {
        this.subLists.push(subList);
    },

    /**
     * Inspects the list item for nested lists recursively and adjusts the item
     * representation accordingly.
     * @param {HTMLElement} subItem (optional) The DOM element to check; defaults to the
     *        DOM element representing the list item
     */
    detectSubLists: function(subItem) {
        var com = CUI.rte.Common;
        if (!subItem) {
            subItem = this.itemDom;
        }
        if (com.isTag(subItem, com.LIST_TAGS)) {
            var subList = new CUI.rte.ListRepresentation(this.list, true);
            subList.fromList(subItem);
            this.subLists.push(subList);
        } else if (subItem.nodeType == 1) {
            var childCnt = subItem.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                this.detectSubLists(subItem.childNodes[c]);
            }
        }
    },

    /**
     * <p>Gets the item representation of the specified DOM list item.</p>
     * <p>Note that this method works recursively, considering nested lists.</p>
     * @param {HTMLElement} dom DOM list item (must be of type "li")
     */
    getItemByDom: function(dom) {
        if (this.itemDom == dom) {
            return this;
        }
        var slCnt = this.subLists.length;
        for (var l = 0; l < slCnt; l++) {
            var item = this.subLists[l].getItemByDom(dom);
            if (item != null) {
                return item;
            }
        }
        return null;
    },

    /**
     * Gets the item that is located before "this" on the same hierarchical list level.
     * @return {CUI.rte.ListRepresentation.Item} The preceding list item; null if "this"
     *         is the first item of the list
     */
    getPreviousItem: function() {
        var subItems = this.list.items;
        var itemCnt = subItems.length;
        for (var i = 0; i < itemCnt; i++) {
            var item = subItems[i];
            if (item == this) {
                if (i > 0) {
                    return subItems[i - 1];
                }
                return null;
            }
        }
        return null;
    },

    /**
     * "Flattens" the child nodes of the item by moving them on the same hierarchical
     * level, directly following the item.
     * @private
     */
    flattenChildNodes: function() {
        var slCnt = this.subLists.length;
        var pNode = this.itemDom.parentNode;
        var refNode = this.itemDom.nextSibling;
        for (var l = 0; l < slCnt; l++) {
            var subList = this.subLists[l];
            var subItems = subList.items;
            for (var i = 0; i < subItems.length; i++) {
                var item = subItems[i];
                this.list.insertItemAfter(item, this);
                item.list = this.list;
                var itemPNode = item.itemDom.parentNode;
                itemPNode.removeChild(item.itemDom);
                if (itemPNode.childNodes.length == 0) {
                    itemPNode.parentNode.removeChild(itemPNode);
                }
                if (refNode) {
                    pNode.insertBefore(item.itemDom, refNode);
                } else {
                    pNode.appendChild(item.itemDom);
                }
            }
        }
        this.subLists.length = 0;
    },

    /**
     * Indents the item.
     * @param {CUI.rte.EditContext} context The edit context
     */
    indent: function(context) {
        var prevItem = this.getPreviousItem();
        if (prevItem == null) {
            return;
        }
        // if the previous item has a sub list, we will have to append the indented item
        // to it
        var slCnt = prevItem.subLists.length;
        var itemIndex = this.list.getItemIndex(this);
        this.list.items.splice(itemIndex, 1);
        if (slCnt > 0) {
            var subList = prevItem.subLists[slCnt - 1];
            this.itemDom.parentNode.removeChild(this.itemDom);
            subList.listDom.appendChild(this.itemDom);
            subList.items.push(this);
            this.list = subList;
            this.flattenChildNodes();
            return;
        }
        // we cannot use a previousSibling's sub list, so we'll have to create a new
        // list
        var newList = context.createElement(this.list.listDom.tagName);
        prevItem.itemDom.appendChild(newList);
        this.itemDom.parentNode.removeChild(this.itemDom);
        newList.appendChild(this.itemDom);
        var newSubList = new CUI.rte.ListRepresentation(prevItem.list, true);
        prevItem.addSubList(newSubList);
        newSubList.listDom = newList;
        newSubList.items.push(this);
        this.list = newSubList;
        this.flattenChildNodes();
    },

    /**
     * Outdents the item.
     * @param {CUI.rte.EditContext} context The edit context
     */
    outdent: function(context) {
        var com = CUI.rte.Common;
        var lut = CUI.rte.ListUtils;
        var slCnt, s, slItemCnt, itemToMove, listDom;
        var outdentedChildren = [ ];
        var listLevel = com.getListLevel(context, this.itemDom);
        if (listLevel == 1) {
            // first level items must be converted to paragraphs; sub-lists must be moved
            // out of the newly created paragraph
            slCnt = this.subLists.length;
            if (slCnt > 0) {
                var nextSib = this.itemDom.nextSibling;
                var newList;
                var insertRef;
                if (nextSib) {
                    newList = nextSib.parentNode;
                    insertRef = nextSib;
                } else {
                    listDom = this.list.listDom;
                    newList = context.createElement(listDom.tagName);
                    com.insertBefore(listDom.parentNode, newList, listDom.nextSibling);
                    insertRef = null;
                }
                for (s = 0; s < slCnt; s++) {
                    var slItems = this.subLists[s].items;
                    slItemCnt = slItems.length;
                    if (slItemCnt > 0) {
                        itemToMove = slItems[0].itemDom;
                        outdentedChildren.push(slItems[0]);
                        com.insertBefore(newList, itemToMove, insertRef);
                        var subListDom = slItems[0].list.listDom;
                        if (slItemCnt == 1) {
                            subListDom.parentNode.removeChild(subListDom);
                        } else {
                            itemToMove.appendChild(subListDom);
                        }
                    }
                }
            }
            var changedDom = lut.convertListItem(context, this.itemDom, "p");
            listDom = this.list.listDom;
            if (listDom.childNodes.length == 0) {
                listDom.parentNode.removeChild(listDom);
            }
            if (changedDom.nextSibling
                    && com.isTag(changedDom.nextSibling, com.LIST_TAGS)) {
                this.list.fromList(changedDom.nextSibling);
            }
        } else {
            // items on other levels have to be inserted behind the item of the sub list
            // they are currently contained; the sub list has to be removed if no more
            // items are contained after executing the outdent
            listDom = this.list.listDom;
            var parentItemDom = listDom.parentNode;
            var insertItem = this.list.parentList.getItemByDom(parentItemDom);
            var insertItemIndex = insertItem.list.getItemIndex(insertItem) + 1;
            var insertRefDom = parentItemDom.nextSibling;
            var pNode = parentItemDom.parentNode;
            this.itemDom.parentNode.removeChild(this.itemDom);
            if (insertRefDom) {
                pNode.insertBefore(this.itemDom, insertRefDom);
            } else {
                pNode.appendChild(this.itemDom);
            }
            var itemIndex = this.list.getItemIndex(this);
            var itemsToMove = [ ];
            for (var m = itemIndex + 1; m < this.list.items.length; m++) {
                itemsToMove.push(this.list.items[m]);
            }
            this.list.removeItem(this);
            if (this.list.items.length == 0) {
                listDom.parentNode.removeChild(listDom);
                this.list.parentList.removeSubList(this.list);
            }
            this.list = this.list.parentList;
            if (insertItemIndex < this.list.items.length) {
                this.list.items.splice(insertItemIndex, 0, this);
            } else {
                this.list.items.push(this);
            }
            // if the list item has a nested list with more than one item, indent all
            // but the first item to get the closest possible result
            slCnt = this.subLists.length;
            if (slCnt > 0) {
                for (s = 0; s < slCnt; s++) {
                    var subList = this.subLists[s];
                    slItemCnt = subList.items.length;
                    if (slItemCnt > 0) {
                        outdentedChildren.push(subList.items[0]);
                    }
                    if (slItemCnt > 1) {
                        var itemsToIndent = [ ];
                        for (var i = 1; i < slItemCnt; i++) {
                            itemsToIndent.push(subList.items[i]);
                        }
                        for (i = 0; i < (slItemCnt - 1); i++) {
                            itemsToIndent[i].indent(context);
                        }
                    }
                }
            }
            // if the new previousSibling has child lists, we'll have to insert them
            // as child lists of ourself.
            if (itemsToMove.length > 0) {
                var insertListDom = null;
                var insertSubList = null;
                if (this.subLists.length == 0) {
                    insertListDom = context.createElement(this.list.listDom.tagName);
                    this.itemDom.appendChild(insertListDom);
                    insertSubList = new CUI.rte.ListRepresentation(this.list, true);
                    insertSubList.listDom = insertListDom;
                    this.subLists.push(insertSubList);
                } else {
                    insertSubList = this.subLists[this.subLists.length - 1];
                    insertListDom = insertSubList.listDom;
                }
                for (m = 0; m < itemsToMove.length; m++) {
                    itemToMove = itemsToMove[m];
                    var moveDom = itemToMove.itemDom;
                    pNode = moveDom.parentNode;
                    pNode.removeChild(moveDom);
                    itemToMove.list.removeItem(itemToMove);
                    if (pNode.childNodes.length == 0) {
                        pNode.parentNode.removeChild(pNode);
                        itemToMove.list.parentList.removeSubList(itemToMove.list);
                    }
                    itemToMove.list = insertSubList;
                    insertListDom.appendChild(moveDom);
                    insertSubList.items.push(itemToMove);
                }
            }
        }
        return outdentedChildren;
    },

    /**
     * Ensures the correct nesting of lists that are subordinate to this list.
     * @param {CUI.rte.EditContext} context The edit context
     */
    ensureHierarchy: function(context) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var listCnt = this.subLists.length;
        for (var l = 0; l < listCnt; l++) {
            var subListToProcess = this.subLists[l];
            if (!subListToProcess.isCorrectHierarchy) {
                var listItem = this.itemDom;
                if (com.isTag(listItem, com.LIST_TAGS)) {
                    listItem = context.createElement("li");
                    listItem.appendChild(context.createTextNode(dpr.NBSP));
                    this.itemDom.appendChild(listItem);
                    this.itemDom = listItem;
                }
                var listToMove = subListToProcess.listDom;
                listToMove.parentNode.removeChild(listToMove);
                listItem.appendChild(listToMove);
                subListToProcess.isCorrectHierarchy = true;
            }
            subListToProcess.ensureHierarchy(context);
        }
    },

    /**
     * Flattens the represented item to a paragraph. The paragraph is inserted before the
     * specified top-level list.
     * @param {CUI.rte.EditContext} context The edit context
     */
    flatten: function(context, topLevelList) {
        var com = CUI.rte.Common;
        // flatten item
        var paraNode = context.createElement("p");
        topLevelList.parentNode.insertBefore(paraNode, topLevelList);
        var childCnt = this.itemDom.childNodes.length;
        for (var c = childCnt - 1; c >= 0; c--) {
            var itemToMove = this.itemDom.childNodes[c];
            if (!com.isTag(itemToMove, [ "ol", "ul" ])) {
                itemToMove.parentNode.removeChild(itemToMove);
                paraNode.insertBefore(itemToMove, paraNode.firstChild);
            }
        }
        // flatten sub lists
        var listCnt = this.subLists.length;
        for (var l = 0; l < listCnt; l++) {
            this.subLists[l].flatten(context, topLevelList);
        }
        this.subLists.length = 0;
        // remove item from DOM
        this.itemDom.parentNode.removeChild(this.itemDom);
    },

    /**
     * Flattens a single list item by adding its content to the prevoius sibling or parent
     * list item as a new line.
     * @param {CUI.rte.EditContext} context The edit context
     */
    flattenToParent: function(context) {
        var com = CUI.rte.Common;
        var listDom = this.list.listDom;
        var auxRoot = CUI.rte.DomProcessor.getAuxRootNode(context, listDom);
        if (auxRoot == listDom.parentNode) {
            // use outdent if we are "unlisting" a first-level list item
            this.outdent(context);
            return;
        }
        this.flattenChildNodes();
        var childCnt;
        var itemDomRef = null;
        var insertRef = null;
        if (this.itemDom.previousSibling) {
            // prefer previous sibling - but will have to search for a suitable insert
            // point (which is the last item in the last nested list, or a non-list node)
            itemDomRef = this.itemDom.previousSibling;
            while (true) {
                childCnt = itemDomRef.childNodes.length;
                if (childCnt == 0) {
                    break;
                }
                if (!com.isTag(itemDomRef.childNodes[childCnt - 1], com.LIST_TAGS)) {
                    break;
                }
                // get last item of list
                itemDomRef = itemDomRef.childNodes[childCnt - 1].lastChild;
            }
        } else {
            // use parent item if no suitable previous sibling exists
            itemDomRef = com.getParentNode(context, listDom);
            insertRef = listDom;
        }
        // move
        itemDomRef.insertBefore(context.createElement("br"), insertRef);
        var children = this.itemDom.childNodes;
        childCnt = children.length;
        for (var c = childCnt - 1; c >= 0; c--) {
            var childToMove = children[c];
            childToMove.parentNode.removeChild(childToMove);
            itemDomRef.insertBefore(childToMove, insertRef);
            insertRef = childToMove;
        }
        // remove self from DOM & data model
        listDom.removeChild(this.itemDom);
        if (listDom.childNodes.length == 0) {
            this.list.parentList.removeSubList(this.list);
            listDom.parentNode.removeChild(listDom);
        }
        this.list.removeItem(this);
        this.list = null;
    },

    /**
     * Creates a "plain text" version of the current state of the list item representation.
     * @param {Number} indent (optional) Indentation level
     */
    createDump: function(indent) {
        var com = CUI.rte.Common;
        if (indent == null) {
            indent = 0;
        }
        var i;
        var indentStr = "";
        for (i = 0; i < indent; i++) {
            indentStr += "   ";
        }
        var dump = com.dumpNodeRecursively(this.itemDom, indent);
        for (var l = 0; l < this.subLists.length; l++) {
            dump += indentStr + " Sub list #" + (l + 1) + ":\n";
            dump += this.subLists[l].createDump(indent + 1);
        }
        return dump;
    }

});