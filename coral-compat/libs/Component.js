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

import {events, keys, commons, Keys} from '../../coral-utils';

// Used to split events by type/target
var delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Enum value is referenced for speed
var ELEMENT_NODE = Node.ELEMENT_NODE;

/**
 Return the method corresponding to the method name or the function, if passed.

 @ignore
 */
function getListenerFromMethodNameOrFunction(obj, eventName, methodNameOrFunction) {
  // Try to get the method
  if (typeof methodNameOrFunction === 'function') {
    return methodNameOrFunction;
  } else if (typeof methodNameOrFunction === 'string') {
    if (!obj[methodNameOrFunction]) {
      throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
        ', method ' + methodNameOrFunction + ' not found');
    }

    var listener = obj[methodNameOrFunction];

    if (typeof listener !== 'function') {
      throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() +
        ', listener is a ' + (typeof listener) + ' but should be a function');
    }

    return listener;
  } else if (methodNameOrFunction) {
    // If we're passed something that's truthy (like an object), but it's not a valid method name or a function, get
    // angry
    throw new Error('Coral.Component: Unable to add ' + eventName + ' listener for ' + obj.toString() + ', ' +
      methodNameOrFunction + ' is neither a method name or a function');
  }

  return null;
}

/**
 @class Component
 @classdesc The base element for all Coral components
 @extends {HTMLElement}
 */
const Component = function () {
  throw new Error('Coral.Component is not meant to be invoked directly. Inherit from its prototype instead.');
};

// Inherit from HTMLElement
Component.prototype = Object.create(HTMLElement.prototype);

// Store a reference to properties
Component.prototype._properties = {};

/**
 Return this component's name.

 @ignore
 */
Component.prototype.toString = function () {
  if (this._namespace === window.Coral) {
    return `Coral.${this._componentName}`;
  }

  return this._componentName;
};

/**
 Events map. Key is Backbone-style event description, value is string indicating method name or function. Handlers
 are always called with <code>this</code> as the element.

 @type {Object}
 @protected
 */
Component.prototype._events = {};

/**
 Called when the component is being constructed. This method applies the CSS class, renders the component, binds
 events, and sets initial property values.

 {@link Component#_initialize} is called after the above operations are complete.
 @protected
 */
