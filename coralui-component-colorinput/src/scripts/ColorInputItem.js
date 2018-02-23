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
import Color from './Color';
import {transform} from '/coralui-util';

/**
 @class Coral.ColorInput.Item
 @classdesc A ColorInput Item component
 @htmltag coral-colorinput-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ColorInputItem extends ComponentMixin(HTMLElement) {
  /**
   The value of the color. This value can be set in different formats (HEX, RGB, RGBA, HSB, HSL, HSLA and CMYK).
   Corrects a hex value, if it is represented by 3 or 6 characters with or without '#'.
   
   e.g:
   HEX:  #FFFFFF
   RGB:  rgb(16,16,16)
   RGBA: rgba(215,40,40,0.9)
   HSB: hsb(360,100,100)
   HSL: hsl(360,100,100)
   HSLA: hsla(360,100%,100%, 0.9)
   CMYK: cmyk(0,100,50,0)
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this._value || '';
  }
  set value(value) {
    // invalid values fallback to empty string
    const color = new Color();
    color.value = value;
    
    // invalid values fallback to empty string
    this._value = color.rgb !== null ? value : '';
    this._reflectAttribute('value', this._value);
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
    
    this._selected = value;
    this._reflectAttribute('selected', this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected);
    
    this.trigger('coral-colorinput-item:_selectedchanged');
  }
  
  /** @ignore */
  static get observedAttributes() {
    return ['selected', 'value'];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    // adds the role to support accessibility
    this.setAttribute('role', 'option');
  }
}

export default ColorInputItem;
