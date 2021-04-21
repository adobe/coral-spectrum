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
import {transform, validate} from '../../../coral-utils';

/**
 Enumeration for {@link Textfield} variants.

 @typedef {Object} TextfieldVariantEnum

 @property {String} DEFAULT
 A default textfield.
 @property {String} QUIET
 A textfield with no border or background.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

// the textfield's base classname
const CLASSNAME = '_coral-Textfield';

// Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Textfield
 @classdesc A Textfield component is the default single line text form field.
 @htmltag coral-textfield
 @htmlbasetag input
 @extends {HTMLInputElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Textfield extends BaseFormField(BaseComponent(HTMLInputElement)) {
  /** @ignore */
  constructor() {
    super();

    if (!this.hasAttribute('is')) {
      this.setAttribute('is', 'coral-textfield');
    }
    
    this._delegateEvents(this._events);
  }

  /**
   The textfield's variant. See {@link TextfieldVariantEnum}.

   @type {String}
   @default TextfieldVariantEnum.DEFAULT
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
   Returns {@link Textfield} variants.

   @return {TextfieldVariantEnum}
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

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }
  }
}

export default Textfield;
