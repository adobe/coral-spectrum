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

import {Vent} from '../../../coralui-externals';

/**
 Events helper.
 */
class Events {
  /**
   @param {HTMLElement|String} elementOrSelector
   The element or selector indicating the element to use as the delegation root.
   */
  constructor(elementOrSelector) {
    this._vent = new Vent(elementOrSelector);
  }
  
  /**
   Add an event listener.
  
   @param {String} eventName
   The event name to listen for, including optional namespace(s).
   @param {String} [selector]
   The selector to use for event delegation.
   @param {Function} handler
   The function that will be called when the event is fired.
   @param {Boolean} [useCapture]
   Whether or not to listen during the capturing or bubbling phase.
   @returns {Events} this, chainable.
   */
  on(eventName, selector, handler, useCapture) {
    this._vent.on(eventName, selector, handler, useCapture);
    return this;
  }
  
  /**
   Remove an event listener.
   
   @param {String} [eventName]
   The event name to stop listening for, including optional namespace(s).
   @param {String} [selector]
   The selector that was used for event delegation.
   @param {Function} [handler]
   The function that was passed to <code>on()</code>.
   @param {Boolean} [useCapture]
   Only remove listeners with <code>useCapture</code> set to the value passed in.
   @returns {Event} this, chainable.
   */
  off(eventName, selector, handler, useCapture) {
    this._vent.off(eventName, selector, handler, useCapture);
    return this;
  }
  
  /**
   Dispatch a custom event at the root element.
   
   @param {String} eventName
   The name of the event to dispatch.
   @param {Object} [options]
   CustomEvent options.
   @param {Object} [options.bubbles=true]
   Whether the event should bubble.
   @param {Object} [options.cancelable=true]
   Whether the event should be cancelable.
   @param {Object} [options.detail]
   Data to pass to handlers as <code>event.detail</code>
   @returns {CustomEvent} dispatched event.
   */
  dispatch(eventName, options) {
    return this._vent.dispatch(eventName, options);
  }
  
  /**
   Destroy this instance, removing all events and references.
   */
  destroy() {
    this._vent.destroy();
  }
}

/**
 An enhanced event helper.
 
 @type {Events}
 */
const events = new Events(window);

export default events;
