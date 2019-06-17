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

import base from '../templates/base';
import Vent from '@adobe/vent';
import {validate, transform, commons} from '../../../coral-utils';
import {trapFocus, returnFocus, focusOnShow, FADETIME} from './enums';

// Includes overlay itself
const COMPONENTS_WITH_OVERLAY = `
  coral-actionbar,
  coral-autocomplete,
  coral-colorinput,
  coral-cyclebutton,
  coral-datepicker,
  coral-dialog,
  coral-overlay,
  coral-popover,
  coral-quickactions,
  coral-select,
  coral-tooltip
`;

// The tab capture element that lives at the top of the body
let topTabCaptureEl;
let bottomTabCaptureEl;

// A reference to the backdrop element
let backdropEl;

// The starting zIndex for overlays
const startZIndex = 10000;

// Tab keycode
const TAB_KEY = 9;

// A stack interface for overlays
const overlayStack = [];
let OverlayManager = {};

/**
 Cancel the backdrop hide mid-animation.
 */
let fadeTimeout;
function cancelBackdropHide() {
  window.clearTimeout(fadeTimeout);
}

/**
 Set aria-hidden on every immediate child except the one passed, which should not be hidden.
 */
function hideEverythingBut(instance) {
  // ARIA: Hide all the things
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    
    // If it's not a parent of or not the instance itself, it needs to be hidden
    if (child !== instance && !child.contains(instance)) {
      const currentAriaHidden = child.getAttribute('aria-hidden');
      if (currentAriaHidden) {
        // Store the previous value of aria-hidden if present
        // Don't blow away the previously stored value
        child._previousAriaHidden = child._previousAriaHidden || currentAriaHidden;
        if (currentAriaHidden === 'true') {
          // It's already true, don't bother setting
          continue;
        }
      }
      else {
        // Nothing is hidden by default, store that
        child._previousAriaHidden = 'false';
      }
      
      // Hide it
      child.setAttribute('aria-hidden', 'true');
    }
  }
  
  // Always show ourselves
  instance.setAttribute('aria-hidden', 'false');
}

/**
 Actually reposition the backdrop to be under the topmost overlay.
 */
function doRepositionBackdrop() {
  // Position under the topmost overlay
  const top = OverlayManager.top();
  
  if (top) {
    // The backdrop, if shown, should be positioned under the topmost overlay that does have a backdrop
    for (let i = overlayStack.length - 1; i > -1; i--) {
      if (overlayStack[i].backdrop) {
        backdropEl.style.zIndex = overlayStack[i].zIndex - 1;
        break;
      }
    }
    
    // ARIA: Set hidden properly
    hideEverythingBut(top.instance);
  }
}

OverlayManager = {
  pop(instance) {
    // Get overlay index
    const index = this.indexOf(instance);
    
    if (index === -1) {
      return null;
    }
    
    // Get the overlay
    const overlay = overlayStack[index];
    
    // Remove from the stack
    overlayStack.splice(index, 1);
    
    // Return the passed overlay or the found overlay
    return overlay;
  },
  
  push(instance) {
    // Pop overlay
    const overlay = this.pop(instance) || {instance};
    
    // Get the new highest zIndex
    const zIndex = this.getHighestZIndex() + 10;
    
    // Store the zIndex
    overlay.zIndex = zIndex;
    instance.style.zIndex = zIndex;
    
    // Push it
    overlayStack.push(overlay);
    
    if (overlay.backdrop) {
      // If the backdrop is shown, we'll need to reposition it
      // Generally, a component will not call _pushOverlay unnecessarily
      // However, attachedCallback is asynchronous in polyfilld environments,
      // so _pushOverlay will be called when shown and when attached
      doRepositionBackdrop();
    }
    
    return overlay;
  },
  
  indexOf(instance) {
    // Loop over stack
    // Find overlay
    // Return index
    for (let i = 0; i < overlayStack.length; i++) {
      if (overlayStack[i].instance === instance) {
        return i;
      }
    }
    return -1;
  },
  
  get(instance) {
    // Get overlay index
    const index = this.indexOf(instance);
    
    // Return overlay
    return index === -1 ? null : overlayStack[index];
  },
  
  top() {
    const length = overlayStack.length;
    return length === 0 ? null : overlayStack[length - 1];
  },
  
  getHighestZIndex() {
    const overlay = this.top();
    return overlay ? overlay.zIndex : startZIndex;
  },
  
  some(...args) {
    return overlayStack.some(...args);
  },
  
  forEach(...args) {
    return overlayStack.forEach(...args);
  }
};

