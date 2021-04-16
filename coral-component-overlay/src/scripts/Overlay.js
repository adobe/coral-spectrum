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
import PopperJS from 'popper.js';
import {transform, validate, commons} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const DEPRECATED_ALIGN = 'Coral.Overlay: alignAt and alignMy have been deprecated. Please use the offset, inner and placement properties instead.';
const DEPRECATED_FLIP_FIT = 'Coral.Overlay.collision.FLIP_FIT has been deprecated. Please use Coral.Overlay.collision.FLIP instead.';

/**
 Enumeration for {@link Overlay} alignment pairs.
 @deprecated

 @typedef {Object} OverlayAlignEnum

 @property {String} LEFT_TOP
 Use the top of the left side as an anchor point.
 @property {String} LEFT_CENTER
 Use the center of the left side as an anchor point.
 @property {String} LEFT_BOTTOM
 Use the bottom of the left side as an anchor point.
 @property {String} CENTER_TOP
 Use the center of the top side as an anchor point.
 @property {String} CENTER_CENTER
 Use the center as an anchor point.
 @property {String} CENTER_BOTTOM
 Use the center of the bottom side as an anchor point.
 @property {String} RIGHT_TOP
 Use the top of the right side as an anchor point.
 @property {String} RIGHT_CENTER
 Use the center of the right side as an anchor point.
 @property {String} RIGHT_BOTTOM
 Use the bottom of the right side as an anchor point.
 */
const align = {
  LEFT_TOP: 'left top',
  LEFT_CENTER: 'left center',
  LEFT_BOTTOM: 'left bottom',
  CENTER_TOP: 'center top',
  CENTER_CENTER: 'center center',
  CENTER_BOTTOM: 'center bottom',
  RIGHT_TOP: 'right top',
  RIGHT_CENTER: 'right center',
  RIGHT_BOTTOM: 'right bottom'
};

/**
 Enumeration for {@link Overlay} collision detection strategies.

 @typedef {Object} OverlayCollisionEnum

 @property {String} FLIP
 Flips the element to the opposite side of the target and the collision detection is run again to see if it will fit. Whichever side allows more of the element to be visible will be used.
 @property {String} FIT
 Shift the element away from the edge of the window.
 @property {String} FLIP_FIT
 Deprecated. First applies the flip logic, placing the element on whichever side allows more of the element to be visible. Then the fit logic is applied to ensure as much of the element is visible as possible.
 @property {String} NONE
 Does not apply any collision detection.
 */
const collision = {
  FLIP: 'flip',
  FIT: 'fit',
  FLIP_FIT: 'flipfit',
  NONE: 'none'
};

/**
 Enumeration for {@link Overlay} anchored overlay targets.

 @typedef {Object} OverlayTargetEnum

 @property {String} PREVIOUS
 Use the previous sibling element in the DOM.
 @property {String} NEXT
 Use the next sibling element in the DOM.
 */
const target = {
  PREVIOUS: '_prev',
  NEXT: '_next'
};

/**
 Enumeration for {@link Overlay} placement values.

 @typedef {Object} OverlayPlacementEnum

 @property {String} LEFT
 An overlay anchored to the left of the target.
 @property {String} RIGHT
 An overlay anchored to the right of the target.
 @property {String} BOTTOM
 An overlay anchored at the bottom the target.
 @property {String} TOP
 An overlay anchored at the top target.
 */
const placement = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  TOP: 'top'
};

/**
 Enumeration for {@link Overlay} interaction values.

 @typedef {Object} OverlayInteractionEnum

 @property {String} ON
 Keyboard interaction is enabled.
 @property {String} OFF
 Keyboard interaction is disabled.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

const CLASSNAME = '_coral-Overlay';

/**
 @class Coral.Overlay
 @classdesc A generic Overlay component.
 @htmltag coral-overlay
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseOverlay}
 */
