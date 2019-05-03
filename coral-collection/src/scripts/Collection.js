/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import listToArray from './listToArray';

/**
 Unique id used to idenfity the collection.
 
 @private
 */
let nextID = 0;

/**
 Attribute used to identify the items of a collection.
 
 @private
 */
const COLLECTION_ID = 'coral-collection-id-';

/**
 Selector used to determine if nested items should be allowed.
 
 @private
 */
const SCOPE_SELECTOR = ':scope > ';

/** @private */
function getTagSelector(tag, nativeTag) {
  return nativeTag ? `${nativeTag}[is="${tag}"]` : tag;
}

/**
 Helper function used to determine if the item should be filtered. If the filter is <code>undefined</code>, then the
 item will pass the filter.
 
 @param {HTMLElement} item
 The item that should be filtered.
 @param {Function} filter
 Function used to filter the item
 
 @returns {Boolean} true if the item passes the filter, otherwise false.
 
 @private
 */
function filterItem(item, filter) {
  return typeof filter !== 'function' || filter(item);
}

/**
 Collection provides a standardized way to manipulate items in a component.
 */
class Collection {
  /**
   @param {HTMLElement} options.host
   The element that hosts the collection.
   @param {String} options.itemTagName
   The tag name of the elements that constitute a collection item.
   @param {String} options.itemBaseTagName
   The optional base tag name of the elements that constitute a collection item. This is required for elements that
   extend native elements, like Button.
   @param {String} [options.itemSelector]
   Optional, derived from itemTagName and itemBaseTagName by default. Used to query the host element for its
   collection items.
   @param {HTMLElement} [options.container]
   Optional element that wraps the collection. Defines where the new items will be added when <code>add</code> method
   is called. Is the same as options.host by default.
   @param {CollectionFilter} [options.filter]
   Optional function used to filter the results.
   @param {CollectionOnItemAdded} [options.onItemAdded]
   Function called once an item is added to the DOM. If the Collection has been configured to handle the items
   automatically, the callback will be called once the collection detects that the item has been added to the DOM and
   not synchronously with <code>add()</code>.
   @param {CollectionOnItemRemoved} [options.onItemRemoved]
   Function called once an item is removed from the DOM. If the Collection has been configured to handle the items
   automatically, the callback will be called once the collection detects that the item has been removed from the DOM
   not synchronously with <code>add()</code>.
   @param {CollectionOnChange} [options.onCollectionChange]
   Function called after there has been a change in the collection. This allows components to handle state changes
   after an item(s) has been added or removed. This callback will only be called if the Collection is configured to
   handle the items automatically.
   is <code>true</code>.
   */
  constructor(options) {
    options = options || {};
  
    // we create an unique collection identifier
    this._id = nextID++;
  
    this._host = options.host;
    this._itemTagName = options.itemTagName;
    this._itemBaseTagName = options.itemBaseTagName;
    this._itemSelector = options.itemSelector || getTagSelector(this._itemTagName, this._itemBaseTagName);
  
    // the container where the new items are added
    this._container = options.container || this._host;
    this._filter = options.filter;
  
    // internal variable to determine if collection events will be handled internally
    this._handleItems = false;
  
    // we provide support for the :scope selector and swap it for an id
    if (this._itemSelector && this._itemSelector.indexOf(SCOPE_SELECTOR) === 0) {
      this._container.id = this._container.id || COLLECTION_ID + this._id;
      // we create a special selector to make sure that the items are direct children of the container. given that
      // :scope is not fully supported by all browsers, we use an id to query
      this._allItemsSelector = this._itemSelector.replace(SCOPE_SELECTOR, `#${this._container.id} > `);
    
      // we remove the :scope from the selector to be able to use it to determine if the item matches the collection
      this._itemSelector = this._itemSelector.replace(SCOPE_SELECTOR, '');
      // in case they match, we enable this optimization
      if (this._itemSelector === this._itemTagName) {
        this._useItemTagName = this._itemSelector.toUpperCase();
      }
    }
    // live collections are not supported when nested items is used
    else {
      this._allItemsSelector = this._itemSelector;
    
      // live collections can only be used when a tagname is used to query the items
      if (this._container && this._allItemsSelector === this._itemTagName) {
        this._liveCollection = true;
        this._useItemTagName = this._allItemsSelector.toUpperCase();
      }
    }
  
    this._onItemAdded = options.onItemAdded;
    this._onItemRemoved = options.onItemRemoved;
    this._onCollectionChange = options.onCollectionChange;
  }
  