/**
 Create the global tab capture element.
 */
function createDocumentTabCaptureEls() {
  if (!topTabCaptureEl) {
    topTabCaptureEl = document.createElement('div');
    topTabCaptureEl.setAttribute('coral-tabcapture', '');
    topTabCaptureEl.tabIndex = 0;
    document.body.insertBefore(topTabCaptureEl, document.body.firstChild);
    topTabCaptureEl.addEventListener('focus', () => {
      const top = OverlayManager.top();
      if (top && top.instance.trapFocus === trapFocus.ON) {
        // Focus on the first tabbable element of the top overlay
        Array.prototype.some.call(top.instance.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), (item) => {
          if (item.offsetParent !== null && !item.hasAttribute('coral-tabcapture')) {
            item.focus();
            return true;
          }
          
          return false;
        });
      }
    });
    
    bottomTabCaptureEl = document.createElement('div');
    bottomTabCaptureEl.setAttribute('coral-tabcapture', '');
    bottomTabCaptureEl.tabIndex = 0;
    document.body.appendChild(bottomTabCaptureEl);
    bottomTabCaptureEl.addEventListener('focus', () => {
      const top = OverlayManager.top();
      if (top && top.instance.trapFocus === trapFocus.ON) {
        const tabbableElement = Array.prototype.filter.call(top.instance.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), (item) => item.offsetParent !== null && !item.hasAttribute('coral-tabcapture')).pop();
        
        // Focus on the last tabbable element of the top overlay
        if (tabbableElement) {
          tabbableElement.focus();
        }
      }
    });
  }
  else {
    if (document.body.firstElementChild !== topTabCaptureEl) {
      // Make sure we stay at the very top
      document.body.insertBefore(topTabCaptureEl, document.body.firstChild);
    }
    
    if (document.body.lastElementChild !== bottomTabCaptureEl) {
      // Make sure we stay at the very bottom
      document.body.appendChild(bottomTabCaptureEl);
    }
  }
  
  // Make sure the tab capture elemenst are shown
  topTabCaptureEl.style.display = 'inline';
  bottomTabCaptureEl.style.display = 'inline';
}

/**
 Called after all overlays are hidden and we shouldn't capture the first tab into the page.
 */
function hideDocumentTabCaptureEls() {
  if (topTabCaptureEl) {
    topTabCaptureEl.style.display = 'none';
    bottomTabCaptureEl.style.display = 'none';
  }
}

/**
 Show or restore the aria-hidden state of every child of body.
 */
function showEverything() {
  // ARIA: Show all the things
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // Restore the previous aria-hidden value
    child.setAttribute('aria-hidden', child._previousAriaHidden || 'false');
  }
}

/**
 Actually hide the backdrop.
 */
function doBackdropHide() {
  document.body.classList.remove('u-coral-noscroll');
  
  // Start animation
  window.requestAnimationFrame(() => {
    backdropEl.classList.remove('is-open');
    
    cancelBackdropHide();
    fadeTimeout = window.setTimeout(() => {
      backdropEl.style.display = 'none';
    }, FADETIME);
  });
  
  // Set flag for testing
  backdropEl._isOpen = false;
  
  // Wait for animation to complete
  showEverything();
}

/**
 Hide the backdrop if no overlays are using it.
 */
function hideOrRepositionBackdrop() {
  if (!backdropEl || !backdropEl._isOpen) {
    // Do nothing if the backdrop isn't shown
    return;
  }
  
  // Loop over all overlays
  const keepBackdrop = OverlayManager.some((overlay) => {
    // Check for backdrop usage
    if (overlay.backdrop) {
      return true;
    }
    
    return false;
  });
  
  if (!keepBackdrop) {
    // Hide the backdrop
    doBackdropHide();
  }
  else {
    // Reposition the backdrop
    doRepositionBackdrop();
  }
  
  // Hide/create the document-level tab capture element as necessary
  // This only applies to modal overlays (those that have backdrops)
  const top = OverlayManager.top();
  if (!top || !(top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop)) {
    hideDocumentTabCaptureEls();
  }
  else if (top && top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop) {
    createDocumentTabCaptureEls();
  }
}

/**
 Handles clicks to the backdrop, calling backdropClickedCallback for every overlay
 */
function handleBackdropClick(event) {
  OverlayManager.forEach((overlay) => {
    if (typeof overlay.instance.backdropClickedCallback === 'function') {
      overlay.instance.backdropClickedCallback(event);
    }
  });
}