class ExtensibleOverlay extends BaseOverlay(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Override from BaseOverlay
    this._overlayAnimationTime = 0;

    // Popper default
    this._withinOffset = 5;

    // Events
    this._delegateEvents({
      'global:key:escape': '_handleEscape',
      'click [coral-close]': '_handleCloseClick'
    });
  }

  /**
   The element the overlay should position relative to. It accepts values from {@link OverlayTargetEnum}, as
   well as a DOM element or a CSS selector. If a CSS selector is provided, the first matching element will be used.

   @type {?HTMLElement|String}
   @default null
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

        // update popper if popper already initialised or it is not explicitly avoid.
        if(this._popper || !this._avoidPopperInit) {
          this._initPopper(false, targetElement);
        }
      }
    }
  }

  /**
   The point on the overlay we should anchor from when positioning. See {@link OverlayAlignEnum}.

   @type {String}
   @default OverlayAlignEnum.CENTER_CENTER
   @htmlattribute alignmy

   @deprecated
   */
  get alignMy() {
    return this._alignMy || align.CENTER_CENTER;
  }

  set alignMy(value) {
    commons._log('warn', DEPRECATED_ALIGN);

    value = transform.string(value).toLowerCase();
    this._alignMy = validate.enumeration(align)(value) && value || align.CENTER_CENTER;
  }

  /**
   The point on the target we should anchor to when positioning. See {@link OverlayAlignEnum}.

   @type {String}
   @default Coral.Overlay.align.CENTER_CENTER
   @htmlattribute alignat

   @deprecated
   */
  get alignAt() {
    return this._alignAt || align.CENTER_CENTER;
  }

  set alignAt(value) {
    commons._log('warn', DEPRECATED_ALIGN);

    value = transform.string(value).toLowerCase();
    this._alignAt = validate.enumeration(align)(value) && value || align.CENTER_CENTER;
  }

  /**
   The distance the overlay should be from its target.

   @type {Number}
   @default 0
   @htmlattribute offset
   */
  get offset() {
    return transform.number(this.lengthOffset);
  }

  set offset(value) {
    value = transform.number(value);
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
   */
  get breadthOffset() {
    return this._breadthOffset || '0px';
  }

  set breadthOffset(value) {
    this._breadthOffset = transform.string(value) || '0px';

    this.reposition();
  }

  /**
   The placement of the overlay. See {@link OverlayPlacementEnum}.

   @type {String}
   @default OverlayPlacementEnum.RIGHT
   @htmlattribute placement
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
   Amount of pixel used to define a minimum distance between the boundaries and the overlay.
   This makes sure the overlay always has a little padding between the edges of its container.

   @type {Number}
   @default 5
   @htmlattribute withinOffset
   */
  get withinOffset() {
    return this._withinOffset;
  }

  set withinOffset(value) {
    value = transform.number(value);
    if (typeof value === 'number') {
      this._withinOffset = value;
      this.reposition();
    }
  }

  /**
   The collision handling strategy when positioning the overlay relative to a target. See {@link OverlayCollisionEnum}.

   @type {String}
   @default OverlayCollisionEnum.FLIP
   @htmlattribute collision
   */
  get collision() {
    return this._collision || collision.FLIP;
  }

  set collision(value) {
    value = transform.string(value).toLowerCase();
    this._collision = validate.enumeration(collision)(value) && value || collision.FLIP;

    if (this._collision === collision.FLIP_FIT) {
      commons._log('warn', DEPRECATED_FLIP_FIT);
    }

    this.reposition();
  }

  /**
   Whether keyboard interaction is enabled. See {@link OverlayInteractionEnum}.

   @type {String}
   @default OverlayInteractionEnum.ON
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
   */
  get smart() {
    return this._smart || false;
  }

  set smart(value) {
    this._smart = transform.booleanAttr(value);

    this._toggleSmartBehavior(this.open);
  }

  /**
   Inherited from {@link BaseOverlay#open}.
   */
  get open() {
    return super.open;
  }

  set open(value) {
    // initialise popper if undefined, used when popper initialisation avoided while setting target.
    if(!this._popper) {
      this._initPopper(true);
    }

    super.open = value;

    this._toggleSmartBehavior(this.open);
  }

  _toggleSmartBehavior(toggle) {
    if (toggle) {
      if (this.smart) {
        this._validateParentOverflow();
      }

      this._togglePopperEventListener(true);

      // We need an additional frame to help popper read the correct offsets
      window.requestAnimationFrame(() => {
        this.reposition();
      });
    } else {
      this._togglePopperEventListener(false);
    }
  }

  _togglePopperEventListener(toggle) {
    if (this._popper) {
      this._popper[toggle ? 'enableEventListeners' : 'disableEventListeners']();
    }
  }

  /** @ignore */
  _validateParentOverflow() {
    let reposition = false;

    // Check parents if they potentially truncate the overlay
    let parent = this.parentElement;
    while (!reposition && parent) {
      if (parent !== document.body) {
        const computedStyle = window.getComputedStyle(parent);
        if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'hidden' ||
          parent.clientHeight === 0 || parent.clientWidth === 0) {
          reposition = true;
        }

        parent = parent.parentElement;
      } else {
        parent = null;
      }
    }

    // If it's the case then we move the overlay to make sure it's not truncated
    if (reposition) {
      this._ignoreConnectedCallback = true;
      this._repositioned = true;
      document.body.appendChild(this);
      this._ignoreConnectedCallback = false;
    }
  }

  /** @ignore */
  _onUpdate(data) {
    // Trigger once positioned the first time
    if (!this._oldPosition) {
      this._oldPosition = data.styles.transform;

      // Do it in the next frame to avoid triggering the event too early
      window.requestAnimationFrame(() => {
        this.trigger('coral-overlay:positioned', data);
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
   @todo maybe this should be base or something
   @ignore
   */
  _handleCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.hide();
      event.stopPropagation();

      this._trackEvent('close', this.tagName.toLowerCase(), event);
    }
  }

  /**
   Hides the overlay if it's on the top. When <code>interaction</code> is OFF it is ignored.

   @ignore
   */
  _handleEscape(event) {
    if (this.interaction === interaction.ON && this.open && this._isTopOverlay()) {
      event.stopPropagation();
      this.hide();
    }
  }

  _getTarget(targetValue) {
    return this.constructor._getTarget(this, targetValue);
  }

  _initPopper(forceReposition, targetElement) {
    targetElement = targetElement || this._getTarget();
    if(targetElement) {
      this._popper = this._popper || new PopperJS(targetElement, this, {onUpdate: this._onUpdate.bind(this)});
      // Make sure popper options modifiers are up to date
      this.reposition(forceReposition);
    }
  }
  /**
   Re-position the overlay if it's currently open.

   @function
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
        } else if (modifier.name === 'flip') {
          modifier.enabled = this.collision !== collision.FIT && this.collision !== collision.NONE;
        } else if (modifier.name === 'inner') {
          modifier.enabled = this.inner;
        } else if (modifier.name === 'preventOverflow') {
          modifier.enabled = this.collision !== collision.NONE;

          const within = this.within;
          let boundary;
          // Check for allowed PopperJS strings
          if (within instanceof HTMLElement || ['scrollParent', 'window', 'viewport'].indexOf(within) !== -1) {
            boundary = within;
          } else if (typeof within === 'string') {
            boundary = document.querySelector(within);
            // Fallback to default if element is not found in the document
            if (!(boundary instanceof HTMLElement)) {
              boundary = 'scrollParent';
            }
          }

          modifier.boundariesElement = boundary;

          modifier.padding = this.withinOffset;
        }
      });

      if (this.open || forceReposition) {
        this._popper.update();
      }
    }
  }

  /**
   Get the element the overlay is anchored to.

   @param {HTMLElement} [el]
   The reference element.
   @param {HTMLElement|String} [target]
   A specific target value to use.
   If not provided, the current target of the element will be used.
   @returns {HTMLElement|null}
   */
  static _getTarget(el, targetValue) {
    // Use passed target
    targetValue = targetValue || el.target;

    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }

    // Dynamically get the target node based on target
    let newTarget = null;
    if (typeof targetValue === 'string') {
      if (targetValue === target.PREVIOUS) {
        newTarget = el.previousElementSibling;
      } else if (targetValue === target.NEXT) {
        newTarget = el.nextElementSibling;
      } else {
        newTarget = document.querySelector(targetValue);
      }
    }

    return newTarget;
  }

  /**
   @deprecated

   Returns {@link Overlay} align options.

   @return {OverlayAlignEnum}
   */
  static get align() {
    return align;
  }

  /**
   Returns {@link Overlay} collision options.

   @return {OverlayCollisionEnum}
   */
  static get collision() {
    return collision;
  }

  /**
   Returns {@link Overlay} target options.

   @return {OverlayTargetEnum}
   */
  static get target() {
    return target;
  }

  /**
   Returns {@link Overlay} placement options.

   @return {OverlayPlacementEnum}
   */
  static get placement() {
    return placement;
  }

  /**
   Returns {@link Overlay} interaction options.

   @return {OverlayInteractionEnum}
   */
  static get interaction() {
    return interaction;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      alignmy: 'alignMy',
      alignat: 'alignAt',
      lengthoffset: 'lengthOffset',
      breadthoffset: 'breadthOffset',
      withinoffset: 'withinOffset'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'alignmy',
      'alignat',
      'offset',
      'lengthoffset',
      'breadthoffset',
      'placement',
      'within',
      'withinoffset',
      'collision',
      'interaction',
      'target',
      'inner',
      'smart'
    ]);
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    // In case it was not added to the DOM, make sure popper is initialized by setting target
    this.target = this.target;

    // We need an additional frame to help popper read the correct offsets
    window.requestAnimationFrame(() => {
      // Force repositioning
      this.reposition(true);

      if (!this.open) {
        this._togglePopperEventListener(false);
      }
    });
  }

  /** @ignore */
  render() {
    this.classList.add(CLASSNAME);

    // Hidden by default
    this.style.display = 'none';
  }

  /**
   Triggered after the {@link Overlay} is positioned.

   @typedef {CustomEvent} coral-overlay:positioned
   */
}

const Overlay = Decorator(ExtensibleOverlay);

export {Overlay, ExtensibleOverlay};
