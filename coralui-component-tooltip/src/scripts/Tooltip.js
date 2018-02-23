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

import {Overlay} from '/coralui-component-overlay';
import {Vent} from '/coralui-externals';
import base from '../templates/base';
import {transform, validate, commons} from '/coralui-util';

const arrowMap = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
};

const CLASSNAME = 'coral3-Tooltip';

// This is in JS as we're setting this to induce wrapping before collision calculations
const TOOLTIP_ARROW_SIZE = 12;

/**
 Enumeration for {@link Tooltip} variants.
 
 @typedef {Object} TooltipVariantEnum
 
 @property {String} DEFAULT
 A default tooltip that provides additional information.
 @property {String} INFO
 A tooltip that informs the user of non-critical information.
 @property {String} SUCCESS
 A tooltip that indicates an operation was successful.
 @property {String} ERROR
 A tooltip that indicates an error has occurred.
 @property {String} WARNING
 Not supported. Falls back to DEFAULT.
 @property {String} INSPECT
 Not supported. Falls back to DEFAULT.
 */
const variant = {
  DEFAULT: 'default',
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INSPECT: 'inspect'
};

// A string of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantName in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantName]}`);
}

// A string of all position placement classnames
const ALL_PLACEMENT_CLASSES = [];

// A map of lowercase directions to their corresponding classname
const placementClassMap = {};
for (const key in Overlay.placement) {
  const direction = Overlay.placement[key];
  const placementClass = `${CLASSNAME}--${arrowMap[direction]}`;
  
  // Store in map
  placementClassMap[direction] = placementClass;
  
  // Store in list
  ALL_PLACEMENT_CLASSES.push(placementClass);
}

/**
 @class Coral.Tooltip
 @classdesc A Tooltip component that can be attached to any element and may be displayed immediately or on hovering the
 target element.
 @htmltag coral-tooltip
 @extends {Overlay}
 */
class Tooltip extends Overlay {
  /** @ignore */
  constructor() {
    super();
  
    // Override defaults
    this._lengthOffset = TOOLTIP_ARROW_SIZE;
    this._overlayAnimationTime = Overlay.FADETIME;
  
    // Fetch or create the content zone element
    this._elements = commons.extend(this._elements, {
      content: this.querySelector('coral-tooltip-content') || document.createElement('coral-tooltip-content')
    });
    
    // Generate template
    base.call(this._elements);
  
    // Used for events
    this._id = commons.getUID();
    this._delegateEvents({
      'coral-overlay:positioned': '_onPositioned'
    });
  }
  
  /**
   The variant of tooltip. See {@link TooltipVariantEnum}.
   
   @type {String}
   @default TooltipVariantEnum.DEFAULT
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
  
    this.classList.remove(...ALL_VARIANT_CLASSES);
    this.classList.add(`${CLASSNAME}--${this._variant}`);
  }
  
  /**
   The amount of time in miliseconds to wait before showing the tooltip when the target is interacted with.
   
   @type {Number}
   @default 500
   @htmlattribute delay
   */
  get delay() {
    return typeof this._delay === 'number' ? this._delay : 500;
  }
  set delay(value) {
    this._delay = transform.number(value);
  }
  
  /**
   The Tooltip content element.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-tooltip-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Inherited from {@link Overlay#open}.
   */
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
    
