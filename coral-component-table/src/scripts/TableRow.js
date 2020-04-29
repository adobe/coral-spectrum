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

import accessibilityState from '../templates/accessibilityState';
import {BaseComponent} from '../../../coral-base-component';
import {SelectableCollection} from '../../../coral-collection';
import {transform, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Table-row';

/**
 @class Coral.Table.Row
 @classdesc A Table row component
 @htmltag coral-table-row
 @htmlbasetag tr
 @extends {HTMLTableRowElement}
 @extends {BaseComponent}
 */
class TableRow extends BaseComponent(HTMLTableRowElement) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {};
    accessibilityState.call(this._elements, {commons});

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
    // Prevent selection if disabled
    if (this.hasAttribute('coral-table-rowselect') && this.hasAttribute('disabled') ||
    this.querySelector('[coral-table-rowselect][disabled]')) {
      return;
    }
    
    this.trigger('coral-table-row:_beforeselectedchanged');
    
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.trigger('coral-table-row:_selectedchanged');
    this._syncSelectHandle();
    this._syncAriaLabelledby();
    this._syncAriaSelectedState();
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
    const selectHandle = this.querySelector('[coral-table-rowselect]');

    // @a11y Only update aria-selected if the table row can be selected
    if(!(this.hasAttribute('coral-table-rowselect') || selectHandle)) {
      this.removeAttribute('aria-selected');
      return;
    }

    const rowOrderHandle = this.querySelector('[coral-table-roworder]');
    const rowLockHandle = this.querySelector('[coral-table-rowlock]');
    const rowRemoveHandle = this.querySelector('[coral-row-remove]');
    const accessibilityState = this._elements.accessibilityState;

    const resetAccessibilityState = () => {
      // @a11y remove aria-live
      this.removeAttribute('aria-live');
      this.removeAttribute('aria-atomic');
      this.removeAttribute('aria-relevant');

      // @a11y Unhide the selectHandle, so that it will be resume being announced by assistive 
      // technology
      if (selectHandle && selectHandle.tagName === 'CORAL-CHECKBOX') {
        selectHandle.removeAttribute('aria-hidden');
      }

      // @a11y Unhide the coral-table-roworder handle, so that it will be resume being announced by 
      // assistive technology
      if (rowOrderHandle) {
        rowOrderHandle.removeAttribute('aria-hidden');
      }

      // @a11y Unhide the coral-table-rowlock handle, so that it will be resume being announced by 
      // assistive technology
      if (rowLockHandle) {
        rowLockHandle.removeAttribute('aria-hidden');
      }

      // @a11y Unhide the coral-row-remove handle, so that it will be resume being announced by 
      // assistive technology
      if (rowRemoveHandle) {
        rowRemoveHandle.removeAttribute('aria-hidden');
      }

      if (accessibilityState) {
        // @a11y Hide the _accessibilityState from assistive technology, so that it can not be read 
        // using a screen reader separately from the row it helps label
        accessibilityState.setAttribute('aria-hidden', 'true');

        // @a11y If the item is not selected, remove ', unchecked' to decrease verbosity.
        if (!this.selected) {
          accessibilityState.innerHTML = '';
        }
      }
    };

    // @a11y set aria-selected
    this.setAttribute('aria-selected', this.selected);

    if (this._ariaLiveOnTimeout || this._ariaLiveOffTimeout) {
      clearTimeout(this._ariaLiveOnTimeout);
      clearTimeout(this._ariaLiveOffTimeout);
    }

    // @ally If _accessibilityState has been added to a cell within the row,
    if (accessibilityState) {        
      resetAccessibilityState();
      this._ariaLiveOnTimeout = setTimeout(() => {
          
        // @a11y and the row or one of its descendants has focus,
        if (this === document.activeElement || this.contains(document.activeElement)) {
          
          // @a11y Hide the "Select" checkbox so that it does not get announced with the state change.
          if (selectHandle && selectHandle.tagName === 'CORAL-CHECKBOX') {
            selectHandle.setAttribute('aria-hidden', 'true');
          }

          // @a11y Hide the coral-table-roworder handle so that it does not get announced with the 
          // state change.
          if (rowOrderHandle) {
            rowOrderHandle.setAttribute('aria-hidden', 'true');
          }

          // @a11y Hide the coral-table-rowlock handle so that it does not get announced with the state
          // change.
          if (rowLockHandle) {
            rowLockHandle.setAttribute('aria-hidden', 'true');
          }

          // @a11y Hide the coral-row-remove handle so that it does not get announced with the state 
          // change.
          if (rowRemoveHandle) {
            rowRemoveHandle.setAttribute('aria-hidden', 'true');
          }

          // @a11y The ChromeVox screenreader, used on Chromebook, announces the state change and 
          // should not need aria-live, otherwise it double-voices the row.
          if (!window.cvox) {
            // @a11y Unhide the _accessibilityState so that it will get announced with the state change.
            accessibilityState.removeAttribute('aria-hidden');

            // @ally use aria-live to announce the state change
            this.setAttribute('aria-live', 'assertive');

            // @ally use aria-atomic="true" to announce the entire row
            this.setAttribute('aria-atomic', 'true');
          }

          this._ariaLiveOnTimeout = setTimeout(() => {
            // @ally Set the _accessibilityState text to read either ", checked" or ", unchecked", 
            // which should trigger a live region announcement.
            accessibilityState.innerHTML = i18n.get(this.selected ? ', checked' : ', unchecked');

            // @ally wait 250ms for row to announce
            this._ariaLiveOffTimeout = setTimeout(resetAccessibilityState, 250);
          }, 20);
        }
      }, 20);

      if (!(this === document.activeElement || this.contains(document.activeElement))) {
        accessibilityState.innerHTML = i18n.get(this.selected ? ', checked' : '');
      }  
    }
  }

  /** @private */
  _syncAriaLabelledby() {
    // @a11y if the row is not selectable, remove accessibilityState
    if (!(this.hasAttribute('coral-table-rowselect') || this.querySelector('[coral-table-rowselect]'))) {
      if (this._elements.accessibilityState.parentNode) {
        this.removeAttribute('aria-labelledby');
        this._elements.accessibilityState = this._elements.accessibilityState.parentNode.removeChild(this._elements.accessibilityState);
      }
      return;
    }

    // @a11y get a list of ids for cells 
    const cells = this.items.getAll().filter(cell => {
      // @a11y exclude cells for coral-table-roworder, coral-table-rowlock or coral-row-remove
      return (
        cell.id &&
        !(
          cell.hasAttribute('coral-table-roworder') || cell.querySelector('[coral-table-roworder]')  ||
          cell.hasAttribute('coral-table-rowlock') || cell.querySelector('[coral-table-rowlock]') ||
          cell.hasAttribute('coral-row-remove') || cell.querySelector('[coral-table-remove]')
        )
      );
    });

    let cellForAccessibilityState;
    const ids = cells.map(cell => {
      const handle = cell.querySelector('[coral-table-rowselect]');
      if (handle) {

        cellForAccessibilityState = cell;

        // @a11y otherwise, if the selectHandle is a coral-checkbox,
        if (handle && handle.tagName === 'CORAL-CHECKBOX') {
          // @a11y if the row is selected, don't add the coral-table-rowselect to accessibility name
          if (this.selected) {
            return;
          }
          // otherwise, include the checkbox input labelled "Select" in the accessibility name
          return handle._elements.input && handle._elements.input.id;
        }
      }

      // @a11y include all other cells in the row in the accessibility name
      return cell.id;
    });

    // @a11y If an _accessibilityState has not been defined within one of the cells, add to the last 
    // cell
    if (!cellForAccessibilityState && cells.length) {
      cellForAccessibilityState = cells[cells.length - 1];
    }

    if (cellForAccessibilityState) {
      cellForAccessibilityState.appendChild(this._elements.accessibilityState);
    }

    // @a11y Once defined,
    if (this._elements.accessibilityState.parentNode) {
      // @a11y add the _accessibilityState ", checked" or ", unchecked" as the last item in the 
      // accessibility name
      ids.push(this._elements.accessibilityState.id);
    }

    // @a11y Update the aria-labelledby attribute for the row.
    this.setAttribute('aria-labelledby', ids.join(' '));
  }
  
  /** @private */
  _syncSelectHandle() {
    // Check/uncheck the select handle
    const selectHandle = this.querySelector('[coral-table-rowselect]');
    if (selectHandle) {
      if (typeof selectHandle.indeterminate !== 'undefined') {
        selectHandle.indeterminate = false;
      }

      selectHandle[this.selected ? 'setAttribute' : 'removeAttribute']('checked', '');
      
      // @a11y If the handle is a checkbox but lacks a label, label it with "Select".
      if (selectHandle.tagName === 'CORAL-CHECKBOX') {
        if (!selectHandle.labelled) {
          selectHandle.labelled = i18n.get('Select');
        }

        // @a11y provide a more explicit label for the checkbox than just "Select"
        if (this.hasAttribute('aria-labelledby')) {
          let ids = this.getAttribute('aria-labelledby')
          .split(' ')
          .filter(id => selectHandle._elements.input.id !== id && this._elements.accessibilityState.id !== id)
          .join(' ');
          selectHandle.labelledBy = selectHandle._elements.input.id + ' ' + ids;
        }
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

    // Sync the aria-labelledby attribute to include the _accessibilityState
    this._syncAriaLabelledby();
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
    requestAnimationFrame(() => {
      // Specify handle directly on the row if none found
      if (!this.querySelector(`[${handle}]`)) {
        this.setAttribute(handle, '');
      }
      this._syncSelectHandle();
      this._syncAriaLabelledby();
      this._syncAriaSelectedState();
    });
  }
  
  /** @private */
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      // Sync added nodes
      this.trigger('coral-table-row:_contentchanged', {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
      this._syncAriaLabelledby();
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['locked', 'selected', 'multiple', 'selectable', '_selectable', '_orderable', '_lockable']);
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
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    this._syncAriaLabelledby();
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
