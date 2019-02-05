/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import commons from './Commons';

/**
 A map of modifier names to their corresponding keycodes.
 @ignore
 */
const modifierCodes = {
  '⇧': 16,
  'shift': 16,
  '⌥': 18,
  'alt': 18,
  'option': 18,
  '⌃': 17,
  'ctrl': 17,
  'control': 17,
  '⌘': 91,
  'cmd': 91,
  'command': 91,
  'meta': 91
};

/**
 Used to check if a key is a modifier.
 @ignore
 */
const modifierCodeMap = {
  16: true,
  17: true,
  18: true,
  91: true,
  224: true
};

/**
 A list of modifier event property names in sorted key code order. Used to add keycodes for modifiers.
 @ignore
 */
const modifierEventPropertyNames = [
  'shiftKey',
  'ctrlKey',
  'altKey',
  'metaKey'
];

/**
 A map of key codes to normalize. These are duplicate keys such as the number pad.
 @ignore
 */
const normalizedCodes = {
  // Numpad 0-9
  96: 48,
  97: 49,
  98: 50,
  99: 51,
  100: 52,
  101: 53,
  102: 54,
  103: 55,
  104: 56,
  105: 57
};

// These keys are also implicitely used external
const specialKeyCodes = {
  backspace: 8,
  tab: 9,
  // real event key is "enter" this will be mapped internally
  return: 13,
  pause: 19,
  capslock: 20,
  esc: 27,
  escape: 27,
  // real event key is " " this will be mapped internally
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  // real event key is "arrowLeft" this will be mapped internally
  left: 37,
  // real event key is "arrowUp" this will be mapped internally
  up: 38,
  // real event key is "arrowRight" this will be mapped internally
  right: 39,
  // real event key is "arrowDown" this will be mapped internally
  down: 40,
  insert: 45,
  del: 46,
  delete: 46,
  period: 190,
  plus: 107,
  minus: 189,
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123,
  f13: 124,
  f14: 125,
  f15: 126,
  f16: 127,
  f17: 128,
  f18: 129,
  f19: 130,
  numlock: 144,
  scroll: 145
};

// Match a namespaced event, such as ctrl+r.myNS
const namespaceRE = /(.*?)(\..+)$/;
// Match a selector that requires context
const needsContextRE = /^[\x20\t\r\n\f]*[>+~]/;

/**
 The set of tags to ignore hot keys when focused within for the default filter.
 
 @ignore
 */
const restrictedTagNames = {
  INPUT: true,
  SELECT: true,
  TEXTAREA: true
};

/**
 Normalize duplicate codes.
 @ignore
 */
function normalizeCode(code) {
  return normalizedCodes[code] || code;
}

function mapSpecialEventKeyToSpecialAPIDefinition(eventKey) {
  // The official event.key is not compatible with this API special key registration, so map them
  switch (eventKey) {
    case 'enter':
      return 'return';
    case ' ':
      return 'space';
    case 'arrowup':
      return 'up';
    case 'arrowdown':
      return 'down';
    case 'arrowleft':
      return 'left';
    case 'arrowright':
      return 'right';
    default:
      return eventKey;
  }
}

/**
 Convert a key to its character code representation.
 
 @ignore
 
 @param key
 @return {*|Number}
 */
function keyToCode(key) {
  key = mapSpecialEventKeyToSpecialAPIDefinition(key.toLowerCase());
  
  // Map special string representations to their character code equivalent
  const code = specialKeyCodes[key] || modifierCodes[key];
  
  if (!code && key.length > 1) {
    throw new Error(`Coral.Keys: Key ${key} not recognized`);
  }
  
  // Return the special code from the map or the char code repesenting the character
  return code || key.toUpperCase().charCodeAt(0);
}

function cleanupFilteredListeners(keycombo, listeners, event) {
  const result = [];
  if (!listeners || !event.key || keycombo.indexOf('+') > 0) {
    return listeners;
  }
  
  // Check there is no registration conflict for same code registrations
  // For example: "." keyCharCode is 46 and "delete" keyCode is also 46
  const key = mapSpecialEventKeyToSpecialAPIDefinition(event.key.toLowerCase());
  for (let i = 0; i < listeners.length; i++) {
    if (listeners[i].originalString.indexOf(key) === 0 || key.indexOf(listeners[i].originalString) === 0) {
      result.push(listeners[i]);
    }
  }
  return result;
}

/**
 Handle key combination events.
 */
