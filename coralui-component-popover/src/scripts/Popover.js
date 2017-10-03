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

import {Overlay} from 'coralui-component-overlay';
import base from '../templates/base';
import {commons, transform, validate} from 'coralui-util';

const CLASSNAME = 'coral3-Popover';

const OFFSET = 5;

/**
 Boolean enumeration for popover closable state.
 
 @memberof Coral.Popover
 @enum {String}
 */
const closable = {
  /** Show a close button on the popover and close the popover when clicked. */
  ON: 'on',
  /**
   Do not show a close button. Elements with the <code>coral-close</code> attributes will still close the
   popover.
   */
  OFF: 'off'
};

/**
 Popover variants.
 
 @memberof Coral.Popover
 @enum {String}
 */
const variant = {
  /** A popover with the default, gray header and no icon. */
  DEFAULT: 'default',
  /** A popover with a red header and warning icon, indicating that an error has occurred. */
  ERROR: 'error',
  /** A popover with an orange header and warning icon, notifying the user of something important. */
  WARNING: 'warning',
  /** A popover with a green header and checkmark icon, indicates to the user that an operation was successful. */
  SUCCESS: 'success',
  /** A popover with a blue header and question mark icon, provides the user with help. */
  HELP: 'help',
  /** A popover with a blue header and info icon, informs the user of non-critical information. */
  INFO: 'info'
};

// A string of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Popover
 @classdesc A Popover component
 @htmltag coral-popover
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.overlay
 */
class Popover extends Overlay {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = commons.extend(this._elements, {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-popover-header') || document.createElement('coral-popover-header'),
      content: this.querySelector('coral-popover-content') || document.createElement('coral-popover-content')
    });
    base.call(this._elements);
    
    // Events
    this._delegateEvents({
      'global:capture:click': '_handleClick',
      'click [coral-close]': '_handleCloseClick'
    });
    
    // Override defaults from Overlay
    this._focusOnShow = this.constructor.focusOnShow.ON;
    this._trapFocus = this.constructor.trapFocus.ON;
    this._returnFocus = this.constructor.returnFocus.ON;
    this._overlayAnimationTime = this.constructor.FADETIME;
    this._lengthOffset = OFFSET;
  
    // Listen for mutations
    this._headerObserver = new MutationObserver(this._hideHeaderIfEmpty.bind(this));
  
    // Watch for changes to the header element's children
    this._observeHeader();
  }
  
  /**
   The popover's content element.
   
   @contentzone
   @name content
   @type {HTMLElement}
   @memberof Coral.Popover#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-popover-content',
      insert: function(content) {
        this._elements.contentWrapper.appendChild(content);
      }
    });
  }
  
  /**
   The popover's header element.
   
   @contentzone
   @name header
   @type {HTMLElement}
   @memberof Coral.Popover#
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-popover-header',
      insert: function(header) {
        this._elements.headerContent.appendChild(header);
      },
      set: function() {
        // Stop observing the old header and observe the new one
        this._observeHeader();
    
        // Check if header needs to be hidden
        this._hideHeaderIfEmpty();
      }
    });
  }
  
  /**
   The popover's variant.
   
   @type {Coral.Popover.variant}
   @default Coral.Popover.variant.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Popover#
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
    
    // Remove all variant classes
    this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);
    
    if (this._variant === variant.DEFAULT) {
      this._elements.icon.icon = '';
      
      // ARIA
      this.setAttribute('role', 'dialog');
    }
    else {
      this._elements.icon.icon = ICON_CLASSES[this._variant];
      
      // Set new variant class
      // Don't use this._className; use the constant
      // This lets popover get our styles for free
      this.classList.add(`${CLASSNAME}--${this._variant}`);
      
      // ARIA
      this.setAttribute('role', 'alertdialog');
    }
  }
  
  /**
   Whether the popover should have a close button.
   
   @type {Coral.Popover.closable}
   @default Coral.Popover.closable.OFF
   @htmlattribute closable
   @htmlattributereflected
   @memberof Coral.Popover#
   */
  get closable() {
    return this._closable || closable.OFF;
  }
  set closable(value) {
    value = transform.string(value).toLowerCase();
    this._closable = validate.enumeration(closable)(value) && value || closable.OFF;
    this._reflectAttribute('closable', this._closable);
  
    this._elements.closeButton.style.display = this.closable === closable.ON ? '' : 'none';
  }
  
  /**
   The popover's icon.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @memberof Coral.Popover#
   */
  get icon() {
    return this._elements.icon;
  }
  set icon(value) {
    this._elements.icon = value;
  }
  
  // JSDoc inherited
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
  
  /** @ignore */
  _observeHeader() {
    if (this._headerObserver) {
      this._headerObserver.disconnect();
      this._headerObserver.observe(this._elements.header, {
        childList: true, // Catch changes to childList
        characterData: true, // Catch changes to textContent
        subtree: true // Monitor any child node
      });
    }
  }
  
  /**
   Hide the header wrapper if the header content zone is empty.
   @ignore
   */
  _hideHeaderIfEmpty() {
    const header = this._elements.header;
    const headerWrapper = this._elements.headerWrapper;
    const headerContent = this._elements.headerContent;
    
    // If it's empty and has no non-textnode children, hide the header
    const hiddenValue = header.children.length === 0 && header.textContent.replace(/\s*/g, '') === '';
    
    // Only bother if the hidden status has changed
    if (hiddenValue !== headerWrapper.hidden) {
      headerWrapper.hidden = hiddenValue;
      
      if (hiddenValue) {
        headerContent.removeAttribute('role');
        headerContent.removeAttribute('aria-level');
      }
      else {
        headerContent.setAttribute('role', 'heading');
        headerContent.setAttribute('aria-level', '2');
      }
      
      // Reposition as the height has changed
      this.reposition();
    }
  }
  
  /**
   @ignore
   @todo maybe this should be mixin or something
   */
  _handleCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.hide();
      event.stopPropagation();
    }
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
      }
      else {
        this.hide();
      }
    }
    else if (this.open && !this.contains(eventTarget)) {
      // Close if we're open and the click was outside of the target and outside of the popover
      this.hide();
    }
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {
    return {
      'coral-popover-header': 'header',
      'coral-popover-content': 'content'
    };
  }
  
  // Expose enumerations
  static get variant() {return variant;}
  static get closable() {return closable;}
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'closable',
      'variant',
      'icon'
    ]);
  }
  
  connectedCallback() {
    this.classList.add(CLASSNAME);
    
    // ARIA
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-live', 'assertive'); // This helped annoucements in certian screen readers
    
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.DEFAULT;}
    if (!this._closable) {this.closable = closable.OFF;}
  
    const templateHandleNames = ['headerWrapper', 'contentWrapper'];
  
    // Create a temporary fragment
    const frag = document.createDocumentFragment();
    
    // Render the main template
    frag.appendChild(this._elements.headerWrapper);
    frag.appendChild(this._elements.contentWrapper);
    
    // Fetch the content zones
    const header = this._elements.header;
    const content = this._elements.content;
    
    // Remove content zones so we can process children
    if (header.parentNode) {header.remove();}
    if (content.parentNode) {content.remove();}
  
    // Remove tab captures
    Array.prototype.filter.call(this.children, function(child) {
      return (child.hasAttribute('coral-tabcapture'));
    }).forEach((tabCapture) => {
      this.removeChild(tabCapture);
    }, this);
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the content
        content.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(frag);
    
    // Assign content zones
    this.header = header;
    this.content = content;
  
    // Add the Overlay coral-tabcapture elements at the end
    super.connectedCallback();
  }
}

export default Popover;
