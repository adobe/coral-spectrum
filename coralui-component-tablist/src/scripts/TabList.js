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
import {transform, validate, commons} from 'coralui-util';
import getTarget from './getTarget';

/**
 Enumeration representing the TabList size.
 
 @memberof Coral.TabList
 @enum {String}
 */
const size = {
  /** A medium-sized tablist. This is the default. */
  MEDIUM: 'M',
  /** A large-sized tablist, typically used for headers. */
  LARGE: 'L'
};

/**
 TabList orientations.
 
 @enum {String}
 @memberof Coral.TabList
 */
const orientation = {
  /** Horizontal TabList, this is the default value. */
  HORIZONTAL: 'horizontal',
  /** Vertical TabList. */
  VERTICAL: 'vertical'
};

// the tablist's base classname
const CLASSNAME = 'coral3-TabList';

/**
 @class Coral.TabList
 @classdesc A TabList component
 @htmltag coral-tablist
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class TabList extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Attach events
    this.on({
      'click > coral-tab': '_onTabClick',
      'key:home > coral-tab': '_onHomeKey',
      'key:end > coral-tab': '_onEndKey',
      'key:pagedown > coral-tab': '_selectNextItem',
      'key:right > coral-tab': '_selectNextItem',
      'key:down > coral-tab': '_selectNextItem',
      'key:pageup > coral-tab': '_selectPreviousItem',
      'key:left > coral-tab': '_selectPreviousItem',
      'key:up > coral-tab': '_selectPreviousItem',
      
      // private
      'coral-tab:_selectedchanged': '_onItemSelectedChanged',
      'coral-tab:_validateselection': '_onValidateSelection'
    });
    
    // Used for eventing
    this._oldSelection = null;
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
    
  }
  
  /**
   The Collection Interface that allows interacting with the Coral.Tag items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.TagList#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-tab',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved,
      });
    }
    return this._items;
  }
  
  /**
   The selected item in the TabList.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.TabList#
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /**
   The target component that will be linked to the TabList. It accepts either a CSS selector or a DOM element. If a
   CSS Selector is provided, the first matching element will be used. Items will be selected based on the index. If
   both target and {@link Coral.Tab#target} are set, the second will have higher priority.
   
   @type {?HTMLElement|String}
   @default null
   @htmlattribute target
   @memberof Coral.TabList#
   */
  get target() {
    return typeof this._target === 'string' ? this._target : (this._target || null);
  }
  set target(value) {
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;
      
      // we do in case the target was not yet in the DOM
      window.requestAnimationFrame(function() {
        const realTarget = getTarget(this._target);
  
        // we add proper accessibility if available
        if (realTarget) {
    
          const tabItems = this.items.getAll();
          const panelItems = realTarget.items ? realTarget.items.getAll() : realTarget.children;
    
          // we need to add a11y to all component, no matter if they can be perfectly paired
          const maxItems = Math.max(tabItems.length, panelItems.length);
    
          let tab;
          let panel;
          for (let i = 0; i < maxItems; i++) {
      
            tab = tabItems[i];
            panel = panelItems[i];
      
            // if the tab has its own target, we assume the target component will handle its own accessibility. if the
            // target is an empty string we simply ignore it
            if (tab && tab.target && tab.target.trim() !== '') {
              continue;
            }
      
            if (tab && panel) {
              // sets the required ids
              tab.id = tab.id || commons.getUID();
              panel.id = panel.id || commons.getUID();
        
              // creates a 2 way binding for accessibility
              tab.setAttribute('aria-controls', panel.id);
              panel.setAttribute('aria-labelledby', tab.id);
            }
            else if (tab) {
              // cleans the aria since there is no matching panel
              tab.removeAttribute('aria-controls');
            }
            else {
              // cleans the aria since there is no matching tab
              panel.removeAttribute('aria-labelledby');
            }
          }
        }
      }.bind(this));
    }
  }
  
  /**
   The size of the TabList. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
   are available.
   
   @type {Coral.TabList.size}
   @default Coral.TabList.size.MEDIUM
   @htmlattribute size
   @htmlattributereflected
   @memberof Coral.TabList#
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  
  set size(value) {
    value = transform.string(value).toUpperCase();
    
    if (validate.enumeration(size)(value)) {
      this._size = value;
      transform.reflect(this, 'size', this._size);
      
      this.classList[this._size === size.LARGE ? 'add' : 'remove'](`${CLASSNAME}--large`);
    }
  }
  
  /**
   Orientation of the TabList.
   
   @type {Coral.TabList.orientation}
   @default Coral.TabList.orientation.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   @memberof Coral.TabList#
   */
  get orientation() {
    return this._orientation || orientation.HORIZONTAL;
  }
  
  set orientation(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(orientation)(value)) {
      this._orientation = value;
      transform.reflect(this, 'orientation', this._orientation);
      
      this.classList[this._orientation === orientation.VERTICAL ? 'add' : 'remove'](`${CLASSNAME}--vertical`);
    }
  }
  
  /** @private */
  _onItemAdded(item) {
    if (!this.selectedItem) {
      item.setAttribute('selected', '');
    }
    else {
      this._validateSelection(item);
    }
  }
  
  /** @private */
  _onItemRemoved() {
    if (!this.selectedItem) {
      this._selectFirstItem();
    }
  }
  
  /** @private */
  _onTabClick(event) {
    event.preventDefault();
    
    const item = event.matchedTarget;
    this._toggleItemSelectionAndFocus(item);
  }
  
  /** @private */
  _onHomeKey(event) {
    event.preventDefault();
    
    const item = this.items._getFirstSelectable();
    this._toggleItemSelectionAndFocus(item);
  }
  
  /** @private */
  _onEndKey(event) {
    event.preventDefault();
    
    const item = this.items._getLastSelectable();
    this._toggleItemSelectionAndFocus(item);
  }
  
  /** @private */
  _selectNextItem(event) {
    event.preventDefault();
    
    const item = this.selectedItem;
    this._toggleItemSelectionAndFocus(this.items._getNextSelectable(item));
  }
  
  /** @private */
  _selectPreviousItem(event) {
    event.preventDefault();
    
    const item = this.selectedItem;
    this._toggleItemSelectionAndFocus(this.items._getPreviousSelectable(item));
  }
  
  /** @private */
  _toggleItemSelectionAndFocus(item) {
    if (item && !item.hasAttribute('selected')) {
      item.setAttribute('selected', '');
      item.focus();
    }
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  /** @private */
  _onValidateSelection(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection();
  }
  
  /** @private */
  _selectFirstItem() {
    const item = this.items._getFirstSelectable();
    if (item) {
      item.setAttribute('selected', '');
    }
  }
  
  /** @private */
  _validateSelection(item) {
    let selectedItems = this.items._getAllSelected();
    
    if (item) {
      // Deselected item
      if (!item.hasAttribute('selected') && !selectedItems.length) {
        const siblingItem = this.items._getNextSelectable(item);
        // Next selectable item is forced to be selected if selection is cleared
        if (item !== siblingItem) {
          siblingItem.setAttribute('selected', '');
        }
      }
      // Selected item
      else if (item.hasAttribute('selected') && selectedItems.length) {
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
    else if (selectedItems.length > 1) {
      // If multiple items are selected, the last one wins
      item = selectedItems[selectedItems.length - 1];
      
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
    // First selectable item is forced to be selected if no selection at all
    else if (!selectedItems.length) {
      this._selectFirstItem();
    }
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-tablist:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  // Expose enums
  static get size() {
    return size;
  }
  
  static get orientation() {
    return orientation;
  }
  
  static get observedAttributes() {
    return ['target', 'size', 'orientation'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._size) {this.size = size.MEDIUM;}
    if (!this._orientation) {this.orientation = orientation.HORIZONTAL;}
    
    // adds the role to support accessibility
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-multiselectable', 'false');
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItem;
  }
  
  /**
   Triggered when the selected item has changed.
   
   @event Coral.TabList#coral-tablist:change
   
   @param {Object} event Event object
   @param {Object} event.detail
   @param {HTMLElement} event.detail.oldSelection
   The prior selected item(s).
   @param {HTMLElement} event.detail.selection
   The newly selected item(s).
   */
}

export default TabList;
