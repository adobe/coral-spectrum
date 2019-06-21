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

import {BaseComponent} from '../../../coral-base-component';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Table-cell';

/**
 @class Coral.Table.Cell
 @classdesc A Table cell component
 @htmltag coral-table-cell
 @htmlbasetag td
 @extends {HTMLTableCellElement}
 @extends {BaseComponent}
 */
class TableCell extends BaseComponent(HTMLTableCellElement) {
  // @compat
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether the table cell is selected.
   
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
    if (this.hasAttribute('coral-table-cellselect') && this.hasAttribute('disabled') ||
      this.querySelector('[coral-table-cellselect][disabled]')) {
      return;
    }
    
    this.trigger('coral-table-cell:_beforeselectedchanged');
    
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.trigger('coral-table-cell:_selectedchanged');
  
    this._syncAriaSelectedState();
    this._syncSelectHandle();
  }
  
  /**
   The cell's value. It is used to compare cells during a column sort. If not set, the sorting will be performed on the
   cell content. The content will be parse accordingly based on the column's <code>sortabletype</code> property.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this.getAttribute('value') || '';
  }
  set value(value) {
    this.setAttribute('value', transform.string(value));
  }
  
  /** @private */
  _setHandle(handle) {
    // Specify handle directly on the cell if none found
    if (!this.querySelector(`[${handle}]`)) {
      this.setAttribute(handle, '');
    }
  }
  
  /** @private */
  _toggleSelectable(selectable) {
    if (selectable) {
      this._setHandle('coral-table-cellselect');
    }
    else {
      // Clear selection
      this.selected = false;
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
    const selectHandle = this.querySelector('[coral-table-cellselect]');
    if (selectHandle) {
      if (typeof selectHandle.indeterminate !== 'undefined') {
        selectHandle.indeterminate = false;
      }
      
      if (typeof selectHandle.checked !== 'undefined') {
        selectHandle.checked = this.selected;
      }
    }
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', '_selectable']);
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_selectable') {
      this._toggleSelectable(value !== null);
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
    this.setAttribute('role', 'gridcell');
  }
  
  /**
   Triggered before {@link TableCell#selected} is changed.
   
   @typedef {CustomEvent} coral-table-cell:_beforeselectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableCell#selected} changed.
   
   @typedef {CustomEvent} coral-table-cell:_selectedchanged
   
   @private
   */
}

export default TableCell;