Component.prototype.createdCallback = function () {
  // We have to add toString directly on the instance or it doesn't work in IE 9
  // A side-effect of this is that toString cannot be overridden
  if (this.toString !== Component.prototype.toString) {
    this.toString = Component.prototype.toString;
  }

  // Track which properties have been set
  // This is used when setting defaults
  this._setProps = {};

  this._syncQueue = [];

  // Make sure context is correct when called by nextFrame
  this._syncDOM = this._syncDOM.bind(this);

  // Create a Vent instance to handle local events
  this._vent = new Vent(this);

  // Apply the class name
  if (this._className) {
    this.classList.add.apply(this.classList, this._className.split(' '));
  }

  // Create the elements property before the template. Templates that use handle="someName" attrs will need this
  this._elements = {};

  // Render template, if necessary
  if (typeof this._render === 'function') {
    this._render();
  }

  var prop;
  var attr;
  var value;
  var descriptor;
  var methods;

  // A hash where all the content zone names are stored using the tagName as key and property as value
  this._contentZones = {};

  // A list of attribute values indexed by property name
  // prop -> attrValue
  var attrValues = {};

  // Build a cache of attribute values provided via the markup and check for content zones
  for (prop in this._properties) {
    descriptor = this._properties[prop];

    if (descriptor.contentZone) {
      // Check if the tag name is unique
      if (this._contentZones[descriptor.tagName]) {
        commons._log('warn', 'Coral.Component: content zone for "%s" is already defined', descriptor.tagName);
      }

      // Add the prop to the hash
      this._contentZones[descriptor.tagName] = prop;
    }

    // Use the attribute name specified by the map
    attr = descriptor.attribute || prop;

    // Fetch the attribute corresponding to the property from the element
    attrValues[prop] = this.getAttribute(attr);
  }

  // Apply default values for all properties and their associated attributes
  for (prop in this._properties) {
    descriptor = this._properties[prop];
    methods = descriptor._methods;

    // Get the attribute value from the cache
    value = attrValues[prop];

    if (value !== null) {
      // Since the value is loaded as an attribute, it needs to be transformed from its attribute value
      if (methods.attributeTransform) {
        value = methods.attributeTransform.call(this, value, descriptor.default);
      }

      // Run the value transform function
      if (descriptor.transform) {
        value = methods.transform.call(this, value, descriptor.default);
      }

      // Check if the value valdiates
      if (methods.validate) {
        for (var i = 0 ; i < methods.validate.length ; i++) {
          // Don't pass the old value
          if (!methods.validate[i].call(this, value)) {
            // If it fails validation, we'll use the default
            value = null;
            break;
          }
        }
      }
    }

    if (value === null) {
      // If the property has already been set in another setter, don't apply the default
      if (this._setProps[prop]) {
        continue;
      }

      // If the default is a function we call it
      if (typeof descriptor.default === 'function') {
        // Call method if the default value is a method
        value = descriptor.default.call(this);
      } else {
        // Otherwise we set it from the descriptor directly
        value = descriptor.default;
      }

      // If the value that came out of the default is undefined,
      // this means that the property does not really have a default value
      // so we continue in order to avoid setting it
      if (typeof value === 'undefined') {
        continue;
      }
    }

    // Invoke the setter silently so we don't trigger "change" events on initialization
    this.set(prop, value, true);
  }

  this._delegateEvents();

  // Call the initialize method, if necessary
  if (typeof this._initialize === 'function') {
    this._initialize();
  }

  // Add MutationObserver for content zones
  if (Object.keys(this._contentZones).length) {
    // Watch for childlist modifications
    this._observer = new MutationObserver(this._handleContentZones.bind(this));
    this._observer.observe(this, {
      childList: true,
      subtree: false // don't care about nested stuff
    });
  }

  // Trigger ready event
  this._componentReady = true;
};

/**
 Detects when items are added and removed to make sure that the state of the content zone is accurate.

 @param {Array.<MutationRecord>} records

 @private
 */
Component.prototype._handleContentZones = function (records) {
  var record;
  var addedNodes;
  var removedNodes;
  var node;
  var tagName;
  var propertyName;

  for (var i = 0, recordsCount = records.length ; i < recordsCount ; i++) {
    record = records[i];

    addedNodes = record.addedNodes;
    removedNodes = record.removedNodes;

    // Handle removed nodes
    for (var k = 0, removedNodesCount = removedNodes.length ; k < removedNodesCount ; k++) {
      node = removedNodes[k];

      // only bother with element nodes
      if (node.nodeType === ELEMENT_NODE) {
        tagName = node.tagName.toLowerCase();

        // we use the content zone hash to check if there is an item assigned
        propertyName = this._contentZones[tagName];

        // the content zone needs to be cleared if it matches the previous item; while calling the insert, content
        // zones are removed and added again in the correct location triggering a mutation
        if (propertyName && this[propertyName] === node && node.parentNode === null) {
          this[propertyName] = undefined;
        }
      }
    }

    // Handle added nodes
    for (var j = 0, addedNodesCount = addedNodes.length ; j < addedNodesCount ; j++) {
      node = addedNodes[j];

      // only bother with element nodes
      if (node.nodeType === ELEMENT_NODE) {
        tagName = node.tagName.toLowerCase();

        // check if the added node matches a content zone; use the content zone hash to find if the tag name exists
        propertyName = this._contentZones[tagName];

        // we update the content zone if the value is different than the current
        if (propertyName && this[propertyName] !== node) {
          // assign to content zone
          this[propertyName] = node;
        }
      }
    }
  }
};

/**
 Called after the element has been constructed, template rendered, and attributes applied.

 @function _initialize
 @protected
 @memberof Component#
 */

/**
 The CSS class name to apply to the element.

 @type {String}
 @member _className
 @protected
 @memberof Component#
 */

