/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coral-mixin-component';
import {SelectableCollection} from '../../../coral-collection';
import {transform, validate, commons} from '../../../coral-utils';
import line from '../templates/line';
import getTarget from './getTarget';

/**
 Enumeration for {@link TabList} sizes.
 
 @typedef {Object} TabListSizeEnum
 
 @property {String} SMALL
 A small-sized tablist.
 @property {String} MEDIUM
 A medium-sized tablist. This is the default.
 @property {String} LARGE
 A large-sized tablist.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L'
};

/**
 Enumeration for {@link TabList} orientations.
 
 @typedef {Object} TabListOrientationEnum
 
 @property {String} HORIZONTAL
 Horizontal TabList, this is the default value.
 @property {String} VERTICAL
 Vertical TabList.
 */
const orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

// the tablist's base classname
const CLASSNAME = '_coral-Tabs';

/**
 @class Coral.TabList
 @classdesc A TabList component holds a collection of tabs.
 @htmltag coral-tablist
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class TabList extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {};
    line.call(this._elements);
    
    // Attach events
    this._delegateEvents({
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
      'coral-tab:_validateselection': '_onValidateSelection',
      'coral-tab:_sizechanged': '_setLine'
    });
    
    // Used for eventing
    this._oldSelection = null;
    
    this._setLine = this._setLine.bind(this);
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-tab',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
    return this._items;
  }
  
  /**
   The selected item in the TabList.
   
   @type {HTMLElement}
   @readonly
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
   */
  get target() {
    return typeof this._target === 'string' ? this._target : this._target || null;
  }
  set target(value) {
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;
      
      // we do in case the target was not yet in the DOM
      window.requestAnimationFrame(() => {
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
      });
    }
  }
  
  /**
   The size of the TabList. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
   are available.
   See {@link TabListSizeEnum}.
   
   @type {String}
   @default TabListSizeEnum.MEDIUM
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.MEDIUM;
    this._reflectAttribute('size', this._size);
  
    // Remove all variant classes
    this.classList.remove(`${CLASSNAME}--compact`, `${CLASSNAME}--quiet`);
    
    if (this._size === size.SMALL) {
      this.classList.add(`${CLASSNAME}--compact`);
    }
    else if (this._size === size.LARGE) {
      this.classList.add(`${CLASSNAME}--quiet`);
    }
  }
  
  /**
   Orientation of the TabList. See {@link TabListOrientationEnum}.
   
   @type {String}
   @default TabListOrientationEnum.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   */
  get orientation() {
    return this._orientation || orientation.HORIZONTAL;
  }
  set orientation(value) {
    value = transform.string(value).toLowerCase();
    this._orientation = validate.enumeration(orientation)(value) && value || orientation.HORIZONTAL;
    this._reflectAttribute('orientation', this._orientation);
  
    this.classList.toggle(`${CLASSNAME}--vertical`, this._orientation === orientation.VERTICAL);
    this.classList.toggle(`${CLASSNAME}--horizontal`, this._orientation === orientation.HORIZONTAL);
    
    this._setLine(true);
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
  
    this._trackEvent('click', 'coral-tab', event, item);
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
    const selectedItems = this.items._getAllSelected();
    
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
      else if (item.hasAttribute('selected') && selectedItems.length > 1) {
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
    }
    else if (selectedItems.length > 1) {
      // If multiple items are selected, the last one wins
      item = selectedItems[selectedItems.length - 1];
      
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
    // First selectable item is forced to be selected if no selection at all
    else if (!selectedItems.length) {
      this._selectFirstItem();
    }
    
    this._setLine();
    
    this._triggerChangeEvent();
  }
  
  _setLine(clear) {
    window.requestAnimationFrame(() => {
      const selectedItem = this.selectedItem;
      
      // Position line under the selected item
      if (selectedItem) {
        if (this.orientation === orientation.HORIZONTAL) {
          const padding = window.parseInt(window.getComputedStyle(selectedItem).paddingLeft);
          const left = selectedItem.offsetLeft + padding;
          const width = selectedItem.clientWidth - padding * 2;
  
          // Orientation changed
          if (clear) {
            this._elements.line.style.height = '';
          }
          
          this._elements.line.style.width = `${width}px`;
          this._elements.line.style.transform = `translate(${left}px, 0)`;
        }
        else if (this.orientation === orientation.VERTICAL) {
          const top = selectedItem.offsetTop;
          const height = selectedItem.clientHeight;
  
          // Orientation changed
          if (clear) {
            this._elements.line.style.width = '';
          }
          
          this._elements.line.style.height = `${height}px`;
          this._elements.line.style.transform = `translate(0, ${top}px)`;
        }
        
        this._elements.line.hidden = false;
      }
      else {
        // Hide line if no selected item
        this._elements.line.hidden = true;
      }
    });
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
  
  /**
   Returns {@link TabList} sizes.
   
   @return {TabListSizeEnum}
   */
  static get size() {
    return size;
  }
  
  /**
   Returns {@link TabList} orientation options.
   
   @return {TabListOrientationEnum}
   */
  static get orientation() {
    return orientation;
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['target', 'size', 'orientation']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // adds the role to support accessibility
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-multiselectable', 'false');
    
    // Default reflected attributes
    if (!this._size) { this.size = size.MEDIUM; }
    if (!this._orientation) { this.orientation = orientation.HORIZONTAL; }
    
    // Support cloneNode
    const template = this.querySelector('._coral-Tabs-selectionIndicator');
    if (template) {
      template.remove();
    }
    
    // Insert tab line
    this.appendChild(this._elements.line);
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItem;
    
    // Display line once tabList is shown
    commons.addResizeListener(this, this._setLine);
  }
  
  /**
   Triggered when the {@link TabList} selected item has changed.
 
   @typedef {CustomEvent} coral-tablist:change
   
   @property {Tab} event.detail.oldSelection
   The prior selected item(s).
   @property {Tab} event.detail.selection
   The newly selected item(s).
   */
}

export default TabList;
