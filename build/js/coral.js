/* global Typekit */
/* jshint -W033,-W116 */
(function (window, undefined) {

  var typeKitId = 'jwv7ouu';
  
  if ( window.CUI && window.CUI.options && window.CUI.options.typeKitId ) 
  {  
     typeKitId = window.CUI.options.typeKitId;
  }

  var config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    var h = document.getElementsByTagName("html")[0];
    h.className += " wf-loading";
    var t = setTimeout(function () {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
      h.className += " wf-inactive"
    }, config.scriptTimeout);
    var tk = document.createElement("script"), d = false;
    tk.src = '//use.typekit.net/' + config.kitId + '.js';
    tk.type = "text/javascript";
    tk.async = "true";
    tk.onload = tk.onreadystatechange = function () {
      var a = this.readyState;
      if (d || a && a != "complete" && a != "loaded")return;
      d = true;
      clearTimeout(t);
      try {
        Typekit.load(config)
      } catch (b) {
      }
    };
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tk, s);
  }

}(this));

/**
 Crockford's new_constructor pattern, modified to allow walking the prototype chain, automatic constructor/destructor chaining, easy toString methods, and syntactic sugar for calling superclass methods

 @see Base

 @function

 @param {Object} descriptor                        Descriptor object
 @param {String|Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
 @param {Object} descriptor.extend                 The class to extend
 @param {Function} descriptor.construct            The constructor (setup) method for the new class
 @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
 @param {Mixed} descriptor.*                       Other methods and properties for the new class

 @returns {Base} The created class.
 */
var Class;
var Exception;

(function () {
  /**
   @name Base

   @classdesc The abstract class which contains methods that all classes will inherit.
   Base cannot be extended or instantiated and does not exist in the global namespace.
   If you create a class using <code class="prettyprint">new Class()</code> or <code class="prettyprint">MyClass.extend()</code>, it will come with Base' methods.

   @desc Base is an abstract class and cannot be instantiated directly. Constructors are chained automatically, so you never need to call the constructor of an inherited class directly
   @constructs

   @param {Object} options  Instance options. Guaranteed to be defined as at least an empty Object
   */

  /**
   Binds a method of this instance to the execution scope of this instance.

   @name bind
   @memberOf Base.prototype
   @function

   @param {Function} func The this.method you want to bind
   */
  var bindFunc = function (func) {
    // Bind the function to always execute in scope
    var boundFunc = func.bind(this);

    // Store the method name
    boundFunc._methodName = func._methodName;

    // Store the bound function back to the class
    this[boundFunc._methodName] = boundFunc;

    // Return the bound function
    return boundFunc;
  };

  /**
   Extends this class using the passed descriptor.
   Called on the Class itself (not an instance), this is an alternative to using <code class="prettyprint">new Class()</code>.
   Any class created using Class will have this static method on the class itself.

   @name extend
   @memberOf Base
   @function
   @static

   @param {Object} descriptor                        Descriptor object
   @param {String|Function} descriptor.toString   A string or method to use for the toString of this class and instances of this class
   @param {Object} descriptor.extend                 The class to extend
   @param {Function} descriptor.construct            The constructor (setup) method for the new class
   @param {Function} descriptor.destruct             The destructor (teardown) method for the new class
   @param {Anything} descriptor.*                    Other methods and properties for the new class
   */
  var extendClass = function (descriptor) {
    descriptor.extend = this;
    return new Class(descriptor);
  };

  Class = function (descriptor) {
    descriptor = descriptor || {};

    if (descriptor.hasOwnProperty('extend') && !descriptor.extend) {
      throw new Class.NonTruthyExtendError(typeof descriptor.toString === 'function' ? descriptor.toString() : descriptor.toString);
    }

    // Extend Object by default
    var extend = descriptor.extend || Object;

    // Construct and destruct are not required
    var construct = descriptor.construct;
    var destruct = descriptor.destruct;

    // Remove special methods and keywords from descriptor
    delete descriptor.bind;
    delete descriptor.extend;
    delete descriptor.destruct;
    delete descriptor.construct;

    // Add toString method, if necessary
    if (descriptor.hasOwnProperty('toString') && typeof descriptor.toString !== 'function') {
      // Return the string provided
      var classString = descriptor.toString;
      descriptor.toString = function () {
        return classString.toString();
      };
    }
    else if (!descriptor.hasOwnProperty('toString') && extend.prototype.hasOwnProperty('toString')) {
      // Use parent's toString
      descriptor.toString = extend.prototype.toString;
    }

    // The remaining properties in descriptor are our methods
    var methodsAndProps = descriptor;

    // Create an object with the prototype of the class we're extending
    var prototype = Object.create(extend && extend.prototype);

    // Store super class as a property of the new class' prototype
    prototype.superClass = extend.prototype;

    // Copy new methods into prototype
    if (methodsAndProps) {
      for (var key in methodsAndProps) {
        if (methodsAndProps.hasOwnProperty(key)) {
          prototype[key] = methodsAndProps[key];

          // Store the method name so calls to inherited() work
          if (typeof methodsAndProps[key] === 'function') {
            prototype[key]._methodName = key;
            prototype[key]._parentProto = prototype;
          }
        }
      }
    }

    /**
     Call the superclass method with the same name as the currently executing method

     @name inherited
     @memberOf Base.prototype
     @function

     @param {Arguments} args  Unadulterated arguments array from calling function
     */
    prototype.inherited = function (args) {
      // Get the function that call us from the passed arguments objected
      var caller = args.callee;

      // Get the name of the method that called us from a property of the method
      var methodName = caller._methodName;

      if (!methodName) {
        throw new Class.MissingCalleeError(this.toString());
      }

      // Start iterating at the prototype that this function is defined in
      var curProto = caller._parentProto;
      var inheritedFunc = null;

      // Iterate up the prototype chain until we find the inherited function
      while (curProto.superClass) {
        curProto = curProto.superClass;
        inheritedFunc = curProto[methodName];
        if (typeof inheritedFunc === 'function')
          break;
      }

      if (typeof inheritedFunc === 'function') {
        // Store our inherited function
        var oldInherited = this.inherited;

        // Overwrite our inherited function with that of the prototype so the called function can call its parent
        this.inherited = curProto.inherited;

        // Call the inherited function our scope, apply the passed args array
        var retVal = inheritedFunc.apply(this, args);

        // Revert our inherited function to the old function
        this.inherited = oldInherited;

        // Return the value called by the inherited function
        return retVal;
      }
      else {
        throw new Class.InheritedMethodNotFoundError(this.toString(), methodName);
      }
    };

    // Add bind to the prototype of the class
    prototype.bind = bindFunc;

    /**
     Destroys this instance and frees associated memory. Destructors are chained automatically, so the <code class="prettyprint">destruct()</code> method of all inherited classes will be called for you

     @name destruct
     @memberOf Base.prototype
     @function
     */
    prototype.destruct = function () {
      // Call our destruct method first
      if (typeof destruct === 'function') {
        destruct.apply(this);
      }

      // Call superclass destruct method after this class' method
      if (extend && extend.prototype && typeof extend.prototype.destruct === 'function') {
        extend.prototype.destruct.apply(this);
      }
    };

    // Create a chained construct function which calls the superclass' construct function
    prototype.construct = function () {
      // Add a blank object as the first arg to the constructor, if none provided
      var args = arguments; // get around JSHint complaining about modifying arguments
      if (args[0] === undefined) {
        args.length = 1;
        args[0] = {};
      }

      // call superclass constructor
      if (extend && extend.prototype && typeof extend.prototype.construct === 'function') {
        extend.prototype.construct.apply(this, arguments);
      }

      // call constructor
      if (typeof construct === 'function') {
        construct.apply(this, arguments);
      }
    };

    // Create a function that generates instances of our class and calls our construct functions
    /** @ignore */
    var instanceGenerator = function () {
      // Create a new object with the prototype we built
      var instance = Object.create(prototype);

      // Call all inherited construct functions
      prototype.construct.apply(instance, arguments);

      return instance;
    };

    instanceGenerator.toString = prototype.toString;

    // Set the prototype of our instance generator to the prototype of our new class so things like MyClass.prototype.method.apply(this) work
    instanceGenerator.prototype = prototype;

    // Add extend to the instance generator for the class
    instanceGenerator.extend = extendClass;

    // The constructor, as far as JS is concerned, is actually our instance generator
    prototype.constructor = instanceGenerator;

    return instanceGenerator;
  };

  if (!Object.create) {
    /**
     Polyfill for Object.create. Creates a new object with the specified prototype.

     @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/">Mozilla MDN</a>

     @param {Object} prototype  The prototype to create a new object with
     */
    Object.create = function (prototype) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      function Func() {
      }

      Func.prototype = prototype;
      return new Func();
    };
  }

  if (!Function.prototype.bind) {
    /**
     Polyfill for Function.bind. Binds a function to always execute in a specific scope.

     @author <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind">Mozilla MDN</a>

     @param {Object} scope  The scope to bind the function to
     */
    Function.prototype.bind = function (scope) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1);
      var fToBind = this;
      /** @ignore */
      var NoOp = function () {
      };
      /** @ignore */
      var fBound = function () {
        return fToBind.apply(this instanceof NoOp ? this : scope, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      NoOp.prototype = this.prototype;
      fBound.prototype = new NoOp();

      return fBound;
    };
  }

  Exception = new Class({
    extend: Error,
    construct: function () {
      this.name = 'Error';
      this.message = 'General exception';
    },

    toString: function () {
      return this.name + ': ' + this.message;
    }
  });

  var ClassException = Exception.extend({
    name: 'Class Exception'
  });

  // Exceptions
  Class.NonTruthyExtendError = ClassException.extend({
    construct: function (className) {
      this.message = className + ' attempted to extend a non-truthy object';
    }
  });

  Class.InheritedMethodNotFoundError = ClassException.extend({
    construct: function (className, methodName) {
      this.message = className + " can't call method '" + methodName + "', no method defined in parent classes";
    }
  });

  Class.MissingCalleeError = ClassException.extend({
    construct: function (className) {
      this.message = className + " can't call inherited method: calling method did not have _methodName";
    }
  });
}());

(function ($, window, undefined) {
  /**
   * @classdesc The main CUI namespace.
   * @namespace
   *
   * @property {Object} options Main options for CloudUI components.
   * @property {Boolean} options.debug If true, show debug messages for all components.
   * @property {Boolean} options.dataAPI If true, add listeners for widget data APIs.
   * @property {Object} Templates Contains templates used by CUI widgets
   *
   * @example
   * <caption>Change CUI options</caption>
   * <description>You can change CUI options by defining <code>CUI.options</code> before you load CUI.js</description>
   * &lt;script type=&quot;text/javascript&quot;&gt;
   * var CUI = {
   *   options: {
   *     debug: false,
   *     dataAPI: true
   *   }
   * };
   * &lt;/script&gt;
   * &lt;script src=&quot;js/CUI.js&quot;&gt;&lt;/script&gt;
   *
   * preferable include the CUI.js at the bottom before the body closes
   */
  window.CUI = window.CUI || {};

  CUI.options = $.extend({
    debug: false,
    dataAPI: true
  }, CUI.options);

  // REMARK: disabled for now
  // Register partials for all templates
  // Note: this requires the templates to be included BEFORE CUI.js
  /*for (var template in CUI.Templates) {
   Handlebars.registerPartial(template, CUI.Templates[template]);
   }*/

  /**
   * <p><code>cui-contentloaded</code> event is an event that is triggered when a new content is injected to the DOM,
   * which is very similar to {@link https://developer.mozilla.org/en-US/docs/DOM/DOM_event_reference/DOMContentLoaded|DOMContentLoaded} event.</p>
   * <p>This event is normally used so that a JavaScript code can be notified when new content needs to be enhanced (applying event handler, layout, etc).
   * The element where the new content is injected is available at event.target, like so:
   * <pre class="prettyprint linenums jsDocExample">$(document).on("cui-contentloaded", function(e) {
   * var container = e.target;
   * // the container is the element where new content is injected.
   * });</pre>
   * This way the listener can limit the scope of the selector accordingly.</p>
   * <p>It will be triggered at DOMContentLoaded event as well, so component can just listen to this event instead of DOMContentLoaded for enhancement purpose.
   * In that case, the value of event.target is <code>document</code>.</p>
   *
   * @event cui-contentloaded
   */
  $(function () {
    $(document).trigger("cui-contentloaded");
  });

}(jQuery, this));

(function ($, window, undefined) {

  var nextId = 1;

  /**
   * Utility functions used by CoralUI widgets
   * @namespace
   */
  CUI.util = {

    /**
     * Flag if a touch device was detected
     * @type {Boolean}
     */
    isTouch: (function () {
      // CUI-2327 Special value for Win8.x/Chrome
      if (/Windows NT 6\.[23];.*Chrome/.test(window.navigator.userAgent)) {
        return false;
      }

      return 'ontouchstart' in window;
    })(),

    /**
     * delivers a unique id within Coral
     * meant to be used in case a id attribute is necessary but missing
     */
    getNextId: function () {
      return 'coral-' + nextId++;
    },

    /**
     * Get the target element of a data API action using the data attributes of an element.
     *
     * @param {jQuery} $element The jQuery object representing the element to get the target from
     * @return {jQuery} The jQuery object representing the target element
     */
    getDataTarget: function ($element) {
      var href = $element.attr('href');
      var $target = $($element.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
      return $target;
    },

    /**
     * Decapitalize a string by converting the first letter to lowercase.
     *
     * @param {String} str The string to de-capitalize
     * @return {String} The de-capitalized string
     */
    decapitalize: function (str) {
      return str.slice(0, 1).toLowerCase() + str.slice(1);
    },

    /**
     * Capitalize a string by converting the first letter to uppercase.
     *
     * @param {String} str The string to capitalize
     * @return {String} The capitalized string
     */
    capitalize: function (str) {
      return str.slice(0, 1).toUpperCase() + str.slice(1);
    },

    /**
     * Create a jQuery plugin from a class
     * @param {Class} PluginClass The class to create to create the plugin for
     * @param {String} [pluginName=PluginClass.toString()] The name of the plugin to create. The de-capitalized return value of PluginClass.toString() is used if left undefined
     * @param {Function} [callback]                              A function to execute in the scope of the jQuery object when the plugin is activated. Used for tacking on additional initialization procedures or behaviors for other plugin functionality.
     */
    plugClass: function (PluginClass, pluginName, callback) {
      pluginName = pluginName || CUI.util.decapitalize(PluginClass.toString());

      $.fn[pluginName] = function (optionsIn) {
        var pluginArgs = arguments;
        return this.each(function () {
          var $element = $(this);

          // Combine defaults, data, options, and element config
          var options = $.extend({}, $element.data(), typeof optionsIn === 'object' && optionsIn, { element: this });

          // Get instance, if present already
          var instance = $element.data(pluginName) || new PluginClass(options);

          if (typeof optionsIn === 'string') // Call method, pass args
            instance[optionsIn].apply(instance, Array.prototype.slice.call(pluginArgs, 1));
          else if ($.isPlainObject(optionsIn)) // Apply options
            instance.set(optionsIn);

          if (typeof callback === 'function')
            callback.call(this, instance);
        });
      };

      $.fn[pluginName].Constructor = PluginClass;
    },

    /**
     * Register a callback from a string
     *
     * @param {String} callbackAsString The string containing the callback function to register
     * @param {Object} [params] Parameters to provide when executing callback
     * @return {Function} The callback function generated from the provided string
     */
    buildFunction: function (callbackAsString, params) {
      params = params || [];

      if (typeof params === "string") {
        params = [params];
      }

      if (callbackAsString) {
        try {
          var Fn = Function;
          return new Fn(params, "return " + callbackAsString + "(" + params.join(", ") + ");");
        } catch (e) {
          return null;
        }
      }
    },

    /**
     * Selects text in the provided field
     * @param {Number} start (optional) The index where the selection should start (defaults to 0)
     * @param {Number} end (optional) The index where the selection should end (defaults to the text length)
     */
    selectText: function (field, start, end) {
      var value = field.val();

      if (value.length > 0) {
        start = start || 0;
        end = end || value.length;
        var domEl = $(field)[0];
        if (domEl.setSelectionRange) {
          // Mostly all browsers
          domEl.blur();
          domEl.setSelectionRange(start, end);
          domEl.focus();
        } else if (domEl.createTextRange) {
          // IE
          var range = domEl.createTextRange();
          range.collapse(true);
          range.moveEnd("character", end - value.length);
          range.moveStart("character", start);
          range.select();
        }
      }
    },

    /**
     * Utility function to get the value of a nested key within an object
     *
     * @param {Object} object The object to retrieve the value from
     * @param {String} nestedKey The nested key. For instance "foo.bar.baz"
     * @return {Object} The object value for the nested key
     */
    getNested: function (object, nestedKey) {
      if (!nestedKey) {
        return object;
      }

      // Split key into a table
      var keys = typeof nestedKey === "string" ? nestedKey.split(".") : nestedKey;

      // Browse object
      var result = object;
      while (result && keys.length > 0) {
        result = result[keys.shift()];
      }

      return result;
    },

    /**
     * Utility function to transform a string representation of a boolean value into that boolean value
     *
     * @param {String} string representation
     * @return {Boolean} The boolean value of the string
     */
    isTrue: function (str) {
      return str === 'true';
    }

  };

  // add touch class to <html>
  $('html').toggleClass('touch', CUI.util.isTouch);

}(jQuery, this));
(function ($, window, undefined) {

  /**
   * Load remote content in an element with a CUI spinner
   * @param {String} remote The remote URL to pass to $.load
   * @param {Boolean} [force] Set force to true to force the load to happen with every call, even if it has succeeded already. Otherwise, subsequent calls will simply return.
   * @param {Function} [callback] A function to execute in the scope of the jQuery $.load call when the load finishes (whether success or failure). The arguments to the callback are the load results: response, status, xhr.
   */
  $.fn.loadWithSpinner = function (remote, force, callback) {
    var $target = $(this);

    // load remote link, if necessary
    if (remote && (force || $target.data('loaded-remote') !== remote)) {
      // only show the spinner if the request takes an appreciable amount of time, otherwise
      // the flash of the spinner is a little ugly
      var timer = setTimeout(function () {
        $target.html('<div class="spinner large"></div>');
      }, 50);

      $target.load(remote, function (response, status, xhr) {
        clearTimeout(timer); // no need for the spinner anymore!

        if (status === 'error') {
          $target.html('<div class="alert error"><strong>ERROR</strong> Failed to load content: ' + xhr.statusText + ' (' + xhr.status + ')</div>');
          $target.data('loaded-remote', '');
        }

        if (typeof callback === 'function') {
          callback.call(this, response, status, xhr);
        }
      }); // load

      $target.data('loaded-remote', remote);
    } // end if remote
  };

  /**
   * $.fn.on for touch devices only
   * @return {jquery} this, chainable
   */
  $.fn.finger = function () {
    if (CUI.util.isTouch) {
      this.on.apply(this, arguments);
    }
    return this;
  };

  /**
   * $.fn.on for pointer devices only
   * @return {jquery} this, chainable
   */
  $.fn.pointer = function () {
    if (!CUI.util.isTouch) {
      this.on.apply(this, arguments);
    }
    return this;
  };

  /**
   * $.fn.on for touch and pointer devices
   * the first parameter is the finger event the second the pointer event
   * @return {jquery} this, chainable
   */
  $.fn.fipo = function () {
    var args = Array.prototype.slice.call(arguments, 1, arguments.length);

    this.pointer.apply(this, args);

    args[0] = arguments[0];
    this.finger.apply(this, args);

    return this;
  };

  /**
   * :focusable and :tabbable selectors
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * @ignore
   */
  function focusable(element, isTabIndexNotNaN) {
    var map, mapName, img,
      nodeName = element.nodeName.toLowerCase();
    if ("area" === nodeName) {
      map = element.parentNode;
      mapName = map.name;
      if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }
      img = $("img[usemap=#" + mapName + "]")[0];
      return !!img && visible(img);
    }
    return ( /input|select|textarea|button|object/.test(nodeName) ?
      !element.disabled :
      "a" === nodeName ?
        element.href || isTabIndexNotNaN :
        isTabIndexNotNaN) &&
      // the element and all of its ancestors must be visible
      visible(element);
  }

  /**
   * :focusable and :tabbable selectors
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * @ignore
   */
  function visible(element) {
    return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
      return $.css(this, "visibility") === "hidden";
    }).length;
  }

  /**
   * create pseudo selectors :focusable and :tabbable
   * https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
   * support: jQuery >= 1.8
   */
  $.extend($.expr[ ":" ], {
    data: $.expr.createPseudo(function (dataName) {
      return function (elem) {
        return !!$.data(elem, dataName);
      };
    }),

    /**
     * pseudo selector :focusable
     */
    focusable: function (element) {
      return focusable(element, !isNaN($.attr(element, "tabindex")));
    },

    /**
     * pseudo selector :tabbable
     */
    tabbable: function (element) {
      var tabIndex = $.attr(element, "tabindex"),
        isTabIndexNaN = isNaN(tabIndex);
      return ( isTabIndexNaN || tabIndex >= 0 ) && focusable(element, !isTabIndexNaN);
    }
  });

}(jQuery, this));
/*!
 * jQuery UI Position @VERSION
 * http://jqueryui.com
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */
(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow ? "" : within.element.css( "overflow-x" ),
			overflowY = within.isWindow ? "" : within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] );
		return {
			element: withinElement,
			isWindow: isWindow,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: isWindow ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !$.support.offsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem : elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			}
			else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
			else if ( overBottom > 0 ) {
				newOverTop = position.top -  data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function () {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	$.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

}( jQuery ) );

/*!
* toe.js
* version 3.0.2
* author: Damien Antipa
* https://github.com/dantipa/toe.js
*/
(function ($, window, undefined) {

    var state, gestures = {}, touch = {

        active: false,

        on: function () {
            $(document).on('touchstart', touchstart)
                .on('touchmove', touchmove)
                .on('touchend touchcancel', touchend);

            touch.active = true;
        },

        off: function () {
            $(document).off('touchstart', touchstart)
                .off('touchmove', touchmove)
                .off('touchend touchcancel', touchend);

            touch.active = false;
        },

        track: function (namespace, gesture) {
            gestures[namespace] = gesture;
        },

        addEventParam: function (event, extra) {
            var $t = $(event.target),
                pos = $t.offset(),
                param = {
                    pageX: event.point[0].x,
                    pageY: event.point[0].y,
                    offsetX: pos.left - event.point[0].x,
                    offsetY: pos.top - event.point[0].y
                };

            return $.extend(param, extra);
        },

        Event: function (event) { // normalizes and simplifies the event object
            var normalizedEvent = {
                type: event.type,
                timestamp: new Date().getTime(),
                target: event.target,   // target is always consistent through start, move, end
                point: []
            }, points = event.changedTouches ||
                event.originalEvent.changedTouches ||
                event.touches ||
                event.originalEvent.touches;

            $.each(points, function (i, e) {
                normalizedEvent.point.push({
                    x: e.pageX,
                    y: e.pageY
                });
            });

            return normalizedEvent;
        },

        State: function (start) {
            var p = start.point[0];

            return {   // TODO add screenX etc.
                start: start,
                move: [],
                end: null
            };
        },

        calc: {
            getDuration: function (start, end) {
                return end.timestamp - start.timestamp;
            },

            getDistance: function (start, end) {
                return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            },

            getAngle: function (start, end) {
                return Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
            },

            getDirection: function (angle) {
                return angle < -45 && angle > -135 ? 'top':
                    angle >= -45 && angle <= 45 ? 'right':
                        angle >= 45 && angle < 135 ? 'down':
                            angle >= 135 || angle <= -135 ? 'left':
                                'unknown';
            },

            getScale: function (start, move) {
                var sp = start.point,
                    mp = move.point;

                if(sp.length === 2 && mp.length === 2) { // needs to have the position of two fingers
                    return (Math.sqrt(Math.pow(mp[0].x - mp[1].x, 2) + Math.pow(mp[0].y - mp[1].y, 2)) / Math.sqrt(Math.pow(sp[0].x - sp[1].x, 2) + Math.pow(sp[0].y - sp[1].y, 2))).toFixed(2);
                }

                return 0;
            },

            getRotation: function (start, move) {
                var sp = start.point,
                    mp = move.point;

                if(sp.length === 2 && mp.length === 2) {
                    return ((Math.atan2(mp[0].y - mp[1].y, mp[0].x - mp[1].x) * 180 / Math.PI) - (Math.atan2(sp[0].y - sp[1].y, sp[0].x - sp[1].x) * 180 / Math.PI)).toFixed(2);
                }

                return 0;
            }
        }

    }; // touch obj

    function loopHandler(type, event, state, point) {
        $.each(gestures, function (i, g) {
            g[type].call(this, event, state, point);
        });
    }

    function touchstart(event) {
        var start = touch.Event(event);
        state = touch.State(start); // create a new State object and add start event

        loopHandler('touchstart', event, state, start);
    }

    function touchmove(event) {
        var move = touch.Event(event);
        state.move.push(move);

        loopHandler('touchmove', event, state, move);
    }

    function touchend(event) {
        var end = touch.Event(event);
        state.end = end;

        loopHandler('touchend', event, state, end);
    }

    touch.on();

    // add to namespace
    $.toe = touch;

}(jQuery, this));
(function ($, touch, window, undefined) {

    var namespace = 'swipe', cfg = {
            distance: 40, // minimum
            duration: 1200, // maximum
            direction: 'all'
        };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            state[namespace] = {
                finger: start.point.length
            };
        },
        touchmove: function (event, state, move) {
            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;
        },
        touchend: function (event, state, end) {
            var opt = $.extend(cfg, event.data),
                duration,
                distance;

            // calc
            duration = touch.calc.getDuration(state.start, end);
            distance = touch.calc.getDistance(state.start.point[0], end.point[0]);

            // check if the swipe was valid
            if (duration < opt.duration && distance > opt.distance) {

                state[namespace].angle = touch.calc.getAngle(state.start.point[0], end.point[0]);
                state[namespace].direction = touch.calc.getDirection(state[namespace].angle);

                // fire if the amount of fingers match
                if (opt.direction === 'all' || state[namespace].direction === opt.direction) {
                    $(event.target).trigger($.Event(namespace, touch.addEventParam(state.start, state[namespace])));
                }
            }
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var namespace = 'tap', cfg = {
        distance: 10,
        duration: 300,
        finger: 1
    };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            state[namespace] = {
                finger: start.point.length
            };
        },
        touchmove: function (event, state, move) {
            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;
        },
        touchend: function (event, state, end) {
            var opt = $.extend(cfg, event.data),
                duration,
                distance;

            // calc
            duration = touch.calc.getDuration(state.start, end);
            distance = touch.calc.getDistance(state.start.point[0], end.point[0]);

            // check if the tap was valid
            if (duration < opt.duration && distance < opt.distance) {
                // fire if the amount of fingers match
                if (state[namespace].finger === opt.finger) {
                    $(event.target).trigger(
                        $.Event(namespace, touch.addEventParam(state.start, state[namespace]))
                    );
                }
            }
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var timer, abort,
        namespace = 'taphold', cfg = {
            distance: 20,
            duration: 500,
            finger: 1
        };

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            var opt = $.extend(cfg, event.data);

            abort = false;
            state[namespace] = {
                finger: start.point.length
            };

            clearTimeout(timer);
            timer = setTimeout(function () {
                if (!abort && touch.active) {
                    if (state[namespace].finger === opt.finger) {
                        $(event.target).trigger($.Event(namespace, touch.addEventParam(start, state[namespace])));
                    }
                }
            }, opt.duration);
        },
        touchmove: function (event, state, move) {
            var opt = $.extend(cfg, event.data),
                distance;

            // if another finger was used then increment the amount of fingers used
            state[namespace].finger = move.point.length > state[namespace].finger ? move.point.length : state[namespace].finger;

            // calc
            distance = touch.calc.getDistance(state.start.point[0], move.point[0]);
            if (distance > opt.distance) { // illegal move
                abort = true;
            }
        },
        touchend: function (event, state, end) {
            abort = true;
            clearTimeout(timer);
        }
    });

}(jQuery, jQuery.toe, this));
(function ($, touch, window, undefined) {

    var namespace = 'transform', cfg = {
            scale: 0.1, // minimum
            rotation: 15
        },
        started;

    touch.track(namespace, {
        touchstart: function (event, state, start) {
            started = false;
            state[namespace] = {
                start: start,
                move: []
            };
        },
        touchmove: function (event, state, move) {
            var opt = $.extend(cfg, event.data);

            if (move.point.length !== 2) {
                return;
            }

            state[namespace].move.push(move);

            if (state[namespace].start.point.length !== 2 && move.point.length === 2) { // in case the user failed to start with 2 fingers
                state[namespace].start = $.extend({}, move);
            }

            state[namespace].rotation = touch.calc.getRotation(state[namespace].start, move);
            state[namespace].scale = touch.calc.getScale(state[namespace].start, move);

            if (Math.abs(1-state[namespace].scale) > opt.scale || Math.abs(state[namespace].rotation) > opt.rotation) {
                if(!started) {
                    $(event.target).trigger($.Event('transformstart', state[namespace]));
                    started = true;
                }

                $(event.target).trigger($.Event('transform', state[namespace]));
            }
        },
        touchend: function (event, state, end) {
            if(started) {
                started = false;

                if (end.point.length !== 2) { // in case the user failed to end with 2 fingers
                    state.end = $.extend({}, state[namespace].move[state[namespace].move.length - 1]);
                }

                state[namespace].rotation = touch.calc.getRotation(state[namespace].start, state.end);
                state[namespace].scale = touch.calc.getScale(state[namespace].start, state.end);

                $(event.target).trigger($.Event('transformend', state[namespace]));
            }
        }
    });

}(jQuery, jQuery.toe, this));
// Patch for jQueryUI's Position utility. Please remove this patch once the fix makes its way into an official
// jQueryUI release.
// Bug logged against jQueryUI: http://bugs.jqueryui.com/ticket/8710
// Pull request logged against jQueryUI: https://github.com/jquery/jquery-ui/pull/1071
// Bug logged against CoralUI for removal of this patch: https://issues.adobe.com/browse/CUI-1046
(function ($) {
  var abs = Math.abs;
  $.ui.position.flip.top = function (position, data) {
    var within = data.within,
      withinOffset = within.offset.top + within.scrollTop,
      outerHeight = within.height,
      offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
      collisionPosTop = position.top - data.collisionPosition.marginTop,
      overTop = collisionPosTop - offsetTop,
      overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
      top = data.my[ 1 ] === "top",
      myOffset = top ?
        -data.elemHeight :
        data.my[ 1 ] === "bottom" ?
          data.elemHeight :
          0,
      atOffset = data.at[ 1 ] === "top" ?
        data.targetHeight :
        data.at[ 1 ] === "bottom" ?
          -data.targetHeight :
          0,
      offset = -2 * data.offset[ 1 ],
      newOverTop,
      newOverBottom;
    if (overTop < 0) {
      newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
      // Patched code:
      if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
        position.top += myOffset + atOffset + offset;
      }
    }
    else if (overBottom > 0) {
      newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
      // Patched code:
      if (newOverTop > 0 || abs(newOverTop) < overBottom) {
        position.top += myOffset + atOffset + offset;
      }
    }
  };
})(jQuery);
(function ($, window, undefined) {

  CUI.Widget = new Class(/** @lends CUI.Widget# */{
    toString: 'Widget',

    /**
     * @classdesc The base class for all widgets
     *
     * @desc Creates a new widget
     * @constructs
     *
     * @param {Object} options Widget options
     * @param {Boolean} [options.visible=false] If True, show the widget immediately
     */
    construct: function (options) {

      // Store the target element jQuery object:
      this.$element = $(options.element);

      // Get widget name:
      var widgetName = CUI.util.decapitalize(this.toString());

      // See if the target element has a widget instance attached already:
      if (this.$element.data(widgetName) !== undefined) {
        var message = [
          'An instance of',
          this,
          'is already attached to the specified target element.',
          'Future versions of CoralUI will throw an exception at this point.'
        ].join(' ');

        window.console.log(message);
      }

      // Cascade and store options:
      this.options = $.extend(
          {},
          (typeof this.defaults === 'object' && this.defaults),
          this.$element.data(),
          options);

      // Add instance to element's data
      this.$element.data(widgetName, this);

      // Bind functions commonly called by listeners
      this.bind(this.hide);
      this.bind(this.show);
      this.bind(this.toggleVisibility);

      // Show/hide when this.options.visible changes
      this.on('change:visible', function (evt) {
        this[evt.value ? '_show' : '_hide']();
      }.bind(this));
    },

    /**
     * Set a number of options using an object or a string
     * @name set
     * @memberOf CUI.Widget#
     * @function
     *
     * @param {String|Object} option The option to set as a string, or an object of key/value pairs to set
     * @param {String} value The value to set the option to (is ignored when first argument is an object)
     *
     * @return {CUI.Widget} this, chainable
     */
    set: function (optionOrObj, value) {
      if ($.isPlainObject(optionOrObj)) {
        // Set multiple options
        for (var option in optionOrObj) {
          this._set(option, optionOrObj[option]);
        }
      }
      else {
        // Set single option
        this._set(optionOrObj, value);
      }

      return this;
    },

    /**
     * @ignore
     */
    _set: function (option, value) {
      // Trigger a change event
      var e = $.Event('beforeChange:' + option, {
        widget: this, // We want to know who fired this event (used by CUI.Filters, CUI.DropdownList)
        option: option,
        currentValue: this.options[option],
        value: value
      });
      this.$element.trigger(e);

      // Don't set if prevented
      if (e.isDefaultPrevented()) return this;

      // Set value
      this.options[option] = value;

      e = $.Event('change:' + option, {
        widget: this,
        option: option,
        value: value
      });
      this.$element.trigger(e);
    },

    /**
     * Get the value of an option
     * @param {String} option The name of the option to fetch the value of
     * @return {Mixed} Option value
     */
    get: function (option) {
      return this.options[option];
    },

    /**
     * Add an event listener
     * @param {String} evtName The event name to listen for
     * @param {Function} func The function that will be called when the event is triggered
     * @return {CUI.Widget} this, chainable
     */
    on: function (evtName, func) {
      this.$element.on.apply(this.$element, arguments);
      return this;
    },

    /**
     * Remove an event listener
     * @param {String} evtName The event name to stop listening for
     * @param {Function} func     The function that was passed to on()
     * @return {CUI.Widget} this, chainable
     */
    off: function (evtName, func) {
      this.$element.off.apply(this.$element, arguments);
      return this;
    },

    /**
     * Show the widget
     * @return {CUI.Widget} this, chainable
     */
    show: function (evt) {
      evt = evt || {};

      if (this.options.visible)
        return this;

      if (!evt.silent) {
        // Trigger event
        var e = $.Event('show');
        this.$element.trigger(e);

        // Do nothing if event is prevented or we're already visible
        if (e.isDefaultPrevented()) return this;
      }

      this.options.visible = true;

      this._show(evt);

      return this;
    },

    /**
     * @ignore
     */
    _show: function (evt) {
      this.$element.show();
    },

    /**
     * Hide the widget
     *
     * @return {CUI.Widget} this, chainable
     */
    hide: function (evt) {
      evt = evt || {};

      if (!this.options.visible)
        return this;

      if (!evt.silent) {
        // Trigger event
        var e = $.Event('hide');
        this.$element.trigger(e);

        if (e.isDefaultPrevented()) return this;
      }

      this.options.visible = false;

      this._hide(evt);

      return this;
    },

    /**
     * @ignore
     */
    _hide: function (evt) {
      this.$element.hide();
    },

    /**
     * Toggle the visibility of the widget
     * @return {CUI.Widget} this, chainable
     */
    toggleVisibility: function () {
      return this[!this.options.visible ? 'show' : 'hide']();
    },

    /**
     * Set a custom name for this widget.
     *
     * @param {String} customName Component name
     * @return {CUI.Widget} this, chainable
     */
    setName: function (customName) {
      /** @ignore */
      this.toString = function () {
        return customName;
      };

      return this;
    }

    /**
     Triggered when the widget is shown

     @name CUI.Widget#show
     @event
     */

    /**
     Triggered when the widget is hidden

     @name CUI.Widget#hide
     @event
     */

    /**
     Triggered when before an option is changed

     @name CUI.Widget#beforeChange:*
     @event

     @param {Object} evt                    Event object
     @param {Mixed} evt.option              The option that changed
     @param {Mixed} evt.currentValue        The current value
     @param {Mixed} evt.value               The value this option will be changed to
     @param {Function} evt.preventDefault   Call to prevent the option from changing
     */

    /**
     Triggered when an option is changed

     @name CUI.Widget#change:*
     @event

     @param {Object} evt          Event object
     @param {Mixed} evt.option    The option that changed
     @param {Mixed} evt.value     The new value
     */
  });

  /**
   * Utility function to get the widget class instance that's attached to
   * the provided element.
   *
   * @param WidgetClass The type of widget instance to obtain.
   * @param $element The target element to obtain the instance from.
   * @returns The obtained Widget instance, if the target element has an
   * instance attached.
   */
  CUI.Widget.fromElement = function (WidgetClass, $element) {
    return $element.data(CUI.util.decapitalize(WidgetClass.toString()));
  };

  /**
   * The registry object maps data-init selector values to Widget
   * types.
   */
  CUI.Widget.registry = {

    /**
     * Registers the given Widget type as the type that belongs
     * to the provided selector.
     *
     * @param selector String representing the data-init value
     * mapping to Widget.
     * @param Widget Widget subclass that maps to the given
     * selector.
     */
    register: function (selector, Widget) {

      // Register as a jQuery plug-in:
      CUI.util.plugClass(Widget);

      this._widgets[selector] = Widget;

      // Extend the Widget with a static 'init' method:
      Widget.init = function ($element) {
        this._init(Widget, $element);
      }.bind(this);

    },

    /**
     * Look-up the Widget subclass that is mapped to the provided
     * selector String value.
     *
     * @param selector String value to look-up the registered
     * Widget subclass for.
     * @returns a Widget subclass, or undefined if the selector
     * could not be resolved.
     */
    resolve: function (selector) {
      return this._widgets[selector];
    },

    /**
     * Initialize the given jQuery element(s) as Widgets of the
     * type as indicated by the selector argument.
     *
     * @param selector String that indicates what Widget subclass
     * must be used to initialize the element.
     * @param $element The jQuery element(s) that the instances
     * must be bound to.
     */
    init: function (selector, $element) {
      this._init(this.resolve(selector), $element);
    },

    getSelectors: function () {
      var selectors = [];
      for (var selector in this._widgets) {
        selectors.push(selector);
      }
      return selectors;
    },

    /**
     * Maps selector values to Widget types
     * @private
     */
    _widgets: {},

    /**
     * Implementation of the public init method, as well as the
     * init method that gets added to registering Widget classes
     *
     * @param Widget The Widget subclass to instantiate.
     * @param $element The jQuery element(s) that the instances
     * must be bound to.
     * @private
     */
    _init: function (Widget, $element) {
      if (Widget !== undefined) {
        $element.each(function () {
          var $item = $(this);

          if (CUI.Widget.fromElement(Widget, $item) === undefined) {
            new Widget({element: $item});
          }
        });
      }
    }
  };

}(jQuery, this));

(function ($) {

  var CLASS_ACTIVE = "is-active";

  CUI.Accordion = new Class(/** @lends CUI.Accordion# */{
    toString: 'Accordion',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A widget for both accordions and collapsibles

     @desc Creates a new accordion or collapsible
     @constructs

     @param {Object} options                               Widget options.
     @param {Mixed}  [options.active=false]                Index of the initial active tab of the accordion or one of true/false for collapsibles
     @param {boolean} [options.disabled=false]             Set the disabled state of the widget.
     @param {String} [options.iconClassCollapsed="coral-Icon--chevronRight"]
     @param {String} [options.iconClassDisabled="coral-Icon--chevronDown"]
     */
    construct: function (options) {
      this._parseAttributes();
      this._setAccordion();
      this._setListeners();
      this._makeAccessible();
      this._updateDOMForDisabled();
    },

    defaults: {
      active: false,
      disabled: false,
      iconClassCollapsed: 'coral-Icon--chevronRight',
      iconClassExpanded: 'coral-Icon--chevronDown'
    },

    isAccordion: false,

    _parseAttributes: function () {
      var iconClassCollapsed = this.$element.attr('data-icon-class-collapsed');
      if (iconClassCollapsed) {
        this.options.iconClassCollapsed = iconClassCollapsed;
      }
      var iconClassExpanded = this.$element.attr('data-icon-class-expanded');
      if (iconClassExpanded) {
        this.options.iconClassExpanded = iconClassExpanded;
      }
    },

    _setAccordion: function () {
      var $element = this.$element;
      // determines the type of component that it is building
      this.isAccordion = (!$element.hasClass("coral-Collapsible")) && ($element.data("init") !== "collapsible");

      if (this.isAccordion) {
        // adds the required class
        $element.addClass("coral-Accordion");

        var activeIndex = $element.children("." + CLASS_ACTIVE).index();
        if (this.options.active !== false) {
          activeIndex = this.options.active;
        } else {
          // saves the element with the active class as the active element
          this.options.active = activeIndex;
        }
        $element.children().each(function (index, element) {
          this._initElement(element, index != activeIndex);
        }.bind(this));
      } else {

        // checks if the element has the active class.
        this.options.active = $element.hasClass(CLASS_ACTIVE);
        this._initElement($element, !this.options.active);
      }
    },

    _setListeners: function () {
      // header selector
      var selector = this.isAccordion ? '> .coral-Accordion-item > .coral-Accordion-header' : '> .coral-Collapsible-header';
      this.$element.on('click', selector, this._toggle.bind(this));

      this.$element.on("change:active", this._changeActive.bind(this));

      // Prevent text selection on header
      var selectstartSelector = this.isAccordion ? '.coral-Accordion-header' : '.coral-Collapsible-header';
      this.$element.on("selectstart", selectstartSelector, function (event) {
        event.preventDefault();
      });

      this.on('change:disabled', function (event) {
        this._updateDOMForDisabled();
      }.bind(this));
    },

    /**
     * Updates styles and attributes to match the current disabled option value.
     * @ignore */
    _updateDOMForDisabled: function () {
      if (this.options.disabled) {
        this.$element.addClass('is-disabled').attr('aria-disabled', true)
          .find('[role=tab], > [role=button]').removeAttr('tabindex').attr('aria-disabled', true);
      } else {
        this.$element.removeClass('is-disabled').attr('aria-disabled', false)
          .find('[role=tab], > [role=button]').each(function (index, element) {
            var elem = $(element);
            elem.removeAttr('aria-disabled').attr('tabindex', elem.is('[aria-selected=true][aria-controls], [aria-expanded][aria-controls]') ? 0 : -1);
          });
      }
    },

    _toggle: function (event) {
      if (this.options.disabled) {
        return;
      }
      var el = $(event.target).closest(this._getCollapsibleSelector()),
        isCurrentlyActive = el.hasClass(CLASS_ACTIVE),
        active = (isCurrentlyActive) ? false : ((this.isAccordion) ? el.index() : true);
      this.setActive(active);
    },
    _changeActive: function () {
      if (this.isAccordion) {
        this._collapse(this.$element.children("." + CLASS_ACTIVE));
        if (this.options.active !== false) {
          var activeElement = this.$element.children().eq(this.options.active);
          this._expand(activeElement);
        }
      } else {
        if (this.options.active) {
          this._expand(this.$element);
        } else {
          this._collapse(this.$element);
        }
      }
    },
    setActive: function (active) {
      if (active !== this.options.active) {
        this.options.active = active;
        this._changeActive();
      }
    },
    _initElement: function (element, collapse) {
      element = $(element);

      // Add correct header
      if (this._getHeaderElement(element).length === 0) this._prependHeaderElement(element);
      if (this._getHeaderIconElement(element).length === 0) this._prependHeaderIconElement(element);

      // adds the content class
      if (this._getContentElement(element).length === 0) this._prependContentElement(element);

      // adds the corresponding container class
      element.addClass(this.isAccordion ? 'coral-Accordion-item' : 'coral-Collapsible');

      var header = this._getHeaderElement(element),
        content = this._getContentElement(element),
        icon = this._getHeaderIconElement(element);

      // move the heading before the collapsible content
      header.prependTo(element);

      // Set correct initial state
      if (collapse) {
        element.removeClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);
        content.hide();
      } else {
        element.addClass(CLASS_ACTIVE);
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);
        content.show();
      }
    },
    _collapse: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      icon.removeClass(this.options.iconClassExpanded).addClass(this.options.iconClassCollapsed);

      content.slideUp({
        duration: "fast",
        complete: function () {
          el.removeClass(CLASS_ACTIVE); // remove the active class after animation so that background color doesn't change during animation
          el.trigger("deactivate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("collapse", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": header.is(document.activeElement) ? 0 : -1,
          "aria-selected": false
        });
      } else {
        header.attr({
          "aria-expanded": false
        });
      }
      content.attr({
        "aria-hidden": true,
        "aria-expanded": false
      });
    },
    _expand: function (el) {
      var header = this._getHeaderElement(el),
        content = this._getContentElement(el),
        icon = this._getHeaderIconElement(el);

      el.addClass(CLASS_ACTIVE);
      icon.removeClass(this.options.iconClassCollapsed).addClass(this.options.iconClassExpanded);

      content.slideDown({
        duration: "fast",
        complete: function () {
          el.trigger("activate");
        },
        progress: function (animation, progress, remainingMs) {
          el.trigger("expand", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      if (this.isAccordion) {
        header.attr({
          "tabindex": 0,
          "aria-selected": true
        });
      } else {
        header.attr({
          "aria-expanded": true
        });
      }
      content.attr({
        "aria-hidden": false,
        "aria-expanded": true
      }).show();
    },
    /** @ignore */
    _getCollapsibleSelector: function () {
      return this.isAccordion ? '.coral-Accordion-item' : '.coral-Collapsible';
    },
    /** @ignore */
    _getHeaderElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header' : '> .coral-Collapsible-header';
      return el.find(selector);
    },
    /** @ignore */
    _getHeaderFirstElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header:first' : '> .coral-Collapsible-header:first';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-header' : 'coral-Collapsible-header';
      el.prepend("<h3 class=\"" + className + "\">&nbsp;</h3>");
    },
    /** @ignore */
    _getHeaderIconElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-header > i' : '> .coral-Collapsible-header > i';
      return el.find(selector);
    },
    /** @ignore */
    _prependHeaderIconElement: function (el) {
      this._getHeaderElement(el).prepend("<i></i>");
    },
    /** @ignore */
    _getContentElement: function (el) {
      var selector = this.isAccordion ? '> .coral-Accordion-content' : '> .coral-Collapsible-content';
      return el.find(selector);
    },
    /** @ignore */
    _prependContentElement: function (el) {
      var className = this.isAccordion ? 'coral-Accordion-content' : 'coral-Collapsible-content';
      el.prepend("<div class=\"" + className + "\"></div>");
    },
    /**
     * adds accessibility attributes and features
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _makeAccessible: function () {
      var idPrefix = 'accordion-' + new Date().getTime() + '-',
        section, header, content, isActive, panelId;
      if (this.isAccordion) {

        this.$element.attr({
          "role": "tablist" // accordion container has the role="tablist"
        });

        this.$element.children(".coral-Accordion-item").each(function (i, e) {
          var section = $(e),
            header = section.find("> .coral-Accordion-header:first"),
            isActive = section.hasClass(CLASS_ACTIVE),
            panelId = idPrefix + 'panel-' + i,
            content = header.next("div");

          section.attr({
            "role": "presentation" // collapsible containers have the role="presentation"
          });

          header.attr({
            "role": "tab", // accordion headers should have the role="tab"
            "id": header.attr("id") || idPrefix + "tab-" + i, // each tab needs an id
            "aria-controls": panelId, // the id for the content wrapper this header controls
            "aria-selected": isActive, // an indication of the current state
            "tabindex": (isActive ? 0 : -1)
          });

          content.attr({
            "role": "tabpanel", // the content wrapper should have the role="tabpanel"
            "id": panelId, // each content wrapper needs a unique id
            "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
            "aria-expanded": isActive, // an indication of the current state
            "aria-hidden": !isActive // hide/show content to assistive technology
          });
        });

      } else {
        idPrefix = 'collapsible-' + new Date().getTime() + '-';
        section = this.$element;
        header = this._getHeaderFirstElement(section);
        isActive = section.hasClass(CLASS_ACTIVE);
        panelId = idPrefix + 'panel';
        content = header.next("div");

        header.attr({
          "role": "button", // the header should have the role="button"
          "id": header.attr("id") || idPrefix + "heading", // each header needs an id
          "aria-controls": panelId, // the id for the content wrapper this header controls
          "aria-expanded": isActive, // an indication of the current state
          "tabindex": 0
        });

        content.attr({
          "id": panelId, // each content wrapper needs a unique id
          "aria-labelledby": header.attr("id"), // the content wrapper is labelled by its header
          "aria-expanded": isActive, // an indication of the current state
          "aria-hidden": !isActive // hide/show content to assistive technology
        });
      }

      // handle keydown events from focusable descendants
      this.$element.on('keydown', ':focusable', this._onKeyDown.bind(this));

      // handle focusin/focusout events from focusable descendants
      this.$element.on('focusin.accordion', ':focusable', this._onFocusIn.bind(this));
      this.$element.on('focusout.accordion', '.coral-Accordion-header:focusable', this._onFocusOut.bind(this));

      this.$element.on('touchstart.accordion, mousedown.accordion', '.coral-Accordion-header:focusable', this._onMouseDown.bind(this));
    },

    /**
     * keydown event handler, which defines the keyboard behavior of the accordion control
     * per the WAI-ARIA Accordion widget design pattern:
     * http://www.w3.org/WAI/PF/aria-practices/#accordion
     * @private
     */
    _onKeyDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header),
        keymatch = true;

      switch (event.which) {
        case 13: //enter
        case 32: //space
          if (isHead) {
            header.trigger('click');
          } else {
            keymatch = false;
          }
          break;
        case 33: //page up
        case 37: //left arrow
        case 38: //up arrow
          if ((isHead && this.isAccordion) || (event.which === 33 && (event.metaKey || event.ctrlKey))) {
            // If the event.target is an accordion heading, or the key command is CTRL + PAGE_UP,
            // focus the previous accordion heading, or if none exists, focus the last accordion heading.
            if (this._getHeaderFirstElement(el.prev()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + UP or CTRL + LEFT, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 34: //page down
        case 39: //right arrow
        case 40: //down arrow
          if (isHead && this.isAccordion) {
            // If the event.target is an accordion heading,
            // focus the next accordion heading, or if none exists, focus the first accordion heading.
            if (this._getHeaderFirstElement(el.next()).focus().length === 0) {
              this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
            }
          } else if (!isHead && event.which === 34 && (event.metaKey || event.ctrlKey)) {
            // If the event.target is not a collapsible heading,
            // and the key command is CTRL + PAGE_DOWN, focus the collapsible heading.
            header.focus();
          } else {
            keymatch = false;
          }
          break;
        case 36: //home
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:first > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        case 35: //end
          if (isHead && this.isAccordion) {
            this.$element.find("> .coral-Accordion-item:last > .coral-Accordion-header:first").focus();
          } else {
            keymatch = false;
          }
          break;
        default:
          keymatch = false;
          break;
      }

      if (keymatch === true) {
        event.preventDefault();
      }
    },
    /**
     * focusin event handler, used to update tabindex properties on accordion headers
     * and to display focus style on headers.
     * @private
     */
    _onFocusIn: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (this.options.disabled) return;
      if (isHead) {
        if (this.isAccordion) {
          this.$element.find("> .coral-Accordion-item > .coral-Accordion-header[role=tab]").attr('tabindex', -1);
        }
        if (!header.data('collapsible-mousedown')) {
          // el.addClass(':focus');
          el.focus();
        } else {
          header.removeData('collapsible-mousedown');
        }
      }
      header.attr('tabindex', 0);
    },
    /**
     * focusout event handler, used to clear the focus style on headers.
     * @private
     */
    _onFocusOut: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        el.blur().removeData('collapsible-mousedown');
        // el.removeClass(':focus').removeData('collapsible-mousedown');
      }
    },
    /**
     * mousedown event handler, used flag
     * @private
     */
    _onMouseDown: function (event) {
      var el = $(event.currentTarget).closest(this._getCollapsibleSelector()),
        header = this._getHeaderFirstElement(el),
        isHead = $(event.currentTarget).is(header);
      if (isHead) {
        header.data('collapsible-mousedown', true);
      }
    }

    /**
     Triggered when the accordion is activated

     @name CUI.Accordion#activate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered when the accordion is deactivated

     @name CUI.Accordion#deactivate
     @event

     @param {Object} evt                    Event object
     */

    /**
     Triggered while the accordion is expanding after each step of the animation

     @name CUI.Accordion#expand
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

    /**
     Triggered while the accordion is collapsing after each step of the animation

     @name CUI.Accordion#collapse
     @event

     @param {Object} evt                    Event object

     @param options
     @param {Promise} options.animation     The animation promise
     @param {Number} options.progress       The progress
     @param {Number} options.remainingMs    The remaining time of the animation in milliseconds
     */

  });

  CUI.Widget.registry.register("accordion", CUI.Accordion);

// Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.Accordion.init($("[data-init~=accordion],[data-init~=collapsible]", e.target));
  });
}(window.jQuery));

(function ($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc An optionally closeable alert message.

      @desc Creates a new alert
      @constructs

      @param {Object} options                               Component options
      @param {String} [options.heading=Type, capitalized]   Title of the alert
      @param {String} options.content                       Content of the alert
      @param {Boolean} options.closeable                     Array of button descriptors
      @param {String} [options.size=small]                  Size of the alert. Either large or small.
      @param {String} [options.type=error]                  Type of alert to display. One of error, notice, success, help, or info
    */
    construct: function (options) {
      // Catch clicks to dismiss alert
      this.$element.delegate('[data-dismiss="alert"]', 'click.dismiss.alert', this.hide);

      // Add alert class to give styling
      this.$element.addClass('coral-Alert');

      // Listen to changes to configuration
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:closeable', this._setCloseable.bind(this));
      this.$element.on('change:size', this._setSize.bind(this));

      // Read in options "set" by markup so we don't override the values they set
      for (var typeKey in this._types) {
        if (this.$element.hasClass(this._types[typeKey]["class"])) {
          this.options.type = typeKey;
          return false;
        }
      }

      for (var sizeKey in this._sizes) {
        if (this.$element.hasClass(this._sizes[sizeKey])) {
          this.options.size = sizeKey;
          return false;
        }
      }

      this._setCloseable();
      this._setType();
      this._setSize();
      this._setHeading();
      this._setContent();

    },

    defaults: {
      type: 'error',
      size: 'small',
      heading: undefined,
      visible: true,
      closeable: true
    },

    _types: {
      "error" : { "class": "coral-Alert--error", "iconClass": "coral-Icon--alert"},
      "notice" : { "class":  "coral-Alert--notice", "iconClass": "coral-Icon--alert"},
      "success" : { "class":  "coral-Alert--success", "iconClass": "coral-Icon--checkCircle"},
      "help" : { "class":  "coral-Alert--help", "iconClass": "coral-Icon--helpCircle"},
      "info" : { "class":  "coral-Alert--info", "iconClass": "coral-Icon--infoCircle"}
    },

    _sizes: {
      "small" : "",
      "large" : "coral-Alert--large"
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content === 'string') {
        this.$element.find('div').html(this.options.content);
      }
    },

    /** @ignore */
    _setHeading: function () {
      if (typeof this.options.heading === 'string') {
        this.$element.find('strong').html(this.options.heading);
      }
    },

    /** @ignore */
    _setType: function () {
      if (this._isValidType(this.options.type)) {
        var icon = this.$element.find('> .coral-Icon');
        for (var key in this._types) {
           this.$element.removeClass(this._types[key]["class"]);
           icon.removeClass(this._types[key]["iconClass"]);
        }
        this.$element.addClass(this._types[this.options.type]["class"]);
        var iconClass = this._types[this.options.type]["iconClass"];
        icon.addClass(iconClass);
      }

    },

    /** @ignore */
    _setSize: function () {
      if (this._isValidSize(this.options.size)) {
        if (this.options.size === 'small') {
          this.$element.removeClass(this._sizes['large']);
        }
        else {
          this.$element.addClass(this._sizes['large']);
        }
      }
    },

    /** @ignore */
    _setCloseable: function () {
      var el = this.$element.find('.coral-Alert-closeButton');
      if (!el.length && this.options.closeable) {
        // Add the close element if it's not present
        this.$element.prepend('<button class="coral-MinimalButton coral-Alert-closeButton" title="Close" data-dismiss="alert"><i class="coral-Icon coral-Icon--sizeXS coral-Icon--close coral-MinimalButton-icon"></i></button>');
      }
      else {
        el[this.options.closeable ? 'show' : 'hide']();
      }
    },

    /** @ignore */
    _isValidType: function (value) {
      return typeof value == 'string' && this._types.hasOwnProperty(value);
    },

    /** @ignore */
    _isValidSize: function (value) {
      return typeof value == 'string' && this._sizes.hasOwnProperty(value);
    },

    /** @ignore */
    _fixType: function (value) {
      return this._isValidType(value) ? value : this.defaults.type;
    },

    /** @ignore */
    _fixHeading: function (value) {
      return value === undefined ? this._fixType(this.options.type).toUpperCase() : value;
    }

  });

  CUI.Widget.registry.register('alert', CUI.Alert);

  // Data API
  if (CUI.options.dataAPI) {
    $(function () {
      $(document).on('click.alert.data-api', '[data-dismiss="alert"]', function (evt) {
        $(evt.currentTarget).parent().hide();
        evt.preventDefault();
      });
    });
  }
}(window.jQuery));

(function ($) {
  CUI.CharacterCount = new Class(/** @lends CUI.CharacterCount# */{
    toString: 'CharacterCount',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Give visual feedback of the maximum length for textfields/textarea to the user.
     <p>This widget will not restrict the
     user to the max length given: The user can enter as much text
     as he/she wants and will only get visual feedback.</p>
     <p>For textareas some browsers count newline characters differently: While they count as 2 chars in the browsers builtin maxlength support,
     they only count as 1 char in this widget.</p>

     @desc Create a character count for a textfield or textarea.
     @constructs

     @param {Object} options Component options
     @param {Object} [options.related] The related Textfield or TextArea for this component.
     @param {String} [options.maxlength] Maximum length for the Textfield/Textarea (will be read from markup if given)
     */
    construct: function (options) {

      this.$input = $(this.options.related);

      if (this.$input.attr("maxlength")) {
        this.options.maxlength = this.$input.attr("maxlength");
      }
      this.$input.removeAttr("maxlength"); // Remove so that we can do our own error handling

      this.$input.on("input", this._render.bind(this));
      this.$element.on("change:maxlength", this._render.bind(this));
      this.$element.attr("aria-live", "polite");

      this._render();

    },

    defaults: {
      maxlength: null
    },

    /**
     * @private
     * @return {Number} [description]
     */
    _getLength: function () {
      return this.$input.is("input,textarea") ? this.$input.val().length :
        this.$input.text().length;
    },

    _render: function () {
      var len = this._getLength(),
        exceeded = this.options.maxlength ? (len > this.options.maxlength) : false;

      this.$input.toggleClass("is-invalid", exceeded);
      this.$element.toggleClass("is-invalid", exceeded);

      this.$element.text(this.options.maxlength ? (this.options.maxlength - len) : len);
    }
  });

  CUI.Widget.registry.register("character-count", CUI.CharacterCount);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CharacterCount.init($("[data-init~=character-count]", e.target));
  });
}(window.jQuery));



(function ($) {
  "use strict";

  function getNext($collection, current) {
    var currentIndex = current ? $collection.index(current) : -1;

    if (currentIndex === -1 || currentIndex === $collection.length - 1) {
      // current one was not found or current one is the last one
      return $collection.eq(0);
    }
    else {
      // current one was found => return next one
      return $collection.eq(currentIndex + 1);
    }
  }

  CUI.CycleButton = new Class(/** @lends CUI.CycleButton# */{
    toString: "CycleButton",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc
     A component that show the current active item. Only one item can be active at the same time.
     When clicked, the next item of the active is shown and the click is triggered at that next item instead.
     If the last item is clicked, then the first item is shown and triggered accordingly.

     @desc Creates a new instance
     @constructs

     @param {Object} options Widget options
     */
    construct: function () {
      // Currently doesn't support form submission
      // When you need it please raise the issue in the mailing first, as the
      // feature should not be necessarily implemented in this component

      this.$element.on("click", ".coral-CycleButton-button", function (e) {
        if (e._cycleButton) {
          return;
        }

        e.stopImmediatePropagation();
        e.preventDefault();

        var buttons = $(e.delegateTarget).find(".coral-CycleButton-button");
        var next    = getNext(buttons, this);

        buttons.removeClass("is-active");
        next.addClass("is-active").focus();

        var click = $.Event("click", {
          _cycleButton: true
        });
        next.trigger(click);
      });
    }
  });

  CUI.Widget.registry.register("cyclebutton", CUI.CycleButton);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CycleButton.init($("[data-init~='cyclebutton']", e.target));
  });
}(window.jQuery));

/**
 HTTP Utility functions used by CoralUI widgets

 @namespace
 */
CUI.util.HTTP = {
  /**
   * Checks whether the specified status code is OK.
   * @static
   * @param {Number} status The status code
   * @return {Boolean} True if the status is OK, else false
   */
  isOkStatus: function(status) {
    try {
      return (String(status).indexOf("2") === 0);
    } catch (e) {
      return false;
    }
  },

  /**
   * Returns <code>true</code> if HTML5 Upload is supported
   * @return {Boolean} HTML5 Upload support status
   */
  html5UploadSupported: function() {
    var xhr = new XMLHttpRequest();
    return !! (
      xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)
    );
  }
};

(function ($) {
  CUI.FileUpload = new Class(/** @lends CUI.FileUpload# */{
    toString: 'FileUpload',
    extend: CUI.Widget,

    /**
     Triggered when a file is selected and accepted into the queue

     @name CUI.FileUpload#fileselected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when a selected file is rejected before upload

     @name CUI.FileUpload#filerejected
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.message            The reason why the file has been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when the internal upload queue changes (file added, file uploaded, etc.)

     @name CUI.FileUpload#queuechanged
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.operation          The operation on the queue (ADD or REMOVE)
     @param {int} evt.queueLength           The number of items in the queue
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when selected files list is processed

     @name CUI.FileUpload#filelistprocessed
     @event

     @param {Object} evt                    Event object
     @param {int} evt.addedCount            The number of files that have been added to the processing list
     @param {int} evt.rejectedCount         The number of files that have been rejected
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file starts

     @name CUI.FileUpload#fileuploadstart
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file progresses

     @name CUI.FileUpload#fileuploadprogress
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event (from which the upload ratio can be calculated)
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file is completed (for non-HTML5 uploads only, regardless of success status)

     @name CUI.FileUpload#fileuploadload
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {String} evt.content            The server response to the upload request, which needs to be analyzed to determine if upload was successful
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file succeeded

     @name CUI.FileUpload#fileuploadsuccess
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file failed

     @name CUI.FileUpload#fileuploaderror
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {String} evt.message            The reason why the file upload failed
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when upload of a file has been cancelled

     @name CUI.FileUpload#fileuploadcanceled
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing a file item
     @param {Object} evt.originalEvent      The original upload event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging into a drop zone

     @name CUI.FileUpload#dropzonedragenter
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging over a drop zone

     @name CUI.FileUpload#dropzonedragover
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dragging out of a drop zone

     @name CUI.FileUpload#dropzonedragleave
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drag event
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     Triggered when dropping files in a drop zone

     @name CUI.FileUpload#dropzonedrop
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.originalEvent      The original mouse drop event
     @param {FileList} evt.files            The list of dropped files
     @param {Object} evt.fileUpload         The file upload widget
     */

    /**
     @extends CUI.Widget
     @classdesc A file upload widget

     @desc Creates a file upload field
     @constructs

     @param {Object}   options                                    Component options
     @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
     @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
     @param {String}   [options.uploadUrl=null]                   URL where to upload the file. (If none is provided, the wigdet is disabled)
     @param {String}   [options.uploadUrlBuilder=null]            Upload URL builder
     @param {boolean}  [options.disabled=false]                   Is this component disabled?
     @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
     @param {int}      [options.sizeLimit=null]                   File size limit
     @param {Array}    [options.mimeTypes=[]]                     Mime types allowed for uploading (proper mime types, wildcard "*" and file extensions are supported)
     @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
     @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
     @param {boolean}  [options.useHTML5=true]                    (Optional) Prefer HTML5 to upload files (if browser allows it)
     @param {Mixed}    [options.dropZone=null]                    (Optional) jQuery selector or DOM element to use as dropzone (if browser allows it)
     @param {Object}   [options.events={}]                        (Optional) Event handlers
     */
    construct: function (options) {
      // Adjust DOM to our needs
      this._render();

      this.inputElement.on("change", function (event) {
        if (this.options.disabled) {
          return;
        }
        this._onFileSelectionChange(event);
      }.bind(this));

      this._makeAccessible();
    },

    defaults: {
      name: "file",
      placeholder: null,
      uploadUrl: null,
      uploadUrlBuilder: null,
      disabled: false,
      multiple: false,
      sizeLimit: null,
      mimeTypes: [], // Default case: no restriction on mime types
      autoStart: false,
      fileNameParameter: null,
      useHTML5: true,
      dropZone: null,
      events: {}
    },

    inputElement: null,
    $inputContainer: null,
    fileNameElement: null,
    uploadQueue: [],

    /** @ignore */
    _render: function () {
      var self = this;

      // container for the input
      this.$inputContainer = this.$element.find(".coral-FileUpload-trigger");

      // Get the input element
      this.inputElement = this.$inputContainer.find(".coral-FileUpload-input");

      // Read configuration from markup
      this._readDataFromMarkup();

      if (!CUI.util.HTTP.html5UploadSupported()) {
        this.options.useHTML5 = false;
      }

      this._createMissingElements();

      // Register event handlers
      if (this.options.events) {
        if (typeof this.options.events === "object") {
          for (var name in this.options.events) {
            this._registerEventHandler(name, this.options.events[name]);
          }
        }
      }

      // Register drop zone
      if (this.options.useHTML5) {
        this._registerDropZone();
      } else {
        this.options.dropZone = null;
      }

      if (!this.options.placeholder) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }

      if (this.options.autoStart) {
        this._registerEventHandler("fileselected", function (event) {
          event.fileUpload.uploadFile(event.item);
        });
      }

      // URL built via JavaScript function
      if (this.options.uploadUrlBuilder) {
        this.options.uploadUrl = this.options.uploadUrlBuilder(this);
      }

      if (!this.options.uploadUrl || /\$\{.+\}/.test(this.options.uploadUrl)) {
        this.options.disabled = true;
      }

      this._update();
    },

    /** @ignore */
    _makeAccessible: function() {
      if (this.$inputContainer.is('button')) {
        var $span = $('<span>'),
            attributes = this.$inputContainer.prop('attributes');

        // loop through <button> attributes and apply them on <span>
        $.each(attributes, function() {
            $span.attr(this.name, this.value);
        });

        $span.insertBefore(this.$inputContainer);
        $span.append(this.$inputContainer.children());

        this.$inputContainer.remove();
        this.$inputContainer = $span;
      }

      if ((this.inputElement.attr('id') && $('label[for="' + this.inputElement.attr('id') + '"]').length === 0) || this.inputElement.closest('label').text().trim().length === 0) {
        if (this.inputElement.is('[title]:not([aria-label]):not([aria-labelledby])')) {
          if (!this.inputElement.attr('id')) {
            this.inputElement.attr('id', CUI.util.getNextId());
          }
          var $label = $('<label>'),
              $target = this.$element.find('.coral-FileUpload-trigger .coral-Icon');
          if (!$target.length) {
              $target = this.$element.find('.coral-FileUpload-trigger input');
          }

          $label.attr('for', this.inputElement.attr('id'))
            .text(this.inputElement.attr('title'));

          if (this.inputElement.closest('.coral-Icon').length) {
            $label.addClass('u-coral-screenReaderOnly');
          }

          $target.after($label);
        }
      }

      this.inputElement
        .on("focusin.cui-fileupload focusout.cui-fileupload", this._toggleIsFocused.bind(this));
    },

    /** @ignore */
    _toggleIsFocused: function(event) {
      this.$inputContainer.toggleClass('is-focused', event.type === 'focusin');
    },

    _registerDropZone: function () {
      var self = this;

      if (!self.options.dropZone) {
        // No dropZone specified, a default one that wraps the whole fileupload is then created
        self.$element.addClass("coral-FileUpload--dropSupport");

        self.options.dropZone = self.$element;
      }

      // Try to get the drop zone via a jQuery selector
      try {
        self.options.dropZone = $(self.options.dropZone);
      } catch (e) {
        delete self.options.dropZone;
      }

      if (self.options.dropZone) {
        self.options.dropZone
            .on("dragenter", function (e) {
              if (self._isActive()) {

                if (e.stopPropagation) {
                  e.stopPropagation();
                }
                if (e.preventDefault) {
                  e.preventDefault();
                }

                self.$element.trigger({
                  type: "dropzonedragenter",
                  originalEvent: e,
                  fileUpload: self
                });
              }

              return false;
            })
          .on("dragover", function (e) {
            if (self._isActive()) {
              self.isDragOver = true;

              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.$element.trigger({
                type: "dropzonedragover",
                originalEvent: e,
                fileUpload: self
              });
            }

            return false;
          })
          .on("dragleave", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              self.isDragOver = false;

              window.setTimeout(function () {
                if (!self.isDragOver) {
                  self.$element.trigger({
                    type: "dropzonedragleave",
                    originalEvent: e,
                    fileUpload: self
                  });
                }
              }, 1);
            }

            return false;
          })
          .on("drop", function (e) {
            if (self._isActive()) {
              if (e.stopPropagation) {
                e.stopPropagation();
              }
              if (e.preventDefault) {
                e.preventDefault();
              }

              var files = e.originalEvent.dataTransfer.files;

              self.$element.trigger({
                type: "dropzonedrop",
                originalEvent: e,
                files: files,
                fileUpload: self
              });

              self._onFileSelectionChange(e, files);
            }

            return false;
          })
        ;
      }
    },

    _registerEventHandler: function (name, handler) {
      this.$element.on(name, handler);
    },

    _createMissingElements: function () {
      var self = this;

      var multiple = self.options.useHTML5 && self.options.multiple;
      if (self.inputElement.length === 0) {
        self.inputElement = $("<input/>", {
          type: "file",
          'class': 'coral-FileUpload-input',
          name: self.options.name,
          multiple: multiple
        });
        self.$inputContainer.prepend(self.inputElement);
      } else {
        self.inputElement.attr("multiple", multiple);
      }
    },

    /** @ignore */
    _readDataFromMarkup: function () {
      var self = this;
      if (this.inputElement.attr("name")) {
        this.options.name = this.inputElement.attr("name");
      }
      if (this.inputElement.attr("placeholder")) {
        this.options.placeholder = this.inputElement.attr("placeholder");
      }
      if (this.inputElement.data("placeholder")) {
        this.options.placeholder = this.inputElement.data("placeholder");
      }
      if (this.inputElement.attr("disabled") || this.inputElement.data("disabled")) {
        this.options.disabled = true;
      }
      if (this.inputElement.attr("multiple") || this.inputElement.data("multiple")) {
        this.options.multiple = true;
      }
      if (this.inputElement.data("uploadUrl")) {
        this.options.uploadUrl = this.inputElement.data("uploadUrl");
      }
      if (this.inputElement.data("uploadUrlBuilder")) {
        this.options.uploadUrlBuilder = CUI.util.buildFunction(this.inputElement.data("uploadUrlBuilder"), ["fileUpload"]);
      }
      if (this.inputElement.data("mimeTypes")) {
        this.options.mimeTypes = this.inputElement.data("mimeTypes");
      }
      if (this.inputElement.data("sizeLimit")) {
        this.options.sizeLimit = this.inputElement.data("sizeLimit");
      }
      if (this.inputElement.data("autoStart")) {
        this.options.autoStart = true;
      }
      if (this.inputElement.data("usehtml5")) {
        this.options.useHTML5 = this.inputElement.data("usehtml5") === true;
      }
      if (this.inputElement.data("dropzone")) {
        this.options.dropZone = this.inputElement.data("dropzone");
      }
      if (this.inputElement.data("fileNameParameter")) {
        this.options.fileNameParameter = this.inputElement.data("fileNameParameter");
      }
      var inputElementHTML = this.inputElement.length ? this.inputElement.get(0) : undefined;
      if (inputElementHTML) {
        $.each(inputElementHTML.attributes, function (i, attribute) {
          var match = /^data-event-(.*)$/.exec(attribute.name);
          if (match && match.length > 1) {
            var eventHandler = CUI.util.buildFunction(attribute.value, ["event"]);
            if (eventHandler) {
              self.options.events[match[1]] = eventHandler.bind(self);
            }
          }
        });
      }
    },

    /** @ignore */
    _update: function () {
      if (this.options.placeholder) {
        this.inputElement.attr("placeholder", this.options.placeholder);
      }

      if (this.options.disabled) {
        this.$element.addClass("is-disabled");
        this.$inputContainer.addClass("is-disabled");
        this.inputElement.attr("disabled", "disabled");
      } else {
        this.$element.removeClass("is-disabled");
        this.$inputContainer.removeClass("is-disabled");
        this.inputElement.removeAttr("disabled");
      }
    },

    /** @ignore */
    _onFileSelectionChange: function (event, files) {
      var addedCount = 0, rejectedCount = 0;
      if (this.options.useHTML5) {
        files = files || event.target.files;
        for (var i = 0; i < files.length; i++) {
          if (this._addFile(files[i])) {
            addedCount++;
          } else {
            rejectedCount++;
          }
        }
      } else {
        if (this._addFile(event.target)) {
          addedCount++;
        } else {
          rejectedCount++;
        }
      }

      this.$element.trigger({
        type: "filelistprocessed",
        addedCount: addedCount,
        rejectedCount: rejectedCount,
        fileUpload: this
      });
    },

    /** @ignore */
    _addFile: function (file) {
      var self = this;

      var fileName,
        fileMimeType;
      if (this.options.useHTML5) {
        fileName = file.name;
        fileMimeType = file.type;
      } else {
        fileName = $(file).attr("value") || file.value;
      }

      fileMimeType = fileMimeType || CUI.FileUpload.MimeTypes.getMimeTypeFromFileName(fileName);

      if (fileName.lastIndexOf("\\") !== -1) {
        fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
      }

      // if no autostart is used we need to set fileNameParameter as an additional form input field
      // to be submitted with the form.
      if (self.options.fileNameParameter && !this.options.autoStart) {
        if (!self.fileNameElement) {
          // check if there is already a form input field defined to store the parameter
          self.fileNameElement = $("input[name=\"" + self.options.fileNameParameter + "\"]");
          if (self.fileNameElement.length === 0) {
            // create and append
            self.fileNameElement = $("<input/>", {
              type: "hidden",
              name: self.options.fileNameParameter
            });
            self.fileNameElement.appendTo(self.$element);
          }
        }
        self.fileNameElement.val(fileName);
      }

      if (!self._getQueueItemByFileName(fileName)) {
        var item = {
          fileName: fileName
        };
        if (this.options.useHTML5) {
          item.file = file;
          item.fileSize = file.size;

          // Check file size
          if (self.options.sizeLimit && file.size > self.options.sizeLimit) {
            self.$element.trigger({
              type: "filerejected",
              item: item,
              message: "File is too big",
              fileUpload: self
            });
            return false;
          }
        }

        // Check file mime type against allowed mime types
        if (!self._checkMimeTypes(fileMimeType)) {
          self.$element.trigger({
            type: "filerejected",
            item: item,
            message: "File mime type is not allowed",
            fileUpload: self
          });
          return false;
        }

        // Add item to queue
        self.uploadQueue.push(item);
        self.$element.trigger({
          type: "queuechanged",
          item: item,
          operation: "ADD",
          queueLength: self.uploadQueue.length,
          fileUpload: self
        });

        self.$element.trigger({
          type: "fileselected",
          item: item,
          fileUpload: self
        });

        return true;
      }

      return false;
    },

    /** @ignore */
    _checkMimeTypes: function (fileMimeType) {
      function isMimeTypeAllowed(fileMimeType, allowedMimeType) {
        var mimeTypeRegEx = /(.+)\/(.+)$/,      // "text/plain"
          fileExtensionRegEx = /\.(.+)$/,     // ".txt"
          shortcutRegEx = /.*/,               // "text"
          isAllowed = false;

        if (allowedMimeType === "*" || allowedMimeType === ".*" || allowedMimeType === "*/*") {
          // Explicit wildcard case: allow any file
          isAllowed = true;
        } else if (!fileMimeType || !fileMimeType.match(mimeTypeRegEx)) {
          // File mime type is erroneous
          isAllowed = false;
        } else if (allowedMimeType.match(mimeTypeRegEx)) {
          // Proper mime type case: directly compare with file mime type
          isAllowed = (fileMimeType === allowedMimeType);
        } else if (allowedMimeType.match(fileExtensionRegEx)) {
          // File extension case: map extension to proper mime type and then compare
          isAllowed = (fileMimeType === CUI.FileUpload.MimeTypes[allowedMimeType]);
        } else if (allowedMimeType.match(shortcutRegEx)) {
          // "Shortcut" case: only compare first part of the file mime type with the shortcut
          isAllowed = (fileMimeType.split("/")[0] === allowedMimeType);
        }
        return isAllowed;
      }

      var length = this.options.mimeTypes.length,
        i;

      if (length === 0) {
        // No restriction has been defined (default case): allow any file
        return true;
      } else {
        // Some restrictions have been defined
        for (i = 0; i < length; i += 1) {
          if (isMimeTypeAllowed(fileMimeType, this.options.mimeTypes[i])) {
            return true;
          }
        }
        // The file mime type matches none of the mime types allowed
        return false;
      }

    },

    /** @ignore */
    _getQueueIndex: function (fileName) {
      var index = -1;
      $.each(this.uploadQueue, function (i, item) {
        if (item.fileName === fileName) {
          index = i;
          return false;
        }
      });
      return index;
    },

    /** @ignore */
    _getQueueItem: function (index) {
      return index > -1 ? this.uploadQueue[index] : null;
    },

    /** @ignore */
    _getQueueItemByFileName: function (fileName) {
      return this._getQueueItem(this._getQueueIndex(fileName));
    },

    /**
     Upload a file item

     @param {Object} item                   Object representing a file item
     */
    uploadFile: function (item) {
      var self = this;

      if (self.options.useHTML5) {
        item.xhr = new XMLHttpRequest();
        item.xhr.addEventListener("loadstart", function (e) {
          self._onUploadStart(e, item);
        }, false);
        item.xhr.addEventListener("load", function (e) {
          self._onUploadLoad(e, item);
        }, false);
        item.xhr.addEventListener("error", function (e) {
          self._onUploadError(e, item);
        }, false);
        item.xhr.addEventListener("abort", function (e) {
          self._onUploadCanceled(e, item);
        }, false);

        var upload = item.xhr.upload;
        upload.addEventListener("progress", function (e) {
          self._onUploadProgress(e, item);
        }, false);

        // TODO: encoding of special characters in file names
        var file = item.file;
        var fileName = item.fileName;
        if (window.FormData) {
          var f = new FormData();
          if (self.options.fileNameParameter) {
            // Custom file and file name parameter
            f.append(self.inputElement.attr("name"), file);
            f.append(self.options.fileNameParameter || "fileName", fileName);
          } else {
            f.append(fileName, file);
          }
          f.append("_charset_", "utf-8");

          item.xhr.open("POST", self.options.uploadUrl + "?:ck=" + new Date().getTime(), true);
          item.xhr.send(f);
        } else {
          item.xhr.open("PUT", self.options.uploadUrl + "/" + fileName, true);
          item.xhr.send(file);
        }

      } else {
        var $body = $(document.body);

        // Build an iframe
        var iframeName = "upload-" + new Date().getTime();
        var $iframe = $("<iframe/>", {
          name: iframeName,
          "class": "coral-FileUpload-iframe"
        }).appendTo($body);

        // Build a form
        var $form = $("<form/>", {
          method: "post",
          enctype: "multipart/form-data",
          action: self.options.uploadUrl,
          target: iframeName,
          "class": "coral-FileUpload-form"
        }).appendTo($body);

        var $charset = $("<input/>", {
          type: "hidden",
          name: "_charset_",
          value: "utf-8"
        });
        $form.prepend($charset);

        // Define value of the file name element
        if (this.options.fileNameParameter) {
          this.fileNameElement = $("<input/>", {
            type: "hidden",
            name: this.options.fileNameParameter,
            value: item.fileName
          });
          $form.prepend(this.fileNameElement);
        }

        $iframe.one("load", function () {
          var content = this.contentWindow.document.body.innerHTML;
          self.inputElement.appendTo(self.$inputContainer);
          $form.remove();
          $iframe.remove();

          self.$element.trigger({
            type: "fileuploadload",
            item: item,
            content: content,
            fileUpload: self
          });
        });

        self.inputElement.prependTo($form);
        $form.submit();
      }
    },

    /**
     Cancel upload of a file item

     @param {Object} item                   Object representing a file item
     */
    cancelUpload: function (item) {
      item.xhr.abort();
    },

    /** @ignore */
    _onUploadStart: function (e, item) {
      this.$element.trigger({
        type: "fileuploadstart",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadProgress: function (e, item) {
      // Update progress bar
      this.$element.trigger({
        type: "fileuploadprogress",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadLoad: function (e, item) {
      var request = e.target;
      if (request.readyState === 4) {
        this._internalOnUploadLoad(e, item, request.status, request.responseText);
      }
    },

    /** @ignore */
    _internalOnUploadLoad: function (e, item, requestStatus, responseText) {
      if (CUI.util.HTTP.isOkStatus(requestStatus)) {
        this.$element.trigger({
          type: "fileuploadsuccess",
          item: item,
          originalEvent: e,
          fileUpload: this
        });
      } else {
        this.$element.trigger({
          type: "fileuploaderror",
          item: item,
          originalEvent: e,
          message: responseText,
          fileUpload: this
        });
      }

      // Remove file name element if needed
      if (this.fileNameElement) {
        this.fileNameElement.remove();
      }

      // Remove queue item
      this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
      this.$element.trigger({
        type: "queuechanged",
        item: item,
        operation: "REMOVE",
        queueLength: this.uploadQueue.length,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadError: function (e, item) {
      this.$element.trigger({
        type: "fileuploaderror",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _onUploadCanceled: function (e, item) {
      this.$element.trigger({
        type: "fileuploadcanceled",
        item: item,
        originalEvent: e,
        fileUpload: this
      });
    },

    /** @ignore */
    _isActive: function () {
      return !this.inputElement.is(':disabled');
    }

  });

  CUI.Widget.registry.register("fileupload", CUI.FileUpload);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FileUpload.init($("[data-init~='fileupload']", e.target));
    });
  }

}(window.jQuery));

(function ($) {
  CUI.FileUpload.MimeTypes =
  {
    ".123": "application/vnd.lotus-1-2-3",
    ".3dml": "text/vnd.in3d.3dml",
    ".3g2": "video/3gpp2",
    ".3gp": "video/3gpp",
    ".a": "application/octet-stream",
    ".aab": "application/x-authorware-bin",
    ".aac": "audio/x-aac",
    ".aam": "application/x-authorware-map",
    ".aas": "application/x-authorware-seg",
    ".abw": "application/x-abiword",
    ".acc": "application/vnd.americandynamics.acc",
    ".ace": "application/x-ace-compressed",
    ".acu": "application/vnd.acucobol",
    ".acutc": "application/vnd.acucorp",
    ".adp": "audio/adpcm",
    ".aep": "application/vnd.audiograph",
    ".afm": "application/x-font-type1",
    ".afp": "application/vnd.ibm.modcap",
    ".ai": "application/postscript",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".air": "application/vnd.adobe.air-application-installer-package+zip",
    ".ami": "application/vnd.amiga.ami",
    ".apk": "application/vnd.android.package-archive",
    ".application": "application/x-ms-application",
    ".apr": "application/vnd.lotus-approach",
    ".asc": "application/pgp-signature",
    ".asf": "video/x-ms-asf",
    ".asm": "text/x-asm",
    ".aso": "application/vnd.accpac.simply.aso",
    ".asx": "video/x-ms-asf",
    ".atc": "application/vnd.acucorp",
    ".atom": "application/atom+xml",
    ".atomcat": "application/atomcat+xml",
    ".atomsvc": "application/atomsvc+xml",
    ".atx": "application/vnd.antix.game-component",
    ".au": "audio/basic",
    ".avi": "video/x-msvideo",
    ".aw": "application/applixware",
    ".azf": "application/vnd.airzip.filesecure.azf",
    ".azs": "application/vnd.airzip.filesecure.azs",
    ".azw": "application/vnd.amazon.ebook",
    ".bat": "application/x-msdownload",
    ".bcpio": "application/x-bcpio",
    ".bdf": "application/x-font-bdf",
    ".bdm": "application/vnd.syncml.dm+wbxml",
    ".bh2": "application/vnd.fujitsu.oasysprs",
    ".bin": "application/octet-stream",
    ".bmi": "application/vnd.bmi",
    ".bmp": "image/bmp",
    ".book": "application/vnd.framemaker",
    ".box": "application/vnd.previewsystems.box",
    ".boz": "application/x-bzip2",
    ".bpk": "application/octet-stream",
    ".btif": "image/prs.btif",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".c": "text/x-c",
    ".c4d": "application/vnd.clonk.c4group",
    ".c4f": "application/vnd.clonk.c4group",
    ".c4g": "application/vnd.clonk.c4group",
    ".c4p": "application/vnd.clonk.c4group",
    ".c4u": "application/vnd.clonk.c4group",
    ".cab": "application/vnd.ms-cab-compressed",
    ".car": "application/vnd.curl.car",
    ".cat": "application/vnd.ms-pki.seccat",
    ".cc": "text/x-c",
    ".cct": "application/x-director",
    ".ccxml": "application/ccxml+xml",
    ".cdbcmsg": "application/vnd.contact.cmsg",
    ".cdf": "application/x-netcdf",
    ".cdkey": "application/vnd.mediastation.cdkey",
    ".cdx": "chemical/x-cdx",
    ".cdxml": "application/vnd.chemdraw+xml",
    ".cdy": "application/vnd.cinderella",
    ".cer": "application/pkix-cert",
    ".cgm": "image/cgm",
    ".chat": "application/x-chat",
    ".chm": "application/vnd.ms-htmlhelp",
    ".chrt": "application/vnd.kde.kchart",
    ".cif": "chemical/x-cif",
    ".cii": "application/vnd.anser-web-certificate-issue-initiation",
    ".cil": "application/vnd.ms-artgalry",
    ".cla": "application/vnd.claymore",
    ".class": "application/java-vm",
    ".clkk": "application/vnd.crick.clicker.keyboard",
    ".clkp": "application/vnd.crick.clicker.palette",
    ".clkt": "application/vnd.crick.clicker.template",
    ".clkw": "application/vnd.crick.clicker.wordbank",
    ".clkx": "application/vnd.crick.clicker",
    ".clp": "application/x-msclip",
    ".cmc": "application/vnd.cosmocaller",
    ".cmdf": "chemical/x-cmdf",
    ".cml": "chemical/x-cml",
    ".cmp": "application/vnd.yellowriver-custom-menu",
    ".cmx": "image/x-cmx",
    ".cod": "application/vnd.rim.cod",
    ".com": "application/x-msdownload",
    ".conf": "text/plain",
    ".cpio": "application/x-cpio",
    ".cpp": "text/x-c",
    ".cpt": "application/mac-compactpro",
    ".crd": "application/x-mscardfile",
    ".crl": "application/pkix-crl",
    ".crt": "application/x-x509-ca-cert",
    ".csh": "application/x-csh",
    ".csml": "chemical/x-csml",
    ".csp": "application/vnd.commonspace",
    ".css": "text/css",
    ".cst": "application/x-director",
    ".csv": "text/csv",
    ".cu": "application/cu-seeme",
    ".curl": "text/vnd.curl",
    ".cww": "application/prs.cww",
    ".cxt": "application/x-director",
    ".cxx": "text/x-c",
    ".daf": "application/vnd.mobius.daf",
    ".dataless": "application/vnd.fdsn.seed",
    ".davmount": "application/davmount+xml",
    ".dcr": "application/x-director",
    ".dcurl": "text/vnd.curl.dcurl",
    ".dd2": "application/vnd.oma.dd2+xml",
    ".ddd": "application/vnd.fujixerox.ddd",
    ".deb": "application/x-debian-package",
    ".def": "text/plain",
    ".deploy": "application/octet-stream",
    ".der": "application/x-x509-ca-cert",
    ".dfac": "application/vnd.dreamfactory",
    ".dic": "text/x-c",
    ".diff": "text/plain",
    ".dir": "application/x-director",
    ".dis": "application/vnd.mobius.dis",
    ".dist": "application/octet-stream",
    ".distz": "application/octet-stream",
    ".djv": "image/vnd.djvu",
    ".djvu": "image/vnd.djvu",
    ".dll": "application/x-msdownload",
    ".dmg": "application/octet-stream",
    ".dms": "application/octet-stream",
    ".dna": "application/vnd.dna",
    ".doc": "application/msword",
    ".docm": "application/vnd.ms-word.document.macroenabled.12",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".dot": "application/msword",
    ".dotm": "application/vnd.ms-word.template.macroenabled.12",
    ".dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    ".dp": "application/vnd.osgi.dp",
    ".dpg": "application/vnd.dpgraph",
    ".dsc": "text/prs.lines.tag",
    ".dtb": "application/x-dtbook+xml",
    ".dtd": "application/xml-dtd",
    ".dts": "audio/vnd.dts",
    ".dtshd": "audio/vnd.dts.hd",
    ".dump": "application/octet-stream",
    ".dvi": "application/x-dvi",
    ".dwf": "model/vnd.dwf",
    ".dwg": "image/vnd.dwg",
    ".dxf": "image/vnd.dxf",
    ".dxp": "application/vnd.spotfire.dxp",
    ".dxr": "application/x-director",
    ".ecelp4800": "audio/vnd.nuera.ecelp4800",
    ".ecelp7470": "audio/vnd.nuera.ecelp7470",
    ".ecelp9600": "audio/vnd.nuera.ecelp9600",
    ".ecma": "application/ecmascript",
    ".edm": "application/vnd.novadigm.edm",
    ".edx": "application/vnd.novadigm.edx",
    ".efif": "application/vnd.picsel",
    ".ei6": "application/vnd.pg.osasli",
    ".elc": "application/octet-stream",
    ".eml": "message/rfc822",
    ".emma": "application/emma+xml",
    ".eol": "audio/vnd.digital-winds",
    ".eot": "application/vnd.ms-fontobject",
    ".eps": "application/postscript",
    ".epub": "application/epub+zip",
    ".es3": "application/vnd.eszigno3+xml",
    ".esf": "application/vnd.epson.esf",
    ".et3": "application/vnd.eszigno3+xml",
    ".etx": "text/x-setext",
    ".exe": "application/x-msdownload",
    ".ext": "application/vnd.novadigm.ext",
    ".ez": "application/andrew-inset",
    ".ez2": "application/vnd.ezpix-album",
    ".ez3": "application/vnd.ezpix-package",
    ".f": "text/x-fortran",
    ".f4v": "video/x-f4v",
    ".f77": "text/x-fortran",
    ".f90": "text/x-fortran",
    ".fbs": "image/vnd.fastbidsheet",
    ".fdf": "application/vnd.fdf",
    ".fe_launch": "application/vnd.denovo.fcselayout-link",
    ".fg5": "application/vnd.fujitsu.oasysgp",
    ".fgd": "application/x-director",
    ".fh": "image/x-freehand",
    ".fh4": "image/x-freehand",
    ".fh5": "image/x-freehand",
    ".fh7": "image/x-freehand",
    ".fhc": "image/x-freehand",
    ".fig": "application/x-xfig",
    ".fli": "video/x-fli",
    ".flo": "application/vnd.micrografx.flo",
    ".flv": "video/x-flv",
    ".flw": "application/vnd.kde.kivio",
    ".flx": "text/vnd.fmi.flexstor",
    ".fly": "text/vnd.fly",
    ".fm": "application/vnd.framemaker",
    ".fnc": "application/vnd.frogans.fnc",
    ".for": "text/x-fortran",
    ".fpx": "image/vnd.fpx",
    ".frame": "application/vnd.framemaker",
    ".fsc": "application/vnd.fsc.weblaunch",
    ".fst": "image/vnd.fst",
    ".ftc": "application/vnd.fluxtime.clip",
    ".fti": "application/vnd.anser-web-funds-transfer-initiation",
    ".fvt": "video/vnd.fvt",
    ".fzs": "application/vnd.fuzzysheet",
    ".g3": "image/g3fax",
    ".gac": "application/vnd.groove-account",
    ".gdl": "model/vnd.gdl",
    ".geo": "application/vnd.dynageo",
    ".gex": "application/vnd.geometry-explorer",
    ".ggb": "application/vnd.geogebra.file",
    ".ggt": "application/vnd.geogebra.tool",
    ".ghf": "application/vnd.groove-help",
    ".gif": "image/gif",
    ".gim": "application/vnd.groove-identity-message",
    ".gmx": "application/vnd.gmx",
    ".gnumeric": "application/x-gnumeric",
    ".gph": "application/vnd.flographit",
    ".gqf": "application/vnd.grafeq",
    ".gqs": "application/vnd.grafeq",
    ".gram": "application/srgs",
    ".gre": "application/vnd.geometry-explorer",
    ".grv": "application/vnd.groove-injector",
    ".grxml": "application/srgs+xml",
    ".gsf": "application/x-font-ghostscript",
    ".gtar": "application/x-gtar",
    ".gtm": "application/vnd.groove-tool-message",
    ".gtw": "model/vnd.gtw",
    ".gv": "text/vnd.graphviz",
    ".gz": "application/x-gzip",
    ".h": "text/x-c",
    ".h261": "video/h261",
    ".h263": "video/h263",
    ".h264": "video/h264",
    ".hbci": "application/vnd.hbci",
    ".hdf": "application/x-hdf",
    ".hh": "text/x-c",
    ".hlp": "application/winhlp",
    ".hpgl": "application/vnd.hp-hpgl",
    ".hpid": "application/vnd.hp-hpid",
    ".hps": "application/vnd.hp-hps",
    ".hqx": "application/mac-binhex40",
    ".htke": "application/vnd.kenameaapp",
    ".htm": "text/html",
    ".html": "text/html",
    ".hvd": "application/vnd.yamaha.hv-dic",
    ".hvp": "application/vnd.yamaha.hv-voice",
    ".hvs": "application/vnd.yamaha.hv-script",
    ".icc": "application/vnd.iccprofile",
    ".ice": "x-conference/x-cooltalk",
    ".icm": "application/vnd.iccprofile",
    ".ico": "image/x-icon",
    ".ics": "text/calendar",
    ".ief": "image/ief",
    ".ifb": "text/calendar",
    ".ifm": "application/vnd.shana.informed.formdata",
    ".iges": "model/iges",
    ".igl": "application/vnd.igloader",
    ".igs": "model/iges",
    ".igx": "application/vnd.micrografx.igx",
    ".iif": "application/vnd.shana.informed.interchange",
    ".imp": "application/vnd.accpac.simply.imp",
    ".ims": "application/vnd.ms-ims",
    ".in": "text/plain",
    ".ipk": "application/vnd.shana.informed.package",
    ".irm": "application/vnd.ibm.rights-management",
    ".irp": "application/vnd.irepository.package+xml",
    ".iso": "application/octet-stream",
    ".itp": "application/vnd.shana.informed.formtemplate",
    ".ivp": "application/vnd.immervision-ivp",
    ".ivu": "application/vnd.immervision-ivu",
    ".jad": "text/vnd.sun.j2me.app-descriptor",
    ".jam": "application/vnd.jam",
    ".jar": "application/java-archive",
    ".java": "text/x-java-source",
    ".jisp": "application/vnd.jisp",
    ".jlt": "application/vnd.hp-jlyt",
    ".jnlp": "application/x-java-jnlp-file",
    ".joda": "application/vnd.joost.joda-archive",
    ".jpe": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".jpgm": "video/jpm",
    ".jpgv": "video/jpeg",
    ".jpm": "video/jpm",
    ".js": "application/javascript",
    ".json": "application/json",
    ".kar": "audio/midi",
    ".karbon": "application/vnd.kde.karbon",
    ".kfo": "application/vnd.kde.kformula",
    ".kia": "application/vnd.kidspiration",
    ".kil": "application/x-killustrator",
    ".kml": "application/vnd.google-earth.kml+xml",
    ".kmz": "application/vnd.google-earth.kmz",
    ".kne": "application/vnd.kinar",
    ".knp": "application/vnd.kinar",
    ".kon": "application/vnd.kde.kontour",
    ".kpr": "application/vnd.kde.kpresenter",
    ".kpt": "application/vnd.kde.kpresenter",
    ".ksh": "text/plain",
    ".ksp": "application/vnd.kde.kspread",
    ".ktr": "application/vnd.kahootz",
    ".ktz": "application/vnd.kahootz",
    ".kwd": "application/vnd.kde.kword",
    ".kwt": "application/vnd.kde.kword",
    ".latex": "application/x-latex",
    ".lbd": "application/vnd.llamagraphics.life-balance.desktop",
    ".lbe": "application/vnd.llamagraphics.life-balance.exchange+xml",
    ".les": "application/vnd.hhe.lesson-player",
    ".lha": "application/octet-stream",
    ".link66": "application/vnd.route66.link66+xml",
    ".list": "text/plain",
    ".list3820": "application/vnd.ibm.modcap",
    ".listafp": "application/vnd.ibm.modcap",
    ".log": "text/plain",
    ".lostxml": "application/lost+xml",
    ".lrf": "application/octet-stream",
    ".lrm": "application/vnd.ms-lrm",
    ".ltf": "application/vnd.frogans.ltf",
    ".lvp": "audio/vnd.lucent.voice",
    ".lwp": "application/vnd.lotus-wordpro",
    ".lzh": "application/octet-stream",
    ".m13": "application/x-msmediaview",
    ".m14": "application/x-msmediaview",
    ".m1v": "video/mpeg",
    ".m2a": "audio/mpeg",
    ".m2v": "video/mpeg",
    ".m3a": "audio/mpeg",
    ".m3u": "audio/x-mpegurl",
    ".m4u": "video/vnd.mpegurl",
    ".m4v": "video/x-m4v",
    ".ma": "application/mathematica",
    ".mag": "application/vnd.ecowin.chart",
    ".maker": "application/vnd.framemaker",
    ".man": "text/troff",
    ".mathml": "application/mathml+xml",
    ".mb": "application/mathematica",
    ".mbk": "application/vnd.mobius.mbk",
    ".mbox": "application/mbox",
    ".mc1": "application/vnd.medcalcdata",
    ".mcd": "application/vnd.mcd",
    ".mcurl": "text/vnd.curl.mcurl",
    ".mdb": "application/x-msaccess",
    ".mdi": "image/vnd.ms-modi",
    ".me": "text/troff",
    ".mesh": "model/mesh",
    ".mfm": "application/vnd.mfmp",
    ".mgz": "application/vnd.proteus.magazine",
    ".mht": "message/rfc822",
    ".mhtml": "message/rfc822",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mif": "application/vnd.mif",
    ".mime": "message/rfc822",
    ".mj2": "video/mj2",
    ".mjp2": "video/mj2",
    ".mlp": "application/vnd.dolby.mlp",
    ".mmd": "application/vnd.chipnuts.karaoke-mmd",
    ".mmf": "application/vnd.smaf",
    ".mmr": "image/vnd.fujixerox.edmics-mmr",
    ".mny": "application/x-msmoney",
    ".mobi": "application/x-mobipocket-ebook",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "audio/mpeg",
    ".mp2a": "audio/mpeg",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".mp4a": "audio/mp4",
    ".mp4s": "application/mp4",
    ".mp4v": "video/mp4",
    ".mpa": "video/mpeg",
    ".mpc": "application/vnd.mophun.certificate",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpg4": "video/mp4",
    ".mpga": "audio/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".mpm": "application/vnd.blueice.multipass",
    ".mpn": "application/vnd.mophun.application",
    ".mpp": "application/vnd.ms-project",
    ".mpt": "application/vnd.ms-project",
    ".mpy": "application/vnd.ibm.minipay",
    ".mqy": "application/vnd.mobius.mqy",
    ".mrc": "application/marc",
    ".ms": "text/troff",
    ".mscml": "application/mediaservercontrol+xml",
    ".mseed": "application/vnd.fdsn.mseed",
    ".mseq": "application/vnd.mseq",
    ".msf": "application/vnd.epson.msf",
    ".msh": "model/mesh",
    ".msi": "application/x-msdownload",
    ".msl": "application/vnd.mobius.msl",
    ".msty": "application/vnd.muvee.style",
    ".mts": "model/vnd.mts",
    ".mus": "application/vnd.musician",
    ".musicxml": "application/vnd.recordare.musicxml+xml",
    ".mvb": "application/x-msmediaview",
    ".mwf": "application/vnd.mfer",
    ".mxf": "application/mxf",
    ".mxl": "application/vnd.recordare.musicxml",
    ".mxml": "application/xv+xml",
    ".mxs": "application/vnd.triscape.mxs",
    ".mxu": "video/vnd.mpegurl",
    ".n-gage": "application/vnd.nokia.n-gage.symbian.install",
    ".nb": "application/mathematica",
    ".nc": "application/x-netcdf",
    ".ncx": "application/x-dtbncx+xml",
    ".ngdat": "application/vnd.nokia.n-gage.data",
    ".nlu": "application/vnd.neurolanguage.nlu",
    ".nml": "application/vnd.enliven",
    ".nnd": "application/vnd.noblenet-directory",
    ".nns": "application/vnd.noblenet-sealer",
    ".nnw": "application/vnd.noblenet-web",
    ".npx": "image/vnd.net-fpx",
    ".nsf": "application/vnd.lotus-notes",
    ".nws": "message/rfc822",
    ".o": "application/octet-stream",
    ".oa2": "application/vnd.fujitsu.oasys2",
    ".oa3": "application/vnd.fujitsu.oasys3",
    ".oas": "application/vnd.fujitsu.oasys",
    ".obd": "application/x-msbinder",
    ".obj": "application/octet-stream",
    ".oda": "application/oda",
    ".odb": "application/vnd.oasis.opendocument.database",
    ".odc": "application/vnd.oasis.opendocument.chart",
    ".odf": "application/vnd.oasis.opendocument.formula",
    ".odft": "application/vnd.oasis.opendocument.formula-template",
    ".odg": "application/vnd.oasis.opendocument.graphics",
    ".odi": "application/vnd.oasis.opendocument.image",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogg": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".onepkg": "application/onenote",
    ".onetmp": "application/onenote",
    ".onetoc": "application/onenote",
    ".onetoc2": "application/onenote",
    ".opf": "application/oebps-package+xml",
    ".oprc": "application/vnd.palm",
    ".org": "application/vnd.lotus-organizer",
    ".osf": "application/vnd.yamaha.openscoreformat",
    ".osfpvg": "application/vnd.yamaha.openscoreformat.osfpvg+xml",
    ".otc": "application/vnd.oasis.opendocument.chart-template",
    ".otf": "application/x-font-otf",
    ".otg": "application/vnd.oasis.opendocument.graphics-template",
    ".oth": "application/vnd.oasis.opendocument.text-web",
    ".oti": "application/vnd.oasis.opendocument.image-template",
    ".otm": "application/vnd.oasis.opendocument.text-master",
    ".otp": "application/vnd.oasis.opendocument.presentation-template",
    ".ots": "application/vnd.oasis.opendocument.spreadsheet-template",
    ".ott": "application/vnd.oasis.opendocument.text-template",
    ".oxt": "application/vnd.openofficeorg.extension",
    ".p": "text/x-pascal",
    ".p10": "application/pkcs10",
    ".p12": "application/x-pkcs12",
    ".p7b": "application/x-pkcs7-certificates",
    ".p7c": "application/pkcs7-mime",
    ".p7m": "application/pkcs7-mime",
    ".p7r": "application/x-pkcs7-certreqresp",
    ".p7s": "application/pkcs7-signature",
    ".pas": "text/x-pascal",
    ".pbd": "application/vnd.powerbuilder6",
    ".pbm": "image/x-portable-bitmap",
    ".pcf": "application/x-font-pcf",
    ".pcl": "application/vnd.hp-pcl",
    ".pclxl": "application/vnd.hp-pclxl",
    ".pct": "image/x-pict",
    ".pcurl": "application/vnd.curl.pcurl",
    ".pcx": "image/x-pcx",
    ".pdb": "application/vnd.palm",
    ".pdf": "application/pdf",
    ".pfa": "application/x-font-type1",
    ".pfb": "application/x-font-type1",
    ".pfm": "application/x-font-type1",
    ".pfr": "application/font-tdpfr",
    ".pfx": "application/x-pkcs12",
    ".pgm": "image/x-portable-graymap",
    ".pgn": "application/x-chess-pgn",
    ".pgp": "application/pgp-encrypted",
    ".pic": "image/x-pict",
    ".pkg": "application/octet-stream",
    ".pki": "application/pkixcmp",
    ".pkipath": "application/pkix-pkipath",
    ".pl": "text/plain",
    ".plb": "application/vnd.3gpp.pic-bw-large",
    ".plc": "application/vnd.mobius.plc",
    ".plf": "application/vnd.pocketlearn",
    ".pls": "application/pls+xml",
    ".pml": "application/vnd.ctc-posml",
    ".png": "image/png",
    ".pnm": "image/x-portable-anymap",
    ".portpkg": "application/vnd.macports.portpkg",
    ".pot": "application/vnd.ms-powerpoint",
    ".potm": "application/vnd.ms-powerpoint.template.macroenabled.12",
    ".potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
    ".ppa": "application/vnd.ms-powerpoint",
    ".ppam": "application/vnd.ms-powerpoint.addin.macroenabled.12",
    ".ppd": "application/vnd.cups-ppd",
    ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppsm": "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
    ".ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptm": "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".pqa": "application/vnd.palm",
    ".prc": "application/x-mobipocket-ebook",
    ".pre": "application/vnd.lotus-freelance",
    ".prf": "application/pics-rules",
    ".ps": "application/postscript",
    ".psb": "application/vnd.3gpp.pic-bw-small",
    ".psd": "image/vnd.adobe.photoshop",
    ".psf": "application/x-font-linux-psf",
    ".ptid": "application/vnd.pvi.ptid1",
    ".pub": "application/x-mspublisher",
    ".pvb": "application/vnd.3gpp.pic-bw-var",
    ".pwn": "application/vnd.3m.post-it-notes",
    ".pwz": "application/vnd.ms-powerpoint",
    ".py": "text/x-python",
    ".pya": "audio/vnd.ms-playready.media.pya",
    ".pyc": "application/x-python-code",
    ".pyo": "application/x-python-code",
    ".pyv": "video/vnd.ms-playready.media.pyv",
    ".qam": "application/vnd.epson.quickanime",
    ".qbo": "application/vnd.intu.qbo",
    ".qfx": "application/vnd.intu.qfx",
    ".qps": "application/vnd.publishare-delta-tree",
    ".qt": "video/quicktime",
    ".qwd": "application/vnd.quark.quarkxpress",
    ".qwt": "application/vnd.quark.quarkxpress",
    ".qxb": "application/vnd.quark.quarkxpress",
    ".qxd": "application/vnd.quark.quarkxpress",
    ".qxl": "application/vnd.quark.quarkxpress",
    ".qxt": "application/vnd.quark.quarkxpress",
    ".ra": "audio/x-pn-realaudio",
    ".ram": "audio/x-pn-realaudio",
    ".rar": "application/x-rar-compressed",
    ".ras": "image/x-cmu-raster",
    ".rcprofile": "application/vnd.ipunplugged.rcprofile",
    ".rdf": "application/rdf+xml",
    ".rdz": "application/vnd.data-vision.rdz",
    ".rep": "application/vnd.businessobjects",
    ".res": "application/x-dtbresource+xml",
    ".rgb": "image/x-rgb",
    ".rif": "application/reginfo+xml",
    ".rl": "application/resource-lists+xml",
    ".rlc": "image/vnd.fujixerox.edmics-rlc",
    ".rld": "application/resource-lists-diff+xml",
    ".rm": "application/vnd.rn-realmedia",
    ".rmi": "audio/midi",
    ".rmp": "audio/x-pn-realaudio-plugin",
    ".rms": "application/vnd.jcp.javame.midlet-rms",
    ".rnc": "application/relax-ng-compact-syntax",
    ".roff": "text/troff",
    ".rpm": "application/x-rpm",
    ".rpss": "application/vnd.nokia.radio-presets",
    ".rpst": "application/vnd.nokia.radio-preset",
    ".rq": "application/sparql-query",
    ".rs": "application/rls-services+xml",
    ".rsd": "application/rsd+xml",
    ".rss": "application/rss+xml",
    ".rtf": "application/rtf",
    ".rtx": "text/richtext",
    ".s": "text/x-asm",
    ".saf": "application/vnd.yamaha.smaf-audio",
    ".sbml": "application/sbml+xml",
    ".sc": "application/vnd.ibm.secure-container",
    ".scd": "application/x-msschedule",
    ".scm": "application/vnd.lotus-screencam",
    ".scq": "application/scvp-cv-request",
    ".scs": "application/scvp-cv-response",
    ".scurl": "text/vnd.curl.scurl",
    ".sda": "application/vnd.stardivision.draw",
    ".sdc": "application/vnd.stardivision.calc",
    ".sdd": "application/vnd.stardivision.impress",
    ".sdkd": "application/vnd.solent.sdkm+xml",
    ".sdkm": "application/vnd.solent.sdkm+xml",
    ".sdp": "application/sdp",
    ".sdw": "application/vnd.stardivision.writer",
    ".see": "application/vnd.seemail",
    ".seed": "application/vnd.fdsn.seed",
    ".sema": "application/vnd.sema",
    ".semd": "application/vnd.semd",
    ".semf": "application/vnd.semf",
    ".ser": "application/java-serialized-object",
    ".setpay": "application/set-payment-initiation",
    ".setreg": "application/set-registration-initiation",
    ".sfd-hdstx": "application/vnd.hydrostatix.sof-data",
    ".sfs": "application/vnd.spotfire.sfs",
    ".sgl": "application/vnd.stardivision.writer-global",
    ".sgm": "text/sgml",
    ".sgml": "text/sgml",
    ".sh": "application/x-sh",
    ".shar": "application/x-shar",
    ".shf": "application/shf+xml",
    ".si": "text/vnd.wap.si",
    ".sic": "application/vnd.wap.sic",
    ".sig": "application/pgp-signature",
    ".silo": "model/mesh",
    ".sis": "application/vnd.symbian.install",
    ".sisx": "application/vnd.symbian.install",
    ".sit": "application/x-stuffit",
    ".sitx": "application/x-stuffitx",
    ".skd": "application/vnd.koan",
    ".skm": "application/vnd.koan",
    ".skp": "application/vnd.koan",
    ".skt": "application/vnd.koan",
    ".sl": "text/vnd.wap.sl",
    ".slc": "application/vnd.wap.slc",
    ".sldm": "application/vnd.ms-powerpoint.slide.macroenabled.12",
    ".sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
    ".slt": "application/vnd.epson.salt",
    ".smf": "application/vnd.stardivision.math",
    ".smi": "application/smil+xml",
    ".smil": "application/smil+xml",
    ".snd": "audio/basic",
    ".snf": "application/x-font-snf",
    ".so": "application/octet-stream",
    ".spc": "application/x-pkcs7-certificates",
    ".spf": "application/vnd.yamaha.smaf-phrase",
    ".spl": "application/x-futuresplash",
    ".spot": "text/vnd.in3d.spot",
    ".spp": "application/scvp-vp-response",
    ".spq": "application/scvp-vp-request",
    ".spx": "audio/ogg",
    ".src": "application/x-wais-source",
    ".srx": "application/sparql-results+xml",
    ".sse": "application/vnd.kodak-descriptor",
    ".ssf": "application/vnd.epson.ssf",
    ".ssml": "application/ssml+xml",
    ".stc": "application/vnd.sun.xml.calc.template",
    ".std": "application/vnd.sun.xml.draw.template",
    ".stf": "application/vnd.wt.stf",
    ".sti": "application/vnd.sun.xml.impress.template",
    ".stk": "application/hyperstudio",
    ".stl": "application/vnd.ms-pki.stl",
    ".str": "application/vnd.pg.format",
    ".stw": "application/vnd.sun.xml.writer.template",
    ".sus": "application/vnd.sus-calendar",
    ".susp": "application/vnd.sus-calendar",
    ".sv4cpio": "application/x-sv4cpio",
    ".sv4crc": "application/x-sv4crc",
    ".svd": "application/vnd.svd",
    ".svg": "image/svg+xml",
    ".svgz": "image/svg+xml",
    ".swa": "application/x-director",
    ".swf": "application/x-shockwave-flash",
    ".swi": "application/vnd.arastra.swi",
    ".sxc": "application/vnd.sun.xml.calc",
    ".sxd": "application/vnd.sun.xml.draw",
    ".sxg": "application/vnd.sun.xml.writer.global",
    ".sxi": "application/vnd.sun.xml.impress",
    ".sxm": "application/vnd.sun.xml.math",
    ".sxw": "application/vnd.sun.xml.writer",
    ".t": "text/troff",
    ".tao": "application/vnd.tao.intent-module-archive",
    ".tar": "application/x-tar",
    ".tcap": "application/vnd.3gpp2.tcap",
    ".tcl": "application/x-tcl",
    ".teacher": "application/vnd.smart.teacher",
    ".tex": "application/x-tex",
    ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo",
    ".text": "text/plain",
    ".tfm": "application/x-tex-tfm",
    ".tgz": "application/x-gzip",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".tmo": "application/vnd.tmobile-livetv",
    ".torrent": "application/x-bittorrent",
    ".tpl": "application/vnd.groove-tool-template",
    ".tpt": "application/vnd.trid.tpt",
    ".tr": "text/troff",
    ".tra": "application/vnd.trueapp",
    ".trm": "application/x-msterminal",
    ".tsv": "text/tab-separated-values",
    ".ttc": "application/x-font-ttf",
    ".ttf": "application/x-font-ttf",
    ".twd": "application/vnd.simtech-mindmapper",
    ".twds": "application/vnd.simtech-mindmapper",
    ".txd": "application/vnd.genomatix.tuxedo",
    ".txf": "application/vnd.mobius.txf",
    ".txt": "text/plain",
    ".u32": "application/x-authorware-bin",
    ".udeb": "application/x-debian-package",
    ".ufd": "application/vnd.ufdl",
    ".ufdl": "application/vnd.ufdl",
    ".umj": "application/vnd.umajin",
    ".unityweb": "application/vnd.unity",
    ".uoml": "application/vnd.uoml+xml",
    ".uri": "text/uri-list",
    ".uris": "text/uri-list",
    ".urls": "text/uri-list",
    ".ustar": "application/x-ustar",
    ".utz": "application/vnd.uiq.theme",
    ".uu": "text/x-uuencode",
    ".vcd": "application/x-cdlink",
    ".vcf": "text/x-vcard",
    ".vcg": "application/vnd.groove-vcard",
    ".vcs": "text/x-vcalendar",
    ".vcx": "application/vnd.vcx",
    ".vis": "application/vnd.visionary",
    ".viv": "video/vnd.vivo",
    ".vor": "application/vnd.stardivision.writer",
    ".vox": "application/x-authorware-bin",
    ".vrml": "model/vrml",
    ".vsd": "application/vnd.visio",
    ".vsf": "application/vnd.vsf",
    ".vss": "application/vnd.visio",
    ".vst": "application/vnd.visio",
    ".vsw": "application/vnd.visio",
    ".vtu": "model/vnd.vtu",
    ".vxml": "application/voicexml+xml",
    ".w3d": "application/x-director",
    ".wad": "application/x-doom",
    ".wav": "audio/x-wav",
    ".wax": "audio/x-ms-wax",
    ".wbmp": "image/vnd.wap.wbmp",
    ".wbs": "application/vnd.criticaltools.wbs+xml",
    ".wbxml": "application/vnd.wap.wbxml",
    ".wcm": "application/vnd.ms-works",
    ".wdb": "application/vnd.ms-works",
    ".wiz": "application/msword",
    ".wks": "application/vnd.ms-works",
    ".wm": "video/x-ms-wm",
    ".wma": "audio/x-ms-wma",
    ".wmd": "application/x-ms-wmd",
    ".wmf": "application/x-msmetafile",
    ".wml": "text/vnd.wap.wml",
    ".wmlc": "application/vnd.wap.wmlc",
    ".wmls": "text/vnd.wap.wmlscript",
    ".wmlsc": "application/vnd.wap.wmlscriptc",
    ".wmv": "video/x-ms-wmv",
    ".wmx": "video/x-ms-wmx",
    ".wmz": "application/x-ms-wmz",
    ".wpd": "application/vnd.wordperfect",
    ".wpl": "application/vnd.ms-wpl",
    ".wps": "application/vnd.ms-works",
    ".wqd": "application/vnd.wqd",
    ".wri": "application/x-mswrite",
    ".wrl": "model/vrml",
    ".wsdl": "application/wsdl+xml",
    ".wspolicy": "application/wspolicy+xml",
    ".wtb": "application/vnd.webturbo",
    ".wvx": "video/x-ms-wvx",
    ".x32": "application/x-authorware-bin",
    ".x3d": "application/vnd.hzn-3d-crossword",
    ".xap": "application/x-silverlight-app",
    ".xar": "application/vnd.xara",
    ".xbap": "application/x-ms-xbap",
    ".xbd": "application/vnd.fujixerox.docuworks.binder",
    ".xbm": "image/x-xbitmap",
    ".xdm": "application/vnd.syncml.dm+xml",
    ".xdp": "application/vnd.adobe.xdp+xml",
    ".xdw": "application/vnd.fujixerox.docuworks",
    ".xenc": "application/xenc+xml",
    ".xer": "application/patch-ops-error+xml",
    ".xfdf": "application/vnd.adobe.xfdf",
    ".xfdl": "application/vnd.xfdl",
    ".xht": "application/xhtml+xml",
    ".xhtml": "application/xhtml+xml",
    ".xhvml": "application/xv+xml",
    ".xif": "image/vnd.xiff",
    ".xla": "application/vnd.ms-excel",
    ".xlam": "application/vnd.ms-excel.addin.macroenabled.12",
    ".xlb": "application/vnd.ms-excel",
    ".xlc": "application/vnd.ms-excel",
    ".xlm": "application/vnd.ms-excel",
    ".xls": "application/vnd.ms-excel",
    ".xlsb": "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    ".xlsm": "application/vnd.ms-excel.sheet.macroenabled.12",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xlt": "application/vnd.ms-excel",
    ".xltm": "application/vnd.ms-excel.template.macroenabled.12",
    ".xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    ".xlw": "application/vnd.ms-excel",
    ".xml": "application/xml",
    ".xo": "application/vnd.olpc-sugar",
    ".xop": "application/xop+xml",
    ".xpdl": "application/xml",
    ".xpi": "application/x-xpinstall",
    ".xpm": "image/x-xpixmap",
    ".xpr": "application/vnd.is-xpr",
    ".xps": "application/vnd.ms-xpsdocument",
    ".xpw": "application/vnd.intercon.formnet",
    ".xpx": "application/vnd.intercon.formnet",
    ".xsl": "application/xml",
    ".xslt": "application/xslt+xml",
    ".xsm": "application/vnd.syncml+xml",
    ".xspf": "application/xspf+xml",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".xvm": "application/xv+xml",
    ".xvml": "application/xv+xml",
    ".xwd": "image/x-xwindowdump",
    ".xyz": "chemical/x-xyz",
    ".zaz": "application/vnd.zzazz.deck+xml",
    ".zip": "application/zip",
    ".zir": "application/vnd.zul",
    ".zirz": "application/vnd.zul",
    ".zmm": "application/vnd.handheld-entertainment+xml"
  };

  /**
   Returns the mime type corresponding to the given file name's extension

   @param {String}                   fileName Name of the file
   */
  CUI.FileUpload.MimeTypes.getMimeTypeFromFileName = function (fileName) {
    var fileExtensionMatch = fileName.match(/.+(\..+)/);

    return (fileExtensionMatch ?
      CUI.FileUpload.MimeTypes[fileExtensionMatch[1]] :
      undefined);
  };
}(window.jQuery));

(function ($) {
  CUI.NumberInput = new Class(/** @lends CUI.NumberInput# */{
    toString: 'NumberInput',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A number input widget with increment and decrement buttons.

     @desc Creates a Number Input object
     @constructs
     @param {Object} options Component options
     @param {numberic} [options.min=NaN] (Optional) Minimum value allowed for input.
     @param {numberic} [options.max=NaN] (Optional) Maximum value allowed for input.
     @param {numberic} [options.step=1] Amount increment/decrement for input.
     @param {numberic} [options.defaultValue=0] Fallback value in case the input is empty at the beginning.
     @param {boolean} [options.hasError=false] Set the error state of the widget.
     @param {boolean} [options.disabled=false] Set the disabled state of the widget.
     */

    construct: function (options) {

      this._initMarkup();
      this._setListeners();
      this._setAttributes();
      this._makeAccessible();

    },

    defaults: {
      defaultValue: 0,
      max: null,
      min: null,
      step: 1,
      hasError: false,
      disabled: false
    },

    /**
     Increments value by step amount
     */
    increment: function () {
      if (this._isNumber()) {
        var value = this.getValue(),
            precision = this._getPrecision();
        value += this.getStep();
        value = value > this.getMax() ? this.getMax() : value;
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
        this.setValue(value);
      }
    },

    /**
     Decrements value by step amount
     */
    decrement: function () {
      if (this._isNumber()) {
        var value = this.getValue(),
            precision = this._getPrecision();
        value -= this.getStep();
        value = value < this.getMin() ? this.getMin() : value;
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
        this.setValue(value);
      }
    },

    /**
     Sets the value, which triggers the change event.  Note that value will be
     limited to the range defined by the min and max properties.
     @param value {numberic} The input value to set.
     */
    setValue: function (value) {
      this.$input.val(value);
      this.$input.trigger('change');
    },

    /**
     Sets the minimum value allowed.
     @param value {numberic} The min value to set.
     */
    setMin: function (value) {
      this.set('min', value);
      if (this.$input.attr('aria-valuemin')) {
        this.$input.attr('aria-valuemin', this.options.min); //a11y
      }

      this.$input.attr('min', this.options.min);
    },

    /**
     Sets the maximum value allowed.
     @param value {numberic} The max value to set.
     */
    setMax: function (value) {
      this.set('max', value);
      if (this.$input.attr('aria-valuemax')) {
        this.$input.attr('aria-valuemax', this.options.max); //a11y
      }

      this.$input.attr('max', this.options.max);
    },


    /**
     Sets the step value for increment and decrement.
     @param value {numberic} The step value to set.
     */
    setStep: function (value) {
      this.set('step', value);

      if (this.options.step !== 1 && this.$input.attr('step') !== this.options.step) {
        this.$input.attr('step', this.options.step);
      }
    },

    /**
     Attempts to return parseFloat for value.
     Does not attempt to parse null, undefined, or empty string.
     @return The current input value.
     */
    getValue: function () {
      var result = this.$input.val();
      if (typeof result == 'undefined' ||
        result == null ||
        result.length < 1) {
        result = '';
      } else {
        result = parseFloat(result);
      }
      return result;
    },

    /**
     @return The minimum input value allowed.
     */
    getMin: function () {
      return parseFloat(this.options.min);
    },

    /**
     @return The maximum input value allowed.
     */
    getMax: function () {
      return parseFloat(this.options.max);
    },

    /**
     @return The current increment/decrement step amount .
     */
    getStep: function () {
      return parseFloat(this.options.step);
    },

    /** @ignore */
    _initMarkup: function () {
      this.$element.addClass('coral-NumberInput');

      // get the input, and correct the input type depending on the platform
      this.$input = this.$element.find('.js-coral-NumberInput-input');
      this._switchInputType(this.$input);

      this.$decrementElement = this.$element.find('.js-coral-NumberInput-decrementButton');
      this.$incrementElement = this.$element.find('.js-coral-NumberInput-incrementButton');

      this.$liveRegion = $('<span/>')
        .addClass('u-coral-screenReaderOnly')
        .attr({
               'aria-live': 'assertive'
              }).insertAfter(this.$input);
    },

    /** @ignore */
    _liveRegionTimeout: null,
    /** @ignore */
    _clearLiveRegionTimeout: null,
    /** @ignore */
    _updateLiveRegion: function (value) {
      var self = this,
          val = value;

      clearTimeout(this._liveRegionTimeout);
      clearTimeout(this._clearLiveRegionTimeout);

      if (val === undefined || val.length === 0) {
        this.$liveRegion.text('');
      } else {
        this._liveRegionTimeout = setTimeout(function () {
          self.$liveRegion.text(val);
          self._clearLiveRegionTimeout = setTimeout(function () {
            self.$liveRegion.text('');
          }, 2000);
        }, 200);
      }
    },

    /** @ignore */
    _setListeners: function () {
      this.$input.on('change.cui-numberinput', this._changeHandler.bind(this));

      this.on('beforeChange:step', this._optionBeforeChangeHandler.bind(this));

      this.on('beforeChange:min', this._optionBeforeChangeHandler.bind(this));

      this.on('beforeChange:max', this._optionBeforeChangeHandler.bind(this));

      this.on('change:disabled', this._toggleDisabled.bind(this));

      this.on('change:hasError', this._toggleError.bind(this));

      this.on('click.cui-numberinput', 'button', this._clickIncrementOrDecrement.bind(this));

      this.on('keydown.cui-numberinput', 'input, button', this._keyDown.bind(this))
        .on('focusin.cui-numberinput', 'input, button', this._focusIn.bind(this))
        .on('focusout.cui-numberinput', 'input, button', this._focusOut.bind(this));
    },

    /** @ignore */
    _setAttributes: function () {

      if (this.$input.attr('max')) {
        this.setMax(this.$input.attr('max'));
      } else if ($.isNumeric(this.options.max)) {
        this.setMax(this.options.max);
      }

      if (this.$input.attr('min')) {
        this.setMin(this.$input.attr('min'));
      } else if ($.isNumeric(this.options.min)) {
        this.setMin(this.options.min);
      }

      if (this.$element.attr("error")) {
        this.options.hasError = true;
      }

      this.setStep(this.$input.attr('step') || this.options.step);

      this.setValue(this.$input.val() !== '' ? this.$input.val() : this.options.defaultValue);

      if (this.$element.attr('disabled') || this.$element.attr('data-disabled')) {
        this._toggleDisabled();
      }

      if (this.$element.hasClass('is-invalid') || this.$element.attr('data-error')) {
        this.set('hasError', true);
      }
    },

    /** @ignore */
    _makeAccessible: function () {
      var valueNow = this.getValue(),
          input = this.$input.get(0),
          useAriaSpinbuttonRole = input.type === 'text';

      // Determine if input[type=number] is fully supported;
      // if not, implement the WAI-ARIA design pattern for a spinbutton.
      if (!useAriaSpinbuttonRole) {
        if (typeof input.stepUp === 'function') {
          try {
            // IE10-11 triggers an INVALID_STATE_ERR
            // when the stepUp or stepDown method is called.
            input.stepUp();
            input.value = valueNow;
          } catch (err) {
            // If an error is caught,
            // implement the WAI-ARIA 'spinbutton' design pattern.
            useAriaSpinbuttonRole = true;
          }
        } else {
          useAriaSpinbuttonRole = true;
        }
      }

      if (useAriaSpinbuttonRole) {
        this.$input.attr({
          'role': 'spinbutton',
          'aria-valuenow': valueNow,
          'aria-valuetext': valueNow,
          'aria-valuemax': this.options.max,
          'aria-valuemin': this.options.min
        });
      }

      this.$incrementElement.add(this.$decrementElement)
        .attr('tabindex', -1)
        .filter('[title]:not([aria-label])')
        .each(function (i, button) {
          var $button = $(button);
          if ($.trim($button.text()).length === 0) {
            $button.append('<span class="u-coral-screenReaderOnly">' + $button.attr('title') + '</span>');
          }
        });
    },

    /** @ignore */
    _changeHandler: function (event) {
        var isSpinbutton = this.$input.is('[role="spinbutton"]');
        this._checkMinMaxViolation();
        this._adjustValueLimitedToRange();
        this._checkValidity();

        var valueNow = this.getValue();

        this.$input.attr({
          'aria-valuenow': isSpinbutton ? valueNow : null,
          'aria-valuetext': valueNow
        });  //a11y

        if (isSpinbutton && this.$input.is(':focus')) {
          this._updateLiveRegion('');
        } else {
          this._updateLiveRegion(valueNow);
        }
      },

    /** @ignore */
    _keyDown: function (event) {
      var incrementOrDecrement,
          focusInput = false,
          captureEvent = false;
      switch (event.which) {
        case 33: // pageup
        case 38: // up
          incrementOrDecrement = this.increment;
          focusInput = true;
          captureEvent = true;
          break;
        case 34: // pagedown
        case 40: // down
          incrementOrDecrement = this.decrement;
          focusInput = true;
          captureEvent = true;
          break;
        case 35: // end
          if (this.options.max !== null) {
            this.setValue(this.options.max);
          }
          focusInput = true;
          captureEvent = true;
          break;
        case 36: // home
          if (this.options.min !== null) {
            this.setValue(this.options.min);
          }
          focusInput = true;
          captureEvent = true;
          break;
      }

      if (captureEvent) {
        event.preventDefault(); //Prevents change in caret position
        event.stopImmediatePropagation();
      }

      if (incrementOrDecrement) {
        incrementOrDecrement.call(this);
      }

      // Set focus to input
      if (focusInput &&  !this.$input.is(document.activeElement)) {
        this.$input.trigger('focus');
      }
    },

    /** @ignore */
    _focusIn: function (event) {
      this.$element.addClass('is-focused');
    },

    /** @ignore */
    _focusOut: function (event) {
      this.$element.removeClass('is-focused');
      this._updateLiveRegion('');
    },

    /** @ignore */
    _clickIncrementOrDecrement: function (event) {
      var incrementOrDecrement,
          $currentTarget = $(event.currentTarget);
      if ($currentTarget.is(this.$incrementElement)) {
        incrementOrDecrement = this.increment;
      } else if ($currentTarget.is(this.$decrementElement)) {
        incrementOrDecrement = this.decrement;
      }
      if (incrementOrDecrement) {
        if (!$currentTarget.is(document.activeElement)) {
          $currentTarget.trigger('focus');
        }
        incrementOrDecrement.call(this);
      }
    },

    /** @ignore */
    _adjustValueLimitedToRange: function () {
      var value = this.getValue(),
          precision = this._getPrecision();

      if (!isNaN(value)) {
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }
        if (precision > 0) {
          value = parseFloat(value.toFixed(precision));
        }
      }
      this.$input.val(value);
    },

    /** @ignore */
    _checkMinMaxViolation: function () {
      var hasFocus = false;

      if (this._isNumber()) {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');

        if (this.options.max !== null && this.getValue() >= this.getMax()) {
          hasFocus = this.$incrementElement.is(document.activeElement);
          this.$incrementElement.attr('disabled', 'disabled');
        } else if (this.options.min !== null && this.getValue() <= this.getMin()) {
          hasFocus = this.$decrementElement.is(document.activeElement);
          this.$decrementElement.attr('disabled', 'disabled');
        }

        if (hasFocus) {
          this.$input.trigger('focus');
        }
      }
    },

    _checkValidity: function() {
      if (this.$input.val() === '' && this.options.defaultValue !== null) {
        this.set('hasError', false);
      } else {
        this.set('hasError', this.getValue() !== this._getSnappedValue());
      }
    },

    /** @ignore */
    _getSnappedValue:function(value) {
      var rawValue = value === undefined ? this.getValue() : value,
          snappedValue = rawValue,
          min = this.getMin(),
          max = this.getMax(),
          step = this.getStep(),
          remainder,
          precision = this._getPrecision();

      remainder = ((rawValue - (isNaN(min) ? 0 : min)) % step);

      if (Math.abs(remainder) * 2 >= step) {
        snappedValue = (rawValue - remainder) + step;
      } else {
        snappedValue = rawValue - remainder;
      }

      if (!isNaN(min) && !isNaN(max)) {
        if (snappedValue < min) {
          snappedValue = min;
        } else if (snappedValue > max) {
          snappedValue = min + Math.floor((max - min) / step) * step;
        }
      }

      // correct floating point behavior by rounding to step precision
      if (precision > 0) {
        snappedValue = parseFloat(snappedValue.toFixed(precision));
      }

      return snappedValue;
    },

    /** @ignore */
    _getPrecision: function() {
      var value = this.getValue(),
          step = this.getStep(),
          regex = /^(?:-?\d+)(?:\.(\d+))?$/g,
          valuePrecision = value.toString().replace(regex, '$1').length,
          stepPrecision = step.toString().replace(regex, '$1').length;

      return valuePrecision > stepPrecision ? valuePrecision : stepPrecision;
    },

    /** @ignore */
    _switchInputType: function ($input) {
      var correctType = 'number';

      if ($input.get(0).type === correctType) return;

      $input
        .detach()
        .attr('type', correctType)
        .insertBefore(this.$element.children(':last'));
    },

    /** @ignore */
    _isNumber: function () {
      return !isNaN(this.$input.val());
    },

    /** @ignore */
    _optionBeforeChangeHandler: function (event) {
      if (isNaN(parseFloat(event.value))) {
        // console.error('CUI.NumberInput cannot set option \'' + event.option + '\' to NaN value');
        event.preventDefault();
      } else {
        this.$input.attr(event.option, event.value);
      }
    },

    /** @ignore */
    _toggleDisabled: function () {
      if (this.options.disabled) {
        this.$incrementElement.attr('disabled', 'disabled');
        this.$decrementElement.attr('disabled', 'disabled');
        this.$input.attr('disabled', 'disabled');
      } else {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');
        this.$input.removeAttr('disabled');
      }
    },

    /** @ignore */
    _toggleError: function () {
      if (this.options.hasError) {
        this.$element.addClass('is-invalid');
        this.$input.addClass('is-invalid').attr('aria-invalid', true);
      } else {
        this.$element.removeClass('is-invalid');
        this.$input.removeClass('is-invalid').removeAttr('aria-invalid');
      }
    }
  });

  CUI.Widget.registry.register("numberinput", CUI.NumberInput);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.NumberInput.init($("[data-init~=numberinput]", e.target));
  });

}(window.jQuery));

(function ($) {
  var uuid = 0;

  CUI.Popover = new Class(/** @lends CUI.Popover# */{
    toString: 'Popover',
    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc A box which points at an element or point.

     @desc Creates a new popover
     @constructs

     @param {Object} options                               Component options
     @param {Object} options.pointAt                       The element or coordinate to which the popover should point.
     A coordinate should be provided as an array where the first
     item is the X coordinate and the second item is a Y
     coordinate. The coordinate should be in the document
     coordinate space.
     @param {String} [options.content]                     Content of the popover (HTML).
     @param {String} [options.pointFrom=bottom]            The side of the target element or coordinate the popover
     @param {Object} [options.within=window]               Popover collision detection container
     should be pointing from. Possible values include
     <code>top</code>, <code>right</code>, <code>bottom</code>,
     or <code>left</code>.
     @param {boolean} [options.preventAutoHide=false]      When set to <code>false</code>, the popover will close when
     the user clicks outside the popover. When set to
     <code>true</code>, the popover will only close when the
     target element is clicked or <code>hide()</code> is
     manually called.
     @param {String} [options.alignFrom=left]              When set to left, the popover will be anchored to the left
     side of its offset parent (in other words, it will use the
     <code>left</code> CSS property). When set to right, the
     popover will be anchored to the right side of its offset
     parent (in other words, it will use the <code>right</code>
     CSS property). When the element the popover is pointing at
     is right-aligned, it can be useful to set the value to
     <code>right</code> so the popover will appear to stay
     attached to the element when the user resizes the window
     horizontally.

     */
    construct: function (options) {

      // listens to configuration changes
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:pointAt', this._position.bind(this));
      this.$element.on('change:pointFrom', this._position.bind(this));
      this.$element.on('change:alignFrom', this._position.bind(this));

      // main class of the component
      this.$element.addClass('coral-Popover');

      // checks if the content element exists
      if (this._getContentElement(this.$element).length === 0) {
        this._wrapContent(this.$element);
      }

      // gets the content element
      this._$content = this._getContentElement(this.$element);

      // adds the content if the current is blank.
      if(this._$content.html() === '') {
        this._setContent();
      }

      this._createTail();

      this.uuid = (uuid += 1);
      this.popoverId=this.$element.attr('id');

      this._makeAccessible();
    },

    defaults: {
      pointFrom: 'bottom',
      preventAutoHide: false,
      alignFrom: 'left',
      visible: false
    },

    _directions: [
      'top',
      'bottom',
      'right',
      'left'
    ],

    /**
     * Creates the popover tail (i.e., tip, arrow, triangle) and adds it as a child.
     * @private
     */
    _createTail: function () {
      this._$tail = $('<div class="coral-Popover-arrow coral-Popover-arrow--left"/>').appendTo(this.$element);

      this._cachedTailDimensions = {};

      // Cache the tail dimensions when the popover is on the left or right of the target.
      this._cachedTailDimensions.leftRight = {
        width: this._$tail.outerWidth(),
        height: this._$tail.outerHeight()
      };

      // While it's possible that the dimensions are different depending on whether it's left/right vs top/bottom,
      // it likely (and is currently) just a rotated version of the arrow. To reduce the cost of measuring, we'll
      // just invert the dimensions until more complex tails are introduced.
      this._cachedTailDimensions.topBottom = {
        width: this._cachedTailDimensions.leftRight.height,
        height: this._cachedTailDimensions.leftRight.width
      };

      // The correct arrow class will be applied when the popover is positioned.
      this._$tail.removeClass('coral-Popover-arrow--left');
    },

    /**
     * Wrapps the content of the popover inside a
     * coral-Popover-content class.
     *
     * @ignore
     */
    _wrapContent: function (el) {
      el.wrapInner('<div class="coral-Popover-content"/>');
    },
    /** @ignore */
    _getContentElement: function (el) {
      return el.find('> .coral-Popover-content');
    },

    /**
     * Positions the popover (if visible). Leverages [jQueryUI's Position utility]{@link http://jqueryui.com/position}.
     *
     * @private
     */
    _position: function () {
      // Let's not use the cycles to position if the popover is not visible. When show() is called, the element will
      // run through positioning again.
      if (!this.options.visible || !this.options.pointAt) {
        return;
      }

      var $popover = this.$element,
        target = this.options.pointAt,
        pointFrom = this.options.pointFrom,
        tailDimensions = this._cachedTailDimensions,
        instructions;

      if ($.isArray(target)) {
        if (target.length !== 2) {
          return;
        }
        target = this._convertCoordsToEvent(target);
      }

      // Using the 'flip' collision option, jQueryUI's positioning logic will flip the position of the popover to
      // whichever side will expose most of the popover within the window viewport. However, this can sometimes place
      // the popover so that it is cropped by the top or left of the document. While it's great that the user would
      // be able to initially see more of the popover than if it had been placed in the opposite position, the user
      // would not be able to even scroll to see the cropped portion. We would rather show less of the popover and
      // still allow the user to scroll to see the rest of the popover. Here we detect if such cropping is taking
      // place and, if so, we re-run the positioning algorithm while forcing the position to the bottom or right
      // directions.
      // Fixes https://issues.adobe.com/browse/CUI-794
      var validateFinalPosition = function (position, feedback) {
        var offsetParentOffset = $popover.offsetParent().offset(),
          forcePointFrom;

        if ((pointFrom == 'top' || pointFrom == 'bottom') && offsetParentOffset.top + position.top < 0) {
          forcePointFrom = 'bottom';
        } else if ((pointFrom == 'left' || pointFrom == 'right') && offsetParentOffset.left + position.left < 0) {
          forcePointFrom = 'right';
        }

        if (forcePointFrom) {
          instructions = this._instructionFactory[forcePointFrom]({
            target: target,
            tailDimensions: tailDimensions,
            allowFlip: false,
            callback: this._applyFinalPosition.bind(this),
            within: this.options.within || window
          });
          $popover.position(instructions);
        } else {
          this._applyFinalPosition(position, feedback);
        }
      }.bind(this);

      instructions = this._instructionFactory[pointFrom]({
        target: target,
        tailDimensions: tailDimensions,
        allowFlip: true,
        callback: validateFinalPosition,
        within: this.options.within || window
      });

      $popover.position(instructions);
    },

    /**
     * Converts an array containing a coordinate into an event (needed for jQueryUI's Position utility)..
     * @param {Array} pointAt An array where the first item is the x coordinate and the second item is the y coordinate.
     * @returns {Object} A jquery event object with the pageX and pageY properties set.
     * @private
     */
    _convertCoordsToEvent: function (pointAt) {
      // If target is an array, it should contain x and y coords for absolute positioning.
      // Transform coords for jQueryUI Position which requires an event object with pageX and pageY.
      var event = $.Event();
      event.pageX = pointAt[0];
      event.pageY = pointAt[1];
      return event;
    },

    /**
     * Applies the final position to the popover (both bubble and tail).
     * @param position The position to be applied to the bubble.
     * @param feedback Additional information useful for positioning the tail.
     * @private
     */
    _applyFinalPosition: function (position, feedback) {
      var css = {
        top: position.top
      };

      if (this.options.alignFrom === 'right') {
        // Convert the "left" position to a "right" position.

        var offsetParent = this.$element.offsetParent();
        var offsetParentWidth;

        // If the offset parent is the root HTML element, we need to do some finagling. We really need to get the width
        // of the viewpane minus the scrollbar width since the "right" position will be relative to the left of the
        // scrollbar. We do this by getting the outerWidth(true) of body (so it includes any margin, border, and padding).
        if (offsetParent.prop('tagName').toLowerCase() == 'html') {
          offsetParent = $('body');
          offsetParentWidth = offsetParent.outerWidth(true);
        } else {
          offsetParentWidth = offsetParent.innerWidth();
        }

        css.left = 'auto';
        css.right = offsetParentWidth - position.left - this.$element.outerWidth(true);
      } else {
        css.left = position.left;
        css.right = 'auto';
      }

      this.$element.css(css);

      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      this._positionTail(feedback);
    },

    /**
     * Factory for creating instruction objects to be used by jQuery's Position utility.
     * @private
     */
    _instructionFactory: {
      top: function (options) {
        return {
          my: 'center bottom-' + options.tailDimensions.topBottom.height,
          at: 'center top',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback,
          within: options.within
        };
      },
      right: function (options) {
        return {
          my: 'left+' + options.tailDimensions.leftRight.width + ' center',
          at: 'right center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback,
          within: options.within
        };
      },
      bottom: function (options) {
        return {
          my: 'center top+' + options.tailDimensions.topBottom.height,
          at: 'center bottom',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback,
          within: options.within
        };
      },
      left: function (options) {
        return {
          my: 'right-' + options.tailDimensions.leftRight.width + ' center',
          at: 'left center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback,
          within: options.within
        };
      }
    },

    /**
     * Positions the tail of the popover.
     * @param positionFeedback Positioning feedback object returned from jQuery's Position utility. This contains
     * information regarding how the popover bubble was positioned.
     * @private
     */
    _positionTail: function (positionFeedback) {
      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      var targetRect,
        offset = this.$element.offset();

      if ($.isArray(this.options.pointAt)) {
        targetRect = {
          top: this.options.pointAt[1],
          left: this.options.pointAt[0],
          width: 0,
          height: 0
        };
      } else {
        var targetOffset = $(positionFeedback.target.element).offset();
        targetRect = {
          top: targetOffset.top,
          left: targetOffset.left,
          width: positionFeedback.target.width,
          height: positionFeedback.target.height
        };
      }

      // Convert from doc coordinate space to this.$element coordinate space.
      targetRect.top -= (offset.top + parseFloat(this.$element.css('borderTopWidth')));
      targetRect.left -= (offset.left + parseFloat(this.$element.css('borderLeftWidth')));

      var tailClass, tailLeft, tailTop, tailWidth;
      switch (this.options.pointFrom) {
        case 'top': // Consumer wanted popover above target
        case 'bottom': // Consumer wanted popover below target
          tailWidth = this._cachedTailDimensions.topBottom.width;
          tailLeft = targetRect.left + targetRect.width / 2 - tailWidth / 2;
          if (positionFeedback.vertical == 'bottom') { // Popover ended up above the target
            tailClass = 'coral-Popover-arrow--down';
            tailTop = targetRect.top - this._cachedTailDimensions.topBottom.height;
          } else { // Popover ended up below the target
            tailClass = 'coral-Popover-arrow--up';
            tailTop = targetRect.top + targetRect.height;
          }
          break;
        case 'left': // Consumer wanted popover to the left of the target
        case 'right': // Consumer wanted popover to the right of the target
          tailWidth = this._cachedTailDimensions.leftRight.width;
          tailTop = targetRect.top + targetRect.height / 2 -
            this._cachedTailDimensions.leftRight.height / 2;
          if (positionFeedback.horizontal == 'left') { // Popover ended up on the right side of the target
            tailClass = 'coral-Popover-arrow--left';
            tailLeft = targetRect.left + targetRect.width;
          } else { // Popover ended up on the left side of the target
            tailClass = 'coral-Popover-arrow--right';
            tailLeft = targetRect.left - tailWidth;
          }
          break;
      }

      this._$tail.css({ top: tailTop, left: tailLeft })
        .removeClass('coral-Popover-arrow--up coral-Popover-arrow--down coral-Popover-arrow--left coral-Popover-arrow--right')
        .addClass(tailClass);
    },

    /** @ignore */
    _show: function () {
      var self = this,
          $focusable = $(this._lastFocused),
          $contentElements;
      this.$element.show().attr('aria-hidden', false);

      if (!this.$element.find(':focusable').length && this.$element.is(':not([aria-labelledby]):not([aria-label])')) {
        $contentElements = this._getContentElement(this.$element);
        this.$element.attr('aria-labelledby', $contentElements.first().attr('id'));
      }

      this._position();
      this._previousFocus = $(document.activeElement); //save previously focused element

      if (!this.options.preventAutoHide) {
        clearTimeout(this.autoHideInitTimeout);
        this.autoHideInitTimeout = setTimeout(function() {
          // Must watch touchstart because click events don't bubble as expected on iOS Safari.
          $(document).on('touchstart.popover-hide-' + self.uuid, self._clickOutsideHandler.bind(self));
          $(document).on('click.popover-hide-' + self.uuid, self._clickOutsideHandler.bind(self));
          self._moveLastEventToFrontOfQueue(document, 'touchstart');
          self._moveLastEventToFrontOfQueue(document, 'click');
        }, 0);
      }
      if($focusable.length){
        $focusable.focus();
      } else {
        $focusable = this.$element.find(':tabbable').first();
        if ($focusable.length) {
          $focusable.focus();
        } else {
          this.$element.focus();
        }
      }
      $(document).on('keydown.popover-'+this.uuid, this._keyDown.bind(this));
      this._moveLastEventToFrontOfQueue(document, 'keydown');

      // keyboard handling
      this.$element
        .on('keydown.popover-focusLoop', ':focusable', this._tabKeyHandler.bind(this))
        // Adds is-focused class so that if more than one Popover is displayed,
        // the Popover with focus will remain on top in the z-index order.
        .on('focusin.popover', this._focusInHandler.bind(this))
        .on('focusout.popover', this._focusOutHandler.bind(this));
    },

    /**
     * Swaps order of execution of popover event listeners. With more than 
     * one popover open, we need to make sure that the last
     * popover closes before any preceding popovers.
     *
     * @param {HTMLElement} element   The element target to capture the event.
     * @param {String} eventName   The event name.
     * @ignore
     */
    _moveLastEventToFrontOfQueue: function (element, eventName) {
      var eventList = $._data($(element)[0], 'events'),
          keydownEvents = eventList[eventName],
          popoverIndexes = [];
      keydownEvents.forEach(function(e, index) {
        if (e.namespace.indexOf('popover-') === 0) {
          popoverIndexes.push(index);
        }
      });
      if (popoverIndexes.length > 1) {
        keydownEvents.splice(popoverIndexes[0], 0, keydownEvents.pop());
      }
    },

    /** @ignore */
    _hide: function () {
      // remove escape handler
      $(document).off('keydown.popover-' + this.uuid);
      clearTimeout(this.autoHideInitTimeout);
      this._unforceBlur();
      this.$element.hide().attr('aria-hidden', true);
      $(document).off('.popover-hide-' + this.uuid);
      this._lastFocused = null;

      // keyboard handling
      this.$element
        .off('keydown.popover-focusLoop, focusin.popover, focusout.popover');
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content !== 'string') return;

      // adds the content
      this._$content.html(this.options.content);

      this._position();
    },

    /**
     * Deprecated.
     * @param position
     * @deprecated Please use set('pointAt', [x, y]) instead.
     */
    setPosition: function (position) {
      this.set('pointAt', position);
    },

    /**
     keydown event handler
     @private
     */
    _keyDown: function (event) {
      switch(event.which) {
        case 27: // Esc
          this._escapeKeyHandler(event);
          break;
        case 117: // F6
          this._gotoTriggerHandler(event);
          break;
      }
    },

    /**
     handler to close the dialog on escape key
     @private
     */
    _escapeKeyHandler: function (event) {
      if ($(document.activeElement).is(this.$element) || $(document.activeElement).closest(this.$element).length) {
        this._previousFocus.focus();
      }
      this.hide();
      event.preventDefault();
      event.stopImmediatePropagation();
    },

    /**
     handler to close the popover on click outside
     @private
     */
    _clickOutsideHandler: function (event) {
      var $targ = $(event.target);
      if ($targ.closest('.coral-Popover').length === 0) {
        if ($(document.activeElement).is(document.body)) {
          this._previousFocus.focus();
        }
        this.hide();
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },

    /**
     handler to shift focus between the dialog and the main document
     @private
     */
    _gotoTriggerHandler: function (event) {
      if ($(document.activeElement).is(this.$element) || $(document.activeElement).closest(this.$element).length) {
        this._previousFocus.focus();
        this._forceBlur();
      } else {
        this._unforceBlur();
        if (!this._lastFocused) {
          this.$element.find(':focusable').addBack().first().focus();
        } else {
          this._lastFocused.focus();
        }
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },

    /**
     Handle tab key to manage focus loop within the Popover.
     @private
     */
    _tabKeyHandler: function (event) {
      // enables keyboard support
      var elem = $(event.currentTarget),
        tabbables = this.$element.find(':tabbable'),
        focusElem;

      switch (event.which) {
        case 9: //tab
          if (event.shiftKey && event.currentTarget === tabbables[0]) {
            // in case it is the first one, we switch to the last one
            focusElem = tabbables.last();
          } else if (!event.shiftKey && event.currentTarget === tabbables[tabbables.length - 1]) {
            // in case it is the last one, we switch to the first one
            focusElem = tabbables.first();
          }
          break;
      }

      if (focusElem && focusElem.length) { // if a key matched then we set the currently focused element
        event.preventDefault();
        focusElem.focus();
      }
      this._lastFocused=document.activeElement;
    },

    /**
      Adds is-focused class so that if more than one Popover is displayed,
      the Popover with focus will remain on top in the z-index order.
      @private
      */
    _focusInHandler: function(event) {
      $(event.currentTarget).addClass('is-focused');
    },

    /**
      Removes is-focused class so that if more than one Popover is displayed,
      the Popover without focus will go back to its original position in the z-order.
      @private
      */
    _focusOutHandler: function (event) {
      var $currentTarget = $(event.currentTarget);
      $currentTarget.removeClass('is-focused');
      if (!this.options.preventAutoHide &&
          this.$element.is(event.target) &&
          $(document.activeElement).closest(this.$element).length === 0) {
        this.hide();
      }
    },

    /** @private */
    _forcedBlur: false,

    /**
      Removes Popover from document focus loop and hides it from screen readers.
      @private
      */
    _forceBlur: function () {
      if (this._forcedBlur) {
        return;
      }
      this._forcedBlur = true;

      var $focusables = this.$element.find(':focusable').addBack();
      // for each focusable element including the $element,
      $focusables.each(function (i, focusable) {
        var $focusable = $(focusable);
        // cache any existing tabindex value.
        if ($focusable.data('cached-tabindex') === undefined) {
          $focusable.data('cached-tabindex', $focusable.attr('tabindex'));
        }
        // set the tabindex to -1, so that the focusable is not included in the document tab order.
        $focusable.attr('tabindex', -1);
      });
      // hide the Popover from assistive technology and add a focusin handler.
      this.$element.attr('aria-hidden', true).on('focusin.popover-' + this.uuid, this._unforceBlur.bind(this));
    },

    /**
      Restore focus from the document to the Popover focus loop.
      @private
      */
    _unforceBlur:  function () {
      if (!this._forcedBlur) {
        return;
      }
      this._forcedBlur = false;

      var $focusables = this.$element.find(':focusable').addBack();
      // for each focusable element including the $element,
      $focusables.each(function (i, focusable) {
        var $focusable = $(focusable);
        // restore the tabindex from the cached data value.
        if ($focusable.data('cached-tabindex') === undefined) {
          $focusable.removeAttr('tabindex');
        } else {
          $focusable.attr('tabindex', $focusable.data('cached-tabindex')).removeData('cached-tabindex');
        }
      });
      // reveal the Popover to assistive technology and remove the focusin handler.
      this.$element.attr('aria-hidden', false).off('focusin.popover-' + this.uuid);
    },

    _makeAccessible: function () {
      var $contentElements = this._getContentElement(this.$element);

      // the element has the role dialog
      this.$element.attr({
        'role': 'dialog',
        'tabindex': '-1'
      });

      $contentElements
        .attr('role', $contentElements.length > 1 ? 'group' : null)
        .not('[id]').each(function(i, contentElement) {
          contentElement.setAttribute('id', CUI.util.getNextId());
        });
    }
  });

  CUI.Widget.registry.register("popover", CUI.Popover);

  $(function () {
    // Must watch touchstart because click events don't bubble as expected on iOS Safari.
    $(document).on('touchstart.popover.data-api click.popover.data-api', '[data-toggle="popover"]',function (event) {

      var $trigger = $(this),
        $target = CUI.util.getDataTarget($trigger);

      // if data target is not defined try to find the popover as a sibling
      $target = $target && $target.length > 0 ? $target : $trigger.next('.coral-Popover');

      var popover = $target.popover($.extend({pointAt: $trigger}, $target.data(), $trigger.data())).data('popover');
      popover.toggleVisibility();
      event.preventDefault();
    });
  });
}(window.jQuery));

(function ($, window, undefined) {
  CUI.SelectList = new Class(/** @lends CUI.SelectList# */{
    toString: 'SelectList',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A select list for drop down widgets. This widget is intended to be used by other widgets.
     *
     * @description Creates a new select list
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} [options.type=static] static or dynamic list
     * @param  {Boolean} [options.multiple=false] multiple selection or not
     * @param  {Object} options.relatedElement DOM element to position at
     * @param  {Boolean} [options.autofocus=true] automatically sets the
     * caret to the first item in the list
     * @param  {Boolean} [options.autohide=true] automatically closes the
     * list when clicking the toggle button or clicking outside of the list
     * @param  {String} [options.dataurl] URL to receive values dynamically
     * @param  {String} [options.dataurlformat=html] format of the dynamic data load
     * @param  {Object} [options.dataadditional] additonal data to be sent with a remote loading request
     * @param  {Function} [options.loadData] function to be called if more data is needed. The function should return a $.Promise, which will be done, when all requested items where added to the list. This must not be used with a set dataurl.
     * @param {String} [options.collisionAdjustment] the collision option to be passed to jquery.ui.position. Use "none" to omit flipping.
     *
     *
     */
    construct: function (options) {
      this.applyOptions();

      this.$element
        .on('change:type', this._setType.bind(this))
        .on('click', this._SELECTABLE_SELECTOR, this._triggerSelected.bind(this))
        .on('mouseenter', this._SELECTABLE_SELECTOR, this._handleMouseEnter.bind(this));

      // accessibility
      this._makeAccessible();
    },

    defaults: {
      type: 'static', // static or dynamic
      multiple: false,
      relatedElement: null,
      autofocus: true, // autofocus on show
      autohide: true,
      dataurl: null,
      dataurlformat: 'html',
      datapaging: true,
      datapagesize: 10,
      dataadditional: null,
      loadData: $.noop, // function to receive more data
      position: 'center bottom-1',  // -1 to override the border,
      collisionAdjustment: ''
    },

    /**
     * Retrieve list of first level list items (groups or options). NB: The list
     * represents a snapshot of the current state. If items are added or
     * removed, the list will become invalid.
     *
     * @return {Array} List of CUI.SelectList.Option and CUI.SelectList.Group
     *                 instances
     */
    getItems: function () {
      return this.$element.children(".coral-SelectList-item").toArray().map(function (element) {
        var $element = $(element);
        if ($element.is(".coral-SelectList-item--option")) {
          return new CUI.SelectList.Option({element : $element});
        }
        else if ($element.is(".coral-SelectList-item--optgroup")) {
          return new CUI.SelectList.Group({element : $element});
        }
      });
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @returns option
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this.$element.children(".coral-SelectList-item"),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      if (!element.is(".coral-SelectList-item--option")) {
        throw new TypeError("Position does not point to option element");
      }

      return new CUI.SelectList.Option({element: element});
    },

    /**
     * Get CUI.SelectList.Group representing the group at the given position.
     *
     * @returns group
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getGroup : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this.$element.children(".coral-SelectList-item"),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      if (!element.is(".coral-SelectList-item--optgroup")) {
        throw new TypeError("Position does not point to group element");
      }

      return new CUI.SelectList.Group({element: element});
    },

    /**
     * Adds option at the given position. If position is undefined, the option
     * is added at the end of the list.
     *
     * @param {Object|CUI.SelectList.Option|Element|jQuery|Array} option that
     *        should be added. If type is Object, the keys `value` and `display`
     *        are used to create the option. If type is CUI.SelectList.Option,
     *        the underlying element is added to the list. If type is Element,
     *        the node is added to the list. If type is jQuery <b>all</b>
     *        elements within the collection are added to the list. If type is
     *        Array, then the array is expected to contain one of the other
     *        types.
     * @param {Number} Position at which the element should be inserted. If
     *        undefined, the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addOption : function (optionDescription, position) {
      var item, element, i;

      if ($.isArray(optionDescription) || (optionDescription && optionDescription.jquery)) {
        for (i = 0; i < optionDescription.length; i++) {
          this.addOption(optionDescription[i], position !== undefined ? position + i : undefined);
        }
        return;
      }
      else if (optionDescription && optionDescription.$element) {
        this.addOption(optionDescription.$element);
        return;
      }
      else if ($.isPlainObject(optionDescription)) {
        item = optionDescription;
      }
      else if (optionDescription instanceof Element) {
        element = $(optionDescription);
        item = {
          value: element.data("value"),
          display: element.text()
        };
      }
      else {
        throw new TypeError("Only Object, Element, CUI.SelectList.Option, jQuery and Array type arguments allowed.");
      }

      if (!element) {
        element = $("<li>", {
          "class": "coral-SelectList-item coral-SelectList-item--option",
          "data-value": item.value
        }).text(item.display);
      }

      this._addItem(element, position);
      this.$element.trigger($.Event("itemadded", {item: new CUI.SelectList.Option({element: element})}));
    },

    /**
     * Adds option group at the given position. If position is undefined, the group
     * is added to the end of the list.
     *
     * @param {String|CUI.SelectList.Group|Element|jQuery|Array} group that
     *        should be added. If type is String, it is used as display value.
     *        If type is CUI.SelectList.Group, the underlying element is added
     *        to the list. If type is Element, the node is added to the list.
     *        If type is jQuery <b>all</b> element within the collection are
     *        added to the list. If type is Array, then the array is expected to
     *        contain one of the other types.
     * @param {Number} Position at which the element should be inserted. If
     *        undefined, the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addGroup : function (groupDescription, position) {
      var item, element, i;

      if ($.isArray(groupDescription) || (groupDescription && groupDescription.jquery)) {
        for (i = 0; i < groupDescription.length; i++) {
          this.addGroup(groupDescription[i], position !== undefined ? position + i : undefined);
        }
        return;
      }
      else if (groupDescription && groupDescription.$element) {
        this.addGroup(groupDescription.$element);
        return;
      }
      else if ($.type(groupDescription) === "string") {
        item = {
          display: groupDescription
        };
      }
      else if (groupDescription instanceof Element) {
        element = $(groupDescription);
        item = {
          display: element.children(".coral-SelectList-groupHeader").text()
        };
      }
      else {
        throw new TypeError("Only String, Element, CUI.SelectList.Group, jQuery and Array type arguments allowed.");
      }

      if (!element) {
        element = $("<li>", {"class": "coral-SelectList-item coral-SelectList-item--optgroup"});
      }
      if (element.find(".coral-SelectList-groupHeader").length === 0) {
        element.prepend($("<span>", {"class": "coral-SelectList-groupHeader"}).text(item.display));
      }
      if (element.find(".coral-SelectList-sublist").length === 0) {
        element.append($("<ul>", {"class": "coral-SelectList-sublist"}));
      }

      this._addItem(element, position);
      this.$element.trigger($.Event("itemadded", {item: new CUI.SelectList.Group({element: element})}));
    },

    /**
     * @private
     */
    _addItem : function (element, position) {
      this._makeAccessibleListOption(element);

      var list = this._getList(),
          items = this._getItems();


      if (position === undefined || position === items.length) {
        list.append(element);
        return items.length;
      }

      if (position === 0) {
        list.prepend(element);
        return 0;
      }

      var ref = items.eq(position);

      if (position > 0 && ref.length) {
        ref.before(element);
        return position;
      }

      throw new RangeError("Position " + position + " is not within " +
                           "accepted range [0..." + items.length + "].");
    },

    /**
     * @private
     */
    _getList : function () {
      return this.$element;
    },

    /**
     * @private
     */
    _getItems : function () {
      return this._getList().children(".coral-SelectList-item");
    },

    /**
     * Selector used to find selectable items.
     * @private
     */
    _SELECTABLE_SELECTOR: '.coral-SelectList-item--option:not(.is-disabled):not(.is-hidden)',

    applyOptions: function () {
      this._setType();
    },

    /**
     * @private
     */
    _setType: function () {
      var self = this,
        timeout;

      function timeoutLoadFunc() {
        var elem = self.$element.get(0),
          scrollHeight = elem.scrollHeight,
          scrollTop = elem.scrollTop;

        if ((scrollHeight - self.$element.height()) <= (scrollTop + 30)) {
          self._handleLoadData();
        }
      }

      // we have a dynamic list of values
      if (this.options.type === 'dynamic') {

        this.$element.on('scroll.cui-selectlist-dynamic-load', function (event) {
          // debounce
          if (timeout) {
            clearTimeout(timeout);
          }

          if (self._loadingComplete || this._loadingIsActive) {
            return;
          }

          timeout = setTimeout(timeoutLoadFunc, 500);
        });
      } else { // static
        this.$element.off('scroll.cui-selectlist-dynamic-load');
      }
    },

    /**
     * The element that "owns" this SelectList element for accessibility purposes.
     * It should be an element that has an aria-owns attribute containing the id of this.$element,
     * if such an element doesn't exist, the _ownerElement will be the same as the _relatedElement.
     * @private
     */
    _ownerElement: null,

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#listbox
     * @private
     */
    _makeAccessible: function () {
      var self = this,
          $relatedElement = $(this.options.relatedElement),
          isVisible = this.$element.hasClass('is-visible');

      this._ownerElement = $('[aria-owns*="' + this.$element.attr('id') + '"]');

      if ($relatedElement.length) {
        if (!this._ownerElement.length) {
          this._ownerElement = $relatedElement;
        }
      }

      this._ownerElement.attr({
        'id': this._ownerElement.attr('id') || CUI.util.getNextId(),
        'aria-haspopup': true,
        'aria-expanded': isVisible
      });

      $relatedElement.not(this._ownerElement).removeAttr('aria-haspopup').removeAttr('aria-expanded');

      this.$element.attr({
        'role': 'listbox',
        'aria-hidden': !isVisible,
        'aria-multiselectable': this.options.multiple || null,
        'tabindex': -1
      });

      if (isVisible) {
          this.$element.attr('tabindex', 0);
          this.$element.not('.is-inline').addClass('is-inline');
      }

      this.$element
          .off('focusin.cui-selectlist focusout.cui-selectlist')
          .on('focusin.cui-selectlist', this._handleFocusIn.bind(this))
          .on('focusout.cui-selectlist', this._handleFocusOut.bind(this));

      this._makeAccessibleListOption(this.$element.children());
    },

    /**
     * Determine if the SelectList has focus.
     * @private
     */
    _hasFocus: function () {
      return this._ownerElement.is(document.activeElement) || $(document.activeElement).closest(this.$element).length === 1;
    },

    /**
     * Handles focusin events for accessibility purposes.
     * @param event The focusin event.
     * @private
     */
    _handleFocusIn: function (event) {
      var currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR+'[aria-selected="true"], ' + this._SELECTABLE_SELECTOR+'[tabindex="0"], '+ this._SELECTABLE_SELECTOR+'.is-highlighted').first();
      if (currentFocusEntry.length === 0) {
        this.setCaretToItem(
          this.$element.find(this._SELECTABLE_SELECTOR).first(),
          true);
        this.$element.attr('tabindex', -1);
      }

      if (this.$element.is('.is-inline')) {
        this.$element.addClass('is-focused');
        this.$element.off('keydown.cui-selectlist keypress.cui-selectlist')
          .on('keydown.cui-selectlist', this._handleKeyDown.bind(this))
          .on('keypress.cui-selectlist', this._handleKeyPress.bind(this));
      }
    },

    /**
     * Handles focusout events for accessibility purposes.
     * @param event The focusout event.
     * @private
     */
    _handleFocusOut: function (event) {
      if (this.$element.is('.is-inline')) {
        this.$element.removeClass('is-focused');
        this.$element.off('keydown.cui-selectlist keypress.cui-selectlist');
      }
    },

    _restoreFocusToOwnerElement: function() {
      var self = this,
          $ownerElement = this._ownerElement;

      if (!$ownerElement.is(':tabbable')) {
        $ownerElement = $ownerElement.find('input[type="text"], input[type="search"], button, input[type="button"]').filter(':tabbable').first();
      }
      $ownerElement.trigger('focus');
    },

    /**
     * Handles key down events for accessibility purposes.
     * @param event The keydown event.
     * @private
     */
    _handleKeyDown: function(event) {
      // enables keyboard support
      var entries = this.$element.find(this._SELECTABLE_SELECTOR),
        currentFocusEntry = entries.filter('.is-highlighted'),
        currentFocusIndex = entries.index(currentFocusEntry),
        newFocusEntry;

      if (!entries.length) {
        return;
      }

      switch (event.which) {
        case 13: // enter
        case 32: // space
          // If the toggle button for the select list has focus and
          // the user hits enter or space when a list item is
          // highlighted, they would expect the item
          // to be selected. If no item is highlighted, they
          // would expect the toggle to hide the list.
          // This is why we only preventDefault() when an entry
          // is highlighted.
          if (currentFocusEntry.length && $(document.activeElement).closest(this.$element).length === 1) {
            currentFocusEntry.trigger('click');
            event.preventDefault();
          }
          break;
        case 27: //esc
          this.hide();
          event.preventDefault();
          break;
        case 33: //page up
        case 38: //up arrow
          // According to spec, don't loop to the bottom of the list.
          if (currentFocusIndex > 0) {
            newFocusEntry = entries[currentFocusIndex-1];
          } else if (currentFocusIndex == -1) {
            newFocusEntry = entries[entries.length-1];
          }
          event.preventDefault();
          break;
        case 34: //page down
        case 40: //down arrow
          // According to spec, don't loop to the top of the list.
          if (currentFocusIndex + 1 < entries.length) {
            newFocusEntry = entries[currentFocusIndex+1];
          }
          event.preventDefault();
          break;
        case 36: //home
          newFocusEntry = entries[0];
          event.preventDefault();
          break;
        case 35: //end
          newFocusEntry = entries[entries.length-1];
          event.preventDefault();
          break;
        case 9:  //tab
          if (this.options.visible && this.options.autohide) {
            event.preventDefault();
          }
          break;
      }

      if (newFocusEntry !== undefined && this._hasFocus()) {
        this.setCaretToItem($(newFocusEntry), true);
      }
    },

    _keypressTimeoutID: null,
    _keypressTimeoutDuration: 1000,
    _keypressSearchString: "",
    _unicodeRangesRegExp: /[\u0000-\u007F|\u0080-\u00FF|\u0100-\u017F|\u0180-\u024F|\u0250-\u02AF|\u02B0-\u02FF|\u0300-\u036F|\u0370-\u03FF|\u0400-\u04FF|\u0500-\u052F|\u0530-\u058F|\u0590-\u05FF|\u0600-\u06FF|\u0700-\u074F|\u0780-\u07BF|\u0900-\u097F|\u0980-\u09FF|\u0A00-\u0A7F|\u0A80-\u0AFF|\u0B00-\u0B7F|\u0B80-\u0BFF|\u0C00-\u0C7F|\u0C80-\u0CFF|\u0D00-\u0D7F|\u0D80-\u0DFF|\u0E00-\u0E7F|\u0E80-\u0EFF|\u0F00-\u0FFF|\u1000-\u109F|\u10A0-\u10FF|\u1100-\u11FF|\u1200-\u137F|\u13A0-\u13FF|\u1400-\u167F|\u1680-\u169F|\u16A0-\u16FF|\u1700-\u171F|\u1720-\u173F|\u1740-\u175F|\u1760-\u177F|\u1780-\u17FF|\u1800-\u18AF|\u1900-\u194F|\u1950-\u197F|\u19E0-\u19FF|\u1D00-\u1D7F|\u1E00-\u1EFF|\u1F00-\u1FFF|\u2000-\u206F|\u2070-\u209F|\u20A0-\u20CF|\u20D0-\u20FF|\u2100-\u214F|\u2150-\u218F|\u2190-\u21FF|\u2200-\u22FF|\u2300-\u23FF|\u2400-\u243F|\u2440-\u245F|\u2460-\u24FF|\u2500-\u257F|\u2580-\u259F|\u25A0-\u25FF|\u2600-\u26FF|\u2700-\u27BF|\u27C0-\u27EF|\u27F0-\u27FF|\u2800-\u28FF|\u2900-\u297F|\u2980-\u29FF|\u2A00-\u2AFF|\u2B00-\u2BFF|\u2E80-\u2EFF|\u2F00-\u2FDF|\u2FF0-\u2FFF|\u3000-\u303F|\u3040-\u309F|\u30A0-\u30FF|\u3100-\u312F|\u3130-\u318F|\u3190-\u319F|\u31A0-\u31BF|\u31F0-\u31FF|\u3200-\u32FF|\u3300-\u33FF|\u3400-\u4DBF|\u4DC0-\u4DFF|\u4E00-\u9FFF|\uA000-\uA48F|\uA490-\uA4CF|\uAC00-\uD7AF|\uD800-\uDB7F|\uDB80-\uDBFF|\uDC00-\uDFFF|\uE000-\uF8FF|\uF900-\uFAFF|\uFB00-\uFB4F|\uFB50-\uFDFF|\uFE00-\uFE0F|\uFE20-\uFE2F|\uFE30-\uFE4F|\uFE50-\uFE6F|\uFE70-\uFEFF|\uFF00-\uFFEF|\uFFF0-\uFFFF]/,

    /**
     * Handles key press events for accessibility purposes. Provides alphanumeric search.
     * @param event The keypress event.
     * @private
     */
    _handleKeyPress: function(event) {
      // enables keyboard support
      var entries = this.$element.find(this._SELECTABLE_SELECTOR),
        currentFocusEntry = entries.filter('.is-highlighted'),
        currentFocusIndex = entries.index(currentFocusEntry),
        $newFocusEntry,
        newString = '',
        start, i, entry, regex, comparison;

      if (!entries.length) {
        return;
      }
      switch (event.which) {
        case 13: // enter
        case 32: // space
        case 27: // esc
        case 33: // page up
        case 37: // left arrow
        case 38: // up arrow
        case 34: // page down
        case 39: // right arrow
        case 40: // down arrow
        case 36: // home
        case 35: // end
        case 9: // tab
          break;
        default:  // alphanumeric
          clearTimeout(this._keypressTimeoutID);

          newString = String.fromCharCode(event.which);


          if (!this._unicodeRangesRegExp.test(newString)) {
              newString = '';
          }

          if (newString === '') {
            return;
          }

          this._keypressSearchString += newString !== this._keypressSearchString ? newString : '';

          this._keypressTimeoutID = setTimeout(function () {
            this._keypressSearchString = '';
          }.bind(this), this._keypressTimeoutDuration);

          if (currentFocusIndex === -1) {
            start = 0;
          }
          else if (this._keypressSearchString.length === 1) {
            start = currentFocusIndex + 1;
          }
          else {
            start = currentFocusIndex;
          }

          regex = new RegExp('^' + this._keypressSearchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'), 'i');

          for (i = start; i < entries.length; i++) {
            entry = entries.eq(i);
            comparison = $.trim((entry.data('display') || entry.text()));
            if (regex.test(comparison)) {
              $newFocusEntry = entry;
              break;
            }
          }

          if ($newFocusEntry === undefined) {
            for (i = 0; i < start; i++) {
              entry = entries.eq(i);
              comparison = $.trim((entry.data('display') || entry.text()));
              if (regex.test(comparison)) {
                $newFocusEntry = entry;
                break;
              }
            }
          }

          if ($newFocusEntry !== undefined) {
            this.setCaretToItem($newFocusEntry, true);
          }
      }
    },

    /**
     * makes the list options accessible
     * @private
     * @param  {jQuery} elem
     */
    _makeAccessibleListOption: function (elem) {
      elem.each(function (i, e) {
        var entry = $(e), $optGroupTitle;

        // group header
        if (entry.hasClass('coral-SelectList-item--optgroup')) {
          $optGroupTitle = entry.children('.coral-SelectList-groupHeader');
          $optGroupTitle.attr({
            'id': $optGroupTitle.attr('id') || CUI.util.getNextId(),
            'role': 'heading'
          });
          entry.attr({
            'role': 'presentation'
          }).children('ul').each(function(i, ul){
            var $ul = $(ul);
            $ul.attr({
              'role': 'group',
              'aria-labelledby': $optGroupTitle.attr('id')
            });
          }).children('li').each(function(i, li){
            var $li = $(li);
            $li.attr({
              'role': 'option',
              'id': $li.attr('id') || CUI.util.getNextId()
            });
          });
        } else {
          entry.attr({
            'role': 'option',
            'id': entry.attr('id') || CUI.util.getNextId()
          });
        }
      });
    },

    /**
     * Visually focuses the provided list item and ensures it is within
     * view.
     * @param {jQuery} $item The list item to focus.
     * @param {boolean} scrollToItem Whether to scroll to ensure the item
     * is fully within view.
     */
    setCaretToItem: function($item, scrollToItem) {
      this.$element.find('.coral-SelectList-item--option')
        .removeClass('is-highlighted')
        .removeAttr('tabindex');

      $item.addClass('is-highlighted').attr('tabindex', 0);
      this._ownerElement.attr('aria-activedescendant', $item.attr('id'));
      this.$element.attr('aria-activedescendant', $item.attr('id'));

      if (this._hasFocus()) {
        $item.trigger('focus');
      } else if (scrollToItem) {
        this.scrollToItem($item);
      }
    },

    /**
     * Removes visual focus from list items and scrolls to the top.
     */
    resetCaret: function() {
      this.$element.find('[role="option"]')
        .removeClass('is-highlighted')
        .removeAttr('tabindex');
      this.$element.scrollTop(0);
      this._ownerElement.removeAttr('aria-activedescendant');
      this.$element.removeAttr('aria-activedescendant');
    },

    /**
     * Scrolls as necessary to ensure the list item is within view.
     * @param {jQuery} $item The list item
     */
    scrollToItem: function($item) {
      if (!$item.length) {
        return;
      }

      var itemTop = $item.position().top,
        itemHeight = $item.outerHeight(false),
        scrollNode = this.$element[0];

      var bottomOverflow = itemTop + itemHeight - scrollNode.clientHeight;

      if (bottomOverflow > 0) {
        scrollNode.scrollTop += bottomOverflow;
      } else if (itemTop < 0) {
        scrollNode.scrollTop += itemTop;
      }
    },

    show: function () {
      if (this.options.visible) {
        return this;
      } else {
        hideLists(); // Must come before the parent show method.
        return this.inherited(arguments);
      }
    },

    /**
     * @private
     */
    _show: function () {
      var self = this,
          currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR+'[aria-selected="true"], ' + this._SELECTABLE_SELECTOR+'[tabindex="0"], '+ this._SELECTABLE_SELECTOR+'.is-highlighted').first();

      this.$element
        .addClass('is-visible')
        .attr('aria-hidden', false);

      this._ownerElement.attr('aria-expanded', true);

      this._position();

      if (this.options.autofocus) {
        if (currentFocusEntry.length === 0) {
            currentFocusEntry = this.$element.find(this._SELECTABLE_SELECTOR).first();
        }
        this.setCaretToItem(
          currentFocusEntry,
          true);
      }

      // if dynamic start loading
      if (this.options.type === 'dynamic') {
        var dataRequest = this._outstandingRequest || this._handleLoadData();
        dataRequest.done(function () {
          if (self.options.autofocus) {
            self.setCaretToItem(
              self.$element.find(self._SELECTABLE_SELECTOR).first(),
              true);
          }
        });
      }

      $(document).on('keydown.cui-selectlist', this._handleKeyDown.bind(this))
        .on('keypress.cui-selectlist', this._handleKeyPress.bind(this));
    },

    /**
     * Positions the list below a related component (or above when it does not fit below).
     * @private
     */
    _position: function () {
      if (this.options.visible) {
        this.$element.position({
          my: 'top',
          at: this.options.position,
          of: this.options.relatedElement,
          collision: this.options.collisionAdjustment
        });

        var $relatedElement = $(this.options.relatedElement);
        // Verify if select list is positioned above or below the related element
        if(this.$element.offset().top < $relatedElement.offset().top) {
          this.$element
            .removeClass('is-below')
            .addClass('is-above');
          $relatedElement
            .removeClass('is-above')
            .addClass('is-below');
        }
        else {
          this.$element
            .removeClass('is-above')
            .addClass('is-below');
          $relatedElement
            .removeClass('is-below')
            .addClass('is-above');
        }
      }
    },

    /**
     * @private
     */
    _hide: function () {
      var $relatedElement = $(this.options.relatedElement),
          $ownerElement = this._ownerElement,
          removeKeyboardEventHandlers = true,
          hasFocus = this._hasFocus();

      this.$element
        .removeClass('is-visible')
        .attr('aria-hidden', true);

      this._ownerElement.attr('aria-expanded', true);

      this.reset();

      // Determine if there is a visible selectList with autohide=false
      $(selectListSelector).each(function () {
        var selectList = $(this).data('selectList');
        if (selectList && !selectList.get('autohide') && selectList.get('visible')) {
          // If the selectList with autohide=false is visible,
          // we don't want to remove the keyboard event listeners.
          removeKeyboardEventHandlers = false;
        }
      });

      // Only remove keyboard event listeners when no selectList with autohide=false is visible.
      if (removeKeyboardEventHandlers) {
        $(document).off('keydown.cui-selectlist keypress.cui-selectlist');
      }

      $ownerElement.removeAttr('aria-activedescendant');
      if ($ownerElement.length && hasFocus) {
          setTimeout(this._restoreFocusToOwnerElement.bind(this), 50);
      }
    },

    /**
     * triggers an event for the currently selected element
     * @fires SelectList#selected
     * @private
     */
    _triggerSelected: function (event) {
      var cur = $(event.currentTarget),
        val = cur.data('value'),
        display = cur.data('display') || cur.text();

      cur.trigger($.Event('selected', {
        selectedValue: val,
        displayedValue: display
      }));
    },

    /**
     * handles the mousenter event on an option
     * this events sets the the focus to the current event
     * @param  {jQuery.Event} event
     *
     * @private
     */
    _handleMouseEnter: function (event) {
      this.setCaretToItem($(event.currentTarget), false);
    },

    /**
     * deletes the item from the dom
     */
    clearItems: function () {
      this.$element.empty();
    },

    /**
     * current position for the pagination
     * @private
     * @type {Number}
     */
    _pagestart: 0,

    /**
     * indicates if all data was fetched
     * @private
     * @type {Boolean}
     */
    _loadingComplete: false,

    /**
     * indicates if currently data is fetched
     * @private
     * @type {Boolean}
     */
    _loadingIsActive: false,

    /**
     * The outstanding request. When data is actively being loaded this will be an implementation of the jQuery
     * Promise interface, typically a jqXHR object.
     * @type {Object}
     */
    _outstandingRequest: null,

    /**
     * handle asynchronous loading of data (type == dynamic)
     * @private
     */
    _handleLoadData: function () {
      var promise,
        self = this,
        end = this._pagestart + this.options.datapagesize;

      if (this._outstandingRequest && typeof this._outstandingRequest.abort === 'function') {
        this._outstandingRequest.abort();
      } else {
        // add wait
        $('<div/>', {
          'class': 'coral-SelectList-item--wait',
          'role': 'presentation'
        }).append($('<span/>', {
          'class': 'coral-Wait',
          'role': 'progressbar'
        })).appendTo(self.$element);

        this._position();

        // activate fetching
        this._loadingIsActive = true;
      }

      // load from given URL
      if (this.options.dataurl) {
        promise = $.ajax({
          url: this.options.dataurl,
          context: this,
          dataType: this.options.dataurlformat,
          data: $.extend({
            start: this._pagestart,
            end: end
          }, this.options.dataadditional || {})
        }).done(function (data) {
            var cnt = 0;

            if (self.options.dataurlformat === 'html') {
              var elem = $(data);

              cnt = elem.filter('li').length;

              self._makeAccessibleListOption(elem);
              self.$element.append(elem);
            }

            // if not enough elements came back then the loading is complete
            if (cnt < self.options.datapagesize) {
              this._loadingComplete = true;
            }

          });

      } else { // expect custom function to handle
        promise = this.options.loadData.call(this, this._pagestart, end);
        promise.done(function (loadingComplete) {
          if (loadingComplete !== undefined) {
            self._loadingComplete = loadingComplete;
          }
        });
      }

      promise.done(function() {
         // increase to next page
         self._pagestart = end;
      });

      promise.always(function () {
        self.$element.find('.coral-SelectList-item--wait').remove();
        self._position();
        self._loadingIsActive = false;
        self._outstandingRequest = null;
      });

      this._outstandingRequest = promise;

      return promise;
    },

    /**
     * resets the dynamic loaded data
     */
    reset: function () {
      if (this.options.type === 'dynamic') {
        this.clearItems();
        this._pagestart = 0;
        this._loadingComplete = false;
      }
    },

    /**
     * triggers a loading operation
     * this requires to have the selectlist in a dynamic configuration
     * @param  {Boolean} reset resets pagination
     */
    triggerLoadData: function (reset) {
      if (reset) {
        this.reset();
      }

      this._handleLoadData();
    },

    /**
     * Filters the list of items based on a provided filtering function. This
     * filtering only occurs on the client and therefore is primarily intended
     * to be used with a static list (type=static).
     * @param {CUI.SelectList~filterCallback} [callback] Callback used to test
     * list options. If no function is passed, all items will be shown.
     */
    filter: function(callback) {
      var $items = this.$element.find('.coral-SelectList-item--option'),
          $groups = this.$element.find('.coral-SelectList-item--optgroup');

      if (callback) {
        $items.each(function() {
          var $item = $(this);

          var hideItem =
              !callback.call(this, $item.data('value'), $item.data('display') || $item.text());

          $item.toggleClass('is-hidden', hideItem);

          if (hideItem) {
            $item.removeClass('is-highlighted');
          }
        });

        $groups.each(function() {
          var $group = $(this);

          var hasVisibleItems =
              $group.find('[role="option"]:not(.is-hidden)').length > 0;

          $group.toggleClass('is-hidden', !hasVisibleItems);
        });
      } else {
        // Shortcut for performance. Assumes that all groups have items
        // and therefore should be shown.
        $items.removeClass('is-hidden');
        $groups.removeClass('is-hidden');
      }

      // Important when the bottom of the list needs to stay pegged to the top of an input, for example.
      this._position();
    }
  });

  CUI.Widget.registry.register("selectlist", CUI.SelectList);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.SelectList.init($('[data-init~=selectlist]', event.target));
    });
  }

  var selectListSelector = '.coral-SelectList',
    toggleSelector = '[data-toggle~=selectlist]';

  /**
   * Hides all select lists that have autohide enabled.
   * @ignore
   */
  var hideLists = function () {
    $(selectListSelector).each(function () {
      var selectList = $(this).data('selectList');
      if (selectList && selectList.get('autohide')) {
        selectList.hide();
      }
    });
  };

  /**
   * From a toggle element, toggles the visibility of its target select list.
   * @ignore
   */
  var toggleList = function () {
    var $selectList = CUI.util.getDataTarget($(this)),
        selectListWidget;
    if ($selectList.length) {
      selectListWidget = $selectList.data('selectList');
      if (!selectListWidget.get('relatedElement')) {
        selectListWidget.set('relatedElement', this);
        selectListWidget._makeAccessible();
      }
      selectListWidget.resetCaret();
      selectListWidget.toggleVisibility();
    }
    return false;
  };

  var handleToggleSelectorKeydown = function(event) {
    var $selectList = CUI.util.getDataTarget($(this)),
        selectList = $selectList.data('selectList'),
        isVisible = $selectList.length && $selectList.hasClass('is-visible');
    switch(event.which) {
      case 40:
        if ($selectList.length && !isVisible) {
          toggleList.call(this);
        }
        event.preventDefault();
        break;
      case 9:
        if (isVisible && selectList.get('autohide')) {
          event.preventDefault();
        }
        break;
    }
  };

  $(document)
    // If a click reaches the document, hide all open lists.
    .on('click.cui-selectlist', hideLists)

    // If the click is from a select list, don't let it reach the document
    // to keep the listener above from hiding the list.
    .on('click.cui-selectlist', selectListSelector, function (event) {
      event.stopPropagation();
    })

    // If a click is from a trigger button, toggle its menu.
    .on('click.cui-selectlist', toggleSelector, toggleList)

    .on('keydown.cui-selectlist-toggleSelector', toggleSelector, handleToggleSelectorKeydown);


  /**
   * Triggered when option was selected
   *
   * @name CUI.SelectList#selected
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.selectedValue value which was selected
   * @param {String} event.displayedValue displayed text of the selected element
   */

  /**
   * Triggered after option or group was added
   *
   * @name CUI.SelectList#itemadded
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.kind either "option" or "group"
   * @param {String} event.position index of element within parents child list
   * @param {String} event.display displayed text of added element
   * @param {String} event.value value of added element (not present for groups)
   * @param {String} event.target either .coral-SelectList or .coral-SelectList-item--optgroup
   *                              node to which the element was added. Use this
   *                              to detect hierarchies
   */

  /**
   * Triggered after option or group was removed
   *
   * @name CUI.SelectList#itemremoved
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.kind either "option" or "group"
   * @param {String} event.position index of element within parents child list
   *                                before it was removed
   * @param {String} event.display displayed text of removed element
   * @param {String} event.value value of removed element (not present for groups)
   * @param {String} event.target either .coral-SelectList or .coral-SelectList-item--optgroup
   *                              node from which the element was removed. Use
   *                              this to detect hierarchies
   */

  /**
   * Triggered when option was unselected (not implemented)
   *
   * @name CUI.SelectList#unselected
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.selectedValue value which was unselected
   * @param {String} event.displayedValue displayed text of the unselected element
   */

  /**
   * Callback used to test list options for filtering purposes. Expects a
   * return value of true if the list item should be visible or false if it
   * should be hidden.
   *
   * @callback CUI.SelectList~filterCallback
   * @param {Object} value The value of the list item.
   * @param {String} display The text representation of the list item.
   */

}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Item = new Class(/** @lends CUI.SelectList.Item# */{
    toString : 'SelectList.Item',
    $element : undefined,

    /**
     * @private
     * The last known position before the element was removed.
     */
    _cachedPosition: null,

    construct : function (args) {
      this.$element = $(args.element);
    },

    /**
     * Get position within the set of sibling items. The return value may be
     * used as index with {get,add}Group() and {get,add}Option().
     */
    getPosition : function () {
      var position = this.$element.index();
      return position > -1 ? position : this._cachedPosition;
    },

    /**
     * @abstract
     */
    getDisplay : function () {
      throw new Error("Subclass responsibility");
    },

    /**
     * Remove item from list.
     */
    remove : function () {
      var parent = this._getParent();

      this._cachedPosition = this.getPosition();
      this.$element.remove();
      parent.trigger($.Event("itemremoved", {item: this}));
    },

    /**
     * @abstract
     * @private
     */
    _getParent : function () {
      throw new Error("Subclass responsibility");
    }
  });
}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Option = new Class(/** @lends CUI.SelectList.Option# */{
    toString : 'SelectList.Option',

    extend: CUI.SelectList.Item,

    /**
     * Get displayed text, which represents the Option.
     */
    getDisplay : function () {
      return this.$element.text();
    },

    /**
     * Get value, which represents the Option.
     */
    getValue : function () {
      return this.$element.attr("data-value");
    },

    /**
     * @override
     * @private
     */
    _getParent : function () {
      return this.$element.closest(".coral-SelectList, .coral-SelectList-item--optgroup");
    }
  });
}(jQuery, this));

(function ($, window, undefined) {
  CUI.SelectList.Group = new Class(/** @lends CUI.SelectList.Group# */{
    toString : 'SelectList.Group',
    extend: CUI.SelectList.Item,

    /**
     * Get displayed text, which represents the Group.
     */
    getDisplay : function () {
      return this.$element.children("span").text();
    },

    /**
     * Get list of Options, that are part of this Group. Similar to
     * {@linkcode CUI.SelectList.getItems()}, only that this may only return
     * Option instances.
     *
     * @return {Array} List of CUI.SelectList.Option instances.
     */
    getItems : function () {
      return this._getItems().toArray().map(function (element) {
        return new CUI.SelectList.Option({element : element});
      });
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @returns option
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption : function (position) {
      if (!$.isNumeric(position)) {
        throw new TypeError("Position should be numeric");
      }

      var items = this._getItems(),
          element = items.eq(position);

      if (position < 0 || element.length === 0) {
        throw new RangeError("Position >" + position + "< is not within expected range [0," + (items.length - 1) + "]");
      }

      return new CUI.SelectList.Option({element: element});
    },

    /**
     * Add Option to Group. If specified, the option will be inserted at
     * `position`, otherwise at the end.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     */
    addOption : CUI.SelectList.prototype.addOption,

    /**
     * @private
     */
    _addItem : CUI.SelectList.prototype._addItem,
    /**
     * @private
     */
    _getList : function () {
      return this.$element.children(".coral-SelectList-sublist").first();
    },
    /**
     * @private
     */
    _getItems : CUI.SelectList.prototype._getItems,
    /**
     * @private
     */
    _makeAccessibleListOption : CUI.SelectList.prototype._makeAccessibleListOption,

    /**
     * @override
     * @private
     */
    _getParent : function () {
      return this.$element.parent();
    }
  });
}(jQuery, this));

(function ($) {
  CUI.Switch = new Class(/** @lends CUI.Switch# */{
    toString: 'Switch',
    extend: CUI.Widget,

    construct: function (options) {
      this._initMarkup();
      this._setListeners();
    },

    /** @ignore */
    _initMarkup: function () {

      //  This correct
      this._correctElementTagName();

      this.$input = this.$element.find('.coral-Switch-input');
      this.$onLabel = this.$element.find('.coral-Switch-onLabel');
      this.$offLabel = this.$element.find('.coral-Switch-offLabel');

      this._makeAccessible();
    },

    /**
      Replaces label element with a span element.

      If the $element is a label, both 'On' and 'Off'
      will be announced by screen readers along with any
      explicit label for the $input element, which is undesireable.
      @ignore
     */
    _correctElementTagName: function () {
      var $newElement, attributes;

      if (!this.$element.is('label')) {
        return;
      }

      $newElement = $('<span/>');

      attributes = this.$element.prop("attributes");

      // loop through $element attributes and apply them on $newElement
      $.each(attributes, function() {
          $newElement.attr(this.name, this.value);
      });

      $newElement.insertBefore(this.$element).append(this.$element.children());
      this.$element.remove();
      this.$element = $newElement;
    },

    /** @ignore */
    _makeAccessible: function() {
      var self = this,
          labelIDs,
          checked = self.$input.is(':checked'),
          isMacLike = /(mac|iphone|ipod|ipad)/i.test(window.navigator.platform),
          isFirefox = /firefox/i.test(window.navigator.userAgent);

      if (!this.$input.attr('id')) {
        this.$input.attr('id', CUI.util.getNextId());
      }

      if (!this.$offLabel.attr('id')) {
        this.$offLabel.attr('id', CUI.util.getNextId());
      }

      if (!this.$onLabel.attr('id')) {
        this.$onLabel.attr('id', CUI.util.getNextId());
      }

      if (!isMacLike) {
        this.$input.attr({
          'role': 'button',
          'aria-pressed': checked
        });
      }

      this.$offLabel.attr({
        'role': 'presentation',
        'aria-hidden': checked
      });

      this.$onLabel.attr({
        'role': 'presentation',
        'aria-hidden': !checked
      });

      if (this.$input.attr('aria-label') || (this.$input.attr('aria-labelledby') && $('#' + this.$input.attr('aria-labelledby').split(' ')[0]).length)) {
        return;
      }

      // check to see if the switch $element is wrapped in a label
      this.$labels = this.$element.closest('label');

      // If it is wrapped in a label, screen readers will announce both
      // 'On' and 'Off' along with any other label content, which can be pretty annoying.
      // This unwraps the switch $element and appends it as a sibling of the label.
      if (this.$labels.length === 1) {
        // Make sure that the label wrapping the switch $element is
        // explicitly associated with the $input using the for attribute.
        if (this.$labels.attr('for') !== this.$input.attr('id')) {
          this.$labels.attr('for', this.$input.attr('id'));
        }
        // If the label text comes before the switch $element,
        // insert the $element after the label,
        // otherwise insert the $element before the label.
        var beforeOrAfter = (this.$labels.contents()
          .filter(function() {
            return (this.nodeType === 3 && $.trim(this.nodeValue).length) || this.nodeType === 1;
          }).index(this.$element) === 0) ? 'Before' : 'After';
        this.$element['insert'+ beforeOrAfter](this.$labels);
      } else {
        this.$labels = $('label[for="' + this.$input.attr('id') + '"]').not(this.$offLabel).not(this.$onLabel);

        if (this.$labels.length === 0) {
          this.$labels = this.$labels.add(this.$offLabel).add(this.$onLabel);
        }

        if (this.$labels.length > 0) {
          labelIDs = [];

          this.$labels.each(function(i, label) {
            var $label = $(label),
                isOnLabel = $label.is(self.$onLabel),
                isOffLabel = $label.is(self.$offLabel);

            if (!$label.attr('id')) {
              $label.attr('id', CUI.util.getNextId());
            }

            if ((!isOnLabel && !isOffLabel) || (isOnLabel && checked) || (isOffLabel && !checked)) {
              labelIDs.push($label.attr('id'));
            }
          });

          if (labelIDs.length > 0) {
            this.$input.attr('aria-labelledby', labelIDs.join(' '));
          }
        }
      }

      // HACK: In Firefox on OSX, VoiceOver favors aria-describedby over label which is undesireable.
      if (isMacLike && isFirefox) {
        return;
      }
      this.$input.attr('aria-describedby', checked ? this.$onLabel.attr('id') : this.$offLabel.attr('id'));
    },

    /** @ignore */
    _setListeners: function () {
      this.$input.on('change', function(event) {
        var checked = this.$input.is(':checked'),
            onLabelId = this.$onLabel.attr('id'),
            offLabelId = this.$offLabel.attr('id'),
            ariaLabelledBy = this.$input.attr('aria-labelledby');

        if (ariaLabelledBy) {
          ariaLabelledBy = ariaLabelledBy.replace((checked ? offLabelId : onLabelId), (checked ? onLabelId : offLabelId));
          this.$input.attr('aria-labelledby', ariaLabelledBy);
        }

        this.$input
          .filter('[aria-describedby]').attr('aria-describedby', checked ? this.$onLabel.attr('id') : this.$offLabel.attr('id'))
          .filter('[aria-pressed]').attr('aria-pressed', checked);

        this.$onLabel.attr('aria-hidden', !checked);

        this.$offLabel.attr('aria-hidden', checked);

      }.bind(this));
      this.$input.trigger('change');
    },
  });

  CUI.Widget.registry.register("Switch", CUI.Switch);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.Switch.init($("[data-init~=switch], .coral-Switch", e.target));
  });

}(window.jQuery));

(function ($, window, undefined) {

  var CLASS_PANE_LIST = 'coral-TabPanel-content',
      CLASS_TAB_LIST = 'coral-TabPanel-navigation',

      SELECTOR_TAB_LIST = '.' + CLASS_TAB_LIST,
      SELECTOR_PANE_LIST = '.' + CLASS_PANE_LIST;

  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A group of tabs.
     *
     * @description Creates a new tab panel
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} [options.type=""] Style type of the tabs. Can be
     * "stacked", "nav", or left blank (infers the default type).
     * @param  {Number} [options.active=0] index of active tab
     */
    construct: function (options) {

      this.tablist = this._findOrCreateTabList();
      this.panelist = this._findOrCreatePaneList();

      this._applyOptions();

      // set up listeners for change events
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:active', this._setActive.bind(this));
    },

    defaults: {},

    // Note: the white tabs variant is deprecated, and will be removed in a future release
    // See https://issues.adobe.com/browse/CUI-1156 and https://issues.adobe.com/browse/CUI-1154
    DEFAULT_VARIANT_KEY: 'default',

    VARIANT_TYPES: [
      'default',
      'stacked',
      'nav'
    ],

    VARIANT_CLASS_MAPPING: {
      'default': '',
      'stacked': 'coral-TabPanel--stacked',
      'nav': 'coral-TabPanel--large'
    },

    /**
     * Disables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setDisabled: function (tab, switcher) {
      var hop = switcher || false;

      tab.toggleClass('is-disabled', hop)
        .prop('aria-disabled', hop);
      return this;
    },

    /**
     * Enables a tab
     * @param  {jQuery} tab
     * @return {jQuery} this, chainable
     */
    setEnabled: function (tab) {
      return this.setDisabled(tab, true);
    },

    /**
     * Adds a tab and associated panel.
     *
     * @param {Object} [options] Tab options.
     * @param {String|HTMLElement|jQuery} [options.tabContent] Content to be
     * used inside the tab. This can be an HTML string, a DOM node,
     * or a jQuery object. This content will be wrapped by an
     * internally-created element that will serve as the tab.
     * @param {String|HTMLElement|jQuery} [options.panelContent] Content to be
     * used inside the panel. This can be an HTML string, a DOM node,
     * or a jQuery object. This content will be wrapped by an internally-created
     * element that will serve as the panel. This is not intended to be
     * used when options.panelURL is defined.
     * @param {String} [options.panelURL] A URL from which to asynchronously
     * load the panel content when the tab is activated. This is not intended
     * to be used when options.panelContent is defined.
     * @param {String} [options.panelID] An ID to be applied to the
     * internally-created panel. If one is not provided, a unique ID will be
     * generated for the panel.
     * @param {Number} [options.index] The index at which the tab should be
     * added. If no index is provided, the tab will be added as the last
     * tab.
     * @param {Boolean} [options.enabled=true] Whether the tab should be
     * enabled (disabled tabs cannot be selected).
     * @param {Boolean} [options.active=true] Whether the tab should be
     * immediately activated/selected. In other words, its panel will be
     * immediately visible and panels for other tabs will be hidden.
     *
     * @return {String} The ID of the panel. If options.panelID was defined,
     * this will be the same value. If options.panelID was not defined,
     * this will be an internally-generated, unique ID.
     */
    addItem: function(options) {
      var tabs = this._getTabs();

      options = $.extend({
        tabContent: '',
        panelContent: '',
        panelID: undefined,
        panelURL: undefined,
        index: tabs.length,
        enabled: true,
        active: true
      }, options);

      var $panel = $('<section class="coral-TabPanel-pane"/>').append(options.panelContent);

      if (options.panelID !== undefined) {
        $panel.attr('id', options.panelID);
      }

      var $tab = $('<a class="coral-TabPanel-tab" data-toggle="tab"/>').append(options.tabContent);

      if (options.panelURL !== undefined) {
        $tab.attr('href', options.panelURL);
      }

      // Confine the index to valid values.
      var index = Math.min(Math.max(options.index, 0), tabs.length);

      if (index === 0) {
        this.tablist.prepend($tab);
        this.panelist.prepend($panel);
      } else {
        tabs.eq(index - 1).after($tab);
        this._getPanels().eq(index - 1).after($panel);
      }

      if (!options.enabled) {
        $tab.addClass('is-disabled');
      }

      this._makeTabsAccessible($tab);

      if (options.active && options.enabled) {
        this._activateTab($tab, true);
      }

      return $panel.attr('id');
    },

    /**
     * Removes a tab and associated panel. If the tab being removed is
     * the active tab, the nearest enabled tab will be activated.
     * @param {Number} index The index of the tab to remove.
     */
    removeItem: function(indexOrID) {
      var $tabs = this._getTabs(),
        $panels = this._getPanels(),
        $tab, $panel;

      if (typeof indexOrID === 'number') {
        $tab = $tabs.eq(indexOrID);
        $panel = $panels.eq(indexOrID);
      } else if (typeof indexOrID === 'string') {
        $tab = $tabs.filter('[aria-controls="' + indexOrID + '"]');
        $panel = $panels.filter('#' + indexOrID);
      }

      if (!$tab || !$panel) {
        return;
      }

      if ($tab.hasClass('is-active')) {
        var ENABLED_TAB_SELECTOR = '.coral-TabPanel-tab[data-toggle="tab"]:not(.is-disabled)';

        var $tabToActivate = $tab.nextAll(ENABLED_TAB_SELECTOR).first();

        if ($tabToActivate.length === 0) {
          $tabToActivate = $tab.prevAll(ENABLED_TAB_SELECTOR).first();
        }

        if ($tabToActivate.length === 1) {
          this._activateTab($tabToActivate, true);
        }
      }

      $panel.remove();
      $tab.remove();
    },

    /** Internals **/

    // finds or creates the container for the tabs
    /** @ignore **/
    _findOrCreateTabList: function() {
      var element = this.$element.find(SELECTOR_TAB_LIST);
      if (element.length === 0) {
        element = $('<nav>')
            .addClass(CLASS_TAB_LIST)
            .prependTo(this.$element);
      }
      return element;
    },

    // finds or creates the container for the panes that are being
    // switched be the tabs
    /** @ignore **/
    _findOrCreatePaneList: function() {
      var element = this.$element.find(SELECTOR_PANE_LIST);
      if (element.length === 0) {
        element = $('<div>')
            .addClass(CLASS_PANE_LIST)
            .appendTo(this.$element);
      }
      return element;
    },

    // sets all options
    /** @ignore */
    _applyOptions: function () {
      var activeTab = this._getTabs().filter('.is-active');

      // ensure the type is set correctly
      if (this.options.type) {
        this._setType(this.options.type);
      }

      // init tab switch
      this._initTabswitch();

      // accessibility
      this._makeAccessible();

      // set an active tab if there is non flagged as active
      if (activeTab.length === 0) {
        this._setActive(this.options.active || 0);
      } else {
        // call the activation logic
        // in case the initial tab has remote content
        this._activateTab(activeTab, true);
      }
    },

    /**
     * @return {jQuery} All tabs.
     * @private
     * @ignore
     */
    _getTabs: function() {
      return this.tablist.find('> .coral-TabPanel-tab[data-toggle="tab"]');
    },

    /**
     * @return {jQuery} All panels.
     * @private
     * @ignore
     */
    _getPanels: function() {
      return this.panelist.children('.coral-TabPanel-pane');
    },

    // Set a certain tab (by index) as active
    // * @param  {Number} index of the tab to make active
    /** @ignore */
    _setActive: function (idx) {
      idx = $.isNumeric(idx) ? idx : this.options.active;
      var activeTab = this._getTabs().eq(idx);
      // Activate the tab, but don't focus
      this._activateTab(activeTab, true);
    },

    // sets the type of the tabs
    // @param  {String} type of the tabs: 'default', 'nav', 'stacked'
    /** @ignore */
    _setType: function (type) {

      var that = this,
          classValue = $.type(type) === 'string' ? type : this.options.type;

      // applies the variant if the class type i
      if (this.VARIANT_TYPES.indexOf(classValue) > -1 && this.VARIANT_CLASS_MAPPING[classValue] !== undefined) {


        // gets all the class mappings
        var vals = Object.keys(this.VARIANT_CLASS_MAPPING).map(function (key) {
            return that.VARIANT_CLASS_MAPPING[key];
        });
        // removes any additional class
        this.$element.removeClass(vals.join(' '));

        // adds the new type variant
        this.$element.addClass(this.VARIANT_CLASS_MAPPING[classValue]);
      }
    },

    // activates the given tab
    /** @ignore */
    _activateTab: function (tab, noFocus) {
      var href = tab.attr('href'),
        activeClass = 'is-active',
        tabs = this._getTabs(),
        panels = this._getPanels(),
        panel;

      // do not allow to enable disabled tabs
      if (tab.hasClass('is-disabled')) {
        tab.blur(); // ensure disabled tabs do not receive focus
        return false;
      }

      // get panel based on aria control attribute
      panel = panels.filter('#' + tab.attr('aria-controls'));

      // supposed to be remote url
      if (href && href.charAt(0) !== '#') {
        panel.loadWithSpinner(href);
      }

      tabs.removeClass(activeClass).attr({
        'aria-selected': false,
        'tabindex': -1 // just the active one is able to tabbed
      });
      panels.removeClass(activeClass).attr({
        'aria-hidden': true
      });

      tab.addClass(activeClass).attr({
        'aria-selected': true,
        'tabindex': 0 // just the active one is able to tabbed
      });
      panel.addClass(activeClass).attr({
        'aria-hidden': false
      });

      if (!noFocus) {
        tab.trigger('focus');
      }
    }, // _activateTab

    // add the switching functionality
    /** @ignore */
    _initTabswitch: function () {
      var self = this,
        sel = '> .coral-TabPanel-navigation > .coral-TabPanel-tab[data-toggle="tab"]';

      this.$element.on('click', sel,function (event) {
        var tab = $(event.currentTarget);

        // prevent the default anchor
        event.preventDefault();

        self._activateTab(tab);
      });
    }, // _initTabswitch

    // adds some accessibility attributes and features
    // http://www.w3.org/WAI/PF/aria-practices/#tabpanel
    /** @ignore */
    _makeAccessible: function () {
      this._makeTabsAccessible();
      this._makeTablistAccessible();
    }, // _makeAccessible

    /**
     * Adds accessibility attributes and features for the tabs.
     * @private
     * @ignore
     */
    _makeTabsAccessible: function($tabs) {
      var $panels = this._getPanels();
      $tabs = $tabs || this._getTabs();

      // set tab props
      $tabs.each(function (i, e) {
        var $tab = $(e),
          $panel = $panels.eq($tab.index()),
          id = $panel.attr('id') || CUI.util.getNextId();

        var tabAttrs = {
          'role': 'tab',
          'tabindex': -1,
          'aria-selected': false,
          'aria-controls': id,
          'aria-disabled': $tab.hasClass('is-disabled')
        };

        if (!$tab.attr('href')) {
          // Mainly so the cursor turns the mouse into a hand
          // on hover.
          tabAttrs.href = '#';
        }

        $tab.attr(tabAttrs);

        $panel.attr({
          'id': id,
          'role': 'tabpanel',
          'aria-hidden': true
        });
      });
    },

    /**
     * Adds accessibility attributes and features for the tab list.
     * @private
     * @ignore
     */
    _makeTablistAccessible: function() {
      // init the key handling for tabs
      var self = this,
          tabSelector = '> [role="tab"]';

      // the nav around the tabs has a tablist role
      this.tablist.attr('role', 'tablist');

      // keyboard handling
      this.tablist.on('keydown', tabSelector, function (event) {
        // enables keyboard support

        var elem = $(event.currentTarget),
          tabs = $(event.delegateTarget)
            .find(tabSelector)
            .not('[aria-disabled="true"]'), // ignore disabled tabs
          focusElem = elem,
          keymatch = true,
          idx = tabs.index(elem);

        switch (event.which) {
          case 33: //page up
          case 37: //left arrow
          case 38: //up arrow
            focusElem = idx - 1 > -1 ? tabs[idx - 1] : tabs[tabs.length - 1];
            break;
          case 34: //page down
          case 39: //right arrow
          case 40: //down arrow
            focusElem = idx + 1 < tabs.length ? tabs[idx + 1] : tabs[0];
            break;
          case 36: //home
            focusElem = tabs[0];
            break;
          case 35: //end
            focusElem = tabs[tabs.length - 1];
            break;
          default:
            keymatch = false;
            break;
        }

        if (keymatch) { // if a key matched then we set the currently focused element
          event.preventDefault();
          self._activateTab($(focusElem));
        }
      });
    }
  });

  CUI.Widget.registry.register("tabs", CUI.Tabs);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Tabs.init($('[data-init~=tabs]', event.target));
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.TagList = new Class(/** @lends CUI.TagList# */{
    toString: 'TagList',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A tag list for input widgets. This widget is intended to be used by other widgets.
     * @description Creates a new tag list
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for taglist container
     * @param  {String} options.fieldname fieldname for the input fields
     * @param  {Array} options.values to set the taglist
     * @param  {Boolean} [options.multiline=false] defines if newly created tags are multiline elements
     * @param  {CUI.TagList~rendererCallback} [options.renderer] a custom
     + renderer to use for rendering tags.
     *
     * @fires TagList#itemadded
     * @fires TagList#itemremoved
     *
     */
    construct: function (options) {
      var self = this;

      this.applyOptions();

      this.$element
        .on('change:values', this._setValues.bind(this));

      // Convert to using js-* class when we can break backward-compatibility
      this.$element.on('click', 'button', function (event) {
        var elem = self.$element
            .children()
            .has(event.currentTarget)
            .find('input');

        self.removeItem(elem.val());
      });

      // accessibility
      this._makeAccessible();
    },

    defaults: {
      fieldname: "",
      values: null,
      tag: 'li',
      renderer: null
    },

    /**
     * existing values in the tag list
     * @private
     * @type {Array}
     */
    _existingValues: null,

    applyOptions: function () {
      var self = this;

      this._existingValues = [];

      this.options.values = this.options.values || [];

      // set values if given
      if (this.options.values.length > 0) {
        this._setValues();
      } else { // read from markup
        this.$element.find('input').each(function (i, e) {
          var elem = $(e);

          // add to options.values
          self._existingValues.push(elem.attr('value'));
        });
      }
    },

    /**
     * @private
     */
    _setValues: function () {
      var items = this.options.values;

      // remove list elements
      this.$element.empty();

      // clear options to readd
      this.options.values = [];
      // add elements again
      this.addItem(items);
    },

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#list
     * @private
     */
    _makeAccessible: function () {
      var self = this;
      this.$element.attr({
        'role': 'listbox'
      });

      this.$element.children(this.options.tag)
        .attr({
          'role': 'option',
          'tabindex': 0
        })
        .on('keydown', this._onKeyDown.bind(this))
        .children('.coral-TagList-tag-removeButton')
          .attr({
            'tabindex': -1
          });
    },

    /** @private */
    _onKeyDown: function(event) {
      // backspace key
      if(event.which === 8) {
        event.preventDefault();
        event.stopPropagation();

        // gets the next item before it gets removed
        var itemToFocus = $(event.currentTarget).next();

        if (itemToFocus.length === 0) {
          itemToFocus = $(event.currentTarget).prev();
        }

        this.removeItem($(event.currentTarget).children('input').val());

        itemToFocus.focus();
      }
    },

    /**
     * @private
     */
    _show: function () {
      this.$element
        .show()
        .attr('aria-hidden', false);
    },

    /**
     * @private
     */
    _hide: function () {
      this.$element
        .hide()
        .attr('aria-hidden', true);
    },

    /**
     * remove an item from the DOM
     * @private
     * @param  {String} item
     */
    _removeItem: function (item) {
      var elem = this.$element.children(':has(input[value="' + item + '"])');

      if (elem.length > 0) {
        elem.remove();

        this.$element.trigger($.Event('itemremoved'), {
          value: item
        });
      }
    },

    /**
     * adds a new item to the DOM
     * @private
     * @param  {String|Object} item entry to be displayed
     */
    _appendItem: function (item) {
      var display, val;

      // see if string or object
      if ($.type(item) === "string") {
        display = val = item;
      } else {
        display = item.display;
        val = item.value;
      }

      // always be a string
      val += "";

      if (($.inArray(val, this._existingValues) > -1) || val.length === 0) {
        return;
      }

      // add to internal storage
      this._existingValues.push(val); // store as string

      var renderer = this.options.renderer || this._renderTag;
      var $itemElement = $(renderer.call(this, val, display));
      $itemElement.on('keydown', this._onKeyDown.bind(this));
      this.$element.append($itemElement);

      this.$element.trigger($.Event('itemadded'), {
        value: val,
        display: display
      });
    },

    /**
     * Renders a tag for a given item.
     * @see CUI.TagList~rendererCallback
     * @private
     */
    _renderTag: function(value, display) {
      var elem, btn;

      // add DOM element
      elem = $('<' + this.options.tag + '/>', {
        'role': 'option',
        'tabindex': '0',
        'class': 'coral-TagList-tag' + (this.options.multiline ? ' coral-TagList-tag--multiline' : ''),
        'title': display
      });

      btn = $('<button/>', {
        'class': 'coral-MinimalButton coral-TagList-tag-removeButton',
        'type': 'button',
        'tabindex': '-1',
        'title': 'Remove'
      }).appendTo(elem);

      $('<i/>', {
        'class': 'coral-Icon coral-Icon--sizeXS coral-Icon--close'
      }).appendTo(btn);

      $('<span/>', {
        'class': 'coral-TagList-tag-label',
        'text': display
      }).appendTo(elem);

      $('<input/>', {
        'type': 'hidden',
        'value': value,
        'name': this.options.fieldname
      }).appendTo(elem);

      return elem;
    },

    /**
     * @param {String} item value to be deleted
     */
    removeItem: function (item) {
      var idx = this._existingValues.indexOf("" + item);

      if (idx > -1) {
        this._existingValues.splice(idx, 1);
        this._removeItem(item);
      }
    },

    /**
     * @param  {String|Object|Array} item
     * @param  {String} item.display
     * @param  {String} item.value
     */
    addItem: function (item) {
      var self = this,
        items = $.isArray(item) ? item : [item];

      $.each(items, function (i, item) {
        self._appendItem(item);
      });
    },

    getValues: function () {
      return this._existingValues.slice(0);
    }
  });

  CUI.Widget.registry.register("taglist", CUI.TagList);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.TagList.init($('[data-init~=taglist]', event.target));
    });
  }

  /**
   * Triggered when an item was added
   *
   * @name CUI.TagList#itemadded
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.value value which was added
   * @param {String} event.display displayed text of the element
   */

  /**
   * Triggered when an item was removed
   *
   * @name CUI.TagList#itemremoved
   * @event
   *
   * @param {Object} event Event object
   * @param {String} event.value value which was removed
   */

  /**
   * Callback used to render a tag. If a child of the returned tag is a button,
   * it will be used to remove the tag. The returned tag element should also
   * contain a hidden input with a value that matches the <code>value</code>
   * argument.
   *
   * @callback CUI.TagList~rendererCallback
   * @param {String} value The underlying value for the item.
   * @param {*} display Represents what should be displayed for the item.
   * @return {String|HTMLElement|jQuery} The constructed element to use
   * as a tag.
   */

}(jQuery, this));

(function ($) {
  CUI.Tooltip = new Class(/** @lends CUI.Tooltip# */{
    toString: 'Tooltip',

    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc A tooltip that can be attached to any other element and may be displayed immediately, on mouse over or only on API call.

     @desc Creates a new tooltip.
     @constructs

     @param {Object} options                       Component options
     @param {Mixed} [options.element]              jQuery selector or DOM element to use for tooltip.
     @param {Mixed} options.target                 jQuery selector or DOM element the tooltip is attached to
     @param {String} [options.content]             Content of the tooltip (HTML)
     @param {String} [options.type=info]           Type of dialog to display. One of info, error, notice, success, or inspect
     @param {String} [options.arrow=left]          Where to place the arrow? One of left, right, top or bottom.
     @param {Integer} [options.delay=500]          Delay before an interactive tooltip is shown.
     @param {Integer} [options.distance=5]         Additional distance of tooltip from element.
     @param {Boolean} [options.visible=true]       True to display immediately, False to defer display until show() called
     @param {Boolean} [options.interactive=false]  True to display tooltip on mouse over, False to only show/hide it when show()/hide() is called manually
     @param {Boolean} [options.autoDestroy=false]  Automatically destroy tooltip on hide?
     */
    construct: function (options) {
      // Ensure we have an object, not only a selector
      if (this.options.target) this.options.target = $(this.options.target);

      if (this.$element.length === 0 && this.options.target) {
        // Special case: We do not have a element yet, but a target
        // -> let us create our own element
        this.$element = $("<div>");
        this.$element.insertAfter(this.options.target);
      }

      // Add coral-Tooltip class to give styling
      this.$element.addClass('coral-Tooltip');

      if (this.$element.data("interactive")) {
        this.options.interactive = true;
        if (!this.options.target) this.options.target = this.$element.parent();
      }

      if (this.$element.data("target")) {
        this.options.target = $(this.$element.data("target"));
      }

      if (!this.options.arrow) {
        this.options.arrow = "left"; // set some default
        if (this.$element.hasClass("coral-Tooltip--positionRight")) this.options.arrow = "left";
        if (this.$element.hasClass("coral-Tooltip--positionLeft")) this.options.arrow = "right";
        if (this.$element.hasClass("coral-Tooltip--positionBelow")) this.options.arrow = "top";
        if (this.$element.hasClass("coral-Tooltip--positionAbove")) this.options.arrow = "bottom";
      }

      if (!this.options.type) {
        this.options.type = "info"; // set some default
        if (this.$element.hasClass("coral-Tooltip--info")) this.options.type = "info";
        if (this.$element.hasClass("coral-Tooltip--error")) this.options.type = "error";
        if (this.$element.hasClass("coral-Tooltip--success")) this.options.type = "success";
        if (this.$element.hasClass("coral-Tooltip--notice")) this.options.type = "notice";
        if (this.$element.hasClass("coral-Tooltip--inspect")) this.options.type = "inspect";
      }

      // Interactive Tooltips are never visible by default!
      if (this.options.interactive) {
        this.options.visible = false;
      }

      this.$element.toggleClass("is-hidden", !this.options.visible);


      // Listen to changes to configuration
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:arrow', this._setArrow.bind(this));

      this.applyOptions();
      this.reposition();
      this._makeAccessible();

      if (this.options.target) {
          this.options.target.data("tooltip", this);
      }

      if (this.options.interactive && this.options.target) {
        var hto = null;
        // Special behaviour on mobile: show tooltip on every touchstart
        $(this.options.target).on("touchstart.cui-tooltip", function (event) {
          if (hto) clearTimeout(hto);
          this.show();
          hto = setTimeout(function () {
            this.hide();
          }.bind(this), 3000); // Hide after 3 seconds
        }.bind(this));

        var showTimeout = false;

//a11y--> focusin and focusout events added for accessibility support
//a11y--> Added aria-hidden =true/false based on the tooltip visibility

        $(this.options.target).on("mouseover.cui-tooltip focusin.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          showTimeout = setTimeout(function () {
            this.show();
            this.$element.attr("aria-hidden","false");
          }.bind(this), this.options.delay);
        }.bind(this));

        $(this.options.target).on("focusout.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          this.hide();
          this.$element.attr("aria-hidden","true");
        }.bind(this));

        $(this.options.target).on("mouseout.cui-tooltip", function (event) {
         if (!$(document.activeElement).is(this.options.target)){
          if (showTimeout) clearTimeout(showTimeout);
          this.hide();
          this.$element.attr("aria-hidden","true");
         }
        }.bind(this));
      }
    },

    _makeAccessible: function () {
      //a11y--Adding aria role=tooltip and id for all tooltips
      this.$element.attr({
        'role': "tooltip",
        'id': this.$element.attr('id') || CUI.util.getNextId()
        });
      //a11y--Adding aria-describedby
      if (this.options.target) {
        this.options.target.attr("aria-describedby", this.$element.attr("id"));
      }
      //a11y--Adding aria-label if target html is empty
      if ($(this.options.target).is(':empty')){
        $(this.options.target).attr("aria-label",this.options.content);
      }
    },

    defaults: {
      target: null,
      visible: true,
      type: null,
      interactive: false,
      arrow: null,
      delay: 500,
      distance: 5
    },

    _stylesTypes: {
      'info': 'coral-Tooltip--info',
      'error': 'coral-Tooltip--error',
      'notice': 'coral-Tooltip--notice',
      'success': 'coral-Tooltip--success',
      'inspect': 'coral-Tooltip--inspect'
    },

    _arrows: {
      'left': 'coral-Tooltip--positionRight',
      'right': 'coral-Tooltip--positionLeft',
      'top': 'coral-Tooltip--positionBelow',
      'bottom': 'coral-Tooltip--positionAbove'
    },

    applyOptions: function () {
      this._setContent();
      this._setType();
      this._setArrow();
    },

    /** @ignore */
    _setType: function () {
      if (typeof this.options.type !== 'string' || !this._stylesTypes.hasOwnProperty(this.options.type)) return;

      // Remove old type
      var classesNames = this._stylesTypes['info'] + ' ' +
                        this._stylesTypes['error'] + ' ' +
                        this._stylesTypes['notice'] + ' ' +
                        this._stylesTypes['success'] + ' ' +
                        this._stylesTypes['inspect'];

      this.$element.removeClass(classesNames);

      // Add new type
      this.$element.addClass(this._stylesTypes[this.options.type]);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _setArrow: function () {

      if (typeof this.options.arrow !== 'string' || !this._arrows.hasOwnProperty(this.options.arrow)) return;

      // Remove old type
      var classesNames = this._arrows['left'] + ' ' +
                        this._arrows['right'] + ' ' +
                        this._arrows['top'] + ' ' +
                        this._arrows['bottom'];

      this.$element.removeClass(classesNames);

      // Add new type
      this.$element.addClass(this._arrows[this.options.arrow]);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _setContent: function () {
      if (typeof this.options.content !== 'string') return;

      this.$element.html(this.options.content);

      // Re-positioning
      this.reposition();
    },

    /** @ignore */
    _show: function () {
      if (this.$element.hasClass("is-hidden")) {
        this.$element.removeClass('is-hidden');
        this.$element.css("display", "none");
      }
      this.$element.fadeIn();
      //this.reposition();
      $(document).on('keydown.cui-tooltip', function(event) {
          if (event.which === 27) {
              this._hide();
              event.preventDefault();
              event.stopPropagation();
          }
      }.bind(this));
    },

    /** @ignore */
    _hide: function () {
      this.$element.fadeOut(400, function () {
        if (this.options.autoDestroy) {
          this.$element.remove();
          $(this.options.target).off(".cui-tooltip");
          $(this.options.target).data("tooltip", null);
        }
        $(document).off('keydown.cui-tooltip');
      }.bind(this));
      return this;
    },

    /**
     Place tooltip on page

     @returns {CUI.Tooltip} this, chainable
     */
    reposition: function () {
      if (!this.options.target) return;

      this.$element.detach().insertAfter(this.options.target);

      this.$element.css("position", "absolute");

      var el = $(this.options.target);
      var eWidth = el.outerWidth(true);
      var eHeight = el.outerHeight(true);

      var eLeft = el.position().left;
      var eTop = el.position().top;

      var offsetParent = el.offsetParent();
      if (!offsetParent.is("html")) {
        eTop  += offsetParent.scrollTop();
        eLeft += offsetParent.scrollLeft();
      }

      var width = this.$element.outerWidth(true);
      var height = this.$element.outerHeight(true);

      var left = 0;
      var top = 0;

      if (this.options.arrow === "left") {
        left = eLeft + eWidth + this.options.distance;
        top = eTop + (eHeight - height) / 2;
      }
      if (this.options.arrow === "right") {
        left = eLeft - width - this.options.distance;
        top = eTop + (eHeight - height) / 2;
      }
      if (this.options.arrow === "bottom") {
        left = eLeft + (eWidth - width) / 2;
        top = eTop - height - this.options.distance;
      }
      if (this.options.arrow === "top") {
        left = eLeft + (eWidth - width) / 2;
        top = eTop + eHeight + this.options.distance;
      }

      this.$element.css('left', left);
      this.$element.css('top', top);

      return this;
    }
  });

  CUI.Widget.registry.register("tooltip", CUI.Tooltip);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      // Only initialize non-interactive tooltips this way!
      CUI.Tooltip.init($("[data-init~=tooltip]", e.target));
      //ally---Only those empty quicktips without any label or alternate text associations are assigned aria-label
      $('[data-init~=quicktip][data-quicktip-content]:empty')
        .not('[aria-label], [aria-labelledby], img[alt], input, select, textarea, button').each(function(i, elem) {
        var $e = $(elem);
        if ($e.closest('label').length === 1 || ($e.attr('id') && $('label[for="'+ $e.attr('id') +'"]').length > 0)) return;
        $e.attr('aria-label', $e.attr('data-quicktip-content'));
      });
      $('[data-init~=quicktip]').not('input, select, textarea, button').not(':tabbable').attr('tabindex', 0);
    });

    $(document).on("touchstart mouseover focusin", "[data-init~=quicktip]", function (e) {
      var el = $(this),
          tooltip = el.data("tooltip"),
          quicktip,
          hideQuicktip = function(qt) {
            qt.hide();
            //ally--Removing aria-describedby after tooltip is removed
            el.removeAttr("aria-describedby");
            el.off("mouseout.cui-quicktip focusout.cui-quicktip");
            $(window).off("keydown.cui-tooltip mousedown.cui-tooltip");
          };

      if (!tooltip) {
        quicktip = new CUI.Tooltip({
          target: el,
          content: el.data("quicktip-content") || el.html(),
          type: el.data("quicktip-type"),
          arrow: el.data("quicktip-arrow"),
          interactive: false,
          autoDestroy: true,
          visible: false
        }).show();
        
        // Store a reference to the instance on the trigger element
        // This is required for testing so we can call methods
        el.data('quicktip', quicktip);

        switch(e.type) {
          case 'mouseover':
          case 'focusin':
            if (e.type === 'mouseover') {
              el.on("mouseout.cui-quicktip", function () {
                if (!$(document.activeElement).is(el)) {
                  hideQuicktip(quicktip);
                }
              });
            } else {
              el.on("focusout.cui-quicktip", function () {
                hideQuicktip(quicktip);
              });
            }
            $(window).on("keydown.cui-tooltip", function(event) {
              if (event.which === 27) {
                  hideQuicktip(quicktip);
                  event.preventDefault();
              }
            }).on("mousedown.cui-tooltip", function(event) {
              if (!el.is(event.target) && !quicktip.$element.is(event.target)) {
                  hideQuicktip(quicktip);
              }    
            });
            break;
          default:
            setTimeout(function() {
              hideQuicktip(quicktip);
            }, 3000);
        }
      }
    });
  }
}(window.jQuery));

/*
 ADOBE CONFIDENTIAL

 Copyright 2013 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function ($) {
  function cloneLeft(buttons) {
    return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Wizard-backButton").each(processButton);
  }

  function cloneRight(buttons) {
    return buttons.filter("[data-action=next]").first().addClass("u-coral-hidden")
      .clone(true).addClass("coral-Button--primary coral-Wizard-nextButton").each(processButton);
  }

  function cloneCancel(buttons) {
    return buttons.filter("[data-action=cancel]").first()
      .clone(true).addClass("coral-Button--quiet coral-Wizard-nextButton").each(processButton);
  }

  function processButton(i, el) {
    $(el).removeClass("u-coral-hidden").addClass("coral-Button");
  }

  function buildNav(wizard, sections) {
    var nav = wizard.children(".js-coral-Wizard-nav");

    if (nav.length === 0) {
      wizard.prepend(function () {
        nav = $(
          "<nav class=\"js-coral-Wizard-nav coral-Wizard-nav coral--dark coral-Background coral-Text\">" +
            "<ol class=\"coral-Wizard-steplist\"></ol>" +
          "</nav>");
        var ol = nav.children("ol");

        sections.map(function () {
          return $("<li class=\"js-coral-Wizard-steplist-item coral-Wizard-steplist-item\"></li>").
                      text($(this).data("stepTitle") || this.title).get(0);
        }).appendTo(ol);

        return nav;
      });
    }

    nav.addClass("coral--dark");

    nav.find(".js-coral-Wizard-steplist-item:first").addClass("is-active");

    var buttons = sections.first().find(".js-coral-Wizard-step-control");

    nav.prepend(function () {
      return cloneLeft(buttons);
    }).append(function () {
      return cloneRight(buttons).add(cloneCancel(buttons).toggleClass("u-coral-hidden", true));
    });
  }

  function insertAfter(wizard, step, refStep) {
    var index = wizard.children(".js-coral-Wizard-step").index(refStep),
        refNavStep = wizard.children(".js-coral-Wizard-nav").find(".js-coral-Wizard-steplist-item").eq(index),
        navStep = refNavStep.clone().text(step.data("stepTitle") || step.attr("title")).removeClass("is-active is-stepped");

    hideStep(step);

    refNavStep.after(navStep);
    refStep.after(step);
  }

  function showNav(to) {
    if (to.length === 0) return;

    to.addClass("is-active").removeClass("is-stepped");

    to.prevAll(".js-coral-Wizard-steplist-item").addClass("is-stepped").removeClass("is-active");
    to.nextAll(".js-coral-Wizard-steplist-item").removeClass("is-active is-stepped");
  }

  function hideStep(step) {
    if (step && step.length) {
      step.addClass("u-coral-hidden");
    }
  }

  function showStep(step) {
    if (step && step.length) {
      step.removeClass("u-coral-hidden");
    }
  }

  function changeStep(wizard, to, from) {
    if (to.length === 0) return;

    hideStep(from);
    showStep(to);

    wizard.trigger("flexwizard-stepchange", [to, from]);
  }

  function controlWizard(wizard, action) {
    var nav = wizard.children(".js-coral-Wizard-nav");
    var from = wizard.children(".js-coral-Wizard-step:not(.u-coral-hidden)");
    var fromNav = nav.find(".js-coral-Wizard-steplist-item.is-active");

    var to, toNav;
    switch (action) {
      case "prev":
        to = from.prev(".js-coral-Wizard-step");
        toNav = fromNav.prev(".js-coral-Wizard-steplist-item");
        break;
      case "next":
        to = from.next(".js-coral-Wizard-step");
        toNav = fromNav.next(".js-coral-Wizard-steplist-item");
        break;
      case "cancel":
        return;
    }

    if (to.length === 0) return;

    var buttons = to.find(".js-coral-Wizard-step-control");

    cloneLeft(buttons).replaceAll(nav.children(".coral-Wizard-backButton"));
    cloneRight(buttons).replaceAll(nav.children(".coral-Wizard-nextButton:not([data-action=cancel])"));

    nav.children(".coral-Wizard-nextButton[data-action=cancel]").toggleClass("u-coral-hidden", to.prev(".js-coral-Wizard-step").length === 0);

    showNav(toNav);
    changeStep(wizard, to, from);
  }

  CUI.FlexWizard = new Class(/** @lends CUI.FlexWizard# */{
    toString: "FlexWizard",

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc Wizard component
     @desc Creates a new wizard
     @constructs
     */
    construct: function (options) {
      var wizard = this.$element,
          steps = wizard.find(".js-coral-Wizard-step");

      buildNav(wizard, steps);

      wizard.on("click", ".js-coral-Wizard-step-control", function (e) {
        controlWizard(wizard, $(this).data("action"));
      });

      hideStep(steps);
      changeStep(wizard, steps.first());
    },

    /**
     Goes to the previous step. If there is no previous step, this method does nothing.
     */
    prevStep: function() {
      controlWizard(this.$element, "prev");
    },

    /**
     Goes to the next step. If there is no next step, this method does nothing.
     */
    nextStep: function() {
      controlWizard(this.$element, "next");
    },

    /**
     Adds the given step to the wizard.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {Number} [index] The index the step is added. If not passed, the step is added as the last one
     */
    add: function (step, index) {
      var wizard = this.$element;

      if (index === undefined) {
        this.addAfter(step, wizard.children(".js-coral-Wizard-step").last());
        return;
      }

      if (!step.jquery) {
        step = $(step);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, wizard.children(".js-coral-Wizard-step").eq(index));
    },

    /**
     Adds the given step after the given reference step.

     @param {HTMLElement|jQuery|String} step The step to be added
     @param {HTMLElement|jQuery} refStep The reference step
     */
    addAfter: function (step, refStep) {
      var wizard = this.$element;

      if (!step.jquery) {
        step = $(step);
      }

      if (!refStep.jquery) {
        refStep = $(refStep);
      }

      step.addClass("js-coral-Wizard-step");
      insertAfter(wizard, step, refStep);
    },

    /**
     Removes the given step from the wizard. The step is detached from the
     DOM and returned. If the current step is removed, the resulting 
     behaviour is undefined.

     @param {HTMLElement|jQuery} step The step to be removed
     @returns {jQuery} The removed step (as it was passed to the function)
     */
    remove: function(step) {
      var wizard = this.$element;
      var $step = step.jquery ? step : $(step);

      var index = wizard.children(".js-coral-Wizard-step").index($step);
      wizard.find(".js-coral-Wizard-steplist-item").eq(index).remove();
      $step.detach();

      return step;
    }
  });

  CUI.Widget.registry.register("flexwizard", CUI.FlexWizard);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FlexWizard.init($("[data-init~=flexwizard]", e.target));
    });
  }
}(window.jQuery));

(function ($, window, undefined) {

  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    toString: 'Modal',

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A dialog that prevents interaction with page elements while displayed.

     @desc Creates a new modal dialog.
     @constructs
     @param {Object} options Component options
     @param {Mixed} options.element jQuery selector or DOM element to use for dialog
     @param {String} options.header Title of the modal dialog (HTML)
     @param {String} options.content Title of the modal dialog (HTML)
     @param {String} [options.type=default] Type of dialog to display. One of default, error, notice, success, help, or info
     @param {Array} [options.buttons] Array of button descriptors
     @param {String} [options.buttons.label] Button label (HTML)
     @param {String} [options.buttons.className] CSS class name to apply to the button
     @param {Mixed} [options.buttons.click] Click handler function or string 'hide' to hide the dialog
     @param {String} [options.remote] URL to asynchronously load content from the first time the modal is shown
     @param {Mixed} [options.backdrop=static] False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
     @param {Mixed} [options.visible=true] True to display immediately, False to defer display until show() called

     */
    construct: function (options) {

      // modal parts
      this.header = this.$element.find('.coral-Modal-header');
      this.body = this.$element.find('.coral-Modal-body');
      this.footer = this.$element.find('.coral-Modal-footer');

      // previous focus element
      this._previousFocus = $();

      // creates a backdrop object
      // but it does not attach it to the document
      this.backdrop = $('<div/>', {
        'class': 'coral-Modal-backdrop',
        'style': 'display: none;'
      }).on('click', function (event) {
          if (this.options.backdrop !== 'static') {
            this.hide();
          }
        }.bind(this));

      // Fetch content asynchronously, if remote is defined
      this.body.loadWithSpinner(this.options.remote);

      this.applyOptions();

      this.$element.on('change:heading', this._setHeading.bind(this)) // @deprecated
        .on('change:header', this._setHeader.bind(this))
        .on('change:content', this._setContent.bind(this))
        .on('change:buttons', this._setFooter.bind(this))
        .on('change:type', this._setType.bind(this))
        .on('change:fullscreen', this._setFullscreen.bind(this))

        // close when a click was fired on a close trigger (e.g. button)
        .on('click', '[data-dismiss="modal"]', this.hide.bind(this));

      this._makeAccessible();
    },

    defaults: {
      backdrop: 'static',
      visible: true,
      type: 'default',
      fullscreen: false,
      attachToBody: true
    },

    _types: {
      "default": { "class": '', "iconClass": ""},
      "error": { "class": 'coral-Modal--error', "iconClass": "coral-Icon--alert"},
      "notice": { "class": 'coral-Modal--notice', "iconClass": "coral-Icon--alert"},
      "success": { "class": 'coral-Modal--success', "iconClass": "coral-Icon--checkCircle"},
      "help": { "class": 'coral-Modal--help', "iconClass": "coral-Icon--helpCircle"},
      "info": { "class": 'coral-Modal--info', "iconClass": "coral-Icon--infoCircle"}
    },

    applyOptions: function () {
      this._setHeader();
      this._setHeading();  // @deprecated
      this._setContent();
      this._setFooter();
      this._setType();
      this._setFullscreen();

      if (this.options.visible) {
        // Show immediately
        this.options.visible = false;
        this.show();
      }
    },

    /**
     adds some accessibility attributes and features
     http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
     @private
     */
    _makeAccessible: function () {
      var self = this,
        idPrefix = 'modal-header' + new Date().getTime() + '-';

      // the element has the role dialog
      this.$element.attr({
        'role': 'dialog',
        'aria-hidden': !this.options.visible,
        'aria-labelledby': idPrefix + 'label',
        'aria-describedby': idPrefix + 'message',
        'tabindex': -1
      });

      this.header.find('h2').attr({
        'id': idPrefix + 'label',
        'tabindex': 0
      });

      // Message areas have role document and tabindex="0"
      this.body.attr({
        'id': idPrefix + 'message',
        'role': 'document',
        'tabindex': 0
      });

      // keyboard handling
      this.$element.on('keydown', ':focusable', function (event) {
        // enables keyboard support

        var elem = $(event.currentTarget),
          tabbables = self.$element.find(':tabbable'),
          focusElem;

        switch (event.which) {
          case 9: //tab
            if (event.shiftKey && event.currentTarget === tabbables[0]) {
              // in case it is the first one, we switch to the last one
              focusElem = tabbables.last();
            } else if (!event.shiftKey && event.currentTarget === tabbables[tabbables.length - 1]) {
              // in case it is the last one, we switch to the first one
              focusElem = tabbables.first();
            }
            break;
        }

        if (focusElem) { // if a key matched then we set the currently focused element
          event.preventDefault();
          focusElem.trigger('focus');
        }
      });
    },

    /**
     sets the type of the modal
     @private
     */
    _setType: function () {
      if (this.options.type) {

        var icon = this.$element.find('.coral-Modal-header > .coral-Icon');
        // Remove old type
        for (var typeKey in this._types) {
          this.$element.removeClass(this._types[typeKey]["class"]);
          icon.removeClass(this._types[typeKey]["iconClass"]);
        }
        // Add new type
        if (this.options.type !== 'default') {
          this.$element.addClass(this._types[this.options.type]["class"]);
          icon.addClass(this._types[this.options.type]["iconClass"]);
        }
      }
    },

    /**
     sets the header of the modal
     @private
     */
    _setHeader: function () {
      if (!this.options.header) {
        return;
      }

      this.header.find('h2').html(this.options.header);
    },

    /**
     @deprecated rather use #_setHeader
     @private
     */
    _setHeading: function () {
      if (!this.options.heading) {
        return;
      }

      this.options.header = this.options.heading;
      this._setHeader.apply(this, arguments);
    },

    /**
     sets the content of the modal body
     @private
     */
    _setContent: function () {
      if (!this.options.content) {
        return;
      }

      this.body.html(this.options.content);
    },

    /**
     sets the buttons into the footer from the config
     @private
     */
    _setFooter: function () {
      if (!$.isArray(this.options.buttons)) {
        return;
      }

      var self = this;

      // remove existing buttons
      this.footer.empty();

      $.each(this.options.buttons, function (idx, button) {
        // Create an anchor if href is provided
        var btn = button.href ? $('<a/>', {
          'class': 'button'
        }) : $('<button/>', {
          'class': 'coral-Button',
          'type': 'button'
        });

        // Add label
        btn.html(button.label);

        // attach event handler
        if (button.click === 'hide') {
          btn.attr('data-dismiss', 'modal');
        } else if ($.isFunction(button.click)) {
          btn.on('click', button.click.bind(self, {
            dialog: self
          }));
        }

        if (button.href) {
          btn.attr('href', button.href);
        }

        if (button.className) {
          btn.addClass(button.className);
        }

        self.footer.append(btn);
      });
    },

    /**
     sets the fullscreen css class
     @private
     */
    _setFullscreen: function () {
      if (this.options.fullscreen) {
        this.$element.addClass('fullscreen');
      } else {
        this.$element.removeClass('fullscreen');
      }

      // Remove margin
      this.$element.css({
        'margin-left': 0,
        'margin-top': 0
      });
    },

    /**
     @private
     @event beforeshow
     */
    _show: function () {
      var documentBody = $('body'),
        tabcapture,
        self = this;

      // ARIA: http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
      // When the dialog is closed or cancelled focus should
      // return to the element in the application which had focus
      // before the dialog is invoked
      this._previousFocus = $(':focus'); //save previously focused element
      this._previousFocus.trigger('blur');

      documentBody.addClass('coral-Modal.is-open');

      // fire event before showing the modal
      this.$element.trigger('beforeshow');

      this._toggleBackdrop(true);

      // Move to the bottom of body so we're outside of any relative/absolute context
      // This allows us to know we'll always float above the backdrop

      // TODO: This doesn't actually work.  The z-index in the css saves the bacon...
      // Even though _toggleBackdrop is called before this append, the
      // backdrop gets appended to body before modal first time through
      // but is appended to body *after* the modal every time after

      if (this.options.attachToBody) {
        if (this.$element.parent('body').length === 0) {
          this.$element.appendTo(documentBody);
        }
        // ARIA
        // Hide sibling elements from assistive technologies,
        // but first store the state of any siblings already have the aria-hidden attribute
        this.$element.siblings('[aria-hidden]').each(function (index, element) {
          $(element).data('aria-hidden', $(element).attr('aria-hidden'));
        });
        this.$element.siblings().not('script, link, style').attr('aria-hidden', this.options.visible);
      }

      this.$element.attr('aria-hidden', !this.options.visible);

      // center before showing
      this.center();

      // fadeIn
      this.$element.fadeIn();

      // When a modal dialog opens focus goes to the first focusable item in the dialog
      this.$element.find(':tabbable:not(.coral-Modal-header .coral-Modal-closeButton):first').focus();

      // add tab-focusable divs to capture and forward focus to the modal dialog when page regains focus
      tabcapture = $('<div class="coral-Modal-tabcapture" tabindex="0"/>');
      tabcapture.on('focus.modal-tabcapture', function (event) {
        var tabbables = self.$element.find(':tabbable'),
          tabcaptures = $('body > .coral-Modal-tabcapture'),
          lasttabcapture = tabcaptures.last(),
          focusElem;

        if (event.currentTarget === lasttabcapture[0]) {
          focusElem = tabbables.filter(':not(.coral-Modal-header .coral-Modal-closeButton):last');
        } else {
          focusElem = tabbables.filter(':not(.coral-Modal-header .coral-Modal-closeButton):first');
        }

        if (focusElem.length === 0) {
          focusElem = self.$element;
        }

        focusElem.trigger('focus');
      })
      // this method chaining is super janky...
        .prependTo(documentBody)
        .clone(true)
        .appendTo(documentBody);

      // add escape handler
      $(document).on('keydown.modal-escape', this._escapeKeyHandler.bind(this));

      return this;
    },

    /**
     @private
     @event beforehide
     */
    _hide: function () {
      $('body').removeClass('coral-Modal.is-open')
        .find('.coral-Modal-tabcapture').off('focus.modal-tabcapture').remove();

      // remove escape handler
      $(document).off('keydown.modal-escape');

      // fire event before showing the modal
      this.$element.trigger('beforehide');

      this._toggleBackdrop(false);

      this.$element.attr('aria-hidden', !this.options.visible);

      this.$element.siblings()
        .removeAttr('aria-hidden')
        .filter(':data("aria-hidden")')
        .each(function (index, element) {
          $(element).attr('aria-hidden', $(element).data('aria-hidden'))
            .removeData('aria-hidden');
        });

      // fadeOut
      this.$element.fadeOut().trigger('blur');

      // ARIA: http://www.w3.org/WAI/PF/aria-practices/#dialog_modal
      // When the dialog is closed or cancelled focus should
      // return to the element in the application which had focus
      // before the dialog is invoked
      this._previousFocus.trigger('focus');

      return this;
    },

    /**
     centers the modal in the middle of the screen
     @returns {CUI.Modal} this, chainable
     */
    center: function () {
      var width = this.$element.outerWidth(),
        height = this.$element.outerHeight();

      if (!this.options.fullscreen) {
        this.$element.css({
          'margin-left': -(width / 2),
          'margin-top': -(height / 2)
        });
      }
    },

    /**
     toggles back drop
     @private
     @param  {Boolean} [show] true/false to force state
     */
    _toggleBackdrop: function (show) {
      if (!this.options.backdrop) {
        return;
      }

      var documentBody = $('body');

      if ((show || this.backdrop.is(':hidden')) && show !== false) {
        this.backdrop.appendTo(documentBody).fadeIn();
      }
      else {
        this.backdrop.fadeOut(function () {
          $(this).detach();
        });
      }
    },

    /**
     handler to close the dialog on escape key
     @private
     */
    _escapeKeyHandler: function (event) {
      if (event.which === 27) {
        this.hide();
      }

    }
  });

  CUI.Widget.registry.register("modal", CUI.Modal);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Modal.init($('[data-init~=modal]', event.target));
    });

    // @deprecated
    // this differs from other components
    // rather in future we use data-init~="modal-trigger" to intialize a trigger
    // and require data-init~="modal" on the modal to indicate it is a modal
    $(document).on('click.modal.data-api', '[data-toggle="modal"]',function (e) {
      // Stop links from navigating
      // Always do preventDefault first, otherwise when exception occurs in the handler, it is not called
      e.preventDefault();

      var $trigger = $(this);

      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      // Pass configuration based on data attributes in the triggering link
      var href = $trigger.attr('href');
      var options = $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());
      
      // If the trigger does not have focus,
      if (!$trigger.is(document.activeElement)) {
        // make sure that the trigger can accept focus,
        if (!$trigger.is(':focusable')) {
          $trigger.attr('tabindex', 0);
        }
        // then set focus to the trigger.
        // This will ensure that the modal can restore focus to the trigger when it is closed.
        $trigger.focus();
      }

      // Parse buttons
      if (typeof options.buttons === 'string') {
        options.buttons = JSON.parse(options.buttons);
      }

      // If a modal already exists, show it
      var instance = $target.data('modal');

      // Apply the options from the data attributes of the trigger
      // When the dialog is closed, focus on the button that triggered its display
      $target.modal(options);

      // Perform visibility toggle if we're not creating a new instance
      if (instance) {
        $target.data('modal').set({ visible: !instance.get('visible') });
      }
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.Slider = new Class(/** @lends CUI.Slider# */{
    toString: 'Slider',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @desc Creates a slider.
     * @constructs
     *
     * @param {Object} options Component options
     * @param {number} [options.step=1]  The steps to snap in
     * @param {number} [options.min=1]   Minimum value
     * @param {number} [options.max=100] Maximum value
     * @param {number} [options.value=1] Starting value
     * @param {number} [options.tooltips=false] Show tooltips?
     * @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
     * @param {boolean} [options.slide=false]    True for smooth sliding animations. Can make the slider unresponsive on some systems.
     * @param {boolean} [options.disabled=false] True for a disabled element
     * @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min
     *
     */
    construct: function () {
      var self = this,
        elementId = this.$element.attr('id'),

        values = [];

      // reads the options from markup
      this._readOptions();

      // if the element doesn't have an id, build a unique id using CUI.util.getNextId()
      if (!elementId) {
        elementId = CUI.util.getNextId();
        this.$element.attr('id', elementId);
      }

      this._renderMissingElements();

      // get all input value fields
      this.$inputs = this.$element.find('input');

      this.$inputs.each(function (index, input) {
        var $input = $(input);

        // setting default step
        if (!$input.is('[step]')) $input.attr('step', self.options.step);

        // setting default min
        if (!$input.is('[min]')) $input.attr('min', self.options.min);

        // setting default max
        if (!$input.is('[max]')) $input.attr('max', self.options.max);

        // setting default value
        if (!$input.is('[value]')) {
          $input.attr({'value': self.options.value});
          values.push(self.options.value);
        } else {
          values.push($input.attr('value'));
        }

        if (index === 0) {
          if ($input.is(':disabled')) {
            self.options.disabled = true;
            self.$element.addClass('is-disabled');
          } else if (self.options.disabled) {
            $input.attr('disabled', 'disabled');
            self.$element.addClass('is-disabled');
          }
        }
      });

      self.values = values;
      if (this.options.orientation === 'vertical') this.isVertical = true;

      // Set up event handling
      this.$element
        .on('touchstart.slider pointerdown.slider mspointerdown.slider mousedown.slider', this._mouseDown.bind(this))
        .on('focusin.slider', 'input[type=range], [role=slider].coral-Slider-handle', this._focus.bind(this))
        .on('focusout.slider', 'input[type=range], [role=slider].coral-Slider-handle', this._blur.bind(this))
        .on('input.slider change.slider', 'input', this._handleInputChange.bind(this));

      // Listen to changes to configuration
      this.$element
        .on('change:value', this._processValueChanged.bind(this))
        .on('change:disabled', this._processDisabledChanged.bind(this))
        .on('change:min', this._processMinMaxStepChanged.bind(this))
        .on('change:max', this._processMinMaxStepChanged.bind(this))
        .on('change:step', this._processMinMaxStepChanged.bind(this));

      // Adjust dom to our needs
      this._render();

      // Initialize accessibility
      this._makeAccessible();
    }, // construct

    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      orientation: 'horizontal',
      slide: false,
      disabled: false,
      tooltips: false,
      tooltipFormatter: function (value) {
        return value.toString();
      },
      valuetextFormatter: function (value) {
        return value.toString();
      },
      ticks: false,
      filled: false,
      bound: false
      // @todo [~mijordan] provide a mechanism for adding a legend and labels with JS Class Initialization
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    draggingPosition: -1,
    _inputsOrHandles: null,

    /**
     * reads the options from the markup (classes)
     * TODO optimize
     * @private
     */
    _readOptions: function () {
      // setting default dom attributes if needed
      if (this.$element.hasClass('coral-Slider--vertical')) {
        this.options.orientation = 'vertical';
        this.isVertical = true;
      }

      if (this.$element.hasClass('coral-Slider--tooltips')) {
        this.options.tooltips = true;
      }

      if (this.$element.hasClass('coral-Slider--ticked')) {
        this.options.ticks = true;
      }

      if (this.$element.hasClass('coral-Slider--filled')) {
        this.options.filled = true;
      }

      if (this.$element.hasClass('coral-Slider--bound')) {
        this.options.bound = true;
      }

      if (this.$element.data('slide') || this.$element.hasClass('coral-Slider--slide')) {
        this.options.slide = true;
      }
    },

    /**
     * Set the current value of the slider
     * @param {int}   value   The new value for the slider
     * @param {int}   handleNumber   If the slider has 2 handles, you can specify which one to change, either 0 or 1
     */
    setValue: function (value, handleNumber) {
      handleNumber = handleNumber || 0;

      this._updateValue(handleNumber, value, true); // Do not trigger change event on programmatic value update!
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _renderMissingElements: function () {
      if (!this.$element.find('input').length) {
        var self = this,
          el,
          values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
        $.each(values, function (index, value) {
          el = $('<input>');
          el.attr({
            'type': 'range',
            'min': self.options.min,
            'max': self.options.max,
            'step': self.options.step,
            'value': value
          });
          self.$element.append(el);
        });
      }

      if (!this.$element.find('div.coral-Slider-clickarea').length) {
        var el2 = $('<div class="coral-Slider-clickarea">');
        this.$element.prepend(el2); // Prepend: Must be first element to not hide handles!
      }

      // @todo This is not a missing element, so it's odd to have this method called as such
      this.$element.toggleClass('coral-Slider', true);
      this.$element.toggleClass('coral-Slider--vertical', this.options.orientation === 'vertical');
      this.$element.toggleClass('coral-Slider--tooltips', this.options.tooltips); // Not used in CSS
      this.$element.toggleClass('coral-Slider--ticked', this.options.ticks); // Not used in CSS
      this.$element.toggleClass('coral-Slider--filled', this.options.filled); // Not used in CSS
    },

    _processValueChanged: function () {
      var self = this,
        values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
      $.each(values, function (index, value) {
        self._updateValue(index, value, true); // Do not trigger change event on programmatic value update!
      });
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processMinMaxStepChanged: function () {
      var self = this,
          $inputs = this.$inputs;
      $inputs.attr({
        'min': this.options.min,
        'max': this.options.max,
        'step': this.options.step,
        'value': '' // removing the value attribute ensures that _updateValue call that follows actually does something
      });
      if (!this._supportsRangeInput) {
        this.$handles.attr({
          'aria-valuemin': this.options.min,
          'aria-valuemax': this.options.max,
          'aria-valuestep': this.options.step
        });
      }
      $.each(this.values, function (index, value) {
        self._updateValue(index, value, true); // Ensure current values are between min and max
      });

      if (this.options.ticks) {
        this.$element.find('.coral-Slider-ticks').remove();
        this._buildTicks();
      }

      if (this.options.filled) {
        this.$element.find('.coral-Slider-fill').remove();
        this._buildFill();
      }

      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processDisabledChanged: function () {
      if (this.options.disabled) {
        this.$inputs.attr('disabled', 'disabled');
        this.$handles.each(function () {
          // @todo always chain class or cache selectors
          $(this).removeClass('is-focused');
          $(this).parent().removeClass('is-focused');

          if (!this._supportsRangeInput) {
            $(this).attr('aria-disabled', true);
          }
        });
      } else {
        this.$inputs.removeAttr('disabled');
        if (!this._supportsRangeInput) {
          this.$handles.removeAttr('aria-disabled');
        }
      }
      this.$element.toggleClass('is-disabled', this.options.disabled);
    },

    _render: function () {
      var self = this,
          // get maximum max value
          maximums = self.$inputs.map(function () {
            return $(this).attr('max');
          }),
          // get minimum min value
          minimums = self.$inputs.map(function () {
            return $(this).attr('min');
          }),
          // get step step value
          steps = self.$inputs.map(function () {
            return $(this).attr('step');
          });

      self.options.max = Math.max.apply(null, maximums.toArray());
      self.options.min = Math.min.apply(null, minimums.toArray());
      self.options.step = Math.min.apply(null, steps.toArray());

      // Correct the labelling of inputs for accessibility
      this._adjustLabelling();

      // Todo: do not add already existing elements or remove them before adding new elements
      // build ticks if needed
      if (self.options.ticks) {
        self._buildTicks();
      }

      // build fill if needed
      if (self.options.filled) {
        self._buildFill();
      }

      // add css class so that slide animation is done through css transition rather than jQuery.animate
      self.$element.toggleClass('coral-Slider--slide', self.options.slide);

      self._buildHandles();
    },

    _buildTicks: function () {
      // The ticks holder
      var $ticks = $('<div/>').addClass('coral-Slider-ticks'),
          numberOfTicks = Math.round((this.options.max - this.options.min) / this.options.step) - 1,
          trackDimensions = this.isVertical ? this.$element.height() : this.$element.width();

      this.$element.prepend($ticks);
      for (var i = 0; i < numberOfTicks; i++) {
        var position = trackDimensions * (i + 1) / (numberOfTicks + 1),
            percent = (position / trackDimensions) * 100,
            tick = $('<div/>').addClass('coral-Slider-tick').css((this.isVertical ? 'bottom' : 'left'), percent + '%');
        $ticks.append(tick);
      }
      this.$ticks = $ticks.find('.coral-Slider-tick');
      if (this.options.filled) {
        // this._coverTicks();
      }
    },

    _buildFill: function () {
      var self = this;

      this.$fill = $('<div/>').addClass('coral-Slider-fill');

      if (self.values.length !== 0) {
        var percent, fillPercent,
          heightOrWidth = self.isVertical ? 'height' : 'width',
          bottomOrLeft = self.isVertical ? 'bottom' : 'left';
        if (self.values.length < 2) {
          percent = (self.values[0] - self.options.min) / (self.options.max - self.options.min) * 100;
          this.$fill.css(heightOrWidth, percent + '%');
        } else {
          percent = (this._getLowestValue() - self.options.min) / (self.options.max - self.options.min) * 100;
          fillPercent = (this._getHighestValue() - this._getLowestValue()) / (self.options.max - self.options.min) * 100;
          this.$fill.css(heightOrWidth, fillPercent + '%')
            .css(bottomOrLeft, percent + '%');
        }
      }
      this.$element.prepend(this.$fill);
      self.options.filled = true;
    },

    _buildHandles: function () {
      var self = this,
          elementId = self.$element.attr('id');

      // Wrap each input field and add handles and tooltips (if required)
      self.$inputs.each(function (index) {

        var $input = $(this),
            $wrap = $input.wrap('<div/>').parent().addClass('coral-Slider-value'),

            // Add handle for input field
            percent = (self.values[index] - self.options.min) / (self.options.max - self.options.min) * 100,
            percentString =  percent + '%',
            bottomOrLeft = self.isVertical ? 'bottom' : 'left',
            $handle = $('<div/>')
              .addClass('coral-Slider-handle u-coral-openHand')
              .css(bottomOrLeft, percentString)
              .attr({
                'id': elementId + '-handle' + index
              }),
            $tooltip;

        // position the input relative to the slider container element
        $input.css(bottomOrLeft, percentString);
        $wrap.append($handle);

        // Add tooltip to handle if required
        if (self.options.tooltips) {
          // @todo replace with correct classnames for coral-Tooltip-arrow**
          $tooltip = $('<output>' + $input.attr('value') + '</output>')
            .addClass('coral-Tooltip coral-Tooltip--inspect ' + (self.isVertical ? 'coral-Tooltip--positionRight' : 'coral-Tooltip--positionAbove'))
            .attr({
              'role': 'tooltip',
              'aria-hidden': true,
              'id': $input.attr('id') + '-tooltip',
              'for': $input.attr('id')
              });
          $handle.append($tooltip);
        }

        if (self.$inputs.length > 1 && $input.attr('aria-labelledby')) {
          var inputlabelids = $input.attr('aria-labelledby').split(' '), $label;
          for (var i = 0; i < inputlabelids.length; i++) {
            if (i > 0) {
              $label = $('#' + inputlabelids[i]);
              $handle.prepend($label);
            }
          }
        }
      });

      self.$handles = self.$element.find('.coral-Slider-handle');
      self.$tooltips = self.$element.find('.coral-Tooltip');

      self._moveHandles();
    },

    _handleClick: function (event) {
      if (this.options.disabled) return false;
      var self = this,

          // Mouse page position
          mouseX = event.pageX,
          mouseY = event.pageY,

          pointerdown = /^(ms)?pointerdown$/i.test(event.type);

      if (event.type === 'touchstart') {
        var touches = (event.originalEvent.touches.length > 0) ? event.originalEvent.touches : event.originalEvent.changedTouches;
        mouseX = touches[0].pageX;
        mouseY = touches[0].pageY;
      } else if (pointerdown) {
        mouseX = event.originalEvent.clientX + window.pageXOffset;
        mouseY = event.originalEvent.clientY + window.pageYOffset;
      }

      if (mouseX === undefined || mouseY === undefined) return; // Do not use undefined values!

      // Find the nearest handle
      var pos = self._findNearestHandle(mouseX, mouseY);

      var val = self._getValueFromCoord(mouseX, mouseY, true);

      if (!isNaN(val)) {
        self._updateValue(pos, val);
        self._moveHandles();
        if (self.options.filled) {
          self._updateFill();
        }
      }

      if (event.type === 'mousedown' || pointerdown) {
        self.$handles.eq(pos).data('mousedown', true);
      }
      self._inputsOrHandles.eq(pos).focus();
    },

    /**
     * Locates the nearest handle to given mouse coordinates.
     * @return The index position of the handle within the this.$handles collection.
     * @private
     */
    _findNearestHandle: function (mouseX, mouseY) {
      var self = this;

      var closestDistance = Infinity; // Incredible large start value

      // Find the nearest handle
      var pos = 0;
      self.$handles.each(function (index) {

        // Handle position
        var handleX = $(this).offset().left;
        var handleY = $(this).offset().top;

        // Handle Dimensions
        var handleWidth = $(this).width();
        var handleHeight = $(this).height();

        // Distance to handle
        var distance = Math.abs(mouseX - (handleX + (handleWidth / 2)));
        if (self.options.orientation === 'vertical') {
          distance = Math.abs(mouseY - (handleY + (handleHeight / 2)));
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          pos = index;
        }
      });

      return pos;
    },

    /**
     * Handles "oninput" and "onchange" events from the input.
     * @private
     */
    _handleInputChange: function (event) {
      if (this.options.disabled) return false;

      var $input = $(event.target),
          index = this.$inputs.index($input);

      if ($input.val() === this.values[index]) return;

      this.setValue($input.val(), index);

      if ($input.is(document.activeElement)) {
        this.$handles.eq(index).removeData('mousedown');
        this._focus(event);
      }
    },

    /**
     * Handles "focusin" event from  either an input or its handle.
     * @private
     */
    _focus: function (event) {
      if (this.options.disabled) return false;
      var self = this,
        $this = $(event.target),
        $value = $this.closest('.coral-Slider-value'),
        $handle = $value.find('.coral-Slider-handle');

      if (!$handle.data('mousedown')) {
        this.$element.addClass('is-focused');
        $value.addClass('is-focused');
        $handle.addClass('is-focused');
      }

      $(window).on('touchstart.slider pointerdown.slider mspointerdown.slider mousedown.slide', function(event) {
        if ($(event.target).closest(self.$element).length === 1) {
          return;
        }
        $this.trigger('focusout.slider');
      });

    },

    /**
     * Handles "focusout" event from  either an input or its handle.
     * @private
     */
    _blur: function (event) {
      if (this.options.disabled) return false;

      var $this = $(event.target),
        $value = $this.closest('.coral-Slider-value'),
        $handle = $value.find('.coral-Slider-handle');

      this.$element.removeClass('is-focused');
      $value.removeClass('is-focused');
      $handle.removeClass('is-focused').removeData('mousedown');

      $(window).off('touchstart.slider pointerdown.slider mspointerdown.slider mousedown.slider');
    },

    /**
     * Handles "keydown" event from a handle.
     * Should only be needed when this._supportsRangeInput === false, otherwise keyboard events will be handled by the native input[type=range] element.
     * @private
     */
    _keyDown: function (event) {
      if (this.options.disabled) return false;

      var self = this,
        $this = $(event.target),
        which = event.which || event.keyCode,
        $value = $this.closest('.coral-Slider-value'),
        $input = $value.find('input'),
        index = self.$inputs.index($input),
        $handle = self.$handles.eq(index),
        val = Number($input.val()),
        step = Number(self.options.step),
        minimum = Number(self.options.min),
        maximum = Number(self.options.max),
        page = Math.max(step, Math.round((maximum - minimum) / 10)),
        capture = false;

      $handle.removeData('mousedown');
      self._focus(event);

      switch (which) {
        case 40:
        case 37:
          // down/left
          val -= step;
          capture = true;
          break;
        case 38:
        case 39:
          // up/right
          val += step;
          capture = true;
          break;
        case 33:
          // page up
          val += (page - (val % page));
          capture = true;
          break;
        case 34:
          // page down
          val -= (page - (val % page === 0 ? 0 : page - val % page));
          capture = true;
          break;
        case 35:
          // end
          val = maximum;
          capture = true;
          break;
        case 36:
          // home
          val = minimum;
          capture = true;
          break;
      }

      if (capture) {
        event.preventDefault();
      }

      if (val !== Number($input.val())) {
        self.setValue(val, index);
        $input.trigger('change.slider'); // Keep input element value updated too and fire change event for any listeners
      }
    },

    _mouseDown: function (event) {
      if (this.options.disabled) return false;

      event.preventDefault();

      var self = this, $handle;

      this.draggingPosition = -1;
      this.$handles.each(function (index, handle) {
        if (handle === event.target) self.draggingPosition = index;
      });

      this.$tooltips.each(function (index, tooltip) {
        if (tooltip === event.target) self.draggingPosition = index;
      });

      // Did not touch any handle? Emulate click instead!
      if (this.draggingPosition < 0) {
        this._handleClick(event);
        return;
      }

      $handle = this.$handles.eq(this.draggingPosition);

      $handle.addClass('is-dragged');
      $('body').addClass('u-coral-closedHand');

      $(window).on('touchmove.slider pointermove.slider mspointermove.slider mousemove.slider', this._handleDragging.bind(this));
      $(window).on('touchend.slider pointerup.slider mspointerup.slider mouseup.slider', this._mouseUp.bind(this));

      if (event.type === 'mousedown' || /^(ms)?pointerdown$/i.test(event.type)) {
        $handle.data('mousedown', true);
      }

      this._inputsOrHandles.eq(this.draggingPosition).focus();
    },

    _handleDragging: function (event) {
      var mouseX = event.pageX,
          mouseY = event.pageY;

      // Handle touch events
      if (event.originalEvent.targetTouches) {
        var touch = event.originalEvent.targetTouches.item(0);
        mouseX = touch.pageX;
        mouseY = touch.pageY;
      } else if (/^(ms)?pointermove$/i.test(event.type)) {
        mouseX = event.originalEvent.clientX + window.pageXOffset;
        mouseY = event.originalEvent.clientY + window.pageYOffset;
      }

      this._updateValue(this.draggingPosition, this._getValueFromCoord(mouseX, mouseY));
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
      event.preventDefault();
    },

    _mouseUp: function () {
      this.$handles.eq(this.draggingPosition).removeClass('is-dragged');
      $('body').removeClass('u-coral-closedHand');

      this.draggingPosition = -1;
      $(window).off('mousemove.slider mspointermove.slider pointermove.slider touchmove.slider');
      $(window).off('mouseup.slider mspointerup.slider pointerup.slider touchend.slider');
    },

    _clickLabel: function (event) {
      if (this.options.disabled) return;
      this._inputsOrHandles.eq(0).focus();
    },

    _updateValue: function (pos, value, doNotTriggerChange) {
      var self = this,
          $input = self.$inputs.eq(pos),
          valueString = value.toString(),
          $relatedInput,
          boundary,
          minmax = ['min','max'],
          updatedAttributes = {},
          ariaAttribute;

      if ($input.val() !== valueString ||
          $input.attr('value') !== valueString ||
          self.values[pos] !== valueString) {

        // snap the new value to the appropriate step
        value = this._snapValueToStep(value, this.options.min,  this.options.max, this.options.step);

        // if this is a bound slider we need to:
        // 1. make sure that the new value is bounded by the value of the related input.
        // 2. adjust the min or max value on the related input so that it is bounded by the new value
        // 3. update the appropriate attributes on the input and handle
        if (self.$inputs.length === 2 && this.options.bound) {
          // pos is 0 || 1, so the related input's index is !pos
          $relatedInput = self.$inputs.eq(!pos);

          // the boundary is the current value of the relatedInput
          boundary = Number($relatedInput.val());

          // depending on the index of the input, limit the value using either Math.min or Math.max
          // (for pos === 0, use Math.min, for pos === 1, use Math.max)
          value = Math[ minmax[pos] ](value, boundary);

          // depending on the index of the input, set the min/max attribute on the related input
          // (for pos === 0, use [min], for pos === 1, use [max])
          $relatedInput.attr(minmax[pos], value);

          // depending on the index of the input, set the min/max attribute on the input
          // (for pos === 0, use [max], for pos === 1, use [min])
          ariaAttribute = minmax[!pos];
          $.extend(updatedAttributes, {
            ariaAttribute: boundary
          });
        }

        self.values[pos] = value.toString();

        $.extend(updatedAttributes, {
          'value': value,
          'aria-valuetext': self._supportsRangeInput ? self.options.valuetextFormatter(value) : null
        });

        $input.val(value).attr(updatedAttributes);

        if (!this._supportsRangeInput) {
          // depending on the index of the input,
          // set the aria-valuemin/aria-valuemax, aria-valuenow and aria-valuetext for the handles
          self.$handles.each(function (i, handle) {
            var isPos = (i === pos),
                boundaryOrValue = isPos ? boundary : value;
            ariaAttribute = 'aria-value' + minmax[!isPos];
            updatedAttributes = {
              ariaAttr: boundaryOrValue
            };
            if (isPos) {
              $.extend(updatedAttributes, {
                'aria-valuenow': value,
                'aria-valuetext': self.options.valuetextFormatter(value)
              });
            }
            $(handle).attr(updatedAttributes);
          });
        }

        if (!doNotTriggerChange) {
          setTimeout(function () {
            $input.change(); // Keep input element value updated too and fire change event for any listeners
          }, 1); // Not immediatly, but after our own work here
        }
      }
    },

    _moveHandles: function () {
      var self = this;

      // Set the handle position as a percentage based on the stored values
      this.$handles.each(function (index,  handle) {
        var $handle = $(handle),
            percent = (self.values[index] - self.options.min) / (self.options.max - self.options.min) * 100,
            $input = self.$inputs.eq(index),
            $tooltip;

        if (self.options.orientation === 'vertical') {
          $handle.css('bottom', percent + '%');
          $input.css('bottom', percent + '%');
        } else { // Horizontal
          $handle.css('left', percent + '%');
          $input.css('left', percent + '%');
        }

        // Update tooltip value (if required)
        if (self.options.tooltips) {
          $tooltip = self.$tooltips.eq(index);
          $tooltip.html(self.options.tooltipFormatter(self.values[index]));

          // adjust position of tooltip to accommodate the updated value.
          if (self.options.orientation === 'vertical') {
             $tooltip.css('top', -(($tooltip.outerHeight() + $handle.outerHeight() / 2) / 2) + 'px');
          } else {
            $tooltip.css('left', -(($tooltip.outerWidth() + $handle.outerWidth() / 2) / 2) + 'px');
          }
        }
      });
    },

    _updateFill: function () {
      var self = this;
      var percent;

      if (self.values.length !== 0) {
        if (self.values.length === 2) { // Double value/handle
          percent = ((self._getLowestValue() - self.options.min) / (self.options.max - self.options.min)) * 100;
          var secondPercent = ((self._getHighestValue() - self.options.min) / (self.options.max - self.options.min)) * 100;
          var percentDiff = secondPercent - percent;
          if (self.options.orientation === 'vertical') {
            self.$fill.css('bottom', percent + '%').css('height', percentDiff + '%');
          } else { // Horizontal
            self.$fill.css('left', percent + '%').css('width', percentDiff + '%');
          }
        } else { // Single value/handle
          percent = ((self.values[0] - self.options.min) / (self.options.max - self.options.min)) * 100;
          if (self.options.orientation === 'vertical') {
            self.$fill.css('height', percent + '%');
          } else {
            self.$fill.css('width', percent + '%');
          }
        }
      }
      if (self.options.ticks) {
        self._coverTicks();
      }
    },

    _coverTicks: function () {
      var self = this;

      // Ticks covered by the fill are given a different class
      self.$ticks.each(function (index) {
        var value = self._getValueFromCoord($(this).offset().left, $(this).offset().top);
        if (self.values.length === 2) { // @todo Figure out what previous comitter said when they wrote "add a parameter to indicate multi values/handles" here
          if ((value >= self._getLowestValue()) && (value <= self._getHighestValue())) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
        else {
          if (value <= self._getHighestValue()) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
      });
    },

    _getValueFromCoord: function (posX, posY, restrictBounds) {
      var self = this,
          percent,
          elementOffset = self.$element.offset();

      if (self.options.orientation === 'vertical') {
        var elementHeight = self.$element.height();
        percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
      } else {
        var elementWidth = self.$element.width();
        percent = ((posX - elementOffset.left) / elementWidth);
      }

      // if the bounds are retricted, as with _handleClick, we souldn't change the value.
      if (restrictBounds && (percent < 0 || percent > 1)) return NaN;

      var rawValue = self.options.min * 1 + ((self.options.max - self.options.min) * percent);

      // Snap value to nearest step
      return this._snapValueToStep(rawValue, self.options.min, self.options.max, self.options.step);
    },

    _getHighestValue: function () {
      return Math.max.apply(null, this.values);
    },

    _getLowestValue: function () {
      return Math.min.apply(null, this.values);
    },

    /**
     * Initializes inputs and handles for accessibility.
     * If the user agent supports input[type=range], the inputs should receive keyboard focus and keyboard events should be handled natively.
     * When the user agent does not support input[type=range], the handles should implement the WAI-ARIA Slider widget design pattern.
     * @private
     */
    _makeAccessible: function () {
      var self = this,
          $input, $handle;

      this.$inputs.each(function(i, inputElement) {
        $input = $(inputElement);
        $handle =  self.$handles.eq(i);

        if (self._supportsRangeInput) {
          $input.attr({
            'aria-valuetext': self.options.valuetextFormatter($input.attr('value')),
            'aria-hidden': null,
            'tabindex': null
          });
          $handle.attr({
            'role': null,
            'aria-valuemin': null,
            'aria-valuemax': null,
            'aria-valuestep': null,
            'aria-valuenow': null,
            'aria-valuetext': null,
            'tabindex': null,
            'aria-labelledby': null
          });
          $('label[for="#' + $handle.attr('id') + '"]').attr('for', $input.attr('id'));
        } else {
          $input.attr({
            'aria-valuetext': null,
            'aria-hidden': true,
            'tabindex': -1
          });
          $handle.attr({
            'role': 'slider',
            'aria-valuemin': $input.attr('min'),
            'aria-valuemax': $input.attr('max'),
            'aria-valuestep': $input.attr('step'),
            'aria-valuenow': $input.attr('value'),
            'aria-valuetext': self.options.valuetextFormatter($input.attr('value')),
            'tabindex': !$input.is(':disabled') ? 0 : null,
            'aria-labelledby': $input.attr('aria-labelledby') || null
          });
          $('label[for="' + $input.attr('id') + '"]').attr('for', $handle.attr('id'));
        }
      });

      if (!self._supportsRangeInput) {
        this._inputsOrHandles = this.$handles;
        this.$element.on('keydown.slider', '[role=slider].coral-Slider-handle' , this._keyDown.bind(this));
      } else {
        this._inputsOrHandles = this.$inputs;
        this.$element.off('keydown.slider');
      }

      // update values to make sure that all aria attributes and values are in sync
      $.each(this.values, function (i, value){
        self._updateValue(i, value, true);
      });
    },

    /**
     * Ensure that legend and label elements correctly label the inputs of the slider,
     * and adjusts the DOM so that labels don't break the layout of the CUI.Slider.
     * @private
     */
    _adjustLabelling: function () {
      var self = this,
        elementId = this.$element.attr('id'),
        $legend = this._adjustFieldsetAndLegend();

      this._adjustInputLabels($legend);
    },

    /**
     * Sliders with two inputs should be contained within a fieldset
     * with a legend element as its first child, which provides a label for the grouping.
     *
     * This method corrects the DOM of the fieldest and legend elements
     * so that they don't break the layout of the CUI.Slider.
     *
     * @return {jQuery} the new legend element
     * @private
     */
    _adjustFieldsetAndLegend: function () {
      var self = this,
        elementId = this.$element.attr('id'),
        // sliders with two inputs should be contained within a fieldset to provide a label for the grouping
        $fieldset = this.$element.children('fieldset'),
        $legend = $fieldset.children('legend'),
        $group, $grouplegend;

      // [~dantipa]
      // this block has to be optimized
      // taking the content of fieldset and appending it somewhere else causes flashing
      // future markup should be like the expected markup (breaking change)
      if ($fieldset.length) {
        // move all fieldset children other than the legend to be children of the element.
        this.$element.append($fieldset.contents(':not(legend)'));

        // create a new wrapper div with role="group" and class="coral-Slider-fieldset", which will behave as a fieldset but render as an inline block
        $group = $('<div/>', {
          'role': 'group',
          'class': 'coral-Slider-fieldset'
        }).insertBefore(this.$element);

        // wrap the element with the new "coral-Slider-fieldset " div.
        // [~mijordan] we wrap the div so that the label or legend for the slider
        // can be displayed without interfering with the generated markup elements for the slider
        // which are absolutely positioned relative to the coral-Slider element.
        $group.append(this.$element);

        if ($legend.length) {
          // create new label element and append the contents of the legend
          $grouplegend = $('<div/>');
          $grouplegend.append($legend.contents());

          // give the new label element all the same attributes as the legend
          $.each($legend.prop('attributes'), function () {
            $grouplegend.attr(this.name, this.value);
          });

          // if the new grouplegend has no id, which would have been inherited from the original legend, assign one.
          if (!$grouplegend.attr('id')) {
            $grouplegend.attr('id', elementId + '-legend');
          }

          // replace the original fieldset, which now only contains the original legend, with the new legend label element
          $fieldset.replaceWith($grouplegend);

          // insert the new grouplegend before the element
          $legend = $grouplegend.insertBefore(this.$element);

          // the group should be labelled by the legend
          $group.attr('aria-labelledby', $legend.attr('id'));
        }
      }

      return $legend;
    },

    /**
     * Explicitly associates the legend and labels to the inputs they label.
     * Adjusts the DOM so that the label doesn't break the layout of the CUI.Slider.
     * @private
     */
    _adjustInputLabels: function (legend) {
      var self = this,
          elementId = this.$element.attr('id'),
          $legend = $(legend);

      this.$inputs.each(function (index, input) {
        var $input = $(input),
            inputId = $input.attr('id'),
            $label,
            ariaLabelledby = $input.attr('aria-labelledby');

        // if the input doesn't have an id, make one
        if (!inputId) {
          $input.attr('id', elementId + '-input' + index);
          inputId = $input.attr('id');
        }

        if (!ariaLabelledby) {
          ariaLabelledby = '';
          $input.attr('aria-labelledby', ariaLabelledby);
        }

        // existing labels that use the "for" attribute to identify the input
        $label = self.$element.find('label[for="' + inputId + '"]');

        // If we have a legend, the input should first be labelled by the legend.
        // On Windows, screen readers do a good job of announcing the containing group when identifying the control,
        // so we exclude Windows to prevent double voicing of the legend.
        if ($legend.length && window.navigator.platform.indexOf('Win') === -1) {
          if (ariaLabelledby.indexOf($legend.attr('id')) === -1) {
            ariaLabelledby = $legend.attr('id') + (ariaLabelledby.length ? ' ' : '') + ariaLabelledby;
            $input.attr('aria-labelledby', ariaLabelledby);
          }
        }

        // for existing labels that use the "for" attribute to identify the input,
        if ($label.length) {
          // if the label is not the input's parent, move it before the slider element tag
          $label.not($input.parent()).insertBefore(self.$element);
          $label.each(function (index) {
            // if the label doesn't have an id, create one
            if (!$(this).attr('id')) {
              $(this).attr('id', inputId + '-label' + index);
            }

            // explicity identify the input's label
            if (ariaLabelledby.indexOf(inputId + '-label' + index) === -1) {
              ariaLabelledby = ariaLabelledby + (ariaLabelledby.length ? ' ' : '') + inputId + '-label' + index;
              $input.attr('aria-labelledby', ariaLabelledby);
            }

            $(this).on('mousedown.slider', function (event) {
              self._inputsOrHandles.eq(index).focus();
              event.preventDefault();
              event.stopImmediatePropagation();
            });
          });
        }

        // if the input is contained by a label
        if ($input.parent().is('label')) {
          $label = $input.parent();

          // make sure it has an id
          if (!$label.attr('id')) {
            $label.attr('id', inputId + '-label');
          }

          // make sure it explicitly identifies the input it labels
          if (!$label.attr('for')) {
            $label.attr('for', inputId);
          }

          // move the input after the label
          $input.insertAfter($label);

          // if there is a legend, this is a two thumb slider; internal labels identify the minimum and maximum, and they should have the class="u-coral-screenReaderOnly"
          // aria-hidden=true hides the label from screen readers, but keeps it in the DOM as a label for the input;
          // the label should never be read independent of the input.
          if ($legend.length) {
            $label.addClass('u-coral-screenReaderOnly')
              .attr({
                'aria-hidden': true
              });
          }

          // move the label outside the slider element tag
          $label.insertBefore(self.$element);
        }

        // if the input has a label that is not included in the aria-labelledby attribute, add the label id to the "aria-labelledby" attribute
        if ($label.length && ariaLabelledby.indexOf($label.attr('id')) === -1) {
          ariaLabelledby = ariaLabelledby + (ariaLabelledby.length ? ' ' : '') + $label.attr('id');
          $input.attr('aria-labelledby', ariaLabelledby);
        }

        if ($label.length === 0 && ariaLabelledby.length > 0) {
          $label = $('#' + ariaLabelledby.split(' ')[0]);
        }

        if (ariaLabelledby.length === 0) {
          $input.removeAttr('aria-labelledby');
        }

        // clicking on a label or legend should focus the first input or handle in the group
        if (index === 0) {
          if ($label.length) {
            $label.on('click.slider', self._clickLabel.bind(self));
          }

          if ($legend.length) {
            $legend.on('click.slider', self._clickLabel.bind(self));
          }
        }
      });
    },

    /**
     * Boolean to flag support for HTML5 input[type=range]
     * @private
     */
    _supportsRangeInput: (function () {
      var i = document.createElement('input');
      i.setAttribute('type', 'range');
      return (i.type === 'range');
    })(),

    _snapValueToStep:function(rawValue, min, max, step) {
      step = parseFloat(step);
      var remainder = ((rawValue - min) % step), snappedValue,
          floatString = step.toString().replace(/^(?:\d+)(?:\.(\d+))?$/g, '$1'),
          precision = floatString.length;

      if (Math.abs(remainder) * 2 >= step) {
        snappedValue = (rawValue - Math.abs(remainder)) + step;
      } else {
        snappedValue = rawValue - remainder;
      }

      if (snappedValue < min) {
        snappedValue = min;
      } else if (snappedValue > max) {
        snappedValue = min + Math.floor((max - min) / step) * step;
      }

      // correct floating point behavior by rounding to step precision
      if (precision > 0) {
        snappedValue = parseFloat(snappedValue.toFixed(precision));
      }

      return snappedValue;
    }

    /*
    update: function() {
     // @todo Figure out what last committer meant when they wrote "Single update method" here
    }
    */
  });

  CUI.Widget.registry.register('slider', CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (e) {
      CUI.Slider.init($('.coral-Slider[data-init~="slider"]', e.target));
    });
  }
}(jQuery, this));


(function ($) {
  CUI.LabeledSlider = new Class(/** @lends CUI.LabeledSlider# */{
    toString: 'LabeledSlider',
    extend: CUI.Slider,

    /**
     @extends CUI.Slider
     @classdesc <p><span id="slider-label">A slider widget with labeled ticks</span></p>


     <p>
     The labeled slider uses the same options/markup as the slider label, but with one addition: You can provide a list of labels for the
     slider's ticks. (And of course use data-init="labeled-slider"!)
     </p>
     <p><em>Please note</em> that you have to list the labels for the ticks exactly in the order and count that you configured
     your slider's ticks. If your slider has 5 ticks, provide 5 labels for it. The number of ticks depends on the step / min / max values and
     can be calculated by ceil((max - min) / step) - 1.</p>

     @desc Creates a labeled slider from a div
     @constructs

     @param {Object}   options                               Component options
     @param {number} [options.step=1]  The steps to snap in
     @param {number} [options.min=1]   Minimum value
     @param {number} [options.max=100] Maximum value
     @param {number} [options.value=1] Starting value
     @param {number} [options.tooltips=false] Show tooltips?
     @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
     @param {boolean} [options.slide=false]    True for smooth sliding animations. Can make the slider unresponsive on some systems.
     @param {boolean} [options.disabled=false] True for a disabled element
     @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min
     @param {boolean} [options.alternating=false] Staggers the layout of tick labels.
     **/
    construct: function () {
      this.$element.addClass("coral-Slider--labeled");

      if (this.options.alternating) {
        this.$element.addClass("coral-Slider--alternatingLabels");
      }
    },

    defaults: $.extend(CUI.Slider.prototype.defaults, {
      'alternating': false
    }),

    /**
     * reads the options from the markup (classes)
     * @private
     */
    _readOptions: function () {
      this.inherited(arguments);

      if (this.$element.hasClass("coral-Slider--alternatingLabels")) {
        this.options.alternating = true;
      }
    },

    _getTickLabel: function (index) {
      var el = this.$element.find("ul.coral-Slider-tickLabels li").eq(index);
      return el.html();
    },

    _buildTicks: function () {
      var self = this,

          // The ticks holder
          $ticks = $("<div></div>").addClass('coral-Slider-ticks'),
          numberOfTicks = Math.ceil((self.options.max - self.options.min) / self.options.step) + 1,
          trackDimensions = self.isVertical ? self.$element.height() : self.$element.width(),
          maxSize = 100 * (trackDimensions / (numberOfTicks)) / trackDimensions;

      this.$element.append($ticks);

      if (this.options.alternating) {
        maxSize *= 2;
      }

      for (var i = 0; i < numberOfTicks; i++) {
        var position = trackDimensions * (i) / (numberOfTicks - 1),
            percent = (position / trackDimensions) * 100,
            tick = $('<div/>').addClass('coral-Slider-tick').css((self.isVertical ? 'bottom' : 'left'), percent + "%"),
            tickLabelId = 'coral-Slider-tickLabel-' + self.$element.attr('id') + '-'+ i,
            ticklabel = $('<div/>').addClass('coral-Slider-tickLabel').attr('id', tickLabelId);
        $ticks.append(tick);
        if (!self.isVertical) percent -= maxSize / 2;
        ticklabel.css((self.isVertical ? 'bottom' : 'left'), percent + "%");
        if (!self.isVertical) ticklabel.css('width', maxSize + "%");
        ticklabel.append(self._getTickLabel(i));
        $ticks.append(ticklabel);
      }
      self.$ticks = $ticks.find('.coral-Slider-tick');
      if (self.options.filled) {
        self._coverTicks();
      }
    },

    /**
     * Finds the nearest tick and assigns its corresponding label to the slider's aria-describedby property.
     * @private
     */
    _moveHandles: function () {
      var self = this;
      this.inherited(arguments);

      if (!this.$ticks || this.$ticks.length === 0) return;

      this.$inputs.each(function (index) {
        var $input = self.$inputs.eq(index),
          $handle = self.$handles.eq(index),
          inputOffset = $input.offset(),
          inputX = inputOffset.left + $input.width() / 2,
          inputY = inputOffset.top + $input.height() / 2,
          tickPos = self._findNearestTick(inputX, inputY),
          $tickLabel = self.$ticks.eq(tickPos).next('.coral-Slider-tickLabel');

        (self._supportsRangeInput ? $input : $handle).attr({
          'aria-describedby': $tickLabel.attr('id')
        });
      });
    },

    /**
     * Finds the nearest tick relative to a given offset coordinates.
     * @private
     */
    _findNearestTick: function (posX, posY) {
      if (!this.$ticks || this.$ticks.length === 0) return;
      var self = this,
          closestDistance = Infinity, // Incredible large start value
          // Find the nearest handle
          pos = 0;

      self.$ticks.each(function (index) {

        // Handle position
        var tickX = $(this).offset().left,
          tickY = $(this).offset().top,

        // Handle Dimensions
          tickWidth = $(this).width(),
          tickHeight = $(this).height(),

        // Distance to tick
          distance = Math.abs(posX - (tickX + (tickWidth / 2)));
        if (self.options.orientation === 'vertical') {
          distance = Math.abs(posY - (tickY + (tickHeight / 2)));
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          pos = index;
        }
      });

      return pos;
    }
  });

  CUI.Widget.registry.register("labeled-slider", CUI.LabeledSlider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.LabeledSlider.init($(".coral-Slider[data-init~='labeled-slider']", e.target));
    });
  }
}(window.jQuery));




/* jshint devel:true */

(function ($, window, undefined) {
  CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
    toString: 'Autocomplete',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc Autocomplete is an input component which allows users
     * to search a list of items by typing into the input or, optionally,
     * clicking a toggle button. The list of items can be provided directly
     * or loaded dynamically from a remote endpoint. Depending on enabled
     * options, users can also create tags based on the text they have
     * entered or an item they have selected.
     *
     * @description Creates a new select
     * @constructs
     *
     * @param {Object} options Component options
     * @param {Mixed} options.element jQuery selector or DOM element to use
     * for the autocomplete element.
     * @param {String} [options.mode=starts] Search mode for
     * filtering on the client. Possible values are "starts" or "contains".
     * This has no effect if filtering is occurring remotely.
     * @param {Boolean} [options.ignorecase=true] Whether filtering on the
     * client should be case insensitive. This has no effect if filtering
     * is occurring remotely.
     * @param {Number} [options.delay=500] Amount of time, in milliseconds,
     * to wait after typing a character before a filter operation is
     * triggered.
     * @param {Boolean} [options.multiple=false] Allows multiple items
     * to be selected. Each item selection generates a tag.
     * @param {Boolean} [options.forceselection=false] <code>true</code> to
     * restrict the selected value to one of the given options of select list.
     * Otherwise the user is allow to enter arbitrary text.
     * @param {Object} [options.selectlistConfig] A configuration object
     * that is passed through to the select list. See {@link CUI.SelectList}
     * for more information.
     * @param {Object} [options.tagConfig] A configuration object
     * that is passed through to the tag list. See {@link CUI.TagList}
     * for more information.
     */
    construct: function () {
      // find elements
      this._input = this.options.predefine.input || this.$element.find('.js-coral-Autocomplete-textfield');
      this._selectlist = this.options.predefine.selectlist || this.$element.find('.js-coral-Autocomplete-selectList');
      this._tags = this.options.predefine.tags || this.$element.find('.js-coral-Autocomplete-tagList');
      this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.js-coral-Autocomplete-toggleButton');
      this._selectListAnchor = this.$element.find('.js-coral-Autocomplete-field');

      // For backward-compatibility.
      if (!this._selectListAnchor.length) {
        this._selectListAnchor = this.$element.find('.js-coral-Autocomplete-inputGroup');
      }

      // apply
      this.applyOptions();

      // accessibility
      this._makeAccessible();

      this._initTypeahead();
      this._setOptionListeners();
    },

    defaults: {
      mode: 'starts', // filter mode ['starts', 'contains']
      ignorecase: true,
      delay: 200,
      multiple: false,
      forceselection: false,

      selectlistConfig: null,
      tagConfig: null,

      // @warning do not use this
      //
      // future feature
      // allows to bypass element search and pass elements
      // will allow to evalute this solution
      predefine: {}
    },

    applyOptions: function () {
      this._setInput();
      this._setTags();
      this._setSelectlist();
      this._setSuggestions();
      this._setForceSelection();
    },

    /**
     * Sets up listeners for option changes.
     * @private
     */
    _setOptionListeners: function () {

      this.on('change:multiple', function () {
        this._setInput();
        this._setTags();
        this._setForceSelection();
      }.bind(this));

      this.on('change:forceselection', function () {
        this._setForceSelection();
      }.bind(this));

      this._selectlist
        .on("itemremoved", function (removedEvent) {
          var values;

          if (removedEvent.item instanceof CUI.SelectList.Group) {
            values = removedEvent.item.getItems().map(function(option) { return option.getValue(); });
          } else {
            values = [removedEvent.item.getValue()];
          }
          this._deselect(values);
        }.bind(this));
    },

    /**
     * Clears values from the taglist
     * @private
     */
    _deselect: function (values) {
      values.forEach(function _deselectValue(value) {
        if (this.options.multiple) {
          this._tagListWidget.removeItem(value);
        } else if (
          (this._input && value === this._input.val()) ||
          (this._valueInput && value === this._valueInput.val())) {
          this.clear();
        }
      }, this);
    },

    /**
     * Initializes the forceselection logic
     * @private
     */
    _setForceSelection: function () {
      var self = this;

      if (this.options.forceselection && !this.options.multiple) {

        // if the hidden field has not been initialized we set it up
        if (!this._valueInput) {

              // queries for the hidden value
          var hiddenInput = this.$element.find('.js-coral-Autocomplete-hidden'),
              // gets name used by the input
              inputName = this._input.prop('name'),
              // gets the current value
              inputValue = this._input.val();

          // if the hidden value exists
          if(hiddenInput.length > 0) {

            // uses the current hidden value
            this._valueInput = hiddenInput;

            // if the hidden input does not have a name and
            // and the input field has one, we assign it to
            // the hidden input
            if(!this._valueInput.prop('name') && inputName) {
              this._valueInput.prop('name', inputName);
            }

            // clears the name of original input
            this._input.prop('name', '');

            // preserves the current value of the hidden field as the last selected
            self._lastSelected = this._valueInput.val();
            // saves the current displayed value
            self._lastSelectedDisplay = inputValue;

          } else {

            // creates a new hidden input
            if (inputName) {
              // creates a hidden field and copies the current
              // name and value
              this._valueInput = $('<input type="hidden" class="js-coral-Autocomplete-hidden">')
                .prop('name', inputName)
                .val(inputValue)
                .insertAfter(this._input);

              // clears the name of original input
              this._input.prop('name', '');
            }

            // sets the initial value as lastSelect and lastDisplaySelected
            self._lastSelected = inputValue;
            self._lastSelectedDisplay = inputValue;
          }
        }

        // Reset to last value on blur.
        this._input.on('blur.autocomplete-forceselection', function () {

          var handler = function () {
              // if the display value has changed
              if (self._lastSelectedDisplay !== self._input.val()) {

                // if the user reset the value, we clear everything
                if (self._input.val() === '') {
                  // resets the stored variables
                  self._lastSelectedDisplay = '';
                  self._lastSelected = '';

                  self._triggerValueChange();
                }

                // sets the latest known values
                self._input.val(self._lastSelectedDisplay);
                self._valueInput.val(self._lastSelected);
              }
          };

          var timeout = setTimeout(handler, 0);

          self._suggestionsBtn.on('focus', function () {
            clearTimeout(timeout);
            self._suggestionsBtn.on('blur', handler);
          });
        });
      } else {
        this._input.off('blur.autocomplete-forceselection');

        if (this._valueInput) {
          // copies back the name and value to the original input
          this._input.prop('name', this._valueInput.prop('name'));
          this._input.val(this._valueInput.val());
          // removes the hidden input
          this._valueInput.remove();
          this._valueInput = undefined;
        }
      }
    },

    /**
     * Initializes the text input
     * @private
     */
    _setInput: function () {
      if (this.options.multiple) {
        this._input.on('keypress.autocomplete-preventsubmit', function (event) {
          if (event.which === 13) { // enter
            // Prevent it from submitting a parent form.
            event.preventDefault();
            return false;
          }
        });
      } else {
        this._input.off('keypress.autocomplete-preventsubmit');
      }

      // Prevents native autocompletion from being enabled when inside
      // a form.
      this._input.attr('autocomplete', 'off');

      // uses the initial value as default
      this._lastSelected = this._input.val();
      this._lastSelectedDisplay = this._input.val();
    },

    /**
     * initializes the select list widget
     * @private
     */
    _setSelectlist: function () {
      // if the element is not there, create it
      if (this._selectlist.length === 0) {
        this._selectlist = $('<ul/>', {
          'id': CUI.util.getNextId(),
          'class': 'coral-SelectList js-coral-Autocomplete-selectList'
        }).appendTo(this.$element);
      } else if (!this._selectlist.attr('id')) {
        this._selectlist.attr('id', CUI.util.getNextId());
      }

      this._selectlist.selectList($.extend({
        relatedElement: this._selectListAnchor,
        autofocus: false,
        autohide: true
      }, this.options.selectlistConfig || {}));

      this._selectListWidget = this._selectlist.data('selectList');

      this._selectlist
        // receive the value from the list
        .on('selected.autocomplete', this._handleSelected.bind(this));
    },

    /**
     * initializes the tags for multiple options
     * @private
     */
    _setTags: function () {
      if (this.options.multiple && !this._tagListWidget) {
        // if the element is not there, create it
        if (this._tags.length === 0) {
          this._tags = $('<ul/>', {
            'class': 'coral-TagList js-coral-Autocomplete-tagList'
          }).appendTo(this.$element);
        }

        this._tags.tagList(this.options.tagConfig || {});
        this._tagListWidget = this._tags.data('tagList');
        this._input.on('keyup.autocomplete-addtag', this._addTag.bind(this));
        var boundTriggerValueChange = this._triggerValueChange.bind(this);
        this._tags.on('itemremoved', boundTriggerValueChange);
        this._tags.on('itemadded', boundTriggerValueChange);

      } else if (!this.options.multiple && this._tagListWidget) {
        this._tags.off('itemadded');
        this._tags.off('itemremoved');
        this._tags.remove();
        this._tags = null;
        this._tagListWidget = null;
        this._input.off('keyup.autocomplete-addtag');
      }
    },

    /**
     * initializes the typeahead functionality
     * @private
     */
    _initTypeahead: function () {
      var self = this,
        timeout;

      var debounceComplete = function () {

        self.showSuggestions(
          self._input.val(),
          false,
          self._selectListWidget);
      };

      var debounce = function (event) {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(debounceComplete, self.options.delay);
      };

      this._input.on('input.autocomplete', debounce);

      // IE9 doesn't fire input events for backspace, delete, or cut so
      // we're making up the difference.
      this._input.on('cut.autocomplete', debounce);
      this._input.on('keyup.autocomplete', function (event) {
        switch (event.which) {
          case 8: // backspace
          case 46: // delete
            debounce();
        }
      });
      this._input.on('keypress.autocomplete', function (event) {
        event.stopPropagation();
      });
    },

    /**
     * sets the suggestion button
     * @private
     */
    _setSuggestions: function () {
      var self = this;

      // if the button to trigger the suggestion box is not there,
      // then we add it
      if (this._suggestionsBtn.length) {
        // handler to open suggestion box
        this._suggestionsBtn.attr({
          'tabindex': -1,
          'aria-hidden': true
        });
        this._suggestionsBtn.on('click.autocomplete', function (event) {
          if (!self._selectListWidget.get('visible')) {
            self.showSuggestions(
              '',
              true,
              self._selectListWidget);

            self._input.trigger('focus');

            event.preventDefault();
            // If the event were to bubble to the document the
            // select list would be hidden.
            event.stopPropagation();
          } else {
            self._input.trigger('focus');
          }
        });

        // add class to input to to increase padding right for the button
        this._input.addClass('autocomplete-has-suggestion-btn');
      }
    },

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#combobox
     * http://www.w3.org/WAI/PF/aria/states_and_properties#aria-autocomplete
     * @private
     */
    _makeAccessible: function () {
      var self = this, $inputLabel;
      this._input.attr({
        'id': this._input.attr('id') || CUI.util.getNextId(),
        'role': 'combobox',
        'aria-multiselectable': this.options.multiple || null,
        'aria-autocomplete': this.options.typeahead ? 'list' : null,
        'aria-owns': this._selectlist.attr('id') || null
      });

      // Make sure that the input has a label.
      // If no label is present, this tries to correct the poor practice
      // of using placeholder text instead of a true label.
      $inputLabel = $('label[for="' + this._input.attr('id') +'"]');
      if ($inputLabel.length === 0) {
        $inputLabel = this._input.closest('label');
      }
      if (($inputLabel.length === 0 || $.trim($inputLabel.text()).length === 0) && this._input.attr('placeholder')) {
        this._input.attr({
          'aria-label': this._input.attr('placeholder')
        });
      }

      this._selectListWidget._makeAccessible();

      this._input.add(this._suggestionsBtn).on('keydown.cui-autocomplete', function (event) {
        switch (event.which) {
          case 40: // down arrow
            if (!self._selectListWidget.get('visible')) {
              self._selectListWidget.show().resetCaret();
            } else {
              self._selectListWidget.$element.trigger('focus');
            }
            event.preventDefault();
            // If the event continued propagation then the
            // SelectList would set its cursor to the next
            // item in the list.
            event.stopPropagation();
            break;
        }
      }.bind(this));
    },

    /**
     * adds a new tag with the current input value
     * @private
     */
    _addTag: function (event) {
      if (event.which !== 13 || this.options.forceselection) {
        return;
      }

      this._tagListWidget.addItem(this._input.val());
      this.clear();
      this._selectListWidget.hide();
    },

    /**
     * @private
     * @param  {jQuery.Event} event
     */
    _handleSelected: function (event) {
      this._selectListWidget.hide();

      var selectedValue = event.selectedValue,
        displayedValue = event.displayedValue;

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          display: displayedValue,
          value: selectedValue
        });
        this.clear();
      } else {
        this._lastSelected = selectedValue || displayedValue;
        this._lastSelectedDisplay = displayedValue;

        if (this.options.forceselection) {
          this._input.val(displayedValue);
          this._valueInput.val(this._lastSelected);
        } else {
          // Use _lastSelected to follow <datalist> behaviour
          this._input.val(this._lastSelected);
        }

        this._triggerValueChange();
      }

      this._input.trigger('focus');
    },

    /**
     * this function is triggered when a typeahead request needs to be done
     * override this function to achieve a custom handling on the client
     *
     * @fires Autocomplete#query
     * @param {String} val null if all values need to be shown
     * @param {Boolean} fromToggle Whether the request was triggered
     * by the user clicking the suggestion toggle button.
     * @param {CUI.SelectList} selectlist instance to control the popup
     */
    showSuggestions: function (val, fromToggle, selectlist) { // selectlist argument is passed for custom implementations
      // fire event to allow notifications
      this.$element.trigger($.Event('query', {
        value: val
      }));

      var selectListWidgetType = this._selectListWidget.get('type'),
          showList = true;

      if (val.length || fromToggle) {
        // actually handle the filter
        if (selectListWidgetType === 'static') {
          this._handleStaticFilter(val);
          showList = this._selectlist.find('[role="option"]:not(.is-hidden)').length > 0;
        } else if (selectListWidgetType === 'dynamic') {
          this._handleDynamicFilter(val);
        }
        if (!showList) {
          this._selectListWidget.hide();
        } else {
          this._selectListWidget.show().resetCaret();
        }
      } else if (val.length === 0 && this._selectListWidget._hasFocus()) {
        if (selectListWidgetType === 'static') {
          this._handleStaticFilter(val);
          showList = this._selectlist.find('[role="option"]:not(.is-hidden)').length > 0;
        }
        if (!showList) {
          this._selectListWidget.hide();
        }
      } else { // No input text and the user didn't click the toggle.
        // TODO when val.length === 0, it should show all options. Otherwise bad UX.
        this._selectListWidget.hide();
      }
    },

    /**
     * handles a static list filter (type == static) based on the defined mode
     * @private
     * @param  {String} query The term used to filter list items.
     */
    _handleStaticFilter: function (query) {
      var self = this;
      if (query) {
        this._selectListWidget.filter(function (value, display) {
          if (self.options.ignorecase) {
            display = display.toLowerCase();
            query = query.toLowerCase();
          }
          // performance "starts": http://jsperf.com/js-startswith/6
          // performance "contains": http://jsperf.com/string-compare-perf-test
          return self.options.mode === 'starts' ? display.lastIndexOf(query, 0) === 0 :
            self.options.mode === 'contains' ? display.search(query) !== -1 :
              false;
        });
      } else {
        this._selectListWidget.filter();
      }
    },

    /**
     * handles a dynamic list filter (type == dynamic) based on the defined mode
     * @private
     * @param {String} query The term used to filter list items.
     */
    _handleDynamicFilter: function (query) {
      var data = $.extend({}, this._selectListWidget.get('dataadditional'), {
        query: query
      });

      this._selectListWidget.set('dataadditional', data);
      this._selectListWidget.triggerLoadData(true);
    },

    _triggerValueChange: function () {
      this.$element.trigger(
        $.Event('change:value'),
        {
          value: this.getValue()
        }
      );
    },

    /**
     * clears the autocomplete input field
     */
    clear: function () {
      this._input.val('');
      this._lastSelected = '';
      this._lastSelectedDisplay = '';
      this._selectListWidget.filter();

      if (this._valueInput) {
        this._valueInput.val('');
      }

      // clean up dataadditional object in selectlist, see autocomplete.handleDynamicFilter()
      var dataAdditional = this._selectListWidget.get('dataadditional');
      if (dataAdditional) {
        delete dataAdditional.query;
      }
    },

    /**
     * disables the autocomplete
     */
    disable: function () {
      this.$element.addClass('is-disabled');
      this.$element.attr('aria-disabled', true);
      this._input.prop('disabled', true);
      this._suggestionsBtn.prop('disabled', true);
    },

    /**
     * enables the autocomplete
     */
    enable: function () {
      this.$element.removeClass('is-disabled');
      this.$element.attr('aria-disabled', false);
      this._input.prop('disabled', false);
      this._suggestionsBtn.prop('disabled', false);
    },

    /**
     * Get the selection option at the given position.
     *
     * @param {Number} position
     *
     * @returns option
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption: function (position) {
      return this._selectListWidget.getOption(position);
    },

    /**
     * Remove the selection option at the given position.
     *
     * @param {Number} position
     *
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    removeOption: function (position) {
      this.getOption(position).remove();
    },

    /**
     * Get the option group at the given position.
     *
     * @param {Number} position
     *
     * @returns group
     *
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getGroup: function (position) {
      return this._selectListWidget.getGroup(position);
    },

    /**
     * Removes the option group at the given position.
     *
     * @param {Number} position
     *
     * @returns group
     *
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    removeGroup: function (position) {
      return this.getGroup(position).remove();
    },

    /**
     * Adds a selection option at the given position. If position
     * is undefined, the option is added at the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged.
     *
     * @param {Object|CUI.SelectList.Option|Element|jQuery|Array} option
     *        Option that should be added. If type is Object, the keys `value`
     *        and `display` are used to create the option. If type is
     *        CUI.SelectList.Option, the underlying element is added to the
     *        list. If type is Element, the node is added to the list. If type
     *        is jQuery <b>all</b> elements within the collection are added to
     *        the list. If type is Array, then the array is expected to contain
     *        one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addOption : function (option, position) {
      this._selectListWidget.addOption(option, position);
    },

    /**
     * Adds an option group at the given position. If position is undefined, the
     * group is added to the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged. Since closing/opening the select will reload the list
     * content, the elements that were added via this method call will be lost.
     *
     * @param {String|CUI.SelectList.Group|Element|jQuery|Array} group
     *        Group that should be added. If type is String, it is used as
     *        display value.  If type is CUI.SelectList.Group, the underlying
     *        element is added to the list. If type is Element, the node is
     *        added to the list.  If type is jQuery <b>all</b> element within
     *        the collection are added to the list. If type is Array, then the
     *        array is expected to contain one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addGroup : function (group, position) {
      this._selectListWidget.addGroup(group, position);
    },

      /**
     *
     * @return {Array|String} current value
     */
    getValue: function () {
      if (this.options.multiple) { // multiple returns array
        return this._tagListWidget.getValues();
      } else if (this.options.forceselection) {
        return this._lastSelected;
      } else {
        return this._input.val();
      }
    },

    /**
     * Retrieve list of suggestion items (groups or options). Note: The list
     * represents a snapshot of the current state. If items are added or
     * removed, the list will become invalid.
     *
     * @return {Array} List of CUI.SelectList.Option and CUI.SelectList.Group
     *   instances
     */
    getItems : function () {
      return this._selectListWidget.getItems();
    },

  });

  CUI.Widget.registry.register("autocomplete", CUI.Autocomplete);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (e) {
      CUI.Autocomplete.init($('[data-init~=autocomplete]', e.target));
    });
  }

}(jQuery, this));

(function ($, window, undefined) {
  CUI.Select = new Class(/** @lends CUI.Select# */{
    toString: 'Select',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc a widget which is similar to the native &lt;select&gt;
     *
     * @description Creates a new select
     * @constructs
     *
     * @param {Object} [options=null] Component options
     * @param {Mixed} [options.element=null] jQuery selector or DOM element to use for panel
     * @param {String} [options.type=static] static or dynamic list
     * @param {Boolean} [options.nativewidget=false] shows a native select; instead of a SelectList widget
     * @param {Boolean} [options.nativewidgetonmobile=true] forces a native select on a mobile device if possible
     * @param {Boolean} [options.multiple=false] multiple selection, will automatically be detected form a given &lt;select&gt; source
     */
    construct: function () {
      var self = this;

      // find elements
      this._button = this.$element.children('.coral-Select-button');
      this._buttonText = this._button.children('.coral-Select-button-text');
      this._nativeSelect = this.$element.children('.coral-Select-select');
      this._selectList = this.$element.children('.coral-SelectList');
      this._tagList = this.$element.children('.coral-TagList');
      this._valueInput = this.$element.children('input[type=hidden]');

      // apply
      this.applyOptions();
    },

    defaults: {
      type: 'static',
      nativewidget: false,
      nativewidgetonmobile: true,
      multiple: false,
      tagConfig: null,
      selectlistConfig: null
    },

    applyOptions: function () {
      // there is a select given so read the "native" config options
      if (this._nativeSelect.length > 0) {
        // if multiple set multiple
        if (this._nativeSelect.prop('multiple')) {
          this.options.multiple = true;
        }
      }

      // Create SelectList in any case, since it is used to implement
      // add{Option,Group} and getItems APIs.
      this._createSelectList();

      this._nativeSelect.removeClass("coral-Select-select--native");
      this._nativeSelect.off(".selectlist");
      this._button.off(".selectlist");

      switch (this._getModeOfOperation()) {
        case "disabled":
          this._disabledEventHandling();
          break;

        case "nativeselect":
          this._prepareSelectForInteraction();
          this._disableKeyboardInteractionWithSelectList();
          break;

        case "selectlist":
          this._prepareSelectListForInteraction();
          this._disableKeyboardInteractionWithNativeSelect();
          break;

        case "hybrid":
          this._prepareSelectForInteraction();
          this._prepareSelectListForInteraction();

          this._hybridEventHandling();
          this._disableKeyboardInteractionWithNativeSelect();
          break;
      }

      if (this.options.multiple) {
        this._setTagList();
      } else if (this.options.type === 'static') {
        this._handleNativeSelect();
      }

      this._makeAccessible();
    },

    _makeAccessible: function() {
      var labelElementSelector, $labelElement, labelElementId,
          isMacLike = window.navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

      this._button.attr({
        'id': this._button.attr('id') || CUI.util.getNextId()
      });

      if (this._button.hasClass('is-invalid')) {
        this._button.attr({
          'aria-invalid': true
        });
        this._nativeSelect.attr({
          'aria-invalid': true
        });
        this._selectList.attr({
          'aria-invalid': true
        });
      }

      if (this._button.hasClass('is-disabled')) {
        this._button.attr({
          'aria-disabled': true,
          'disabled': 'disabled'
        });
        this._nativeSelect.attr({
          'aria-disabled': true,
          'disabled': 'disabled'
        });
        this._selectList.attr({
          'aria-disabled': true
        });
      }

      labelElementSelector = (this._nativeSelect.length && this._nativeSelect.attr('id')) ? 'label[for="'+ this._nativeSelect.attr('id') +'"]' : 'label[for="'+ this._button.attr('id') +'"]';

      $labelElement = $(labelElementSelector);

      $labelElement.attr({
        'id':  $labelElement.attr('id') || CUI.util.getNextId()
      });

      labelElementId = $labelElement.attr('id');

      this._buttonText.attr({
        'id': this._buttonText.attr('id') || CUI.util.getNextId()
      });

      this._button.attr({
        'role': isMacLike ? 'button' : 'combobox',
        'aria-expanded': false,
        'aria-haspopup': true,
        'aria-labelledby': labelElementId ?  this._buttonText.attr('id') + ' ' + labelElementId : null,
        'aria-owns': this._selectList.attr('id'),
        'aria-multiselectable': this.options.multiple || null
      });

      if (this._selectListWidget) {
        this._selectListWidget._makeAccessible();
      }

      this._selectList.attr({
        'aria-controls': this._button.attr('id'),
        'aria-multiselectable': this.options.multiple || null
      });

      if ($labelElement.length && !this._button.is('[aria-hidden=true]')) {
        $labelElement.on('click.selectLabel', function (event) {
          this._button.focus();
          event.preventDefault();
        }.bind(this));
      }
    },

    /**
     * @return {Array|String} current value
     */
    getValue: function () {
      if (this.options.multiple) { // multiple returns array
        return this._tagListWidget.getValues();
      } else if (this.options.type === 'static') { // static
        return this._nativeSelect[0][this._nativeSelect[0].selectedIndex].value;
      } else if (this.options.type === 'dynamic') {
        return this._valueInput.val();
      }

      return null;
    },

    /**
     * Mark the options that match the specified value(s) as selected. Any options
     * not matching one of the specified values will get deselected. Values must
     * be strings for option values can only be strings (because they are
     * stored as DOM attributes).
     *
     * @param {string|Array.<string>} value The string value(s) matching the values
     * of the options that should be marked as selected.
     */
    setValue : function (values) {
      var self = this;

      // Make sure we don't break when `values` is undefined:
      if (values === undefined) {
        values = [];
      }
      // Make sure we convert `values` into a proper array:
      else if (!$.isArray(values)) {
        values = [values];
      }

      var deselectedValues = [];

      var handleOption = function(option) {
        var value = option.getValue(),
          index = values.indexOf(value);

        if (index === -1) {
          deselectedValues.push(value);
        } else {
          self._select(value, option.getDisplay());
        }
      };

      this.getItems().forEach(function(item){
        if (item instanceof CUI.SelectList.Option) {
          handleOption(item);
        } else if (item instanceof CUI.SelectList.Group) {
          item.getItems().forEach(handleOption);
        }
      });

      // Make sure that no previously selected options linger:
      this._deselect(deselectedValues);
    },

    /**
     * Retrieve list of first level list items (groups or options). NB: The list
     * represents a snapshot of the current state. If items are added or
     * removed, the list will become invalid.
     *
     * @return {Array} List of CUI.SelectList.Option and CUI.SelectList.Group
     *                 instances
     */
    getItems : function () {
      return this._selectListWidget.getItems();
    },

    /**
     * Get CUI.SelectList.Option representing the option at the given position.
     *
     * @param {Number} position
     *
     * @returns option
     * @throws {TypeError} if position is not numeric or if position points to
     *         group element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getOption: function (position) {
      return this._selectListWidget.getOption(position);
    },

    /**
     * Get CUI.SelectList.Group representing the group at the given position.
     *
     * @param {Number} position
     *
     * @returns group
     *
     * @throws {TypeError} if position is not numeric or if position points to
     *         option element
     * @throws {RangeError} if position is outside of [0, listLength - 1]
     */
    getGroup: function (position) {
      return this._selectListWidget.getGroup(position);
    },

    /**
     * Adds option at the given position. If position is undefined, the option
     * is added at the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged. Since closing/opening the select will reload the list
     * content, the elements that were added via this method call will be lost.
     *
     * @param {Object|CUI.SelectList.Option|Element|jQuery|Array} option
     *        Option that should be added. If type is Object, the keys `value`
     *        and `display` are used to create the option. If type is
     *        CUI.SelectList.Option, the underlying element is added to the
     *        list. If type is Element, the node is added to the list. If type
     *        is jQuery <b>all</b> elements within the collection are added to
     *        the list. If type is Array, then the array is expected to contain
     *        one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addOption : function (option, position) {
      this._selectListWidget.addOption(option, position);
    },

    /**
     * Adds option group at the given position. If position is undefined, the
     * group is added to the end of the list.
     *
     * <b>Please note</b>: Using this API in combination with type="dynamic" is
     * discouraged. Since closing/opening the select will reload the list
     * content, the elements that were added via this method call will be lost.
     *
     * @param {String|CUI.SelectList.Group|Element|jQuery|Array} group
     *        Group that should be added. If type is String, it is used as
     *        display value.  If type is CUI.SelectList.Group, the underlying
     *        element is added to the list. If type is Element, the node is
     *        added to the list.  If type is jQuery <b>all</b> element within
     *        the collection are added to the list. If type is Array, then the
     *        array is expected to contain one of the other types.
     * @param {Number} position
     *        Position at which the element should be inserted. If undefined,
     *        the element is added at the end of the list.
     *
     * @throws {TypeError} if position is not numeric
     * @throws {RangeError} if position is outside of [0, listLength]
     *
     */
    addGroup : function (group, position) {
      this._selectListWidget.addGroup(group, position);
    },

    /**
     * @private
     */
    _getModeOfOperation : function () {
      if (this._button.is(".is-disabled")) {
        return "disabled";
      }
      if (this.options.type === 'dynamic') {
        // Functionality only supported in combination with SelectList component
        return "selectlist";
      }
      if (this.options.nativewidget) {
        // If native widget is set explicitly, we should follow the wish
        return "nativeselect";
      }
      if (this.options.nativewidgetonmobile) {
        // Unless specified otherwise, we want to have native controls on touch
        return "hybrid";
      }

      return "selectlist";
    },


    /**
     * @private
     */
    _disabledEventHandling : function () {
      this._button.on("click.selectlist", function (e) {
        return false;
      });
    },

    /**
     * Sets up event handling for hybrid mode. When a user clicks on the select,
     * which is positioned right above the button, then the opening of the
     * native options list should be aborted. Instead a button click should be
     * emulated. If the user taps on the select, no special handling should take
     * place. Instead the native default behaviour should cause the select to be
     * opened.
     *
     * @private
     */
    _hybridEventHandling : function () {
      var isTouch = false,
          stopClick = false,
          self = this;

      this._nativeSelect
        .on("touchstart.selectlist", function () {
          isTouch = true;
        })
        .on("pointerdown.selectlist", function (e) { // IE 11+
          if (e.originalEvent && e.originalEvent.pointerType === "touch") {
            isTouch = true;
          }
        })
        .on("MSPointerDown.selectlist", function (e) { // IE 10
          if (e.originalEvent && e.originalEvent.pointerType === 2) {
            isTouch = true;
          }
        })
        .on("mousedown.selectlist", function (e) {
          // Ignore touch interaction. We're prefering the defaults in this case
          if (isTouch) {
            isTouch = false;
            return;
          }

          // Ignore everything but left clicks
          if (e.which !== 1) {
            return;
          }

          /**
           * Trying to trick the browser into using the custom SelectList
           * instead of the native select.
           */

          // Avoid display of native options list
          self._nativeSelect.attr("disabled", "disabled");
          setTimeout(function () {
            self._nativeSelect.removeAttr("disabled");
            self._button.focus();
          }, 0);

          stopClick = true;
          self._button.click();
        })
        .on("click.selectlist", function (e) {
          if (stopClick) {
            e.stopPropagation();
            stopClick = false;
          }
        })
        .on("mouseenter.selectlist mouseleave.selectlist", function (e) {
          self._button.toggleClass("is-hovered", e.type === "mouseenter");
        })
        .on("focus.selectlist", function (e) {
          self._button.toggleClass("is-focused", e.type === "focus");
        })
        .on("blur.selectlist", function (e) {
          self._button.removeClass("is-focused");
        });
    },

    /**
     * @private
     */
    _disableKeyboardInteractionWithNativeSelect :  function () {
      // Keyboard focus should not jump to native select
      this._nativeSelect.attr({
        "tabindex": "-1",
        "aria-hidden": true
      });

      this._nativeSelect.off('focusin.nativeselect focusout.nativeselect keydown.nativeselect pointerdown.nativeselect MSPointerDown.nativeselect mousedown.nativeselect');
    },

    /**
     * @private
     */
    _disableKeyboardInteractionWithSelectList : function () {
      // Keyboard focus should not jump to button
      this._button.attr({
        "tabindex": "-1",
        "aria-hidden": true
      });
    },

    /**
     * Applies necessary changes to native select element, so that a user might
     * interact with it.
     *
     * @private
     */
    _prepareSelectForInteraction : function () {
      var self = this;

      self._nativeSelect.addClass("coral-Select-select--native");

      self._nativeSelect.css({
        height: self._button.outerHeight()
      });

      self._nativeSelect.on('change.select', self._handleNativeSelect.bind(self));

      self._nativeSelect.on('focusin.nativeselect', function () {
        self._button.addClass('is-focused');
      });

      self._nativeSelect.on('focusout.nativeselect', function (e) {
        self._button.removeClass('is-focused');
      });
    },

    /**
     * Creates SelectList and initially syncs with native &lt;select&gt;
     *
     * @private
     */
    _createSelectList : function () {
      var self = this,
          type = 'static';

      // if the element is not there, create it
      if (this._selectList.length === 0) {
        this._selectList = $('<ul/>', {
          'id': CUI.util.getNextId(),
          'class': 'coral-SelectList'
        }).appendTo(this.$element);
      } else if (!this._selectList.attr('id')) {
        this._selectList.attr('id', CUI.util.getNextId());
      }

      // read values from markup
      if (this._nativeSelect.length > 0) {
        this._parseMarkup();
      } else { // if no <select> wa found then a dynamic list is expected
        type = 'dynamic';
      }

      this._selectList.selectList($.extend({
        relatedElement: this._button,
        type: type
      }, this.options.selectlistConfig || {}));

      this._selectListWidget = this._selectList.data('selectList');

      this._selectList
        .on("itemadded", this._addItemToSelect.bind(this))
        .on("itemremoved", function (e) {
          var values;

          if (e.item instanceof CUI.SelectList.Group) {
            values = e.item.getItems().map(function(option) { return option.getValue(); });
          } else {
            values = [e.item.getValue()];
          }

          self._deselect(values);
          self._removeItemFromSelect(e);
        });
    },

    /**
     * Event handler, which acts on element insertions to SelectList and updates
     * &lt;select&gt; accordingly.
     *
     * @private
     */
    _addItemToSelect : function (e) {
      var node;
      if (e.item instanceof CUI.SelectList.Option) {
        node = $("<option>");
        node.attr("value", e.item.getValue());
      }
      else if (e.item instanceof CUI.SelectList.Group) {
        node = $("<optgroup>");
      }
      else {
        // something went wrong.
        return;
      }

      node.text(e.item.getDisplay());


      var parentNode = this._nativeSelect;

      if (e.target != this._selectList.get(0)) {
        // Event occured on nested option, find matching optgroup!
        parentNode = parentNode.children().eq($(e.target).closest(".coral-SelectList-item--optgroup").index());
      }

      var position = e.item.getPosition();

      if (position >= parentNode.children().length) {
        parentNode.append(node);
      }
      else if (position === 0) {
        parentNode.prepend(node);
      }
      else {
        parentNode.children().eq(position).before(node);
      }
    },

    /**
     * Event handler, which acts on element removal from SelectList and updates
     * &lt;select&gt; accordingly.
     *
     * @private
     */
    _removeItemFromSelect : function (e) {
      var parentNode = this._nativeSelect;

      if (e.target != this._selectList.get(0)) {
        // Event occured on nested option, find matching optgroup!
        parentNode = parentNode.children().eq($(e.target).closest(".coral-SelectList-item--optgroup").index());
      }

      parentNode.children().eq(e.item.getPosition()).remove();
    },

    /**
     * Creates SelectList if necessary and populates it with the given data. It
     * also binds the button to the SelectList, such that a click on the button
     * toggles the SelectList visibility.
     *
     * @private
     */
    _prepareSelectListForInteraction : function () {
      var self = this;

      this._button.attr({
        'data-toggle': 'selectlist',
        'data-target': '#' + this._selectList.attr('id')
      });

      this._selectList
        // receive the value from the list
        .on('selected.select', this._handleSelectedFromSelectList.bind(this))
        // handle open/hide for the button
        .on('show.select hide.select', function (event) {
          if(event.type !== 'show') {
            self._button.removeClass('is-above is-below');
          }
          self._button.toggleClass('is-active', event.type === 'show');
        });
    },

    /**
     * Handles a native change event on the select
     * @fires Select#selected
     * @private
     */
    _handleNativeSelect: function (event) {
      var self = this,
        selected, selectedElem;

      if (self.options.multiple) {
        // loop over all options
        $.each(self._nativeSelect[0].options, function (i, opt) {
          if (opt.selected) {
            self._tagListWidget.addItem({
              value: opt.value,
              display: opt.text
            });
          } else {
            self._tagListWidget.removeItem(opt.value);
          }
        });

        selected = self._tagListWidget.getValues();
      } else if (self._nativeSelect[0]) {

        selectedElem = self._nativeSelect[0][self._nativeSelect[0].selectedIndex];

        self._buttonText.text(selectedElem ? selectedElem.text : '');

        selected = selectedElem ? selectedElem.value : null;
      }

      if (event) {
        this.$element.trigger($.Event('selected', {
          selected: selected
        }));
      }
    },

    /**
     * Selects options within the native select element using the provided values and deselects any options
     * not matching the provided values.
     * @param selectedValues The values for which options should be selected.
     * @private
     */
    _syncSelectionToNativeSelect: function (selectedValues) {
      if (this._nativeSelect.length) {
        $.each(this._nativeSelect[0].options, function (i, option) {
          option.selected = selectedValues.indexOf(option.value) > -1;
        });
      }
    },

    /**
     * Selects options within the SelectList using the provided values and deselects any options
     * not matching the provided values.
     * @param selectedValues The values for which options should be selected.
     * @private
     */
    _syncSelectionToSelectList: function (selectedValues) {
      if (this._selectList.length) {
        $.each(this._selectList.find(this._selectListWidget._SELECTABLE_SELECTOR), function (i, option) {
          var $option = $(option);
          $option.attr('aria-selected', selectedValues.indexOf($option.attr('data-value')) > -1);
        });
      }
    },

    /**
     * this function parses the values from the native select
     * and prints the right markup for the SelectList widget
     * This function may only be called in SelectList widget mode.
     * @private
     */
    _parseMarkup: function () {
      var self = this,
        optgroup = this._nativeSelect.children('optgroup');

      function parseGroup(parent, dest) {
        parent.children('option').each(function (i, e) {
          var opt = $(e);

          $('<li/>', {
            'class': 'coral-SelectList-item coral-SelectList-item--option',
            'data-value': opt.val(),
            'text': opt.text()
          }).appendTo(dest);
        });
      }

      // optgroups are part of the select -> different markup
      if (optgroup.length > 0) {
        optgroup.each(function (i, e) {
          var group = $(e),
            entry = $('<li/>', {
              'class': 'coral-SelectList-item coral-SelectList-item--optgroup'
            }).append($('<span/>', {
              'class': 'coral-SelectList-groupHeader',
              'text': group.attr('label')
            }));

          parseGroup(group, $('<ul/>', {
            'class': 'coral-SelectList-sublist'
          }).appendTo(entry));

          self._selectList.append(entry);
        });
      } else { // flat select list
        parseGroup(this._nativeSelect, this._selectList);
      }
    },

    /**
     * sets a tag list for the multiple selection
     * @private
     */
    _setTagList: function () {
      var self = this;

      // if the element is not there, create it
      if (this._tagList.length === 0) {
        this._tagList = $('<ol/>', {
          'class': 'coral-TagList'
        }).appendTo(this.$element);
      }

      this._tagList.tagList(this.options.tagConfig || {});

      this._tagListWidget = this._tagList.data('tagList');

      this._tagList.on('itemremoved', function (ev, data) {
        var selectedValues = self._tagListWidget.getValues();
        self._syncSelectionToNativeSelect(selectedValues);
        self._syncSelectionToSelectList(selectedValues);
      });

      // Load selected values from markup
      this._handleNativeSelect();
    },

    _handleSelectedFromSelectList: function(e) {
      // we stop the propagation because the component itself provides a selected event too
      if (e) {
        e.stopPropagation();
      }

      this._selectListWidget.hide();

      this._select(e.selectedValue, e.displayedValue);

      this._button.trigger('focus');

      this.$element.trigger($.Event('selected', {
        selected: this.getValue()
      }));
    },

    /**
     * Select an item.
     * @param value The value of the item to be selected.
     * @param display The display text for the item to be selected.
     * @private
     */
    _select: function (value, display) {
      var newSelectedValues;

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          value: value,
          display: display
        });
        newSelectedValues = this._tagListWidget.getValues();
      } else {
        // set the button label
        this._buttonText.text(display);
        // in case it is dynamic a value input should be existing
        this._valueInput.val(value);
        newSelectedValues = ['' + value];
      }

      this._syncSelectionToNativeSelect(newSelectedValues);
      this._syncSelectionToSelectList(newSelectedValues);
    },

    /**
     * Deselects an item.
     * @param value The value of the item to be deselected.
     * @private
     */
    _deselect: function (values) {
      var self = this,
        newSelectedValues;

      if (this.options.multiple) {
        values.forEach(function(value) {
            self._tagListWidget.removeItem(value);
        });
        newSelectedValues = this._tagListWidget.getValues();
      } else {
        // If the selected value is being deselected, select the first option that's not being deselected if one exists.
        if (values.indexOf(this.getValue()) > -1) {
          var newSelectedOption = this._getFirstOptionWithoutValues(this._getAllOptions(), values),
            newValue,
            newDisplay;

          if (newSelectedOption) {
            newValue = newSelectedOption.getValue();
            newDisplay = newSelectedOption.getDisplay();
            newSelectedValues = [newValue];
          } else {
            newValue = '';
            newDisplay = '';
            newSelectedValues = [];
          }

          this._buttonText.text(newDisplay);
          this._valueInput.val(newValue);
        }
      }

      if (newSelectedValues) {
        this._syncSelectionToNativeSelect(newSelectedValues);
        this._syncSelectionToSelectList(newSelectedValues);
      }
    },

    /**
     * Gets the first option that does not have a value equal to those within an array of provided values.
     * @param {Array} options The options to search through.
     * @param {Array} values A blacklist of values.
     * @returns {CUI.SelectList.Option}
     * @private
     */
    _getFirstOptionWithoutValues: function (options, values) {
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (values.indexOf(option.getValue()) === -1) {
          return option;
        }
      }
    },

    /**
     * Retrieves all options as an array of CUI.SelectList.Option objects.
     * Possibly move this up to CUI.SelectList when/if others need it?
     * @returns {Array}
     * @private
     */
    _getAllOptions: function () {
      var items = this.getItems();
      var options = [];

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item instanceof CUI.SelectList.Group) {
          options = options.concat(item.getItems());
        } else {
          options.push(item);
        }
      }

      return options;
    }
  });

  CUI.Widget.registry.register("select", CUI.Select);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (e) {
      CUI.Select.init($('[data-init~=select]', e.target));
    });
  }

  /**
   * Triggered when option was selected
   *
   * @name CUI.Select#selected
   * @event
   *
   * @param {Object} event Event object
   * @param {String|Array} event.selected value which was selected
   *
   */

}(jQuery, this));

(function ($) {

  // Instance id counter:
  var datepicker_guid = 0;

  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A datepicker widget

     <pre>
     Currently there are the following data options:
     data-init="datepicker"         Inits the datepicker widget after page load
     data-disabled                  Sets field to "disabled" if given (with any non-empty value)
     data-required                  Sets field to "required" if given (with any non-empty value)
     data-stored-format             Sets the format of the date for transferring it to the server
     data-displayed-format          Sets the format of the date for displaying it to the user
     data-force-html-mode           Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     data-day-names                 JSON-array-data with the short names of all week days, starting with Sunday
     data-month-names               JSON-array-data with the names of all months, starting with January
     data-head-format               Defines headline format, default is "MMMM YYYY".
     data-start-day                 Defines the start day of the week, 0 = Sunday, 1 = Monday, etc.

     Additionally the type (date, time, datetime) and value are read from the &lt;input&gt; field.
     </pre>

     @desc Creates a datepicker from a div element
     @constructs

     @param {Object}  options                                                     Component options
     @param {Array}   [options.monthNames=english names]                          Array of strings with the name for each month with January at index 0 and December at index 11
     @param {Array}   [options.dayNames=english names]                            Array of strings with the name for each weekday with Sun at index 0 and Sat at index 6
     @param {String}  [options.type="date"]                                       Type of picker, supports date, datetime, datetime-local and time
     @param {integer} [options.startDay=0]                                        Defines the start day for the week, 0 = Sunday, 1 = Monday etc.
     @param {boolean} [options.disabled=false]                                    Is this widget disabled?
     @param {String}  [options.displayedFormat="YYYY-MM-DD[T]HH:mm[Z]"]           Displayed date (userfriendly), default is 2012-10-20 20:35
     @param {String}  [options.storedFormat="YYYY-MM-DD[T]HH:mmZ"]                Storage Date format, is never shown to the user, but transferred to the server
     @param {String}  [options.required=false]                                    Is a value required?
     @param {String}  [options.hasError=false]                                    True to display widget as erroneous, regardless if the value is required or not.
     @param {String}  [options.minDate]                                           Defines the start date of selection range. Dates earlier than minDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.maxDate]                                           Defines the end date of selection range. Dates later than maxDate are not selectable.
     It must be expressed in officialDateFormat (YYYY-MM-DD) or as "today".
     @param {String}  [options.headFormat="MMMM YYYY"]                            Defines calendar headline format, default is "MMMM YYYY"
     @param {boolean} [options.forceHTMLMode=false]                               Force to HTML mode and never use a native Date widget, if given (with any non-empty value)
     @param {String}  [options.selectedDateTime]                                  Defines what date/time will be selected when the calendar is rendered. If nothing is specified it will be
     considerend today or current time.
     */

    defaults: {
      monthNames: null,
      dayNames: null,
      format: null,
      type: "date",
      selectedDateTime: null,
      startDay: 0,
      disabled: false,
      displayedFormat: null,
      storedFormat: null,
      headFormat: "MMMM YYYY",
      forceHTMLMode: false,
      required: false,
      hasError: false,
      minDate: null,
      maxDate: null
    },

    displayDateTime: null,
    pickerShown: false,

    construct: function () {
      this.guid = (datepicker_guid += 1);
      this._readOptionsFromMarkup();
      this._parseOptions();
      this._setupMomentJS();
      this._adjustMarkup();
      this._findElements();
      this._constructPopover();
      this._initialize();
    },

    _readOptionsFromMarkup: function () {
      var options = this.options;
      var element = this.$element;
      var $input = $(element.find("input").filter("[type^=date],[type=time]"));
      if ($input.length !== 0) {
        options.type = $input.attr("type");
      }

      [
        [ "disabled", "disabled", asBoolean ],
        [ "required", "required", asBoolean ],
        [ "displayed-format", "displayedFormat", ifDefined],
        [ "stored-format", "storedFormat", ifDefined],
        [ "force-html-mode", "forceHTMLMode", ifDefined],
        [ "day-names", "dayNames", ifTruthy],
        [ "month-names", "monthNames", ifTruthy ],
        [ "head-format", "headFormat", ifTruthy],
        [ "start-day", "startDay", asNumber],
        [ "min-date", "minDate", ifDefined],
        [ "max-date", "maxDate", ifDefined]
      ].map(function (attr) {
          var name = attr[0], field = attr[1], processor = attr[2];
          processor(element.data(name), field, options);
        });
    },

    _parseOptions: function () {
      var options = this.options;
      options.monthNames = options.monthNames || CUI.Datepicker.monthNames;
      options.dayNames = options.dayNames || CUI.Datepicker.dayNames;

      options.isDateEnabled =
        (options.type === "date") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      options.isTimeEnabled =
        (options.type === "time") ||
          (options.type === "datetime") ||
          (options.type === "datetime-local");

      var i = document.createElement("input");
      i.setAttribute("type", options.type);
      options.supportsInputType = i.type !== "text";

      if (options.minDate !== null) {
        if (options.minDate === "today") {
          options.minDate = moment().startOf("day");
        } else {
          if (moment(options.minDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.minDate = moment(options.minDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.minDate = null;
          }
        }
      }

      if (options.maxDate !== null) {
        if (options.maxDate === "today") {
          options.maxDate = moment().startOf("day");
        } else {
          if (moment(options.maxDate, OFFICIAL_DATE_FORMAT).isValid()) {
            options.maxDate = moment(options.maxDate, OFFICIAL_DATE_FORMAT);
          } else {
            options.maxDate = null;
          }
        }
      }

      options.storedFormat = options.storedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : OFFICIAL_DATETIME_FORMAT);
      options.displayedFormat = options.displayedFormat || (options.type === "time" ? OFFICIAL_TIME_FORMAT : DISPLAY_FORMAT);
      options.useNativeControls = options.forceHTMLMode;

      if ((!options.forceHTMLMode) &&
        IS_MOBILE_DEVICE &&
        options.supportsInputType) {
        options.useNativeControls = true;
      }

      // If HTML5 input is used, then force to use the official format.
      if (options.useNativeControls) {
        if (options.type === 'date') {
          options.displayedFormat = OFFICIAL_DATE_FORMAT;
        } else if (options.type === 'time') {
          options.displayedFormat = OFFICIAL_TIME_FORMAT;
        } else {
          options.displayedFormat = OFFICIAL_DATETIME_FORMAT;
        }
      }
    },

    _setupMomentJS: function () {
      // Generate a language name for this picker to not overwrite any existing
      // moment.js language definition
      this.options.language = LANGUAGE_NAME_PREFIX + new Date().getTime();

      moment.lang(this.options.language, {
        months: this.options.monthNames,
        weekdaysMin: this.options.dayNames
      });
    },

    _adjustMarkup: function () {
      var $element = this.$element;

      if (!this.options.useNativeControls) {
        var id = "popguid" + this.guid;
        var idQuery = "#" + id + ".coral-Popover";
        this.$popover = $('body').find(idQuery);
        if (this.$popover.length === 0) {
          $('body').append(HTML_POPOVER.replace("%ID%", id));
          this.$popover = $('body').find(idQuery);
          if (this.options.isDateEnabled) {
            this.$popover.find(".coral-Popover-content").append(HTML_CALENDAR);
          }
        }
      } else {
        // Show native control
        this.$popover = [];
      }

      var $hiddenInput = $element.find("input[type=hidden]");

      // Always include hidden field
      if ($hiddenInput.length === 0) {
        // We prepend otherwise the InputGroup will not give round corners to the button last button
        $element.prepend("<input type=\"hidden\">");
      } else {
        // Moves it to the beginning
        $element.prepend($hiddenInput);
      }

      if (!$element.find("input[type=hidden]").attr("name")) {
        var name = $element.find("input").not("[type=hidden]").attr("name");
        $element.find("input[type=hidden]").attr("name", name);
        $element.find("input").not("[type=hidden]").removeAttr("name");
      }
    },

    _findElements: function () {
      this.$input = this.$element.find('input').not("[type=hidden]");
      this.$hiddenInput = this.$element.find('input[type=hidden]');
      this.$openButton = this.$element.find('button');
    },

    _constructPopover: function () {
      if (this.$popover.length) {
        this.popover = new Popover({
          $element: this.$popover,
          $trigger: this.$openButton,
          options: this.options,
          setDateTimeCallback: this._popoverSetDateTimeCallback.bind(this),
          hideCallback: this._popoverHideCallback.bind(this)
        });
      }
    },

    _initialize: function () {
      if (this.options.useNativeControls) {
        this.displayDateTime = this.options.selectedDateTime = moment(this.$input.val(), this.options.displayedFormat);
        this.$openButton.hide();
      } else {
        this._switchInputTypeToText(this.$input);
      }

      if (!this.options.disabled) {
        this.$openButton.on('click', this._clickHandler.bind(this));
        this.$input.on("change" + (IS_MOBILE_DEVICE ? " blur" : ""), this._inputChangedHandler.bind(this));
      }

      // Reading input value for the first time. There may be a storage format:
      if (!this.options.selectedDateTime) {
        this._readInputVal([this.options.storedFormat, this.options.displayedFormat]);
      }

      // Set the selected date and time:
      this._setDateTime(this.options.selectedDateTime, true);
    },

    _readInputVal: function (format) {
      var value = this.$input.eq(0).val();
      if (value !== '') {
        var date = moment(value, format || this.options.displayedFormat);
        if (!date || !date.isValid()) {
          // Fallback: Try automatic guess if none of our formats match
          date = moment(value);
        }
        this.displayDateTime = this.options.selectedDateTime = date;
        if (date !== null && date.isValid()) {
          this.displayDateTime = this.options.selectedDateTime = date;
        }
      } else {
        this.displayDateTime = null;
      }
    },

    _updateState: function () {
      if (this.options.disabled) {
        this.$element.find("input,button").attr("disabled", "disabled");
        this._hidePicker();
      } else {
        this.$element.find("input,button").removeAttr("disabled");
      }

      if (this.options.hasError ||
        (!this.options.selectedDateTime && this.options.required) ||
        (this.options.selectedDateTime && !this.options.selectedDateTime.isValid())
        ) {
        this.$element.addClass("is-invalid");
        this.$element.find("input").addClass("is-invalid");
      } else {
        this.$element.removeClass("is-invalid");
        this.$element.find("input").removeClass("is-invalid");
      }
    },

    _popoverSetDateTimeCallback: function () {
      this._setDateTime.apply(this, arguments);
      if (this.options.isTimeEnabled === false) {
        this._hidePicker();
      }
    },

    _popoverHideCallback: function () {
      this.pickerShown = false;
      this.$element.find("input").removeClass("is-highlighted");
    },

    _switchInputTypeToText: function ($input) {
      var $parent = $input.parent();
      $input.detach().attr('type', 'text').prependTo($parent);
    },

    _openNativeInput: function () {
      this.$input.trigger("click");
    },

    _clickHandler: function (event) {
      if (this.pickerShown) {
        this._hidePicker();
      } else {
        // The time-out is a work-around for CUI.Popover issue #1307. Must
        // be taken out once that is fixed:
        var self = this;
        setTimeout(function () {
          self._openPicker();
        }, 100);
      }
    },

    _inputChangedHandler: function () {
      if (this.options.disabled) {
        return;
      }

      var newDate;
      if (this.$input.val() !== '') {
        newDate = moment(this.$input.val(), this.options.displayedFormat);
        this.options.hasError = newDate !== null && !isDateInRange(newDate, this.options.minDate, this.options.maxDate);
      } else {
        this.options.hasError = false;
      }
      this._setDateTime(newDate, true); // Set the date, but don't trigger a change event
    },

    _keyPress: function () {
      if (this.pickerShown) {
        // TODO: Keyboard actions
      }
    },

    _openPicker: function () {
      if (this.options.useNativeControls) {
        this._openNativeInput();
      } else {
        this._readInputVal();
        this._showPicker();
      }
    },

    _showPicker: function () {
      if (!this.pickerShown) {
        this.$element.find("input").addClass("is-highlighted");
        this.popover.show(this.displayDateTime);
        this.pickerShown = true;
      }
    },

    _hidePicker: function () {
      if (this.pickerShown) {
        this.$element.find("input").removeClass("is-highlighted");
        this.popover.hide();
        this.pickerShown = false;
      }
    },

    /**
     * Sets a new datetime object for this picker
     * @private
     */
    _setDateTime: function (date, silent) {
      this.options.selectedDateTime = this.displayDateTime = date;

      if (!date) {
        this.$input.val(""); // Clear for null values
      } else if (date.isValid()) {
        this.$input.val(date.lang(this.options.language).format(this.options.displayedFormat)); // Set only valid dates
      }

      var storage = (date && date.isValid()) ? date.lang('en').format(this.options.storedFormat) : ""; // Force to english for storage format!
      this.$hiddenInput.val(storage);

      this._updateState();

      // Trigger a change even on the input
      if (!silent) {
        this.$input.trigger('change');
      }

      // Always trigger a change event on the hidden input, since we're not listening to it internally
      this.$hiddenInput.trigger('change');
    }
  });

  CUI.Datepicker.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  CUI.Datepicker.dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  CUI.Widget.registry.register("datepicker", CUI.Datepicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Datepicker.init($("[data-init~=datepicker]", e.target));
    });
  }

  /**
   * Governs the generation and the interaction of the calendar and
   * time selects.
   *
   * @private
   */
  var Popover = new Class({
    toString: 'Popover',
    extend: Object,

    construct: function (options) {
      this.$element = options.$element;
      this.options = options.options;
      this.setDateTimeCallback = options.setDateTimeCallback;
      this.hideCallback = options.hideCallback;

      this.$element.popover();
      this.popover = this.$element.data("popover");
      this.popover.set({
        pointAt: options.$trigger,
        pointFrom: "bottom"
      });

      this._setupListeners();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be shown.
     */
    show: function (displayDateTime) {
      this.displayDateTime = displayDateTime;
      this._renderCalendar();
      if (this.options.isTimeEnabled) {
        this._renderTime();
      }
      this.popover.show();
    },

    /**
     * Public to CUI.Datepicker.
     * Allows the main component to request the calendar pop-up to be hidden.
     */
    hide: function () {
      this.popover.hide();
    },

    /**
     * Register event handlers.
     *
     * @private
     */
    _setupListeners: function () {

      // Pop show-hide:
      this.popover.on("hide", this._popupHideHandler.bind(this));

      // Calendar navigation
      this.$element.find(".coral-DatePicker-calendar").on("swipe", this._swipeHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-nextMonth", this._mouseDownNextHandler.bind(this));
      this.$element.on("mousedown", ".coral-DatePicker-prevMonth", this._mouseDownPrevHandler.bind(this));

      if (this.options.isTimeEnabled) {
        // for Desktop
        this.$element.on("selected", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
        // for Mobile
        this.$element.on("change", ".coral-DatePicker-hour, .coral-DatePicker-minute", this._dropdownChangedHandler.bind(this));
      }
    },

    _popupHideHandler: function (event) {
      this.hideCallback();
    },

    _swipeHandler: function (event) {
      var d = event.direction,
        year = this.displayDateTime.year(),
        month = this.displayDateTime.month();

      if (d === "left") {
        this.displayDateTime = normalizeDate(moment([year, month + 1, 1]));
        this._renderCalendar("left");
      } else if (d === "right") {
        this.displayDateTime = normalizeDate(moment([year, month - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _mouseDownNextHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() + 1, 1]));
        this._renderCalendar("left");
      }
    },

    _mouseDownPrevHandler: function (event) {
      event.preventDefault();
      if (this.displayDateTime) {
        this.displayDateTime = normalizeDate(moment([this.displayDateTime.year(), this.displayDateTime.month() - 1, 1]));
        this._renderCalendar("right");
      }
    },

    _dropdownChangedHandler: function () {
      var hours = this._getHoursFromDropdown();
      var minutes = this._getMinutesFromDropdown();
      if (!this.options.selectedDateTime) {
        this.options.selectedDateTime = moment();
      }
      var date = this.options.selectedDateTime.hours(hours).minutes(minutes);
      this.setDateTimeCallback(date);
    },

    _tableMouseDownHandler: function (event) {
      event.preventDefault();
      var date = moment($(event.target).data("date"), OFFICIAL_DATETIME_FORMAT);
      if (this.options.isTimeEnabled) {
        var h = this._getHoursFromDropdown();
        var m = this._getMinutesFromDropdown();
        date.hours(h).minutes(m);
      }
      this.setDateTimeCallback(date);
      this._renderCalendar();
    },

    _renderCalendar: function (slide) {
      var displayDateTime = this.displayDateTime;
      if (!displayDateTime || !displayDateTime.isValid()) {
        this.displayDateTime = displayDateTime = moment();
      }

      var displayYear = displayDateTime.year();
      var displayMonth = displayDateTime.month() + 1;

      var table = this._renderOneCalendar(displayMonth, displayYear);

      var $calendar = this.$element.find(".coral-DatePicker-calendar");

      table.on("mousedown", "a", this._tableMouseDownHandler.bind(this));

      if ($calendar.find("table").length > 0 && slide) {
        this._slideCalendar(table, (slide === "left"));
      } else {
        $calendar.find("table").remove();
        $calendar.find(".coral-DatePicker-calendarSlidingContainer").remove();
        $calendar.find(".coral-DatePicker-calendarBody").append(table);
      }
    },

    _renderOneCalendar: function (month, year) {
      var heading = moment([year, month - 1, 1]).lang(this.options.language).format(this.options.headFormat);
      var title = $('<div class="coral-DatePicker-calendarHeader"><h2 class="coral-Heading coral-Heading--2">' + heading + '</h2></div>').
        append($("<button class=\"coral-MinimalButton coral-DatePicker-nextMonth\">&#x203A;</button>")).
        append($("<button class=\"coral-MinimalButton coral-DatePicker-prevMonth\">&#x2039;</button>"));
      var $calendar = this.$element.find(".coral-DatePicker-calendar");
      var header = $calendar.find(".coral-DatePicker-calendarHeader");
      if (header.length > 0) {
        header.replaceWith(title);
      } else {
        $calendar.prepend(title);
      }

      var table = $("<table>");
      table.data("date", year + "/" + month);

      var html = "<tr>";
      var day = null;
      for (var i = 0; i < 7; i++) {
        day = (i + this.options.startDay) % 7;
        var dayName = this.options.dayNames[day];
        html += "<th><span>" + dayName + "</span></th>";
      }
      html += "</tr>";
      table.append("<thead>" + html + "</thead>");

      var firstDate = moment([year, month - 1, 1]);
      var monthStartsAt = (firstDate.day() - this.options.startDay) % 7;
      if (monthStartsAt < 0) monthStartsAt += 7;

      html = "";
      var today = moment();

      for (var w = 0; w < 6; w++) {
        html += "<tr>";
        for (var d = 0; d < 7; d++) {
          day = (w * 7 + d) - monthStartsAt + 1;
          var displayDateTime = moment([year, month - 1, day]);
          var isCurrentMonth = (displayDateTime.month() + 1) === parseFloat(month);
          var cssClass = "";

          if (isSameDay(displayDateTime, today)) {
            cssClass += " today";
          }

          if (isSameDay(displayDateTime, this.options.selectedDateTime)) {
            cssClass += " selected";
          }

          if (isCurrentMonth && isDateInRange(displayDateTime, this.options.minDate, this.options.maxDate)) {
            html += "<td class=\"" + cssClass + "\"><a href=\"#\" data-date=\"" + displayDateTime.lang(this.options.language).format(OFFICIAL_DATETIME_FORMAT) + "\">" + displayDateTime.date() + "</a></td>";
          } else {
            html += "<td class=\"" + cssClass + "\"><span>" + displayDateTime.date() + "</span></td>";
          }
        }
        html += "</tr>";
      }
      table.append("<tbody>" + html + "</tbody>");

      return table;
    },

    _slideCalendar: function (newtable, isLeft) {

      var containerClass = "coral-DatePicker-calendarSlidingContainer";
      this.$element.find(".coral-DatePicker-calendarSlidingContainer table").stop(true, true);
      this.$element.find(".coral-DatePicker-calendarSlidingContainer").remove();

      var oldtable = this.$element.find("table");
      var width = oldtable.width();
      var height = oldtable.height();

      var container = $("<div class=\"coral-DatePicker-calendarSlidingContainer\">");

      container.css({"display": "block",
        "position": "relative",
        "width": width + "px",
        "height": height + "px",
        "overflow": "hidden"});

      this.$element.find(".coral-DatePicker-calendarBody").append(container);
      container.append(oldtable).append(newtable);
      oldtable.css({"position": "absolute", "left": 0, "top": 0});
      oldtable.after(newtable);
      newtable.css({"position": "absolute", "left": (isLeft) ? width : -width, "top": 0});

      oldtable.animate({"left": (isLeft) ? -width : width}, TABLE_ANIMATION_SPEED, function () {
        oldtable.remove();
      });

      newtable.animate({"left": 0}, TABLE_ANIMATION_SPEED, function () {
        if (container.parents().length === 0) {
          // We already were detached!
          return;
        }
        newtable.css({"position": "relative", "left": 0, "top": 0});
        newtable.detach();
        this.$element.find(".coral-DatePicker-calendarBody").append(newtable);
        container.remove();
      }.bind(this));
    },

    _renderTime: function () {

      var selectedTime = this.options.selectedDateTime;
      var html = $(HTML_CLOCK_ICON);

      // Hours
      var hourSelect = $('<select class="coral-Select-select"></select>');
      for (var h = 0; h < 24; h++) {
        var hourOption = $('<option>' + padSingleDigit(h) + '</option>');
        if (selectedTime && h === selectedTime.hours()) {
          hourOption.attr('selected', 'selected');
        }
        hourSelect.append(hourOption);
      }
      var hourDropdown = $(HTML_HOUR_DROPDOWN).append(hourSelect);

      // Minutes
      var minuteSelect = $('<select class="coral-Select-select"></select>');
      for (var m = 0; m < 60; m++) {
        var minuteOption = $('<option>' + padSingleDigit(m) + '</option>');
        if (selectedTime && m === selectedTime.minutes()) {
          minuteOption.attr('selected', 'selected');
        }
        minuteSelect.append(minuteOption);
      }
      var minuteDropdown = $(HTML_MINUTE_DROPDOWN).append(minuteSelect);

      $(hourDropdown).css(STYLE_POSITION_RELATIVE);
      $(hourDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);
      $(minuteDropdown).css(STYLE_POSITION_RELATIVE);
      $(minuteDropdown).find('coral-Select').css(STYLE_DROPDOWN_SELECT);

      html.append(hourDropdown, $("<span>:</span>"), minuteDropdown);

      if (this.$element.find(".coral-DatePicker-timeControls").length === 0) {
        this.$element.find(".coral-Popover-content").append(html);
      } else {
        this.$element.find(".coral-DatePicker-timeControls").empty().append(html.children());
      }

      // Set up dropdowns
      $(hourDropdown).select();
      $(minuteDropdown).select();
    },

    _getHoursFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-hour .coral-Select-select').val(), 10);
    },

    _getMinutesFromDropdown: function () {
      return parseInt(this.$element.find('.coral-DatePicker-timeControls .coral-DatePicker-minute .coral-Select-select').val(), 10);
    }

  });

  /**
   * Static
   */

  function padSingleDigit(s) {
    if (s < 10) return "0" + s;
    return s;
  }

  function ifDefined(value, field, options) {
    if (value !== undefined) {
      options[field] = value;
    }
  }

  function asBoolean(value, field, options) {
    options[field] = value ? true : false;
  }

  function ifTruthy(value, field, options) {
    options[field] = value || options[field];
  }

  function asNumber(value, field, options) {
    if (value !== undefined) {
      options[field] = value * 1;
    }
  }

  function normalizeDate(date) {
    if (!date) return null;
    return moment([date.year(), date.month(), date.date()]);
  }

  function isDateInRange(date, startDate, endDate) {
    if (startDate === null && endDate === null) {
      return true;
    }
    if (startDate === null) {
      return date <= endDate;
    } else if (endDate === null) {
      return date >= startDate;
    } else {
      return (startDate <= date && date <= endDate);
    }
  }

  function isSameDay(d1, d2) {
    if (d1 && d2) {
      return d1.year() === d2.year() && d1.month() === d2.month() && d1.date() === d2.date();
    }
  }

  var
    IS_MOBILE_DEVICE = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i),
    OFFICIAL_DATE_FORMAT = 'YYYY-MM-DD',
    OFFICIAL_TIME_FORMAT = 'HH:mm',
    OFFICIAL_DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mmZ',
    DISPLAY_FORMAT = 'YYYY-MM-DD HH:mm',
    LANGUAGE_NAME_PREFIX = 'coralui_',

    HTML_CALENDAR = [
      '<div class="coral-DatePicker-calendar">',
      '<div class="coral-DatePicker-calendarHeader"></div>',
      '<div class="coral-DatePicker-calendarBody"></div>',
      '</div>'
    ].join(''),
    HTML_POPOVER = [
      '<div class="coral-Popover coral-Popover--datepicker" style="display:none" id="%ID%">',
      '<div class="coral-Popover-content"></div>',
      '</div>'
    ].join(''),

    HTML_CLOCK_ICON = '<div class="coral-DatePicker-timeControls"><i class="coral-Icon coral-Icon--clock coral-Icon--small"></i></div>',
    HTML_HOUR_DROPDOWN = '<div class="coral-Select coral-DatePicker-hour"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',
    HTML_MINUTE_DROPDOWN = '<div class="coral-Select coral-DatePicker-minute"><button class="coral-Select-button coral-MinimalButton"><span class="coral-Select-button-text"></span></button></div>',

    STYLE_POSITION_RELATIVE = {
      'position': 'relative'
    },
    STYLE_DROPDOWN_SELECT = {
      'position': 'absolute',
      'left': '1.5rem',
      'top': '1rem'
    },

    TABLE_ANIMATION_SPEED = 400;

}(window.jQuery));