  /**
   Number of items inside the Collection.
   
   @type {Number}
   @default 0
   */
  get length() {
    return this.getAll().length;
  }
  
  /**
   Adds an item to the Collection. The item can be either a <code>HTMLElement</code> or an Object with the item
   properties. If the index is not provided the element appended to the end. If <code>options.onItemAdded</code> was
   provided, it will be called after the element is added from the DOM.
   
   @param {HTMLElement|Object} item
   The item to add to the Collection.
   @param {HTMLElement} [insertBefore]
   Existing item used as a reference to insert the new item before. If the value is <code>null</code>, then the new
   item will be added at the end.
   
   @emits {coral-collection:add}
   
   @returns {HTMLElement} the item added.
   */
  add(item, insertBefore) {
    // container and itemtagname are the minimum options that need to be provided to automatically handle this function
    if (this._container && this._itemTagName) {
      if (!(item instanceof HTMLElement)) {
        // creates an instance of an item from the object
        if (this._itemBaseTagName) {
          item = document.createElement(this._itemBaseTagName, {is: this._itemTagName}).set(item, true);
        }
        else {
          item = document.createElement(this._itemTagName).set(item, true);
        }
      }
    
      // inserts the element in the specified container
      this._container.insertBefore(item, insertBefore || null);
    
      // when items are handled automatically there is no need to call this immediately
      if (!this._handleItems && typeof this._onItemAdded === 'function' && this._host && filterItem(item, this._filter)) {
        this._onItemAdded.call(this._host, item);
      }
    
      return item;
    }
  
    throw new Error('Please provide host and itemTagName or override add() to provide your own implementation.');
  }
  
  /**
   Removes all the items from the Collection.
   
   @returns {Array.<HTMLElement>} an Array with all the removed items.
   */
  clear() {
    const items = this.getAll();
  
    const removed = [];
  
    for (let i = items.length - 1; i > -1; i--) {
      removed.push(this.remove(items[i]));
    }
  
    return removed;
  }
  
  /**
   Returns an array with all the items inside the Collection. Each element is of type <code>HTMLElement</code>.
   
   @returns {Array.<HTMLElement>} an Array with all the items inside the collection.
   */
  getAll() {
    // in order to perform the automatic getAll query, the _host and _allItemsSelector must be provided
    if (this._container && this._allItemsSelector) {
      let items = this._liveCollection ?
        // instead of querying the DOM, we just convert the live collection to an array, this way we obtain a
        // "snapshot" of the DOM
        listToArray(this._container.getElementsByTagName(this._allItemsSelector)) :
        listToArray(this._container.querySelectorAll(this._allItemsSelector));
    
      if (this._filter) {
        items = items.filter(this._filter);
      }
    
      return items;
    }
  
    throw new Error('Please provide host and itemTagName or override getAll() to provide your own implementation.');
  }
  
  /**
   Removes the given item from the Collection. If <code>options.onItemRemoved</code> was provided, it will be called
   after the element is removed from the DOM.
   
   @param {HTMLElement} item
   The item to add to the Collection.
   
   @emits {coral-collection:remove}
   
   @returns {HTMLElement} the item removed.
   */
  remove(item) {
    if (item.parentNode) {
      item.parentNode.removeChild(item);
    
      // when items are handled automatically there is no need to call this immediatelly
      if (!this._handleItems && typeof this._onItemRemoved === 'function' && this._host && filterItem(item, this._filter)) {
        this._onItemRemoved.call(this._host, item);
      }
    }
  
    return item;
  }
  
