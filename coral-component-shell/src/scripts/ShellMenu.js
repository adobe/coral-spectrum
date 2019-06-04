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

import {BaseComponent} from '../../../coral-base-component';
import {BaseOverlay} from '../../../coral-base-overlay';
import {transform, validate} from '../../../coral-utils';

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
 @extends {BaseComponent}
 @extends {BaseOverlay}
 */
class ShellMenu extends BaseOverlay(BaseComponent(HTMLElement)) {
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
   Inherited from {@link BaseOverlay#open}.
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
   @todo this is duplicated between ovelay components, maybe this should be in a base
   
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
