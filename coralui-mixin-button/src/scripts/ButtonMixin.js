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

import {Icon} from '/coralui-component-icon';
import {transform, validate} from '/coralui-util';

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
 A default button that indicates that the button's action is the primary action.
 @property {String} SECONDARY
 A button that indicates that the button's action is the secondary action.
 @property {String} QUIET
 A quiet button that indicates that the button's action is the primary action.
 @property {String} MINIMAL
 A quiet button that indicates that the button's action is the secondary action.
 @property {String} WARNING
 A button that indicates that the button's action is dangerous.
 @property {String} ICON
 A quiet icon only button.
 @property {String} DEFAULT
 Not supported. Falls back to SECONDARY.
 */
const variant = {
  CTA: 'cta',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  QUIET: 'quiet',
  MINIMAL: 'minimal',
  WARNING: 'warning',
  ICON: 'icon',
  DEFAULT: 'secondary',
  // Private to be used for custom Button classes like toggle, dropdown and action
  _CUSTOM: '_custom'
};

// the button's base classname
const CLASSNAME = '_coral-Button';

// builds an array containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  let value;
  if (variantValue === 'QUIET') {
    value = `${CLASSNAME}--${variant.QUIET}--primary`;
  }
  else if (variantValue === 'MINIMAL') {
    value = `${CLASSNAME}--${variant.QUIET}--secondary`;
  }
  else {
    value = `${CLASSNAME}--${variant[variantValue]}`;
  }
  
  if (variantValue !== '_CUSTOM') {
    ALL_VARIANT_CLASSES.push(value);
  }
}

/**
 Enumeration for {@link ButtonMixin} sizes.
 
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
 Enumeration for {@link ButtonMixin} icon position options.
 
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
 @mixin ButtonMixin
 @classdesc The base element for Button components
 */
const ButtonMixin = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {
      // Create or fetch the label element
      label: this.querySelector(this._contentZoneTagName) || document.createElement(this._contentZoneTagName)
    };
    
    // Events
    this._events = {
      mousedown: '_onMouseDown'
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
    return this._elements.icon && this._elements.icon.icon || '';
  }
  set icon(value) {
    this._updateIcon(value);
  }
  
  /**
   Size of the icon. It accepts both lower and upper case sizes. See {@link ButtonIconSizeEnum}.
   
   @type {String}
   @default ButtonIconSizeEnum.SMALL
   @htmlattribute iconsize
   */
  get iconSize() {
    return this._elements.icon && this._elements.icon.size || iconSize.SMALL;
  }
  set iconSize(value) {
    value = transform.string(value).toUpperCase();
    this._getIconElement().size = validate.enumeration(iconSize)(value) && value || iconSize.SMALL;
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
   @default ButtonVariantEnum.PRIMARY
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.PRIMARY;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.PRIMARY;
    this._reflectAttribute('variant', this._variant);
    
    // removes every existing variant
    this.classList.remove(...ALL_VARIANT_CLASSES);
    
    if (this._variant === variant.QUIET) {
      this.classList.add(`${CLASSNAME}--${variant.QUIET}--primary`);
    }
    else if (this._variant === variant.MINIMAL) {
      this.classList.add(`${CLASSNAME}--${variant.QUIET}--secondary`);
    }
    else if (this._variant !== variant._CUSTOM) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
    
    // Hide the label if we're in icon only mode
    this._elements.label.hidden = this._variant === variant.ICON;
  }
  
  /** @ignore */
  _updateIcon(value) {
    const iconElement = this._getIconElement();
    iconElement.icon = value;
  
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
  
  /** @private */
  get _contentZoneTagName() {
    return Object.keys(this._contentZones)[0];
  }
  
  get _contentZones() { return {'coral-button-label': 'label'}; }
  
  /**
   Returns {@link ButtonMixin} sizes.
   
   @return {ButtonSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link ButtonMixin} variants.
   
   @return {ButtonVariantEnum}
   */
  static get variant() { return variant; }
  
  /**
   Returns {@link ButtonMixin} icon positions.
   
   @return {ButtonIconPositionEnum}
   */
  static get iconPosition() { return iconPosition; }
  
  /**
   Returns {@link ButtonMixin} icon sizes.
   
   @return {ButtonIconSizeEnum}
   */
  static get iconSize() { return iconSize; }
  
  /** @ignore */
  static get observedAttributes() {
    return [
      'iconposition',
      'iconPosition',
      'iconsize',
      'iconSize',
      'icon',
      'size',
      'selected',
      'block',
      'variant',
      'value'
    ];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.PRIMARY; }
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
    this._updateIcon(this.icon);
  
    // a11y
    this._makeAccessible();
  }
  
  /**
   Triggered when {@link ButtonMixin#selected} changed.
   
   @typedef {CustomEvent} coral-button:_selectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link ButtonMixin#value} changed.
   
   @typedef {CustomEvent} coral-button:_valuechanged
   
   @private
   */
};

export default ButtonMixin;
