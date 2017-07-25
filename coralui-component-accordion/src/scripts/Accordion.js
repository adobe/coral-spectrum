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
import {transform, validate} from 'coralui-util';

// Key codes
const PAGE_UP = 33;
const PAGE_DOWN = 34;
const LEFT_ARROW = 37;
const UP_ARROW = 38;

/**
 Enum for Accordion variant values.
 
 @enum {String}
 @memberof Coral.Accordion
 */
const variant = {
  /** Default Tabpanel look and feel. */
  DEFAULT: 'default',
  /** Quiet variant with minimal borders. */
  QUIET: 'quiet',
  /** Large variant, typically used inside a navigation rail since it does not have borders on the sides. */
  LARGE: 'large'
};

// the accordions's base classname
const CLASSNAME = 'coral3-Accordion';

// builds a string with all the possible class names to be able to handle variant changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
}

/**
 @class Coral.Accordion
 @classdesc An Accordion component
 @htmltag coral-accordion
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Accordion extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Attach events
    this.on({
      'click coral-accordion-item:not([disabled]) [handle="acHeader"]': '_onItemClick',
  
      'key:space [handle="acHeader"]': '_onToggleItemKey',
      'key:return [handle="acHeader"]': '_onToggleItemKey',
      'key:pageup [handle="acHeader"]': '_focusPreviousItem',
      'key:left [handle="acHeader"]': '_focusPreviousItem',
      'key:up [handle="acHeader"]': '_focusPreviousItem',
      'key:pagedown [handle="acHeader"]': '_focusNextItem',
      'key:right [handle="acHeader"]': '_focusNextItem',
      'key:down [handle="acHeader"]': '_focusNextItem',
      'key:home [handle="acHeader"]': '_onHomeKey',
      'key:end [handle="acHeader"]': '_onEndKey',
      'keydown [handle="acContent"]': '_onItemContentKeyDown',
      
      // private
      'coral-accordion-item:_selectedchanged': '_onItemSelectedChanged'
    });
    
    // Used for eventing
    this._oldSelection = [];
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Accordion's variant.
   
   @type {Coral.Accordion.variant}
   @default Coral.Accordion.variant.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Accordion#
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);

    this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);

    if (this._variant !== variant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Accordion#
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
        onItemRemoved: this._validateSelection,
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
   @memberof Coral.Accordion#
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
   @type {Array.<HTMLElement>}
   @readonly
   @memberof Coral.Accordion#
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }
  
  /**
   Returns the first selected item in the Accordion. The value <code>null</code> is returned if no element is
   selected.
   @type {?HTMLElement}
   @readonly
   @memberof Coral.Accordion#
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
    this.items.getAll().forEach(function(item) {
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
        if ((event.metaKey || event.ctrlKey) && Coral.Keys.filterInputs(event)) {
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
    let selectedItems = this.selectedItems;
    
    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
      item = item || selectedItems[selectedItems.length - 1];
      
      if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
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
          oldSelection: oldSelection.length > 1 ? oldSelection : (oldSelection[0] || null),
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
      diff = oldSelection.filter(function(item) {
        return selection.indexOf(item) === -1;
      });
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
      
      window.requestAnimationFrame(function() {
        this._resetTabTargetScheduled = false;
        
        // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
        const selectedItems = this.items._getAllSelected();
        
        this._tabTarget = selectedItems.length ? selectedItems[0] : this.items._getFirstSelectable();
      }.bind(this));
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
  
  // Expose enum
  static get variant() {return variant;}

  static get observedAttributes() {
    return ['variant', 'multiple'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.DEFAULT;}
    
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-multiselectable', this.multiple);
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItems;
  }
  
  /**
   Triggered when the selected item has changed.
   
   @event Coral.Accordion#coral-accordion:change
   
   @param {Object} event Event object
   @param {Object} event.detail
   @param {HTMLElement} event.detail.oldSelection
   The prior selected item(s).
   @param {HTMLElement} event.detail.selection
   The newly selected item(s).
   */
}

export default Accordion;
