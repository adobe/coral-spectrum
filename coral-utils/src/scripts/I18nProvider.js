/**
 Enumeration for {@link i18n} locales.
 
 @typedef {Object} I18nLocalesEnum
 
 @property {String} en
 English (U.S.)
 @property {String} en-us
 English (U.S.)
 @property {String} cs
 Czech (Czechia)
 @property {String} cs-cz
 Czech (Czechia)
 @property {String} da
 Danish (Denmark)
 @property {String} da-dk
 Danish (Denmark)
 @property {String} de
 German (Germany)
 @property {String} de-de
 German (Germany)
 @property {String} es
 Spanish (Spain)
 @property {String} es-es
 Spanish (Spain)
 @property {String} fi
 Finnish (Finland)
 @property {String} fi-fi
 Finnish (Finland)
 @property {String} fr
 French (France)
 @property {String} fr-fr
 French (France)
 @property {String} it
 Italian (Italy)
 @property {String} it-it
 Italian (Italy)
 @property {String} ja
 Japanese (Japan)
 @property {String} ja-jp
 Japanese (Japan)
 @property {String} ko
 Korean (Korea)
 @property {String} ko-kr
 Korean (Korea)
 @property {String} nb
 Norwegian Bokmål (Norway)
 @property {String} nb-no
 Norwegian Bokmål (Norway)
 @property {String} nl
 Dutch (Netherlands)
 @property {String} nl-nl
 Dutch (Netherlands)
 @property {String} pl
 Polish (Poland)
 @property {String} pl-pl
 Polish (Poland)
 @property {String} pt
 Portuguese (Brazil)
 @property {String} pt-br
 Portuguese (Brazil)
 @property {String} ru
 Russian (Russia)
 @property {String} ru-ru
 Russian (Russia)
 @property {String} sv
 Swedish (Sweden)
 @property {String} sv-se
 Swedish (Sweden)
 @property {String} tr
 Turkish (Turkey)
 @property {String} tr-tr
 Turkish (Turkey)
 @property {String} zh-cn
 Simplified Chinese
 @property {String} zh-hans-cn
 Simplified Chinese
 @property {String} zh-hans
 Simplified Chinese
 @property {String} zh-tw
 Traditional Chinese
 @property {String} zh-hant-tw
 Traditional Chinese
 @property {String} zh-hant
 Traditional Chinese
 */
const locales = {
  'en': 'en-US',
  'en-us': 'en-US',
  'cs': 'cs-CZ',
  'cs-cz': 'cs-CZ',
  'da': 'da-DK',
  'da-dk': 'da-DK',
  'de': 'de-DE',
  'de-de': 'de-DE',
  'es': 'es-ES',
  'es-es': 'es-ES',
  'fi': 'fi-FI',
  'fi-fi': 'fi-FI',
  'fr': 'fr-FR',
  'fr-fr': 'fr-FR',
  'it': 'it-IT',
  'it-it': 'it-IT',
  'ja': 'ja-JP',
  'ja-jp': 'ja-JP',
  'ko': 'ko-KR',
  'ko-kr': 'ko-KR',
  'nb': 'nb-NO',
  'nb-no': 'nb-NO',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'pl-pl': 'pl-PL',
  'nl-nl': 'nl-NL',
  'pt': 'pt-BR',
  'pt-br': 'pt-BR',
  'ru': 'ru-RU',
  'ru-ru': 'ru-RU',
  'sv': 'sv-SE',
  'sv-se': 'sv-SE',
  'tr': 'tr-TR',
  'tr-tr': 'tr-TR',
  'zh-cn': 'zh-CN',
  'zh-hans-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hant-tw': 'zh-TW',
  'zh-hant': 'zh-TW'
};

/**
 Used to store i18n strings.
 
 @type {Object}
 @property {String} strings.generic
 */
const strings = {
  generic: {}
};

/**
 I18n service to get/set localized strings.
 */
class I18nProvider {
  /**
   @param {Object} [options]
   Options for this combo handler.
   @param {String} [options.locale]
   The <code>locale</code> property defines the locale of the I18nProvider.
   */
  constructor(options) {
    options = options || {};
  
    // Default locale
    this._locale = 'en-US';
    
    if (options.locale) {
      this._locale = options.locale;
    }
    
    this._evaluate = /(\{.+?\})/g;
  }
  
