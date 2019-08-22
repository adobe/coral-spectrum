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

import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver';

// Used for unique IDs
let nextID = 0;

// Remove namespace from global options
const cleanOption = (name) => {
  name = name.replace('coral', '');
  return name.charAt(0).toLowerCase() + name.slice(1);
};

// Threshold time in milliseconds that the setTimeout will wait for the transitionEnd event to be triggered.
const TRANSITION_DURATION_THRESHOLD = 100;

// Based on jQuery's :focusable selector
const FOCUSABLE_ELEMENTS = [
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'summary',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]'
];

// To support Coral.commons.ready and differentiate lightweight tags from defined elements
const CORAL_COMPONENTS = [
  'coral-accordion',
  'coral-accordion-item',
  'coral-accordion-item-content',
  'coral-actionbar',
  'coral-actionbar-container',
  'coral-actionbar-item',
  'coral-actionbar-primary',
  'coral-actionbar-secondary',
  'coral-alert',
  'coral-alert-header',
  'coral-alert-content',
  'coral-alert-footer',
  'a[is="coral-anchorbutton"]',
  'coral-autocomplete',
  'coral-autocomplete-item',
  'coral-autocomplete-item',
  'coral-banner',
  'coral-banner-content',
  'coral-banner-header',
  'button[is="coral-button"]',
  'coral-buttongroup',
  'coral-calendar',
  'coral-card',
  'coral-card-content',
  'coral-card-context',
  'coral-card-description',
  'coral-card-property',
  'coral-card-propertylist',
  'coral-card-subtitle',
  'coral-card-title',
  'coral-charactercount',
  'coral-checkbox',
  'coral-clock',
  'coral-coachmark',
  'coral-colorinput',
  'coral-colorinput-colorproperties',
  'coral-colorinput-item',
  'coral-colorinput-slider',
  'coral-colorinput-swatch',
  'coral-colorinput-swatches',
  'coral-columnview',
  'coral-columnview-column',
  'coral-columnview-column-content',
  'coral-columnview-item',
  'coral-columnview-item-content',
  'coral-columnview-item-thumbnail',
  'coral-columnview-preview',
  'coral-columnview-preview-content',
  'coral-cyclebutton',
  'coral-cyclebutton-action',
  'coral-cyclebutton-item',
  'coral-datepicker',
  'coral-dialog',
  'coral-dialog-header',
  'coral-dialog-content',
  'coral-dialog-footer',
  'coral-drawer',
  'coral-fileupload',
  'coral-icon',
  'coral-list',
  'coral-selectlist',
  'coral-buttonlist',
  'coral-anchorlist',
  'coral-list-item',
  'coral-list-item-content',
  'coral-selectlist-item',
  'coral-selectlist-group',
  'a[is="coral-anchorlist-item"]',
  'button[is="coral-buttonlist-item"]',
  'coral-masonry',
  'coral-masonry-item',
  'coral-multifield',
  'coral-multifield-item',
  'coral-numberinput',
  'coral-overlay',
  'coral-panel',
  'coral-panelstack',
  'coral-playground',
  'coral-popover',
  'coral-progress',
  'coral-quickactions',
  'coral-radio',
  'coral-search',
  'coral-select',
  'coral-select-item',
  'coral-shell',
  'coral-shell-header',
  'coral-shell-help',
  'a[is="coral-shell-homeanchor"]',
  'a[is="coral-shell-help-item"]',
  'a[is="coral-shell-workspace"]',
  'a[is="coral-shell-solution"]',
  'coral-shell-menu',
  'coral-shell-menubar',
  'coral-shell-menubar-item',
  'coral-shell-organization',
  'coral-shell-orgswitcher',
  'coral-shell-solution',
  'coral-shell-solutions',
  'coral-shell-solutionswitcher',
  'coral-shell-suborganization',
  'coral-shell-user',
  'coral-shell-workspaces',
  'coral-slider',
  'coral-slider-item',
  'coral-rangedslider',
  'coral-splitbutton',
  'coral-status',
  'coral-step',
  'coral-steplist',
  'coral-step-label',
  'coral-switch',
  'table[is="coral-table"]',
  'thead[is="coral-table-head"]',
  'tbody[is="coral-table-body"]',
  'tfoot[is="coral-table-foot"]',
  'tr[is="coral-table-row"]',
  'td[is="coral-table-cell"]',
  'th[is="coral-table-headercell"]',
  'col[is="coral-table-column"]',
  'coral-tab',
  'coral-tab-label',
  'coral-tablist',
  'coral-tabview',
  'coral-taglist',
  'coral-tag',
  'textarea[is="coral-textarea"]',
  'input[is="coral-textfield"]',
  'coral-toast',
  'coral-toast-content',
  'coral-tooltip',
  'coral-tooltip-content',
  'coral-tree',
  'coral-tree-item',
  'coral-wait',
  'coral-wizardview'
];

