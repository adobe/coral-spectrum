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
import BaseColorInputAbstractSubview from './BaseColorInputAbstractSubview';
import ColorInputSwatch from './ColorInputSwatch';
import Color from './Color';
import {SelectableCollection} from '../../../coral-collection';
import swatchesHeader from '../templates/swatchesHeader';
import {commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-ColorInput-swatches';

/**
 @class Coral.ColorInput.Swatches
 @classdesc A ColorInput Swatches component
 @htmltag coral-colorinput-swatches
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseColorInputAbstractSubview}
 */
class ColorInputSwatches extends BaseColorInputAbstractSubview(BaseComponent(HTMLElement)) {
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
    swatchesHeader.call(this._elements, {commons, i18n});
  
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
      });
      
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
      // return
      case 13:
        // Wait a frame before closing so that focus is restored correctly
        window.requestAnimationFrame(() => {
          overlay.open = false;
        });
        break;
      // left arrow
      case 37:
        newIndex -= 1;
        break;
      // up arrow
      case 38:
        newIndex -= 4;
        break;
      // right arrow
      case 39:
        newIndex += 1;
        break;
      // down arrow
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
