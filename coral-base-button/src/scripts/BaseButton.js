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

import {Icon} from '../../../coral-component-icon';
import {transform, validate, commons} from '../../../coral-utils';

/**
 Enumeration for {@link Button}, {@link AnchorButton} icon sizes.
 
 @typedef {Object} ButtonIconSizeEnum
 
 @property {String} EXTRA_EXTRA_SMALL
 Extra extra small size icon, typically 9px size.
 @property {String} EXTRA_SMALL
 Extra small size icon, typically 12px size.
 @property {String} SMALL
 Small size icon, typically 18px size. This is the default size.
 @property {String} MEDIUM
 Medium size icon, typically 24px size.
 */
const iconSize = {};
const excludedIconSizes = [Icon.size.LARGE, Icon.size.EXTRA_LARGE, Icon.size.EXTRA_EXTRA_LARGE];
for (const key in Icon.size) {
  // Populate button icon sizes by excluding the largest icon sizes
  if (excludedIconSizes.indexOf(Icon.size[key]) === -1) {
    iconSize[key] = Icon.size[key];
  }
}

/**
 Enumeration for {@link Button}, {@link AnchorButton} variants.
 
 @typedef {Object} ButtonVariantEnum
 
 @property {String} CTA
 A button that is meant to grab the user's attention.
 @property {String} PRIMARY
 A button that is meant to grab the user's attention.
 @property {String} QUIET
 A quiet button that indicates that the button's action is the primary action.
 @property {String} SECONDARY
 A button that indicates that the button's action is the secondary action.
 @property {String} QUIET_SECONDARY
 A quiet secondary button.
 @property {String} ACTION
 An action button.
 @property {String} QUIET_ACTION
 A quiet action button.
 @property {String} MINIMAL
 A quiet minimalistic button.
 @property {String} WARNING
 A button that indicates that the button's action is dangerous.
 @property {String} QUIET_WARNING
 A quiet warning button,
 @property {String} OVER_BACKGROUND
 A button to be placed on top of colored background.
 @property {String} DEFAULT
 The default button look and feel.
 */
const variant = {
  CTA: 'cta',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  QUIET: 'quiet',
  MINIMAL: 'minimal',
  WARNING: 'warning',
  ACTION: 'action',
  QUIET_ACTION: 'quietaction',
  QUIET_SECONDARY: 'quietsecondary',
  QUIET_WARNING: 'quietwarning',
  OVER_BACKGROUND: 'overbackground',
  DEFAULT: 'default',
  // Private to be used for custom Button classes like field buttons
  _CUSTOM: '_custom'
};

// the button's base classname
const CLASSNAME = '_coral-Button';
const ACTION_CLASSNAME = '_coral-ActionButton';

const ALL_VARIANT_CLASSES = [
  `${CLASSNAME}--cta`,
  `${CLASSNAME}--primary`,
  `${CLASSNAME}--secondary`,
  `${CLASSNAME}--warning`,
  `${CLASSNAME}--quiet`,
  `${ACTION_CLASSNAME}--quiet`,
  `${CLASSNAME}--overBackground`,
];

const VARIANT_MAP = {
  cta: [CLASSNAME, ALL_VARIANT_CLASSES[0]],
  primary: [CLASSNAME, ALL_VARIANT_CLASSES[0]],
  secondary: [CLASSNAME, ALL_VARIANT_CLASSES[2]],
  warning: [CLASSNAME, ALL_VARIANT_CLASSES[3]],
  quiet: [CLASSNAME, ALL_VARIANT_CLASSES[1], ALL_VARIANT_CLASSES[4]],
  minimal: [CLASSNAME, ALL_VARIANT_CLASSES[2], ALL_VARIANT_CLASSES[4]],
  default: [CLASSNAME, ALL_VARIANT_CLASSES[1]],
  action: [ACTION_CLASSNAME],
  quietaction: [ACTION_CLASSNAME, ALL_VARIANT_CLASSES[5]],
  quietsecondary: [CLASSNAME, ALL_VARIANT_CLASSES[2], ALL_VARIANT_CLASSES[4]],
  quietwarning: [CLASSNAME, ALL_VARIANT_CLASSES[3], ALL_VARIANT_CLASSES[4]],
  overbackground: [CLASSNAME, ALL_VARIANT_CLASSES[6]]
};

/**
 Enumeration for {@link BaseButton} sizes.
 
 @typedef {Object} ButtonSizeEnum
 
 @property {String} MEDIUM
 A medium button is the default, normal sized button.
 @property {String} LARGE
 Not supported. Falls back to MEDIUM.
 */
const size = {
  MEDIUM: 'M',
  LARGE: 'L'
};

/**
 Enumeration for {@link BaseButton} icon position options.
 
 @typedef {Object} ButtonIconPositionEnum
 
 @property {String} RIGHT
 Position should be right of the button label.
 @property {String} LEFT
 Position should be left of the button label.
 */
