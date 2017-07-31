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

import base from '../templates/base';
import {validate, transform, commons} from 'coralui-util';
import {trapFocus, returnFocus, focusOnShow, FADETIME} from './enums';

// The tab capture element that lives at the top of the body
let topTabCaptureEl;
let bottomTabCaptureEl;

// A reference to the backdrop element
let backdropEl;

// The starting zIndex for overlays
let startZIndex = 10000;

// Tab keycode
const TAB_KEY = 9;

// A stack interface for overlays
const _overlays = [];
const overlays = {
  pop: function(instance) {
    // Get overlay index
    const index = this.indexOf(instance);
    
    if (index === -1) {
      return null;
    }
    
    // Get the overlay
    const overlay = _overlays[index];
    
    // Remove from the stack
    _overlays.splice(index, 1);
    
    // Return the passed overlay or the found overlay
    return overlay;
  },
  
  push: function(instance) {
    // Pop overlay
    const overlay = this.pop(instance) || {
        instance: instance
      };
    
    // Get the new highest zIndex
    const zIndex = this.getHighestZIndex() + 10;
    
    // Store the zIndex
    overlay.zIndex = zIndex;
    instance.style.zIndex = zIndex;
    
    // Push it
    _overlays.push(overlay);
    
    if (overlay.backdrop) {
      // If the backdrop is shown, we'll need to reposition it
      // Generally, a component will not call _pushOverlay unnecessarily
      // However, attachedCallback is asynchronous in polyfilld environments,
      // so _pushOverlay will be called when shown and when attached
      doRepositionBackdrop();
    }
    
    return overlay;
  },
  
  indexOf: function(instance) {
    // Loop over stack
    // Find overlay
    // Return index
    for (let i = 0; i < _overlays.length; i++) {
      if (_overlays[i].instance === instance) {
        return i;
      }
    }
    return -1;
  },
  
  get: function(instance) {
    // Get overlay index
    const index = this.indexOf(instance);
    
    // Return overlay
    return index === -1 ? null : _overlays[index];
  },
  
  top: function() {
    const length = _overlays.length;
    return length === 0 ? null : _overlays[length - 1];
  },
  
  getHighestZIndex: function() {
    const overlay = this.top();
    return overlay ? overlay.zIndex : startZIndex;
  },
  
  some: function() {
    return _overlays.some.apply(_overlays, arguments);
  },
  
  forEach: function() {
    return _overlays.forEach.apply(_overlays, arguments);
  }
};

/**
 Hide the backdrop if no overlays are using it.
 */