  /**
   Sets a localized string.
   
   @param {String} key the key to set
   @param {String} value the value associated with the given key.
   @example
   Coral.i18n.set('English string', 'Translated string');
   Coral.i18n.set('English string: {0}', 'Translated string: {0}');
   Coral.i18n.set('English string: {0}, {1}, and {2}', 'Translated string: {2}, {0}, and {1}');
   Coral.i18n.set('English string: {name}', 'Translated string: {name}');
   Coral.i18n.set('English string: {name1}, {name2}, and {name3}', 'Translated string: {name3}, {name1}, and {name2}');
   */
  
  /**
   Sets multiple localized strings.
   
   @param {Array<String, String>} map  a key-value map to add to the strings dictionary.
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
   
   @param {String} key the key to set
   @param {String} value the value associated with the given key.
   @param {String} translation_hint the translation hint associated with the given key.
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
   
   @param {Array<String, String, String>} map
   A key-value object map to add to the strings dictionary.
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
  // eslint-disable-next-line func-names
  set(...args) {
    strings.generic[this._locale] = strings.generic[this._locale] || {};
    
    let key, value, translationHint;
    if (args.length === 0) {
      // Return empty string if called without arguments
      return '';
    }
    else if (args.length === 1) {
      if (!args[0]) {
        throw new Error('Coral.i18n.set: Single argument must be an array of arrays of key/value/(translation hint).');
      }
      // multiple keys
      else if (typeof args[0] === 'object' && typeof args[0][0] === 'object') {
        for (let i = 0; i < args[0].length; i++) {
          key = args[0][i][0];
          value = args[0][i][1];
          translationHint = args[0][i][2];
          
          if (translationHint) {
            key = `${key}/[translation hint:${translationHint.replace(/&period;/g, '.')}]`;
          }
          strings.generic[this._locale][key] = value;
        }
      }
      else {
        throw new Error('Coral.i18n.set: Single argument must be an array of key-value pairs.');
      }
    }
    // single key, no translation hint
    else if (args.length === 2) {
      if (typeof args[0] === 'string' && !!args[0] && typeof args[1] === 'string' && !!args[1]) {
        key = args[0];
        value = args[1];
        strings.generic[this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: Both arguments must be non-empty string values.');
      }
    }
    // single key, with translation hint
    else if (args.length === 3) {
      if (typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'string') {
        key = args[0];
        value = args[1];
        translationHint = args[2];
        
        if (translationHint !== 'null') {
          key = `${key}/[translation hint:${translationHint.replace(/&period;/g, '.')}]`;
        }
        
        strings.generic[this._locale][key] = value;
      }
      else {
        throw new Error('Coral.i18n.set: All arguments must be of string type.');
      }
    }
    else {
      throw new Error('Coral.i18n.set: Too many arguments provided.');
    }
    
    return this;
  }
  
  /**
   Gets a localized string, using named arguments, and translation hint.
   
   @param {String} key the key of the string to retrieve
   @param {Object} args one more named arguments
   @param {String} translation_hint context information for translators
   @returns {String} the localized string with arguments
   @example
   Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 1'); // => 'Translated string 1: foo'
   Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 2'); // => 'Translated string 2: foo'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 1'); // => 'Translated string 1: qux, foo, and bar'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 2'); // => 'Translated string 2: qux, foo, and bar'
   */
  
  /**
   Gets a localized string, using arguments, and translation hint.
   
   @param {String} key the key of the string to retrieve
   @param {String} args one more arguments
   @param {String} translation_hint context information for translators
   @returns {String} the localized string with arguments
   @example
   Coral.i18n.get('English string: {0}', 10, 'Translation hint 1'); // => 'Translated string 1: 10')
   Coral.i18n.get('English string: {0}', 10, 'Translation hint 2'); // => 'Translated string 2: 10')
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 1'); // => 'Translated string 1: 30, 10, and 20'
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30, 'Translation hint 2'); // => 'Translated string 2: 30, 10, and 20'
   */
  
  /**
   Gets a localized string, using translation hint.
   
   @param {String} key the key of the string to retrieve
   @param {String} translation_hint context information for translators
   @returns {String} the localized string
   @example
   Coral.i18n.get('English string', 'Translation hint 1'); // => 'Translated string 1'
   Coral.i18n.get('English string', 'Translation hint 2'); // => 'Translated string 2'
   */
  
