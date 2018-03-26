/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
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

/** Source: https://git.corp.adobe.com/Spectrum/focus-ring-polyfill/ */

// Provides explicit indication of elements receiving focus through keyboard interaction rather than mouse or touch.
(function(document) {
  var NAVIGATION_KEYS = [
    'Tab',
    'ArrowUp',
    'ArrowRight',
    'ArrowDown',
    'ArrowLeft',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Enter',
    ' ',
    'Escape',
    
    /* IE9 and Firefox < 37 */
    'Up',
    'Right',
    'Down',
    'Left',
    'Esc'
  ];
  var TEXT_INPUT_TYPES = [
    'text',
    'date',
    'datetime-local',
    'email',
    'month',
    'number',
    'password',
    'search',
    'tel',
    'time',
    'url',
    'week'
  ];
  var keyboardFocus = false;
  var elements = document.getElementsByClassName('focus-ring');
  
  function onKeydownHandler(event) {
    if (event.ctrlKey || event.altKey || event.metaKey || NAVIGATION_KEYS.indexOf(event.key) === -1) {
      return;
    }
    keyboardFocus = true;
  
    if (document.activeElement &&
      document.activeElement !== document.body &&
      document.activeElement.tagName !== 'TEXTAREA' &&
      !(document.activeElement.tagName === 'INPUT' &&
      TEXT_INPUT_TYPES.indexOf(document.activeElement.type) !== -1)) {
      document.activeElement.classList.add('focus-ring');
    }
  }
  
  function onMousedownHandler() {
    keyboardFocus = false;
    
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('focus-ring');
    }
    
  }
  
  function onFocusHandler(event) {
    if (event.target === document) {
      return;
    }
    
    if (keyboardFocus) {
      event.target.classList.add('focus-ring');
    }
  }
  
  function onBlurHandler(event) {
    if (event.target === document) {
      return;
    }
    
    event.target.classList.remove('focus-ring');
  }
  
  document.addEventListener('keydown', onKeydownHandler, true);
  document.addEventListener('mousedown', onMousedownHandler, true);
  document.addEventListener('focus', onFocusHandler, true);
  document.addEventListener('blur', onBlurHandler, true);
}(document));
