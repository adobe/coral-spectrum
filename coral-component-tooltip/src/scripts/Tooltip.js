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

import {Overlay} from '../../../coral-component-overlay';
import Vent from '@adobe/vent';
import base from '../templates/base';
import {commons, transform, validate} from '../../../coral-utils';

const arrowMap = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
};

const CLASSNAME = '_coral-Tooltip';

const OFFSET = 5;

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
    this._lengthOffset = OFFSET;
    this._overlayAnimationTime = Overlay.FADETIME;
    this._focusOnShow = Overlay.focusOnShow.OFF;

    // Fetch or create the content zone element
    this._elements = commons.extend(this._elements, {
      content: this.querySelector('coral-tooltip-content') || document.createElement('coral-tooltip-content')
    });

    // Generate template
    base.call(this._elements);

    // Used for events
    this._id = commons.getUID();
    this._delegateEvents({
      'coral-overlay:positioned': '_onPositioned',
      'coral-overlay:_animate': '_onAnimate'
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

   @type {TooltipContent}
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
        content.classList.add(`${CLASSNAME}-label`);
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

    const target = this._getTarget(value);

    if (target) {
      this._elements.tip.hidden = false;

      if (this.interaction === this.constructor.interaction.ON) {
        // Add listeners to the target
        this._addTargetListeners(target);
      }
    }
    else {
      this._elements.tip.hidden = true;
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

  _onAnimate() {
    // popper attribute
    const popperPlacement = this.getAttribute('x-placement');

    // popper takes care of setting left, top to 0 on positioning
    if (popperPlacement === 'left') {
      this.style.left = '8px';
    }
    else if (popperPlacement === 'top') {
      this.style.top = '8px';
    }
    else if (popperPlacement === 'right') {
      this.style.left = '-8px';
    }
    else if (popperPlacement === 'bottom') {
      this.style.top = '-8px';
    }
  }

  /** @ignore */
  _handleFocusOut() {
    // The item that should have focus will get it on the next frame
    window.requestAnimationFrame(() => {
      const targetIsFocused = document.activeElement === this._getTarget();

      if (!targetIsFocused) {
        this._cancelShow();
        this.open = false;
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
      this._hideTimeout = window.setTimeout(() => {
        this._handleFocusOut();
      }, this.delay);
    }
  }

  /** @ignore */
  _addTargetListeners(target) {
    // Make sure we don't add listeners twice to the same element for this particular tooltip
    if (target[`_hasTooltipListeners${this._id}`]) {
      return;
    }
    target[`_hasTooltipListeners${this._id}`] = true;

    // Remove listeners from the old target
    if (this._oldTarget) {
      const oldTarget = this._getTarget(this._oldTarget);
      if (oldTarget) {
        this._removeTargetListeners(oldTarget);
      }
    }

    // Store the current target value
    this._oldTarget = target;

    // Use Vent to bind events on the target
    this._targetEvents = new Vent(target);

    const handleEventToShow = () => {
      // Don't let the tooltip hide
      this._cancelHide();
      
      if (!this.open) {
        this._cancelShow();
        
        if (this.delay === 0) {
          // Show immediately
          this.show();
        }
        else {
          this._showTimeout = window.setTimeout(() => {
            this.show();
          }, this.delay);
        }
      }
    };
  
    this._targetEvents.on(`mouseenter.Tooltip${this._id}`, handleEventToShow);
    this._targetEvents.on(`focusin.Tooltip${this._id}`, handleEventToShow);

    this._targetEvents.on(`mouseenter.Tooltip${this._id}`, this._handleOpenTooltip.bind(this));
    this._targetEvents.on(`focusin.Tooltip${this._id}`, this._handleOpenTooltip.bind(this));

    this._targetEvents.on(`mouseleave.Tooltip${this._id}`, () => {
      if (this.interaction === this.constructor.interaction.ON) {
        this._startHide();
      }
    });

    this._targetEvents.on(`focusout.Tooltip${this._id}`, () => {
      if (this.interaction === this.constructor.interaction.ON) {
        this._handleFocusOut();
      }
    });
  }

  _handleOpenTooltip() {
    // Don't let the tooltip hide
    this._cancelHide();

    if (!this.open) {
      this._cancelShow();

      if (this.delay === 0) {
        // Show immediately
        this.show();
      }
      else {
        this._showTimeout = window.setTimeout(() => {
          this.show();
        }, this.delay);
      }
    }
  }

  /** @ignore */
  _removeTargetListeners(target) {
    // Remove listeners for this tooltip and mark that the element doesn't have them
    // Use the ID so we can support multiple tooltips on the same element
    if (this._targetEvents) {
      this._targetEvents.off(`.Tooltip${this._id}`);
    }
    target[`_hasTooltipListeners${this._id}`] = false;
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
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // ARIA
    this.setAttribute('role', 'tooltip');
    // Let the tooltip be focusable
    // We'll marshall focus around when its focused
    this.setAttribute('tabindex', '-1');

    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }

    // Support cloneNode
    const tip = this.querySelector('._coral-Tooltip-tip');
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