class Keys {
  /**
   @param {*} elOrSelector
   The selector or element to listen for keyboard events on. This should be the common parent of all
   elements you wish to listen for events on.
   @param {Object} [options]
   Options for this combo handler.
   @param {Function} [options.context]
   The desired value of the <code>this</code> keyword context when executing listeners. Defaults to the element on
   which the event is listened for.
   @param {Function} [options.preventDefault=false]
   Whether to prevent the default behavior when a key combo is matched.
   @param {Function} [options.stopPropagation=false]
   Whether to stop propagation when a key combo is matched.
   @param {Function} [options.filter]
   The filter function for keyboard events. This can be used to stop events from being triggered when they originate
   from specific elements. Defaults to {@link Keys.filterInputs}.
   */
  constructor(elOrSelector, options) {
    options = options || {};
  
    if (typeof elOrSelector === 'undefined') {
      throw new Error(`Coral.Keys: Cannot create a combo handler for ${elOrSelector}`);
    }
  
    // Cache the element object
    this._el = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;
  
    // Use provided context
    this._context = options.context;
  
    /**
     The filter function to use when evaluating keypresses
     */
    this._filter = options.filter || this.constructor.filterInputs;
  
    /**
     Whether to prevent default
     */
    this._preventDefault = options.preventDefault || false;
  
    /**
     Whether to stop propagation and prevent default
     */
    this._stopPropagation = options.stopPropagation || false;
  
    /**
     A map of key code combinations to arrays of listener functions
     */
    this._keyListeners = [];
  
    /**
     A an array of key sequences objects
     */
    this._keySequences = [];
  
    /**
     The sorted array of currently pressed keycodes
     */
    this._currentKeys = [];
  
    /**
     The joined string representation of currently pressed keycodes
     */
    this._currentKeyCombo = [];
  
    /**
     The timeout that corresponds to sequences
     */
    this._sequenceTimeout = null;
    
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._resetSequence = this._resetSequence.bind(this);
    this.reset = this.reset.bind(this);
    
    // Initialize immediately
    this.init();
  }
  
  _resetSequence() {
    window.clearTimeout(this._sequenceTimeout);
    this._keySequences.forEach((sequence) => {
      // Reset each sequence
      sequence.currentPart = 0;
    });
  }
  
  _setCurrentKeyCombo(event) {
    // Build string for modifiers
    const currentModifiers = [];
    for (let i = 0; i < modifierEventPropertyNames.length; i++) {
      const propName = modifierEventPropertyNames[i];
      
      if (event[propName]) {
        currentModifiers.push(modifierCodes[propName.slice(0, -3)]);
      }
    }
    
    // Store current key combo
    this._currentKeyCombo = this._currentKeys.concat(currentModifiers).sort().join('+');
  }
  
  /**
   Reset the state of this instance. This resets the currently pressed keys.
   
   @function reset
   
   @returns {Keys} this, chainable.
   */
  reset() {
    // Only reset variables related to currently pressed keys
    // Don't mess with sequences
    this._currentKeys = [];
    this._currentKeyCombo = '';
    
    return this;
  }
  
  _processSequences() {
    const activeSequenceListeners = [];
    
    // Check each sequence's state
    this._keySequences.forEach((sequence) => {
      if (sequence.parts[sequence.currentPart] === this._currentKeyCombo) {
        // If the current key combo in the sequence was pressed, increment the pointer
        sequence.currentPart++;
      }
      else {
        // Reset the sequence if a key was encountered out of sequence
        sequence.currentPart = 0;
      }
      
      if (sequence.currentPart === sequence.parts.length) {
        // If we've reached the end of the sequence, add it to the list of active sequences
        activeSequenceListeners.push(sequence);
        
        // Reset the sequence's state so it can be triggered again
        sequence.currentPart = 0;
      }
    });
    
    return activeSequenceListeners;
  }
  
