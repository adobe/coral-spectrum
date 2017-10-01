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

import strings from './strings';

let i18n = {};

(function() {
  'use strict';
  
  /**
   Enum for locale values.
   @enum {String}
   @memberof Coral.i18n
   */
  var locales = {
    /** English (U.S.) */
    'en': 'en-US',
    /** English (U.S.)*/
    'en-us': 'en-US',
    /** Czech (Czechia) */
    'cs': 'cs-CZ',
    /** Czech (Czechia) */
    'cs-cz': 'cs-CZ',
    /** Danish (Denmark)*/
    'da': 'da-DK',
    /** Danish (Denmark)*/
    'da-dk': 'da-DK',
    /** German (Germany)*/
    'de': 'de-DE',
    /** German (Germany)*/
    'de-de': 'de-DE',
    /** Spanish (Spain)*/
    'es': 'es-ES',
    /** Spanish (Spain)*/
    'es-es': 'es-ES',
    /** Finnish (Finland) */
    'fi': 'fi-FI',
    /** Finnish (Finland) */
    'fi-fi': 'fi-FI',
    /** French (France)*/
    'fr': 'fr-FR',
    /** French (France)*/
    'fr-fr': 'fr-FR',
    /** Italian (Italy)*/
    'it': 'it-IT',
    /** Italian (Italy)*/
    'it-it': 'it-IT',
    /** Japanese (Japan)*/
    'ja': 'ja-JP',
    /** Japanese (Japan)*/
    'ja-jp': 'ja-JP',
    /** Korean (Korea)*/
    'ko': 'ko-KR',
    /** Korean (Korea)*/
    'ko-kr': 'ko-KR',
    /** Norwegian Bokmål (Norway) */
    'nb': 'nb-NO',
    /** Norwegian Bokmål (Norway) */
    'nb-no': 'nb-NO',
    /** Dutch (Netherlands)*/
    'nl': 'nl-NL',
    /** Polish (Poland) */
    'pl': 'pl-PL',
    /** Polish (Poland) */
    'pl-pl': 'pl-PL',
    /** Dutch (Netherlands)*/
    'nl-nl': 'nl-NL',
    /** Portuguese (Brazil) */
    'pt': 'pt-BR',
    /** Portuguese (Brazil) */
    'pt-br': 'pt-BR',
    /** Russian (Russia) */
    'ru': 'ru-RU',
    /** Russian (Russia) */
    'ru-ru': 'ru-RU',
    /** Swedish (Sweden) */
    'sv': 'sv-SE',
    /** Swedish (Sweden) */
    'sv-se': 'sv-SE',
    /** Turkish (Turkey) */
    'tr': 'tr-TR',
    /** Turkish (Turkey) */
    'tr-tr': 'tr-TR',
    /** Simplified Chinese */
    'zh-cn': 'zh-CN',
    /** Simplified Chinese */
    'zh-hans-cn': 'zh-CN',
    /** Simplified Chinese */
    'zh-hans': 'zh-CN',
    /** Traditional Chinese */
    'zh-tw': 'zh-TW',
    /** Traditional Chinese */
    'zh-hant-tw': 'zh-TW',
    /** Traditional Chinese */
    'zh-hant': 'zh-TW'
  };
  
  /**
   I18n service for CoralUI.
   @class Coral.i18n
   @classdesc An I18n service to get/set localized strings.
   @param {Object} [options]
   Options for this combo handler.
   @param {String} [options.locale]
   The <code>locale</code> property defines the locale of the I18nProvider.
   @ignore
   */
  var I18nProvider = function(options) {
    options = options || {};
    
    if (options.locale) {
      this._locale = options.locale;
    }
  };
  
  I18nProvider.prototype._locale = 'en-US';
  
  /**
   Coral.i18n current locale value.
   @member {Coral.i18n.locales} locale
   @memberof Coral.i18n
   */
  Object.defineProperty(I18nProvider.prototype, 'locale', {
    set: function(newLocale) {
      this._locale = newLocale;
    },
    get: function() {
      return this._locale;
    }
  });
  
  /**
   evaluate
   @type {RegExp}
   @ignore
   */
  I18nProvider.prototype._evaluate = /(\{.+?\})/g;
  
  /**
   Sets a localized string.
   @function set
   @param {String} key the key to set
   @param {String} value the value associated with the given key.
   @memberof Coral.i18n
   @example
   Coral.i18n.set('English string', 'Translated string');
   Coral.i18n.set('English string: {0}', 'Translated string: {0}');
   Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string: {2}, {0}, and {1}');
   Coral.i18n.set('English string: {name}', 'Translated string: {name}');
   Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string: {name3}, {name1}, and {name2}');
   */
  
  /**
   Sets multiple localized strings.
   @function set
   @param {Array<String, String>} map  a key-value map to add to the strings dictionary.
   @memberof Coral.i18n
   @example
   Coral.i18n.set([
   ['English string 1', 'Translated string 1'],
   ['English string 2', 'Translated string 2'],
   ['English string 1 with {0} items','Translated string 1 with {0} items'],
   ['English string 2 with {0} items','Translated string 2 with {0} items'],
   ['English string 1: {0}, {1}, and {2}','Translated string 1: {2}, {0}, and {1}'],
   ['English string 2: {0}, {1}, and {2}','Translated string 2: {2}, {0}, and {1}'],
   ['English string 1: {name}', 'Translated string 1: {name}'],
   ['English string 2: {name}', 'Translated string 2: {name}'],
   ['English string 1: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}'],
   ['English string 2: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}']
   ]);
   */
  
  /**
   Sets a localized string, using translation hint.
   @function set
   @param {String} key the key to set
   @param {String} value the value associated with the given key.
   @param {String} translation_hint the translation hint associated with the given key.
   @memberof Coral.i18n
   @example
   Coral.i18n.set('English string', 'Translated string 1', 'Translation hint 1');
   Coral.i18n.set('English string', 'Translated string 2', 'Translation hint 2');
   Coral.i18n.set('English string with {0} items' , 'Translated string 1 with {0} items', 'Translation hint 1');
   Coral.i18n.set('English string with {0} items' , 'Translated string 2 with {0} items', 'Translation hint 2');
   Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 1: {2}, {0}, and {1}', 'Translation hint 1');
   Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string 2: {2}, {0}, and {1}', 'Translation hint 2');
   Coral.i18n.set('English string: {name}', 'Translated string 1: {name}', 'Translation hint 1');
   Coral.i18n.set('English string: {name}', 'Translated string 2: {name}', 'Translation hint 2');
   Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}', 'Translation hint 1');
   Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}', 'Translation hint 2');
   */
  
  /**
   Sets multiple localized strings, using translation hints.
   @function set
   @param {Array<String, String, String>} map  a key-value object map to add to the strings dictionary.
   @memberof Coral.i18n
   @example
   Coral.i18n.set([
   ['English string', 'Translated string 1', 'Translation hint 1'],
   ['English string', 'Translated string 2', 'Translation hint 2'],
   ['English string with {0} items', 'Translated string 1 with {0} items', 'Translation hint 1'],
   ['English string with {0} items', 'Translated string 2 with {0} items', 'Translation hint 2'],
   ['English string with {0}, {1} and {2} items', 'Translated string 1 with {0}, {1} and {2} items', 'Translation hint 1'],
   ['English string with {0}, {1} and {2} items', 'Translated string 2 with {0}, {1} and {2} items', 'Translation hint 2'],
   ['English string: {name}', 'Translated string 1: {name}', 'Translation hint 1'],
   ['English string: {name}', 'Translated string 2: {name}', 'Translation hint 2'],
   ['English string: {name1}, {name2}, and {name3}', 'Translated string 1: {name3}, {name1}, and {name2}', 'Translation hint 1'],
   ['English string: {name1}, {name2}, and {name3}', 'Translated string 2: {name3}, {name1}, and {name2}', 'Translation hint 2']
   ]);
   */
  
  I18nProvider.prototype.set = function() {
    strings['generic'][this._locale] = strings['generic'][this._locale] || {};
    
    var key, value, translationHint;
    if (arguments.length === 0) {
      // Return empty string if called without arguments
      return '';
    }
    else if (arguments.length === 1) {
      if (!arguments[0]) {
        throw new Error('Coral.i18n.set: Single argument must be an array of arrays of key/value/(translation hint).');
      }
      // multiple keys
      else if (typeof arguments[0] === 'object' && (typeof arguments[0][0] === 'object')) {
        for (var i=0; i < arguments[0].length; i++) {
          key = arguments[0][i][0];
          value = arguments[0][i][1];
          translationHint = arguments[0][i][2];
          
          if (translationHint) {
            key = key + '/[translation hint:' + translationHint.replace(/&period;/g, '.') + ']';
          }
          strings['generic'][this._locale][key] = value;
        }
      }
      else {
        throw new Error('Coral.i18n.set: Single argument must be an array of key-value pairs.');
      }
    }
    // single key, no translation hint
    else if (arguments.length === 2) {
      if (typeof arguments[0] === 'string' && !!arguments[0] && typeof arguments[1] === 'string' && !!arguments[1] ) {
        key = arguments[0];
        value = arguments[1];
        strings['generic'][this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: Both arguments must be non-empty string values.');
      }
    }
    // single key, with translation hint
    else if (arguments.length === 3) {
      if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string' && typeof arguments[2] === 'string') {
        key = arguments[0];
        value = arguments[1];
        translationHint = arguments[2];
        
        if (translationHint !== 'null') {
          key = key + '/[translation hint:' + translationHint.replace(/&period;/g, '.') + ']';
        }
        
        strings['generic'][this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: All arguments must be of string type.');
      }
    }
    else {
      throw new Error('Coral.i18n.set: Too many arguments provided.');
    }
    
    return this;
  };
  
  /**
   Gets a localized string, using named arguments, and translation hint.
   @function get
   @param {String} key the key of the string to retrieve
   @param {Object} args one more named arguments
   @param {String} translation_hint context information for translators
   @returns {String} the localized string with arguments
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 1'); // => 'Translated string 1: foo'
   Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 2'); // => 'Translated string 2: foo'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 1'); // => 'Translated string 1: qux, foo, and bar'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 2'); // => 'Translated string 2: qux, foo, and bar'
   */
  
  /**
   Gets a localized string, using arguments, and translation hint.
   @function get
   @param {String} key the key of the string to retrieve
   @param {String} args one more arguments
   @param {String} translation_hint context information for translators
   @returns {String} the localized string with arguments
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string: {0}', 10, 'Translation hint 1'); // => 'Translated string 1: 10')
   Coral.i18n.get('English string: {0}', 10, 'Translation hint 2'); // => 'Translated string 2: 10')
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 1'); // => 'Translated string 1: 30, 10, and 20'
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 2'); // => 'Translated string 2: 30, 10, and 20'
   */
  
  /**
   Gets a localized string, using translation hint.
   @function get
   @param {String} key the key of the string to retrieve
   @param {String} translation_hint context information for translators
   @returns {String} the localized string
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string', 'Translation hint 1'); // => 'Translated string 1'
   Coral.i18n.get('English string', 'Translation hint 2'); // => 'Translated string 2'
   */
  
  /**
   Gets a localized string, using named arguments.
   @function get
   @param {String} key the key of the string to retrieve
   @param {Object} args one more named arguments
   @returns {String} the localized string with arguments
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string: {name}', { name: 'foo' }); // => 'Translated string: foo'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }); // => 'Translated string: qux, foo, and bar'
   */
  
  /**
   Gets a localized string, using arguments.
   @function get
   @param {String} key the key of the string to retrieve
   @param {String} args one more arguments
   @returns {String} the localized string with arguments
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string: {0}', 10); // => 'Translated string: 10'
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30); // => 'Translated string: 30, 10, and 20'
   */
  /**
   Gets a localized string.
   @function get
   @param {String} key the key of the string to retrieve
   @returns {String} the localized string
   @memberof Coral.i18n
   @example
   Coral.i18n.get('English string'); // => 'Translated String'
   */
  
  I18nProvider.prototype.get = function() {
    if (arguments.length === 0) {
      // Return empty string if called without arguments
      return '';
    }
    
    // The first argument is always the key
    // Aladdin server stores periods in keys as HTML entities, so we need to match this
    var key = arguments[0].replace('.', '&period;');
    
    // The number of required variables can be determined by parsing the string
    var placeholderMatches = key.match(this._evaluate);
    var variablePlaceholderCount = placeholderMatches ? placeholderMatches.length : 0;
    
    // The hint we'll use to translate
    var translationHint = '';
    
    var variables = {};
    var variableCount = 0;
    var i;
    
    // Verify the number of provided arguments matches the placeholder count
    if (arguments[1] !== null && typeof arguments[1] === 'object') {
      variables = arguments[1];
      
      // Check if provided variables object is complete
      var placeholderName = '';
      for (i = 0; i < placeholderMatches.length; i++) {
        placeholderName = placeholderMatches[i].slice(1).slice(0, -1);
        if (variables[placeholderName] === null || typeof variables[placeholderName] === 'undefined') {
          throw new Error('Coral.i18n.get: Named key "'+placeholderName+'" not present in provided object.');
        }
      }
      
      // If an additional argument is present, it's the translation hint
      if (typeof arguments[2] === 'string') {
        translationHint = arguments[2];
      }
    }
    else {
      // Assume no translation hint
      variableCount = arguments.length - 1;
      
      if (variableCount === variablePlaceholderCount + 1) {
        // If we've got an extra argument, assume it's a translation hint
        translationHint = arguments[arguments.length - 1];
      }
      else if (variableCount !== variablePlaceholderCount) {
        throw new Error('Coral.i18n.get: Number of variable placeholders ('+variablePlaceholderCount+') does not match number of variables ('+variableCount+').');
      }
      
      // Build variables object
      for (i = 0; i < variableCount; i++) {
        variables[i] = arguments[i + 1];
      }
    }
    
    // Include translation hint
    if (translationHint) {
      key = key + '/[translation hint:' + translationHint + ']';
    }
    
    // Fetch the string
    var str = key;
    for (var component in strings) {
      if (typeof strings[component] !== 'undefined' &&
        typeof strings[component][this._locale] !== 'undefined') {
        str = strings[component][this._locale][key] || str;
      }
    }
    
    // Optimization for a string with no placeholder
    if (variablePlaceholderCount === 0) { // e.g. Coral.i18n.get('English string');
      return str;
    }
    
    // Replace all variables
    return str.replace(this._evaluate, function(placeholderName) {
      placeholderName = placeholderName.slice(1).slice(0, -1);
      return variables[placeholderName];
    });
    
    // @todo use .toLocaleString(Coral.i18n.locale) in a future release
  };
  
  // sets default locale, based on document lang attribute, if it exists, or en-US otherwise
  var docLang = document.documentElement.lang.toLowerCase();
  var locale = locales[docLang] || 'en-US';
  
  /**
   A Coral I18n service
   @namespace
   */
  i18n = new I18nProvider({ locale: locale });
}());

export default i18n;
