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
import ColorInputAbstractSubview from './ColorInputAbstractSubview'
import Color from './Color';
import 'coralui-component-button';
import colorButton from '../templates/colorButton';
import {i18n, transform} from 'coralui-util';

const CLASSNAME = 'coral3-ColorInput-swatch';

/**
 @class Coral.ColorInput.Swatch
 @classdesc A ColorInput Swatch component
 @htmltag coral-colorinput-swatch
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.colorInputAbstractSubview
 */
class ColorInputSwatch extends ColorInputAbstractSubview(Component(HTMLElement)) {
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
    
    // Templates
    this._elements = {};
    colorButton.call(this._elements);
  }
  
  /**
   Whether the Item is selected.
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.ColorInput.Swatch#
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
  
      this._elements.colorButton[this._selected ? 'setAttribute': 'removeAttribute']('aria-label',
        `${i18n.get('checked')} ${this._elements.colorButton.label.textContent}`);
      
      this.trigger('coral-colorinput-swatch:_selectedchanged');
    }
  }
  
  /**
   The Coral.ColorInput.Item that the swatch is a visual representation of. It accepts a DOM element or a CSS selector.
   If a CSS selector is provided, the first matching element will be used.
   
   @type {HTMLElement|String}
   @default null
   @htmlattribute targetcolor
   @memberof Coral.ColorInput.Swatch#
   */
  get targetColor() {
    return this._targetColor || null;
  }
  set targetColor(value) {
    if (typeof value === 'string') {
      value = this.querySelector(value);
    }
  
    // Store new value
    this._targetColor = value;
  
    let cssColorValue = '';
    let hexColorValue = '';
  
    if (this._targetColor) {
      const color = new Color();
      color.value = this._targetColor.value;
      cssColorValue = color.rgbaValue;
      hexColorValue = color.hexValue;
    }
  
    // Update background color and text label for color swatch
    if (cssColorValue) {
      this._elements.colorButton.style.backgroundColor = cssColorValue;
      this._elements.colorButton.label.textContent = hexColorValue;
      this.setAttribute('aria-value', hexColorValue);
    }
    else {
      this._elements.colorButton.classList.add('coral3-ColorInput-swatch-novalue');
      this._elements.colorButton.label.textContent = i18n.get('unset');
      this.setAttribute('aria-value', '');
    }
  }

  /**
   Whether the color preview is disabled or not.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.ColorInput.Swatch#
   */
  get disabled() {
    return this._elements.colorButton.disabled;
  }
  set disabled(value) {
    this._elements.colorButton.disabled = value;
    this._reflectAttribute('disabled', this.disabled);
  }

  /**
   The tabindex of the color preview.
   
   @type {Integer}
   @default 0
   @htmlattribute tabindex
   @htmlattributereflected
   @memberof Coral.ColorInput.Swatch#
   */
  get tabIndex() {
    return this._elements.colorButton.tabIndex;
  }
  set tabIndex(value) {
    this._elements.colorButton.tabIndex = value;
    this._reflectAttribute('tabindex', this.tabIndex);
  }
  
  /** @ignore */
  _onColorInputChange() {
    if (this.targetColor) {
      // sync selections
      this.selected = this.targetColor.selected;
    }
  }
  
  static get observedAttributes() {
    return ['selected', 'tabindex', 'tabIndex', 'disabled', 'targetColor', 'targetcolor'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    this.setAttribute('role', 'option');
    
    // Support cloneNode
    const colorButton = this.querySelector('[handle="colorButton"]');
    if (colorButton) {
      colorButton.remove();
    }
  
    this.appendChild(this._elements.colorButton);
  }
}

export default ColorInputSwatch;
