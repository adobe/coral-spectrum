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
import Color from './Color';
import {transform} from '../../../coral-utils';

/**
 @class Coral.ColorInput.Item
 @classdesc A ColorInput Item component
 @htmltag coral-colorinput-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorInputItem extends BaseComponent(HTMLElement) {
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
    return super.observedAttributes.concat(['selected', 'value']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    // adds the role to support accessibility
    this.setAttribute('role', 'option');
  }
}

export default ColorInputItem;
