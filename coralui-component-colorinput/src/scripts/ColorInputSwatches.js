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
import ColorInputAbstractSubviewMixin from './ColorInputAbstractSubviewMixin';
import ColorInputSwatch from './ColorInputSwatch';
import Color from './Color';
import {SelectableCollection} from '/coralui-collection';
import swatchesHeader from '../templates/swatchesHeader';
import {commons} from '/coralui-util';

const CLASSNAME = '_coral-ColorInput-swatches';

/**
 @class Coral.ColorInput.Swatches
 @classdesc A ColorInput Swatches component
 @htmltag coral-colorinput-swatches
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ColorInputAbstractSubviewMixin}
 */
class ColorInputSwatches extends ColorInputAbstractSubviewMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(commons.extend(this._events, {
      'click coral-colorinput-swatch': '_onSwatchClicked',
      'keydown ._coral-ColorInput-swatch': '_onKeyDown',
      'capture:focus coral-colorinput-swatch': '_onFocus',
  
      // private
      'coral-colorinput-swatch:_selectedchanged': '_onItemSelectedChanged'
    }));
    
    // Templates
    this._elements = {};
    swatchesHeader.call(this._elements);
  
    // Used for eventing
    this._oldSelection = null;
  
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
        itemTagName: 'coral-colorinput-swatch',
        onItemAdded: this._validateSelection
      });
    }
    return this._items;
  }
  
  /**
   The selected item.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  /** @private */
  _validateSelection(item) {
    const selectedItems = this.items._getAllSelected();
    
    // Last selected item wins
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
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      // update hidden fields
      if (selectedItem) {
        this.value = selectedItem.value;
      }
      
      this.trigger('coral-colorinput-swatches:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @ignore */
  _beforeOverlayOpen() {
    // relayout swatches if items have been added/removed/moved...
    const colorElements = this._colorinput.items.getAll();
    let colorsElementsChanged = false;
    if (!this._cachedColorElements) {
      colorsElementsChanged = true;
    }
    else if (this._cachedColorElements.length !== colorElements.length) {
      colorsElementsChanged = true;
    }
    else if (this._cachedColorElements.length === colorElements.length) {
      for (let i = 0; i < colorElements.length; i++) {
        if (this._cachedColorElements[i] !== colorElements[i]) {
          colorsElementsChanged = true;
          break;
        }
      }
    }
  
    this._cachedColorElements = colorElements;
  
    if (colorsElementsChanged) {
      this._layoutColorSwatch();
    }
  
    this._ensureKeyboardAccess();
  }
  
  /** @ignore */
  _onColorInputChange() {
    this._ensureKeyboardAccess();
  }
  
  /**
   If no swatch is selected, make sure that the first swatch is tabbable
   @ignore
   */
  _ensureKeyboardAccess() {
    if (!this.querySelector('coral-colorinput-swatch[selected]')) {
      const firstSwatch = this.querySelector('coral-colorinput-swatch');
      if (firstSwatch) {
        firstSwatch.tabIndex = 0;
      }
    }
  }
  
  /** @ignore */
  _layoutColorSwatch() {
    // Clear container before adding elements to avoid multiple addition
    this._elements.swatchesContainer.innerHtml = '';
    const colors = this._colorinput.items.getAll();
    
    const colorsLength = colors.length;
    let swatchSelected = false;
    for (let colorCount = 0; colorCount < colorsLength; colorCount++) {
      const color = colors[colorCount];
      
      const swatch = new ColorInputSwatch();
      this._elements.swatchesContainer.appendChild(swatch);
      swatch.targetColor = color;
      
      if (color.selected) {
        swatch.selected = color.selected;
        swatchSelected = true;
      }
      
      swatch.setAttribute('aria-selected', swatch.selected);
      
      // Update color button tabindex depending on selected state
      swatch.tabIndex = swatch.selected ? 0 : -1;
    }
    
    // If no swatch is selected, make sure that the first swatch is focusable
    if (!swatchSelected) {
      this._ensureKeyboardAccess();
    }
  }
  
  /** @ignore */
  _onSwatchClicked(event) {
    event.stopPropagation();
    
    const colorButton = event.target;
    const swatch = colorButton.closest('coral-colorinput-swatch');
    
    if (!swatch.selected) {
      const color = new Color();
      color.value = swatch.targetColor ? swatch.targetColor.value : '';
      this._colorinput._setActiveColor(color);
      swatch.selected = true;
    }
    swatch.firstChild.focus();
  }
  
  /** @ignore */
  _onKeyDown(event) {
    const overlay = this._colorinput._elements.overlay;
    
    // only if overlay is open
    if (!overlay.open) {
      return;
    }
    
    const allItems = this.items.getAll();
    
    const currentIndex = allItems.indexOf(event.matchedTarget);
    let preventDefault = true;
    let newIndex = currentIndex;
    
    switch (event.which) {
      //return
      case 13:
        // Wait a frame before closing so that focus is restored correctly
        window.requestAnimationFrame(() => {
          overlay.open = false;
        });
        break;
      //left arrow
      case 37:
        newIndex -= 1;
        break;
      //up arrow
      case 38:
        newIndex -= 4;
        break;
      //right arrow
      case 39:
        newIndex += 1;
        break;
      //down arrow
      case 40:
        newIndex += 4;
        break;
      default:
        preventDefault = false;
        break;
    }
    
    // If any action has been taken prevent event propagation
    if (preventDefault) {
      event.preventDefault();
      
      if (newIndex < 0 || newIndex >= allItems.length) {
        return;
      }
      
      // show right page in carousel and focus right swatch
      const swatch = allItems[newIndex];
      const color = new Color();
      
      color.value = swatch.targetColor ? swatch.targetColor.value : '';
      this._colorinput._setActiveColor(color);
      swatch.selected = true;
      
      swatch.firstChild.focus();
    }
  }
  
  /**
   Ensure that only one swatch can receive tab focus at a time
   @ignore
   */
  _onFocus(event) {
    const allItems = this.items.getAll();
    
    for (let i = 0; i < allItems.length; i++) {
      const swatch = allItems[i];
      if (!swatch.contains(event.matchedTarget)) {
        swatch.tabIndex = -1;
      }
    }
    
    event.matchedTarget.tabIndex = 0;
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    this.setAttribute('role', 'listbox');
  
    // Support cloneNode
    const swatchesSubview = this.querySelector('._coral-ColorInput-swatchesSubview');
    if (swatchesSubview) {
      swatchesSubview.remove();
    }
  
    // add header
    this.appendChild(this._elements.swatchesSubview);
  
    // add accessibility label
    this.setAttribute('aria-labelledby', this._elements.swatchesHeaderTitle.id);
  
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
  }
}

export default ColorInputSwatches;