/**
 Called during construction, is responsible for rendering any required sub-elements.

 @function _render
 @protected
 @memberof Component#
 */

/**
 The filter function for keyboard events. By default, any child element can trigger keyboard events. You can pass
 {@link Coral.Keys.filterInputs} to avoid listening to key events triggered from within inputs.

 @function _filterKeys
 @protected
 @memberof Component#
 */
Component.prototype._filterKeys = function () {
  return true;
};

/**
 Called when this element is inserted into the DOM.

 @fires Component#coral-component:attached
 @private
 */
Component.prototype.attachedCallback = function () {
  this.trigger('coral-component:attached');

  // A component that is in the DOM should respond to global events
  this._delegateGlobalEvents();
};

/**
 Called when this element is removed from the DOM.

 @fires Component#coral-component:detached
 @private
 */
Component.prototype.detachedCallback = function () {
  this.trigger('coral-component:detached');

  // A component that isn't in the DOM should not be responding to global events
  this._undelegateGlobalEvents();
};

/**
 Apply attribute changes by invoking setters. This creates a one-way relationship between attributes and properties.
 Changing an attribute updates the property, but changing the property does not update the attribute.

 @private
 */
Component.prototype.attributeChangedCallback = function (attrName, oldValue, newValue) {
  // Use the property name from the attribute map, otherwise just set the property by the same name
  var propName = this._attributes[attrName] || attrName;

  // Case 1: We are handling sets/gets for this property
  var descriptor = this._properties[propName];
  if (typeof descriptor !== 'undefined') {
    if (descriptor.attribute === null) {
      // Don't set properties that have explicitly asked to have no corresponding attribute
      return;
    }

    ['attributeTransform', 'transform'].forEach(function (v) {
      // Use the stored methods
      var transform = descriptor._methods[v];
      if (transform) {
        newValue = transform.call(this, newValue, descriptor.default);
      }
    }, this);

    // Don't bother with the setter unless the value changed
    if (newValue !== this[propName]) {
      // Just invoke setter
      this[propName] = newValue;
    }
  }

  // Case 2: We have a passive setter for this attribute
  if (this._properties['_' + propName]) {
    this._properties['_' + propName].set.call(this, newValue);
  }
};

/**
 Queue a DOM sync for the next animation frame. In order for this to work as expected, sync methods should never
 rely on the result of another value being synced.

 @protected
 */
Component.prototype._queueSync = function () {
  for (var i = 0, ni = arguments.length ; i < ni ; i++) {
    var propName = arguments[i];

    // Check if a sync is already queued
    var currentIndex = this._syncQueue.indexOf(propName);
    if (currentIndex !== -1) {
      // Move to the bottom of the queue.
      // This is necessary if a sync has already been queued for a property,
      // but another property sync is queued and specifies that this sync should come later.
      // This happens when Button.text is synced, as it wants to sync icon afterwards
      this._syncQueue.splice(currentIndex, 1);
    }

    // Queue the sync
    this._syncQueue.push(propName);
  }

  if (!this._syncPending) {
    window.requestAnimationFrame(this._syncDOM);
    this._syncPending = true;
  }
};

/**
 Sync the specified property to the DOM.

 @param {String} propName
 The name of the property to sync.
 @param {Boolean} [leaveInQueue=false]
 Whether the property should be left in the queue.

 @protected
 */
Component.prototype._syncProp = function (propName, leaveInQueue) {
  // De-queue each sync operation
  var method = this._properties[propName].sync;
  if (method) {
    method.call(this);
  } else {
    commons._log('warn', 'Coral.Component: sync method for %s is not defined', propName);
  }

  if (!leaveInQueue) {
    var index = this._syncQueue.indexOf(propName);
    if (index !== -1) {
      this._syncQueue.splice(index, 1);
    }
  }
};

/**
 Sync all changed properties to the DOM.

 @protected
 */
Component.prototype._syncDOM = function () {
  var propName;

  // De-queue each sync operation
  while (propName = this._syncQueue.shift()) {
    // Sync the property, and avoid removing it because we already have
    this._syncProp(propName, true);
  }

  this._syncPending = false;
};

