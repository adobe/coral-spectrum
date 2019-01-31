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

import {Overlay} from '../../../coralui-component-overlay';
import {Icon} from '../../../coralui-component-icon';
import base from '../templates/base';
import {commons, transform, validate, i18n} from '../../../coralui-utils';

const CLASSNAME = '_coral-Popover';

const OFFSET = 5;

// Used to map icon with variant
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// If it's empty and has no non-textnode children
const _isEmpty = (el) => !el || el.children.length === 0 && el.textContent.replace(/\s*/g, '') === '';

/**
 Enumeration for {@link Popover} closable state.
 
 @typedef {Object} PopoverClosableEnum
 
 @property {String} ON
 Show a close button on the popover and close the popover when clicked.
 @property {String} OFF
 Do not show a close button. Elements with the <code>coral-close</code> attributes will still close the
 popover.
 */
const closable = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link Popover} variants.
 
 @typedef {Object} PopoverVariantEnum
 
 @property {String} DEFAULT
 A default popover without header icon.
 @property {String} ERROR
 A popover with an error header and icon, indicating that an error has occurred.
 @property {String} WARNING
 A popover with a warning header and icon, notifying the user of something important.
 @property {String} SUCCESS
 A popover with a success header and icon, indicates to the user that an operation was successful.
 @property {String} HELP
 A popover with a question header and icon, provides the user with help.
 @property {String} INFO
 A popover with an info header and icon, informs the user of non-critical information.
 */
const variant = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  HELP: 'help',
  INFO: 'info'
};

// A string of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`_coral-Dialog--${variant[variantValue]}`);
}

// A string of all possible placement classnames
const placement = Overlay.placement;
const ALL_PLACEMENT_CLASSES = [];
for (const placementKey in placement) {
  ALL_PLACEMENT_CLASSES.push(`${CLASSNAME}--${placement[placementKey]}`);
}

/**
 @class Coral.Popover
 @classdesc A Popover component for small overlay content.
 @htmltag coral-popover
 @extends {Overlay}
 */
class Popover extends Overlay {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = commons.extend(this._elements, {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-popover-header') || document.createElement('coral-popover-header'),
      content: this.querySelector('coral-popover-content') || document.createElement('coral-popover-content'),
      footer: this.querySelector('coral-popover-footer') || document.createElement('coral-popover-footer')
    });
    base.call(this._elements, {i18n});
    
    // Events
    this._delegateEvents({
      'global:capture:click': '_handleClick',
      'coral-overlay:positioned': '_onPositioned'
    });
    
    // Override defaults from Overlay
    this._focusOnShow = this.constructor.focusOnShow.ON;
    this._trapFocus = this.constructor.trapFocus.ON;
    this._returnFocus = this.constructor.returnFocus.ON;
    this._overlayAnimationTime = this.constructor.FADETIME;
    this._lengthOffset = OFFSET;
  
