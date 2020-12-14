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
import {Icon} from '../../../coral-component-icon';
import {Button} from '../../../coral-component-button';
import base from '../templates/base';
import {transform, validate, commons} from '../../../coral-utils';

/**
 Enumeration for {@link Toast} variants.

 @typedef {Object} ToastVariantEnum

 @property {String} DEFAULT
 A neutral toast.
 @property {String} ERROR
 A toast to notify that an error has occurred or to warn the user of something important.
 @property {String} SUCCESS
 A toast to notify the user of a successful operation.
 @property {String} INFO
 A toast to notify the user of non-critical information.
 */
const variant = {
  DEFAULT: 'default',
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info'
};

/**
 Enumeration for {@link Toast} placement values.

 @typedef {Object} ToastPlacementEnum

 @property {String} LEFT
 A toast anchored to the bottom left of screen.
 @property {String} CENTER
 A toast anchored to the bottom center of screen.
 @property {String} RIGHT
 A toast anchored to the bottom right of screen.
 */
const placement = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

const CLASSNAME = '_coral-Toast';

// An array of all possible variant
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

const PRIORITY_QUEUE = [];

const queue = (el) => {
  let priority;
  const type = transform.string(el.getAttribute('variant')).toLowerCase();

  if (type === variant.ERROR) {
    priority = el.action ? 1 : 2;
  } else if (type === variant.SUCCESS) {
    priority = el.action ? 3 : 6;
  } else if (type === variant.INFO) {
    priority = el.action ? 4 : 7;
  } else {
    priority = el.action ? 5 : 8;
  }

  PRIORITY_QUEUE.push({
    el,
    priority
  });
};

const unqueue = () => {
  let next = null;
  [1, 2, 3, 4, 5, 6, 7, 8].some((priority) => {
    return PRIORITY_QUEUE.some((item, index) => {
      if (item.priority === priority) {
        next = {
          el: item.el,
          index
        };

        return true;
      }
    });
  });

  if (next !== null) {
    PRIORITY_QUEUE.splice(next.index, 1);
    next.el.open = true;
  }
};

// Used to map icon with variant
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// Restriction filter for action button
const isButton = node => (node.nodeName === 'BUTTON' && node.getAttribute('is') === 'coral-button') ||
  (node.nodeName === 'A' && node.getAttribute('is') === 'coral-anchorbutton');

/**
 @class Coral.Toast
 @classdesc Toasts display brief temporary notifications.
 They are noticeable but do not disrupt the user experience and do not require an action to be taken.
 @htmltag coral-toast
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseOverlay}
 */