  _executeListeners(event, keyup) {
    // Don't do anything if we don't have any keys pressed
    if (!this._currentKeyCombo) {
      return;
    }
    
    // Evaluate whether we should filter this keypress
    if (!this._filter(event)) {
      return;
    }
    
    const target = event.target || event.srcElement;
    const doc = Object.prototype.toString.call(event.currentTarget) === '[object Window]' ? event.currentTarget.document : event.currentTarget;
    
    let listeners = [];
    
    // Execute listeners associated with the current key combination
    let comboListeners = this._keyListeners[this._currentKeyCombo];
    comboListeners = cleanupFilteredListeners(this._currentKeyCombo, comboListeners, event);
  
    // If it is a combo key combination but we listen on the final key combination result or on special single char like "/"
    // E.g. we listen on "/" but the user presses "Shift+7" on a german-swiss keyboard
    // or we listen on "/" on the single key event on a US layout keyboard
    if (!keyup && !comboListeners) {
      if (event.key) {
        comboListeners = this._keyListeners[event.key.charCodeAt(0)];
        comboListeners = cleanupFilteredListeners(this._currentKeyCombo, comboListeners, event);
      }
    }
    
    let sequenceListeners;
    if (!keyup) {
      // Process sequences and get listeners associated with the current sequence
      // Don't do this on keyup as this breaks sequences with modifiers
      sequenceListeners = this._processSequences();
    }
    
    if (comboListeners && comboListeners.length) {
      listeners = listeners.concat(comboListeners);
    }
    
    if (sequenceListeners && sequenceListeners.length) {
      listeners = listeners.concat(sequenceListeners);
    }
    
    if (listeners && listeners.length) {
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        
        // Perform event delegation
        if (listener.selector) {
          let selector = '';
          
          // This allows us to match when the delegation selector includes context
          if (listener.needsContext) {
            doc.id = doc.id || commons.getUID();
            selector = `#${doc.id} `;
          }
          
          const matches = Array.prototype.indexOf.call(doc.querySelectorAll(selector + listener.selector), target) >= 0;
          
          // Skip if the originating element doesn't match the selector
          if (!matches) {
            continue;
          }
        }
        
        // Add data to event object
        if (typeof listener.data !== 'undefined') {
          event.data = listener.data;
        }
        
        // Add matchedTarget
        event.matchedTarget = target;
        
        // Add keys that triggered the event
        event.keys = listener.originalString;
        
        listener.listener.call(this._context || doc, event);
      }
      
      // Don't do the default thing
      if (this._preventDefault) {
        event.preventDefault();
      }
      if (this._stopPropagation) {
        event.stopPropagation();
      }
    }
  }
  
  _handleKeyDown(event) {
    window.clearTimeout(this._sequenceTimeout);
    this._sequenceTimeout = window.setTimeout(this._resetSequence, this.constructor.sequenceTime);
    
    // Store pressed key in array
    const key = normalizeCode(event.keyCode);
    
    // Don't do anything when a modifier is pressed
    if (modifierCodeMap[key]) {
      return;
    }
    
    if (this._currentKeys.indexOf(key) === -1) {
      this._currentKeys.push(key);
      
      this._setCurrentKeyCombo(event);
    }
    
    this._executeListeners(event);
    
    // Workaround: keyup events are never triggered while the command key is down, so reset the list of keys
    if (event.metaKey) {
      this.reset();
    }
    
    if (!event.target.parentNode) {
      // Workaround: keyup events are never triggered if the element does not have a parent node
      this.reset();
    }
  }
  
  _handleKeyUp(event) {
    const key = normalizeCode(event.keyCode);
    
    if (modifierCodeMap[key]) {
      // Workaround: keyup events are not triggered when command key is down on Mac, so if the command key is
      // released, consider all keys released
      // Test: comment this out, press K, press L, press Command, release L, release Command, then release K -- L is
      // triggered. This also prevents handlers for related key combos to be triggered
      // Test: comment this out, press Control, press Alt, press A, press S, release Alt, release S -- Control+A is
      // triggered
      this.reset();
      
      // We don't ever want to execute handlers when a modifier is released, and we can't since they don't end up in
      // currentKeys. If we weren't doing the index check below, that could result in key combo handlers for ctrl+r to
      // be triggered when someone released alt first after triggering ctrl+alt+r. In any case, return to avoid the
      // uselss extra work
      return;
    }
    
    // Remove key from array
    const index = this._currentKeys.indexOf(key);
    if (index !== -1) {
      this._currentKeys.splice(index, 1);
      
      // If too many keys are pressed, then one is removed, make sure to check for a match
      this._setCurrentKeyCombo(event);
      this._executeListeners(event, true);
    }
  }
  
  _keySequenceStringToArray(keyCombo) {
    return keyCombo.toString().split('-').map(this._keyComboToCodeString);
  }
  
  /**
   Add a key combo listener.
   
   @function on
   @param {String} keyCombo
   The key combination to listen for, such as <code>'ctrl-f'</code>.
   @param {String} [selector]
   A selector to use for event delegation.
   @param {String} [data]
   Data to pass to listeners as <code>event.data</code>.
   @param {Function} listener
   The listener to execute when this key combination is pressed. Executes on keydown, or, if too many keys are
   pressed and one is released, resulting in the correct key combination, executes on keyup.
   
   @returns {Keys} this, chainable.
   */
  on(keyCombo, selector, data, listener) {
    // keyCombo can be a map of keyCombos to handlers
    if (typeof keyCombo === 'object') {
      // ( keyCombo-Object, selector, data )
      if (typeof selector !== 'string') {
        // ( keyCombo-Object, data )
        // ( keyCombo-Object, null, data )
        data = data || selector;
        selector = undefined;
      }
      for (const combo in keyCombo) {
        this.on(combo, selector, data, keyCombo[combo]);
      }
      return this;
    }
    
    if (typeof data === 'undefined' && typeof listener === 'undefined') {
      // ( keyCombo, listener )
      listener = selector;
      data = selector = undefined;
    }
    else if (typeof listener === 'undefined') {
      if (typeof selector === 'string') {
        // ( keyCombo, selector, listener )
        listener = data;
        data = undefined;
      }
      else {
        // ( keyCombo, data, listener )
        listener = data;
        data = selector;
        selector = undefined;
      }
    }
    
    if (typeof listener !== 'function') {
      throw new Error(`Coral.Keys: Cannot add listener of type ${typeof listener}`);
    }
    
    let namespace;
    const namespaceMatch = namespaceRE.exec(keyCombo);
    if (namespaceMatch) {
      keyCombo = namespaceMatch[1];
      namespace = namespaceMatch[2];
    }
    
    // Determine if this selector needs context when evaluating event delegation
    // A selector needs context when it includes things like >, ~, :first-child, etc
    const needsContext = selector ? needsContextRE.test(selector) : false;
  
    // Check if the string is a sequence or a keypress
    if (keyCombo.toString().indexOf('-') !== -1 && keyCombo.toString().length > 1) {
      // It's a sequence!
      
      // Divide it into its parts and convert to a code string
      const sequenceParts = this._keySequenceStringToArray(keyCombo);
      
      // Store the listener and associated information in the list for this sequence
      this._keySequences.push({
        originalString: keyCombo,
        currentPart: 0,
        parts: sequenceParts,
        needsContext: needsContext,
        selector: selector,
        listener: listener,
        data: data,
        namespace: namespace
      });
    }
    else {
      const originalString = keyCombo.toString();
      
      // It's a key combo!
      keyCombo = this._keyComboToCodeString(keyCombo);
      
      const listeners = this._keyListeners[keyCombo] = this._keyListeners[keyCombo] || [];
      
      // Store the listener and associated information in the list for this keyCombo
      listeners.push({
        originalString: originalString,
        // Determine if this selector needs context when evaluating event delegation
        // A selector needs context when it includes things like >, ~, :first-child, etc
        needsContext: selector ? needsContextRE.test(selector) : false,
        selector: selector,
        listener: listener,
        data: data,
        namespace: namespace
      });
    }
    
    return this;
  }
  
  _offByKeyComboString(keyComboString, namespace, selector, listener) {
    let i;
    const listeners = this._keyListeners[keyComboString];
    
    if (listeners && listeners.length) {
      if (typeof selector === 'undefined' && typeof listener === 'undefined' && typeof namespace === 'undefined') {
        // Unbind all listeners for this key combo
        listeners.length = 0;
      }
      else if (typeof listener === 'undefined') {
        // Unbind all listeners of a specific selector and or namespace
        for (i = 0; i < listeners.length; i++) {
          // This comparison works because selector and namespace are undefined by default
          if (listeners[i].selector === selector && listeners[i].namespace === namespace) {
            listeners.splice(i, 1);
            i--;
          }
        }
      }
      else {
        // Unbind a specific listener, optionally on a specific selector and specific namespace
        for (i = 0; i < listeners.length; i++) {
          if (listeners[i].listener === listener &&
            listeners[i].selector === selector &&
            listeners[i].namespace === namespace) {
            listeners.splice(i, 1);
            i--;
          }
        }
      }
    }
  }
  
  /**
   Remove a key combo listener.
   
   @function off
   @param {String} keyCombo
   The key combination to listen for, such as <code>'ctrl-f'</code>.
   @param {String} [selector]
   A selector to use for event delegation.
   @param {Function} listener
   The listener that was passed to on.
   
   @returns {Keys} this, chainable.
   */
  off(keyCombo, selector, listener) {
    if (typeof listener === 'undefined') {
      listener = selector;
      selector = undefined;
    }
    
    let i;
    let namespace;
    const namespaceMatch = namespaceRE.exec(keyCombo);
    if (namespaceMatch) {
      keyCombo = namespaceMatch[1];
      namespace = namespaceMatch[2];
    }
    
    if (keyCombo === '' && namespace !== undefined) {
      // If we have a namespace by no keyCombo, remove all events of the namespace for each key combo
      for (keyCombo in this._keyListeners) {
        this._offByKeyComboString(keyCombo, namespace, selector, listener);
      }
      
      // Remove sequences
      for (i = 0; i < this._keySequences.length; i++) {
        if (this._keySequences[i].namespace === namespace) {
          this._keySequences.splice(i, 1);
          i--;
        }
      }
      
      return this;
    }
    
    if (keyCombo.indexOf('-') !== -1) {
      // Unbind a specific key sequence listener, optionally on a specific selector and specific namespace
      for (i = 0; i < this._keySequences.length; i++) {
        if (
          (keyCombo === undefined || this._keySequences[i].originalString === keyCombo) &&
          (listener === undefined || this._keySequences[i].listener === listener) &&
          (selector === undefined || this._keySequences[i].selector === selector) &&
          (namespace === undefined || this._keySequences[i].namespace === namespace)
        ) {
          this._keySequences.splice(i, 1);
          i--;
        }
      }
    }
    else {
      keyCombo = this._keyComboToCodeString(keyCombo);
      
      this._offByKeyComboString(keyCombo, namespace, selector, listener);
    }
    
    return this;
  }
  
  /**
   Destroy this instance. This removes all event listeners, references, and state.
   
   @function destroy
   @param {Boolean} globalsOnly
   Whether only global listeners should be removed
   
   @returns {Keys} this, chainable.
   */
  destroy(globalsOnly) {
    if (!globalsOnly) {
      this._keyListeners = null;
      this._currentKeys = null;
      this._currentKeyCombo = null;
      
      this._el.removeEventListener('keydown', this._handleKeyDown);
    }
    
    window.removeEventListener('keyup', this._handleKeyUp, true);
    window.removeEventListener('focus', this.reset);
    
    return this;
  }
  
  /**
   Initialize an instance created without the <code>new</code> keyword or revive a destroyed instance. This method
   will be called automatically if an instance is created with <code>new Coral.keys</code>.
   
   @function init
   @param {Boolean} globalsOnly
   Whether only global listeners should be added
   
   @returns {Keys} this, chainable.
   */
  init(globalsOnly) {
    if (!globalsOnly) {
      // Reset all variable states
      this._currentKeys = [];
      this._currentKeyCombo = '';
      this._keyListeners = {};
      this._keySequences = [];
  
      this._el.addEventListener('keydown', this._handleKeyDown);
    }
    
    // Remove window event listeners first to avoid memory leak
    this.destroy(true);
    
    // Watching on capture so it is immune to stopPropagation(). It's very important this event
    // is handled so key entries previously added on keydown can be cleared out.
    // If multiple identical EventListeners are registered on the same EventTarget with the same parameters the
    // duplicate instances are discarded. They do not cause the EventListener to be called twice.
    window.addEventListener('keyup', this._handleKeyUp, true);
    window.addEventListener('focus', this.reset);
    
    return this;
  }
  
  /**
   The default keycombo event filter function. Ignores key combos triggered on input, select, and textarea.
   
   @param event
   The event passed
   
   @returns {Boolean} True, if event.target is not editable and event.target.tagname is not restricted
   */
  static filterInputs(event) {
    // Escape keycode doesn't have to be filtered
    if (event.keyCode === specialKeyCodes.escape) {
      return true;
    }
  
    const target = event.target;
    const tagName = target.tagName;
    const isContentEditable = target.isContentEditable;
    const isRestrictedTag = restrictedTagNames[tagName];
    return !isContentEditable && !isRestrictedTag;
  }
  
  /**
   Convert a key to its character code representation.
   
   @param {String} key
   The key character that needs to be converted. If the String contains more than one character, an error will be
   produced.
   
   @returns {Number} The character code of the given String.
   */
  static keyToCode(key) {
    return keyToCode(key);
  }
  
  /**
   The time allowed between keypresses for a sequence in miliseconds
   @type {Number}
   @default 1500
   */
  static get sequenceTime() {
    return 1500;
  }
  
  /**
   Convert a combination of keys separated by + into the corresponding code string.
   @ignore
   */
  _keyComboToCodeString(keyCombo) {
    // if single "+"
    if (keyCombo === '+') {
      return keyToCode(keyCombo);
    }
  
    return keyCombo
      // Convert to string so numbers are supported
      .toString()
      .split('+')
      .map(keyToCode)
      // Sort keys for easy comparison
      .sort()
      .join('+');
  }
}

/**
 A key listener for global hotkeys is exposed for document eventing handling.
 
 @type {Keys}
 */
// Register against the documentElement, <html>, so event delegation works
const keys = new Keys(document.documentElement, {
  // Don't let global hotkeys trigger default actions
  stopPropagation: true,
  preventDefault: true
});

export {keys, Keys};