    // Listen for mutations
    ['header', 'footer'].forEach((name) => {
      this[`_${name}Observer`] = new MutationObserver(() => {
        this._hideContentZoneIfEmpty(name);
        this._toggleFlyout();
      });
  
      // Watch for changes
      this._observeContentZone(name);
    });
  }
  
  /**
   The popover's content element.
   
   @contentzone
   @name content
   @type {HTMLElement}
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-popover-content',
      insert: function(content) {
        const footer = this.footer;
        // The content should always be before footer
        this.insertBefore(content, this.contains(footer) && footer || null);
      }
    });
  }
  
  /**
   The popover's header element.
   
   @contentzone
   @name header
   @type {HTMLElement}
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-popover-header',
      insert: function(header) {
        this._elements.headerWrapper.insertBefore(header, this._elements.headerWrapper.firstChild);
      },
      set: function() {
        // Stop observing the old header and observe the new one
        this._observeContentZone('header');
    
        // Check if header needs to be hidden
        this._hideContentZoneIfEmpty('header');
      }
    });
  }
  
  /**
   The popover's footer element.
   
   @type {HTMLElement}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }
  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-popover-footer',
      insert: function(footer) {
        // The footer should always be after content
        this.appendChild(footer);
      },
      set: function() {
        // Stop observing the old header and observe the new one
        this._observeContentZone('footer');
  
        // Check if header needs to be hidden
        this._hideContentZoneIfEmpty('footer');
      }
    });
  }
  
  /**
   The popover's variant. See {@link PopoverVariantEnum}.
   
   @type {String}
   @default PopoverVariantEnum.DEFAULT
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
  
    // Insert SVG icon
    this._insertTypeIcon();
    
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);
    
    // Toggle dialog mode
    this._toggleFlyout();
    
    if (this._variant === variant.DEFAULT) {
      // ARIA
      this.setAttribute('role', 'dialog');
    }
    else {
      // Set new variant class
      this.classList.add(`_coral-Dialog--${this._variant}`);
      
      // ARIA
      this.setAttribute('role', 'alertdialog');
    }
  }
  
  /**
   Whether the popover should have a close button. See {@link PopoverClosableEnum}.
   
   @type {String}
   @default PopoverClosableEnum.OFF
   @htmlattribute closable
   @htmlattributereflected
   */
  get closable() {
    return this._closable || closable.OFF;
  }
  set closable(value) {
    value = transform.string(value).toLowerCase();
    this._closable = validate.enumeration(closable)(value) && value || closable.OFF;
    this._reflectAttribute('closable', this._closable);
  
    this._elements.closeButton.style.display = this._closable === closable.ON ? 'block' : 'none';
  }
  
  /**
   Inherited from {@link Overlay#open}.
   */
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
  
    const target = this._getTarget();
    if (target) {
      if (this.open) {
        // Check if the target already has is-selected
        this._targetWasSelected = target.classList.contains('is-selected');
      
        // Only bother adding the class if the target doesn't have it
        if (!this._targetWasSelected) {
          // Highlight target
          target.classList.add('is-selected');
        }
      }
      else if (!this._targetWasSelected) {
        // When closed, only remove the class if the target didn't have it before
        target.classList.remove('is-selected');
      }
    }
  }
  
  /**
   @ignore
   
   Not supported anymore.
   */
  get icon() {
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value);
  }
  
  _onPositioned(event) {
    if (this.open) {
      // Set arrow placement
      this.classList.remove(...ALL_PLACEMENT_CLASSES);
      this.classList.add(`${CLASSNAME}--${event.detail.placement}`);
    }
  }
  
  _insertTypeIcon() {
    if (this._elements.icon) {
      this._elements.icon.remove();
    }
    
    let variantValue = this.variant;
    
    // Warning icon is same as ERROR icon
    if (variantValue === variant.WARNING || variantValue === variant.ERROR) {
      variantValue = 'alert';
    }
    
    // Inject the SVG icon
    if (variantValue !== variant.DEFAULT) {
      const iconName = capitalize(variantValue);
      this._elements.headerWrapper.insertAdjacentHTML('beforeend', Icon._renderSVG(`spectrum-css-icon-${iconName}Medium`, ['_coral-Dialog-typeIcon', `_coral-UIIcon-${iconName}Medium`]));
      this._elements.icon = this.querySelector('._coral-Dialog-typeIcon');
    }
  }
  
  _observeContentZone(name) {
    const observer = this[`_${name}Observer`];
    if (observer) {
      observer.disconnect();
      observer.observe(this._elements[name], {
        // Catch changes to childList
        childList: true,
        // Catch changes to textContent
        characterData: true,
        // Monitor any child node
        subtree: true
      });
    }
  }
  
  _hideContentZoneIfEmpty(name) {
    const contentZone = this._elements[name];
    const target = name === 'header' ? this._elements.headerWrapper : contentZone;
  
    // If it's empty and has no non-textnode children, hide the header
    const hiddenValue = _isEmpty(contentZone);
  
    // Only bother if the hidden status has changed
    if (hiddenValue !== target.hidden) {
      target.hidden = hiddenValue;
    
      // Reposition as the height has changed
      this.reposition();
    }
  }
  
  _toggleFlyout() {
    // Flyout mode is when there's only content in default variant
    const isFlyout = this._variant === variant.DEFAULT && _isEmpty(this.header) && _isEmpty(this.footer);
    
    this.classList.toggle(`${CLASSNAME}--dialog`, !isFlyout);
    this._elements.tip.hidden = isFlyout;
  }
  
  /** @private */
  _handleClick(event) {
    if (this.interaction === this.constructor.interaction.OFF) {
      // Since we use delegation, just ignore clicks if interaction is off
      return;
    }
    
    const eventTarget = event.target;
    const targetEl = this._getTarget();
    
    const eventIsWithinTarget = targetEl ? targetEl.contains(eventTarget) : false;
    
    if (eventIsWithinTarget) {
      // When target is clicked
      
      if (!this.open && !targetEl.disabled) {
        // Open if we're not already open and target element is not disabled
        this.show();
  
        this._trackEvent('display', 'coral-popover', event);
      }
      else {
        this.hide();
  
        this._trackEvent('close', 'coral-popover', event);
      }
    }
    else if (this.open && !this.contains(eventTarget)) {
      // Close if we're open and the click was outside of the target and outside of the popover
      this.hide();
  
      this._trackEvent('close', 'coral-popover', event);
    }
  }
  
  get _contentZones() {
    return {
      'coral-popover-header': 'header',
      'coral-popover-content': 'content',
      'coral-popover-footer': 'footer'
    };
  }
  
  /**
   Returns {@link Popover} variants.
   
   @return {PopoverVariantEnum}
   */
  static get variant() { return variant; }
  
  /**
   Returns {@link Popover} close options.
   
   @return {PopoverClosableEnum}
   */
  static get closable() { return closable; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'closable',
      'variant'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
    
    // ARIA
    this.setAttribute('role', 'dialog');
    // This helped announcements in certain screen readers
    this.setAttribute('aria-live', 'assertive');
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    if (!this._closable) { this.closable = closable.OFF; }
  
    // // Fetch the content zones
    const header = this._elements.header;
    const content = this._elements.content;
    const footer = this._elements.footer;
  
    // Verify if a content zone is provided
    const contentZoneProvided = this.contains(content) && content || this.contains(footer) && footer || this.contains(header) && header;
    
    // Remove content zones so we can process children
    if (header.parentNode) { header.remove(); }
    if (content.parentNode) { content.remove(); }
    if (footer.parentNode) { footer.remove(); }
  
    // Remove tab captures
    Array.prototype.filter.call(this.children, (child) => child.hasAttribute('coral-tabcapture')).forEach((tabCapture) => {
      this.removeChild(tabCapture);
    });
  
    // Support cloneNode
    const template = this.querySelectorAll('._coral-Dialog-header, ._coral-Dialog-closeButton, ._coral-Popover-tip');
    for (let i = 0; i < template.length; i++) {
      template[i].remove();
    }
  
    // Move everything in the content
    if (!contentZoneProvided) {
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
  
    // Insert template
    const frag = document.createDocumentFragment();
    frag.appendChild(this._elements.headerWrapper);
    frag.appendChild(this._elements.closeButton);
    frag.appendChild(this._elements.tip);
    this.appendChild(frag);
    
    // Assign content zones
    this.header = header;
    this.content = content;
    this.footer = footer;
  
    // Add the Overlay coral-tabcapture elements at the end
    super.connectedCallback();
  }
}

export default Popover;
