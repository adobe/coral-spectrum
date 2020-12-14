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
 Gets the target panel of the item.

 @private
 @param {HTMLElement|String} [targetValue]
 A specific target value to use.
 @returns {?HTMLElement}
 */
export default function getTarget(targetValue) {
  if (targetValue instanceof Node) {
    // Just return the provided Node
    return targetValue;
  }

  // Dynamically get the target node based on the target
  let newTarget = null;
  if (typeof targetValue === 'string' && targetValue.trim() !== '') {
    newTarget = document.querySelector(targetValue);
  }

  return newTarget;
}
