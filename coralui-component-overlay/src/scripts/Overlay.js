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
import OverlayMixin from 'coralui-mixin-overlay';
import {PopperJS} from 'coralui-externals';
import ALIGN_MAP from './alignMapping.json';
import {transform, validate, commons} from 'coralui-util';

const DEPRECATED_ALIGN = 'Coral.Overlay: alignAt and alignMy have been deprecated. Please use the offset, inner and placement properties instead.';
const DEPRECATED_FLIP_FIT = 'Coral.Overlay.collision.FLIP_FIT has been deprecated. Please use Coral.Overlay.collision.FLIP instead.';

/**
 Valid alignment pairs.
 
 @enum {Object}
 @memberof Coral.Overlay
 
 @deprecated
 */
const align = {
  /** Use the top of the left side as an anchor point. */
  LEFT_TOP: 'left top',
  /** Use the center of the left side as an anchor point. */
  LEFT_CENTER: 'left center',
  /** Use the bottom of the left side as an anchor point. */
  LEFT_BOTTOM: 'left bottom',
  /** Use the center of the top side as an anchor point. */
  CENTER_TOP: 'center top',
  /** Use the center as an anchor point. */
  CENTER_CENTER: 'center center',
  /** Use the center of the bottom side as an anchor point. */
  CENTER_BOTTOM: 'center bottom',
  /** Use the top of the right side as an anchor point. */
  RIGHT_TOP: 'right top',
  /** Use the center of the right side as an anchor point. */
  RIGHT_CENTER: 'right center',
  /** Use the bottom of the right side as an anchor point. */
  RIGHT_BOTTOM: 'right bottom'
};

// Used to map alignMy and alignAt with popper JS properties. ALIGN_MAP holds the mapping.
const alignSwapped = commons.swapKeysAndValues(align);

/**
 Collision detection strategies.
 
 @enum {String}
 @memberof Coral.Overlay
 */
const collision = {
  /** Flips the element to the opposite side of the target and the collision detection is run again to see if it will fit. Whichever side allows more of the element to be visible will be used. */
  FLIP: 'flip',
  /** Shift the element away from the edge of the window. */
  FIT: 'fit',
  /** Deprecated. First applies the flip logic, placing the element on whichever side allows more of the element to be visible. Then the fit logic is applied to ensure as much of the element is visible as possible. */
  FLIP_FIT: 'flipfit',
  /** Does not apply any collision detection. */
  NONE: 'none'
};

/**
 Anchored overlay targets.
 
 @enum {String}
 @memberof Coral.Overlay
 */
const target = {
  /** Use the previous sibling element in the DOM. */
  PREVIOUS: '_prev',
  /** Use the next sibling element in the DOM. */
  NEXT: '_next'
};

/**
 Overlay placement values.
 
 @enum {Object}
 @memberof Coral.Overlay
 */
const placement = {
  /** An overlay anchored to the left of the target. */
  LEFT: 'left',
  /** An overlay anchored to the right of the target. */
  RIGHT: 'right',
  /** An overlay anchored at the bottom the target. */
  BOTTOM: 'bottom',
  /** An overlay anchored at the top target. */
  TOP: 'top'
};

/**
 Boolean enumeration for interaction values.
 
 @enum {String}
 @memberof Coral.Overlay
 */
const interaction = {
  /** Keyboard interaction is enabled. */
  ON: 'on',
  /** Keyboard interaction is disabled. */
  OFF: 'off'
};

const CLASSNAME = 'coral3-Overlay';

/**
 @class Coral.Overlay
 @classdesc An Overlay component
 @htmltag coral-overlay
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.overlay
 */
class Overlay extends OverlayMixin(Component(HTMLElement)) {
  constructor() {
    super();
  
    // Override from mixin-overlay
    this._overlayAnimationTime = 0;
    
    // Events
    this._delegateEvents({
      'global:key:escape': '_handleEscape',
      'click [coral-close]': '_handleCloseClick'
    });
  }
  
