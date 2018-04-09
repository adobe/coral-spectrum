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
import {FormFieldMixin} from '../../../coralui-mixin-formfield';
import {transform, validate} from '../../../coralui-util';

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
 @extends {ComponentMixin}
 @extends {FormFieldMixin}
 */
class Textfield extends FormFieldMixin(ComponentMixin(HTMLInputElement)) {
  /** @ignore */
  constructor() {
    super();
  
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
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super._nativeObservedAttributes.concat(['variant']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
  }
}

export default Textfield;