class Toast extends BaseOverlay(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Debounce wait time in milliseconds
    this._wait = 50;

    // Override defaults from Overlay
    this._overlayAnimationTime = this.constructor.FADETIME;
    this._focusOnShow = this.constructor.focusOnShow.OFF;
    this._returnFocus = this.constructor.returnFocus.ON;

    // Prepare templates
    this._elements = {
      // Fetch or create the content zone element
      content: this.querySelector('coral-toast-content') || document.createElement('coral-toast-content')
    };
    base.call(this._elements);

    this._delegateEvents({
      'global:resize': '_debounceLayout',
      'global:key:escape': '_onEscape',
      'click [coral-close]': '_onCloseClick',
      'coral-overlay:close': '_onClose'
    });

    // Layout any time the DOM changes
    this._observer = new MutationObserver(() => {
      this._debounceLayout();
    });

    // Watch for changes
    this._observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  /**
   Whether the Toast will be dismissed automatically after a certain period. The minimum and default value is 5 seconds.
   The dismissible behavior can be disabled by setting the value to <code>0</code>.
   If an actionable toast is set to auto-dismiss, make sure that the action is still accessible elsewhere in the application.

   @type {?Number}
   @default 5000
   @htmlattribute autodismiss
   */
  get autoDismiss() {
    return typeof this._autoDismiss === 'number' ? this._autoDismiss : 5000;
  }

  set autoDismiss(value) {
    value = transform.number(value);
    if (value !== null) {
      value = Math.abs(value);

      // Value can't be set lower than 5secs. 0 is an exception.
      if (value !== 0 && value < 5000) {
        commons._log('warn', 'Coral.Toast: the value for autoDismiss has to be 5 seconds minimum.');
        value = 5000;
      }

      this._autoDismiss = value;
    }
  }

  /**
   The actionable item marked with <code>[coral-toast-action]</code>.
   Restricted to {@link Button} or {@link AnchorButton} elements.
   Actionable toasts should not have a button with a redundant action. For example “dismiss” would be redundant as all
   toasts already have a close button.

   @type {HTMLElement}
   @readonly
   */
  get action() {
    return this._elements.action || this.querySelector('[coral-toast-action]');
  }

  set action(el) {
    if (!el) {
      return;
    }

    if (isButton(el)) {
      this._elements.action = el;
      el.setAttribute('coral-toast-action', '');
      el.setAttribute('variant', Button.variant._CUSTOM);
      el.classList.add('_coral-Button', '_coral-Button--overBackground', '_coral-Button--quiet');

      this._elements.body.appendChild(el);
    } else {
      commons._log('warn', 'Coral.Toast: provided action is not a Coral.Button or Coral.AnchorButton.');
    }
  }

  /**
   Inherited from {@link BaseOverlay#open}.
   */
  get open() {
    return super.open;
  }

  set open(value) {
    // Opening only if element is queued
    value = transform.booleanAttr(value);
    if (value && !this._queued) {
      this._open = value;
      // Mark it
      this._queued = true;
      // Clear timer
      if (this._dimissTimeout) {
        clearTimeout(this._dimissTimeout);
      }
      // Add it to the queue
      queue(this);

      requestAnimationFrame(() => {
        this._reflectAttribute('open', true);

        // If not child of document.body, we have to move it there
        this._moveToDocumentBody();

        requestAnimationFrame(() => {
          // Start emptying the queue
          if (document.querySelectorAll('coral-toast[open]').length === PRIORITY_QUEUE.length) {
            unqueue();
          }
        });
      });

      return;
    }

    super.open = value;

    // Ensure we're in the DOM
    if (this.open) {
      // Position the element
      this._position();

      // Handles what to focus based on focusOnShow
      this._handleFocus();

      // Use raf to wait for autoDismiss value to be set
      requestAnimationFrame(() => {
        // Only dismiss if value is different than 0
        if (this.autoDismiss !== 0) {
          this._dimissTimeout = window.setTimeout(() => {
            if (this.open && !this.contains(document.activeElement)) {
              this.open = false;
            }
          }, this.autoDismiss);
        }
      });
    }
  }

  /**
   The Toast variant. See {@link ToastVariantEnum}.

   @type {String}
   @default ToastVariantEnum.DEFAULT
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

    this._renderVariantIcon();

    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);

    // Set new variant class
    this.classList.add(`${CLASSNAME}--${this._variant}`);

    // Set the role attribute to alert or status depending on
    // the variant so that the element turns into a live region
    this.setAttribute('role', this._variant);
  }

  /**
   The Toast content element.

   @type {ToastContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-toast-content',
      insert: function (content) {
        content.classList.add(`${CLASSNAME}-content`);
        // After the header
        this._elements.body.insertBefore(content, this._elements.body.firstChild);
      }
    });
  }

  /**
   The Toast placement. See {@link ToastPlacementEnum}.

   @type {String}
   @default ToastPlacementEnum.CENTER
   @htmlattribute placement
   */
  get placement() {
    return this._placement || placement.CENTER;
  }

  set placement(value) {
    value = transform.string(value).toLowerCase();
    this._placement = validate.enumeration(placement)(value) && value || placement.CENTER;

    this._debounceLayout();
  }

  _renderVariantIcon() {
    if (this._elements.icon) {
      this._elements.icon.remove();
    }

    let variantValue = this.variant;

    // Default variant has no icon
    if (variantValue === variant.DEFAULT) {
      return;
    }

    // Inject the SVG icon
    const iconName = variantValue === variant.ERROR ? 'Alert' : capitalize(variantValue);
    const icon = Icon._renderSVG(`spectrum-css-icon-${iconName}Medium`, ['_coral-Toast-typeIcon', `_coral-UIIcon-${iconName}Medium`]);
    this.insertAdjacentHTML('afterbegin', icon);
    this._elements.icon = this.querySelector('._coral-Toast-typeIcon');
  }

  _moveToDocumentBody() {
    // Not in the DOM
    if (!document.body.contains(this)) {
      document.body.appendChild(this);
    }
    // In the DOM but not a direct child of body
    else if (this.parentNode !== document.body) {
      this._ignoreConnectedCallback = true;
      this._repositioned = true;
      document.body.appendChild(this);
      this._ignoreConnectedCallback = false;
    }
  }

  _debounceLayout() {
    // Debounce
    if (this._layoutTimeout !== null) {
      clearTimeout(this._layoutTimeout);
    }

    this._layoutTimeout = window.setTimeout(() => {
      this._layoutTimeout = null;
      this._position();
    }, this._wait);
  }

  _position() {
    if (this.open) {
      requestAnimationFrame(() => {
        if (this.placement === placement.CENTER) {
          this.style.left = `${document.body.clientWidth / 2 - this.clientWidth / 2}px`;
          this.style.right = '';
        } else if (this.placement === placement.LEFT) {
          this.style.left = 0;
          this.style.right = '';
        } else if (this.placement === placement.RIGHT) {
          this.style.left = '';
          this.style.right = 0;
        }
      });
    }
  }

  _onEscape(event) {
    if (this.open && this.classList.contains('is-open') && this._isTopOverlay()) {
      event.stopPropagation();
      this.open = false;
    }
  }

  _onCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.open = false;
      event.stopPropagation();
    }
  }

  _onClose() {
    // Unmark it
    this._queued = false;

    // Continue emptying the queue
    unqueue();
  }

  get _contentZones() {
    return {
      'coral-toast-content': 'content'
    };
  }

  static get _queue() {
    return PRIORITY_QUEUE;
  }

  /**
   Returns {@link Toast} placement options.

   @return {ToastPlacementEnum}
   */
  static get placement() {
    return placement;
  }

  /**
   Returns {@link Toast} variants.

   @return {ToastVariantEnum}
   */
  static get variant() {
    return variant;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      autodismiss: 'autoDismiss'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'variant',
      'placement',
      'autodismiss'
    ]);
  }

  /** @ignore */
  connectedCallback() {
    if (this._ignoreConnectedCallback) {
      return;
    }

    super.connectedCallback();
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }

    // Create a fragment
    const fragment = document.createDocumentFragment();

    const templateHandleNames = ['body', 'buttons'];

    // Render the template
    fragment.appendChild(this._elements.body);
    fragment.appendChild(this._elements.buttons);

    const content = this._elements.content;
    if (content.parentNode) {
      content.remove();
    }

    const action = this.action;
    if (action) {
      action.remove();
    }

    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the content
        content.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Insert template
    this.appendChild(fragment);

    // If default variant, does nothing
    this._renderVariantIcon();

    // Assign the content zones
    this.content = this._elements.content;
    this.action = action;
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._ignoreConnectedCallback) {
      return;
    }

    super.disconnectedCallback();

    if (this._queued) {
      let el = null;
      PRIORITY_QUEUE.some((item, index) => {
        if (item.el === this) {
          this._queued = false;
          el = index;
          return true;
        }
      });

      if (el !== null) {
        PRIORITY_QUEUE.splice(el, 1);
      }
    }
  }
}

export default Toast;
