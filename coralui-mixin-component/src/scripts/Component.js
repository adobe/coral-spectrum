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

import Vent from '@coralui/vent';


//todo Subclass Factory Mixins http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
// let Component = (superclass) => class extends superclass {
//   foo() {
//     console.log('foo from MyMixin');
//   }
// };
//
// export default function mixin(target, source) {
//   target = target.prototype;
//   source = source.prototype;
//
//   Object.getOwnPropertyNames(source).forEach(function (name) {
//     if (name !== "constructor") {
//       Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
//     }
//   });
// }

/**
 @class Coral.Component
 @classdesc The base element for all Coral components
 @extends HTMLElement
 */
class Component {
  constructor() {
    throw new Error('Coral.Component is not meant to be invoked directly. Inherit from its prototype instead.');
  }
  
  static mixin(target) {
    target = target.prototype;
    const source = this.prototype;
    
    Object.getOwnPropertyNames(source).forEach(function (name) {
      if (name !== 'constructor') {
        Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
      }
    });
  }
  
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
   @returns {Coral.Component} this, chainable.
   */
  on(eventName, selector, func, useCapture) {
    this._vent = this._vent || new Vent(this);
    this._vent.on(eventName, selector, func, useCapture);
    return this;
  }
  
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
   @returns {Coral.Component} this, chainable.
   */
  off(eventName, selector, func, useCapture) {
    this._vent = this._vent || new Vent(this);
    this._vent.off(eventName, selector, func, useCapture);
    return this;
  }
  
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
  trigger(eventName, props, bubbles, cancelable) {
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
    } catch (e) {}
    
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
  }
  
  /**
   Non-destructively remove this element. It can be re-added by simply appending it to the document again.
   It will be garbage collected if there are no more references to it.
   */
  remove() {
    if (this.parentNode) {
      // Just remove the element from its parent. This will automatically invoke detachedCallback
      this.parentNode.removeChild(this);
    }
  }
  
  /**
   Set multiple properties.
   @name Coral.Component#set
   @function
   @param {Object.<String, *>} properties
   An object of property/value pairs to set.
   @param {Boolean} silent
   If true, events should not be triggered as a result of this set.
   @returns {Coral.Component} this, chainable.
   */
  set(propertyOrProperties, valueOrSilent, silent) {
    var property;
    var properties;
    var value;
    
    if (typeof propertyOrProperties === 'string') {
      // Set a single property
      property = propertyOrProperties;
      value = valueOrSilent;
      
      this[silent ? `_${property}` : property] = value;
    }
    else {
      properties = propertyOrProperties;
      silent = valueOrSilent;
      
      // Set a map of properties
      for (property in properties) {
        this[silent ? `_${property}` : property] = properties[property];
      }
    }
    
    return this;
  }
  
  /**
   Get the value of a property.
   @param {String} property
   The name of the property to fetch the value of.
   @returns {*} Property value.
   */
  get(property) {
    return this[property];
  }
  
  /**
   Show this component.
   @returns {Coral.Component} this, chainable
   */
  show() {
    if (!this.hidden) {
      return this;
    }
    
    this.hidden = false;
    return this;
  }
  
  /**
   Hide this component.
   @returns {Coral.Component} this, chainable
   */
  hide() {
    if (this.hidden) {
      return this;
    }
    
    this.hidden = true;
    return this;
  }
}

export default Component;
