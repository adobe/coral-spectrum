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

import {List} from '../../../coralui-component-list';
import {SelectableCollection} from '../../../coralui-collection';
import {Icon} from '../../../coralui-component-icon';
import organization from '../templates/organization';
import {transform, commons} from '../../../coralui-utils';

const CLASSNAMES = ['_coral-BasicList-item', '_coral-Shell-orgSwitcher-item'];


/**
 @class Coral.Shell.Organization
 @classdesc A Shell Organization component
 @htmltag coral-shell-organization
 @extends {ListItem}
 */
class ShellOrganization extends List.Item {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      'click': '_onClick',
      'key:enter': '_onClick',
      'key:space': '_onClick',
      // Private
      'coral-shell-suborganization:_selectedchanged': '_onItemSelectedChanged'
    });
  
    organization.call(this._elements, {Icon});
  
    // Used for eventing
    this._oldSelection = null;
  
    // Item handling
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
        itemTagName: 'coral-shell-suborganization',
        container: this._elements.items,
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
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
  
  /**
   Whether this organization is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.setAttribute('aria-selected', this._selected);
    this.classList.toggle('is-selected', this._selected);
    this._elements.checkmark.hidden = !this._selected;
  
    if (this.items) {
      const selectedItem = this.selectedItem;
    
      this.classList.toggle('is-child-selected', selectedItem);
    
      if (!this._selected && selectedItem) {
        // Always de-select children when de-selected
        selectedItem.removeAttribute('selected');
      }
    }
    
    this.trigger(`${this.tagName.toLowerCase()}:_selectedchanged`);
  }
  
  /**
   The name of this organization.
   
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._name || '';
  }
  set name(value) {
    this._name = transform.string(value);
    this._reflectAttribute('name', this._name);
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    // Validate the selection only if we're an organization
    if (this.tagName === 'CORAL-SHELL-ORGANIZATION') {
      // Don't stop propagation here as the orgSwitcher listens to the event too
      const item = event.target;
      this._validateSelection(item);
    }
  }
  
  /** @private */
  _onItemAdded(item) {
    // Move all items into the right place
    this._moveItems();
    
    this._validateSelection(item);
  }
  
  /** @private */
  _onItemRemoved(item) {
    this._setParent();
  
    this._validateSelection(item);
  }
  
  /** @private */
  _validateSelection(item) {
    // gets the current selection
    const selection = this.items._getAllSelected();
    const selectionCount = selection.length;
    
    if (selectionCount > 1) {
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
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger(`${this.tagName.toLowerCase()}:change`, {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @private */
  _moveItems() {
    Array.prototype.forEach.call(this.querySelectorAll('coral-shell-suborganization'), (item) => {
      if (!this._elements.items.contains(item)) {
        this._elements.items.appendChild(item);
      }
    });
  }
  
  /** @private */
  _setParent() {
    const hasChildren = this.items.length !== 0;
    
    if (hasChildren) {
      this.removeAttribute('role');
      this.removeAttribute('tabindex');
    }
    else {
      // Be accessible
      this.setAttribute('role', 'button');
      this.setAttribute('tabindex', 0);
    }
    
    this.classList.toggle('is-parent', hasChildren);
  }
  
  /** @private */
  _onClick() {
    if (this.items.length !== 0) {
      // You can't be selected if you have sub-organizations
      return;
    }
    
    this.selected = true;
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['name', 'selected']); }
  
  /** @ignore */
  connectedCallback() {
    this.classList.add(...CLASSNAMES);
  
    // Move items into the right place
    this._moveItems();
  
    // Move items before calling the voracious ListItem render to support cloneNode
    super.connectedCallback();
  
    this.setAttribute('id', this.id || commons.getUID());
    const items = this.querySelector(`#${this.id} > ._coral-Shell-orgSwitcher-subitems`);
    
    if (items) {
      this._elements.items = items;
      this._elements.checkmark = this.querySelector(`#${this.id} > ._coral-Shell-orgSwitcher-item-checkmark`);
      this._items._container = this._elements.items;
    }
    else {
      // Render template
      const frag = document.createDocumentFragment();
  
      frag.appendChild(this._elements.checkmark);
      frag.appendChild(this._elements.items);
      this.appendChild(frag);
  
      this._elements.icon.size = Icon.size.SMALL;
    }
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
  
    this._setParent();
  }
  
  /**
   Triggered when a {@link ShellOrganization} selection changed.
   
   @typedef {CustomEvent} coral-shell-organization:_selectedchanged
   
   @private
   */
}

export default ShellOrganization;
