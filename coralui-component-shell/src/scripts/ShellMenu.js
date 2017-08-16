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
import Overlay from 'coralui-mixin-overlay';
import {transform, validate, commons} from 'coralui-util';

const CLASSNAME = 'coral3-Shell-menu';

/**
 Overlay placement values.
 
 @enum {Object}
 @memberof Coral.Shell.Menu
 */
const placement = {
  /** Anchor to the right of the page. */
  RIGHT: 'right',
  /** Anchor at the top of the page. */
  TOP: 'top'
};

const ALL_PLACEMENT_CLASSES = [];
for (const placementValue in placement) {
  ALL_PLACEMENT_CLASSES.push(`${CLASSNAME}--${placement[placementValue]}`);
}

/**
 Overlay animation directions.
 
 @enum {Object}
 @memberof Coral.Shell.Menu
 */
const from = {
  /** Animate in from the right. */
  RIGHT: 'right',
  /** Animate in from the top. */
  TOP: 'top'
};

const ALL_FROM_CLASSES = [];
for (const fromValue in from) {
  ALL_FROM_CLASSES.push(`${CLASSNAME}--${from[fromValue]}`);
}

/**
 Lowercase the passed string if it's a string, passthrough if not.
 
 @ignore
 */
function transformLowercase(alignment) {
  // Just pass through non-strings
  return typeof alignment === 'string' ? alignment.toLowerCase() : alignment;
}

/**
 @class Coral.Shell.Menu
 @classdesc A Shell Menu component
 @htmltag coral-shell-menu
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.overlay
 */
class ShellMenu extends Overlay(Component(HTMLElement)) {
  constructor() {
    super();
  
    // Override defaults from Overlay
    this._focusOnShow = this.constructor.focusOnShow.ON;
    this._returnFocus = this.constructor.returnFocus.ON;
    this._overlayAnimationTime = this.constructor.FADETIME;
    
    // Events
    this._delegateEvents({
      'click [coral-close]': '_handleCloseClick',
      'global:key:escape': '_handleGlobalEscape',
      'global:capture:click': '_handleGlobalClick'
    });
  }
  
  /**
   The side of the page the overlay should be anchored to.
   
   @type {Coral.Shell.Menu.placement}
   @default Coral.Shell.Menu.placement.RIGHT
   @htmlattribute placement
   @htmlattributereflected
   @memberof Coral.Shell.Menu#
   */
  get placement() {
    return this._placement || placement.RIGHT;
  }
  set placement(value) {
    value = transform.string(value).toLowerCase();
    this._placement = validate.enumeration(placement)(value) && value || placement.RIGHT;
    this._reflectAttribute('placement', this._placement);
    
    this.classList.remove.apply(this.classList, ALL_PLACEMENT_CLASSES);
    this.classList.add(`${CLASSNAME}--placement-${this._placement}`);
  }
  
  /**
   The direction the overlay should animate from.
   
   @type {Coral.Shell.Menu.from}
   @default Coral.Shell.Menu.from.TOP
   @htmlattribute from
   @htmlattributereflected
   @memberof Coral.Shell.Menu#
   */
  get from() {
    return this._from || from.TOP;
  }
  set from(value) {
    value = transform.string(value).toLowerCase();
    this._from = validate.enumeration(from)(value) && value || from.TOP;
    this._reflectAttribute('from', this._from);
  
    this.classList.remove.apply(this.classList, ALL_FROM_CLASSES);
    this.classList.add(`${CLASSNAME}--from-${this._from}`);
  }
  
  /**
   Whether the overlay should use all available space.
   
   @type {Boolean}
   @default false
   @htmlattribute full
   @htmlattributereflected
   @memberof Coral.Shell.Menu#
   */
  get full() {
    return this._full || false;
  }
  set full(value) {
    this._full = transform.booleanAttr(value);
    this._reflectAttribute('full', this._full);
  
    this.classList.toggle(`${CLASSNAME}--full`, this._full);
  }
  
  /**
   Whether the overlay should always be on top.
   
   @type {Boolean}
   @default false
   @htmlattribute top
   @htmlattributereflected
   @memberof Coral.Shell.Menu#
   */
  get top() {
    return this._top || false;
  }
  set top(value) {
    this._top = transform.booleanAttr(value);
    this._reflectAttribute('top', this._top);
  }
  
  // JSDoc inherited
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
  
    if (this.top) {
      // Be higher than the next highest overlay
      this.style.zIndex = parseInt(this.style.zIndex, 10) + 20;
    }
  
    if (this.open && this.focusOnShow === this.constructor.focusOnShow.ON) {
      commons.transitionEnd(this, function() {
        (this.querySelector(commons.FOCUSABLE_ELEMENT_SELECTOR) || this).focus();
      }.bind(this));
    }
  }
  
  /** @ignore */
  _handleGlobalEscape() {
    // checks that it is the top most overlay before closing
    if (this.open && this._isTopOverlay()) {
      this.open = false;
    }
  }
  
  /**
   @todo this is duplicated between ovelay components, maybe this should be in a mixin
   
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
   Makes sure that the menu is closed when outside is clicked.
   
   @private
   */
  _handleGlobalClick(event) {
    const eventTarget = event.target;
  
    // since this component does not have a target property like most overlays, we need to figure it if
    // @todo: introduce target to be able to remove this behavior
    const item = eventTarget.closest('coral-shell-menubar-item');
  
    // in case the target was clicked, we need to ignore the event
    if (item && this === item._getMenu()) {
      return;
    }
    else if (this.open && !this.contains(eventTarget)) {
      // Close if we are open and the click was outside of the target and outside of the popover
      this.hide();
    }
  }
  
  // Expose enums
  static get placement() {return placement;}
  static get from() {return from;}
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'placement',
      'from',
      'full',
      'top'
    ]);
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._placement) {this.placement = placement.RIGHT;}
    if (!this._from) {this.from = from.TOP;}
  }
}

export default ShellMenu;
