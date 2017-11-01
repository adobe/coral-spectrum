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

import {ComponentMixin} from 'coralui-mixin-component';
import {transform, validate} from 'coralui-util';

/**
 Enumeration for {@link Wait} variants.
 
 @typedef {Object} WaitVariantEnum
 
 @property {String} DEFAULT
 The default variant.
 @property {String} DOTS
 A dot styled wait.
 */
const variant = {
  DEFAULT: 'default',
  DOTS: 'dots'
};

/**
 Enumeration for {@link Wait} sizes.
 
 @typedef {Object} WaitSizeEnum
 
 @property {String} SMALL
 A small wait indicator. This is the default size.
 @property {String} MEDIUM
 A medium wait indicator.
 @property {String} LARGE
 A large wait indicator.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L'
};

// the waits's base classname
const CLASSNAME = 'coral3-Wait';

// builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}


/**
 @class Coral.Wait
 @classdesc A Wait component
 @htmltag coral-wait
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Wait extends ComponentMixin(HTMLElement) {
  /**
   The size of the wait indicator. Currently 'S' (the default), 'M' and 'L' are available.
   See {@link WaitSizeEnum}.
   
   @type {String}
   @default WaitSizeEnum.SMALL
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.SMALL;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.SMALL;
    this._reflectAttribute('size', this._size);

    // large css change
    this.classList.toggle(`${CLASSNAME}--large`, this._size === size.LARGE);

    // medium css change
    this.classList.toggle(`${CLASSNAME}--medium`, this._size === size.MEDIUM);
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

    // removes every existing variant
    this.classList.remove(...ALL_VARIANT_CLASSES);

    if (this._variant !== variant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
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
    return ['size', 'centered', 'variant'];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
  
    // Default reflected attributes
    if (!this._size) { this.size = size.SMALL; }
    if (!this._variant) { this.variant = variant.DEFAULT; }
    
    this.classList.add(CLASSNAME);
  }
}

export default Wait;
