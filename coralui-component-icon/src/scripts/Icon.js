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
import {transform, validate} from 'coralui-util';

/**
 Regex used to remove the modifier classes. Size related classes are not matched this regex.
 
 @ignore
 */
const ICON_REGEX = /[\s?]coral3-Icon--(?!size(XXS|XS|S|M|L))\w+/g;

/**
 Regex used to match URLs. Assume it's a URL if it has a slash, colon, or dot.
 
 @ignore
 */
const URL_REGEX = /\/|:|\./g;

/**
 Regex used to split camel case icon names into more screen-reader friendly alt text.
 
 @ignore
 */
const SPLIT_CAMELCASE_REGEX = /([a-z0-9])([A-Z])/g;

/**
 Enumeration for {@link Icon} sizes.
 
 @typedef {Object} IconSizeEnum
 
 @property {String} EXTRA_EXTRA_SMALL
 Extra extra small size icon, typically 9px size.
 @property {String} EXTRA_SMALL
 Extra small size icon, typically 12px size.
 @property {String} SMALL
 Small size icon, typically 18px size. This is the default size.
 @property {String} MEDIUM
 Medium size icon, typically 24px size.
 @property {String} LARGE
 Large icon, typically 36px size.
 @property {String} EXTRA_LARGE
 Extra large icon, typically 48px size.
 @property {String} EXTRA_EXTRA_LARGE
 Extra extra large icon, typically 72px size.
 */
const size = {
  EXTRA_EXTRA_SMALL: 'XXS',
  EXTRA_SMALL: 'XS',
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L',
  EXTRA_LARGE: 'XL',
  EXTRA_EXTRA_LARGE: 'XXL'
};

// icon's base classname
const CLASSNAME = 'coral3-Icon';

// builds an array containing all possible size classnames. this will be used to remove classnames when the size
// changes
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(`${CLASSNAME}--size${size[sizeValue]}`);
}

/**
 @class Coral.Icon
 @classdesc An Icon component. CoralUI ships with a set of monochrome icons.
 @htmltag coral-icon
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @see http://icons.corp.adobe.com/
 */
class Icon extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    this._elements = {};
  }
  
  /**
   Icon name accordion to the CloudUI Icon sheet.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value).trim();
    this._reflectAttribute('icon', this._icon);
    
    // removes the old classes
    /** @ignore */
    this.className = this.className.replace(ICON_REGEX, '').trim();
  
    // sets the desired icon
    if (this._icon) {
      // Detect if it's a URL
      if (this._icon.match(URL_REGEX)) {
        // Note that we're an image so we hide the font-related goodies
        this.classList.add('is-image');
        
        // Create an image and add it to the icon
        const img = this._elements.image = this._elements.image || document.createElement('img');
        img.className = `${CLASSNAME}-image`;
        img.src = this.icon;
        this.appendChild(img);
      }
      else {
        if (this._elements.image && this._elements.image.parentNode === this) {
          // Remove image related stuff
          this.removeChild(this._elements.image);
          this.classList.remove('is-image');
        }
        this.classList.add(`${CLASSNAME}--${this._icon}`);
      }
    }
    
    this._updateAltText();
  }
  
  /**
   Size of the icon. It accepts both lower and upper case sizes. See {@link IconSizeEnum}.
   
   @type {String}
   @default IconSizeEnum.SMALL
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
    
    // removes all the existing sizes
    this.classList.remove(...ALL_SIZE_CLASSES);
    // adds the new size
    this.classList.add(`${CLASSNAME}--size${this._size}`);
    
    this._updateAltText();
  }
  
  /** @private */
  get title() { return this.getAttribute('title'); }
  set title(value) { this.setAttribute('title', value); }
  
  /** @private */
  get alt() { return this.getAttribute('alt'); }
  set alt(value) { this.setAttribute('alt', value); }
  
  /**
   Updates the aria-label or img alt attribute depending on value of alt, title or icon.
   
   In cases where the alt attribute has been removed or set to an empty string,
   for example, when the alt property is undefined and we add the attribute alt=''
   to explicitly override the default behavior, or when we remove an alt attribute
   thus restoring the default behavior, we make sure to update the alt text.
   @private
   */
  _updateAltText(value) {
    const isImage = this.classList.contains('is-image');
    
    let altText;
    if (typeof value === 'string') {
      altText = value;
    }
    else if (isImage) {
      altText = '';
    }
    else {
      altText = this.icon.replace(SPLIT_CAMELCASE_REGEX, '$1 $2').toLowerCase();
    }
  
    // If no other role has been set, provide the appropriate
    // role depending on whether or not the icon is an arbitrary image URL.
    const role = this.getAttribute('role');
    const roleOverride = role && (role !== 'presentation' && role !== 'img');
    if (!roleOverride) {
      this.setAttribute('role', isImage ? 'presentation' : 'img');
    }
    
    // Set accessibility attributes accordingly
    if (isImage) {
      this.removeAttribute('aria-label');
      this._elements.image.setAttribute('alt', altText);
    }
    else if (altText === '') {
      this.removeAttribute('aria-label');
      if (!roleOverride) {
        this.removeAttribute('role');
      }
    }
    else {
      this.setAttribute('aria-label', altText);
    }
  }
  
  /**
   Returns {@link Icon} sizes.
   
   @return {IconSizeEnum}
   */
  static get size() { return size; }
  
  /** @ignore */
  static get observedAttributes() {
    return ['icon', 'size', 'alt', 'title'];
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'alt' || name === 'title') {
      this._updateAltText(value);
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Set default size
    if (!this._size) {
      this.size = size.SMALL;
    }
  }
}

export default Icon;
