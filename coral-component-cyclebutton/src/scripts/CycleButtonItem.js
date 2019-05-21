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

import {ComponentMixin} from '../../../coral-mixin-component';
import {transform, validate} from '../../../coral-utils';

/**
 Enum for {CycleButtonItem} display options.
 
 @typedef {Object} CycleButtonItemDisplayModeEnum
 
 @property {String} ICON
 Icon display mode.
 @property {String} TEXT
 Text display mode.
 @property {String} ICON_TEXT
 Icon and text display mode.
 @property {String} INHERIT
 Inherit display mode.
 */
const displayMode = {
  ICON: 'icon',
  TEXT: 'text',
  ICON_TEXT: 'icontext',
  INHERIT: 'inherit'
};

/**
 @class Coral.CycleButton.Item
 @classdesc A CycleButton Item component
 @htmltag coral-cyclebutton-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CycleButtonItem extends ComponentMixin(HTMLElement) {
  /**
   The Item's icon. See {@link Coral.Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
    
    this.trigger('coral-cyclebutton-item:_iconchanged');
  }
  
  // @compat
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether the Item is disabled. When set to true, this will prevent every user interacting with it.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this.disabled);
    this.setAttribute('aria-disabled', this.disabled);
    
    if (this._disabled && this.selected) {
      this.selected = false;
    }
    
    if (!this._disabled && !this.selected) {
      // We inform the parent to verify if this item should be selected because it's the only one left
      this.trigger('coral-cyclebutton-item:_validateselection');
    }
  }
  
  /**
   Whether the Item is selected.
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    value = transform.booleanAttr(value);
    
    if (!value || value && !this.disabled) {
      this._selected = value;
      this._reflectAttribute('selected', this.disabled ? false : this._selected);
      
      this.classList.toggle('is-selected', this._selected);
      this.setAttribute('aria-selected', this._selected);
      
      this.trigger('coral-cyclebutton-item:_selectedchanged');
    }
  }
  
  /**
   The displayMode to be used when the particular item is selected. When this value is set to <code>inherit</code>
   it will defer to the component level displayMode. If the selected item does not have the necessary icon or text
   information, then fallback to show whichever is available. The appearance of collapsed items in the popover are
   not affected by this property.
   See {@link CycleButtonItemDisplayModeEnum}.
   
   @type {String}
   @default CycleButtonItemDisplayModeEnum.INHERIT
   @htmlattribute displaymode
   @htmlattributereflected
   */
  get displayMode() {
    return this._displayMode || displayMode.INHERIT;
  }
  set displayMode(value) {
    value = transform.string(value).toLowerCase();
    this._displayMode = validate.enumeration(displayMode)(value) && value || displayMode.INHERIT;
    this._reflectAttribute('displaymode', this._displayMode);
    
    this.trigger('coral-cyclebutton-item:_displaymodechanged');
  }
  
  /**
   Inherited from {@link ComponentMixin#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.content || this).textContent.replace(/\s{2,}/g, ' ').trim() || this.icon :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /**
   Returns {@link CycleButtonItem} display options.
   
   @return {CycleButtonItemDisplayModeEnum}
   */
  static get displayMode() { return displayMode; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'icon', 'displayMode', 'displaymode']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    // adds the role to support accessibility
    this.setAttribute('role', 'option');
  
    // Default reflected attributes
    if (!this._displayMode) { this.displayMode = displayMode.INHERIT; }
  }
}

export default CycleButtonItem;
