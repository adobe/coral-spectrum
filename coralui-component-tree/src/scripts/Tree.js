/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import Component from 'coralui-mixin-component';
import {SelectableCollection} from 'coralui-collection';
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-Tree';

/**
 @class Coral.Tree
 @classdesc A Tree component
 @htmltag coral-tree
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Tree extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'click .coral3-Tree-header': '_onItemClick',
      'click .coral3-Tree-collapseExpand': '_onExpandCollapseClick',
      'coral-collection:add coral-tree-item': '_onCollectionChange',
      'coral-collection:remove coral-tree-item': '_onCollectionChange',
      // a11y
      'key:space .coral3-Tree-header': '_onItemClick',
      'key:enter .coral3-Tree-header': '_onExpandCollapseClick',
      'key:pageup .coral3-Tree-header': '_onFocusPreviousItem',
      'key:left .coral3-Tree-header': '_onFocusPreviousItem',
      'key:up .coral3-Tree-header': '_onFocusPreviousItem',
      'key:pagedown .coral3-Tree-header': '_onFocusNextItem',
      'key:right .coral3-Tree-header': '_onFocusNextItem',
      'key:down .coral3-Tree-header': '_onFocusNextItem',
      'key:home .coral3-Tree-header': '_onFocusFirstItem',
      'key:end .coral3-Tree-header': '_onFocusLastItem',
      // private
      'coral-tree-item:_selectedchanged': '_onItemSelectedChanged',
      'coral-tree-item:_disabledchanged': '_onFocusableChanged',
      'coral-tree-item:_expandedchanged': '_onFocusableChanged',
      'coral-tree-item:_afterexpandedchanged': '_onExpandedChanged',
      'coral-tree-item:_hiddenchanged': '_onFocusableChanged'
    });
    
    // Used for eventing
    this._oldSelection = [];
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  
    // Listen for mutations for Torq compatibility
    const self = this;
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const addedNode = mutation.addedNodes[i];
          if (addedNode.tagName === 'CORAL-TREE-ITEM') {
            // Move tree items to their container
            if (addedNode.parentNode.tagName === addedNode.tagName) {
              addedNode.parentNode._elements.subTreeContainer.appendChild(addedNode);
            }
          }
        }
      });
    });

    observer.observe(self, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Tree#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-tree-item'
      });
    }
    return this._items;
  }
  
  /**
   Indicates whether the tree accepts multiple selected items.
   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   @memberof Coral.Tree#
   */
  get multiple() {
    return this._multiple || false;
  }
  set multiple(value) {
    this._multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this._multiple);
    
    this.setAttribute('aria-multiselectable', this._multiple);
    
    this._validateSelection();
  }
  
  /**
   Returns an Array containing the set selected items.
   @type {Array.<HTMLElement>}
   @readonly
   @memberof Coral.Tree#
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }
  
  /**
   Returns the first selected item in the Tree. The value <code>null</code> is returned if no element is
   selected.
   @type {?HTMLElement}
   @readonly
   @memberof Coral.Tree#
   */
  get selectedItem() {
    return this.items._getAllSelected()[0] || null;
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  /** @private */
  _validateSelection(item) {
    let selectedItems = this.selectedItems;
    
    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
      item = item || selectedItems[selectedItems.length - 1];
      
      if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
        selectedItems.forEach(function(selectedItem) {
          if (selectedItem !== item) {
            // Don't trigger change events
            this._preventTriggeringEvents = true;
            selectedItem.removeAttribute('selected');
          }
        }.bind(this));
        
        // We can trigger change events again
        this._preventTriggeringEvents = false;
      }
    }
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && this._arraysAreDifferent(selectedItems, oldSelection)) {
      // We differentiate whether multiple is on or off and return an array or HTMLElement respectively
      if (this.multiple) {
        this.trigger('coral-tree:change', {
          oldSelection: oldSelection,
          selection: selectedItems
        });
      }
      else {
        // Return all items if we just switched from multiple=true to multiple=false and we had >1 selected items
        this.trigger('coral-tree:change', {
          oldSelection: oldSelection.length > 1 ? oldSelection : (oldSelection[0] || null),
          selection: selectedItems[0] || null
        });
      }
      
      this._oldSelection = selectedItems;
    }
  }
  
  /** @private */
  _arraysAreDifferent(selection, oldSelection) {
    let diff = [];
    
    if (oldSelection.length === selection.length) {
      diff = oldSelection.filter(function(item) {
        return selection.indexOf(item) === -1;
      });
    }
    
    // since we guarantee that they are arrays, we can start by comparing their size
    return oldSelection.length !== selection.length || diff.length !== 0;
  }
  
  /** @private */
  _toggleItemAttribute(item, attributeName) {
    if (item) {
      item[item.hasAttribute(attributeName) ? 'removeAttribute' : 'setAttribute'](attributeName, '');
    }
  }
  
  /** @private */
  _onCollectionChange(event) {
    // Prevent triggering collection event twice. Only coral-tree collection events are propagated.
    event.stopImmediatePropagation();
  }
  
  /** @private */
  _onItemClick(event) {
    // Clickable item inside Tree Item should not trigger selection of item
    if (event.target.hasAttribute('coral-interactive') || event.target.closest('[coral-interactive]')) {
      return;
    }
  
    // The click was performed on the header so we select the item (parentNode) the selection is toggled
    const item = event.target.closest('coral-tree-item');
    if (item && !item.hasAttribute('disabled')) {
      event.preventDefault();
      event.stopPropagation();
    
      // We ignore the selection if the item is disabled
      this._toggleItemAttribute(item, 'selected');
      const focusable = this._getFocusable();
      if (focusable) {
        focusable.setAttribute('tabindex', '-1');
      }
      item._elements.header.setAttribute('tabindex', '0');
      item._elements.header.focus();
    }
  }
  
  /** @private */
  _onExpandCollapseClick(event) {
    event.preventDefault();
    event.stopPropagation();
  
    // The click was performed on the icon to expand/collapse  the sub tree
    const item = event.target.closest('coral-tree-item');
    if (item) {
      // We ignore the expand/collapse if the item is disabled
      if (item.hasAttribute('disabled')) {
        return;
      }
    
      // Toggle the expanded of the item:
      this._toggleItemAttribute(item, 'expanded');
    }
  }
  
  /** @private */
  _focusSiblingItem(item, next) {
    const focusableItems = this._getFocusableItems();
  
    // There's not enough items to change focus
    if (focusableItems.length < 2) {
      return;
    }
  
    let index = focusableItems.indexOf(item) + (next ? 1 : -1);
    let siblingItem = null;
  
    // If we reached the edge, target the other edge
    if (index > focusableItems.length - 1) {
      siblingItem = focusableItems[0];
    }
    else if (index < 0) {
      siblingItem = focusableItems[focusableItems.length - 1];
    }
  
    // Find the sibling item
    while (!siblingItem) {
      siblingItem = focusableItems[index];
      // The item might be hidden because a parent is collapsed
      if (siblingItem.parentNode.closest('coral-tree-item.is-collapsed')) {
        if (next) {
          index++;
          siblingItem = (index > focusableItems.length - 1) ? item : null;
        }
        else {
          index--;
          siblingItem = (index < 0) ? item : null;
        }
      }
    }
  
    // Change focus
    if (siblingItem !== item) {
      item._elements.header.setAttribute('tabindex', '-1');
      siblingItem._elements.header.setAttribute('tabindex', '0');
      siblingItem._elements.header.focus();
    }
  }
  
  /** @private */
  _focusEdgeItem(last) {
  // Query the focusable item
    const focusable = this._getFocusable();
    if (focusable) {
      const focusableItems = this._getFocusableItems();
      const edgeItem = focusableItems[last ? focusableItems.length - 1 : 0];
    
      // Change focus
      if (edgeItem !== focusable) {
        focusable.setAttribute('tabindex', '-1');
        edgeItem._elements.header.setAttribute('tabindex', '0');
        edgeItem._elements.header.focus();
      }
    }
  }
  
  /** @private */
  _onFocusNextItem(event) {
  event.preventDefault();
    event.stopPropagation();
  
    const item = event.target.closest('coral-tree-item');
    if (item) {
      this._focusSiblingItem(item, true);
    }
  }
  
  /** @private */
  _onFocusPreviousItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const item = event.target.closest('coral-tree-item');
    if (item) {
      this._focusSiblingItem(item, false);
    }
  }
  
  /** @private */
  _onFocusFirstItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusEdgeItem(false);
  }
  
  /** @private */
  _onFocusLastItem(event) {
    event.preventDefault();
    event.stopPropagation();
  
    this._focusEdgeItem(true);
  }
  
  /** @private */
  _onFocusableChanged(event) {
    event.preventDefault();
    event.stopPropagation();
  
    if (event.target.contains(this._getFocusable())) {
      this._resetFocusableItem();
    }
  }
  
  /** @private */
  _onExpandedChanged(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this.trigger('coral-tree:item' + (item.expanded ? 'expand' : 'collapse'), {
      item: item
    });
  }
  
  /** @private */
  _getFocusable() {
    return this.querySelector('coral-tree-item > .coral3-Tree-header[tabindex="0"]');
  }
  
  /** @private */
  _getFocusableItems() {
    return this.items.getAll().filter(function(item) {
      return !item.closest('coral-tree-item[disabled]') && !item.closest('coral-tree-item[hidden]');
    });
  }
  
  /** @private */
  _resetFocusableItem(item) {
    // Old focusable becomes unfocusable
    const focusable = this._getFocusable();
    if (focusable) {
      focusable.setAttribute('tabindex', '-1');
    }
  
    // Defined item or first item by default gets the focus
    item = item || this._getFocusableItems()[0];
    if (item) {
      item._elements.header.setAttribute('tabindex', '0');
    }
  }
  
  /** @private */
  _expandCollapseAll(expand) {
    const coralTreeItems = this.querySelectorAll('coral-tree-item');
    if (coralTreeItems) {
      let item;
      const length = coralTreeItems.length;
      if (length > 0) {
        for (let index = 0; index < length; index++) {
          item = coralTreeItems[index];
          if (item) {
            item.expanded = expand;
          }
        }
      }
    }
  }
  
  /**
   Expand all the Tree Items
   */
  expandAll() {
    this._expandCollapseAll(true);
  }
  
  /**
   Collapse all the Tree Items
   */
  collapseAll() {
    this._expandCollapseAll(false);
  }

  static get observedAttributes() {
    return ['multiple'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'tree');
    this.setAttribute('aria-multiselectable', this.multiple);
    
    // Requires tree item API to be defined
    window.customElements.whenDefined('coral-tree-item').then(function() {
      // Enable keyboard interaction
      this._resetFocusableItem();
    }.bind(this));
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItems;
  }
  
  /**
   Triggered when the selection changed.
   
   @event Coral.Tree#coral-tree:change
   
   @param {Object} event
   Event object
   @param {Array.<HTMLElement>} event.detail.oldSelection
   The old selected item.
   @param {Array.<HTMLElement>} event.detail.selection
   The selected items.
   */
  
  /**
   Triggered when an item expanded.
   
   @event Coral.Tree#coral-tree:itemexpand.
   
   @param {Object} event
   Event object
   @param {HTMLElement} event.detail.item
   The expanded item.
   */
  
  /**
   Triggered when an item collapsed.
   
   @event Coral.Tree#coral-tree:itemcollapse.
   
   @param {Object} event
   Event object
   @param {HTMLElement} event.detail.item
   The collapsed item.
   */
}

export default Tree;