const iconPosition = {
  RIGHT: 'right',
  LEFT: 'left'
};

/**
 @base BaseButton
 @classdesc The base element for Button components
 */
const BaseButton = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {
      // Create or fetch the label element
      label: this.querySelector(this._contentZoneTagName) || document.createElement(this._contentZoneTagName),
      icon: this.querySelector('coral-icon')
    };
    
    // Events
    this._events = {
      mousedown: '_onMouseDown',
      click: '_onClick'
    };
  
    // Listen for mutations
    this._observer = new MutationObserver(this._makeAccessible.bind(this));
    
    // Watch for changes to the label element
    this._observer.observe(this._elements.label, {
      // Catch changes to childList
      childList: true,
      // Catch changes to textContent
      characterData: true,
      // Monitor any child node
      subtree: true
    });
  }
  
  /**
   The label of the button.
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: this._contentZoneTagName,
      insert: function(label) {
        // Update label styles
        this._updateLabel(label);
        
        // Ensure there's no extra space left for icon only buttons
        if (label.innerHTML.trim() === '') {
          label.textContent = '';
        }
        
        if (this.iconPosition === iconPosition.LEFT) {
          this.appendChild(label);
        }
        else {
          this.insertBefore(label, this.firstChild);
        }
      }
    });
  }
  
  /**
   Position of the icon relative to the label. If no <code>iconPosition</code> is provided, it will be set on the
   left side by default.
   See {@link ButtonIconPositionEnum}.
   
   @type {String}
   @default ButtonIconPositionEnum.LEFT
   @htmlattribute iconposition
   @htmlattributereflected
   */
  get iconPosition() {
    return this._iconPosition || iconPosition.LEFT;
  }
  set iconPosition(value) {
    value = transform.string(value).toLowerCase();
    this._iconPosition = validate.enumeration(iconPosition)(value) && value || iconPosition.LEFT;
    this._reflectAttribute('iconposition', this._iconPosition);
    
    this._updateIcon(this.icon);
  }
  
  /**
   Specifies the icon name used inside the button. See {@link Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    if (this._elements.icon) {
      return this._elements.icon.getAttribute('icon') || '';
    }
  
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value);
    
    this._updateIcon(value);
  }
  
  /**
   Size of the icon. It accepts both lower and upper case sizes. See {@link ButtonIconSizeEnum}.
   
   @type {String}
   @default ButtonIconSizeEnum.SMALL
   @htmlattribute iconsize
   */
  get iconSize() {
    if (this._elements.icon) {
      return this._elements.icon.getAttribute('size') || Icon.size.SMALL;
    }
  
    return this._iconSize || Icon.size.SMALL;
  }
  set iconSize(value) {
    value = transform.string(value).toUpperCase();
    this._iconSize = validate.enumeration(Icon.size)(value) && value || Icon.size.SMALL;
  
    if (this._updatedIcon) {
      this._getIconElement().setAttribute('size', value);
    }
  }
  
  /**
   The size of the button. It accepts both lower and upper case sizes. See {@link ButtonSizeEnum}.
   Currently only "MEDIUM" is supported.
   
   @type {String}
   @default ButtonSizeEnum.MEDIUM
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.MEDIUM;
    this._reflectAttribute('size', this._size);
  }
  
  /**
   Whether the button is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    
    this.trigger('coral-button:_selectedchanged');
  }
  
  // We just reflect it but we also trigger an event to be used by button group
  /** @ignore */
  get value() {
    return this.getAttribute('value');
  }
  set value(value) {
    this._reflectAttribute('value', value);
  
    this.trigger('coral-button:_valuechanged');
  }
  
  /**
   Expands the button to the full width of the parent.
   
   @type {Boolean}
   @default false
   @htmlattribute block
   @htmlattributereflected
   */
  get block() {
    return this._block || false;
  }
  set block(value) {
    this._block = transform.booleanAttr(value);
    this._reflectAttribute('block', this._block);
  
    this.classList.toggle(`${CLASSNAME}--block`, this._block);
  }
  
  /**
   The button's variant. See {@link ButtonVariantEnum}.
   
   @type {String}
   @default ButtonVariantEnum.DEFAULT
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
    this.classList.remove(CLASSNAME, ACTION_CLASSNAME);
    this.classList.remove(...ALL_VARIANT_CLASSES);
    
    if (this._variant === variant._CUSTOM) {
      this.classList.remove(CLASSNAME);
    }
    else {
      this.classList.add(...VARIANT_MAP[this._variant]);
      
      if (this._variant === variant.ACTION || this._variant === variant.QUIET_ACTION) {
        this.classList.remove(CLASSNAME);
      }
    }
  
    // Update label styles
    this._updateLabel();
  }
  
  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
    // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.label || this).textContent.replace(/\s{2,}/g, ' ').trim() || this.icon :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  _onClick(event) {
    if (!this.disabled) {
      this._trackEvent('click', this.getAttribute('is'), event);
    }
  }
  
  /** @ignore */
  _updateIcon(value) {
    if (!this._updatedIcon && this._elements.icon) {
      return;
    }
    
    this._updatedIcon = true;
  
    const iconSizeValue = this.iconSize;
    const iconElement = this._getIconElement();
    iconElement.icon = value;
    // Update size as well
    iconElement.size = iconSizeValue;
  
    // removes the icon element from the DOM.
    if (this.icon === '') {
      iconElement.remove();
    }
    // add or adjust the icon. Add it back since it was blown away by textContent
    else if (!iconElement.parentNode || this._iconPosition) {
      if (this.contains(this.label)) {
        // insertBefore with <code>null</code> appends
        this.insertBefore(iconElement, this.iconPosition === iconPosition.LEFT ? this.label : this.label.nextElementSibling);
      }
    }
  
    // makes sure the button is correctly annotated
    this._makeAccessible();
  }
  
  /**
   Sets the correct accessibility annotations on the icon element.
   @protected
   */
  _makeAccessible() {
    const hasLabel = this.label && this.label.textContent.length > 0;
  
    // when the button has a icon, we need to make sure it is labelled correctly
    if (this.icon !== '' && hasLabel) {
      this._elements.icon.alt = '';
    }
    else if (this._elements.icon) {
      this._elements.icon._updateAltText();
    }
  }
  
  /** @ignore */
  _getIconElement() {
    if (!this._elements.icon) {
      this._elements.icon = new Icon();
      this._elements.icon.size = this.iconSize;
    }
    return this._elements.icon;
  }
  
  /**
   Forces button to receive focus on mousedown
   @param {MouseEvent} event mousedown event
   @ignore
   */
  _onMouseDown(event) {
    const target = event.matchedTarget;
    
    // Wait a frame or button won't receive focus in Safari.
    window.requestAnimationFrame(() => {
      if (target !== document.activeElement) {
        target.focus();
      }
    });
  }
  
  _updateLabel(label) {
    label = label || this._elements.label;
    
    label.classList.remove(`${CLASSNAME}-label`, `${ACTION_CLASSNAME}-label`);
    
    if (this._variant !== variant._CUSTOM) {
      if (this._variant === variant.ACTION || this._variant === variant.QUIET_ACTION) {
        label.classList.add(`${ACTION_CLASSNAME}-label`);
      }
      else {
        label.classList.add(`${CLASSNAME}-label`);
      }
    }
  }
  
  /** @private */
  get _contentZoneTagName() {
    return Object.keys(this._contentZones)[0];
  }
  
  get _contentZones() { return {'coral-button-label': 'label'}; }
  
  /**
   Returns {@link BaseButton} sizes.
   
   @return {ButtonSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link BaseButton} variants.
   
   @return {ButtonVariantEnum}
   */
  static get variant() { return variant; }
  
  /**
   Returns {@link BaseButton} icon positions.
   
   @return {ButtonIconPositionEnum}
   */
  static get iconPosition() { return iconPosition; }
  
  /**
   Returns {@link BaseButton} icon sizes.
   
   @return {ButtonIconSizeEnum}
   */
  static get iconSize() { return iconSize; }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      iconposition: 'iconPosition',
      iconsize: 'iconSize',
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'iconposition',
      'iconsize',
      'icon',
      'size',
      'selected',
      'block',
      'variant',
      'value'
    ]);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    if (!this._size) { this.size = size.MEDIUM; }
    
    // Create a fragment
    const fragment = document.createDocumentFragment();
    
    const label = this._elements.label;
  
    const contentZoneProvided = label.parentNode;
    
    // Remove it so we can process children
    if (contentZoneProvided) {
      this.removeChild(label);
    }
  
    let iconAdded = false;
    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
    
      if (child.nodeName === 'CORAL-ICON') {
        // Don't add duplicated icons
        if (iconAdded) {
          this.removeChild(child);
        }
        else {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
          iconAdded = true;
        }
      }
      // Avoid content zone to be voracious
      else if (contentZoneProvided) {
        fragment.appendChild(child);
      }
      else {
        // Move anything else into the label
        label.appendChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(fragment);
  
    // Assign the content zones, moving them into place in the process
    this.label = label;
  
    // Make sure the icon is well positioned
    this._updatedIcon = true;
    this._updateIcon(this.icon);
  
    // a11y
    this._makeAccessible();
  }
  
  /**
   Triggered when {@link BaseButton#selected} changed.
   
   @typedef {CustomEvent} coral-button:_selectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link BaseButton#value} changed.
   
   @typedef {CustomEvent} coral-button:_valuechanged
   
   @private
   */
};

export default BaseButton;
