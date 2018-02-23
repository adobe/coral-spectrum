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

import {ComponentMixin} from '/coralui-mixin-component';
import {FormFieldMixin} from '/coralui-mixin-formfield';
import {transform, validate, commons} from '/coralui-util';

const CLASSNAME = 'coral3-Textfield';

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
 @extends {ComponentMixin}
 @extends {FormFieldMixin}
 */
class Textarea extends FormFieldMixin(ComponentMixin(HTMLTextAreaElement)) {
  /** @ignore */
  constructor() {
    super();
  
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
    }
    else {
      this.style.height = this._defaultHeight;
      this._defaultHeight = undefined;
    }

    this._onInput();
  }
  
  /**
   Inherited from {@link FormFieldMixin#reset}.
   */
  reset() {
    // the textarea uses the textContent to save the old value and not the value attribute
    /** @ignore */
    this.value = this.textContent;
  }
  
  /** @private */
  _onInput() {
    if (this.variant === variant.QUIET) {
      this.style.height = 'auto';
      this.style.height = `${this.scrollHeight}px`;
    }
  }
  
  /**
   Returns {@link Textarea} variants.
   
   @return {TextareaVariantEnum}
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
    this.classList.add(`${CLASSNAME}--multiline`);
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
  }
}

export default Textarea;
