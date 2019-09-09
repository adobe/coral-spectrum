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
import {commons, transform} from '../../../coral-utils';

const CLASSNAME = '_coral-CharacterCount';

/**
 Enumeration for {@link CharacterCount} targets.
 
 @typedef {Object} CharacterCountTargetEnum
 
 @property {String} PREVIOUS
 Relates the CharacterCount to the previous sibling.
 @property {String} NEXT
 Relates the CharacterCount to the next sibling.
 */
const target = {
  PREVIOUS: '_prev',
  NEXT: '_next'
};

/**
 @class Coral.CharacterCount
 @classdesc A CharacterCount component that indicates the remaining characters in a Textfield or Textarea.
 @htmltag coral-charactercount
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class CharacterCount extends BaseComponent(HTMLElement) {
  /**
   The target Textfield or Textarea for this component. It accepts values from {@link CharacterCountTargetEnum},
   as well as any DOM element or CSS selector.
   
   @type {HTMLElement|String}
   @default CharacterCountTargetEnum.PREVIOUS
   @htmlattribute target
   */
  get target() {
    return this._target || target.PREVIOUS;
  }
  set target(value) {
    if (typeof value === 'string' || value instanceof Node) {
      this._target = value;
  
      // Remove previous event listener
      if (this._targetEl) {
        this._targetEl.removeEventListener('input', this._refreshCharCount.bind(this));
      }
  
      // Get the target DOM element
      if (value === target.NEXT) {
        this._targetEl = this.nextElementSibling;
      }
      else if (value === target.PREVIOUS) {
        this._targetEl = this.previousElementSibling;
      }
      else if (typeof value === 'string') {
        this._targetEl = document.querySelector(value);
      }
      else {
        this._targetEl = value;
      }
  
      if (this._targetEl) {
        this._targetEl.addEventListener('input', this._refreshCharCount.bind(this));
    
        // Try to get maxlength from target element
        if (this._targetEl.getAttribute('maxlength')) {
          this.maxLength = this._targetEl.getAttribute('maxlength');
        }
      }
    }
  }
  
  /**
   Maximum character length for the TextField/TextArea (will be read from target field markup if able).
   
   @type {Number}
   @default null
   @htmlattribute maxlength
   @htmlattributereflected
   */
  get maxLength() {
    return this._maxLength || null;
  }
  set maxLength(value) {
    this._maxLength = transform.number(value);
    this._reflectAttribute('maxlength', this._maxLength);
    
    this._refreshCharCount();
  }
  
  /** @ignore */
  _getCharCount() {
    let elementLength = 0;
    if (this._targetEl && this._targetEl.value) {
      elementLength = this._targetEl.value.length;
    }
    
    return this._maxLength ? this._maxLength - elementLength : elementLength;
  }
  
  /** @ignore */
  _refreshCharCount() {
    const currentCount = this._getCharCount();
    /** @ignore */
    this.innerHTML = currentCount;
    const isMaxExceeded = currentCount < 0;
    if (this._targetEl) {
      this._targetEl.classList.toggle('is-invalid', isMaxExceeded);
      this.classList.toggle('is-invalid', isMaxExceeded);
    }
  }
  
  /**
   Returns {@link CharacterCount} target options.
   
   @return {CharacterCountTargetEnum}
   */
  static get target() { return target; }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      maxlength: 'maxLength'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['target', 'maxlength']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Set defaults
    this.target = this.target;
  
    // Refresh once connected
    this._refreshCharCount();
  }
}

export default CharacterCount;