  /**
   Gets a localized string, using named arguments.
   
   @param {String} key the key of the string to retrieve
   @param {Object} args one more named arguments
   @returns {String} the localized string with arguments
   @example
   Coral.i18n.get('English string: {name}', { name: 'foo' }); // => 'Translated string: foo'
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }); // => 'Translated string: qux, foo, and bar'
   */
  
  /**
   Gets a localized string, using arguments.
   
   @param {String} key the key of the string to retrieve
   @param {String} args one more arguments
   @returns {String} the localized string with arguments
   @example
   Coral.i18n.get('English string: {0}', 10); // => 'Translated string: 10'
   Coral.i18n.get('English string: {0}, {1}, and {2}', 10, 20, 30); // => 'Translated string: 30, 10, and 20'
   */
  /**
   Gets a localized string.
   
   @param {String} key the key of the string to retrieve
   @returns {String} the localized string
   @example
   Coral.i18n.get('English string'); // => 'Translated String'
   */
  // eslint-disable-next-line func-names
  get(...args) {
    if (args.length === 0) {
      // Return empty string if called without arguments
      return '';
    }
    
    // The first argument is always the key
    // Aladdin server stores periods in keys as HTML entities, so we need to match this
    let key = args[0].replace('.', '&period;');
    
    // The number of required variables can be determined by parsing the string
    const placeholderMatches = key.match(this._evaluate);
    const variablePlaceholderCount = placeholderMatches ? placeholderMatches.length : 0;
    
    // The hint we'll use to translate
    let translationHint = '';
    
    let variables = {};
    let variableCount = 0;
    let i;
    
    // Verify the number of provided arguments matches the placeholder count
    if (args[1] !== null && typeof args[1] === 'object') {
      variables = args[1];
      
      // Check if provided variables object is complete
      let placeholderName = '';
      for (i = 0; i < placeholderMatches.length; i++) {
        placeholderName = placeholderMatches[i].slice(1).slice(0, -1);
        if (variables[placeholderName] === null || typeof variables[placeholderName] === 'undefined') {
          throw new Error(`Coral.i18n.get: Named key "${placeholderName}" not present in provided object.`);
        }
      }
      
      // If an additional argument is present, it's the translation hint
      if (typeof args[2] === 'string') {
        translationHint = args[2];
      }
    }
    else {
      // Assume no translation hint
      variableCount = args.length - 1;
      
      if (variableCount === variablePlaceholderCount + 1) {
        // If we've got an extra argument, assume it's a translation hint
        translationHint = args[args.length - 1];
      }
      else if (variableCount !== variablePlaceholderCount) {
        throw new Error(`Coral.i18n.get: Number of variable placeholders (${variablePlaceholderCount}) does not match number of variables (${variableCount}).`);
      }
      
      // Build variables object
      for (i = 0; i < variableCount; i++) {
        variables[i] = args[i + 1];
      }
    }
    
    // Include translation hint
    if (translationHint) {
      key = `${key}/[translation hint:${translationHint}]`;
    }
    
    // Fetch the string
    let str = key;
    for (const component in strings) {
      if (typeof strings[component] !== 'undefined' &&
        typeof strings[component][this._locale] !== 'undefined') {
        str = strings[component][this._locale][key] || str;
      }
    }
    
    // Optimization for a string with no placeholder
    // e.g. Coral.i18n.get('English string');
    if (variablePlaceholderCount === 0) {
      return str;
    }
    
    // Replace all variables
    return str.replace(this._evaluate, (name) => {
      name = name.slice(1).slice(0, -1);
      return variables[name];
    });
    
    // @todo use .toLocaleString(Coral.i18n.locale) in a future release
  }
  
  /**
   I18n current locale value. See {@link I18nLocalesEnum}.
   @type {String}
   */
  get locale() {
    return this._locale;
  }
  set locale(newLocale) {
    this._locale = newLocale;
  }
}

// sets default locale, based on document lang attribute, if it exists, or en-US otherwise
const docLang = document.documentElement.lang.toLowerCase();
const locale = locales[docLang] || 'en-US';

/**
 An i18n service.
 
 @type {I18nProvider}
 */
const i18n = new I18nProvider({locale});

export {i18n, strings};
