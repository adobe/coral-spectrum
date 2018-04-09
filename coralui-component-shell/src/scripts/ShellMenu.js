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
import {OverlayMixin} from '../../../coralui-mixin-overlay';
import {transform, validate} from '../../../coralui-util';

const CLASSNAME = '_coral-Shell-menu';

/**
 Enumeration for {@link ShellMenu} placement options.
 
 @typedef {Object} ShellMenuPlacementEnum
 
 @property {String} RIGHT
 Anchor to the right of the page.
 @property {String} TOP
 Anchor at the top of the page.
 */
const placement = {
  RIGHT: 'right',
  TOP: 'top'
};

const ALL_PLACEMENT_CLASSES = [];
for (const placementValue in placement) {
  ALL_PLACEMENT_CLASSES.push(`${CLASSNAME}--${placement[placementValue]}`);
}

/**
 Enumeration for {@link ShellMenu} overlay animation options.
 
 @typedef {Object} ShellMenuFromEnum
 
 @property {String} RIGHT
 Animate in from the right.
 @property {String} TOP
 Animate in from the top.
 */
const from = {
  RIGHT: 'right',
  TOP: 'top'
};

const ALL_FROM_CLASSES = [];
for (const fromValue in from) {
  ALL_FROM_CLASSES.push(`${CLASSNAME}--${from[fromValue]}`);
}

/**
 @class Coral.Shell.Menu
 @classdesc A Shell Menu component
 @htmltag coral-shell-menu
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {OverlayMixin}
 */
class ShellMenu extends OverlayMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
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
   The side of the page the overlay should be anchored to. See {@link ShellMenuPlacementEnum}.
   
   @type {String}
   @default ShellMenuPlacementEnum.RIGHT
   @htmlattribute placement
   @htmlattributereflected
   */
  get placement() {
    return this._placement || placement.RIGHT;
  }
  set placement(value) {
    value = transform.string(value).toLowerCase();
    this._placement = validate.enumeration(placement)(value) && value || placement.RIGHT;
    this._reflectAttribute('placement', this._placement);
    
    this.classList.remove(...ALL_PLACEMENT_CLASSES);
    this.classList.add(`${CLASSNAME}--placement-${this._placement}`);
  }
  
  /**
   The direction the overlay should animate from. See {@link ShellMenuFromEnum}.
   
   @type {String}
   @default ShellMenuFromEnum.TOP
   @htmlattribute from
   @htmlattributereflected
   */
  get from() {
    return this._from || from.TOP;
  }
  set from(value) {
    value = transform.string(value).toLowerCase();
    this._from = validate.enumeration(from)(value) && value || from.TOP;
    this._reflectAttribute('from', this._from);
  
    this.classList.remove(...ALL_FROM_CLASSES);
    this.classList.add(`${CLASSNAME}--from-${this._from}`);
  }
  
  /**
   Whether the overlay should use all available space.
   
   @type {Boolean}
   @default false
   @htmlattribute full
   @htmlattributereflected
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
   */
  get top() {
    return this._top || false;
  }
  set top(value) {
    this._top = transform.booleanAttr(value);
    this._reflectAttribute('top', this._top);
  }
  
  /**
   Inherited from {@link OverlayMixin#open}.
   */
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
  
    if (this.top) {
      // Be higher than the next highest overlay
      this.style.zIndex = parseInt(this.style.zIndex, 10) + 20;
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
    if (!(item && this === item._getMenu())) {
      if (this.open && !this.contains(eventTarget)) {
        // Close if we are open and the click was outside of the target and outside of the popover
        this.hide();
      }
    }
  }
  
  /**
   Returns {@link ShellMenu} placement options.
   
   @return {ShellMenuPlacementEnum}
   */
  static get placement() { return placement; }
  
  /**
   Returns {@link ShellMenu} overlay animation options.
   
   @return {ShellMenuFromEnum}
   */
  static get from() { return from; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'placement',
      'from',
      'full',
      'top'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._placement) { this.placement = placement.RIGHT; }
    if (!this._from) { this.from = from.TOP; }
  }
}

export default ShellMenu;