  /**
   The element the overlay should position relative to. It accepts values from {@link Coral.Overlay.target}, as
   well as a DOM element or a CSS selector. If a CSS selector is provided, the first matching element will be used.
   
   @type {Coral.Overlay.target|?HTMLElement|String}
   @default null
   @htmlattribute target
   @memberof Coral.Overlay#
   */
  get target() {
    return this._target || null;
  }
  set target(value) {
    // We don't want to validate that the value must change here
    // If a selector is provided, we'll take the first element matching that selector
    // If the DOM is modified and the user wants a new target with the same selector,
    // They should be able to set target = 'selector' again and get a different element
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;
  
      const targetElement = this._getTarget();
      
      if (targetElement) {
        // To make it return focus to the right item, change the target
        if (this._returnFocus === this.constructor.returnFocus.ON) {
          this.returnFocusTo(targetElement);
        }
        
        // Initialize popper only if we have a target
        this._popper = this._popper || new PopperJS(targetElement, this, {onUpdate: this._onUpdate.bind(this)});
        
        // Make sure popper options modifiers are up to date
        this.reposition();
      }
    }
  }
  
  /**
   The point on the overlay we should anchor from when positioning.
   
   @type {Coral.Overlay.align}
   @default Coral.Overlay.align.CENTER_CENTER
   @htmlattribute alignmy
   @memberof Coral.Overlay#
 
   @deprecated
   */
  get alignMy() {
    return this._alignMy || align.CENTER_CENTER;
  }
  set alignMy(value) {
    console.warn(DEPRECATED_ALIGN);
    
    value = transform.string(value).toLowerCase();
    this._alignMy = validate.enumeration(align)(value) && value || align.CENTER_CENTER;
  
    this._popperMapping();
  }
  
  /**
   The point on the target we should anchor to when positioning.
   
   @type {Coral.Overlay.align}
   @default Coral.Overlay.align.CENTER_CENTER
   @htmlattribute alignat
   @memberof Coral.Overlay#
   
   @deprecated
   */
  get alignAt() {
    return this._alignAt || align.CENTER_CENTER;
  }
  set alignAt(value) {
    console.warn(DEPRECATED_ALIGN);
    
    value = transform.string(value).toLowerCase();
    this._alignAt = validate.enumeration(align)(value) && value || align.CENTER_CENTER;
    
    this._popperMapping();
  }
  
  /**
   The distance the overlay should be from its target.
   
   @type {Number}
   @default 0
   @htmlattribute offset
   @memberof Coral.Overlay#
   */
  get offset() {
    return transform.number(this.lengthOffset);
  }
  set offset(value) {
    if (typeof value === 'number') {
      this.lengthOffset = `${value}px`;
      this.breadthOffset = '0px';
      
      this.reposition();
    }
  }
  
  /**
   Whether the overlay flows toward the inner of the target element. By default, it's placed outside the target element.
   
   @type {Boolean}
   @default false
   @htmlattribute inner
   @memberof Coral.Overlay#
   */
  get inner() {
    return this._inner || false;
  }
  set inner(value) {
    this._inner = transform.booleanAttr(value);
    
    this.reposition();
  }
  
  /**
   The distance the overlay should be from its target along the length axis.
   
   @type {String}
   @default '0px'
   @htmlattribute lengthoffset
   @memberof Coral.Overlay#
   */
  get lengthOffset() {
    return this._lengthOffset || '0px';
  }
  set lengthOffset(value) {
    this._lengthOffset = transform.string(value) || '0px';
    
    this.reposition();
  }
  
  /**
   The distance the overlay should be from its target along the breadth axis.
   
   @type {String}
   @default '0px'
   @htmlattribute breadthoffset
   @memberof Coral.Overlay#
   */
  get breadthOffset() {
    return this._breadthOffset || '0px';
  }
  set breadthOffset(value) {
    this._breadthOffset = transform.string(value) || '0px';
    
    this.reposition();
  }
  
  /**
   The placement of the overlay.
   
   @type {Coral.Overlay.placement}
   @default Coral.Overlay.placement.RIGHT
   @htmlattribute placement
   @memberof Coral.Overlay#
   */
  get placement() {
    return this._placement || placement.RIGHT;
  }
  set placement(value) {
    value = transform.string(value).toLowerCase();
    this._placement = validate.enumeration(placement)(value) && value || placement.RIGHT;
    
    this.reposition();
  }
  
  /**
   The bounding element for the overlay. The overlay will be sized and positioned such that it is contained within
   this element. It accepts both a DOM Element or a CSS selector. If a CSS selector is provided, the first matching
   element will be used.
   
   @type {HTMLElement|String}
   @default 'scrollParent'
   @memberof Coral.Overlay#
   */
  get within() {
    return this._within || 'scrollParent';
  }
  set within(value) {
    if (value instanceof HTMLElement || typeof value === 'string') {
      this._within = value;
  
      this.reposition();
    }
  }
  
  /**
   The collision handling strategy when positioning the overlay relative to a target.
   
   @type {Coral.Overlay.collision}
   @default Coral.Overlay.collision.FLIP
   @htmlattribute collision
   @memberof Coral.Overlay#
   */
  get collision() {
    return this._collision || collision.FLIP;
  }
  set collision(value) {
    value = transform.string(value).toLowerCase();
    this._collision = validate.enumeration(collision)(value) && value || collision.FLIP;
    
    if (this._collision === collision.FLIP_FIT) {
      console.warn(DEPRECATED_FLIP_FIT);
    }
  
    this.reposition();
  }
  
  /**
   Whether keyboard interaction is enabled.
   
   @type {Coral.Overlay.interaction}
   @default Coral.Overlay.interaction.ON
   @memberof Coral.Overlay#
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }
  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.ON;
  }
  
  /**
   Whether the overlay is allowed to change its DOM position for better positioning based on its context.
   
   @type {Boolean}
   @default false
   @memberof Coral.Overlay#
   */
  get smart() {
    return this._smart || false;
  }
  set smart(value) {
    this._smart = transform.booleanAttr(value);
  }
  
  // JSDoc inherited
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
    
    if (this.open && this.smart) {
      this._validateParentOverflow();
    }
    
    const self = this;
    // We need an additional frame to help popper read the correct offsets
    window.requestAnimationFrame(() => {
      self.reposition();
    });
  }
  
  /** @ignore */
  _validateParentOverflow() {
    let reposition = false;
    
    // Check parents if they potentially truncate the overlay
    let parent = this.parentElement;
    while (!reposition && parent) {
      if (parent !== document.body) {
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'hidden') {
          reposition = true;
        }
        
        parent = parent.parentElement;
      }
      else {
        parent = null;
      }
    }
  
    // If it's the case then we move the overlay to make sure it's not truncated
    if (reposition) {
      document.body.appendChild(this);
    }
  }
  
  /** @ignore */
  _onUpdate(data) {
    // Trigger once positioned the first time
    if (!this._oldPosition) {
      this._oldPosition = data.styles.transform;
      
      const self = this;
      // Do it in the next frame to avoid triggering the event too early
      window.requestAnimationFrame(() => {
        self.trigger('coral-overlay:positioned', data);
      });
    }
    // Trigger again only if position changed
    else {
      this._oldPosition = this._oldPosition || data.styles.transform;
  
      if (this._oldPosition !== data.styles.transform) {
        this.trigger('coral-overlay:positioned', data);
      }
  
      this._oldPosition = data.styles.transform;
    }
  }

  /**
   @todo maybe this should be mixin or something
   @ignore
   */
  _handleCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.hide();
      event.stopPropagation();
    }
  }
  
  /**
   Hides the overlay if it's on the top. When <code>interaction</code> is OFF it is ignored.
   
   @ignore
   */
  _handleEscape() {
    if (this.interaction === interaction.ON && this.open && this._isTopOverlay()) {
      this.hide();
    }
  }
  
  /*
   Get the element the overlay is anchored to.
   
   @protected
   @param {HTMLElement|String} [target]
   A specific target value to use.
   If not provided, the current value of the {@link Coral.Overlay#target} property will be used.
   @memberof Coral.Overlay#
   @returns {HTMLElement|null}
   */
  _getTarget(targetValue) {
    // Use passed target
    targetValue = targetValue || this.target;
  
    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }
  
    // Dynamically get the target node based on target
    let newTarget = null;
    if (typeof targetValue === 'string') {
      if (targetValue === target.PREVIOUS) {
        newTarget = this.previousElementSibling;
      }
      else if (targetValue === target.NEXT) {
        newTarget = this.nextElementSibling;
      }
      else {
        newTarget = document.querySelector(targetValue);
      }
    }
  
    return newTarget;
  }
  
  /** @ignore */
  _popperMapping() {
    const value = ALIGN_MAP[`${alignSwapped[this.alignMy]} ${alignSwapped[this.alignAt]}`];
    if (value) {
      this.set(value);
    }
  }
  
  /**
   Re-position the overlay if it's currently open.
   
   @function
   @memberof Coral.Overlay#
   @param {Boolean} forceReposition
   Whether to force repositioning even if closed.
   */
  reposition(forceReposition) {
    if (this._popper) {
      const targetElement = this._getTarget();
      
      // Update target only if valid
      if (targetElement) {
        this._popper.reference = targetElement;
      }
      
      this._popper.options.placement = this.placement;
  
      this._popper.modifiers.forEach((modifier) => {
        if (modifier.name === 'offset') {
          modifier.offset = `${this.breadthOffset}, ${this.lengthOffset}`;
        }
        else if (modifier.name === 'flip') {
          modifier.enabled = this.collision !== collision.FIT && this.collision !== collision.NONE;
        }
        else if (modifier.name === 'inner') {
          modifier.enabled = this.inner;
        }
        else if (modifier.name === 'preventOverflow') {
          modifier.enabled = this.collision !== collision.NONE;
          
          modifier.boundariesElement = this.within;
        }
      }, this);
  
      if (this.open || forceReposition) {
        this._popper.update();
      }
    }
  }
  
  // Expose enumerations
  static get align() { return align; }
  static get collision() { return collision; }
  static get target() { return target; }
  static get placement() { return placement; }
  static get interaction() { return interaction; }

  static get observedAttributes() {
    return super.observedAttributes.concat([
      'alignmy',
      'alignMy',
      'alignat',
      'alignAt',
      'offset',
      'lengthoffset',
      'lengthOffset',
      'breadthoffset',
      'breadthOffset',
      'placement',
      'within',
      'collision',
      'interaction',
      'target',
      'inner',
      'smart'
    ]);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Hidden by default
    this.style.display = 'none';
  
    // In case it was not added to the DOM, make sure popper is initialized by setting target
    this.target = this.target;
  
    const self = this;
    // We need an additional frame to help popper read the correct offsets
    window.requestAnimationFrame(() => {
      // Force repositioning
      self.reposition(true);
    });
  }
  
  /**
   Triggered after the overlay is positioned.
   
   @event Coral.Overlay#coral-overlay:positioned
   
   @param {Object} event
   Event object.
   */
}

export default Overlay;