/**
 Actually show the backdrop.
 */
function doBackdropShow(zIndex, instance) {
  document.body.classList.add('u-coral-noscroll');
  
  if (!backdropEl) {
    backdropEl = document.createElement('div');
    backdropEl.className = '_coral-Underlay';
    document.body.appendChild(backdropEl);
    
    backdropEl.addEventListener('click', handleBackdropClick);
  }
  
  // Show just under the provided zIndex
  // Since we always increment by 10, this will never collide
  backdropEl.style.zIndex = zIndex - 1;
  
  // Set flag for testing
  backdropEl._isOpen = true;
  
  // Start animation
  backdropEl.style.display = '';
  window.requestAnimationFrame(() => {
    // Add the class on the next animation frame so backdrop has time to exist
    // Otherwise, the animation for opacity will not work.
    backdropEl.classList.add('is-open');
    
    cancelBackdropHide();
  });
  
  hideEverythingBut(instance);
}

/**
 @base BaseOverlay
 @classdesc The base element for Overlay components
 */
const BaseOverlay = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {};
    base.call(this._elements);
  }
  
  /**
   Whether to trap tabs and keep them within the overlay. See {@link OverlayTrapFocusEnum}.
   
   @type {String}
   @default OverlayTrapFocusEnum.OFF
   @htmlattribute trapfocus
   */
  get trapFocus() {
    return this._trapFocus || trapFocus.OFF;
  }
  set trapFocus(value) {
    value = transform.string(value).toLowerCase();
    this._trapFocus = validate.enumeration(trapFocus)(value) && value || trapFocus.OFF;
    
    if (this._trapFocus === trapFocus.ON) {
      // Give ourselves tabIndex if we are not focusable
      if (this.tabIndex < 0) {
        /** @ignore */
        this.tabIndex = 0;
      }
      
      // Insert elements
      this.insertBefore(this._elements.topTabCapture, this.firstElementChild);
      this.appendChild(this._elements.intermediateTabCapture);
      this.appendChild(this._elements.bottomTabCapture);
      
      // Add listeners
      this._handleTabCaptureFocus = this._handleTabCaptureFocus.bind(this);
      this._handleRootKeypress = this._handleRootKeypress.bind(this);
      this._vent.on('keydown', this._handleRootKeypress);
      this._vent.on('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
    }
    else if (this._trapFocus === trapFocus.OFF) {
      // Remove elements
      this._elements.topTabCapture && this._elements.topTabCapture.remove();
      this._elements.intermediateTabCapture && this._elements.intermediateTabCapture.remove();
      this._elements.bottomTabCapture && this._elements.bottomTabCapture.remove();
  
      // Remove listeners
      this._vent.off('keydown', this._handleRootKeypress);
      this._vent.off('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
    }
  }
  
  /**
   Whether to return focus to the previously focused element when closed. See {@link OverlayReturnFocusEnum}.
   
   @type {String}
   @default OverlayReturnFocusEnum.OFF
   @htmlattribute returnfocus
   */
  get returnFocus() {
    return this._returnFocus || returnFocus.OFF;
  }
  set returnFocus(value) {
    value = transform.string(value).toLowerCase();
    this._returnFocus = validate.enumeration(returnFocus)(value) && value || returnFocus.OFF;
  }
  
  /**
   Whether to focus the overlay, when opened or not. By default the overlay itself will get the focus. It also accepts
   an instance of HTMLElement or a selector like ':first-child' or 'button:last-of-type'. If the selector returns
   multiple elements, it will focus the first element inside the overlay that matches the selector.
   See {@link OverlayFocusOnShowEnum}.
   
   @type {HTMLElement|String}
   @default OverlayFocusOnShowEnum.ON
   @htmlattribute focusonshow
   */
  get focusOnShow() {
    return this._focusOnShow || focusOnShow.ON;
  }
  set focusOnShow(value) {
    if (typeof value === 'string' || value instanceof HTMLElement) {
      this._focusOnShow = value;
    }
  }
  
  /**
   Whether this overlay is open or not.
   
   @type {Boolean}
   @default false
   @htmlattribute open
   @htmlattributereflected
   @emits {coral-overlay:open}
   @emits {coral-overlay:close}
   @emits {coral-overlay:beforeopen}
   @emits {coral-overlay:beforeclose}
   */
  get open() {
    return this._open || false;
  }
  set open(value) {
    const silenced = this._silenced;
    
    value = transform.booleanAttr(value);
    const beforeEvent = this.trigger(value ? 'coral-overlay:beforeopen' : 'coral-overlay:beforeclose');
    
    if (!beforeEvent.defaultPrevented) {
      const open = this._open = value;
      this._reflectAttribute('open', open);
  
      // Set aria-hidden false before we show
      // Otherwise, screen readers will not announce
      // Doesn't matter when we set aria-hidden true (nothing being announced)
      this.setAttribute('aria-hidden', !open);
  
      // Don't do anything if we're not in the DOM yet
      // This prevents errors related to allocating a zIndex we don't need
      if (this.parentNode) {
        // Do this check afterwards as we may have been appended inside of _show()
        if (open) {
          // Set z-index
          this._pushOverlay();
      
          if (this.returnFocus === returnFocus.ON) {
            this._elementToFocusWhenHidden =
              // cached element
              this._elementToFocusWhenHidden ||
              // element passed via returnFocusTo()
              this._returnFocusToElement ||
              // element that had focus before opening the overlay
              (document.activeElement === document.body ? null : document.activeElement);
          }
        }
        else {
          // Release zIndex
          this._popOverlay();
        }
      }
      
      // Don't force reflow
      window.requestAnimationFrame(() => {
        // Keep it silenced
        this._silenced = silenced;
        
        if (open) {
          if (this.trapFocus === trapFocus.ON) {
            // Make sure tab capture elements are positioned correctly
            if (
              // Tab capture elements are no longer at the bottom
              this._elements.topTabCapture !== this.firstElementChild ||
              this._elements.bottomTabCapture !== this.lastElementChild ||
              // Tab capture elements have been separated
              this._elements.bottomTabCapture.previousElementSibling !== this._elements.intermediateTabCapture
            ) {
              this.insertBefore(this._elements.intermediateTabCapture, this.firstElementChild);
              this.appendChild(this._elements.intermediateTabCapture);
              this.appendChild(this._elements.bottomTabCapture);
            }
          }
    
          // The default style should be display: none for overlays
          // Show ourselves first for centering calculations etc
          this.style.display = '';
  
          // Do it in the next frame to make the animation happen
          window.requestAnimationFrame(() => {
            this.classList.add('is-open');
          });
  
          const openComplete = () => {
            if (this.open) {
              this._debounce(() => {
                // handles the focus behavior based on accessibility recommendations
                this._handleFocus();
  
                this.trigger('coral-overlay:open');
                this._silenced = false;
              });
            }
          };
  
          if (this._overlayAnimationTime) {
            // Wait for animation to complete
            commons.transitionEnd(this, openComplete);
          }
          else {
            // Execute immediately
            openComplete();
          }
        }
        else {
          // Fade out
          this.classList.remove('is-open');
    
          const closeComplete = () => {
            if (!this.open) {
              // Hide self
              this.style.display = 'none';
  
              // makes sure the focus is returned per accessibility recommendations
              this._handleReturnFocus();
  
              this._debounce(() => {
                // Inform child overlays that we're closing
                this._closeChildOverlays();
  
                this.trigger('coral-overlay:close');
                this._silenced = false;
              });
            }
          };
    
          if (this._overlayAnimationTime) {
            // Wait for animation to complete
            commons.transitionEnd(this, closeComplete);
          }
          else {
            // Execute immediately
            closeComplete();
          }
        }
      });
    }
  }
  
  _closeChildOverlays() {
    const components = this.querySelectorAll(COMPONENTS_WITH_OVERLAY);
    
    // Close all children overlays and components with overlays
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      
      // Overlay component
      if (component.hasAttribute('open')) {
        component.removeAttribute('open');
      }
      // Component that uses an overlay
      else if (component._elements && component._elements.overlay && component._elements.overlay.hasAttribute('open')) {
        component._elements.overlay.removeAttribute('open');
      }
    }
  }
  
  /** @private */
  _debounce(f) {
    // Used to avoid triggering open/close event continuously
    window.clearTimeout(this._debounceId);
    this._debounceId = window.setTimeout(() => {
      f();
    }, 10);
  }
  
  /**
   Check if this overlay is the topmost.
   
   @protected
   */
  _isTopOverlay() {
    const top = OverlayManager.top();
    return top && top.instance === this;
  }
  
  /**
   Push the overlay to the top of the stack.
   
   @protected
   */
  _pushOverlay() {
    OverlayManager.push(this);
  }
  
  /**
   Remove the overlay from the stack.
   
   @protected
   */
  _popOverlay() {
    OverlayManager.pop(this);
    
    // Automatically hide the backdrop if required
    hideOrRepositionBackdrop();
  }
  
  /**
   Show the backdrop.
   
   @protected
   */
  _showBackdrop() {
    const overlay = OverlayManager.get(this);
    
    // Overlay is not tracked unless the component is in the DOM
    // Hence, we need to check
    if (overlay) {
      overlay.backdrop = true;
      doBackdropShow(overlay.zIndex, this);
    }
    
    // Mark on the instance that the backdrop has been requested for this overlay
    this._requestedBackdrop = true;
    
    // Mark that the backdrop was requested when not attached to the DOM
    // This allows us to know whether to push the overlay when the component is attached
    if (!this.parentNode) {
      this._showBackdropOnAttached = true;
    }
    
    if (this.trapFocus === trapFocus.ON) {
      createDocumentTabCaptureEls();
    }
  }
  
  /**
   Show the backdrop.
   
   @protected
   */
  _hideBackdrop() {
    const overlay = OverlayManager.get(this);
    
    if (overlay) {
      overlay.backdrop = false;
      
      // If that was the last overlay using the backdrop, hide it
      hideOrRepositionBackdrop();
    }
    
    // Mark on the instance that the backdrop is no longer needed
    this._requestedBackdrop = false;
  }
  
  /**
   Handles keypresses on the root of the overlay and marshalls focus accordingly.
   
   @protected
   */
  _handleRootKeypress(event) {
    if (event.target === this && event.keyCode === TAB_KEY) {
      // Skip the top tabcapture and focus on the first focusable element
      this._focusOn('first');
      
      // Stop the normal tab behavior
      event.preventDefault();
    }
  }
  
  /**
   Handles focus events on tab capture elements.
   
   @protected
   */
  _handleTabCaptureFocus(event) {
    // Avoid moving around if we're trying to focus on coral-tabcapture
    if (this._ignoreTabCapture) {
      this._ignoreTabCapture = false;
      return;
    }
    
    // Focus on the correct tabbable element
    const target = event.target;
    const which = target === this._elements.intermediateTabCapture ? 'first' : 'last';
    
    this._focusOn(which);
  }
  
  /**
   Handles the focus behavior. When "on" is specified it would try to find the first tababble descendent in the
   content and if there are no valid candidates it will focus the element itself.
   
   @protected
   */
  _handleFocus() {
    // ON handles the focusing per accessibility recommendations
    if (this.focusOnShow === focusOnShow.ON) {
      this._focusOn('first');
    }
    else if (this.focusOnShow instanceof HTMLElement) {
      this.focusOnShow.focus();
    }
    else if (typeof this.focusOnShow === 'string' && this.focusOnShow !== focusOnShow.OFF) {
      // we need to add :not([coral-tabcapture]) to avoid selecting the tab captures
      const selectedElement = this.querySelector(`${this.focusOnShow}:not([coral-tabcapture])`);
      
      if (selectedElement) {
        selectedElement.focus();
      }
      // in case the selector does not match, it should fallback to the default behavior
      else {
        this._focusOn('first');
      }
    }
  }
  
  /**
   @protected
   */
  _handleReturnFocus() {
    if (this.returnFocus === returnFocus.ON && this._elementToFocusWhenHidden) {
      if (document.activeElement && !this.contains(document.activeElement)) {
        // Don't return focus if the user focused outside of the overlay
        return;
      }
      
      // Return focus, ignoring tab capture if it is an overlay
      this._elementToFocusWhenHidden._ignoreTabCapture = true;
      this._elementToFocusWhenHidden.focus();
      this._elementToFocusWhenHidden._ignoreTabCapture = false;
      
      // Drop the reference to avoid memory leaks
      this._elementToFocusWhenHidden = null;
    }
  }
  
  /**
   Focus on the first or last element.
   
   @param {String} which
   one of "first" or "last"
   @protected
   */
  _focusOn(which) {
    let tabTarget;
    if (which === 'first' || which === 'last') {
      // @todo: shall this be focusable or tabbable?
      const tabbableElements = Array.prototype.filter.call(this.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), item => item.offsetParent !== null && !item.hasAttribute('coral-tabcapture'));
      tabTarget = tabbableElements[which === 'first' ? 'shift' : 'pop']();
    }
    
    // if we found a focusing target we focus it
    if (tabTarget) {
      tabTarget.focus();
    }
    // otherwise the element itself should get focus
    else {
      this.focus();
    }
  }
  
  /**
   Open the overlay and set the z-index accordingly.
   
   @returns {BaseOverlay} this, chainable
   */
  show() {
    this.open = true;
    
    return this;
  }
  
  /**
   Close the overlay.
   
   @returns {BaseOverlay} this, chainable
   */
  hide() {
    this.open = false;
  
    return this;
  }
  
  /**
   Set the element that focus should be returned to when the overlay is hidden.
   
   @param {HTMLElement} element
   The element to return focus to. This must be a DOM element, not a jQuery object or selector.
   
   @returns {BaseOverlay} this, chainable
   */
  returnFocusTo(element) {
    if (this.returnFocus === returnFocus.OFF) {
      // Switch on returning focus if it's off
      this.returnFocus = returnFocus.ON;
    }
  
    // If the element is not focusable,
    if (element.offsetParent === null || !element.matches(commons.FOCUSABLE_ELEMENT_SELECTOR)) {
      // add tabindex so that it is programmatically focusable.
      element.setAttribute('tabindex', -1);
    
      // On blur, restore element to its prior, not-focusable state
      const tempVent = new Vent(element);
      tempVent.on('blur.afterFocus', (event) => {
        // Wait a frame before testing whether focus has moved to an open overlay or to some other element.
        window.requestAnimationFrame(() => {
          // If overlay remains open, don't remove tabindex event handler until after it has been closed
          const top = OverlayManager.top();
          if (top && top.instance.contains(document.activeElement)) {
            return;
          }
          tempVent.off('blur.afterFocus');
          event.matchedTarget.removeAttribute('tabindex');
        });
      }, true);
    }
  
    this._returnFocusToElement = element;
    return this;
  }
  
  static get _OverlayManager() {
    return OverlayManager;
  }
  
  /**
   Returns {@link BaseOverlay} trap focus options.
   
   @return {OverlayTrapFocusEnum}
   */
  static get trapFocus() { return trapFocus; }
  
  /**
   Returns {@link BaseOverlay} return focus options.
   
   @return {OverlayReturnFocusEnum}
   */
  static get returnFocus() { return returnFocus; }
  
  /**
   Returns {@link BaseOverlay} focus on show options.
   
   @return {OverlayFocusOnShowEnum}
   */
  static get focusOnShow() { return focusOnShow; }
  
  /**
   Returns {@link BaseOverlay} fadetime in milliseconds.
   
   @return {Number}
   */
  static get FADETIME() { return FADETIME; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'trapfocus',
      'trapFocus',
      'returnfocus',
      'returnFocus',
      'focusonshow',
      'focusOnShow',
      'open'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    if (!this.hasAttribute('trapfocus')) { this.trapFocus = this.trapFocus; }
    if (!this.hasAttribute('returnfocus')) { this.returnFocus = this.returnFocus; }
    if (!this.hasAttribute('focusonshow')) { this.focusOnShow = this.focusOnShow; }
    
    if (this.open) {
      this._pushOverlay();
    
      if (this._showBackdropOnAttached) {
        // Show the backdrop again
        this._showBackdrop();
      }
    }
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
  
    if (this.open) {
      // Release zIndex as we're not in the DOM any longer
      // When we're re-added, we'll get a new zIndex
      this._popOverlay();
    
      if (this._requestedBackdrop) {
        // Mark that we'll need to show the backdrop when attached
        this._showBackdropOnAttached = true;
      }
    }
  }
  
  /**
   Called when the {@link BaseOverlay} is clicked.
   
   @function backdropClickedCallback
   @protected
   */
  
  /**
   Triggered before the {@link BaseOverlay} is opened with <code>show()</code> or <code>instance.open = true</code>.
 
   @typedef {CustomEvent} coral-overlay:beforeopen
   
   @property {function} preventDefault
   Call to stop the overlay from opening.
   */
  
  /**
   Triggered after the {@link BaseOverlay} is opened with <code>show()</code> or <code>instance.open = true</code>
 
   @typedef {CustomEvent} coral-overlay:open
   */
  
  /**
   Triggered before the {@link BaseOverlay} is closed with <code>hide()</code> or <code>instance.open = false</code>.
 
   @typedef {CustomEvent} coral-overlay:beforeclose
   
   @property {function} preventDefault
   Call to stop the overlay from closing.
   */
  
  /**
   Triggered after the {@link BaseOverlay} is closed with <code>hide()</code> or <code>instance.open = false</code>
 
   @typedef {CustomEvent} coral-overlay:close
   */
};

export default BaseOverlay;
