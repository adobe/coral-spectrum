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
import {SelectableCollection} from '../../../coral-collection';
import {Select} from '../../../coral-component-select';

const CLASSNAME = '_coral-Shell-workspaces';

/**
 @class Coral.Shell.Workspaces
 @classdesc A Shell Workspaces component
 @htmltag coral-shell-workspaces
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellWorkspaces extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      'key:down [is="coral-shell-workspace"]': '_focusNextItem',
      'key:right [is="coral-shell-workspace"]': '_focusNextItem',
      'key:left [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:up [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pageup [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pagedown [is="coral-shell-workspace"]': '_focusNextItem',
      'key:home [is="coral-shell-workspace"]': '_focusFirstItem',
      'key:end [is="coral-shell-workspace"]': '_focusLastItem',
      // private
      'coral-shell-workspace:_selectedchanged': '_onItemSelectedChanged',
      'change ._coral-Shell-workspaces-select': '_onSelectChanged'
    });
    
    // Template
    this._elements = {
      select: new Select().set({
        variant: 'quiet'
      })
    };
    this._elements.select.classList.add('_coral-Shell-workspaces-select');
  
    // Used for eventing
    this._oldSelection = null;
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-shell-workspace',
        itemBaseTagName: 'a',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
  
    return this._items;
  }
  
  /**
   Returns the selected workspace.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /** @private */
  _validateSelection(item) {
    // gets the current selection
    const selection = this.items._getAllSelected();
    const selectionCount = selection.length;
    
    // if no item is currently selected, we need to find a candidate
    if (selectionCount === 0) {
      // gets the first candidate for selection
      const selectable = this.items._getFirstSelectable();
      
      if (selectable) {
        selectable.setAttribute('selected', '');
      }
    }
    // more items are selected, so we find a single item and deselect everything else
    else if (selectionCount > 1) {
      // By default, the last one stays selected
      item = item || selection[selection.length - 1];
      
      for (let i = 0; i < selectionCount; i++) {
        if (selection[i] !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selection[i].removeAttribute('selected');
        }
      }
      
      // We can trigger change events again
      this._preventTriggeringEvents = false;
    }
  
    // Sync select items under the hood
    this._renderSelectItems();
    
    this._triggerChangeEvent();
  }
  
  _renderSelectItems() {
    this._elements.select.items.clear();
    
    this.items.getAll().forEach((item) => {
      this._elements.select.items.add({
        content: {
          innerHTML: item.innerHTML
        },
        selected: item.hasAttribute('selected'),
        _workspace: item
      });
    });
  }
  
  _onSelectChanged(event) {
    event.stopImmediatePropagation();
    
    this._elements.select.selectedItem._workspace.selected = true;
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-shell-workspaces:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._validateSelection(item);
  }
  
  /**
   Returns true if the event is at the matched target.
   
   @private
   */
  _eventIsAtTarget(event) {
    const target = event.target;
    const listItem = event.matchedTarget;
  
    const isAtTarget = target === listItem;
  
    if (isAtTarget) {
      // Don't let arrow keys etc scroll the page
      event.preventDefault();
      event.stopPropagation();
    }
  
    return isAtTarget;
  }
  
  /** @private */
  _focusNextItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    if (target.nextElementSibling) {
      target.nextElementSibling.focus();
    }
    else {
      this.items.first().focus();
    }
  }
  
  /** @private */
  _focusPreviousItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    if (target.previousElementSibling) {
      target.previousElementSibling.focus();
    }
    else {
      this.items.last().focus();
    }
  }
  
  /** @private */
  _focusFirstItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
    
    this.items.first().focus();
  }
  
  /** @private */
  _focusLastItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    this.items.last().focus();
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
    
    // Support cloneNode
    const template = this.querySelector('._coral-Shell-workspaces-select');
    if (template) {
      template.remove();
    }
    
    this.appendChild(this._elements.select);
  }
}

export default ShellWorkspaces;
