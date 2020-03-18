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

// @IE
import './polyfills/element.closest.js';
import './polyfills/element.matches.js';
import './polyfills/element.remove.js';
import './polyfills/classList-partial-shim.js';
import './polyfills/CustomEvent.js';
import './polyfills/focus-options-polyfill.js';
import 'core-js/es/reflect';
import 'core-js/es/promise';
// Accessibility
import '@adobe/focus-ring-polyfill';

// @IE Force custom elements polyfill to work with ES5
import './polyfills/forcePolyfill.js';
// Using custom polyfill built from https://github.com/joeldenning/custom-elements/tree/builtin instead.
// customElements.enableCustomizedBuiltins is set to true by default here.
import './polyfills/custom-elements.min.js';
