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
import {BaseFormField} from '../../../coral-base-formfield';
// todo ideally there should be a coral-base-textfield to inherit from
import '../../../coral-component-textfield';
import {transform, validate, commons} from '../../../coral-utils';

const CLASSNAME = '_coral-Textfield';

/**
 Enumeration for {@link Textarea} variants.

 @typedef {Object} TextareaVariantEnum

 @property {String} DEFAULT
 A default textarea.
 @property {String} QUIET
 A textarea with no border or background.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

// Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Textarea
 @classdesc A Textarea component is the default multi-line text form field.
 @htmltag coral-textarea
 @htmlbasetag textarea
 @extends {HTMLTextAreaElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Textarea extends BaseFormField(BaseComponent(HTMLTextAreaElement)) {
  /** @ignore */
  constructor() {
    super();
  
    if (!this.hasAttribute('is')) {
      this.setAttribute('is', 'coral-textarea');
    }
    
    this._delegateEvents(commons.extend(this._events, {
      input: '_onInput'
    }));
  }

  /**
   The textarea's variant. See {@link TextareaVariantEnum}.

   @type {String}
   @default TextareaVariantEnum.DEFAULT
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

    // Restore the original height
    if (this._variant === variant.QUIET) {
      this._defaultHeight = this._defaultHeight || this.style.height;
    } else {
      this.style.height = this._defaultHeight;
      this._defaultHeight = undefined;
    }

    this._onInput();
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // The textarea uses the textContent to save the old value and not the value attribute
    /** @ignore */
    this.value = this.textContent;

    // Reset height if quiet variant
    this._onInput();
  }

  /** @private */
  _onInput() {
    if (this.variant === variant.QUIET) {
      requestAnimationFrame(() => {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
      });
    }
  }

  /**
   Returns {@link Textarea} variants.

   @return {TextareaVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /** @ignore */
  static get observedAttributes() {
    return super._nativeObservedAttributes.concat(['variant']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME, `${CLASSNAME}--multiline`);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }
  }
}

export default Textarea;
