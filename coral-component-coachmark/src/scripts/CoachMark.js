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
import base from '../templates/base';
import {Overlay} from '../../../coral-component-overlay';
import '../../../coral-component-popover';
import PopperJS from 'popper.js';
import {transform, validate} from '../../../coral-utils';

/**
 Enumeration for {@link CoachMark} sizes.
 
 @typedef {Object} CoachMarkSizeEnum
 
 @property {String} SMALL
 A small sized coach mark.
 @property {String} MEDIUM
 A default sized coach mark.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M'
};

/**
 Enumeration for {@link CoachMark} variants.
 
 @typedef {Object} CoachMarkVariantEnum
 
 @property {String} DEFAULT
 The default styled coach mark.
 @property {String} LIGHT
 A styled coach mark for dark backgrounds.
 @property {String} DARK
 A styled coach mark for light backgrounds.
 */
const variant = {
  DEFAULT: 'default',
  LIGHT: 'light',
  DARK: 'dark',
};

const CLASSNAME = '_coral-CoachMarkIndicator';

/**
 @class Coral.CoachMark
 @classdesc A coach mark component to highlight UI elements on the page.
 @htmltag coral-coachmark
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class CoachMark extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {};
    this._template = base.call(this._elements);
  }
  
  /**
   The element the coach mark should position relative to. It accepts values from {@link OverlayTargetEnum}, as
   well as a DOM element or a CSS selector. If a CSS selector is provided, the first matching element will be used.
   
   @type {?HTMLElement|String}
   @default null
   */
  get target() {
    return this._target || null;
  }
  set target(value) {
    // We don't want to validate that the value must change here
    // If a selector is provided, we'll take the first element matching that selector
    // If the DOM is modified and the user wants a new target with the same selector,
    // They should be able to set target = 'selector' again and get a different element
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;
      
      requestAnimationFrame(() => {
        const targetElement = Overlay._getTarget(this);
  
        if (targetElement) {
          // Initialize popper only if we have a target
          this._popper = this._popper || new PopperJS(targetElement, this);
    
          // Update target only if valid
          if (targetElement) {
            this._popper.reference = targetElement;
          }
    
          this._popper.options.placement = 'top';
    
          this._popper.modifiers.forEach((modifier) => {
            if (modifier.name === 'offset') {
              const lengthOffset = targetElement.clientHeight/2 + this.clientHeight/2;
              modifier.offset = `0, -${lengthOffset}`;
            }
            else if (modifier.name === 'preventOverflow') {
              modifier.padding = 0;
            }
          });
    
          this._popper.update();
        }
      });
    }
  }
  
  /**
   The coach mark size. See {@link CoachMarkSizeEnum}.
   
   @type {String}
   @default CoachMarkSizeEnum.MEDIUM
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
  
    this.classList.toggle(`${CLASSNAME}--quiet`, this._size === size.SMALL);
  }
  
  /**
   The coach mark variant. See {@link CoachMarkVariantEnum}.
   
   @type {String}
   @default CoachMarkVariantEnum.DEFAULT
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
    
    this.classList.toggle(`${CLASSNAME}--light`, this._variant === variant.LIGHT);
    this.classList.toggle(`${CLASSNAME}--dark`, this._variant === variant.DARK);
  }
  
  /**
   Returns {@link CoachMark} sizes options.
   
   @return {CoachMarkSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link CoachMark} variant options.
   
   @return {CoachMarkVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'size',
      'variant',
      'target'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._size) { this.size = size.MEDIUM; }
    if (!this._variant) { this.variant = variant.DEFAULT; }
  
    // Support cloneNode
    const template = this.getElementsByClassName('_coral-CoachMarkIndicator-ring');
    while (template.length) {
      template[0].remove();
    }
  
    // Render template
    this.appendChild(this._template);
  }
}

export default CoachMark;
