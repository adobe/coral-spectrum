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

// Patch to be able to use document.createElement(tagName, customElement) from custom elements v0
const documentCreateElement = document.createElement;
document.createElement = function createElement() {
  if (typeof arguments[1] === 'string') {
    arguments[1] = {is: arguments[1]};
  }
  return documentCreateElement.apply(this, arguments);
};