/**
 Converts CSS time to milliseconds. It supports both s and ms units. If the provided value has an unrecogenized unit,
 zero will be returned.
 
 @private
 @param {String} time
 The time string to convert to milliseconds.
 @returns {Number} the time in milliseconds.
 */
function cssTimeToMilliseconds(time) {
  const num = parseFloat(time, 10);
  let unit = time.match(/m?s/);
  
  if (unit) {
    unit = unit[0];
  }
  
  if (unit === 's') {
    return num * 1000;
  }
  else if (unit === 'ms') {
    return num;
  }
  
  // unrecognized unit, so we return 0
  return 0;
}

/**
 @private
 
 @param first
 @param second
 @return {Function}
 */
function returnFirst(first, second) {
  // eslint-disable-next-line func-names
  return function(...args) {
    const ret = first.apply(this, args);
    second.apply(this, args);
    return ret;
  };
}

/**
 Check if the provided object is a function
 
 @ignore
 
 @param {*} object
 The object to test
 
 @returns {Boolean} Whether the provided object is a function.
 */
function isFunction(object) {
  return typeof object === 'function';
}

/**
 Utility belt.
 */
class Commons {
  /** @ignore */
  constructor() {
    // Create a Map to link elements to observe to their resize event callbacks
    this._resizeObserverMap = new Map();
    
    this._resizeObserver = new ResizeObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        const observedElement = entries[i].target;
        const allCallbacks = this._resizeObserverMap.get(observedElement);
        if (allCallbacks) {
          for (let j = 0; j < allCallbacks.length; j++) {
            allCallbacks[j].call(observedElement);
          }
        }
      }
    });
    
    const focusableElements = FOCUSABLE_ELEMENTS.slice();
    this._focusableElementsSelector = focusableElements.join(',');
  
    focusableElements.push('[tabindex]:not([tabindex="-1"])');
    this._tabbableElementsSelector = focusableElements.join(':not([tabindex="-1"]),');
    
    this._coralSelector = CORAL_COMPONENTS.join(',');
  
    // @IE11
    if (!document.currentScript) {
      const scripts = document.getElementsByTagName('script');
      this._script = scripts[scripts.length - 1];
    }
    else {
      this._script = document.currentScript;
    }
  }
  
  /**
   Returns Coral global options retrieved on the <code><script></code> data attributes including:
   - <code>[data-coral-icons]</code>: source folder of the SVG icons. If the icon collections have a custom name,
   they have to be loaded manually using {@link Icon.load}.
   - <code>[data-coral-icons-external]</code>: Whether SVG icons are always referenced as external resource. Possible values are "on" (default) or "off".
   - <code>[data-coral-typekit]</code>: custom typekit id used to load the fonts.
   - <code>[data-coral-logging]</code>: defines logging level. Possible values are "on" (default) or "off".
   
   @returns {Object}
   The global options object.
   */
  get options() {
    const options = {};
    const props = this._script.dataset;
    for (const key in props) {
      // Detect Coral namespaced options
      if (key.indexOf('coral') === 0) {
        options[cleanOption(key)] = props[key];
      }
    }
    
    return options;
  }
  
  /**
   Utility function for logging.
   
   @param {String} level
   Logging level
   @param {String} args
   Logging message
   */
  _log(level, ...args) {
    if (console[level] && this.options.logging !== 'off') {
      console[level].apply(null, args);
    }
  }
  
  /**
   Copy the properties from all provided objects into the first object.
   
   @param {Object} dest
   The object to copy properties to
   @param {...Object} source
   An object to copy properties from. Additional objects can be passed as subsequent arguments.
   
   @returns {Object}
   The destination object, <code>dest</code>
   */
  extend(...args) {
    const dest = args[0];
    for (let i = 1, ni = args.length; i < ni; i++) {
      const source = args[i];
      for (const prop in source) {
        dest[prop] = source[prop];
      }
    }
    return dest;
  }
  
  /**
   Copy the properties from the source object to the destination object, but calls the callback if the property is
   already present on the destination object.
   
   @param {Object} dest
   The object to copy properties to
   @param {...Object} source
   An object to copy properties from. Additional objects can be passed as subsequent arguments.
   @param {CommonsHandleCollision} [handleCollision]
   Called if the property being copied is already present on the destination.
   The return value will be used as the property value.
   
   @returns {Object}
   The destination object, <code>dest</code>
   */
  augment(...args) {
    const dest = args[0];
    let handleCollision;
    let argCount = args.length;
    const lastArg = args[argCount - 1];
    
    if (typeof lastArg === 'function') {
      handleCollision = lastArg;
      
      // Don't attempt to augment using the last argument
      argCount--;
    }
    
    for (let i = 1; i < argCount; i++) {
      const source = args[i];
      
      for (const prop in source) {
        if (typeof dest[prop] !== 'undefined') {
          if (typeof handleCollision === 'function') {
            // Call the handleCollision callback if the property is already present
            const ret = handleCollision(dest[prop], source[prop], prop, dest, source);
            if (typeof ret !== 'undefined') {
              dest[prop] = ret;
            }
          }
          // Otherwise, do nothing
        }
        else {
          dest[prop] = source[prop];
        }
      }
    }
    
    return dest;
  }
  
  /**
   Return a new object with the swapped keys and values of the provided object.
   
   @param {Object} obj
   The object to copy.
   
   @returns {Object}
   An object with its keys as the values and values as the keys of the source object.
   */
  swapKeysAndValues(obj) {
    const map = {};
    for (const key in obj) {
      map[obj[key]] = key;
    }
    return map;
  }
  
  /**
   Execute the provided callback on the next animation frame.
   
   @param {Function} onNextFrame
   The callback to execute.
   */
  nextFrame(onNextFrame) {
    return window.requestAnimationFrame(() => {
      if (typeof onNextFrame === 'function') {
        onNextFrame();
      }
    });
  }
  
  /**
   Execute the provided callback once a CSS transition has ended. This method listens for the next transitionEnd event
   on the given DOM element. In case the provided element does not have a transition defined, the callback will be
   called in the next macrotask to allow a normal application execution flow. It cannot be used to listen continuously
   on transitionEnd events.
   @param {HTMLElement} element
   The DOM element that is affected by the CSS transition.
   @param {CommonsTransitionEndCallback} onTransitionEndCallback
   The callback to execute.
   */
  transitionEnd(element, onTransitionEndCallback) {
    let propertyName;
    let hasTransitionEnded = false;
    let transitionEndEventName = null;
    const transitions = {
      transition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      MSTransition: 'msTransitionEnd'
    };
    
    let transitionEndTimeout = null;
    const onTransitionEnd = (event) => {
      const transitionStoppedByTimeout = typeof event === 'undefined';
      
      if (!hasTransitionEnded) {
        hasTransitionEnded = true;
        
        clearTimeout(transitionEndTimeout);
        
        // Remove event listener (if any was used by the current browser)
        element.removeEventListener(transitionEndEventName, onTransitionEnd);
        
        // Call callback with specified element
        onTransitionEndCallback({
          target: element,
          cssTransitionSupported: true,
          transitionStoppedByTimeout: transitionStoppedByTimeout
        });
      }
    };
    
    // Find transitionEnd event name used by browser
    for (propertyName in transitions) {
      if (element.style[propertyName] !== undefined) {
        transitionEndEventName = transitions[propertyName];
        break;
      }
    }
    
    if (transitionEndEventName !== null) {
      let timeoutDelay = 0;
      // Gets the animation time (in milliseconds) using the computed style
      const transitionDuration = cssTimeToMilliseconds(window.getComputedStyle(element).transitionDuration);
      
      // We only setup the event listener if there is a valid transition
      if (transitionDuration !== 0) {
        // Register on transitionEnd event
        element.addEventListener(transitionEndEventName, onTransitionEnd);
        
        // As a fallback we use the transitionDuration plus a threshold. This can happen in IE10/11 where
        // transitionEnd events are sometimes skipped
        timeoutDelay = transitionDuration + TRANSITION_DURATION_THRESHOLD;
      }
      
      // Fallback in case the event does not trigger (IE10/11) or if the element does not have a valid transition
      transitionEndTimeout = window.setTimeout(onTransitionEnd, timeoutDelay);
    }
  }
  
  /**
   Checks if Coral components and all nested Coral components are defined as Custom Elements.
   
   @param {HTMLElement} element
   The element that should be watched.
   @param {CommonsReadyCallback} onDefined
   The callback to call when all components are ready.
   
   @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Custom_Elements
   */
  ready(element, onDefined) {
    let root = element;
    
    if (typeof element === 'function') {
      onDefined = element;
      root = document.body;
    }
    
    if (!root) {
      root = document.body;
    }
    
    if (!(root instanceof HTMLElement)) {
      // commons.ready should not be blocking by default
      onDefined(root);
      return;
    }
    
    // @todo use ':not(:defined)' once supported ?
    const elements = root.querySelectorAll(this._coralSelector);
    
    // Holds promises that resolve when the elements is defined
    const promises = [];
    
    // Don't forget to check root
    if (root !== document.body && !root._componentReady && root.matches(this._coralSelector)) {
      const name = (root.getAttribute('is') || root.tagName).toLowerCase();
      promises.push(window.customElements.whenDefined(name));
    }
    
    // Check all descending elements
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!el._componentReady) {
        const name = (el.getAttribute('is') || el.tagName).toLowerCase();
        promises.push(window.customElements.whenDefined(name));
      }
    }
    
    // Call callback once all defined
    if (promises.length) {
      Promise.all(promises)
        .then(() => {
          onDefined(element instanceof HTMLElement && element || window);
        })
        .catch((err) => {
          console.error(err);
        });
    }
    else {
      // Call callback by default if all defined already
      onDefined(element instanceof HTMLElement && element || window);
    }
  }
  
  /**
   Assign an object given a nested path
   
   @param {Object} root
   The root object on which the path should be traversed.
   @param {String} path
   The path at which the object should be assignment.
   @param {String} obj
   The object to assign at path.
   
   @throws Will throw an error if the path is not present on the object.
   */
  setSubProperty(root, path, obj) {
    const nsParts = path.split('.');
    let curObj = root;
    
    if (nsParts.length === 1) {
      // Assign immediately
      curObj[path] = obj;
      return;
    }
    
    // Make sure we can assign at the requested location
    while (nsParts.length > 1) {
      const part = nsParts.shift();
      if (curObj[part]) {
        curObj = curObj[part];
      }
      else {
        throw new Error(`Coral.commons.setSubProperty: could not set ${path}, part ${part} not found`);
      }
    }
    
    // Do the actual assignment
    curObj[nsParts.shift()] = obj;
  }
  
  /**
   Get the value of the property at the given nested path.
   
   @param {Object} root
   The root object on which the path should be traversed.
   @param {String} path
   The path of the sub-property to return.
   
   @returns {*}
   The value of the provided property.
   
   @throws Will throw an error if the path is not present on the object.
   */
  getSubProperty(root, path) {
    const nsParts = path.split('.');
    let curObj = root;
    
    if (nsParts.length === 1) {
      // Return property immediately
      return curObj[path];
    }
    
    // Make sure we can assign at the requested location
    while (nsParts.length) {
      const part = nsParts.shift();
      // The property might be undefined, and that's OK if it's the last part
      if (nsParts.length === 0 || typeof curObj[part] !== 'undefined') {
        curObj = curObj[part];
      }
      else {
        throw new Error(`Coral.commons.getSubProperty: could not get ${path}, part ${part} not found`);
      }
    }
    
    return curObj;
  }
  
  /**
   Apply a mixin to the given object.
   
   @param {Object} target
   The object to apply the mixin to.
   @param {Object|Function} mixin
   The mixin to apply.
   @param {Object} options
   An object to pass to functional mixins.
   */
  _applyMixin(target, mixin, options) {
    const mixinType = typeof mixin;
    
    if (mixinType === 'function') {
      mixin(target, options);
    }
    else if (mixinType === 'object' && mixin !== null) {
      this.extend(target, mixin);
    }
    else {
      throw new Error(`Coral.commons.mixin: Cannot mix in ${mixinType} to ${target.toString()}`);
    }
  }
  
  /**
   Mix a set of mixins to a target object.
   
   @private
   
   @param {Object} target
   The target prototype or instance on which to apply mixins.
   @param {Object|CoralMixin|Array<Object|CoralMixin>} mixins
   A mixin or set of mixins to apply.
   @param {Object} options
   An object that will be passed to functional mixins as the second argument (options).
   */
  mixin(target, mixins, options) {
    if (Array.isArray(mixins)) {
      for (let i = 0; i < mixins.length; i++) {
        this._applyMixin(target, mixins[i], options);
      }
    }
    else {
      this._applyMixin(target, mixins, options);
    }
  }
  
  /**
   Get a unique ID.
   
   @returns {String} unique identifier.
   */
  getUID() {
    return `coral-id-${nextID++}`;
  }
  
  /**
   Call all of the provided functions, in order, returning the return value of the specified function.
   
   @param {...Function} func
   A function to call
   @param {Number} [nth=0]
   A zero-based index indicating the noth argument to return the value of.
   If the nth argument is not a function, <code>null</code> will be returned.
   
   @returns {Function} The aggregate function.
   */
  callAll(...args) {
    let nth = args[args.length - 1];
    if (typeof nth !== 'number') {
      nth = 0;
    }
    
    // Get the function whose value we should return
    let funcToReturn = args[nth];
    
    // Only use arguments that are functions
    const functions = Array.prototype.filter.call(args, isFunction);
    
    if (functions.length === 2 && nth === 0) {
      // Most common usecase: two valid functions passed
      return returnFirst(functions[0], functions[1]);
    }
    else if (functions.length === 1) {
      // Common usecase: one valid function passed
      return functions[0];
    }
    else if (functions.length === 0) {
      return () => {
        // Fail case: no valid functions passed
      };
    }
    
    if (typeof funcToReturn !== 'function') {
      // If the argument at the provided index wasn't a function, just return the value of the first valid function
      funcToReturn = functions[0];
    }
    
    // eslint-disable-next-line func-names
    return function() {
      let finalRet;
      let ret;
      let func;
      
      // Skip first arg
      for (let i = 0; i < functions.length; i++) {
        func = functions[i];
        ret = func.apply(this, args);
        
        // Store return value of desired function
        if (func === funcToReturn) {
          finalRet = ret;
        }
      }
      return finalRet;
    };
  }
  
  /**
   Adds a resize listener to the given element.
   
   @param {HTMLElement} element
   The element to add the resize event to.
   @param {Function} onResize
   The resize callback.
   */
  // eslint-disable-next-line func-names
  addResizeListener(element, onResize) {
    // Map callback to element
    if (!this._resizeObserverMap.has(element)) {
      this._resizeObserverMap.set(element, []);
    }
    this._resizeObserverMap.get(element).push(onResize);
    
    // Observe element resize events
    this._resizeObserver.observe(element);
  }
  
  /**
   Removes a resize listener from the given element.
   
   @param {HTMLElement} element
   The element to remove the resize event from.
   @param {Function} onResize
   The resize callback.
   */
  // eslint-disable-next-line func-names
  removeResizeListener(element, onResize) {
    // Stop observing element resize events
    this._resizeObserver.unobserve(element);
    this._resizeObserver.disconnect(element);
    
    // Remove event from map
    const onResizeEvents = this._resizeObserverMap.get(element);
    if (onResizeEvents) {
      const index = onResizeEvents.indexOf(onResize);
      if (index !== -1) {
        onResizeEvents.splice(index, 1);
      }
    }
  }
  
  /**
   Caution: the selector doesn't verify if elements are visible.
   
   @type {String}
   @readonly
   @see https://www.w3.org/TR/html5/editing.html#focus-management
   */
  get FOCUSABLE_ELEMENT_SELECTOR() {
    return this._focusableElementsSelector;
  }
  
  /**
   Caution: the selector doesn't verify if elements are visible.
   
   @type {String}
   @readonly
   @see https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
   */
  get TABBABLE_ELEMENT_SELECTOR() {
    return this._tabbableElementsSelector;
  }
}

