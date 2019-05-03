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

import {keys} from '../../../../coral-utils';

// Create a target element
let target = document.createElement('div');

// Add it to the body
document.body.appendChild(target);

before(function() {
  // Add coral--light to the body
  document.body.classList.add('coral--light');
});

afterEach(function() {
  // Empty target
  target.innerHTML = '';
  // Reset pressed keys
  keys.reset();
});

/**
  Shorthand for window.requestAnimationFrame.

  @param {Function} callback
    The callback to execute.
*/
const next = window.requestAnimationFrame.bind(window);

/**
  Build and return an instance ready to be used

  @param {String|HTMLElement} element
    The markup or HTML element to prepare. The markup only contain a single root tag.
*/
const build = function(element) {
  if (element instanceof HTMLElement) {
    // Add the element to the DOM
    return target.appendChild(element);
  }
  else if (typeof element === 'string') {
    // Create a container element and populate it with the markup
    const div = document.createElement('div');
    div.innerHTML = element;
  
    // Get the element from the container element
    const instance = div.children[0];
  
    // Add the element to the DOM
    return target.appendChild(instance);
  }
  
  throw Error('helpers.build requires a string markup or an HTMLElement.');
};

export {build, next, target};
