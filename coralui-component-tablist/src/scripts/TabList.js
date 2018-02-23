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

import {ComponentMixin} from '/coralui-mixin-component';
import {SelectableCollection} from '/coralui-collection';
import {transform, validate, commons} from '/coralui-util';
import line from '../templates/line';
import getTarget from './getTarget';

/**
 Enumeration for {@link TabList} sizes.
 
 @typedef {Object} TabListSizeEnum
 
 @property {String} MEDIUM
 A medium-sized tablist. This is the default.
 @property {String} LARGE
 Not supported. Falls back to MEDIUM.
 */
const size = {
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

/**
 Enumeration for {@link TabList} variant.
 
 @typedef {Object} TabListVariantEnum
 
 @property {String} PANEL
 A panel TabList. This is the default value.
 @property {String} PAGE
 A page TabList.
 @property {String} ANCHORED
 An anchored TabList.
 */
const variant = {
  PANEL: 'panel',
  PAGE: 'page',
  ANCHORED: 'anchored'
};

// the tablist's base classname
const CLASSNAME = 'coral3-TabList';

// An array of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

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
   The TabList variant style to use. See {@link TabListVariantEnum}.
   
   @type {String}
   @default TabListVariantEnum.PANEL
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.PANEL;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.PANEL;
    this._reflectAttribute('variant', this._variant);
    
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);
    
    // Set new variant class
    this.classList.add(`${CLASSNAME}--${this._variant}`);
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
      
      const self = this;
      // we do in case the target was not yet in the DOM
      window.requestAnimationFrame(() => {
        const realTarget = getTarget(self._target);
  
        // we add proper accessibility if available
        if (realTarget) {
    
          const tabItems = self.items.getAll();
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
    
    this.classList[this._size === size.LARGE ? 'add' : 'remove'](`${CLASSNAME}--large`);
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
        }, this);
  
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
      }, this);
  
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
            this._elements.line.style.top = '';
            this._elements.line.style.height = '';
          }
  
          this._elements.line.style.left = `${left}px`;
          this._elements.line.style.width = `${width}px`;
        }
        else if (this.orientation === orientation.VERTICAL) {
          const top = selectedItem.offsetTop;
          const height = selectedItem.clientHeight;
  
          // Orientation changed
          if (clear) {
            this._elements.line.style.left = '';
            this._elements.line.style.width = '';
          }
  
          this._elements.line.style.top = `${top}px`;
          this._elements.line.style.height = `${height}px`;
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
  
  /**
   Returns {@link TabList} variants.
   
   @return {TabListVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return ['target', 'size', 'orientation', 'variant'];
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
    if (!this._variant) { this.variant = variant.PANEL; }
    
    // Support cloneNode
    const template = this.querySelector('.coral3-TabList-item-line');
    if (template) {
      template.remove();
    }
  
    // Remove the object if it's already there
    const object = this.querySelector('object');
    if (object && object.parentNode === this) {
      this.removeChild(object);
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