  /**
   Returns the first item of the collection.
   
   @returns {?HTMLElement} the first item of the collection.
   */
  first() {
    // Use getAll() so filter() is applied
    return this.getAll()[0] || null;
  }
  
  /**
   Returns the last item of the collection.
   
   @returns {?HTMLElement} the last item of the collection.
   */
  last() {
    // Use getAll() so filter() is applied
    const all = this.getAll();
    return all[all.length - 1] || null;
  }
  
  /**
   Checks if the given Node belongs to the current collection. It is said that a Node belongs to a given collection
   if it passes <code>options.filter</code> and it matches <code>options.itemSelector</code>.
   
   @param {Node} node
   The node to check if it belongs to the collection.
   
   @returns {Boolean} true if the node is part of the collection, otherwise false.
   
   @protected
   */
  _isPartOfCollection(node) {
    // Only element nodes are allowed
    return node.nodeType === Node.ELEMENT_NODE &&
      filterItem(node, this._filter) &&
      // this is an optimization to avoid using matches
      (this._useItemTagName ? this._useItemTagName === node.tagName : node.matches(this._itemSelector));
  }
  
  /**
   Handles the attachment of an item to the collection. It triggers automatically the collection event.
   
   @param {HTMLElement} item
   The item that was attached to the collection.
 
   @emits {coral-collection:add}
   
   @protected
   */
  _onItemAttached(item) {
    // if options.onItemAdded was provided, we call the function
    if (typeof this._onItemAdded === 'function') {
      this._onItemAdded.call(this._host, item);
    }
  
    // the usage of trigger assumes that the host is a coral component
    this._host.trigger('coral-collection:add', {item});
  }
  
  /**
   Handles the detachment of a item to the collection. It triggers automatically the collection event.
   
   @param {HTMLElement} item
   The item that was detached of the collection
   
   @emits {coral-collection:remove}
   
   @protected
   */
  _onItemDetached(item) {
    // if options.onItemRemoved was provided, we call the function
    if (typeof this._onItemRemoved === 'function') {
      this._onItemRemoved.call(this._host, item);
    }
  
    // the usage of trigger assumes that the host is a coral component
    this._host.trigger('coral-collection:remove', {item});
  }
  
  /**
   Enables the automatic detection of collection items. The collection will take care of triggering the appropriate
   collection event when an item is added or removed, as well the related callbacks. Components can decide to skip the
   initialization of the starting items by providing <code>skipInitialItems</code> as <code>false</code>.
   
   @param {Boolean} [skipInitialItems=false]
   If <code>true</code>, <code>onItemAdded</code> will be called for every starting item. A collection event will not
   be triggered for these items.
   
   @protected
   */
  _startHandlingItems(skipInitialItems) {
    if (this._host && this._container) {
      // we reuse the observer if it already exists, this way we do not need to disconnect it if this function is called
      // again
      this._observer = this._observer || new MutationObserver(this._handleMutation.bind(this));
    
      // this changes the way that _onItemAdded and _onItemRemoved behave, since they well be delayed until a mutation
      // detects them
      this._handleItems = true;
    
      this._observer.observe(this._container, {
        // we only need to observe for items that were added and removed, no need to check attributes and contents
        childList: true,
        // we need to listen to subtree mutations as items may not be direct children
        subtree: true
      });
    
      // by default we handle the initial items unless otherwise indicated
      if (skipInitialItems !== true) {
        // since we are handling the items for the component, we need to make sure the _onItemAdded is called for the
        // initial items. collection events will not be triggered for these items as they represent the initial state
        let items;
        let itemCount = 0;
      
        if (typeof this._onItemAdded === 'function' || typeof this._onCollectionChange === 'function') {
          items = this.getAll();
          itemCount = items.length;
        }
      
        if (typeof this._onItemAdded === 'function') {
          for (let i = 0; i < itemCount; i++) {
            this._onItemAdded.call(this._host, items[i]);
          }
        }
      
        // we only call the _onCollectionChange callback if there are items inside the collection
        if (itemCount > 0 && typeof this._onCollectionChange === 'function') {
          this._onCollectionChange.call(this._host, items, []);
        }
      }
    }
    else {
      throw new Error('Please provide options.host and/or options.container to enable handling the items.');
    }
  }
  