    if (!this.open) {
      // Stop previous show operations from happening
      this._cancelShow();
    }
  }
  
  /**
   Inherited from {@link Overlay#target}.
   */
  get target() {
    return super.target;
  }
  set target(value) {
    super.target = value;
  
    if (this.interaction === this.constructor.interaction.ON) {
      // Add listeners to the target
      const target = this._getTarget(value);
      this._addTargetListeners(target);
    }
  }
  
  /**
   Inherited from {@link Overlay#interaction}.
   */
  get interaction() {
    return super.interaction;
  }
  set interaction(value) {
    super.interaction = value;
  
    const target = this._getTarget();
  
    if (target) {
      if (value === this.constructor.interaction.ON) {
        this._addTargetListeners(target);
      }
      else {
        this._removeTargetListeners(target);
      }
    }
  }
  
  /** @ignore */
  _onPositioned(event) {
    // Set arrow placement
    this.classList.remove(...ALL_PLACEMENT_CLASSES);
    this.classList.add(placementClassMap[event.detail.placement]);
  }
  
  /** @ignore */
  _handleFocusOut() {
    const self = this;
    // The item that should have focus will get it on the next frame
    window.requestAnimationFrame(() => {
      const targetIsFocused = document.activeElement === self._getTarget();
      
      if (!targetIsFocused) {
        self._cancelShow();
        self.open = false;
      }
    });
  }
  
  /** @ignore */
  _cancelShow() {
    window.clearTimeout(this._showTimeout);
  }
  
  /** @ignore */
  _cancelHide() {
    window.clearTimeout(this._hideTimeout);
  }
  
  /** @ignore */
  _startHide() {
    if (this.delay === 0) {
      // Hide immediately
      this._handleFocusOut();
    }
    else {
      const self = this;
      this._hideTimeout = window.setTimeout(() => {
        self._handleFocusOut();
      }, this.delay);
    }
  }
  
  /** @ignore */
  _addTargetListeners(target) {
    if (!target) {
      return;
    }
  
    const self = this;
    
    // Make sure we don't add listeners twice to the same element for this particular tooltip
    if (target[`_hasCoralTooltipListeners${self._id}`]) {
      return;
    }
    target[`_hasCoralTooltipListeners${self._id}`] = true;
    
    // Remove listeners from the old target
    if (self._oldTarget) {
      const oldTarget = self._getTarget(self._oldTarget);
      if (oldTarget) {
        self._removeTargetListeners(oldTarget);
      }
    }
    
    // Store the current target value
    self._oldTarget = target;
    
    // Use Vent to bind events on the target
    self._targetEvents = new Vent(target);
  
    self._targetEvents.on(`mouseenter.CoralTooltip${self._id} focusin.CoralTooltip${self._id}`, () => {
      // Don't let the tooltip hide
      self._cancelHide();
      
      if (!self.open) {
        self._cancelShow();
        
        if (self.delay === 0) {
          // Show immediately
          self.show();
        }
        else {
          self._showTimeout = window.setTimeout(() => {
            self.show();
          }, self.delay);
        }
      }
    });
  
    self._targetEvents.on(`mouseleave.CoralTooltip${self._id}`, () => {
      if (self.interaction === self.constructor.interaction.ON) {
        self._startHide();
      }
    });
  
    self._targetEvents.on(`focusout.CoralTooltip${self._id}`, () => {
      if (self.interaction === self.constructor.interaction.ON) {
        self._handleFocusOut();
      }
    });
  }
  
  /** @ignore */
  _removeTargetListeners(target) {
    // Remove listeners for this tooltip and mark that the element doesn't have them
    // Use the ID so we can support multiple tooltips on the same element
    if (this._targetEvents) {
      this._targetEvents.off(`.CoralTooltip${this._id}`);
    }
    target[`_hasCoralTooltipListeners${this._id}`] = false;
  }
  
  get _contentZones() { return {'coral-tooltip-content': 'content'}; }
  
  /**
   Returns {@link Tooltip} variants.
   
   @return {TooltipVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['variant', 'delay']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // ARIA
    this.setAttribute('role', 'tooltip');
    // Let the tooltip be focusable
    // We'll marshall focus around when its focused
    this.setAttribute('tabindex', '-1');
  
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
  
    // Support cloneNode
    const tip = this.querySelector('.coral3-Tooltip-tip');
    if (tip) {
      tip.remove();
    }
    
    const content = this._elements.content;
  
    // Move the content into the content zone if none specified
    if (!content.parentNode) {
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
    
    // Append template
    this.appendChild(this._elements.tip);
  
    // Assign the content zone so the insert function will be called
    this.content = content;
  }
}

export default Tooltip;
