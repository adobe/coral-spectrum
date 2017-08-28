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
import {transform, validate} from 'coralui-util';

/**
 Enum for CycleButton.Item displayMode values.
 
 @enum {String}
 @memberof Coral.CycleButton.Item
 */
const displayMode = {
  /** Icon display mode **/
  ICON: 'icon',
  /** Text display mode **/
  TEXT: 'text',
  /** Icon and text display mode **/
  ICON_TEXT: 'icontext',
  /** Inherit display mode **/
  INHERIT: 'inherit'
};

/**
 @class Coral.CycleButton.Item
 @classdesc A CycleButton Item component
 @htmltag coral-cyclebutton-item
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class CycleButtonItem extends Component(HTMLElement) {
  constructor() {
    super();
  }
  
  /**
   The Item's icon. See {@link Coral.Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   @memberof Coral.CycleButton.Item#
   */
  get icon() {
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
    
    this.trigger('coral-cyclebutton-item:_iconchanged');
  }
  
  /**
   Item content element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.CycleButton.Item#
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
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
   @memberof Coral.CycleButton.Item#
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
   @memberof Coral.CycleButton.Item#
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
   
   @type {Coral.CycleButton.Item.displayMode}
   @default Coral.CycleButton.Item.displayMode.INHERIT
   @htmlattribute displaymode
   @memberof Coral.CycleButton.Item#
   */
  get displayMode() {
    return this._displayMode || displayMode.INHERIT;
  }
  set displayMode(value) {
    value  = transform.string(value).toLowerCase();
    this._displayMode = validate.enumeration(displayMode)(value) && value || displayMode.INHERIT;
    this._reflectAttribute('displaymode', this._displayMode);
    
    this.trigger('coral-cyclebutton-item:_displaymodechanged')
  }
  
  // Expose enums
  static get displayMode() {return displayMode;}
  
  static get observedAttributes() {
    return ['selected', 'disabled', 'icon', 'displayMode', 'displaymode'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    // adds the role to support accessibility
    this.setAttribute('role', 'option');
  
    // Default reflected attributes
    if (!this._displayMode) {this.displayMode = displayMode.INHERIT;}
  }
}

export default CycleButtonItem;
