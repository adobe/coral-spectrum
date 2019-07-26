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
 Enumeration for {@link BaseOverlay} trap options.
 
 @typedef {Object} OverlayTrapFocusEnum
 
 @property {String} ON
 Focus is trapped such that the use cannot focus outside of the overlay.
 @property {String} OFF
 The user can focus outside the overlay as normal.
 */
const trapFocus = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link BaseOverlay} scroll focus options.
 
 @typedef {Object} OverlayScrollOnFocusEnum
 
 @property {String} ON
 Scroll the document to bring the newly-focused element into view.
 @property {String} OFF
 Document will not scroll on focus.
 */
const scrollOnFocus = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link BaseOverlay} return focus options.
 
 @typedef {Object} OverlayReturnFocusEnum
 
 @property {String} ON
 When the overlay is closed, the element that was focused before the it was shown will be focused again.
 @property {String} OFF
 Nothing will be focused when the overlay is closed.
 */
const returnFocus = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link BaseOverlay} focus behavior options.
 
 @typedef {Object} OverlayFocusOnShowEnum
 
 @property {String} ON
 When the overlay is opened, it will be focused.
 @property {String} OFF
 The overlay will not focus itself when opened.
 */
const focusOnShow = {
  ON: 'on',
  OFF: 'off'
};

/**
 The time it should take for {@link BaseOverlay} to fade in milliseconds.
 Important: This should be greater than or equal to the CSS transition time.
 
 @typedef {Number} OverlayFadeTime
 */
const FADETIME = 350;

export {trapFocus, returnFocus, focusOnShow, scrollOnFocus, FADETIME};
