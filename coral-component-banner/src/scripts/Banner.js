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
import {transform, validate} from '../../../coral-utils';

const CLASSNAME = '_coral-Banner';

/**
 Enumeration for {@link Banner} variants.
 
 @typedef {Object} BannerVariantEnum
 
 @property {String} ERROR
 A banner to indicate that an error has occurred.
 @property {String} WARNING
 A banner to warn the user of something important.
 @property {String} INFO
 A banner to inform the user of non-critical information.
 */
const variant = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// An array of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Banner
 @classdesc A Banner component
 @htmltag coral-banner
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Banner extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Fetch content zones
    this._elements = {
      header: this.querySelector('coral-banner-header') || document.createElement('coral-banner-header'),
      content: this.querySelector('coral-banner-content') || document.createElement('coral-banner-content')
    };
  }
  
  /**
   The banner variant style to use. See {@link BannerVariantEnum}.
   
   @type {String}
   @default BannerVariantEnum.INFO
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.INFO;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.INFO;
    this._reflectAttribute('variant', this._variant);
    
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);
    
    // Set new variant class
    this.classList.add(`${CLASSNAME}--${this._variant}`);
    
    // Set the role attribute depending on the variant so that the element turns into a live region
    this.setAttribute('role', this._variant);
  }
  
  /**
   The banner's header.
   
   @type {BannerHeader}
   @contentzone
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-banner-header',
      insert: function(header) {
        this.insertBefore(header, this.firstChild);
      }
    });
  }
  
  /**
   The banner's content.
   
   @type {BannerContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-banner-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  get _contentZones() {
    return {
      'coral-banner-header': 'header',
      'coral-banner-content': 'content'
    };
  }
  
  /**
   Returns {@link Banner} variants.
   
   @return {BannerVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return ['variant'];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.INFO; }
    
    const header = this._elements.header;
    const content = this._elements.content;
  
    // When the content zone was not created, we need to make sure that everything is added inside it as a content.
    if (!content.parentNode) {
      while (this.firstChild) {
        const child = this.firstChild;
        
        // Don't move header into content
        if (child === header) {
          child.remove();
        }
        else {
          content.appendChild(this.firstChild);
        }
      }
    }
    
    // Assign content zones
    this.header = this._elements.header;
    this.content = this._elements.content;
  }
}

export default Banner;