  /**
   Stops handling the items.
   
   @protected
   */
  _stopHandlingItems() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
  
  /**
   Handles every time that an element is added or removed from the <code>options.container</code>. By default the
   collection events will be triggered. If <code>options.onItemAdded</code> or <code>options.onItemRemoved</code> were
   provided, they will be called where it applies.
   
   @param Array.<Object> mutations
   Array that contains the <code>MutationRecord> relevant to every registered mutation.
   
   @protected
   */
  _handleMutation(mutations) {
    let mutation;
    const mutationsCount = mutations.length;
    let item;
    let addedNodes;
    let addedNodesCount;
    let removedNodes;
    let removedNodesCount;
    const validAddedNodes = [];
    const validRemovedNodes = [];
  
    // we need to count every addition and removal to notify the component that the collection changed
    let itemChanges = 0;
    for (let i = 0; i < mutationsCount; i++) {
      mutation = mutations[i];
    
      addedNodes = mutation.addedNodes;
      addedNodesCount = addedNodes.length;
      for (let j = 0; j < addedNodesCount; j++) {
        item = addedNodes[j];
      
        // filters the item
        if (this._isPartOfCollection(item)) {
          itemChanges++;
          validAddedNodes.push(item);
          this._onItemAttached(item);
        }
      }
    
      removedNodes = mutation.removedNodes;
      removedNodesCount = removedNodes.length;
      for (let k = 0; k < removedNodesCount; k++) {
        item = removedNodes[k];
      
        // filters the item
        if (this._isPartOfCollection(item)) {
          itemChanges++;
          validRemovedNodes.push(item);
          this._onItemDetached(item);
        }
      }
    }
  
    // if changes were done to the collection we need to notify the component. we do this after all the mutations were
    // processed to make sure we only do it once
    if (itemChanges !== 0 && typeof this._onCollectionChange === 'function' && this._host) {
      this._onCollectionChange.call(this._host, validAddedNodes, validRemovedNodes);
    }
  }
  
  /**
   Triggered when an item is added to the {@link Collection}. {@link Collection} events are not synchronous so the DOM
   may reflect a different reality although every addition or removal will be reported.
   
   @typedef {CustomEvent} coral-collection:add
   
   @property {HTMLElement} detail.item
   The item that was added.
   */
  
  /**
   Triggered when an item is removed from a {@link Collection}. {@link Collection} events are not synchronous so the DOM
   may reflect a different reality although every addition or removal will be reported.
   
   @typedef {CustomEvent} coral-collection:remove
   
   @property {HTMLElement} detail.item
   The item that was removed.
   */
  
  /**
   Signature of the function called to determine if an element should be included in the {@link Collection}. If the function
   returns <code>true</code> for the given element it will be part of the collection, otherwise it will be excluded.
   
   @typedef {function} CollectionFilter
   
   @param {HTMLElement} element
   The item to check whether it should be part of the collection.
   
   @returns {Boolean} true if should be part of the collection, otherwise false.
   */
  
  /**
   Signature of the function called when ever an item is added to the {@link Collection}.
   
   @typedef {function} CollectionOnItemAdded
   
   @param {HTMLElement} item
   The item that was added to the collection.
   */
  
  /**
   Signature of the function called when ever an item is removed from the {@link Collection}.
 
   @typedef {function} CollectionOnItemRemoved
   
   @param {HTMLElement} item
   The item that was added to the collection.
   */
  
  /**
   Signature of the function called when there is a change in the {@link Collection}. The items that where added and removed
   will be provided.
 
   @typedef {function} CollectionOnChange
   
   @param {Array.<HTMLElement>} addedNodes
   An array that contains the items that were added to the collection.
   @param {Array.<HTMLElement>} removedNodes
   An array that contains the items that were removed from the collection.
   */
}

export default Collection;
