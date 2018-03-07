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
import {transform, validate, Keys} from '/coralui-util';

// Key codes
const PAGE_UP = 33;
const PAGE_DOWN = 34;
const LEFT_ARROW = 37;
const UP_ARROW = 38;

/**
 Enumeration for {@link Accordion} variants.
 
 @typedef {Object} AccordionVariantEnum
 
 @property {String} DEFAULT
 Default look and feel.
 @property {String} QUIET
 Not supported. Falls back to DEFAULT.
 @property {String} LARGE
 Not supported. Falls back to DEFAULT.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet',
  LARGE: 'large'
};

// the accordions's base classname
const CLASSNAME = '_coral-Accordion';

/**
 @class Coral.Accordion
 @classdesc An Accordion component consisting of multiple collapsible items.
 @htmltag coral-accordion
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Accordion extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'click coral-accordion-item:not([disabled]) coral-accordion-item-label': '_onItemClick',
  
      'key:space coral-accordion-item-label': '_onToggleItemKey',
      'key:return coral-accordion-item-label': '_onToggleItemKey',
      'key:pageup coral-accordion-item-label': '_focusPreviousItem',
      'key:left coral-accordion-item-label': '_focusPreviousItem',
      'key:up coral-accordion-item-label': '_focusPreviousItem',
      'key:pagedown coral-accordion-item-label': '_focusNextItem',
      'key:right coral-accordion-item-label': '_focusNextItem',
      'key:down coral-accordion-item-label': '_focusNextItem',
      'key:home coral-accordion-item-label': '_onHomeKey',
      'key:end coral-accordion-item-label': '_onEndKey',
      'keydown coral-accordion-item-label': '_onItemContentKeyDown',
      
      // private
      'coral-accordion-item:_selectedchanged': '_onItemSelectedChanged'
    });
    
    // Used for eventing
    this._oldSelection = [];
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Accordion's variant. See {@link AccordionVariantEnum}.
   
   @type {String}
   @default AccordionVariantEnum.DEFAULT
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
        itemTagName: 'coral-accordion-item',
        // allows accordions to be nested
        itemSelector: ':scope > coral-accordion-item',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
    return this._items;
  }
  
  /**
   Indicates whether the accordion accepts multiple selected items.
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
    
    this.setAttribute('aria-multiselectable', this._multiple);
    
    this._validateSelection();
  }
  
  /**
   Returns an Array containing the set selected items.
   @type {Array.<AccordionItem>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }
  
  /**
   Returns the first selected item in the Accordion. The value <code>null</code> is returned if no element is
   selected.
   @type {AccordionItem}
   @readonly
   */
  get selectedItem() {
    return this.items._getAllSelected()[0] || null;
  }
  
  /** @private **/
  get _tabTarget() {
    return this.__tabTarget || null;
  }
  set _tabTarget(value) {
    this.__tabTarget = value;
    
    // Set all but the current set _tabTarget to not be a tab target:
    this.items.getAll().forEach((item) => {
      item._isTabTarget = item === value;
    });
  }
  
  /** @private */
  _onHomeKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getFirstSelectable());
  }
  
  /** @private */
  _onEndKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getLastSelectable());
  }
  
  /**
   References:
   http://www.w3.org/WAI/PF/aria-practices/#accordion &
   
   Handlers for when focus is on an element inside of the panel:
   http://test.cita.illinois.edu/aria/tabpanel/tabpanel2.php
   
   @private
   */
  _onItemContentKeyDown(event) {
    // Required since sometimes the value is a number
    const key = parseFloat(event.keyCode);
    const item = event.matchedTarget.parentNode;
    
    switch (key) {
      case UP_ARROW:
      case LEFT_ARROW:
        // Set focus on the tab button for the currently displayed tab.
        if ((event.metaKey || event.ctrlKey) && Keys.filterInputs(event)) {
          event.preventDefault();
          event.stopPropagation();
          
          this._focusItem(item);
        }
        break;
      case PAGE_UP:
        // Show the previous tab and set focus on its corresponding tab button. Shows the last tab in the panel if
        // current tab is the first one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          
          const prevItem = this.items._getPreviousSelectable(item);
          this._toggleItemSelection(prevItem);
          this._focusItem(prevItem);
        }
        break;
      case PAGE_DOWN:
        // Show the next tab and set focus on its corresponding tab button. Shows the first tab in the panel if current
        // tab is the last one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          
          const nextItem = this.items._getNextSelectable(item);
          this._toggleItemSelection(nextItem);
          this._focusItem(nextItem);
        }
        break;
    }
  }
  
  /** @private */
  _focusPreviousItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getPreviousSelectable(event.target.parentNode));
  }
  
  /** @private */
  _focusNextItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getNextSelectable(event.target.parentNode));
  }
  
  /** @private */
  _onItemClick(event) {
    // Clickable elements included in an item header shouldn't automatically trigger the selection of that item
    if (event.target.hasAttribute('coral-interactive') || event.target.closest('[coral-interactive]')) {
      return;
    }
    
    // The click was performed on the header so we select the item (parentNode) the selection is toggled
    const item = event.target.closest('coral-accordion-item');
    if (item) {
      event.preventDefault();
      event.stopPropagation();
      
      this._toggleItemSelection(item);
      this._focusItem(item);
    }
  }
  
  /** @private */
  _onToggleItemKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const item = event.target.parentNode;
    this._toggleItemSelection(item);
    this._focusItem(item);
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  /** @private */
  _validateSelection(item) {
    const selectedItems = this.selectedItems;
    
    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
      item = item || selectedItems[selectedItems.length - 1];
      
      if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
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
    
    this._resetTabTarget();
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && this._arraysAreDifferent(selectedItems, oldSelection)) {
      // We differentiate whether multiple is on or off and return an array or HTMLElement respectively
      if (this.multiple) {
        this.trigger('coral-accordion:change', {
          oldSelection: oldSelection,
          selection: selectedItems
        });
      }
      else {
        // Return all items if we just switched from multiple=true to multiple=false and we had >1 selected items
        this.trigger('coral-accordion:change', {
          oldSelection: oldSelection.length > 1 ? oldSelection : oldSelection[0] || null,
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
      diff = oldSelection.filter((item) => selection.indexOf(item) === -1);
    }
  
    // since we guarantee that they are arrays, we can start by comparing their size
    return oldSelection.length !== selection.length || diff.length !== 0;
  }
  
  /**
   Determine what item should get focus (if any) when the user tries to tab into the accordion. This should be the
   first selected panel, or the first selectable panel otherwise. When neither is available, to Accordion cannot be
   tabbed into.
   
   @private
   */
  _resetTabTarget() {
    if (!this._resetTabTargetScheduled) {
      this._resetTabTargetScheduled = true;
      
      const self = this;
      window.requestAnimationFrame(() => {
        self._resetTabTargetScheduled = false;
        
        // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
        const selectedItems = self.items._getAllSelected();
  
        self._tabTarget = selectedItems.length ? selectedItems[0] : self.items._getFirstSelectable();
      });
    }
  }
  
  /** @private */
  _toggleItemSelection(item) {
    if (item) {
      item[item.hasAttribute('selected') ? 'removeAttribute' : 'setAttribute']('selected', '');
    }
  }
  
  /** @private */
  _focusItem(item) {
    if (item) {
      item.focus();
    }
    
    this._tabTarget = item;
  }
  
  /**
   Returns {@link Accordion} variants.
   
   @return {AccordionVariantEnum}
   */
  static get variant() { return variant; }

  /** @ignore */
  static get observedAttributes() {
    return ['variant', 'multiple'];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-multiselectable', this.multiple);
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItems;
    
    // Don't trigger animations on rendering
    window.requestAnimationFrame(() => {
      this.classList.add(`${CLASSNAME}--animated`);
    });
  }
  
  /**
   Triggered when {@link Accordion} selected item has changed.
   
   @typedef {CustomEvent} coral-accordion:change
   
   @property {AccordionItem} detail.oldSelection
   The prior selected item(s).
   @property {AccordionItem} detail.selection
   The newly selected item(s).
   */
}

export default Accordion;