/**
 Add local event and key combo listeners for this component, store global event/key combo listeners for later.

 @private

 @returns {Component} this, chainable.
 */
Component.prototype._delegateEvents = function () {
  /*
   Add listeners to new event
   - Include in hash
   Add listeners to existing event
   - Override method and use super
   Remove existing event
   - Pass null
   */
  var match;
  var eventName;
  var eventInfo;
  var listener;
  var selector;
  var elements;
  var isGlobal;
  var isKey;
  var isResize;
  var isCapture;

  for (eventInfo in this._events) {
    listener = this._events[eventInfo];

    // Extract the event name and the selector
    match = eventInfo.match(delegateEventSplitter);
    eventName = match[1] + '.CoralComponent';
    selector = match[2];

    if (selector === '') {
      // instead of null because the key module checks for undefined
      selector = undefined;
    }

    // Try to get the method corresponding to the value in the map
    listener = getListenerFromMethodNameOrFunction(this, eventName, listener);

    if (listener) {
      // Always execute in the context of the object
      // @todo is this necessary? this should be correct anyway
      listener = listener.bind(this);

      // Check if the listener is on the window
      isGlobal = eventName.indexOf('global:') === 0;
      if (isGlobal) {
        eventName = eventName.substr(7);
      }

      // Check if the listener is a capture listener
      isCapture = eventName.indexOf('capture:') === 0;
      if (isCapture) {
        // @todo Limitation: It should be possible to do capture:global:, but it isn't
        eventName = eventName.substr(8);
      }

      // Check if the listener is a key listener
      isKey = eventName.indexOf('key:') === 0;
      if (isKey) {
        if (isCapture) {
          throw new Error('Coral.Keys does not currently support listening to key events with capture');
        }
        eventName = eventName.substr(4);
      }

      // Check if the listener is a resize listener
      isResize = eventName.indexOf('resize') === 0;
      if (isResize) {
        if (isCapture) {
          throw new Error('Coral.commons.addResizeListener does not currently support listening to resize event with capture');
        }
      }

      if (isGlobal) {
        // Store for adding/removal
        if (isKey) {
          this._globalKeys = this._globalKeys || [];
          this._globalKeys.push({
            keyCombo: eventName,
            selector: selector,
            listener: listener
          });
        } else {
          this._globalEvents = this._globalEvents || [];
          this._globalEvents.push({
            eventName: eventName,
            selector: selector,
            listener: listener,
            isCapture: isCapture
          });
        }
      } else {
        // Events on the element itself
        if (isKey) {
          // Create the keys instance only if its needed
          this._keys = this._keys || new Keys(this, {
            filter: this._filterKeys,
            // Execute key listeners in the context of the element
            context: this
          });

          // Add listener locally
          this._keys.on(eventName, selector, listener);
        } else if (isResize) {
          if (selector) {
            elements = document.querySelectorAll(selector);
            for (var i = 0 ; i < elements.length ; ++i) {
              commons.addResizeListener(elements[i], listener);
            }
          } else {
            commons.addResizeListener(this, listener);
          }
        } else {
          this._vent.on(eventName, selector, listener, isCapture);
        }
      }
    }
  }
};

/**
 Remove global event listeners for this component.

 @private

 @returns {Component} this, chainable.
 */
Component.prototype._undelegateGlobalEvents = function () {
  var i;
  if (this._globalEvents) {
    // Remove global event listeners
    for (i = 0 ; i < this._globalEvents.length ; i++) {
      var event = this._globalEvents[i];
      events.off(event.eventName, event.selector, event.listener, event.isCapture);
    }
  }

  if (this._globalKeys) {
    // Remove global key listeners
    for (i = 0 ; i < this._globalKeys.length ; i++) {
      var key = this._globalKeys[i];
      keys.off(key.keyCombo, key.selector, key.listener);
    }
  }

  if (this._keys) {
    this._keys.destroy(true);
  }

  return this;
};

