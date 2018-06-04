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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {transform, validate} from '../../../coralui-util';
import base from '../templates/base';

/**
 Enumeration for {@link Wait} variants.
 
 @typedef {Object} WaitVariantEnum
 
 @property {String} DEFAULT
 The default variant.
 @property {String} DOTS
 Not supported. Falls back to DEFAULT.
 */
const variant = {
  DEFAULT: 'default',
  DOTS: 'dots'
};

/**
 Enumeration for {@link Wait} sizes.
 
 @typedef {Object} WaitSizeEnum
 
 @property {String} SMALL
 A small wait indicator.
 @property {String} MEDIUM
 A medium wait indicator. This is the default size.
 @property {String} LARGE
 A large wait indicator.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L'
};

// the waits's base classname
const CLASSNAME = '_coral-Loader';

/**
 @class Coral.Wait
 @classdesc A Wait component to be used to indicate a process that is in-progress for an indefinite amount of time.
 When the time is known, {@link Progress} should be used instead.
 @htmltag coral-wait
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Wait extends ComponentMixin(HTMLElement) {
  constructor() {
    super();
  
    // Prepare templates
    this._elements = {};
    base.call(this._elements);
  }
  /**
   The size of the wait indicator. Currently 'S' (the default), 'M' and 'L' are available.
   See {@link WaitSizeEnum}.
   
   @type {String}
   @default WaitSizeEnum.MEDIUM
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

    // large css change
    this.classList.toggle(`${CLASSNAME}--large`, this._size === size.LARGE);

    // small css change
    this.classList.toggle(`${CLASSNAME}--small`, this._size === size.SMALL);
  }
  
  /**
   Whether the component is centered or not. The container needs to have the style <code>position: relative</code>
   for the centering to work correctly.
   @type {Boolean}
   @default false
   @htmlattribute centered
   @htmlattributereflected
   */
  get centered() {
    return this._centered || false;
  }
  set centered(value) {
    this._centered = transform.booleanAttr(value);
    this._reflectAttribute('centered', this._centered);
  
    this.classList.toggle(`${CLASSNAME}--centered`, this._centered);
  }
  
  /**
   The wait's variant. See {@link WaitVariantEnum}.
   
   @type {String}
   @default WaitVariantEnum.DEFAULT
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
   Whether to hide the current value and show an animation. Set to true for operations whose progress cannot be
   determined.
   
   @type {Boolean}
   @default false
   @htmlattribute indeterminate
   @htmlattributereflected
   */
  get indeterminate() {
    return this._indeterminate || false;
  }
  set indeterminate(value) {
    this._indeterminate = transform.booleanAttr(value);
    this._reflectAttribute('indeterminate', this._indeterminate);
    
    if (this._indeterminate) {
      this.classList.add(`${CLASSNAME}--indeterminate`);
      
      // ARIA: Remove attributes
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');
      
      this.value = 0;
    }
    else {
      this.classList.remove(`${CLASSNAME}--indeterminate`);
      
      // ARIA: Add attributes
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');
      
      this.value = this._oldValue;
    }
  }
  
  /**
   The current progress in percent. If no value is set on initialization, wait is forced into indeterminate state.
   
   @type {Number}
   @default 0
   @emits {coral-wait:change}
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this.hasAttribute('indeterminate') ? 0 : this._value || 0;
  }
  set value(value) {
    value = transform.number(value) || 0;
    
    // Stay within bounds
    if (value > 100) {
      value = 100;
    }
    else if (value < 0) {
      value = 0;
    }
    
    this._value = value;
    this._reflectAttribute('value', this._value);
  
    const subMask1 = this._elements.subMask1;
    const subMask2 = this._elements.subMask2;
    
    if (!this.hasAttribute('indeterminate')) {
      let angle;
      
      if (value > 0 && value <= 50) {
        angle = -180 + value / 50 * 180;
        subMask1.style.transform = `rotate(${angle}deg)`;
        subMask2.style.transform = 'rotate(-180deg)';
      }
      else if (value > 50) {
        angle = -180 + (value - 50) / 50 * 180;
        subMask1.style.transform = 'rotate(0deg)';
        subMask2.style.transform = `rotate(${angle}deg)`;
      }
      else {
        subMask1.style.transform = '';
        subMask2.style.transform = '';
      }
  
      // ARIA: Reflect value for screenreaders
      this.setAttribute('aria-valuenow', this._value);
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');
    }
    else {
      subMask1.style.transform = '';
      subMask2.style.transform = '';
    }
    
    this.trigger('coral-wait:change');
  }
  
  /**
   Returns {@link Wait} sizes.
   
   @return {WaitSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link Wait} variants.
   
   @return {WaitVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return ['size', 'centered', 'variant', 'value', 'indeterminate'];
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'indeterminate' && transform.booleanAttr(value)) {
      // Remember current value in case indeterminate is toggled back
      this._oldValue = this._value || 0;
    }
    
    super.attributeChangedCallback(name, oldValue, value);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // ARIA
    this.setAttribute('role', 'progressbar');
    
    // Default reflected attributes
    if (!this._size) { this.size = size.MEDIUM; }
    if (!this._variant) { this.variant = variant.DEFAULT; }
    
    // If no value is specified, indeterminate is set
    if (!this._value) { this.indeterminate = true; }
    
    // Centering reads the size
    if (this.centered) { this.centered = this.centered; }
  
    // Support cloneNode
    const template = this.querySelectorAll('._coral-Loader-track, ._coral-Loader-fills');
    for (let i = 0; i < template.length; i++) {
      template[i].remove();
    }
  
    // Render template
    this.appendChild(this._elements.track);
    this.appendChild(this._elements.fills);
  }
  
  /**
   Triggered when the {@link Wait} value is changed.
   
   @typedef {CustomEvent} coral-wait:change
   */
}

export default Wait;
