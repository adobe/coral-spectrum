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

import resizer from '../templates/resizer';

/**
 The Coral utility belt.
 @namespace
 */
const commons = {};

/**
 Copy the properties from all provided objects into the first object.
 
 @param {Object} dest
 The object to copy properties to
 @param {...Object} source
 An object to copy properties from. Additional objects can be passed as subsequent arguments.
 
 @returns {Object}
 The destination object, <code>dest</code>
 
 @memberof Coral.commons
 @static
 */
commons.extend = function() {
  'use strict';
  var dest = arguments[0];
  for (var i = 1, ni = arguments.length; i < ni; i++) {
    var source = arguments[i];
    for (var prop in source) {
      dest[prop] = source[prop];
    }
  }
  return dest;
};

/**
 Copy the properties from the source object to the destination object, but calls the callback if the property is
 already present on the destination object.
 
 @param {Object} dest
 The object to copy properties to
 @param {...Object} source
 An object to copy properties from. Additional objects can be passed as subsequent arguments.
 @param {Coral.commons~handleCollision} [handleCollision]
 Called if the property being copied is already present on the destination.
 The return value will be used as the property value.
 
 @returns {Object}
 The destination object, <code>dest</code>
 
 @memberof Coral.commons
 @static
 */
commons.augment = function() {
  'use strict';
  var dest = arguments[0];
  var handleCollision;
  var argCount = arguments.length;
  var lastArg = arguments[argCount - 1];
  
  if (typeof lastArg === 'function') {
    handleCollision = lastArg;
    
    // Don't attempt to augment using the last argument
    argCount--;
  }
  
  for (var i = 1; i < argCount; i++) {
    var source = arguments[i];
    
    for (var prop in source) {
      if (typeof dest[prop] !== 'undefined') {
        if (typeof handleCollision === 'function') {
          // Call the handleCollision callback if the property is already present
          var ret = handleCollision(dest[prop], source[prop], prop, dest, source);
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
};

/**
 Called when a property already exists on the destination object.
 
 @callback Coral.commons~handleCollision
 
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
 Return a new object with the swapped keys and values of the provided object.
 
 @param {Object} obj
 The object to copy.
 
 @returns {Object}
 An object with its keys as the values and values as the keys of the source object.
 
 @memberof Coral.commons
 @static
 */
commons.swapKeysAndValues = function(obj) {
  'use strict';
  
  var map = {};
  for (var key in obj) {
    map[obj[key]] = key;
  }
  return map;
};

/**
 Execute the provided callback on the next animation frame.
 @function
 @param {Function} callback
 The callback to execute.
 @deprecated
 */
commons.nextFrame = function(callback) {
  console.warn('Coral.commons.nextFrame has been deprecated. Please use window.requestAnimationFrame instead.');
  
  return window.requestAnimationFrame(function() {
    if (typeof callback === 'function') {
      callback();
    }
  })
};


/**
 Execute the callback once a CSS transition has ended.
 
 @callback Coral.commons~transitionEndCallback
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
 Execute the provided callback once a CSS transition has ended. This method listens for the next transitionEnd event on
 the given DOM element. It cannot be used to listen continuously on transitionEnd events.
 
 @param {HTMLElement} element
 The DOM element that is affected by the CSS transition.
 @param {Coral.commons~transitionEndCallback} callback
 The callback to execute.
 */
commons.transitionEnd = function(element, callback) {
  'use strict';
  
  var propertyName;
  var hasTransitionEnded = false;
  var transitionEndEventName = null;
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'MSTransition': 'msTransitionEnd'
  };
  var transitionEndTimeout = null;
  var onTransitionEnd = function(event) {
    var transitionStoppedByTimeout = (typeof event === 'undefined');
    
    if (!hasTransitionEnded) {
      hasTransitionEnded = true;
      
      clearTimeout(transitionEndTimeout);
      
      // Remove event listener (if any was used by the current browser)
      element.removeEventListener(transitionEndEventName, onTransitionEnd);
      
      // Call callback with specified element
      callback({
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
    // Register on transitionEnd event
    element.addEventListener(transitionEndEventName, onTransitionEnd);
    
    // Catch IE 10/11 sometimes not performing the transition at all => set timeout for this case
    transitionEndTimeout = setTimeout(onTransitionEnd, parseFloat(element.style.transitionDuration || 0) + 100);
  }
};

/**
 Execute the provided callback when all web components are ready.
 
 @param {HTMLElement} parent
 The element to check readiness of
 @param {Function} callback
 The callback to execute.
 */
(function() {
  'use strict';
  
  /**
   Execute the callback once a component and sub-components are [ready]{@link Coral.commons.ready}.
   
   @callback Coral.commons~readyCallback
   @param {HTMLElement} element
   The element that is ready.
   */
  
  /**
   Checks, if a Coral components and all nested components are ready, which means their
   <code>_initialize</code> and <code>_render</code> methods have been called. If so, the provided callback function is executed
   
   @param {HTMLElement} element
   The element that should be watched for ready events.
   @param {Coral.commons~readyCallback} callback
   The callback to call when all components are ready.
   @deprecated
   */
  commons.ready = function(element, callback) {
    console.warn('Coral.commons.ready has been deprecated. Please use window.customElements.whenDefined(name) instead.');
    
    if (typeof element === 'function') {
      callback = element;
    }
    
    // @todo use ':not(:defined)' once supported to detect coral not yet defined custom elements
    window.setTimeout(() => {
      callback((element instanceof HTMLElement && element) || this);
    });
  };
}());

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
commons.setSubProperty = function(root, path, obj) {
  'use strict';
  
  var nsParts = path.split('.');
  var curObj = root;
  
  if (nsParts.length === 1) {
    // Assign immediately
    curObj[path] = obj;
    return;
  }
  
  // Make sure we can assign at the requested location
  while (nsParts.length > 1) {
    var part = nsParts.shift();
    if (curObj[part]) {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.setSubProperty: could not set ' + path + ', part ' + part + ' not found');
    }
  }
  
  // Do the actual assignment
  curObj[nsParts.shift()] = obj;
};

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
commons.getSubProperty = function(root, path) {
  'use strict';
  
  var nsParts = path.split('.');
  var curObj = root;
  
  if (nsParts.length === 1) {
    // Return property immediately
    return curObj[path];
  }
  
  // Make sure we can assign at the requested location
  while (nsParts.length) {
    var part = nsParts.shift();
    // The property might be undefined, and that's OK if it's the last part
    if (nsParts.length === 0 || typeof curObj[part] !== 'undefined') {
      curObj = curObj[part];
    }
    else {
      throw new Error('Coral.commons.getSubProperty: could not get ' + path + ', part ' + part + ' not found');
    }
  }
  
  return curObj;
};

(function() {
  /* jshint validthis: true */
  'use strict';
  
  /**
   Apply a mixin to the given object.
   
   @param {Object}
     The object to apply the mixin to.
   @param {Object|Function} mixin
   The mixin to apply.
   @param {Object} options
   An objcet to pass to functional mixins.
   
   @ignore
   */
  function applyMixin(target, mixin, options) {
    var mixinType = typeof mixin;
    
    if (mixinType === 'function') {
      mixin(target, options);
    }
    else if (mixinType === 'object' && mixin !== null) {
      commons.extend(target, mixin);
    }
    else {
      throw new Error('Coral.commons.mixin: Cannot mix in ' + mixinType + ' to ' + target.toString());
    }
  }
  
  /**
   Mix a set of mixins to a target object.
   
   @param {Object} target
   The target prototype or instance on which to apply mixins.
   @param {Object|Coral~mixin|Array<Object|Coral~mixin>} mixins
   A mixin or set of mixins to apply.
   @param {Object} options
   An object that will be passed to functional mixins as the second argument (options).
   */
  commons.mixin = function(target, mixins, options) {
    if (Array.isArray(mixins)) {
      for (var i = 0; i < mixins.length; i++) {
        applyMixin(target, mixins[i], options);
      }
    }
    else {
      applyMixin(target, mixins, options);
    }
  };
  
  /**
   A functional mixin.
   
   @callback Coral~mixin
   
   @param {Object} target
   The target prototype or instance to apply the mixin to.
   @param {Object} options
   Options for this mixin.
   @param {Coral~PropertyDescriptor.properties} options.properties
   The properties object as passed to {@link Coral.register}. This can be modified in place.
   */
}());

(function() {
  'use strict';
  
  var nextID = 0;
  
  /**
   Get a unique ID.
   
   @memberof Coral.commons
   @static
   @returns {String} unique identifier.
   */
  commons.getUID = function() {
    return 'coral-id-' + (nextID++);
  };
}());

(function() {
  'use strict';
  
  function noop() {
  }
  
  function returnFirst(first, second) {
    return function returnFirst() {
      var ret = first.apply(this, arguments);
      second.apply(this, arguments);
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
   Call all of the provided functions, in order, returning the return value of the specified function.
   
   @param {...Function} func
   A function to call
   @param {Number} [nth=0]
   A zero-based index indicating the noth argument to return the value of.
   If the nth argument is not a function, <code>null</code> will be returned.
   
   @returns {Function} The aggregate function.
   */
  commons.callAll = function() {
    var nth = arguments[arguments.length - 1];
    if (typeof nth !== 'number') {
      nth = 0;
    }
    
    // Get the function whose value we should return
    var funcToReturn = arguments[nth];
    
    // Only use arguments that are functions
    var functions = Array.prototype.filter.call(arguments, isFunction);
    
    if (functions.length === 2 && nth === 0) {
      // Most common usecase: two valid functions passed
      return returnFirst(functions[0], functions[1]);
    }
    else if (functions.length === 1) {
      // Common usecase: one valid function passed
      return functions[0];
    }
    else if (functions.length === 0) {
      // Fail case: no valid functions passed
      return noop;
    }
    
    if (typeof funcToReturn !== 'function') {
      // If the argument at the provided index wasn't a function, just return the value of the first valid function
      funcToReturn = functions[0];
    }
    
    return function() {
      var finalRet;
      var ret;
      var func;
      
      // Skip first arg
      for (var i = 0; i < functions.length; i++) {
        func = functions[i];
        ret = func.apply(this, arguments);
        
        // Store return value of desired function
        if (func === funcToReturn) {
          finalRet = ret;
        }
      }
      return finalRet;
    };
  };
}());

(function() {
  'use strict';
  
  // Adaptation of http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
  function ResizeEventTrigger() {
    // User agent toggles
    var isIE = navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/Edge/);
    this.useNativeResizeSupport = document.attachEvent && !isIE;
  }
  
  var resizeListenerObject;
  function getResizeListenerObject() {
    if (!resizeListenerObject) {
      resizeListenerObject = resizer().firstElementChild;
    }
    return resizeListenerObject.cloneNode(true);
  }
  
  ResizeEventTrigger.prototype._addTriggerElement = function(element, listenerFunction) {
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    var obj = getResizeListenerObject();
    element._resizeTriggerElement = obj;
    
    obj.onload = function(e) {
      var contentDocument = this.contentDocument;
      var defaultView = contentDocument.defaultView;
      var documentElement = contentDocument.documentElement;
      
      defaultView._originalElement = element;
      defaultView._listenerFunction = listenerFunction;
      defaultView.addEventListener('resize', listenerFunction);
      
      // CUI-6523 Set lang and document title to avoid automated accessibility testing failures.
      documentElement.lang = 'en';
      contentDocument.title = '\u200b';
      
      // Call one initial resize for all browsers
      // Required, as in WebKit this callback adding the event listeners is called too late. Layout has already finished.
      listenerFunction({
        target: defaultView
      });
    };
    
    obj.type = 'text/html';
    
    // InternetExplorer is picky about the order of "obj.data = ..." and element.appendChild(obj) so make sure to get it right
    element.appendChild(obj);
    obj.data = 'about:blank';
  };
  
  ResizeEventTrigger.prototype._removeTriggerElement = function(element) {
    if (!element._resizeTriggerElement) {
      return;
    }
    
    var triggerElement = element._resizeTriggerElement;
    
    // processObjectLoadedEvent might never have been called
    if (triggerElement.contentDocument && triggerElement.contentDocument.defaultView) {
      triggerElement.contentDocument.defaultView.removeEventListener('resize', triggerElement.contentDocument.defaultView._listenerFunction);
    }
    
    element._resizeTriggerElement = !element.removeChild(element._resizeTriggerElement);
  };
  
  ResizeEventTrigger.prototype._fireResizeListeners = function(event) {
    var targetElement = event.target || event.srcElement;
    
    var trigger = targetElement._originalElement || targetElement;
    trigger._resizeListeners.forEach(function(fn) {
      fn.call(trigger, event);
    });
  };
  
  /**
   Adds a resize listener to the given element.
   
   @param {HTMLElement} element
   The element to add the resize event to.
   @param {Function} callback
   The resize callback.
   */
  ResizeEventTrigger.prototype.addResizeListener = function(element, callback) {
    if (!element) {
      return;
    }
    
    if (this.useNativeResizeSupport) {
      element.addEventListener('resize', callback);
      return;
    }
    
    // The array may still exist, so we check its length too
    if (!element._resizeListeners || element._resizeListeners.length === 0) {
      element._resizeListeners = [];
      this._addTriggerElement(element, this._fireResizeListeners.bind(this));
    }
    
    element._resizeListeners.push(callback);
  };
  
  /**
   Removes a resize listener from the given element.
   
   @param {HTMLElement} element
   The element to remove the resize event from.
   @param {Function} callback
   The resize callback.
   */
  ResizeEventTrigger.prototype.removeResizeListener = function(element, callback) {
    if (!element) {
      return;
    }
    
    if (this.useNativeResizeSupport) {
      element.removeEventListener('resize', callback);
      return;
    }
    
    // resizeListeners and resizeTrigger must be present
    if (!element._resizeListeners || !element._resizeTriggerElement) {
      return;
    }
    
    var fnIndex = element._resizeListeners.indexOf(callback);
    
    // Don't remove the function unless it is already registered
    if (fnIndex === -1) {
      return;
    }
    
    element._resizeListeners.splice(fnIndex, 1);
    
    if (!element._resizeListeners.length) {
      this._removeTriggerElement(element);
    }
  };
  
  /**
   Bind static methods
   */
  var resizeEvent = new ResizeEventTrigger();
  commons.addResizeListener = resizeEvent.addResizeListener.bind(resizeEvent);
  commons.removeResizeListener = resizeEvent.removeResizeListener.bind(resizeEvent);
}());

(function() {
  'use strict';
  
  var focusableElements = [
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
  
  /**
   Focusable elements are defined by https://www.w3.org/TR/html5/editing.html#focus-management.
   Caution: the selector doesn't verify if elements are visible.
   
   @const
   @type {String}
   
   @memberof Coral.commons
   @static
   */
  commons.FOCUSABLE_ELEMENT_SELECTOR = focusableElements.join(',');
  
  focusableElements.push('[tabindex]');
  
  /**
   Tabbable elements are defined by https://www.w3.org/TR/html5/editing.html#sequential-focus-navigation-and-the-tabindex-attribute.
   Caution: the selector doesn't verify if elements are visible.
   
   @const
   @type {String}
   
   @memberof Coral.commons
   @static
   */
  commons.TABBABLE_ELEMENT_SELECTOR = focusableElements.join(':not([tabindex="-1"]),');
}());


export default commons;
