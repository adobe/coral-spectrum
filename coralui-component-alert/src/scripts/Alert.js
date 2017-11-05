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
import 'coralui-component-icon';
import icon from '../templates/icon';
import {transform, validate} from 'coralui-util';

// A map of types to icon names
const iconMap = {
  success: 'checkCircle',
  info: 'infoCircle',
  error: 'alert',
  warning: 'alert',
  help: 'helpCircle'
};

/**
 Enumeration for {@link Alert} variants.
 
 @typedef {Object} AlertVariantEnum
 
 @property {String} ERROR
 An alert with a red header and warning icon, indicating that an error has occurred.
 @property {String} WARNING
 An alert with an orange header and warning icon, notifying the user of something important.
 @property {String} SUCCESS
 An alert with a blue header and question mark icon, provides the user with help.
 @property {String} HELP
 An alert with a blue header and info icon, informs the user of non-critical information.
 @property {String} INFO
 An alert with a blue header and info icon, informs the user of non-critical information.
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
 A large alert, usually employed for multi-line alerts with headers.
 */
const size = {
  SMALL: 'S',
  LARGE: 'L'
};

const CLASSNAME = 'coral3-Alert';

// size mapping
const SIZE_CLASSES = {
  S: 'small',
  L: 'large'
};

// An array of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}
// An array of all possible size classnames
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(`${CLASSNAME}--${SIZE_CLASSES[size[sizeValue]]}`);
}

/**
 @class Coral.Alert
 @classdesc An Alert component used as static indicators of an operation's result, or as messages to highlight
 information to the user. It does not include a close button by default, but you can add it manually by adding the
 <code>coral-close</code> attribute on an element contained by the Alert.
 @htmltag coral-alert
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Alert extends ComponentMixin(HTMLElement) {
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
    icon.call(this._elements);
    
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
    
    this._elements.icon.icon = iconMap[this._variant];
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);

    // Set new variant class
    // Don't use this._className; use the constant
    // This lets popover get our styles for free
    this.classList.add(`${CLASSNAME}--${this._variant}`);
    
    // Set the role attribute to alert or status depending on
    // the variant so that the element turns into a live region
    this.setAttribute('role', this._variant === variant.ERROR || this._variant === variant.WARNING ? 'alert' : 'status');
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
  
    // Remove all variant classes and adds the new one
    this.classList.remove(...ALL_SIZE_CLASSES);
    this.classList.add(`${CLASSNAME}--${SIZE_CLASSES[this._size]}`);
  }
  
  /**
   The alert header element.
   
   @type {HTMLElement}
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
        // After the icon
        this.insertBefore(header, this._elements.icon.nextElementSibling);
      }
    });
  }
  
  /**
   The alert content element.
   
   @type {HTMLElement}
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
   
   @type {HTMLElement}
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
   @todo maybe this should be mixin or something
   */
  _onCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.hidden = true;
      event.stopPropagation();
    }
  }
  
  /**
   The default content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get defaultContentZone() { return this.content; }
  set defaultContentZone(value) { this.content = value; }
  
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
  static get observedAttributes() { return ['variant', 'size']; }
  
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
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'icon') {
        // Add non-template elements to the content
        this._elements.content.appendChild(child);
      }
      else {
        // Remove anything else element
        this.removeChild(child);
      }
    }
  
    const iconElement = this.querySelector('coral-icon');
    if (iconElement === null) {
      // Create the icon and add the reference to _elements
      this.appendChild(this._elements.icon);
    }
    else {
      // Add the reference to _elements
      this._elements.icon = iconElement;
    }
  
    // Assign the content zones so the insert functions will be called
    for (const contentZone in this._contentZones) {
      const contentZoneName = this._contentZones[contentZone];
      const element = this._elements[this._contentZones[contentZone]];
  
      /** @ignore */
      this[contentZoneName] = element;
    }
  }
}

export default Alert;