/**
 Called when a property already exists on the destination object.
 
 @typedef {function} CommonsHandleCollision
 
 @param {*} oldValue
 The value currently present on the destination object.
 @param {*} newValue
 The value on the destination object.
 @param {*} prop
 The property that collided.
 @param {*} dest
 The destination object.
 @param {*} source
 The source object.
 
 @returns {*} The value to use. If <code>undefined</code>, the old value will be used.
 */

/**
 Execute the callback once a CSS transition has ended.
 
 @typedef {function} CommonsTransitionEndCallback
 
 @param event
 The event passed to the callback.
 @param {HTMLElement} event.target
 The DOM element that was affected by the CSS transition.
 @param {Boolean} event.cssTransitionSupported
 Whether CSS transitions are supported by the browser.
 @param {Boolean} event.transitionStoppedByTimeout
 Whether the CSS transition has been ended by a timeout (should only happen as a fallback).
 */

/**
 Execute the callback once a component and sub-components are ready. See {@link Commons.ready}.
 
 @typedef {function} CommonsReadyCallback
 @param {HTMLElement} element
 The element that is ready.
 */

/**
 A functional mixin.
 
 @typedef {Object} CoralMixin
 
 @private
 
 @param {Object} target
 The target prototype or instance to apply the mixin to.
 @param {Object} options
 Options for this mixin.
 @param {Coral~PropertyDescriptor.properties} options.properties
 The properties object as passed to <code>Coral.register</code>. This can be modified in place.
 */

/**
 A utility belt.
 
 @type {Commons}
 */
const commons = new Commons();

export default commons;
