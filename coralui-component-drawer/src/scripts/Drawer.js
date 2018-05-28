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

import {ComponentMixin} from '../../../coralui-mixin-component';
import '../../../coralui-component-button';
import base from '../templates/base';
import {commons, transform, validate} from '../../../coralui-util';

/**
 Enumeration for {@link Drawer} directions.
 
 @typedef {Object} DrawerDirectionEnum
 
 @property {String} DOWN
 A drawer with a toggle button on the bottom.
 @property {String} UP
 A drawer with a toggle button on top.
 */
const direction = {
  DOWN: 'down',
  UP: 'up'
};

// The drawer's base classname
const CLASSNAME = '_coral-Drawer';

// A string of all possible direction classnames
const ALL_DIRECTION_CLASSES = [];
for (const directionValue in direction) {
  ALL_DIRECTION_CLASSES.push(`${CLASSNAME}--${direction[directionValue]}`);
}

/**
 @class Coral.Drawer
 @classdesc A Drawer component to display content that can be opened and closed with a sliding animation.
 @htmltag coral-drawer
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Drawer extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {
      content: this.querySelector('coral-drawer-content') || document.createElement('coral-drawer-content')
    };
    base.call(this._elements);
    
    // Events
    this._delegateEvents({
      'click ._coral-Drawer-toggleButton': '_onClick'
    });
  }
  
  /**
   Whether this item is disabled or not. This will stop every user interaction with the item.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
  
    this.setAttribute('aria-disabled', this._disabled);
    this._elements.toggle.hidden = this._disabled;
  }
  
  /**
   The drawer's content element.
   
   @type {HTMLElement}
   @htmlttribute content
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-drawer-content',
      insert: function(content) {
        this._elements.contentWrapper.appendChild(content);
      }
    });
  }
  
  /**
   The drawer's direction. See {@link DrawerDirectionEnum}.
   
   @type {String}
   @default DrawerDirectionEnum.DOWN
   @htmlattribute direction
   @htmlattributereflected
   */
  get direction() {
    return this._direction || direction.DOWN;
  }
  set direction(value) {
    value = transform.string(value).toLowerCase();
    this._direction = validate.enumeration(direction)(value) && value || direction.DOWN;
    this._reflectAttribute('direction', this._direction);
  
    this.classList.remove(...ALL_DIRECTION_CLASSES);
    this.classList.add(`${CLASSNAME}--${this._direction}`);
  }
  
  /**
   Whether the Drawer is expanded or not.
   
   @type {Boolean}
   @default false
   @htmlattribute open
   @htmlattributereflected
   */
  get open() {
    return this._open || false;
  }
  set open(value) {
    const silenced = this._silenced;
    
    this._open = transform.booleanAttr(value);
    this._reflectAttribute('open', this._open);
  
    this.setAttribute('aria-expanded', this._open);
  
    // eslint-disable-next-line no-unused-vars
    let offsetHeight;
    
    // Handle slider animation
    const slider = this._elements.slider;
    
    // Don't animate on initialization
    if (this._animate) {
      commons.transitionEnd(slider, () => {
        // Keep it silenced
        this._silenced = silenced;
        
        // Remove height as we want the drawer to naturally grow if content is added later
        if (this._open) {
          slider.style.height = '';
        }
      
        // Trigger once transition is finished
        this.trigger(`coral-drawer:${(this._open ? 'open' : 'close')}`);
        this._silenced = false;
      });
    
      if (!this._open) {
        // Force height to enable transition
        slider.style.height = `${slider.scrollHeight}px`;
      }
      
      // Do transition in next task as browser might batch up the height property change before painting
      window.setTimeout(() => {
        slider.style.height = this._open ? `${slider.scrollHeight}px` : 0;
      }, 10);
    }
    else {
      // Make sure it's animated next time
      this._animate = true;
    
      // Hide it on initialization if closed
      if (!this._open) {
        slider.style.height = 0;
      }
    }
  }
  
  /** @private */
  _onClick() {
    this.open = !this.open;
  }
  
  get _contentZones() { return {'coral-drawer-content': 'content'}; }
  
  /**
   Returns {@link Drawer} direction options.
   
   @return {DrawerDirectionEnum}
   */
  static get direction() { return direction; }
  
  /** @ignore */
  static get observedAttributes() {
    return [
      'disabled',
      'direction',
      'open'
    ];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME, 'coral-Well');
    
    // Default reflected attributes
    if (!this._direction) { this.direction = direction.DOWN; }
    if (!this._open) { this.open = false; }
  
    // Create a fragment
    const fragment = document.createDocumentFragment();
  
    const templateHandleNames = ['slider', 'toggle'];
  
    // Render the template
    fragment.appendChild(this._elements.slider);
    fragment.appendChild(this._elements.toggle);
  
    // Fetch or create the content content zone element
    const content = this._elements.content;
  
    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        content.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(fragment);
  
    // Assign the content zone
    this.content = content;
  }
  
  /**
   Triggered when the {@link Drawer} is opened.
   
   @typedef {CustomEvent} coral-drawer:open
   */
  
  /**
   Triggered when the {@link Drawer} is closed.
   
   @typedef {CustomEvent} coral-drawer:close
   */
}

export default Drawer;
