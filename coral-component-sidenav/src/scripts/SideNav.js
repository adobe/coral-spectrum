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
import {transform, validate, commons} from '../../../coral-utils';

const CLASSNAME = '_coral-SideNav';

/**
 Enumeration for {@link SideNav} variants.
 
 @typedef {Object} SideNavVariantEnum
 
 @property {String} DEFAULT
 A default sidenav.
 @property {String} MULTI_LEVEL
 A sidenav with multiple levels of indentation.
 */
const variant = {
  DEFAULT: 'default',
  MULTI_LEVEL: 'multilevel',
};

/**
 @class Coral.SideNav
 @classdesc A Side Navigation component to navigate the entire content of a product or a section.
 These can be used for a single level or a multi-level navigation.
 @htmltag coral-sidenav
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class SideNav extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Attach events
    this._delegateEvents({
      // Interaction
      'click a[is="coral-sidenav-item"]': '_onItemClick',
      
      // Accessibility
      'capture:focus a[is="coral-sidenav-item"].focus-ring': '_onItemFocusIn',
      'capture:blur a[is="coral-sidenav-item"]': '_onItemFocusOut',
      
      // Private
      'coral-sidenav-item:_selectedchanged': '_onItemSelectedChanged'
    });
    
    // Used for eventing
    this._oldSelection = null;
    
    // Level Collection
    this._levels = this.getElementsByTagName('coral-sidenav-level');
  
    // Heading Collection
    this._headings = this.getElementsByTagName('coral-sidenav-heading');
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  
    // Initialize content MO
    this._observer = new MutationObserver(this._handleMutations.bind(this));
    this._observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-sidenav-item',
        itemBaseTagName: 'a',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
    return this._items;
  }
  
  /**
   Returns the first selected item in the sidenav. The value <code>null</code> is returned if no element is
   selected.
   
   @type {SideNavItem}
   @readonly
   */
  get selectedItem() {
    return this.items._getFirstSelected();
  }
  
  /**
   The sidenav's variant. See {@link SideNavVariantEnum}.
   
   @type {String}
   @default SideNavVariantEnum.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
    
    this.classList.toggle(`${CLASSNAME}--multiLevel`, this._variant === variant.MULTI_LEVEL);
    
    if (this.variant === variant.MULTI_LEVEL) {
      // Don't hide the selected item level
      const selectedItem = this.selectedItem;
      const ignoreLevel = selectedItem && selectedItem.parentNode;
      
      // Hide every other level that doesn't contain the selected item
      for (let i = 0; i < this._levels.length; i++) {
        if (this._levels[i] !== ignoreLevel) {
          this._levels[i].setAttribute('_expanded', 'off');
        }
      }
    }
  }
  
  _onItemClick(event) {
    const item = event.matchedTarget;
    
    if (!item.selected) {
      item.selected = true;
    }
  }
  
  _onItemFocusIn(event) {
    const item = event.matchedTarget;
    
    item._elements.container.classList.add('focus-ring');
  }
  
  _onItemFocusOut(event) {
    const item = event.matchedTarget;
  
    item._elements.container.classList.remove('focus-ring');
  }
  
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  _validateSelection(item) {
    const selectedItems = this.items._getAllSelected();
    
    if (item && this.contains(item)) {
      // Deselect other selected items
      if (item.hasAttribute('selected') && selectedItems.length > 1) {
        selectedItems.forEach((selectedItem) => {
          if (selectedItem !== item) {
            // Don't trigger change events
            this._preventTriggeringEvents = true;
            selectedItem.removeAttribute('selected');
          }
        });
    
        // We can trigger change events again
        this._preventTriggeringEvents = false;
      }
      else if (!item.hasAttribute('selected') && selectedItems.length === 0) {
        // Force selection
        item.selected = true;
        
        return;
      }
  
      // Expand multi level
      this._expandLevels();
  
      // Notify of change
      this._triggerChangeEvent();
    }
    else if (selectedItems.length === 0) {
      // First item is selected by default on initialization
      item = this.items.first();
      if (item) {
        item.setAttribute('selected', '');
      }
  
      // Notify of change
      this._triggerChangeEvent();
    }
  }
  
  _expandLevels() {
    const selectedItem = this.selectedItem;
    let level = selectedItem.closest('coral-sidenav-level');
    
    // Expand until root
    while (level) {
      if (level.getAttribute('_expanded') !== 'on') {
        level.setAttribute('_expanded', 'on');
      }
      
      level = level.parentNode && level.parentNode.closest('coral-sidenav-level');
    }
    
    // Expand corresponding item level
    level = selectedItem.nextElementSibling;
    if (level && level.tagName === 'CORAL-SIDENAV-LEVEL') {
      level.setAttribute('_expanded', 'on');
    }
  }
  
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-sidenav:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
    
      this._oldSelection = selectedItem;
    }
  }
  
  _syncLevelwithHeading(level, heading, remove) {
    if (level && heading) {
      if (remove) {
        level.removeAttribute('aria-labelledby');
      }
      else {
        heading.id = heading.id || commons.getUID();
        level.setAttribute('aria-labelledby', heading.id);
      }
    }
  }
  
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      // Sync added levels and headings
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const addedNode = mutation.addedNodes[i];
  
        if (addedNode.nodeName === 'CORAL-SIDENAV-LEVEL') {
          this._syncLevelwithHeading(addedNode, addedNode.previousElementSibling);
        }
        else if (addedNode.nodeName === 'CORAL-SIDENAV-HEADING') {
          this._syncLevelwithHeading(addedNode.nextElementSibling, addedNode);
        }
      }
      
      // Sync removed levels
      for (let k = 0; k < mutation.removedNodes.length; k++) {
        const removedNode = mutation.removedNodes[k];
        
        if (removedNode.nodeName === 'CORAL-SIDENAV-LEVEL') {
          this._validateSelection();
        }
        else if (removedNode.nodeName === 'CORAL-SIDENAV-HEADING' && removedNode.id) {
          const level = this.querySelector('coral-sidenav-level[aria-labelledby="'+ removedNode.id +'"]');
          this._syncLevelwithHeading(level, removedNode, true);
        }
      }
    });
  }
  
  _onLevelAdded(level) {
    const neighbor = level.previousElementSibling;
    if (neighbor && neighbor.tagName === 'CORAL-SIDENAV-HEADING') {
      neighbor.id = neighbor.id || commons.getUID();
      level.setAttribute('aria-labelledby', neighbor.id);
    }
  }
  
  _onLevelRemoved(level) {
    const selectedItem = this.selectedItem;
    if (level.contains(selectedItem)) {
      this._validateSelection(selectedItem);
    }
  }
  
  /**
   Returns {@link SideNav} variants.
   
   @return {SideNavVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['variant']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    
    for (let i = 0; i < this._headings.length; i++) {
      const heading = this._headings[i];
      this._syncLevelwithHeading(heading.nextElementSibling, heading);
    }
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItem;
  }
  
  /**
   Triggered when {@link SideNav} selected item has changed.
   
   @typedef {CustomEvent} coral-sidenav:change
   
   @property {SideNavItem} detail.oldSelection
   The prior selected item.
   @property {SideNavItem} detail.selection
   The newly selected item.
   */
}

export default SideNav;
