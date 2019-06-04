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
import {Icon} from '../../../coral-component-icon';
import {transform, validate} from '../../../coral-utils';

/**
 Enumeration for {@link Alert} variants.
 
 @typedef {Object} AlertVariantEnum
 
 @property {String} ERROR
 An alert with a warning icon to indicate that an error has occurred.
 @property {String} WARNING
 An alert with a warning icon to warn the user of something important.
 @property {String} SUCCESS
 An alert with a question mark icon to notify the user of a successful operation.
 @property {String} HELP
 A neutral alert with a question icon to help the user with non-critical information.
 @property {String} INFO
 An alert with an info icon to inform the user of non-critical information.
 */
const variant = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  HELP: 'help',
  INFO: 'info'
};

/**
 Enumeration for {@link Alert} sizes.
 
 @typedef {Object} AlertSizeEnum
 
 @property {String} SMALL
 A small alert, usually employed for single line alerts without headers.
 @property {String} LARGE
 Not supported. Falls back to SMALL.
 */
const size = {
  SMALL: 'S',
  LARGE: 'L'
};

const CLASSNAME = '_coral-Alert';

// An array of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

// Used to map icon with variant
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

/**
 @class Coral.Alert
 @classdesc An Alert component used as static indicators of an operation's result, or as messages to highlight
 information to the user. It does not include a close button by default, but you can add it manually by adding the
 <code>coral-close</code> attribute on an element contained by the Alert.
 @htmltag coral-alert
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Alert extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-alert-header') || document.createElement('coral-alert-header'),
      content: this.querySelector('coral-alert-content') || document.createElement('coral-alert-content'),
      footer: this.querySelector('coral-alert-footer') || document.createElement('coral-alert-footer')
    };
    
    // Events
    this._delegateEvents({
      'click [coral-close]': '_onCloseClick'
    });
  }
  
  /**
   The alert variant style to use. See {@link AlertVariantEnum}.
   
   @type {String}
   @default AlertVariantEnum.INFO
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
    
    this._insertTemplate();
    
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);

    // Set new variant class
    // Don't use this._className; use the constant
    // This lets popover get our styles for free
    this.classList.add(`${CLASSNAME}--${this._variant}`);
    
    // Set the role attribute to alert or status depending on
    // the variant so that the element turns into a live region
    this.setAttribute('role', this._variant);
  }
  
  /**
   The size of the alert. It accepts both lower and upper case sizes. See {@link AlertVariantEnum}.
   
   @type {String}
   @default AlertSizeEnum.SMALL
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
  }
  
  /**
   The alert header element.
   
   @type {AlertHeader}
   @contentzone
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-alert-header',
      insert: function(header) {
        this.insertBefore(header, this.firstChild);
      }
    });
  }
  
  /**
   The alert content element.
   
   @type {AlertContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-alert-content',
      insert: function(content) {
        // After the header
        this.insertBefore(content, this.header.nextElementSibling);
      }
    });
  }
  
  /**
   The alert footer element.
   
   @type {AlertFooter}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }
  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-alert-footer',
      insert: function(footer) {
        // After the content
        this.insertBefore(footer, this.content.nextElementSibling);
      }
    });
  }
  
  /**
   @ignore
   @todo maybe this should be base or something
   */
  _onCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.hidden = true;
      event.stopPropagation();
    }
  
    this._trackEvent('close', 'coral-alert', event);
  }
  
  _insertTemplate() {
    if (this._elements.icon) {
      this._elements.icon.remove();
    }
  
    let variantValue = this.variant;
    
    // Warning icon is same as ERROR icon
    if (variantValue === variant.WARNING || variantValue === variant.ERROR) {
      variantValue = 'alert';
    }
    
    // Inject the SVG icon
    const iconName = capitalize(variantValue);
    this.insertAdjacentHTML('afterbegin', Icon._renderSVG(`spectrum-css-icon-${iconName}Medium`, ['_coral-Alert-icon', `_coral-UIIcon-${iconName}Medium`]));
    this._elements.icon = this.querySelector('._coral-Alert-icon');
  }
  
  get _contentZones() {
    return {
      'coral-alert-header': 'header',
      'coral-alert-content': 'content',
      'coral-alert-footer': 'footer'
    };
  }
  
  /**
   Returns {@link Alert} variants.
   
   @return {AlertVariantEnum}
   */
  static get variant() { return variant; }
  
  /**
   Returns {@link Alert} sizes.
   
   @return {AlertSizeEnum}
   */
  static get size() { return size; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['variant', 'size']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.INFO; }
    if (!this._size) { this.size = size.SMALL; }
    
    for (const contentZone in this._contentZones) {
      const element = this._elements[this._contentZones[contentZone]];
      // Remove it so we can process children
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && !child.classList.contains('_coral-Alert-icon')) {
        // Add non-template elements to the content
        this._elements.content.appendChild(child);
      }
      else {
        // Remove anything else element
        this.removeChild(child);
      }
    }
    
    this._insertTemplate();
  
    // Assign the content zones so the insert functions will be called
    for (const contentZone in this._contentZones) {
      const contentZoneName = this._contentZones[contentZone];
      
      /** @ignore */
      this[contentZoneName] = this._elements[contentZoneName];
    }
  }
}

export default Alert;
