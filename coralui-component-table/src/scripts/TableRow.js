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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {SelectableCollection} from '../../../coralui-collection';
import {transform} from '../../../coralui-util';

const CLASSNAME = '_coral-Table-row';

/**
 @class Coral.Table.Row
 @classdesc A Table row component
 @htmltag coral-table-row
 @htmlbasetag tr
 @extends {HTMLTableRowElement}
 @extends {ComponentMixin}
 */
class TableRow extends ComponentMixin(HTMLTableRowElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Required for coral-table-row:change event
    this._oldSelection = [];
    
    // Events
    this._delegateEvents({
      // Private
      'coral-table-cell:_beforeselectedchanged': '_onBeforeCellSelectionChanged',
      'coral-table-cell:_selectedchanged': '_onCellSelectionChanged'
    });
  
    // Initialize content MO
    this._observer = new MutationObserver(this._handleMutations.bind(this));
    this._observer.observe(this, {
      childList: true
    });
  }
  
  /**
   Whether the table row is locked.
   
   @type {Boolean}
   @default false
   @htmlattribute locked
   @htmlattributereflected
   */
  get locked() {
    return this._locked || false;
  }
  set locked(value) {
    this._locked = transform.booleanAttr(value);
    this._reflectAttribute('locked', this._locked);
    
    this.trigger('coral-table-row:_lockedchanged');
  }
  
  /**
   Whether the table row is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this.trigger('coral-table-row:_beforeselectedchanged');
    
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.trigger('coral-table-row:_selectedchanged');
    
    this._syncAriaSelectedState();
    this._syncSelectHandle();
  }
  
  /**
   Whether the items are selectable.
   
   @type {Boolean}
   @default false
   @htmlattribute selectable
   @htmlattributereflected
   */
  get selectable() {
    return this._selectable || false;
  }
  set selectable(value) {
    this._selectable = transform.booleanAttr(value);
    this._reflectAttribute('selectable', this._selectable);
    
    this.items.getAll().forEach((cell) => {
      cell[this._selectable ? 'setAttribute' : 'removeAttribute']('_selectable', '');
    });
  }
  
  /**
   Whether multiple items can be selected.
   
   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   */
  get multiple() {
    return this._multiple || false;
  }
  set multiple(value) {
    this._multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this._multiple);
    
    this.trigger('coral-table-row:_multiplechanged');
  }
  
  /**
   Returns an Array containing the selected items.
   
   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }
  
  /**
   Returns the first selected item of the row. The value <code>null</code> is returned if no element is
   selected.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getFirstSelected();
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemBaseTagName: 'td',
        itemTagName: 'coral-table-cell'
      });
    }
  
    return this._items;
  }
  
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    this.trigger('coral-table-row:_change', {
      oldSelection: this._oldSelection,
      selection: selectedItems
    });
    this._oldSelection = selectedItems;
  }
  
  /** @private */
  _onCellSelectionChanged(event) {
    event.stopImmediatePropagation();
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _onBeforeCellSelectionChanged(event) {
    event.stopImmediatePropagation();
    
    // In single selection, if the added item is selected, the rest should be deselected
    const selectedItem = this.selectedItem;
    if (!this.multiple && selectedItem && !event.target.selected) {
      selectedItem.set('selected', false, true);
    }
  }
  
  /** @private */
  _syncAriaSelectedState() {
    this.classList.toggle('is-selected', this.selected);
    this.setAttribute('aria-selected', this.selected);
  }
  
  /** @private */
  _syncSelectHandle() {
    // Check/uncheck the select handle
    const selectHandle = this.querySelector('[coral-table-rowselect]');
    if (selectHandle) {
      if (typeof selectHandle.indeterminate !== 'undefined') {
        selectHandle.indeterminate = false;
      }
      
      if (typeof selectHandle.checked !== 'undefined') {
        selectHandle.checked = this.selected;
      }
    }
  }
  
  /** @private */
  _toggleSelectable(selectable) {
    if (selectable) {
      this._setHandle('coral-table-rowselect');
    }
    else {
      // Clear selection but leave the handle if any
      this.set('selected', false, true);
    }
  }
  
  /** @private */
  _toggleOrderable(orderable) {
    if (orderable) {
      this._setHandle('coral-table-roworder');
    }
    // Remove DragAction instance
    else if (this.dragAction) {
      this.dragAction.destroy();
    }
  }
  
  /** @private */
  _toggleLockable(lockable) {
    if (lockable) {
      this._setHandle('coral-table-rowlock');
    }
  }
  
  /** @private */
  _setHandle(handle) {
    // Specify handle directly on the row if none found
    if (!this.querySelector(`[${handle}]`)) {
      this.setAttribute(handle, '');
    }
  }
  
  /** @private */
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      // Sync added nodes
      this.trigger('coral-table-row:_contentchanged', {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return ['locked', 'selected', 'multiple', 'selectable', '_selectable', '_orderable', '_lockable'];
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_selectable') {
      this._toggleSelectable(value !== null);
    }
    else if (name === '_orderable') {
      this._toggleOrderable(value !== null);
    }
    else if (name === '_lockable') {
      this._toggleLockable(value !== null);
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // a11y
    this.setAttribute('role', 'row');
  }
  
  /**
   Triggered before {@link TableRow#selected} is changed.
 
   @typedef {CustomEvent} coral-table-row:_beforeselectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableRow#selected} changed.
 
   @typedef {CustomEvent} coral-table-row:_selectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableRow#locked} changed.
 
   @typedef {CustomEvent} coral-table-row:_lockedchanged
   
   @private
   */
  
  
  /**
   Triggered when {@link TableRow#multiple} changed.
   
   @typedef {CustomEvent} coral-table-row:_multiplechanged
   
   @private
   */
  
  /**
   Triggered when the {@link TableRow} selection changed.
 
   @typedef {CustomEvent} coral-table-row:_change
   
   @property {Array.<TableCell>} detail.oldSelection
   The old item selection. When {@link TableRow#multiple}, it includes an Array.
   @property {Array.<TableCell>} event.detail.selection
   The item selection. When {@link TableRow#multiple}, it includes an Array.
   
   @private
   */
}

export default TableRow;
