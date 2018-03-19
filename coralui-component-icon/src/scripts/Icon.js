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
import {transform, validate} from '/coralui-util';
import ICON_MAP from '/coralui-compat/data/iconMap.json';
import SPECTRUM_ICONS_PATH from '@spectrum/spectrum-css/dist/icons/spectrum-icons.svg';
import SPECTRUM_ICONS_COLOR_PATH from '@spectrum/spectrum-css/dist/icons/spectrum-icons-color.svg';
import SPECTRUM_CSS_ICONS_PATH from '@spectrum/spectrum-css/dist/icons/spectrum-css-icons.svg';
import '@spectrum/spectrum-css/dist/icons/AS.loadIcons';

const SPECTRUM_ICONS = 'spectrum-icons';
const SPECTRUM_ICONS_COLOR = 'spectrum-icons-color';
const SPECTRUM_CSS_ICONS = 'spectrum-css-icons';

const SPECTRUM_ICONS_IDENTIFIER = 'spectrum-';
const SPECTRUM_COLORED_ICONS_IDENTIFIER = ['ColorLight', 'ColorDark', 'ColorActive'];

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
 Returns capitalized string. This is used to map the icons with their SVG counterpart.
 
 @ignore
 @param {String} s
 @return {String}
 */
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

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
const CLASSNAME = '_coral-Icon';

// builds an array containing all possible size classnames. this will be used to remove classnames when the size
// changes
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(`${CLASSNAME}--size${size[sizeValue]}`);
}

// Based on https://git.corp.adobe.com/pages/Spectrum/spectrum-css/icons/
const sizeMap = {
  XXS: 18,
  XS: 24,
  S: 18,
  M: 24,
  L: 18,
  XL: 24,
  XXL: 24
};

