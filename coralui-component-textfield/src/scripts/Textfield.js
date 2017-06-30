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
import FormField from 'coralui-mixin-formfield';
import {transform, validate} from 'coralui-util';

/**
 Enum for textfield variant values.
 @enum {String}
 @memberof Coral.Textfield
 */
const variant = {
  /** A default textfield */
  DEFAULT: 'default',
  /** A textfield with no border or background. */
  QUIET: 'quiet'
};

// the textfield's base classname
const CLASSNAME = 'coral3-Textfield';

// Builds a string containing all possible variant classnames. This will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
}

/**
 @class Coral.Textfield
 @classdesc A Textfield component
 @htmltag coral-textfield
 @htmlbasetag input
 @extends HTMLInputElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class Textfield extends FormField(Component(HTMLInputElement)) {
  constructor() {
    super();
  }
  
  /**
   The textfield's variant.
   @type {Coral.Textfield.variant}
   @default Coral.Textfield.variant.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Textfield#
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(variant)(value)) {
      this._variant = value;
      
      transform.reflect(this, 'variant', value);
      
      // removes every existing variant
      this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);
  
      if (this._variant !== variant.DEFAULT) {
        this.classList.add(`${CLASSNAME}--${this._variant}`);
      }
    }
  }
  
  // For backwards compat
  get _attributes() {return {labelledby: 'labelledBy'};}
  
  // Expose enumerations
  static get variant() {return variant;}
  
  static get observedAttributes() {
    return ['labelledby', 'labelledBy', 'invalid', 'variant'];
  }
  
  attributeChangedCallback(name, oldValue, value) {
    this[this._attributes[name] || name] = value;
  }
  
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.DEFAULT;}
  }
}

export default Textfield;
