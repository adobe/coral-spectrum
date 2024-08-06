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

import commons from './Commons';
import Vent from '@adobe/vent';

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

  /**
   * @ignore
   * @param {MouseEvent | TouchEvent} event
   * @returns {boolean}
   * Keyboards, Assistive Technologies, and element.click() all produce a "virtual"
   * click event. This is a method of inferring such clicks. Every browser except
   * IE 11 only sets a zero value of "detail" for click events that are "virtual".
   * However, IE 11 uses a zero value for all click events. For IE 11 we rely on
   * the quirk that it produces click events that are of type PointerEvent, and
   * where only the "virtual" click lacks a pointerType field.
   *
   * Original licensing for the following method can be found in the
   * NOTICE file in the root directory of this source tree.
   * See https://github.com/facebook/react/blob/3c713d513195a53788b3f8bb4b70279d68b15bcc/packages/react-interactions/events/src/dom/shared/index.js#L74-L87
   */
  isVirtualEvent(event) {
    // JAWS/NVDA with Firefox.
    if (event.mozInputSource === 0 && event.isTrusted) {
      return true;
    }

    // Android TalkBack's detail value varies depending on the event listener providing the event so we have specific logic here instead
    // If pointerType is defined, event is from a click listener. For events from mousedown listener, detail === 0 is a sufficient check
    // to detect TalkBack virtual clicks.
    if (commons.isAndroid() && event.pointerType) {
      return event.type === 'click' && event.buttons === 1;
    }

    return event.detail === 0 && !event.pointerType;
  }
}

/**
 An enhanced event helper.

 @type {Events}
 */
const events = new Events(window);

export default events;