/**
 Add global event listeners for this component.

 @private

 @returns {Component} this, chainable.
 */
Component.prototype._delegateGlobalEvents = function () {
  var i;
  if (this._globalEvents) {
    // Add global event listeners
    for (i = 0 ; i < this._globalEvents.length ; i++) {
      var event = this._globalEvents[i];
      events.on(event.eventName, event.selector, event.listener, event.isCapture);
    }
  }

  if (this._globalKeys) {
    // Add global key listeners
    for (i = 0 ; i < this._globalKeys.length ; i++) {
      var key = this._globalKeys[i];
      keys.on(key.keyCombo, key.selector, key.listener);
    }
  }

  if (this._keys) {
    this._keys.init(true);
  }

  return this;
};

/**
 Add an event listener.

 @param {String} eventName
 The event name to listen for.
 @param {String} [selector]
 The selector to use for event delegation.
 @param {Function} func
 The function that will be called when the event is triggered.
 @param {Boolean} [useCapture=false]
 Whether or not to listen during the capturing or bubbling phase.

 @returns {Component} this, chainable.
 */
Component.prototype.on = function (eventName, selector, func, useCapture) {
  this._vent.on(eventName, selector, func, useCapture);
  return this;
};

/**
 Remove an event listener.

 @param {String} eventName
 The event name to stop listening for.
 @param {String} [selector]
 The selector that was used for event delegation.
 @param {Function} func
 The function that was passed to <code>on()</code>.
 @param {Boolean} [useCapture]
 Only remove listeners with <code>useCapture</code> set to the value passed in.

 @returns {Component} this, chainable.
 */
Component.prototype.off = function (eventName, selector, func, useCapture) {
  this._vent.off(eventName, selector, func, useCapture);
  return this;
};

/**
 Trigger an event.

 @param {String} eventName
 The event name to trigger.
 @param {Object} [props]
 Additional properties to make available to handlers as <code>event.detail</code>.
 @param {Boolean} [bubbles=true]
 Set to <code>false</code> to prevent the event from bubbling.
 @param {Boolean} [cancelable=true]
 Set to <code>false</code> to prevent the event from being cancelable.

 @returns {CustomEvent} CustomEvent object
 */
Component.prototype.trigger = function (eventName, props, bubbles, cancelable) {
  // When 'bubbles' is not set, then default to true:
  bubbles = bubbles || bubbles === undefined;

  // When 'cancelable' is not set, then default to true:
  cancelable = cancelable || cancelable === undefined;

  // CustomEvent is polyfilled for IE via Polymer:
  // https://github.com/Polymer/CustomElements/blob/master/src/boot.js#L84-L93
  var event = new CustomEvent(eventName, {
    bubbles: bubbles,
    cancelable: cancelable,
    detail: props
  });

  // default value in case the dispatching fails
  var defaultPrevented = false;

  try {
    // leads to NS_ERROR_UNEXPECTED in Firefox
    // https://bugzilla.mozilla.org/show_bug.cgi?id=329509
    defaultPrevented = !this.dispatchEvent(event);
  } catch (e) {
  }

  // Check if the defaultPrevented status was correctly stored back to the event object
  if (defaultPrevented !== event.defaultPrevented) {
    // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
    // However, it does return false if preventDefault() was called
    // Unfortunately, the returned event's defaultPrevented property is read-only
    // We need to work around this such that (patchedEvent instanceof Event) === true
    // First, we'll create an object that uses the event as its prototype
    // This gives us an object we can modify that is still technically an instanceof Event
    var patchedEvent = Object.create(event);

    // Next, we set the correct value for defaultPrevented on the new object
    // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
    // For some reason, defineProperty doesn't cause this
    Object.defineProperty(patchedEvent, 'defaultPrevented', {
      value: defaultPrevented
    });

    return patchedEvent;
  }

  return event;
};

/**
 Non-destructively remove this element. It can be re-added by simply appending it to the document again.
 It will be garbage collected if there are no more references to it.
 */
Component.prototype.remove = function () {
  if (this.parentNode) {
    // Just remove the element from its parent. This will automatically invoke detachedCallback
    this.parentNode.removeChild(this);
  }
};

