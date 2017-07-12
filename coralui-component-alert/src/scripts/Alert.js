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
import 'coralui-component-icon';
import icon from '../templates/icon';
import {transform, validate} from 'coralui-util';

// A map of types to icon names
const iconMap = {
  'success': 'checkCircle',
  'info': 'infoCircle',
  'error': 'alert',
  'warning': 'alert',
  'help': 'helpCircle'
};

/**
 Enumeration representing alert variants.
 
 @memberof Coral.Alert
 @enum {String}
 */
const variant = {
  /** An alert with a red header and warning icon, indicating that an error has occurred. */
  ERROR: 'error',
  /** An alert with an orange header and warning icon, notifying the user of something important. */
  WARNING: 'warning',
  /** An alert with a green header and checkmark icon, indicates to the user that an operation was successful. */
  SUCCESS: 'success',
  /** An alert with a blue header and question mark icon, provides the user with help. */
  HELP: 'help',
  /** An alert with a blue header and info icon, informs the user of non-critical information. */
  INFO: 'info'
};

/**
 Enumeration representing alert sizes.
 
 @memberof Coral.Alert
 @enum {String}
 */
const size = {
  /** A small alert, usually employed for single line alerts without headers. */
  SMALL: 'S',
  /** A large alert, usually employed for multi-line alerts with headers. */
  LARGE: 'L'
};

const CLASSNAME = 'coral3-Alert';

// size mapping
const SIZE_CLASSES = {
  'S': 'small',
  'L': 'large'
};

// An array of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
}
// An array of all possible size classnames
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(CLASSNAME + '--' + SIZE_CLASSES[size[sizeValue]]);
}

/**
 @class Coral.Alert
 @classdesc An Alert component
 @htmltag coral-alert
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Alert extends Component(HTMLElement) {
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
    this.on({
      'click [coral-close]': '_onCloseClick'
    });
  }
  
  /**
   The alert variant style to use.
   
   @type {Coral.Alert.variant}
   @default Coral.Alert.variant.INFO
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Alert#
   */
  get variant() {
    return this._variant || variant.INFO;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(variant)(value)) {
      this._variant = value;
      transform.reflect(this, 'variant', this._variant);
      
      this._elements.icon.icon = iconMap[this._variant];
      // Remove all variant classes
      this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);
  
      // Set new variant class
      // Don't use this._className; use the constant
      // This lets popover get our styles for free
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
  }
  
  /**
   The size of the alert. It accepts both lower and upper case sizes.
   
   @type {Coral.Alert.size}
   @default Coral.Alert.size.SMALL
   @htmlattribute size
   @htmlattributereflected
   @memberof Coral.Alert#
   */
  get size() {
    return this._size || size.SMALL;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    
    if (validate.enumeration(size)(value)) {
      this._size = value;
      transform.reflect(this, 'size', this._size);
  
      // Remove all variant classes and adds the new one
      this.classList.remove.apply(this.classList, ALL_SIZE_CLASSES);
      this.classList.add(`${CLASSNAME}--${SIZE_CLASSES[this._size]}`);
    }
  }
  
  /**
   The alert header element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Alert#
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
   @memberof Coral.Alert#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-alert-content',
      insert : function(content) {
        // After the header
        this.insertBefore(content, this.header.nextElementSibling);
      }
    });
  }
  
  /**
   The alert footer element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Alert#
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }
  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-alert-footer',
      insert : function(footer) {
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
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {
    return {
      'coral-alert-header': 'header',
      'coral-alert-content': 'content',
      'coral-alert-footer': 'footer'
    };
  }
  
  // Expose enumerations
  static get variant() {return variant;}
  static get size() {return size;}
  
  static get observedAttributes() {return ['variant', 'size'];}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.INFO;}
    if (!this._size) {this.size = size.SMALL;}
    
    for (const contentZone in this._contentZones) {
      const element = this._elements[this._contentZones[contentZone]];
      // Remove it so we can process children
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
    
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE || child.getAttribute('handle') !== 'icon') {
        // Add non-template elements to the content
        this._elements.content.appendChild(child);
      }
      else {
        // Remove anything else element
        this.removeChild(child);
      }
    }
  
    const icon = this.querySelector('coral-icon');
    if (icon === null) {
      // Create the icon and add the reference to _elements
      this.appendChild(this._elements.icon);
    }
    else {
      // Add the reference to _elements
      this._elements.icon = icon;
    }
  
    // Assign the content zones so the insert functions will be called
    for (const contentZone in this._contentZones) {
      const contentZoneName = this._contentZones[contentZone];
      const element = this._elements[this._contentZones[contentZone]];
      
      this[contentZoneName] = element;
    }
  }
}

export default Alert;
