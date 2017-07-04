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
import Button from 'coralui-component-button';
import {transform} from 'coralui-util';

// Use the button class name
const CLASSNAME = 'coral-Button';

// Key code
const SPACE = 32;

// AnchorButton also observes the disabled attribute in addition to the observed attributes from Button
let observedAttributes = Button.observedAttributes;
observedAttributes.push('disabled');

/**
 @class Coral.AnchorButton
 @classdesc A Link component rendering as a button.
 @htmltag coral-anchorbutton
 @htmlbasetag a
 @extends HTMLAnchorElement
 @extends Coral.mixin.component
 */
class AnchorButton extends Component(HTMLAnchorElement) {
  constructor() {
    super();
  
    this._elements = {
      label: document.createElement('coral-anchorbutton-label')
    };
  
    this.on({
      'mousedown': '_onMouseDown',
      'keydown': '_onKeyDown',
      'keyup': '_onKeyUp'
    });
    
    // cannot use the events hash because events on disabled items are not reported
    this.addEventListener('click', this._onClick.bind(this));
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
      tagName: 'coral-anchorbutton-label',
      insert: function(label) {
        this.appendChild(label);
      }
    });
  }
  
  /**
   Disables the button from user interaction.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.AnchorButton#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    
    transform.reflect(this, 'disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this.setAttribute('tabindex', this._disabled ? '-1' : '0');
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  /**
   Keyboard handling per the WAI-ARIA button widget design pattern:
   https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role
 
   @ignore
   */
  _onKeyDown(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.click();
      this.classList.add('is-selected');
    }
  }
  
  /** @ignore */
  _onKeyUp(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.classList.remove('is-selected');
    }
  }
  
  /** @ignore */
  _onClick(event) {
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  static get observedAttributes() {
    return observedAttributes;
  }
  
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._variant) {this.variant = Button.variant.SECONDARY;}
    if (!this._size) {this.size = Button.size.MEDIUM;}
  
    // Create a temporary fragment
    const fragment = document.createDocumentFragment();
  
    // Create or fetch the label element.
    const label = this.querySelector('coral-anchorbutton-label') || this._elements.label;
  
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
    // Force tabindex and aria-disabled attribute reflection
    if (!this.disabled) {
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
    this.setAttribute('role', 'button');
    this._makeAccessible();
  
    // Listen for mutations
    this._observer = new MutationObserver(this._makeAccessible.bind(this));
  
    // Watch for changes to the label element
    this._observer.observe(this.label, {
      childList: true, // Catch changes to childList
      characterData: true, // Catch changes to textContent
      subtree: true // Monitor any child node
    });
  }
}

// Copy properties from Button
const target = AnchorButton.prototype;
const source = Button.prototype;

Object.getOwnPropertyNames(source).forEach(function (name) {
  if (name !== "constructor" && name !== 'connectedCallback' && name !== 'label') {
    Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
  }
});

export default AnchorButton;