/**
 @ignore
 @private
 */
Component.prototype._doSet = function (property, value, silent) {
  // Get property descriptor from constructor. Property descriptors are stored on constructor with methods
  // dereferenced to actual functions
  var descriptor = this._properties && this._properties[property];

  if (descriptor) {
    if (descriptor.contentZone && !(value instanceof HTMLElement) && this[property].set) {
      // If the property is a content zone and the passed value is not a HTML element,
      // assume we're setting multiple properties of the existing content zone with an object
      this[property].set(value);
    }
    // In case the Content Zone is not a Component, we still want to be able to set the new values into it
    else if (descriptor.contentZone && !(value instanceof HTMLElement) && typeof value === 'object' && this[property] instanceof HTMLElement) {
      Object.keys(value).forEach(function (prop) {
        this[prop] = value[prop];
      }, this[property]);
    } else if (descriptor._methods && descriptor._methods.set) {
      // Call and pass true silent
      // Use the actual setter method instead of the original method so events are triggered etc
      descriptor._methods.set.call(this, value, !!silent);
    } else {
      this[property] = value;
    }
  } else {
    // Simply set the property if it doesn't exist or has no setter
    this[property] = value;
  }
};

/**
 Set a single property.

 @name Component#set
 @function

 @param {String} property
 The name of the property to set.
 @param {*} value
 The value to set the property to.
 @param {Boolean} silent
 If true, events should not be triggered as a result of this set.

 @returns {Component} this, chainable.
 */

/**
 Set multiple properties.

 @name Component#set
 @function

 @param {Object.<String, *>} properties
 An object of property/value pairs to set.
 @param {Boolean} silent
 If true, events should not be triggered as a result of this set.

 @returns {Component} this, chainable.
 */
Component.prototype.set = function (propertyOrProperties, valueOrSilent, silent) {
  var property;
  var properties;
  var value;

  if (typeof propertyOrProperties === 'string') {
    // Set a single property
    property = propertyOrProperties;
    value = valueOrSilent;
    this._doSet(property, value, silent);
  } else {
    properties = propertyOrProperties;
    silent = valueOrSilent;

    // Set a map of properties
    for (property in properties) {
      value = properties[property];

      this._doSet(property, value, silent);
    }
  }

  return this;
};

/**
 Get the value of a property.

 @param {String} property
 The name of the property to fetch the value of.

 @returns {*} Property value.
 */
Component.prototype.get = function (property) {
  return this[property];
};

/**
 Show this component.

 @returns {Component} this, chainable
 */
Component.prototype.show = function () {
  if (!this.hidden) {
    return this;
  }

  this.hidden = false;
  return this;
};

/**
 Hide this component.

 @returns {Component} this, chainable
 */
Component.prototype.hide = function () {
  if (this.hidden) {
    return this;
  }

  this.hidden = true;
  return this;
};

// Copy all methods for baseTagName-style inheritance
Component.prototype._methods = {};
for (var prop in Component.prototype) {
  if (Component.prototype.hasOwnProperty(prop)) {
    Component.prototype._methods[prop] = Component.prototype[prop];
  }
}

/**
 Whether this component is hidden or not.

 @name hidden
 @type {Boolean}
 @default false
 @htmlattribute hidden
 @htmlattributereflected
 @memberof Component#
 */

/**
 Triggered when the component is attached to the DOM.

 @event Component#coral-component:attached
 @deprecated since 1.14.0, use <code>MutationObserver</code> instead.

 @param {Object} event
 Event object.
 */

/**
 Triggered when the component is detached to the DOM.

 @event Component#coral-component:detached
 @deprecated since 1.14.0, use <code>MutationObserver</code> instead.

 @param {Object} event
 Event object.
 */

/**
 Triggerred when the component has been upgraded and is ready for use.

 @event Component#coral-component:ready
 @deprecated since 1.9.0, use <code>Coral.commons.ready()</code> instead.

 @param {Object} event
 Event object.
 */

export default Component
