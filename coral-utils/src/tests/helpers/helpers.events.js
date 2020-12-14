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

/**
 Creates a native event

 @param {String} base
 Base parent event. It accepts: HTMLEvents, MouseEvent.
 @param {HTMLElement} target
 Element used to dispatch the event.
 @param {String} type
 Type of event to instantiate. It accepts: change, input, blur
 @param {Object} [options]
 Object with options to pass to the event.
 @returns {Boolean} whether the default action of the event was canceled.
 */
function createEvent(base, target, type, options) {
  // if options where not provided, we initialize the defaults
  if (typeof options === 'undefined') {
    options = {
      bubbles: true,
      cancelable: true
    };
  }

  // Support @IE11
  const e = document.createEvent(base);
  e.initEvent(type, options.bubbles, options.cancelable);

  for (const option in options) {
    if (option !== 'bubbles' && option !== 'cancelable') {
      e[option] = options[option];
    }
  }

  return target.dispatchEvent(e);
}

/**
 Triggers a native HTMLEvent.

 @param {String} type
 Type of event to instantiate. It accepts: change, input, blur
 @param {HTMLElement} target
 Element used to dispatch the event.
 @param {Object} [options]
 Object with options to pass to the event.
 @returns {Boolean} whether the default action of the event was canceled.
 */
const event = function (type, target, options) {
  return createEvent('HTMLEvents', target, type, options);
};

/**
 Triggers a native Mouse Event.

 @param {String} type
 Type of event to instantiate. It accepts: mousemove, mousedown, mouseup, mousewheel.
 @param {HTMLElement} target
 Element used to dispatch the event.
 @param {Object} [options]
 Object with options to pass to the event.
 @returns {Boolean} whether the default action of the event was canceled.
 */
const mouseEvent = function (type, target, options) {
  return createEvent('MouseEvents', target, type, options);
};

export {event, mouseEvent};