/**
 @class Coral.Icon
 @classdesc An Icon component. Icon ships with a set of SVG icons see http://icons.corp.adobe.com for how to request
 new icons.
 @htmltag coral-icon
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Icon extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    this._elements = {};
  }
  
  /**
   Icon name.
   
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
    
    // Remove image and SVG elements
    ['image', 'svg'].forEach((type) => {
      const el = this._elements[type] || this.querySelector(`.${CLASSNAME}--${type}`);
      if (el) {
        el.remove();
      }
    });
    
    // Sets the desired icon
    if (this._icon) {
      // Detect if it's a URL
      if (this._icon.match(URL_REGEX)) {
        // Create an image and add it to the icon
        this._elements.image = this._elements.image || document.createElement('img');
        this._elements.image.className = `${CLASSNAME} ${CLASSNAME}--image`;
        this._elements.image.src = this.icon;
        this.appendChild(this._elements.image);
      }
      else {
        this._updateIcon();
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
    const oldSize = this._size;
    
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.SMALL;
    this._reflectAttribute('size', this._size);
    
    // removes all the existing sizes
    this.classList.remove(...ALL_SIZE_CLASSES);
    // adds the new size
    this.classList.add(`${CLASSNAME}--size${this._size}`);
    
    // We need to update the icon if the size changed
    if (oldSize && oldSize !== this._size && this.contains(this._elements.svg)) {
      this._elements.svg.remove();
      this._updateIcon();
    }
    
    this._updateAltText();
  }
  
  /** @private */
  get title() { return this.getAttribute('title'); }
  set title(value) { this.setAttribute('title', value); }
  
  /** @private */
  get alt() { return this.getAttribute('alt'); }
  set alt(value) { this.setAttribute('alt', value); }
  
  _updateIcon() {
    if (!document.body.contains(this)) {
      this._delayedRendering = true;
      return;
    }
    
    let iconId = this.icon;
    
    // If icon name is passed, we have to build the icon Id based on the icon name
    if (iconId.indexOf(SPECTRUM_ICONS_IDENTIFIER) !== 0) {
      const iconMapped = ICON_MAP[iconId];
      let iconName;
      
      if (iconMapped) {
        if (iconMapped.spectrumIcon) {
          // Use the default mapped icon
          iconName = iconMapped.spectrumIcon;
        }
        else {
          // Verify if icon should be light or dark by looking up parents theme
          const closest = this.closest('.coral--light, .coral--dark, .coral--lightest, .coral--darkest');
          
          if (closest) {
            if (closest.classList.contains('coral--light') || closest.classList.contains('coral--lightest')) {
              // Use light icon
              iconName = iconMapped.spectrumIconLight;
            }
            else {
              // Use dark icon
              iconName = iconMapped.spectrumIconDark;
            }
          }
          // Use light by default
          else {
            iconName = iconMapped.spectrumIconLight;
          }
        }
        
        // Inform user about icon name changes
        if (iconName) {
          console.warn(`Coral.Icon: the icon ${iconId} has been deprecated. Please use ${iconName} instead.`);
        }
        else {
          console.warn(`Coral.Icon: the icon ${iconId} has been removed. Please contact Icons@Adobe.`);
        }
      }
      // In most cases, using the capitalized icon name maps to the spectrum icon name
      else {
        iconName = capitalize(iconId);
      }
      
      // Verify if icon name is a colored icon
      if (SPECTRUM_COLORED_ICONS_IDENTIFIER.some(identifier => iconName.indexOf(identifier) !== -1)) {
        // Colored icons are 24 by default
        iconId = `spectrum-icon-24-${iconName}`;
      }
      else {
        const sizeAttribute = this.getAttribute('size');
        const iconSize = sizeMap[sizeAttribute && sizeAttribute.toUpperCase() || size.SMALL];
        iconId = `spectrum-icon-${iconSize}-${iconName}`;
      }
    }
    
    // Insert SVG Icon using HTML because DOMly doesn't support document.createElementNS for <use> element
    this.insertAdjacentHTML('beforeend', this.constructor._renderSVG(iconId));
    
    this._elements.svg = this.lastElementChild;
    this._delayedRendering = false;
  }
  
  /**
   Updates the aria-label or img alt attribute depending on value of alt, title or icon.
   
   In cases where the alt attribute has been removed or set to an empty string,
   for example, when the alt property is undefined and we add the attribute alt=''
   to explicitly override the default behavior, or when we remove an alt attribute
   thus restoring the default behavior, we make sure to update the alt text.
   @private
   */
  _updateAltText(value) {
    const isImage = this.contains(this._elements.image);
    
    let altText;
    if (typeof value === 'string') {
      altText = value;
    }
    else if (isImage) {
      altText = '';
    }
    else {
      altText = this.icon.replace(SPLIT_CAMELCASE_REGEX, '$1 $2');
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
   Returns the SVG markup.
   
   @param {String} iconId
   @param {Array.<String>} additionalClasses
   @return {String}
   */
  static _renderSVG(iconId, additionalClasses = []) {
    additionalClasses.unshift(CLASSNAME);
    additionalClasses.unshift(`${CLASSNAME}--svg`);
    
    return `
      <svg focusable="false" aria-hidden="true" class="${additionalClasses.join(' ')}">
        <use xlink:href="#${iconId}"></use>
      </svg>
    `;
  }
  
  /**
   Returns {@link Icon} sizes.
   
   @return {IconSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Loads the SVG icons. It's requesting the icons based on the JS file path by default.
   
   @param {String} [url] SVG icons url.
   */
  static load(url) {
    const resolveIconsPath = (iconsPath) => {
      const scripts = document.getElementsByTagName('script');
      const path = scripts[scripts.length - 1].src;
      return `${path.split('/').slice(0, -iconsPath.split('/').length).join('/')}/${iconsPath}`;
    };
    
    if (url === SPECTRUM_ICONS) {
      url = resolveIconsPath(SPECTRUM_ICONS_PATH);
    }
    else if (url === SPECTRUM_ICONS_COLOR) {
      url = resolveIconsPath(SPECTRUM_ICONS_COLOR_PATH);
    }
    else if (url === SPECTRUM_CSS_ICONS) {
      url = resolveIconsPath(SPECTRUM_CSS_ICONS_PATH);
    }
  
    window.AdobeSpectrum.loadIcons(url);
  }
  
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
    
    if (this._delayedRendering) {
      this._updateIcon();
    }
  }
}

// Load icons
Icon.load(SPECTRUM_ICONS);
Icon.load(SPECTRUM_ICONS_COLOR);
Icon.load(SPECTRUM_CSS_ICONS);

export default Icon;