function hideOrRepositionBackdrop() {
  if (!backdropEl || !backdropEl._isOpen) {
    // Do nothing if the backdrop isn't shown
    return;
  }
  
  // Loop over all overlays
  const keepBackdrop = overlays.some(function(overlay) {
    // Check for backdrop usage
    if (overlay.backdrop) {
      return true;
    }
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
  const top = overlays.top();
  if (!top || !(top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop)) {
    hideDocumentTabCaptureEls();
  }
  else if (top && top.instance.trapFocus === trapFocus.ON && top.instance._requestedBackdrop) {
    createDocumentTabCaptureEls();
  }
}

/**
 Actually reposition the backdrop to be under the topmost overlay.
 */
function doRepositionBackdrop() {
  // Position under the topmost overlay
  const top = overlays.top();
  
  if (top) {
    // The backdrop, if shown, should be positioned under the topmost overlay that does have a backdrop
    for (let i = _overlays.length - 1; i > -1; i--) {
      if (_overlays[i].backdrop) {
        backdropEl.style.zIndex = _overlays[i].zIndex - 1;
        break;
      }
    }
    
    // ARIA: Set hidden properly
    hideEverythingBut(top.instance);
  }
}

/**
 Cancel the backdrop hide mid-animation.
 */
let fadeTimeout;
function cancelBackdropHide() {
  window.clearTimeout(fadeTimeout);
}

/**
 Actually hide the backdrop.
 */
function doBackdropHide() {
  document.body.classList.remove('u-coral-noscroll');
  
  // Start animation
  window.requestAnimationFrame(function() {
    backdropEl.classList.remove('is-open');
    
    cancelBackdropHide();
    fadeTimeout = window.setTimeout(function() {
      backdropEl.style.display = 'none';
    }, FADETIME);
  });
  
  // Set flag for testing
  backdropEl._isOpen = false;
  
  // Wait for animation to complete
  showEverything();
}

/**
 Actually show the backdrop.
 */
function doBackdropShow(zIndex, instance) {
  document.body.classList.add('u-coral-noscroll');
  
  if (!backdropEl) {
    backdropEl = document.createElement('div');
    backdropEl.className = 'coral3-Backdrop';
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
  window.requestAnimationFrame(function() {
    // Add the class on the next animation frame so backdrop has time to exist
    // Otherwise, the animation for opacity will not work.
    backdropEl.classList.add('is-open');
    
    cancelBackdropHide();
  });
  
  hideEverythingBut(instance);
}

/**
 Handles clicks to the backdrop, calling backdropClickedCallback for every overlay
 */
function handleBackdropClick(event) {
  overlays.forEach(function(overlay) {
    if (typeof overlay.instance.backdropClickedCallback === 'function') {
      overlay.instance.backdropClickedCallback(event);
    }
  });
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
 Create the global tab capture element.
 */
function createDocumentTabCaptureEls() {
  if (!topTabCaptureEl) {
    topTabCaptureEl = document.createElement('div');
    topTabCaptureEl.setAttribute('coral-tabcapture', '');
    topTabCaptureEl.tabIndex = 0;
    document.body.insertBefore(topTabCaptureEl, document.body.firstChild);
    topTabCaptureEl.addEventListener('focus', function(event) {
      const top = overlays.top();
      if (top && top.instance.trapFocus === trapFocus.ON) {
        // Focus on the first tabbable element of the top overlay
        Array.prototype.some.forEach.call(top.instance.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
          if (item.offsetParent !== null && !item.hasAttribute('coral-tabcapture')) {
            item.focus();
            return true;
          }
        });
      }
    });
    
    bottomTabCaptureEl = document.createElement('div');
    bottomTabCaptureEl.setAttribute('coral-tabcapture', '');
    bottomTabCaptureEl.tabIndex = 0;
    document.body.appendChild(bottomTabCaptureEl);
    bottomTabCaptureEl.addEventListener('focus', function(event) {
      const top = overlays.top();
      if (top && top.instance.trapFocus === trapFocus.ON) {
        const tabbableElement = Array.prototype.filter.call(top.instance.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
          return item.offsetParent !== null && !item.hasAttribute('coral-tabcapture');
        }).pop();
        
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
 @mixin Overlay
 @classdesc The base element for overlay components
 */
const Overlay = (superClass) => class extends superClass {
  constructor() {
    super();
    
    // Templates
    this._elements = {};
    base.call(this._elements);
  }
  
  /**
   Whether to trap tabs and keep them within the overlay.
   
   @type {Coral.mixin.overlay.trapFocus}
   @default Coral.mixin.overlay.trapFocus.OFF
   @htmlattribute trapfocus
   @memberof Coral.mixin.overlay#
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
    else {
      // Don't just put this in an else, check if we currently have it disabled
      // so we only attempt to remove elements if we were previously capturing tabs
      if (this._trapFocus === trapFocus.ON) {
        // Remove elements
        this.removeChild(this._elements.topTabCapture);
        this.removeChild(this._elements.intermediateTabCapture);
        this.removeChild(this._elements.bottomTabCapture);
        
        // Remove listeners
        this._vent.off('keydown', this._handleRootKeypress);
        this._vent.off('focus', '[coral-tabcapture]', this._handleTabCaptureFocus);
      }
    }
  }
  
  /**
   Whether to return focus to the previously focused element when closed.
   
   @type {Coral.mixin.overlay.returnFocus}
   @default Coral.mixin.overlay.returnFocus.OFF
   @htmlattribute returnfocus
   @memberof Coral.mixin.overlay#
   */
  get returnFocus() {
    return this._returnFocus || returnFocus.OFF;
  }
  set returnFocus(value) {
    value = transform.string(value).toLowerCase();
    this._returnFocus = validate.enumeration(returnFocus)(value) && value || returnFocus.OFF;
  }
  
  /**
   Whether to focus the overlay, when opened or not (default=['off']{@link Coral.mixin.overlay.focusOnShow}).
   
   If set to ['on']{@link Coral.mixin.overlay.focusOnShow}, the overlay itself will get focus.
   This property also accepts an instance of HTMLElement or a selector like ':first-child' or 'button:last-of-type'
   and will focus the first element found inside the overlay instead of the overlay itself.
   
   @type {Coral.mixin.overlay.focusOnShow|HTMLElement|String}
   @default [Coral.mixin.overlay.focusOnShow.OFF]{@link Coral.mixin.overlay.focusOnShow}
   @htmlattribute focusonshow
   @memberof Coral.mixin.overlay#
   */
  get focusOnShow() {
    return this._focusOnShow || focusOnShow.OFF;
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
   @memberof Coral.mixin.overlay#
   @fires Coral.mixin.overlay#coral-overlay:open
   @fires Coral.mixin.overlay#coral-overlay:close
   @fires Coral.mixin.overlay#coral-overlay:beforeopen
   @fires Coral.mixin.overlay#coral-overlay:beforeclose
   */
  get open() {
    return this._open || false;
  }
  set open(value) {
    const self = this;
    const silenced = self._silenced;
    
    value = transform.booleanAttr(value);
    const beforeEvent = self.trigger(value ? 'coral-overlay:beforeopen' : 'coral-overlay:beforeclose');
    
    if (!beforeEvent.defaultPrevented) {
      const open = self._open = value;
      self._reflectAttribute('open', open);
  
      // Set aria-hidden false before we show
      // Otherwise, screen readers will not announce
      // Doesn't matter when we set aria-hidden true (nothing being announced)
      self.setAttribute('aria-hidden', !open);
  
      // Don't do anything if we're not in the DOM yet
      // This prevents errors related to allocating a zIndex we don't need
      if (self.parentNode) {
        // Do this check afterwards as we may have been appended inside of _show()
        if (open) {
          // Set z-index
          self._pushOverlay();
      
          if (self.returnFocus === returnFocus.ON) {
            // Store the element that currently has focus, or the element that was passed to returnFocusTo()
            self._elementToFocusWhenHidden = self._elementToFocusWhenHidden || (document.activeElement === document.body ? null : document.activeElement);
          }
        }
        else {
          // Release zIndex
          self._popOverlay();
      
          if (self.returnFocus === returnFocus.ON && self._elementToFocusWhenHidden) {
            // Return focus, ignoring tab capture if it's an overlay
            self._elementToFocusWhenHidden._ignoreTabCapture = true;
            self._elementToFocusWhenHidden.focus();
            self._elementToFocusWhenHidden._ignoreTabCapture = false;
          }
        }
      }
      
      // Don't force reflow
      window.requestAnimationFrame(() => {
        
        // Keep it silenced
        self._silenced = silenced;
        
        if (open) {
          if (self.trapFocus === trapFocus.ON) {
            // Make sure tab capture elements are positioned correctly
            if (
              // Tab capture elements are no longer at the bottom
            self._elements.topTabCapture !== self.firstElementChild ||
            self._elements.bottomTabCapture !== self.lastElementChild ||
            // Tab capture elements have been separated
            self._elements.bottomTabCapture.previousElementSibling !== self._elements.intermediateTabCapture
            ) {
              self.insertBefore(self._elements.intermediateTabCapture, self.firstElementChild);
              self.appendChild(self._elements.intermediateTabCapture);
              self.appendChild(self._elements.bottomTabCapture);
            }
          }
    
          // The default style should be display: none for overlays
          // Show ourselves first for centering calculations etc
          self.style.display = 'block';
          self.classList.add('is-open');
  
          const openComplete = () => {
            if (self.open) {
              self._debounce(() => {
                self.trigger('coral-overlay:open');
                self._silenced = false;
              });
            }
          };
  
          if (self._overlayAnimationTime) {
            // Wait for animation to complete
            commons.transitionEnd(self, openComplete);
          }
          else {
            // Execute immediately
            openComplete();
          }
    
          // Focus on the overlay itself, announcing it
          // Pressing the tab key will then focus on the next focusable element inside of it
          if (self.focusOnShow === focusOnShow.ON) {
            self.focus();
          }
          else if (self.focusOnShow !== focusOnShow.OFF) {
            const selectedElement = (self.focusOnShow instanceof HTMLElement) ? self.focusOnShow : self.querySelector(self.focusOnShow);
            if (selectedElement) {
              selectedElement.focus();
            }
          }
        }
        else {
          // Fade out
          self.classList.remove('is-open');
    
          const closeComplete = () => {
            if (!self.open) {
              // Hide self
              self.style.display = 'none';
              
              self._debounce(function() {
                self.trigger('coral-overlay:close');
                self._silenced = false;
              });
            }
          };
    
          if (self._overlayAnimationTime) {
            // Wait for animation to complete
            commons.transitionEnd(self, closeComplete);
          }
          else {
            // Execute immediately
            closeComplete();
          }
        }
      });
    }
  }
  
  /** @private */
  _debounce(f) {
    // Used to avoid triggering open/close event continuously
    window.clearTimeout(this._debounceId);
    this._debounceId = window.setTimeout(function() {
      f()
    }, 10);
  }
  
  /**
   Check if this overlay is the topmost.
   
   @protected
   @memberof Coral.mixin.overlay#
   */
  _isTopOverlay() {
    const top = overlays.top();
    return top && top.instance === this;
  }
  
  /**
   Push the overlay to the top of the stack.
   
   @protected
   @memberof Coral.mixin.overlay#
   */
  _pushOverlay() {
    overlays.push(this);
  }
  
  /**
   Remove the overlay from the stack.
   
   @protected
   @memberof Coral.mixin.overlay#
   */
  _popOverlay() {
    overlays.pop(this);
    
    // Automatically hide the backdrop if required
    hideOrRepositionBackdrop();
  }
  
  /**
   Show the backdrop.
   
   @protected
   @memberof Coral.mixin.overlay#
   */
  _showBackdrop() {
    const overlay = overlays.get(this);
    
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
   @memberof Coral.mixin.overlay#
   */
  _hideBackdrop() {
    const overlay = overlays.get(this);
    
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
   @memberof Coral.mixin.overlay#
   */
  _handleTabCaptureFocus(event) {
    // Avoid moving around if we're trying to focus on coral-tabcapture
    if (this._ignoreTabCapture) {
      this._ignoreTabCapture = false;
      return;
    }
    
    // Focus on the correct tabbable element
    const target = event.target;
    const which = (target === this._elements.intermediateTabCapture ? 'first' : 'last');
    
    this._focusOn(which);
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
      tabTarget = Array.prototype.filter.call(this.querySelectorAll(commons.TABBABLE_ELEMENT_SELECTOR), function(item) {
        return item.offsetParent !== null && !item.hasAttribute('coral-tabcapture');
      })[which === 'first' ? 'shift' : 'pop']();
      
      if (tabTarget) {
        tabTarget.focus();
      }
    }
    else {
      this.focus();
    }
  }
  
  /**
   Open the overlay and set the z-index accordingly.
   
   @returns {Coral.Component} this, chainable
   @memberof Coral.mixin.overlay#
   */
  show() {
    this.open = true;
    
    return this;
  }
  
  /**
   Close the overlay.
   
   @returns {Coral.Component} this, chainable
   @memberof Coral.mixin.overlay#
   */
  hide() {
    this.open = false;
  
    return this;
  }
  
  /**
   Set the element that focus should be returned to when the overlay is hidden.
   
   @param {HTMLElement} element
   The element to return focus to. This must be a DOM element, not a jQuery object or selector.
   
   @returns {Coral.Component} this, chainable
   @memberof Coral.mixin.overlay#
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
      tempVent.on('blur.afterFocus', function(event) {
      
        // Wait a frame before testing whether focus has moved to an open overlay or to some other element.
        window.requestAnimationFrame(function() {
          // If overlay remains open, don't remove tabindex event handler until after it has been closed
          const top = overlays.top();
          if (top && top.instance.contains(document.activeElement)) {
            return;
          }
          tempVent.off('blur.afterFocus');
          event.matchedTarget.removeAttribute('tabindex');
        });
      }, true);
    }
  
    this._elementToFocusWhenHidden = element;
    return this;
  }
  
  // Map attributes with properties
  get _attributes() {
    return {
      trapfocus: 'trapFocus',
      returnfocus: 'returnFocus',
      focusonshow: 'focusOnShow'
    };
  }
  
  // Expose enums
  static get trapFocus() {return trapFocus;}
  static get returnFocus() {return returnFocus;}
  static get focusOnShow() {return focusOnShow;}
  // Expose const
  static get FADETIME() {return FADETIME;}
  
  static get observedAttributes() {
    return [
      'trapfocus',
      'trapFocus',
      'returnfocus',
      'returnFocus',
      'focusonshow',
      'focusOnShow',
      'open'
    ];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    if (!this.hasAttribute('trapfocus')) {this.trapFocus = this.trapFocus;}
    if (!this.hasAttribute('returnfocus')) {this.returnFocus = this.returnFocus;}
    if (!this.hasAttribute('focusonshow')) {this.focusOnShow = this.focusOnShow;}
    
    if (this.open) {
      this._pushOverlay();
    
      if (this._showBackdropOnAttached) {
        // Show the backdrop again
        this._showBackdrop();
      }
    }
  }
  
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
   Called when the overlay is clicked.
   
   @function backdropClickedCallback
   @memberof Coral.mixin.overlay#
   @protected
   */
  
  /**
   Triggerred before the component is opened with <code>show()</code> or <code>instance.open = true</code>.
   
   @event Coral.mixin.overlay#coral-overlay:beforeopen
   
   @param {Object} event
   Event object.
   @param {Function} event.preventDefault
   Call to stop the overlay from opening.
   */
  
  /**
   Triggerred after the overlay is opened with <code>show()</code> or <code>instance.open = true</code>
   
   @event Coral.mixin.overlay#coral-overlay:open
   
   @param {Object} event
   Event object.
   */
  
  /**
   Triggerred before the component is closed with <code>hide()</code> or <code>instance.open = false</code>.
   
   @event Coral.mixin.overlay#coral-overlay:beforeclose
   
   @param {Object} event
   Event object.
   @param {Function} event.preventDefault
   Call to stop the overlay from closing.
   */
  
  /**
   Triggerred after the component is closed with <code>hide()</code> or <code>instance.open = false</code>
   
   @event Coral.mixin.overlay#coral-overlay:close
   
   @param {Object} event
   Event object.
   */
};

export default Overlay;
