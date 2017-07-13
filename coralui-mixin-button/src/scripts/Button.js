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

import Icon from 'coralui-component-icon';
import {transform, validate} from 'coralui-util';

/**
 Enum for button variant values.
 @enum {String}
 @memberof Coral.Button
 */
const variant = {
  /** A button that is meant to grab the user's attention. */
  CTA: 'cta',
  /** A button that indicates that the button's action is the primary action. */
  PRIMARY: 'primary',
  /** A default, gray button */
  SECONDARY: 'secondary',
  /** An alias to secondary, included for backwards compatibility. */
  DEFAULT: 'secondary',
  /** A button with no border or background. */
  QUIET: 'quiet',
  /** A button that indicates that the button's action is dangerous. */
  WARNING: 'warning',
  /** A minimal button with no background or border. */
  MINIMAL: 'minimal'
};

// the button's base classname
const CLASSNAME = 'coral-Button';

// builds an array containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(CLASSNAME + '--' + variant[variantValue]);
}

/**
 Enumeration representing button sizes.
 @memberof Coral.Button
 @enum {String}
 */
const size = {
  /** A medium button is the default, normal sized button. */
  MEDIUM: 'M',
  /** A large button, which is larger than a medium button. */
  LARGE: 'L'
};

/**
 Enumeration representing the icon position inside the button.
 @memberof Coral.Button
 @enum {String}
 */
const iconPosition = {
  /** Position should be right of the button label. */
  RIGHT: 'right',
  /** Position should be left of the button label. */
  LEFT: 'left'
};

/**
 @mixin Button
 @classdesc The base element for button components
 */
const Button = (superClass) => class extends superClass {
  constructor() {
    super();
    
    // Templates
    this._elements = {
      // Create or fetch the label element
      label: this.querySelector(this._contentZoneTagName) || document.createElement(this._contentZoneTagName)
    };
    
    // Events
    this._events = {
      'mousedown': '_onMouseDown'
    };
  
    // Listen for mutations
    this._observer = new MutationObserver(this._makeAccessible.bind(this));
    
    // Watch for changes to the label element
    this._observer.observe(this._elements.label, {
      childList: true, // Catch changes to childList
      characterData: true, // Catch changes to textContent
      subtree: true // Monitor any child node
    });
  }
  
  /**
   The label of the button.
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Button#
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: this._contentZoneTagName,
      insert: function(label) {
        this.appendChild(label);
      }
    });
  }
  
  /**
   Position of the icon relative to the label. If no <code>iconPosition</code> is provided, it will be set on the
   left side by default.
   @type {Coral.Button.iconPosition}
   @default Coral.Button.iconPosition.LEFT
   @htmlattribute iconposition
   @htmlattributereflected
   @memberof Coral.Button#
   */
  get iconPosition() {
    return this._iconPosition || iconPosition.LEFT;
  }
  set iconPosition(value) {
    // If value is null null, it means the attribute was removed
    value = value === null ? iconPosition.LEFT : transform.string(value).toLowerCase();
  
    if (validate.enumeration(iconPosition)(value)) {
      this._iconPosition = value;
      
      transform.reflect(this, 'iconposition', value);
      
      this._updateIcon(this.icon);
    }
  }
  
  /**
   Specifies the icon name used inside the button. See {@link Coral.Icon} for valid icon names.
   @type {String}
   @default ""
   @htmlattribute icon
   @memberof Coral.Button#
   @see {@link Coral.Icon}
   */
  get icon() {
    return (this._elements.icon && this._elements.icon.icon) || '';
  }
  set icon(value) {
    this._updateIcon(value);
  }
  
  /**
   Size of the icon. It accepts both lower and upper case sizes.
   @type {Coral.Icon.size}
   @default Coral.Icon.size.SMALL
   @htmlattribute iconsize
   @memberof Coral.Button#
   @see {@link Coral.Icon#size}
   */
  get iconSize() {
    return (this._elements.icon && this._elements.icon.size) || Icon.size.SMALL;
  }
  set iconSize(value) {
    this._getIconElement().size = value;
  }
  
  /**
   The size of the button. It accepts both lower and upper case sizes. Currently only "M" (the default) and "L"
   are available.
   @type {Coral.Button.size}
   @default Coral.Button.size.MEDIUM
   @htmlattribute size
   @htmlattributereflected
   @memberof Coral.Button#
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
  
    if (validate.enumeration(size)(value)) {
      this._size = value;
  
      transform.reflect(this, 'size', value);
  
      this.classList.toggle(`${CLASSNAME}--large`, this.size === size.LARGE);
    }
  }
  
  /**
   Whether the button is selected.
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Button#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    const oldValue = this._selected;
    
    this._selected = transform.booleanAttr(value);
  
    transform.reflect(this, 'selected', this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    
    this.trigger('coral-button:_selectedchanged', {
      oldValue: oldValue,
      value: this._selected
    });
  }
  
  // We just reflect it but we also trigger an event to be used by button group
  get value() {
    return this.getAttribute('value');
  }
  set value(value) {
    const oldValue = this.value;
    
    transform.reflect(this, 'value', value);
  
    this.trigger('coral-button:_valuechanged', {
      oldValue: oldValue,
      value: value
    });
  }
  
  /**
   Expands the button to the full width of the parent.
   @type {Boolean}
   @default false
   @htmlattribute block
   @htmlattributereflected
   @memberof Coral.Button#
   */
  get block() {
    return this._block || false;
  }
  set block(value) {
    this._block = transform.booleanAttr(value);
  
    transform.reflect(this, 'block', this._block);
  
    this.classList.toggle(`${CLASSNAME}--block`, this._block);
  }
  
  /**
   The button's variant.
   @type {Coral.Button.variant}
   @default Coral.Button.variant.SECONDARY
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Button#
   */
  get variant() {
    return this._variant || variant.SECONDARY;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(variant)(value)) {
      this._variant = value;
  
      transform.reflect(this, 'variant', this._variant);
      
      // removes every existing variant
      this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);
  
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
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
      // insertBefore with <code>null</code> appends
      this.insertBefore(iconElement, this.iconPosition === iconPosition.LEFT ? this.firstChild : null);
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
    else {
      if (this._elements.icon) {
        this._elements.icon._updateAltText();
      }
    }
  }
  
  /** @ignore */
  _getIconElement() {
    if (!this._elements.icon) {
      this._elements.icon = document.createElement('coral-icon');
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
    window.requestAnimationFrame(function() {
      if (target !== document.activeElement) {
        target.focus();
      }
    });
  }
  
  /** @private */
  get _contentZoneTagName() {
    return Object.keys(this._contentZones)[0];
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.label;}
  set defaultContentZone(value) {this.label = value;}
  get _attributes() {return {iconposition: 'iconPosition', iconsize: 'iconSize'};}
  get _contentZones() {return {'coral-button-label': 'label'};}
  
  // Expose enumerations
  static get size() {return size;}
  static get variant() {return variant;}
  static get iconPosition() {return iconPosition;}
  
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
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.SECONDARY;}
    if (!this._size) {this.size = size.MEDIUM;}
    
    // Create a temporary fragment
    const fragment = document.createDocumentFragment();
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label.parentNode) {
      this.removeChild(label);
    }
  
    let iconAdded = false;
    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
    
      if (child.tagName === 'CORAL-ICON') {
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
   Triggered when {@link Coral.Button#selected} changed.
   @event Coral.Button#coral-button:_selectedchanged
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Button#value} changed.
   @event Coral.Button#coral-button:_valuechanged
   @param {Object} event Event object
   @private
   */
};

export default Button;
