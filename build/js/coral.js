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
      // Store options
      this.options = $.extend({}, typeof this.defaults === 'object' && this.defaults, options);

      // Store jQuery object
      this.$element = $(options.element);

      // Add instance to element's data
      this.$element.data(CUI.util.decapitalize(this.toString()), this);

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
            $item[CUI.util.decapitalize(Widget.toString())]();
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

  CUI.util.plugClass(CUI.Alert);

  // Data API
  if (CUI.options.dataAPI) {
    $(function () {
      $('body').fipo('tap.alert.data-api', 'click.alert.data-api', '[data-dismiss="alert"]', function (evt) {
        $(evt.currentTarget).parent().hide();
        evt.preventDefault();
      });
    });
  }
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
        var value = this.getValue();
        value += this.getStep();
        value = value > this.getMax() ? this.getMax() : value;
        this.setValue(value);
      }
    },

    /**
     Decrements value by step amount
     */
    decrement: function () {
      var value = this.getValue();
      value -= this.getStep();
      value = value < this.getMin() ? this.getMin() : value;
      this.setValue(value);
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
    },

    /**
     Sets the maximum value allowed.
     @param value {numberic} The max value to set.
     */
    setMax: function (value) {
      this.set('max', value);
    },


    /**
     Sets the step value for increment and decrement.
     @param value {numberic} The step value to set.
     */
    setStep: function (value) {
      this.set('step', value);
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
      // get the input, fix it if it's number
      this.$input = this.$element.find('.js-coral-NumberInput-input');
      if (this.$input.attr('type') != 'text') {
        this._switchInputTypeToText(this.$input);
      }

      this.$decrementElement = this.$element.find('.js-coral-NumberInput-decrementButton');
      this.$incrementElement = this.$element.find('.js-coral-NumberInput-incrementButton');
    },

    /** @ignore */
    _setListeners: function () {

      this.$input.on('change', function () {
        this._checkMinMaxViolation();
        this._adjustValueLimitedToRange();
      }.bind(this));

      this.on('beforeChange:step', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:min', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:max', function (event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('change:disabled', function (event) {
        this._toggleDisabled();
      }.bind(this));

      this.on('change:hasError', function (event) {
        this._toggleError();
      }.bind(this));

      this.$incrementElement.on('click', function () {
        this.increment();
      }.bind(this));

      this.$decrementElement.on('click', function (event) {
        this.decrement();
      }.bind(this));

    },

    /** @ignore */
    _setAttributes: function () {

      if (this.$input.attr('max')) {
        this.setMax(this.$input.attr('max'));
      }

      if (this.$input.attr('min')) {
        this.setMin(this.$input.attr('min'));
      }

      if (this.$input.attr('step')) {
        this.setStep(this.$input.attr('step'));
      }

      if (this.$element.attr("error")) {
        this.options.hasError = true;
      }

      this.setStep(this.options.step || CUI.Numberinput.step);

      this.setValue(this.$input.val() !== '' ? this.$input.val() : this.options.defaultValue);

      if (this.$element.attr('disabled') || this.$element.attr('data-disabled')) {
        this._toggleDisabled();
      }

      if (this.$element.hasClass('is-invalid') || this.$element.attr('data-error')) {
        this.set('hasError', true);
      }
    },

    /** @ignore */
    _adjustValueLimitedToRange: function () {
      var value = this.getValue();
      if (!isNaN(value)) {
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }
      }
      this.$input.val(value);
    },

    /** @ignore */
    _checkMinMaxViolation: function () {

      if (this._isNumber()) {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');

        if (this.options.max && this.getValue() >= this.getMax()) {
          this.$incrementElement.attr('disabled', 'disabled');
        } else if (this.options.min && this.getValue() <= this.getMin()) {
          this.$decrementElement.attr('disabled', 'disabled');
        }
      }
    },

    /** @ignore */
    _switchInputTypeToText: function ($input) {
      var convertedInput = $input.detach().attr('type', 'text');
      this.$element.prepend(convertedInput);
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
        this.$input.addClass('is-invalid');
      } else {
        this.$input.removeClass('is-invalid');
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
     the user clicks/taps outside the popover. When set to
     <code>true</code>, the popover will only close when the
     target element is clicked/tapped or <code>hide()</code> is
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
      this.$element.show().prop('aria-hidden', false);
      this._position();

      if (!this.options.preventAutoHide) {
        clearTimeout(this.autoHideInitTimeout);
        this.autoHideInitTimeout = setTimeout(function() {
          // Must watch touchstart because click events don't bubble as expected on iOS Safari.
          $(document).fipo('touchstart.popover-hide-' + this.uuid, ' click.popover-hide-' + this.uuid, function (e) {
            var el = this.$element.get(0);

            if (e.target !== el && !$.contains(el, e.target)) {
              this.hide();
            }
          }.bind(this));
        }.bind(this), 0);
      }
    },

    /** @ignore */
    _hide: function () {
      clearTimeout(this.autoHideInitTimeout);
      this.$element.hide().prop('aria-hidden', true);
      $(document).off('.popover-hide-' + this.uuid);
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
    }
  });

  CUI.Widget.registry.register("popover", CUI.Popover);

  $(function () {
    // Must watch touchstart because click events don't bubble as expected on iOS Safari.
    $(document).fipo('touchstart.popover.data-api', 'click.popover.data-api', '[data-toggle="popover"]',function (event) {
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
     * <h2 class="line">Examples</h2>
     *
     * <ul class="selectlist" data-init="selectlist">
     *     <li data-value="expr1">Expression 1</li>
     *     <li data-value="expr2">Expression 2</li>
     *     <li data-value="expr3">Expression 3</li>
     * </ul>
     *
     * <ul class="selectlist" data-init="selectlist" data-multiple="true">
     *     <li class="optgroup">
     *         <span>Group 1</span>
     *         <ul>
     *             <li data-value="expr1">Expression 1</li>
     *             <li data-value="expr2">Expression 2</li>
     *             <li data-value="expr3">Expression 3</li>
     *         </ul>
     *     </li>
     *     <li class="optgroup">
     *         <span>Group 2</span>
     *         <ul>
     *             <li data-value="expr4">Expression 4</li>
     *             <li data-value="expr5">Expression 5</li>
     *         </ul>
     *     </li>
     * </ul>
     *
     * @example
     * <caption>Instantiate with Class</caption>
     * var selectlist = new CUI.SelectList({
     *     element: '#mySelectList'
     * });
     *
     * // show the select list
     * selectlist.show();
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#mySelectList').selectList({
     *
     * });
     *
     * // jQuery style works as well for show/hide
     * $('#mySelectList').selectList('show');
     *
     * @example
     * <caption>Data API: Instantiate, set options, and show</caption>
     *
     * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot;&gt;
     *     &lt;li data-value=&quot;expr1&quot;&gt;Expression 1&lt;/li&gt;
     *     &lt;li data-value=&quot;expr2&quot;&gt;Expression 2&lt;/li&gt;
     *     &lt;li data-value=&quot;expr3&quot;&gt;Expression 3&lt;/li&gt;
     * &lt;/ul&gt;
     *
     * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot; data-multiple=&quot;true&quot;&gt;
     *     &lt;li class=&quot;optgroup&quot;&gt;
     *         &lt;span&gt;Group 1&lt;/span&gt;
     *         &lt;ul&gt;
     *             &lt;li data-value=&quot;expr1&quot;&gt;Expression 1&lt;/li&gt;
     *             &lt;li data-value=&quot;expr2&quot;&gt;Expression 2&lt;/li&gt;
     *             &lt;li data-value=&quot;expr3&quot;&gt;Expression 3&lt;/li&gt;
     *         &lt;/ul&gt;
     *     &lt;/li&gt;
     *     &lt;li class=&quot;optgroup&quot;&gt;
     *         &lt;span&gt;Group 2&lt;/span&gt;
     *         &lt;ul&gt;
     *             &lt;li data-value=&quot;expr4&quot;&gt;Expression 4&lt;/li&gt;
     *             &lt;li data-value=&quot;expr5&quot;&gt;Expression 5&lt;/li&gt;
     *         &lt;/ul&gt;
     *     &lt;/li&gt;
     * &lt;/ul&gt;
     *
     *
     * @example
     * <caption>Initialize with custom paramters to load remotely</caption>
     *
     * &lt;ul class=&quot;selectlist&quot; data-init=&quot;selectlist&quot; data-type=&quot;dynamic&quot; data-dataurl=&quot;remotehtml.html&quot;&gt;
     *
     * &lt;/ul&gt;
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
     * @param  {Function} [options.loadData] function to be called if more data is needed. This must not be used with a set dataurl.
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

        this.$element.on('scroll.selectlist-dynamic-load', function (event) {
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
        this.$element.off('scroll.selectlist-dynamic-load');
      }
    },

    /**
     * adds some accessibility attributes and features
     * http://www.w3.org/WAI/PF/aria/roles#listbox
     * @private
     */
    _makeAccessible: function () {
      var self = this;

      this.$element.attr({
        'role': 'listbox',
        'aria-controls': $(this.options.relatedElement).attr('id') || '',
        'aria-hidden': true,
        'aria-multiselectable': this.options.multiple
      });

      this._makeAccessibleListOption(this.$element.children());
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
          if (currentFocusEntry.length) {
            currentFocusEntry.trigger('click');
            event.preventDefault();
          }
          break;
        case 27: //esc
          this.hide();
          event.preventDefault();
          break;
        case 33: //page up
        case 37: //left arrow
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
        case 39: //right arrow
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
      }

      if (newFocusEntry !== undefined) {
        this.setCaretToItem($(newFocusEntry), true);
      }
    },

    /**
     * makes the list options accessible
     * @private
     * @param  {jQuery} elem
     */
    _makeAccessibleListOption: function (elem) {
      elem.each(function (i, e) {
        var entry = $(e);

        // group header
        if (entry.hasClass('coral-SelectList-item--optgroup')) {
          entry.attr({
            'role': 'presentation'
          }).children('ul').attr({
              'role': 'group'
          }).children('li').attr({
            'role': 'option'
          });
        } else {
          entry.attr({
            'role': 'option'
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
      this.$element.find('.coral-SelectList-item--option').removeClass('is-highlighted');
      $item.addClass('is-highlighted');

      if (scrollToItem) {
        this.scrollToItem($item);
      }
    },

    /**
     * Removes visual focus from list items and scrolls to the top.
     */
    resetCaret: function() {
      this.$element.find('[role="option"]').removeClass('is-highlighted');
      this.$element.scrollTop(0);
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
      var self = this;

      this.$element
        .addClass('is-visible')
        .attr('aria-hidden', false);

      this._position();

      if (this.options.autofocus) {
        this.setCaretToItem(
          this.$element.find(this._SELECTABLE_SELECTOR).first(),
          true);
      }

      // if dynamic start loading
      if (this.options.type === 'dynamic') {
        this._handleLoadData().done(function () {
          if (self.options.autofocus) {
            self.setCaretToItem(
              self.$element.find(self._SELECTABLE_SELECTOR).first(),
              true);
          }
        });
      }

      $(document).on('keydown.selectlist', this._handleKeyDown.bind(this));
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
      }
    },

    /**
     * @private
     */
    _hide: function () {
      this.$element
        .removeClass('is-visible')
        .attr('aria-hidden', true);


      this.reset();

      $(document).off('keydown.selectlist');
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
     * handle asynchronous loading of data (type == dynamic)
     * @private
     */
    _handleLoadData: function () {
      var promise,
        self = this,
        end = this._pagestart + this.options.datapagesize,
        wait = $('<div/>', {
          'class': 'coral-SelectList-item--wait'
        }).append($('<span/>', {
            'class': 'coral-Wait'
          }));

      if (this._loadingIsActive) { // immediately resolve
        return $.Deferred().resolve().promise();
      }

      // activate fetching
      this._loadingIsActive = true;

      // add wait
      this.$element.append(wait);

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
      }

      // increase to next page
      this._pagestart = end;

      promise.always(function () {
        wait.remove();
        self._loadingIsActive = false;
      });

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
    var $selectList = CUI.util.getDataTarget($(this));
    if ($selectList.length) {
      $selectList.data('selectList').toggleVisibility();
    }
    return false;
  };

  $(document)
    // If a click reaches the document, hide all open lists.
    .on('click.selectlist', hideLists)

    // If the click is from a select list, don't let it reach the document
    // to keep the listener above from hiding the list.
    .on('click.selectlist', selectListSelector, function (event) {
      event.stopPropagation();
    })

    // If a click is from a trigger button, toggle its menu.
    .on('click.selectlist', toggleSelector, toggleList);


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
      this.$element.attr({
        'role': 'list'
      });

      this.$element.children(this.options.tag).attr({
        'role': 'listitem'
      });
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
      this.$element.append(renderer.call(this, val, display));

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
        'role': 'listitem',
        'class': 'coral-TagList-tag' + (this.options.multiline ? ' coral-TagList-tag--multiline' : ''),
        'title': display
      });

      btn = $('<button/>', {
        'class': 'coral-MinimalButton coral-TagList-tag-removeButton',
        'type': 'button',
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

      // Save this object also in the target element
      if (this.options.target) this.options.target.data("tooltip", this);

      if (this.options.interactive && this.options.target) {
        var hto = null;
        // Special behaviour on mobile: show tooltip on every touchstart
        $(this.options.target).finger("touchstart.cui-tooltip", function (event) {
          if (hto) clearTimeout(hto);
          this.show();
          hto = setTimeout(function () {
            this.hide();
          }.bind(this), 3000); // Hide after 3 seconds
        }.bind(this));

        var showTimeout = false;
        $(this.options.target).pointer("mouseover.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          showTimeout = setTimeout(function () {
            this.show();
          }.bind(this), this.options.delay);
        }.bind(this));

        $(this.options.target).pointer("mouseout.cui-tooltip", function (event) {
          if (showTimeout) clearTimeout(showTimeout);
          this.hide();
        }.bind(this));
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
    },

    /** @ignore */
    _hide: function () {
      this.$element.fadeOut(400, function () {
        if (this.options.autoDestroy) {
          this.$element.remove();
          $(this.options.target).off(".cui-tooltip");
          $(this.options.target).data("tooltip", null);
        }
      }.bind(this));
      return this;
    },

    /**
     Place tooltip on page

     @returns {CUI.Tooltip} this, chainable
     */
    reposition: function (withoutWorkaround) {
      if (!this.options.target) return;

      // Reposition a second time due to rendering errors with Chrome and IE
      if (!withoutWorkaround) setTimeout(function () {
        this.reposition(true);
      }.bind(this), 50);

      this.$element.detach().insertAfter(this.options.target);

      this.$element.css("position", "absolute");

      var el = $(this.options.target);
      var eWidth = el.outerWidth(true);
      var eHeight = el.outerHeight(true);
      var eLeft = el.position().left;
      var eTop = el.position().top + el.offsetParent().scrollTop();


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
    });

    $(document).fipo("touchstart", "mouseover", "[data-init~=quicktip]", function (e) {
      var el = $(this),
          tooltip = el.data("tooltip"),
          isMouseOver = e.type === "mouseover",
          quicktip;

      if (!tooltip) {
        quicktip = new CUI.Tooltip({
          target: el,
          content: el.data("quicktip-content") || el.html(),
          type: el.data("quicktip-type"),
          arrow: el.data("quicktip-arrow"),
          interactive: false,
          autoDestroy: true
        });

        if (isMouseOver) {
          // Hide when mouse leaves
          el.pointer("mouseout", function (event) {
            quicktip.hide();
          });

        } else {
          // Hide after 3 seconds
          setTimeout(function () {
            quicktip.hide();
          }, 3000);
        }
      }
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
      }).fipo('tap', 'click', function (event) {
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
          btn.fipo('tap', 'click', button.click.bind(self, {
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

      this.$element.css({
        'margin-left': -(width / 2),
        'margin-top': -(height / 2)
      });
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
    $(document).fipo('tap.modal.data-api', 'click.modal.data-api', '[data-toggle="modal"]',function (e) {
      var $trigger = $(this);

      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      // Pass configuration based on data attributes in the triggering link
      var href = $trigger.attr('href');
      var options = $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());

      // Parse buttons
      if (typeof options.buttons === 'string') {
        options.buttons = JSON.parse(options.buttons);
      }

      // If a modal already exists, show it
      var instance = $target.data('modal');
      var show = true;
      if (instance && instance.get('visible'))
        show = false;

      // Apply the options from the data attributes of the trigger
      // When the dialog is closed, focus on the button that triggered its display
      $target.modal(options);

      // Perform visibility toggle if we're not creating a new instance
      if (instance)
        $target.data('modal').set({ visible: show });

      // Stop links from navigating
      e.preventDefault();
    }).finger('click.modal.data-api', '[data-toggle="modal"]', false);
  }

}(jQuery, this));

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

          self._suggestionsBtn.one('focus', function () {
            clearTimeout(timeout);
            self._suggestionsBtn.one('blur', handler);
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

      var debounceComplete = function (event) {
        self.showSuggestions(
          self._input.val(),
          false,
          self._selectListWidget);
      };

      var debounce = function () {
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
        this._suggestionsBtn.on('click.autocomplete', function (event) {
          if (!self._selectListWidget.get('visible')) {
            self.showSuggestions(
              self._input.val(),
              true,
              self._selectListWidget);

            // If the event were to bubble to the document the
            // select list would be hidden.
            event.stopPropagation();
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
      this.$element.attr({
        'role': 'combobox',
        'aria-multiselectable': this.options.multiple,
        'aria-autocomplete': this.options.typeahead ? 'list' : '',
        'aria-owns': this._selectlist.attr('id') || ''
      });

      this._input.add(this._suggestionsBtn).on('keydown', function (event) {
        switch (event.which) {
          case 40: // down arrow
            if (!this._selectListWidget.get('visible')) {
              this._selectListWidget.show().resetCaret();
              event.preventDefault();
              // If the event continued propagation then the
              // SelectList would set its cursor to the next
              // item in the list.
              event.stopPropagation();
            }
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

      if (val.length || fromToggle) {
        // actually handle the filter
        if (this._selectListWidget.options.type === 'static') {
          this._handleStaticFilter(val);
        } else if (this._selectListWidget.options.type === 'dynamic') {
          this._handleDynamicFilter(val);
        }

        this._selectListWidget.show().resetCaret();
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
     * handles a static list filter (type == static) based on the defined mode
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
    }
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
      this._select = this.$element.children('.coral-Select-select');
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
      var forcedNativeWidget = this.options.nativewidgetonmobile && CUI.util.isTouch && this.options.type === 'static';

      // there is a select given so read the "native" config options
      if (this._select.length > 0) {
        // if multiple set multiple
        if (this._select.prop('multiple')) {
          this.options.multiple = true;
        }
      }


      if (this.options.nativewidget || forcedNativeWidget) {
        this._setNativeWidget(forcedNativeWidget);
      } else {
        this._setSelectList();
      }

      this._setTagList();

      // if we have a static <select> based list
      if (this.options.type === 'static') {
        // load the values from markup
        this._handleNativeSelect();
      }
    },

    /**
     *
     * @return {Array|String} current value
     */
    getValue: function () {
      if (this.options.multiple) { // multiple returns array
        return this._tagListWidget.getValues();
      } else if (this.options.type === 'static') { // static
        return this._select[0][this._select[0].selectedIndex].value;
      } else if (this.options.type === 'dynamic') {
        return this._valueInput.val();
      }

      return null;
    },

    /**
     * this option is mainly supposed to be used on mobile
     * and will just work with static lists
     * @private
     * @param {Boolean} [force]
     */
    _setNativeWidget: function (force) {
      var self = this;

      if (this.options.nativewidget || force) {
        this._select.addClass('coral-Select-select--native');

        this._select.css({
          height: this._button.outerHeight()
        });

        if (this.options.multiple) {
          this._setTagList();
        }

        // if it is in single selection mode,
        // then the btn receives the label of the selected item
        this._select.on('change.select', this._handleNativeSelect.bind(this));

      } else {
        this._select.removeClass('coral-Select-select--native');
        this._select.off('change.select');
      }
    },

    /**
     * handles a native change event on the select
     * @fires Select#selected
     * @private
     */
    _handleNativeSelect: function (event) {
      var self = this,
        selected, selectedElem;

      if (self.options.multiple) {
        // loop over all options
        $.each(self._select[0].options, function (i, opt) {
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
      } else if (self._select[0]) {

        selectedElem = self._select[0][self._select[0].selectedIndex];

        self._buttonText.text(selectedElem ? selectedElem.text : '');

        selected = selectedElem ? selectedElem.value : null;
      }

      if (event) {
        this.$element.trigger($.Event('selected', {
          selected: selected
        }));
      }
    },

    _updateNativeSelect: function (selectedValues) {
      if (this._select.length) {
        $.each(this._select[0].options, function (i, option) {
          option.selected = selectedValues.indexOf(option.value) > -1;
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
        optgroup = this._select.children('optgroup');

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
        parseGroup(this._select, this._selectList);
      }
    },

    /**
     * set SelectList widget
     * @private
     */
    _setSelectList: function () {
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

      this._button.attr({
        'data-toggle': 'selectlist',
        'data-target': '#' + this._selectList.attr('id')
      });

      // read values from markup
      if (this._select.length > 0) {
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
        // receive the value from the list
        .on('selected.select', this._handleSelected.bind(this))
        // handle open/hide for the button
        .on('show.select hide.select', function (event) {
          self._button.toggleClass('active', event.type === 'show');
        });
    },

    /**
     * sets a tag list for the multiple selection
     * @private
     */
    _setTagList: function () {
      var self = this;

      if (this.options.multiple) {
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
          self._updateNativeSelect(selectedValues);
        });
      }
    },

    /**
     * handles a select of a SelectList widget
     * @fires Select#selected
     * @private
     */
    _handleSelected: function (event) {
      var selected;


      // we stop the propagation because the component itself provides a selected event too
      if (event) {
        event.stopPropagation();
      }

      this._selectListWidget.hide();

      // set select value
      this._select.val('' + event.selectedValue);

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          value: event.selectedValue,
          display: event.displayedValue
        });

        selected = this._tagListWidget.getValues();
        this._updateNativeSelect(selected);
      } else {
        // set the button label
        this._buttonText.text(event.displayedValue);
        // in case it is dynamic a value input should be existing
        this._valueInput.val(event.selectedValue);

        selected = "" + event.selectedValue;
      }

      this._button.trigger('focus');

      this.$element.trigger($.Event('selected', {
        selected: selected
      }));
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

      // Always include hidden field
      if ($element.find("input[type=hidden]").length === 0) {
        $element.append("<input type=\"hidden\">");
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
      this.$input.trigger("tap");
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
      '<div class="coral-Popover" style="display:none" id="%ID%">',
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

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

(function ($, window, undefined) {

  /**
   * CUI.Endor is the namespace for shell specific static objects.
   *
   * @namespace
   */
  CUI.Endor = CUI.Endor || {
  };

}(jQuery, this));

(function ($, window, undefined) {

  /**
   * CUI.Endor.registry is used to store and retrieve instances of shell components and is typically only used
   * by shell internals.
   *
   * @namespace
   */
  CUI.Endor.registry = {

    // Public API //

    /**
     * Add an object to the register.
     *
     * @param {Object} instance The object instance to register.
     * @param {string} [key]  The key to register the instance under. If not
     * specified, 'instance.getRegistryKey()' is tried. If not available,
     * a native 'instance.toString()' will be used, and if that's not
     * available, then a unique ID will be generated.
     *
     * @returns {string} The key under which the instance got stored.
     */
    register: function (instance, key) {
      var instanceMap = this._instanceMap,
          callbackMap = this._callbackMap,
          self = this;

      key = this._resolveKey(instance, key) || CUI.util.getNextId();

      if (instance._isSingleton) {
        // This can either be a first instance, or a consecutive one. In the
        // latter case, only the last instance is kept:
        instanceMap[key] = instance;
      } else {
        // All instances of a non-singleton shell widget are kept:
        var instances = instanceMap[key] || (instanceMap[key] = []);
        instances.push(instance);
      }

      // Invoke callbacks registered to this key:
      var callbacks = callbackMap[key];
      if (callbacks) {
        // While iterating over the callbacks, filter out the ones
        // that have the 'once' flag raised. These can be removed
        // right after the callback has been invoked:
        callbackMap[key] = callbacks.filter(function (callback) {
          self._invokeCallback(callback, instance, key);
          return !callback.options.once;
        });
        // When there's no callbacks left for the key, then clean
        // up the empty array:
        if (callbackMap[key].length === 0) {
          delete callbackMap[key];
        }
      }

      return key;
    },

    /**
     * Unregister an instance.
     *
     * @param {Object} instance The instance to unregister.
     * @param {string} [key] The key with which the instance was registered. This is required when instance.toString was
     * not used to register the instance.
     * @returns {string} The key that was used to unregister the instance.
     */
    unregister: function (instance, key) {
      var instanceMap = this._instanceMap,
          callbackMap = this._callbackMap,
          self = this;

      key = this._resolveKey(instance, key);
      if (!key) {
        throw new Error('Invalid instance key');
      }

      if (instance._isSingleton) {
        delete instanceMap[key];
      } else {
        var instances = instanceMap[key];
        var index = instances.indexOf(instance);
        if (index != -1) {
          instances.splice(index, 1);
        }
      }

      var callbacks = callbackMap[key];
      if (callbacks) {
        callbacks.forEach(function (callback) {
          self._invokeCallback(callback, null, key);
        });
      }

      return key;
    },

    /**
     * Check if there are instances registered under the given key.
     *
     * @param {string} key
     * @returns {boolean}
     */
    has: function (key) {
      return this._instanceMap.hasOwnProperty(key);
    },

    /**
     * Get the instance(s) registered under the given key.
     *
     * @param {string} key The key to get the instance(s) for.
     * @returns {Array|undefined} Array with matched instances when the last
     * registered object is not a singleton, otherwise the matched
     * instance, or undefined if no matches were found.
     */
    get: function (key) {
      return this._instanceMap[key + ''];
    },

    /**
     * Request a callback to be invoked when a given key is or was
     * used to register an instance.
     *
     * @param {string} key The key to have callback(s) invoked for.
     * @param {Function} callback The callback to invoke.
     * @param options
     * @param {*} options.scope Scope to use on invoked the callback.
     * @param {boolean} [options.once=false] Set to true to have the
     * callback invoked just once.
     * @returns {Function} A method that can be invoked to cancel the
     * resolve request.
     */
    resolve: function (key, callback, options) {
      callback = {
        method: callback,
        options: $.extend({}, this._defaultCallbackOptions, options)
      };

      if (this.has(key)) {
        this._invokeCallback(callback, this.get(key), key);
        if (callback.options.once) {
          // return, all done:
          return function () {
            return callback;
          };
        }
      }

      var callbacks = this._callbackMap[key] || (this._callbackMap[key] = []);
      callbacks.push(callback);

      // Cancellation method:
      return function () {
        var index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        return callback;
      };
    },

    /**
     * Unregister all instances, and cancel all resolve requests. Used for
     * unit testing.
     */
    reset: function () {
      this._instanceMap = {};
      this._callbackMap = {};
    },

    // Internals //

    _instanceMap: {},
    _callbackMap: {},

    _defaultCallbackOptions: {
      once: false,
      scope: this
    },

    /**
     * @private
     */
    _invokeCallback: function (callback, instance, key) {
      var scope = callback.options.scope || this;
      callback.method.apply(scope, [instance, key]);
    },

    /**
     * @private
     */
    _resolveKey: function (instance, key) {
      return key || (
          $.isFunction(instance.getRegistryKey) ?
              instance.getRegistryKey() :
              instance.hasOwnProperty('toString') ?
                  instance + '' :
                  undefined
          );
    }

  };

}(jQuery, this));

(function ($, window) {

  /**
   * CUI.Endor.util defines a number of utility methods
   *
   * @namespace
   */
  CUI.Endor.util = {

    /**
     * Simple method for sanitizing html passed in by the user. This loosely follows the implementation by mustachejs.
     * @param html
     * @returns {string}
     */
    escapeHtml: function(html) {
      var htmlSafeEntityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };

      return String(html).replace(/[&<>"'\/]/g, function (s) {
        return htmlSafeEntityMap[s];
      }.bind(this));
    },

    /**
     * Utility function that queues up events triggered in rapid succession, delivering
     * only the last one.
     *
     * @param fn
     * @param threshold
     * @param execAsap
     * @returns {debounced}
     */
    debounce: function (fn, threshold, execAsap) {
      var timeout;
      return function debounced() {
        var obj = this, args = arguments; // arguments which were passed
        function delayed() {
          if (!execAsap) {
            fn.apply(obj, args); // execute now
          }

          // clear timeout handle
          timeout = null;
        }

        // stop any current detection period
        if (timeout) {
          clearTimeout(timeout);
        } else if (execAsap) { // otherwise, if we're not already waiting and we're executing at the beginning of the detection period
          fn.apply(obj, args); // execute now
        }
        timeout = setTimeout(delayed, threshold || 100);
      };
    },

    ensureElementId: function (element) {
      var $element = $(element);
      if (!$element.attr('id')) {
        $element.attr('id', CUI.util.getNextId());
      }
      return $element;
    },

    /**
     * Register a widget with the CoralUI registry. Since we always follow the
     * same convention, this can be captured in a util.
     *
     * The selector used for registration is derived from what the type returns
     * when 'toString' is invoked. If for example, this would be 'ShellWidgetExample',
     * then the used selector would be 'shellWidgetExample', and the data-init
     * selector 'shell-widget-example'.
     *
     * @param type {Class} to register.
     */
    registerWidget: function (type) {
      var typeString = type.toString(),
          typeCamelCase = CUI.util.decapitalize(typeString),
          typeSelectorCase = CUI.Endor.util.pascalCaseToSelectorCase(typeString);

      CUI.Widget.registry.register(typeCamelCase, type);
      if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
          type.init($('[data-init~='+ typeSelectorCase + ']', event.target));
        });
      }
    },

    pascalCaseToSelectorCase: function (value) {
      var expression = /([A-Z]_*)/g;
      return value
          .replace(expression,'-$1')
          .split('-')
          .filter(function(item){return item !== '';})
          .map(CUI.util.decapitalize)
          .join('-');
    }

  };

}(jQuery, window));
(function ($, window, undefined) {

  var RE_STORE = /^(store)([A-Z]\w*)$/;

  function isString(item) {
    return typeof item === 'string';
  }

  CUI.ShellWidgetMixin = /** @lends CUI.ShellWidgetMixin# */{

    getRegistryKey: function () {
      return this + '';
    },

    // Internals //

    _resolveWidget: function (type, callback, options) {
      var optionsWithScope = $.extend({ scope: this }, options);
      return CUI.Endor.registry.resolve(type, callback, optionsWithScope);
    },

    _initOptionsStore: function () {
      // Look for any options that match the 'store' flag:
      for (var field in this.options) {
        var fieldValue = this.options[field],
            matches = RE_STORE.exec(field);
        if (matches) {
          var option = CUI.util.decapitalize(matches[2]),
              name = [
                this.toString(),
                option,
                fieldValue
              ].filter(isString)
                  .join('.');
          // Watch the target option for change:
          this._initOptionStore(option, name);
        }
      }
    },

    _initOptionStore: function (option, name) {
      var listener = {
        type: 'change:' + option,
        handler: function (event) {
          var value = event.value;
          if (value !== undefined) {
            CUI.Endor.store.save(name, value);
          } else {
            CUI.Endor.store.clear(name);
          }
        }
      };
      this.$element.on(listener.type, listener.handler);
    }
  };

  CUI.ShellWidgetMixin.applyTo = function (targetType, isSingleton) {

    var proto = targetType.prototype,
        construct = proto.construct,
        destruct = proto.destruct;

    $.extend(proto,
        CUI.ShellWidgetMixin,
        {
          _isSingleton: isSingleton !== undefined ? isSingleton : true,

          construct: function () {
            if ($.isFunction(construct)) {
              construct.apply(this, arguments);
            }
            this._initOptionsStore();
            CUI.Endor.registry.register(this);
          },

          destruct: function () {
            CUI.Endor.registry.unregister(this);

            if ($.isFunction(destruct)) {
              destruct.apply(this, arguments);
            }
          }
        }
    );
  };

}(jQuery, this));

(function ($, window, undefined) {

  var RE_STORE = /^(store)([A-Z]\w*)$/;

  function isString(item) {
    return typeof item === 'string';
  }

  CUI.ShellWidget = new Class(/** @lends CUI.ShellWidget# */{

    toString: 'ShellWidget',
    extend: CUI.Widget,

    /**
     * @classdesc CUI.ShellWidget is the base class for all of the widgets in the
     * core shell package. Deriving classes will automatically get
     * registered with the Endor instance registry, and have support
     * for (optionally) persisting options.
     * The constructor invokes <code>this._init(options)</code> upfront
     * registering the instance with the Endor instance registy.
     *
     * Use 'store' prefixed options (i.e. option.storeMyOption, or set
     * on the DOM using <code>data-store-my-option</code> attributes) to
     * have the target option stored on change, via CUI.Endor.store.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init(options);
    },

    /**
     * Stub for subclasses to override. On doing so, make sure to
     * invoke <code>this.inherited(arguments);</code>.
     *
     * @param options
     * @private
     */
    _init: function (options) {
    }

  });

  // Mix-in the shell widget functionality:
  CUI.ShellWidgetMixin.applyTo(CUI.ShellWidget);

}(jQuery, this));
(function ($, window, undefined) {

  var DEFAULTS = {
    isClosed: $
  };

  CUI.Closable = new Class(/** @lends CUI.Closable# */{
    toString: 'Closable',
    extend: CUI.ShellWidget,

    defaults: DEFAULTS,

    // Public API //

    /**
     * @classdesc Base class for widgets that can be in an open or closed state, using
     * the 'is-closed' class.
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.isClosed=false] When true, the widget is in a closed state.
     * When this option is omitted, the widget will set this option to <code>true</code> when the
     * target element has the <code>is-closed</code> class.
     */
    construct: function (options) {
    },

    /**
     * See if the widget is in a closed state.
     * @returns {boolean} True if the widget is closed.
     */
    getIsClosed: function () {
      return this.options.isClosed;
    },

    /**
     * Update the widget's closed state.
     * @param value {boolean} True if the widget should be set closed. False otherwise.
     * @returns {boolean} True if the widget is set closed.
     */
    setIsClosed: function (value) {
      if (value !== this.options.isClosed) {
        if (this._set('isClosed', value) !== this) {
          this._updateDOM();
        }
      }
      return this.options.isClosed;
    },

    /**
     * Sugar for <code>setIsClosed(false);</code>
     * @returns {boolean} True if the the widget is set closed.
     */
    open: function () {
      return this.setIsClosed(false);
    },

    /**
     * Sugar for <code>setIsClosed(true);</code>
     * @returns {boolean} True if the the widget is set closed.
     */
    close: function () {
      return this.setIsClosed(true);
    },

    /**
     * Toggle the widget's closed state.
     * @returns {boolean} True if the the widget is set closed.
     */
    toggleIsClosed: function () {
      return this.setIsClosed(!this.options.isClosed);
    },

    // Internals //

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {
      if (this.options.isClosed === $) {
        this.options.isClosed = this.$element.hasClass(CUI.Closable.CLASS_CLOSED);
      }

      this._updateDOM();
    },

    _updateDOM: function () {
      if (this.options.isClosed) {
        this.$element.addClass(CUI.Closable.CLASS_CLOSED);
      } else {
        this.$element.removeClass(CUI.Closable.CLASS_CLOSED);
      }
    }
  });

  CUI.Closable.defaults = DEFAULTS;
  CUI.Closable.CLASS_CLOSED = 'is-closed';

}(jQuery, this));


(function ($, window, undefined) {

  // When the available inner window width drops below the specified value,
  // the shell will switch the 'compact' mode:
  var ELEMENT_CLASSES = 'endor-Panel',

      CLASS_TRANSITIONING = 'is-transitioning',
      CLASS_BREADCRUMBBAR_HEIGHT = 'endor-Panel-content--breadcrumbBarHeight',

      EVENT_TRANSITION_END = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';

  CUI.Shell = new Class(/** @lends CUI.Shell# */{
    toString: 'Shell',
    extend: CUI.ShellWidget,

    defaults: {

      brandIcon: null,
      brandTitle: null,
      brandHref: null,

      generateBreadcrumbBar: false,
      breadcrumbBarOptions: {
        isClosed: true
      },

      generatePage: false,
      pageOptions: {
        generateOuterRail: true,
        generateInnerRail: true,
        generateBlackBar: true,
        generateActionBar: true,
        generateFooter: true
      }

    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc CUI.Shell manages inter shell widget communication and state keeping.
     *
     * @constructs
     * @param {Object} options
     * @param {jQuery} options.element The widget's target element. Expected to be the document's body tag.
     * @param {string} [options.brandIcon=null] A string that holds the classes that select the icon that should be shown as the application brand.
     * @param {string} [options.brandTitle=null] A string that holds the title of the application, as should be shown in the brand areas.
     * @param {string} [options.brandHref=null] A string that holds the URL that the browser should load on the brand icon or title being clicked.
     * @param {boolean} [options.generateBreadcrumbBar=false] When this option is set to true, the widget will generate a breadcrumb bar and insert it on the DOM.
     * @param {Object} [options.breadcrumbBarOptions={isClosed: true}] The options that the widget will forward to CUI.BreadcrumbBar on constructing the bar in response to the generateBreadcrumbBar flag being raised.
     *
     * @param {boolean} [options.generatePage=false] When this option is set to true, then the widget will generate a shell page and insert it on the DOM.
     * @param {Object} [options.pageOptions={generateOuterRail: true, generateInnerRail: true, generateBlackBar: true, generateFooter: true}] The options that the widget will forward to CUI.Page on constructing the page in response to the generatePage flag being raised.
     */
    construct: function (options) {
    },

    // Internals //

    _breadcrumbBar: null,    // CUI.BreadcrumbBar widget
    _crumbs: null,           // CUI.Crumbs widget
    _page: null,             // CUI.Page widget
    _brand: null,            // CUI.Brand widget

    _isCompact: false,       // When true, the shell hides the nav rail

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
      this._resolveWidgets();
      this._updateIsCompact();
      this._updateBrand();
      this._addListeners();
      this._handleWindowLoadOrResize();
    },

    _setupElement: function () {

      this.$element.addClass(ELEMENT_CLASSES);

      // Accept just the attribute as 'true':
      this.options.generateBreadcrumbBar = this.options.generateBreadcrumbBar !== false;
      if (this.options.generateBreadcrumbBar) {
        var $breadcrumbBar = $('<div></div>').prependTo(this.$element);
        $breadcrumbBar.before('<!-- CUI.Shell | breadcrumb bar -->');
        new CUI.BreadcrumbBar($.extend(
            { element: $breadcrumbBar },
            { isClosed: true },
            this.options.breadcrumbBarOptions
        ));
      }

      // Accept just the attribute as 'true':
      this.options.generatePage = this.options.generatePage !== false;
      if (this.options.generatePage) {
        var $page = $('<div></div>').appendTo(this.$element);
        $page.before('<!-- CUI.Shell | page -->');
        new CUI.Page($.extend(
            { element: $page },
            this.options.pageOptions
        ));
      }
    },

    _resolveWidgets: function () {
      this._resolveWidget(CUI.Page, this._handlePageResolved);
      this._resolveWidget(CUI.Crumbs, this._handleCrumbsResolved);
      this._resolveWidget(CUI.BreadcrumbBar, this._handleBreadcrumbBarResolved);
      this._resolveWidget(CUI.Brand, this._handleBrandResolved);
    },

    _handlePageResolved: function (page) {
      this._page = page;
      this._updateBreadcrumbBarSpacing();
      this._handleWindowLoadOrResize();
    },

    _handleCrumbsResolved: function (crumbs) {
      this._crumbs = crumbs;
      if (crumbs && this.options.brandTitle) {
        crumbs.setFirstItem({
          title: this.options.brandTitle,
          href: this.options.brandHref,
          icon: this.options.brandIcon
        });
      }
      this._handleWindowLoadOrResize();
    },

    _handleBreadcrumbBarResolved: function (breadcrumbBar) {

      // Clean up:
      var isClosedHandler = this._handleBreadcrumbBarIsClosedChange;
      if (isClosedHandler) {
        this._breadcrumbBar.off('change:isClosed', isClosedHandler);
        delete this._handleBreadcrumbBarIsClosedChange;
      }

      // Reset:
      this._breadcrumbBar = breadcrumbBar;
      if (breadcrumbBar) {
        isClosedHandler = this._handleBreadcrumbBarIsClosedChange = this._updateBrand.bind(this);
        breadcrumbBar.on('change:isClosed', isClosedHandler);
      }
      this._updateBreadcrumbBarSpacing();
      this._handleWindowLoadOrResize();
    },

    _handleBrandResolved: function (brand) {
      this._brand = brand;
      this._updateBrand();
    },

    _addListeners: function () {
      var self = this;

      $(window).on('resize load', CUI.Endor.util.debounce(this._handleWindowLoadOrResize).bind(this));

      $(document).on(CUI.BlackBar.EVENT_BACK_BUTTON_CLICK, function (event) {
        event.preventDefault();
        self._navigateToPreviousCrumb();
      });

      $(document).on(CUI.BlackBar.EVENT_TITLE_CLICK, function (event) {
        event.preventDefault();
        self._toggleBreadcrumbBar();
      });
    },

    _updateIsCompact: function () {
      this._isCompact = window.innerWidth < CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY;
    },

    _updateBrand: function () {
      if (this._brand) {

        if (this._breadcrumbBar) {
          this._brand.setIsClosed(!this._breadcrumbBar.getIsClosed());
        }

        if (this.options.brandTitle) {
          this._brand.setTitle(this.options.brandTitle);
        }

        if (this.options.brandIcon) {
          this._brand.setIcon(this.options.brandIcon);
        }

        if (this.options.brandHref) {
          this._brand.setHref(this.options.brandHref);
        }
      }
    },

    _updateBreadcrumbBarSpacing: function() {
      if (this._page) {
        if (this._breadcrumbBar) {
          this._page.$element.addClass(CLASS_BREADCRUMBBAR_HEIGHT);
        } else {
          this._page.$element.removeClass(CLASS_BREADCRUMBBAR_HEIGHT);
        }
      }
    },

    _handleWindowLoadOrResize: function () {
      this._updateIsCompact();

      if (this._crumbs) {
        this._crumbs.truncate();
      }

      if (this._page) {
        this._page.resize(this._isCompact);
      }
    },

    _toggleBreadcrumbBar: function () {
      if (this._breadcrumbBar) {
        this._breadcrumbBar.toggleIsClosed();
        if (this._page) {
          var pageElement = this._page.$element;
          pageElement
              .toggleClass(CLASS_TRANSITIONING)
              .on(EVENT_TRANSITION_END, function handler(event) {
                pageElement.off(EVENT_TRANSITION_END, handler);
                pageElement.removeClass(CLASS_TRANSITIONING);
              });
        }
      }
    },

    _navigateToPreviousCrumb: function () {
      if (this._crumbs) {
        var item = this._crumbs.getLastNavigableItem();
        window.location = item.attr('href');
      } else {
        window.history.back();
      }
    }

  });

  CUI.Endor.util.registerWidget(CUI.Shell);

  CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY = 1024;

}(jQuery, this));

(function ($, window, undefined) {

  var ELEMENT_CLASSES = 'js-endor-page endor-Panel-content endor-Page',

      CLASS_INNER_RAIL_OPEN = 'is-innerRailOpen',
      CLASS_ACTIONBAR_HEIGHT = 'endor-Panel-content--actionBarHeight',
      CLASS_BLACKBAR_HEIGHT = 'endor-Panel-content--blackBarHeight',

      HTML_CONTENT = '<div class="endor-Page-content endor-Panel">',
      HTML_PANEL_CONTENT = '<div class="endor-Panel-content" role="main">',
      HTML_PAGE_CONTENT = '<div class="js-endor-content endor-Panel-content">',
      HTML_PAGE_CONTENT_INNER = '<div class="endor-Panel-contentMain"><div class="u-coral-padding"></div></div>';

  CUI.Page = new Class(/** @lends CUI.Page# */{
    toString: 'Page',
    extend: CUI.ShellWidget,

    defaults: {
      generateOuterRail: false,
      outerRailOptions: {
        generateBrand: true
      },

      generateBlackBar: false,
      blackBarOptions: null,

      generateInnerRail: false,
      innerRailOptions: null,

      generateActionBar: false,

      generateFooter: false,
      footerOptions: null
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc The CUI.Page widget manages the appearance of the nav rail, inner rail, black bar, action bar and the footer.
     *
     *
     * @example
     * <caption>Instantiate with Class</caption>
     * var page = new CUI.Page({
     *     element: '#myPage'
     * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myPage').page();
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.generateOuterRail=false] When set to true, the widget will add an outer rail to the page. The outer rail is where the main navigation bits of page usually reside. See CUI.OuterRail.
     * @param {Object} [options.outerRailOptions={generateBrand: true}] The options that the widget will forward to CUI.OuterRail on constructing the outer rail in response to the generateOuterRail flag being raised. See CUI.OuterRail for more information on what options can be set.
     * @param {Boolean} [options.generateBlackBar=false] When set to true, the widget will add a black bar to the page. The black bar is where the page title, hamburger and back button usually reside. See CUI.BlackBar.
     * @param {Object} [options.blackBarOptions=null] The options that the widget will forward to CUI.BlackBar on constructing the black bar in response to the generateBlackBar flag being raised. See CUI.BlackBar for more information on what options can be set.
     * @param {Boolean} [options.generateInnerRail=false] When set to true, the widget will add an inner rail to the page.
     * @param {Object} [options.innerRailOptions=null] The options that the widget will forward to CUI.InnerRail on constructing the inner rail in response to the generateInnerRail flag being raised. See CUI.InnerRail for more information on what options can be set.
     * @param {Boolean} [options.generateActionBar=false] When set to true, the widget will add an action bar to the page. See CUI.ActionBar.
     * @param {Boolean} [options.generateFooter=false] When set to true, the widget will add a footer to the page.
     * @param {Object} [options.footerOptions=null] The options that the widget will forward to CUI.Footer on constructing the footer in response to the generateFooter flag being raised. See CUI.Footer for more information on what options can be set.
     */
    construct: function (options) {
    },

    resize: function (isCompact) {
      if (isCompact != this._isCompact) {
        this._isCompact = isCompact;
        this._updateOuterRailToggleState();
        this._updateBreadcrumbBarIsCompact();
      }
    },

    /**
     * @returns {jQuery} Page content area container
     */
    getContent: function () {
      return this._$pageContentInner;
    },

    openOuterRail: function () {
      if (this._isCompact && this._innerRail && this._innerRail.getActivePanelId() !== '') {
        // There can be only one rail visible at a time in compact mode. Since 'nav' was last
        // clicked here, close the inner rail:
        this.setActiveInnerRailPanel('');
      }

      this._outerRail.open();
      this._updateOuterRailToggleState();
      this._updateBreadcrumbBarIsCompact();
    },

    closeOuterRail: function () {
      this._outerRail.close();
      this._updateOuterRailToggleState();
      this._updateBreadcrumbBarIsCompact();
    },

    toggleOuterRail: function () {
      if (this._outerRail) {
        if (this._outerRailIsClosed()) {
          this.openOuterRail();
        } else {
          this.closeOuterRail();
        }
      }
    },

    setActiveInnerRailPanel: function (targetId) {
      if (!this._innerRail) {
        return;
      }

      var activeId = this._innerRail.getActivePanelId();

      // Reset the selection when the active panel gets re-selected:
      if (targetId === activeId) {
        targetId = '';
      }

      // If a change occurred, then update accordingly:
      if (targetId !== activeId) {
        this._innerRail.setActivePanelId(targetId);
        this._updateInnerRailState();
        this._updateInnerRailToggleSelectedStates();

        if (this._isCompact) {
          this._updateOuterRailToggleState();
          this._updateBreadcrumbBarIsCompact();
        }
      }
    },


    // Internals //

    _outerRail: null,         // CUI.OuterRail widget
    _outerRailToggle: null,   // CUI.OuterRailToggle widget
    _innerRail: null,         // CUI.InnerRail widget
    _innerRailToggles: [],    // CUI.InnerRailToggle widgets
    _footer: null,            // CUI.Footer widget
    _blackBar: null,          // CUI.BlackBar widget
    _actionBar: null,         // CUI.ActionBar widget
    _breadcrumbBar: null,     // CUI.BreadcrumbBar widget.
    _$belowBlackBar: null,    // jQuery element that holds the content below the black bar.
    _$pageContentOuter: null, // jQuery element that contains the page main contents, outer div.
    _$pageContentInner: null, // jQuery element that contains the page main contents, inner div.
    _$railToggleBtn: null,    // jQuery element that contains the railToggleBtn.
    _isCompact: false,        // Inner/Nav rail toggling influences each other in compact mode.

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
      this._resolveWidgets();
      this._addListeners();
      this._updateInnerRailState();
    },

    _setupElement: function () {
      this.$element.addClass(ELEMENT_CLASSES);

      var $content, $panelContent, $pageContentInner, $pageContentOuter, $generated;

      this.options.generateOuterRail = this.options.generateOuterRail !== false;
      if (this.options.generateOuterRail) {
        $generated = $('<div>').prependTo(this.$element);
        $generated.before('<!-- CUI.Page | outer rail -->');
        new CUI.OuterRail($.extend(
            { element: $generated },
            this.options.outerRailOptions
        ));
      }

      $content = this.$element.children('div.endor-Page-content');
      if (!$content.length) {
        $content = $(HTML_CONTENT).appendTo(this.$element);
        $content.before('<!-- CUI.Page | main -->');
      }

      this.options.generateBlackBar = this.options.generateBlackBar !== false;
      if (this.options.generateBlackBar) {
        $generated = $('<nav>').appendTo($content);
        $generated.before('<!-- CUI.Page | black bar -->');
        new CUI.BlackBar($.extend(
            { element: $generated },
            this.options.blackBarOptions
        ));
      }

      $panelContent = $content.children('div.endor-Panel-content');
      if (!$panelContent.length) {
        $panelContent = $(HTML_PANEL_CONTENT).appendTo($content);
        $panelContent.before('<!-- CUI.Page | panel content -->');
      }
      this._$belowBlackBar = $panelContent;

      this.options.generateInnerRail = this.options.generateInnerRail !== false;
      if (this.options.generateInnerRail) {
        $generated = $('<div>').prependTo($panelContent);
        $generated.before('<!-- CUI.Page | inner rail -->');
        new CUI.InnerRail($.extend(
            { element: $generated },
            this.options.innerRailOptions
        ));
      }

      $content = $panelContent.find('div.endor-Page-content');
      if (!$content.length) {
        $content = $(HTML_CONTENT).appendTo($panelContent);
        $content.before('<!-- CUI.Page | content -->');
      }

      this.options.generateActionBar = this.options.generateActionBar !== false;
      if (this.options.generateActionBar) {
        $generated = $('<nav>').prependTo($content);
        $generated.before('<!-- CUI.Page | action bar -->');
        new CUI.ActionBar({ element: $generated });
      }

      $pageContentOuter = $content.find('.js-endor-content');
      if (!$pageContentOuter.length) {
        $pageContentOuter = $(HTML_PAGE_CONTENT).appendTo($content);
        $pageContentOuter.before('<!-- CUI.Page | page content (outer) -->');
      }
      this._$pageContentOuter = $pageContentOuter;

      $pageContentInner = $pageContentOuter.find('div.endor-Panel-contentMain');
      if (!$pageContentInner.length) {
        $pageContentInner = $(HTML_PAGE_CONTENT_INNER).appendTo($pageContentOuter);
        $pageContentInner.before('<!-- CUI.Page | page content (inner) -->');
      }

      this._$pageContentInner = $pageContentInner.children('div.u-coral-padding');

      this.options.generateFooter = this.options.generateFooter !== false;
      if (this.options.generateFooter) {
        $generated = $('<footer>').appendTo($pageContentInner);
        $generated.before('<!-- CUI.Page | footer -->');
        new CUI.Footer($.extend(
            { element: $generated },
            this.options.footerOptions
        ));
      }

    },

    _resolveWidgets: function () {

      this._resolveWidget(CUI.InnerRail, function (instance) {
        this._innerRail = instance;
        this._innerRail.on('change:activePanelId', function () {
          this._updateInnerRailState();
        }.bind(this));
        this._updateInnerRailState();
      });

      this._resolveWidget(CUI.OuterRail, function (instance) {
        this._outerRail = instance;
      });

      this._resolveWidget(CUI.OuterRailToggle, function (instance) {
        if (this._outerRailToggleHandler) {
          this._outerRailToggle.$element.off(CUI.OuterRailToggle.EVENT_CLICK, this._outerRailToggleHandler);
          this._outerRailToggleHandler = undefined;
        }
        this._outerRailToggle = instance;
        if (this._outerRailToggle) {
          this._outerRailToggleHandler = this.toggleOuterRail.bind(this);
          this._outerRailToggle.$element.on(CUI.OuterRailToggle.EVENT_CLICK, this._outerRailToggleHandler);
        }
        this._updateOuterRailToggleState();
      });

      this._resolveWidget(CUI.BlackBar, function (instance) {
        this._blackBar = instance;
        if (instance) {
          this._$belowBlackBar.addClass(CLASS_BLACKBAR_HEIGHT);
        } else {
          this._$belowBlackBar.removeClass(CLASS_BLACKBAR_HEIGHT);
        }
      });

      this._resolveWidget(CUI.ActionBar, function (instance) {
        if (instance)
          this._$pageContentOuter.addClass(CLASS_ACTIONBAR_HEIGHT);
        else
          this._$pageContentOuter.removeClass(CLASS_ACTIONBAR_HEIGHT);

        this._actionBar = instance;
      });

      this._resolveWidget(CUI.Footer, function (instance) {
        this._footer = instance;
        this.resize(this._isCompact);
      });

      this._resolveWidget(CUI.BreadcrumbBar, function (instance) {
        this._breadcrumbBar = instance;
        this._updateBreadcrumbBarIsCompact();
      });

      this._resolveWidget(CUI.InnerRailToggle, function (instance) {
        this._innerRailToggles = CUI.Endor.registry.get(CUI.InnerRailToggle);
        this._updateInnerRailToggleSelectedStates();
      });
    },

    _addListeners: function () {
      var self = this;

      $(document).on(CUI.InnerRailToggle.EVENT_CLICK, function (event, orgEvent, widget) {
        var target = $(widget.getTarget()).attr('id') || '';
        self.setActiveInnerRailPanel(target);
      });
    },

    _updateInnerRailState: function () {
      if (this._innerRail) {
        var targetId = this._innerRail.getActivePanelId();
        if (targetId === '') {
          this.$element.removeClass(CLASS_INNER_RAIL_OPEN);
        } else {
          this.$element.addClass(CLASS_INNER_RAIL_OPEN);
        }
      }
      this._updateInnerRailToggleSelectedStates();
    },

    _updateInnerRailToggleSelectedStates: function () {
      var selected = this._innerRail ? this._innerRail.getActivePanel() : $();
      if (this._innerRailToggles) {
        this._innerRailToggles.forEach(function (toggle) {
          toggle.setSelected(selected.is(toggle.getTarget()));
        });
      }
    },

    _updateOuterRailToggleState: function () {
      if (this._outerRailToggle) {
        this._outerRailToggle.setIsClosed(this._outerRailIsClosed());
      }
    },

    _updateBreadcrumbBarIsCompact: function () {
      if (this._breadcrumbBar && this._outerRail) {
        this._breadcrumbBar.setIsCompact(this._outerRailIsClosed());
      }
    },

    _outerRailIsClosed: function () {
      if (!this._outerRail) {
        return false;
      }

      if (this._isCompact && this._innerRail && this._innerRail.getActivePanelId() !== '') {
        return true;
      }

      return this._outerRail.getIsClosed();
    }

  });

  CUI.Endor.util.registerWidget(CUI.Page);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_CRUMBS = 'endor-Crumbs',
      CLASS_CRUMBS_ITEM = 'endor-Crumbs-item',
      CLASS_ELLIPSIS = 'endor-Crumbs-item--ellipsis',
      CLASS_COLLAPSED = 'is-collapsed',

      SELECTOR_ELLIPSIS = '.' + CLASS_ELLIPSIS,

      MOD_UNAVAILABLE = CLASS_CRUMBS_ITEM + '--unavailable',
      MOD_NONAVIGATION = CLASS_CRUMBS_ITEM + '--noNavigation',

      HTML_ICON = '<i class="endor-Crumbs-item-icon coral-Icon"></i>',
      HTML_ELLIPSIS = '<a class="' + CLASS_CRUMBS_ITEM + ' ' + CLASS_ELLIPSIS + '" href="#"></a>',

      TRUNCATE_HORIZONTAL_SPACING = 100;

  CUI.Crumbs = new Class(/** @lends CUI.Crumbs# */{
    toString: 'Crumbs',
    extend: CUI.ShellWidget,

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Widget to display a series of links that know how to truncate when there's not enough space
     * to show all the links.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
    },

    /**
     * Set or update the first crumb.
     *
     * @param titleOrObjectOrElement {string | Object | jQuery}
     * @param href {string} Specifies the link to use, when the first argument is a string.
     *
     * @returns {jQuery}
     */
    setFirstItem: function (titleOrObjectOrElement, href) {
      var $item = this._itemFromTitleOrObjectOrElement(titleOrObjectOrElement, href);
      if (this._firstCrumb) {
        this._firstCrumb.replaceWith($item);
      } else {
        this.$element.prepend($item);
      }
      return this._firstCrumb = $item;
    },

    /**
     * Adds new a crumb. Returns the given or generated element
     *
     * @param titleOrObjectOrElement {string | Object | jQuery}
     * @param href {string} Specifies the link to use, when the first argument is a string.
     *
     * @returns {jQuery} The crumbs as it got added.
     */
    addItem: function (titleOrObjectOrElement, href) {

      var $item = this._itemFromTitleOrObjectOrElement(titleOrObjectOrElement, href);

      this.$element.append($item);
      return $item;
    },

    /**
     * Returns the currently present set of crumbs.
     *
     * @returns {jQuery}
     */
    getItems: function () {
      return this.$element.children().not(SELECTOR_ELLIPSIS);
    },

    /**
     * Removes last crumb and returns it.
     *
     * @returns {*}
     */
    removeItem: function () {
      var $item = this.$element.children(':last-child').remove();
      if ($item.is(this._firstCrumb)) {
        delete this._firstCrumb;
      } else if ($item.is(this._ellipsis)) {
        // Ellipsis is internal: remove the next crumb instead:
        return this._remoteItem();
      }
      return $item;
    },

    /**
     * Removes all crumbs, and returns them.
     *
     * @returns {*}
     */
    removeAllItems: function () {
      delete this._firstCrumb;
      return this.$element.children().remove().not(SELECTOR_ELLIPSIS);
    },

    /**
     * Truncate each item just enough to fit all crumbs. The first and the last
     * item always stay.
     */
    truncate: function () {


      var items = this.$element.children(),
          availableWidth = this.$element.width() - TRUNCATE_HORIZONTAL_SPACING;

      items.removeClass(CLASS_COLLAPSED);
      this._ellipsis.remove();

      var fullWidth = Array.prototype.reduce.call(items, function (memo, v) {
        return memo += $(v).outerWidth();
      }, 0);

      if (items.length && (fullWidth > availableWidth)) {

        // Truncate each item just enough. The first and the last item always stay:
        var w = fullWidth;
        for (var i = 1, ln = items.length - 1; i < ln && w > availableWidth; i++) {
          var item = $(items[i]);
          w -= item.width();
          item.addClass(CLASS_COLLAPSED);
        }

        this._ellipsis.insertAfter(items[0]).addClass(CLASS_COLLAPSED);
      }
    },

    /**
     * Returns the last available and navigable item from the list of set items.
     *
     * @returns {*}
     */
    getLastNavigableItem: function () {
      var result;
      this.$element.children().toArray().reverse().some(function (item) {
        var $element = $(item);
        if ($element.hasClass(MOD_UNAVAILABLE) || $element.hasClass(MOD_NONAVIGATION)) {
          return false;
        }
        else {
          result = $element;
          return true;
        }
      });
      return result ? result.eq(0) : $();
    },

    // Internals //

    _brand: null,
    _ellipsis: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._decorateElement();
      this._findOrCreateEllipsis();

      this.truncate();
    },

    _decorateElement: function () {
      if (!this.$element.is('nav')) {
        throw new Error('CUI.Crumbs expects to be attached to a nav element');
      }

      this.$element.addClass(CLASS_CRUMBS);
      this.$element.children().addClass(CLASS_CRUMBS_ITEM);
    },

    _findOrCreateEllipsis: function () {
      var $ellipsis = this.$element.find(SELECTOR_ELLIPSIS);
      if ($ellipsis.length === 0) {
        $ellipsis = $(HTML_ELLIPSIS);
      }
      this._ellipsis = $ellipsis;
    },

    _itemFromTitleOrObjectOrElement: function (titleOrObjectOrElement, href) {
      var a1 = titleOrObjectOrElement,
          title = (typeof a1 === 'string') ? a1 : undefined,
          object = $.isPlainObject(a1) ? a1 : undefined,
          element = (a1 && a1.jquery) ? a1 : undefined,
          $item;

      if (element) {
        $item = element;
        $item.addClass(CLASS_CRUMBS_ITEM);
      } else if (object) {
        $item = this._constructItemFromObject(object);
      } else {
        $item = this._constructItemFromTitleAndRef(title, href);
      }
      return $item;
    },

    _constructItemFromTitleAndRef: function (title, href) {

      return $('<a>').
          attr('href', href).
          text(title).
          addClass(CLASS_CRUMBS_ITEM);
    },

    _constructItemFromObject: function (object) {

      var $anchor = this._constructItemFromTitleAndRef(object.title, object.href);

      if (object.hasOwnProperty('isAvailable') && !object.isAvailable) {
        $anchor.addClass(MOD_UNAVAILABLE);
        $anchor.attr('tabindex', -1);
      }
      if (object.hasOwnProperty('isNavigable') && !object.isNavigable) {
        $anchor.addClass(MOD_NONAVIGATION);
      }
      if (object.hasOwnProperty('icon')) {
        var $icon = $(HTML_ICON);
        $icon.addClass(object.icon);
        $anchor.prepend($icon);
      }
      return $anchor;
    }
  });

  /**
   * Determine if an element is considered to be 'unavailable' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isUnavailable = function ($item) {
    return $item && $item.hasClass(MOD_UNAVAILABLE);
  };

  /**
   * Determine if an element is considered to be 'no-navigation' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isNoNavigation = function ($item) {
    return $item && $item.hasClass(MOD_NONAVIGATION);
  };

  /**
   * Determine if an element is considered to be 'navigable' by CUI.Crumbs
   *
   * @static
   * @param $item {jQuery}
   * @returns {boolean}
   */
  CUI.Crumbs.isNavigable = function ($item) {
    var unavailable = CUI.Crumbs.isUnavailable($item),
        noNavigation = CUI.Crumbs.isNoNavigation($item);

    return $item &&
        $item.is('.' + CLASS_CRUMBS_ITEM) && !(unavailable || noNavigation);
  };

  CUI.Crumbs.CLASS_ITEM_UNAVAILABLE = MOD_UNAVAILABLE;
  CUI.Crumbs.CLASS_ITEM_NONAVIGATION = MOD_NONAVIGATION;

  CUI.Endor.util.registerWidget(CUI.Crumbs);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Panel-header endor-ActionBar',

      CLASS_LEFT = 'endor-ActionBar-left',
      CLASS_RIGHT = 'endor-ActionBar-right',
      CLASS_ITEM = 'endor-ActionBar-item',
      CLASS_ITEM_TEXT = CLASS_ITEM + '--text';

  CUI.ActionBar = new Class(/** @lends CUI.ActionBar# */{
    toString: 'ActionBar',
    extend: CUI.Widget,

    // Public API //

    /**
     * @extends CUI.Widget
     * @classdesc Used to define the bar that goes on top of a page, just below the black bar.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init(options);
    },

    /**
     * Add an element to the bar.
     *
     * @param item {jQuery | string} The element to add. Can be either a selector, or a jQuery object.
     * @param options
     * @param options.isText {string} If true, marks up the element as text.
     * @param options.right {boolean} If true, the element gets added
     * to the bar's right hand side.
     * @returns {jQuery} The element as it got added.
     */
    addItem: function (item, options) {

      var $container = (options && options.right === true) ?
              this._rightContainer :
              this._leftContainer,
          isText = options && options.isText;

      item = $(item);
      item.addClass(CLASS_ITEM + (isText ? ' ' + CLASS_ITEM_TEXT : ''));

      $container.append(item);

      return item;
    },

    /**
     * Remove an element from the bar.
     *
     * @param item {jQuery | string} The element to remove. Can be either a selector, or a jQuery object.
     * @returns {jQuery} The element as it got removed.
     */
    removeItem: function (item) {
      item = this.$element.find(item);
      return item.remove();
    },

    /**
     * @returns {jQuery} The bar's left hand side container element.
     */
    getLeftContainer: function () {
      return this._leftContainer;
    },

    /**
     * @returns {jQuery} The bar's right hand side container element.
     */
    getRightContainer: function () {
      return this._rightContainer;
    },

    // Internals //

    _leftContainer: $(),
    _rightContainer: $(),

    _init: function (options) {
      this._setupElement();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);

      var $container;

      $container = this.$element.children('div.' + CLASS_LEFT);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_LEFT)
            .appendTo(this.$element);
      }
      this._leftContainer = $container.eq(0);

      $container = this.$element.children('div.' + CLASS_RIGHT);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_RIGHT)
            .appendTo(this.$element);
      }
      this._rightContainer = $container.eq(0);
    }

  });

  CUI.Widget.registry.register('actionBar', CUI.ActionBar);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.ActionBar.init($('[data-init~="action-bar"]', event.target));
    });
  }

  // When this code gets moved out of the shell repository, then this bit needs
  // to stay behind, to be called *after* the widget gets defined.
  CUI.ShellWidgetMixin.applyTo(CUI.ActionBar);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Footer endor-Panel-footer endor-Footer--sticky',

      CLASS_COPYRIGHT = 'endor-Footer-copyright',
      CLASS_LINKS = 'endor-Footer-links',
      CLASS_ITEM = 'endor-Footer-item',

      SELECTOR_COPYRIGHT = 'span.' + CLASS_COPYRIGHT,
      SELECTOR_LINKS = 'div.' + CLASS_LINKS;

  CUI.Footer = new Class(/** @lends CUI.Footer# */{
    toString: 'Footer',
    extend: CUI.ShellWidget,

    defaults: {
      copyright: '© 2014 Adobe Systems Incorporated. All Rights Reserved.'
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a shell footer.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.copyright="© 2014 Adobe Systems Incorporated. All Rights Reserved."] Copyright text.
     */
    construct: function (options) {
    },

    /**
     * Set the copyright text.
     *
     * @param value {string} Copyright text.
     */
    setCopyright: function (value) {
      if (value !== this.options.copyright) {
        if (this._set('copyright', value) !== this) {
          this._updateCopyrightDOM();
        }
      }
    },

    /**
     * Add a footer item(s).
     *
     * @param item {Array | jQuery | string}
     * @returns {Array | jQuery} The item(s) as added.
     */
    addItem: function (item) {
      if ($.isArray(item)) {
        return item.map(this.addItem, this);
      }

      return $(item)
          .addClass(CLASS_ITEM)
          .appendTo(this._$items);
    },

    /**
     * Remove a footer item.
     *
     * @param item
     * @returns {jQuery} The removed item.
     */
    removeItem: function (item) {
      return this._$items.find(item).remove();
    },

    // Internals //

    _$copyright: $(),
    _$items: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._setupElement();
      this._updateCopyrightDOM();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);

      var $container;

      $container = this.$element.children(SELECTOR_COPYRIGHT);
      if (!$container.length) {
        $container = $('<span>')
            .addClass(CLASS_COPYRIGHT)
            .appendTo(this.$element);
      }
      this._$copyright = $container.eq(0);

      $container = this.$element.children(SELECTOR_LINKS);
      if (!$container.length) {
        $container = $('<div>')
            .addClass(CLASS_LINKS)
            .appendTo(this.$element);
      }
      this._$items = $container.eq(0);
    },

    _updateCopyrightDOM: function () {
      this._$copyright.text(this.options.copyright || '');
    }

  });

  CUI.Endor.util.registerWidget(CUI.Footer);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_COMPACT = 'is-compact',

      SELECTOR_CLOSEINDICATOR = 'div.endor-BreadcrumbBar-closeIndicator',

      HTML_CLASSES = 'endor-Panel-header endor-BreadcrumbBar js-endor-breadcrumb-bar',
      HTML_NAV = '<nav class="endor-Crumbs">',
      HTML_CLOSEINDICATOR = [
        '<div class="endor-BreadcrumbBar-closeIndicator">',
        '  <i class="coral-Icon coral-Icon--chevronUp coral-Icon--sizeS"></i>',
        '</div>'
      ].join('');

  CUI.BreadcrumbBar = new Class(/** @lends CUI.BreadcrumbBar# */{
    toString: 'BreadcrumbBar',
    extend: CUI.Closable,

    $closeIndicatorElement: null,
    $navElement: null,
    crumbsWidget: null,

    defaults: $.extend({},
        CUI.Closable.defaults,
        {
          isCompact: false,
          closeOnNavigate: false,
          closeOnClick: false,
          hideCloseIndicator: false
        }),

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the shell breadcrumb bar container.
     *
     * @constructs
     * @param {Object} options
     * @param {boolean} [options.isCompact=false] Whether the first item in the breadcrumb should be hidden. Use setIsCompact or toggleIsCompact methods to update this option post initialization.
     * @param {boolean} [options.closeOnNavigate=false] Whether the breadcrumb bar should be closed when a navigable
     * breadcrumb item is clicked.
     * @param {boolean} [options.closeOnClick=false] Whether the breadcrumb bar should be closed when it is clicked.
     * When set to false, the breadcrumb bar will still be closed when the close indicator is clicked.
     * @param {boolean} [options.hideCloseIndicator=false] Whether the close indicator should be hidden.
     */
    construct: function (options) {
    },


    /**
     * Find out if the bar is in a compact state.
     * @returns {boolean} True when the breadcrumb bar is in a compact state.
     */
    getIsCompact: function () {
      return this.options.isCompact;
    },

    /**
     * Set the bar's compact state.
     * @param value {boolean} True when the breadcrumb bar should go into a compact state. False otherwise.
     * @returns {boolean} The value of options.isCompact.
     */
    setIsCompact: function (value) {
      if (value !== this.options.isCompact) {
        if (this._set('isCompact', value) !== this) {
          if (value) {
            this.$element.addClass(CLASS_COMPACT);
          } else {
            this.$element.removeClass(CLASS_COMPACT);
          }
        }
      }
      return value;
    },

    /**
     * Toggle the bar's compact state. When options.isCompact is true, the invocation of this method will
     * result in options.isCompact to become false. Otherwise options.isCompact will be set to true.
     * @returns {boolean} The value of options.isCompact
     */
    toggleIsCompact: function () {
      return this.setIsCompact(!this.options.isCompact);
    },

    // Internals //

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {

      this.inherited(arguments);

      // Have the mere presence of an attribute toggle the setting 'true' (unless set 'false'
      // specifically):
      this.options.isCompact = this.options.isCompact !== false;
      this.options.closeOnNavigate = this.options.closeOnNavigate !== false;
      this.options.closeOnClick = this.options.closeOnClick !== false;
      this.options.hideCloseIndicator = this.options.hideCloseIndicator !== false;

      this.$element.addClass(HTML_CLASSES);
      this.$navElement = this._getOrConstructNavElement();
      this.crumbsWidget = this._getOrConstructCrumbsWidget();
      this.$closeIndicatorElement = this._getOrConstructCloseIndicator();
      this._setupCloseIndicator();

      this.options.isCompact = this.$element.hasClass(CLASS_COMPACT);

      // Listen to the bar being clicked:
      this.$element.on('click', this._handleElementClick.bind(this));
    },

    _getOrConstructNavElement: function () {
      var $nav = this.$element.children('nav').eq(0);
      if ($nav.length === 0) {
        $nav = $(HTML_NAV);
        this.$element.prepend($nav);
      }
      return $nav;
    },

    _getOrConstructCrumbsWidget: function () {
      var $nav = this.$navElement,
          widget = CUI.Widget.fromElement(CUI.Crumbs, $nav);
      if (!widget) {
        widget = new CUI.Crumbs({ element: $nav});
      }
      return widget;
    },

    _getOrConstructCloseIndicator: function () {
      var $indicator = this.$element.children(SELECTOR_CLOSEINDICATOR).eq(0);
      if ($indicator.length === 0) {
        $indicator = $(HTML_CLOSEINDICATOR);
        this.$element.append($indicator);
      }
      return $indicator;
    },

    _setupCloseIndicator: function () {
      if (this.options.hasOwnProperty('hideCloseIndicator')) {
        this.options.hideCloseIndicator = this.options.hideCloseIndicator === true;
      }
      if (this.options.hideCloseIndicator) {
        this.$closeIndicatorElement.remove();
        this.$closeIndicatorElement = undefined;
      }
    },

    _handleElementClick: function (event) {
      var $target = $(event.target),
          close = this.options.closeOnClick;

      if (this.$closeIndicatorElement && this.$closeIndicatorElement.find($target).length) {
        // Close if the close-indicator got clicked:
        close = true;
      } else if (CUI.Crumbs.isNavigable($target)) {
        // Close a navigable item only when options allow to:
        close = this.options.closeOnNavigate;
      }

      if (close) {
        this.setIsClosed(true);
      }
    }

  });

  CUI.Endor.util.registerWidget(CUI.BreadcrumbBar);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_ICON = '<i></i>',
      CLASS_BRAND = 'endor-Brand',
      CLASS_BRAND_ICON = 'endor-Brand-icon',

      SELECTOR_BRAND_ICON = '.' + CLASS_BRAND_ICON,

      DEFAULTS = {
        icon: 'coral-Icon coral-Icon--hammer coral-Icon--sizeM',
        title: 'CoralUI',
        href: 'http://coralui.corp.adobe.com'
      };

  CUI.Brand = new Class(/** @lends CUI.Brand# */{
    toString: 'Brand',
    extend: CUI.Closable,

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the appearance of the application bar that's usually placed in the outer rail.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.icon="coral-Icon coral-Icon--hammer coral-Icon--sizeM"] One or more (space delimited) class names that will be set on the internal icon tag in order to depict the desired icon. Use the setIcon method to update this option from JavaScript.
     * @param {string} [options.title="CoralUI"] The title of the brand. Use the setTitle method to update this option from JavaScript.
     * @param {string} [options.href="http://coralui.corp.adobe.com"] The URL to open when the brand icon or text is clicked. Use the setHref method to update this option from JavaScript.
     */
    construct: {
    },

    /**
     * Update the brand's title text. The newly set value is store on the widget's options object.
     * @param value {string} The title text.
     */
    setTitle: function (value) {
      if (value !== this.options.title) {
        if (this._set('title', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Update the brand's link. The newly set value is store on the widget's options object.
     * @param value The URL to open when the brand icon or text is clicked.
     */
    setHref: function (value) {
      if (value !== this.options.href) {
        if (this._set('href', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Update the classes that are to be set on the brand's internal icon element.
     * @param value {string} One or more (space delimited) class names that will be set on the internal icon tag in order to depict the desired icon.
     */
    setIcon: function (value) {
      if (value !== this.options.icon) {
        if (this._set('icon', value) !== this) {
          this._updateAppearance();
        }
      }
    },

    // Internals //

    $icon: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._decorateElement();

      this._findOrCreateIcon();
      this._findOrCreateText();

      this._updateAppearance();

      this.on('click', this._handleClick.bind(this));
    },

    _decorateElement: function () {
      this.$element.addClass(CLASS_BRAND);
      if (!this.options.hasOwnProperty('href')) {
        this.options.href = this.$element.attr('href') || DEFAULTS.href;
      }
    },

    _findOrCreateIcon: function () {
      var $icon = this.$element.children(SELECTOR_BRAND_ICON);
      if ($icon.length === 0) {

        $icon = $(HTML_ICON)
            .prependTo(this.$element);

        // Set default in absence of client set option:
        if (!this.options.hasOwnProperty('icon')) {
          this.options.icon = DEFAULTS.icon;
        }
      } else {

        // Existing <i> tag: adopt its classes, if set:
        if (!this.options.hasOwnProperty('icon')) {
          this.options.icon = $icon.attr('class')
              .split(' ')
              .filter(function (item) {
                return item !== CLASS_BRAND_ICON;
              })
              .join(' ') || DEFAULTS.icon;
        }
      }
      return this.$icon = $icon;
    },

    _findOrCreateText: function () {
      var $text = this._getTextNode();
      if ($text.length === 0) {
        if (!this.options.hasOwnProperty('title')) {
          this.options.title = DEFAULTS.title;
        }

        $text = $(document.createTextNode(this.options.title))
            .appendTo(this.$element);

      } else {
        if (!this.options.hasOwnProperty('title')) {
          this.options.title = $text.text();
        }
      }
      return $text;
    },

    _updateAppearance: function () {

      // Update link:
      if (this.options.href && this.options.href !== "") {
        this.$element.attr('href', this.options.href);
      }

      // Update title:
      this._getTextNode().replaceWith(document.createTextNode(this.options.title));

      // Update icon:
      this.$icon.removeClass();
      this.$icon.addClass(CLASS_BRAND_ICON);
      this.$icon.addClass(this.options.icon);
    },

    _getTextNode: function () {
      return this.$element
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .eq(0);
    },

    _handleClick: function (event) {
      if (!this.options.href) {
        event.preventDefault();
        this.$element.trigger(CUI.Brand.EVENT_CLICK, event);
      }
    }

  });

  /**
   * Event dispatched when the brand gets clicked ONLY when the
   * href option resolves to 'false'.
   *
   * Dispatched from the target DOM element.
   *
   */

  /**
   * Event dispatched when the brand gets clicked ONLY when the href option resolves to 'false'. It is recommended to use CUI.Brand.EVENT_CLICK instead of this literal.
   *
   * @event CUI.Brand#cui-brand-click.
   */

  /**
   * The type of the event that is triggered when the brand icon or text is clicked (and href is falsy)
   * @type {string}
   */
  CUI.Brand.EVENT_CLICK = 'cui-brand-click';

  CUI.Endor.util.registerWidget(CUI.Brand);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_CLASSES = 'js-endor-inner-rail endor-Page-sidepanel endor-Page-sidepanel--innerRail',

      CLASS_ACTIVE = 'is-active',
      CLASS_PANEL = 'coral-MultiPanel',

      SELECTOR_PANEL = '.' + CLASS_PANEL,
      SELECTOR_ACTIVE = '.' + CLASS_ACTIVE;

  CUI.InnerRail = new Class(/** @lends CUI.InnerRail# */{
    toString: 'InnerRail',
    extend: CUI.ShellWidget,

    defaults: {
      activePanelId: ''
    },

    // Public API //

    /**
     * @extends CUI.ShellWidget
     * @classdesc Widget that holds a number of panels, one or none of which may appear at the left hand side
     * of the page's main content area.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.activePanelId=""] The value of the id attribute of the panel that should be set active. Post initialization, update this option using the <code>setActivePanel</code> or <code>setActivePanelId</code> method.
     */
    construct: {
    },

    /**
     * @returns {jQuery} The $element that is currently active.
     */
    getActivePanel: function () {
      return this._getActivePanelById(this.options.activePanelId);
    },

    /**
     * @returns {string} The value of the id attribute of the panel that is currently active.
     */
    getActivePanelId: function () {
      return this.options.activePanelId;
    },

    /**
     * Set what panel should be active. Setting an invalid element or null
     * causes the inner rail to close.
     *
     * @param panel {jQuery} The panel to activate.
     * @returns {*}
     */
    setActivePanel: function (panel) {
      var id = $(panel).attr('id');
      return this.setActivePanelId(id);
    },

    /**
     * Set what panel should be active, by passing its id. Setting an
     * id that does not resolve to a panel results in the inner rail
     * closing.
     *
     * @param id
     */
    setActivePanelId: function (id) {
      if (id !== this.options.activePanelId) {
        if (this._set('activePanelId', id) !== this) {
          this._updateAppearance();
        }
      }
    },

    /**
     * Add a panel.
     *
     * @param panel {jQuery | string | Array} The panel(s) to add.
     * @returns {jQuery} The panel as added.
     */
    addPanel: function (panel) {
      if ($.isArray(panel)) {
        return panel.map(this.addPanel, this);
      }

      return CUI.Endor.util.ensureElementId(panel).
          addClass(CLASS_PANEL).
          appendTo(this.$element);
    },

    /**
     * Remove a panel. If the panel that is removed is the active panel,
     * then the active panel becomes undefined.
     *
     * @param {jQuery} The panel to remove
     * @returns {*}
     */
    removePanel: function (panel) {
      if (panel.attr('id') === this.options.activePanelId) {
        this.setActivePanelId('');
      }
      panel.remove();

      return panel;
    },

    // Internals //

    _init: function (options) {

      this.inherited(arguments);

      this.$element.addClass(HTML_CLASSES);
      this._parseHTML();
      this._updateAppearance();
    },

    _parseHTML: function () {
      // Find preset panels:
      var panels = this._getPanels();

      // Make sure all panels have an ID:
      panels.each(function () {
        CUI.Endor.util.ensureElementId(this);
      });

      // If options holds no selection, see if the HTML holds an active
      // panel:
      if (!this.options.activePanelId || this.options.activePanelId === '') {
        var panel = panels.filter(SELECTOR_ACTIVE);
        if (panel.length) {
          this.options.activePanelId = panel.attr('id');
        }
      }
    },

    _updateAppearance: function () {
      var activeCSS = this._getActivePanelByCSS(),
          activeID = this._getActivePanelById();

      if (!activeID.length) {
        // no-op: without an active id set, the inner rail should be hidden: no use
        // updating its appearance.
        return;
      }

      if (activeCSS.length && activeCSS.eq(0).attr('id') === activeID.eq(0).attr('id')) {
        // no-op: the correct element is set selected already.
        return;
      }

      activeCSS.removeClass(CLASS_ACTIVE);
      activeID.addClass(CLASS_ACTIVE);
    },

    _getPanels: function () {
      return this.$element.children(SELECTOR_PANEL);
    },

    _getActivePanelById: function () {
      return this.options.activePanelId ? this.$element.children('#' + this.options.activePanelId) : $();
    },

    _getActivePanelByCSS: function () {
      return this.$element.children(SELECTOR_PANEL + SELECTOR_ACTIVE);
    }

  });

  CUI.Endor.util.registerWidget(CUI.InnerRail);

}(jQuery, this));

(function ($, window, undefined) {

  var CLASS_IS_SELECTED = 'is-selected',
      SELECTOR_LABEL = '.endor-ActionButton-label';

  CUI.InnerRailToggle = new Class(/** @lends CUI.InnerRailToggle# */{
    toString: 'InnerRailToggle',
    extend: CUI.ShellWidget,
    _isSingleton: false,

    // Public API //

    defaults: {
      target: '',
      label: null,
      prefixSelected: 'Hide',
      prefixUnselected: 'Show',
      selected: false
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a widget that reflects the selected state of an inner rail panel. The target inner rail is
     * specified by the data-target attribute. Note thay by itself, the InnerRailToggle will not show or hide a panel
     * on being clicked. For that to happen and instance of CUI.Page must be loaded too.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.target=""] The selector to the panel element that this toggle toggles.
     * @param {string} [options.label=null] The label to be shown with the toggle. The widget applies the label using jQuery text() on any child element that bears the endor-ActionButton-label class.
     * @param {string} [options.prefixSelected="Hide"] String with which to prefix the label when selected.
     * @param {string} [options.prefixUnselected="Show"] String with which to prefix the label when not selected.
     * @param {boolean} [options.selected=false] Boolean indicating whether the toggle should be in a selected state.
     */
    construct: {
    },

    /**
     * Get the selector for the panel that this toggle is bound to.
     * @returns {String}
     */
    getTarget: function () {
      return this.options.target;
    },

    /**
     * Sets the toggle's selected state.
     *
     * @param {Boolean} value
     * @param {Boolean} [force] Used internally (forces an update even if the set value didn't change).
     */
    setSelected: function (value, force) {
      if (force || (value !== this.options.selected)) {
        if (this._set('selected', value) !== this) {
          if (value) {
            this.$element.addClass(CLASS_IS_SELECTED);
          } else {
            this.$element.removeClass(CLASS_IS_SELECTED);
          }
          this._updateLabelDOM();
        }
      }
    },

    /**
     * Sets the toggle's associated label. Note that the widget applies the label using jQuery text() on
     * any child element that bears the "endor-ActionButton-label" class. Without such a child element,
     * no label will show.
     *
     * @param {Boolean} value
     * @param {Boolean} [force] Used internally (forces an update even if the set value didn't change).
     */
    setLabel: function (value, force) {
      if (force || (value !== this.options.label)) {
        if (this._set('label', value) !== this) {
          this._updateLabelDOM();
        }
      }
    },

    // Internals //

    _init: function (options) {
      this.inherited(arguments);

      if (this.options.label === null) {
        // When there's no label set, use what's on the DOM:
        this.options.label = $.trim(this.$element.find(SELECTOR_LABEL).text());
      }

      this.setLabel(this.options.label, true);
      this.setSelected(this.options.selected, true);

      this.$element.on('click', function (event) {
        event.preventDefault();
        this.$element.trigger(CUI.InnerRailToggle.EVENT_CLICK, [event, this]);
      }.bind(this));
    },

    _updateLabelDOM: function () {
      var $label = this.$element.find(SELECTOR_LABEL);
      if ($label.length) {
        var label = '';
        if (this.options.selected && this.options.prefixSelected) {
          label = this.options.prefixSelected + ' ';
        } else if (!this.options.selected && this.options.prefixUnselected) {
          label = this.options.prefixUnselected + ' ';
        }
        label += this.options.label;
        $label.eq(0).text(label);
      }
    }

  });

  /**
   * Event emitted when the user clicks the toggle.
   *
   * @type {string}
   */
  CUI.InnerRailToggle.EVENT_CLICK = 'cui-inner-rail-toggle-click';

  CUI.Endor.util.registerWidget(CUI.InnerRailToggle);

}(jQuery, this));

(function ($, window, undefined) {

  var HTML_CLASSES = 'js-endor-navrail endor-Page-sidepanel endor-Page-sidepanel--navigation',
      THEME_DARK = 'dark',
      CLASS_DARK =  'coral--dark';

  CUI.OuterRail = new Class(/** @lends CUI.OuterRail# */{
    toString: 'OuterRail',
    extend: CUI.Closable,

    defaults: {
      generateBrand: false,
      brandOptions: null,
      theme: THEME_DARK
    },

    // Public API //

    /**
     * @extends CUI.Closable
     * @classdesc Defines the container that usually holds the shell application's navigation. Can
     * be set to generate a child <code>CUI.Brand</code> widget.
     *
     * @constructs
     * @param {Object} options
     * @param {Boolean} [options.generateBrand=false] When set to true an anchor element will be inserted as the first child of the target element, to which a CUI.Brand instance will be bound.
     * @param {Object} [options.brandOptions=null] The options that the widget will forward to CUI.Brand on constructing it. See CUI.Brand for the available fields.
     * @param {theme} [options.theme="dark"] When set to 'dark' the widget will add the 'coral--dark' class to the target element.
     */
    construct: {
    },

    // Internals //

    _init: function (options) {
      this.inherited(arguments);
      this._setupElement();
    },

    _setupElement: function () {

      this.$element.addClass(HTML_CLASSES);
      if (this.options.theme === THEME_DARK) {
        this.$element.addClass(CLASS_DARK);
      }

      // Accept just the attribute as 'true':
      this.options.generateBrand = this.options.generateBrand !== false;
      if (this.options.generateBrand) {
        var $brand = $('<a></a>').prependTo(this.$element);
        new CUI.Brand($.extend(
            { element: $brand },
            { isClosed: false },
            this.options.brandOptions
        ));
      }
    }
  });

  CUI.Endor.util.registerWidget(CUI.OuterRail);

}(jQuery, this));

(function ($, window, undefined) {

  var SELECTOR_ICON = 'i.coral-Icon',

      CLASS_NAV = 'endor-BlackBar-nav',
      CLASS_ACTIVE = 'is-active',

      HTML_ICON = '<i class="coral-Icon coral-Icon--navigation"></i>';

  CUI.OuterRailToggle = new Class(/** @lends CUI.OuterRailToggle# */{
    toString: 'OuterRailToggle',
    extend: CUI.ShellWidget,

    // Public API //

    defaults: {
      isClosed: false,
      title: "Toggle Rail"
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc Defines a widget that reflects the closed state of the outer rail panel.
     *
     * Note that by itself, the OuterRailToggle will not show or hide a panel on being clicked. For that to happen and instance of CUI.Page must be loaded too.
     *
     * @constructs
     * @param {Object} options
     * @param {boolean} [isClosed=false] The initial rail state that the toggle should reflect. Use the <code>setIsClosed</code> method to update the toggle's state at a later time.
     * @param {string} [title="Toggle Rail"] The initial title for the toggle. Use the <code>setTitle</code> method to update the toggle's title at a later time.
     */
    construct: {
    },

    /**
     * Update the outer rail state that the toggle should reflect.
     * @param {boolean} value True when the outer rail is closed, false otherwise.
     */
    setIsClosed: function (value) {
      this.options.isClosed = value;
      this._updateDOM();
    },

    /**
     * Update toggle's title attribute.
     * @param {string} value The new title value to set.
     */
    setTitle: function (value) {
      this.options.title = value;
      this._updateDOM();
    },

    // Internals //

    _init: function (options) {

      this.options.title = this.$element.attr('title') || this.options.title;

      this.$element.addClass(CLASS_NAV);

      var icon = this.$element.children(SELECTOR_ICON);
      if (!icon.length) {
        this.$element.prepend(HTML_ICON);
      }

      this.$element.on('click', function (event) {
        event.preventDefault();
        this.$element.trigger(CUI.OuterRailToggle.EVENT_CLICK, [event, this]);
      }.bind(this));

      this._updateDOM();
    },

    _updateDOM: function() {
      this.$element.attr('title', this.options.title);
      if (this.options.isClosed) {
        this.$element.removeClass(CLASS_ACTIVE);
      } else {
        this.$element.addClass(CLASS_ACTIVE);
      }
    }

  });

  /**
   * Event emitted when the user clicks the toggle. It is recommended to use CUI.OuterRailToggle.EVENT_CLICK instead of this literal.
   *
   * @event CUI.OuterRailToggle#cui-outer-rail-toggle-click
   */

  /**
   * The type of the event that is triggered when the toggle is clicked.
   * @type {string}
   */
  CUI.OuterRailToggle.EVENT_CLICK = 'cui-outer-rail-toggle-click';

  CUI.Endor.util.registerWidget(CUI.OuterRailToggle);

}(jQuery, this));

(function ($, window) {

  var HTML_CLASSES = 'endor-Panel-header endor-BlackBar',

      SELECTOR_NAV_TOGGLE = '.endor-BlackBar-nav',
      HTML_NAV_TOGGLE = '<button></button>',

      SELECTOR_BACK_BUTTON = '.endor-BlackBar-back',
      HTML_BACK_BUTTON =
          '<button class="endor-BlackBar-back js-endor-BlackBar-back" title="Back">' +
              '<i class="coral-Icon coral-Icon--chevronLeft"></i>' +
              '</button>',

      SELECTOR_TITLE = '.endor-BlackBar-title',
      HTML_TITLE =
          '<div role="heading" aria-level="1" class="endor-BlackBar-title">' +
              '</div>',

      SELECTOR_RIGHT_CONTENTS = '.endor-BlackBar-right',
      HTML_RIGHT_CONTENTS = '<div class="endor-BlackBar-right"></div>',

      CLASS_ITEM = 'endor-BlackBar-item',
      CLASS_ITEM_HIDEN_XS = 'u-coral-hiddenXS',
      CLASS_ITEM_TEXT = 'endor-BlackBar-item--text';

  CUI.BlackBar = new Class(/** @lends CUI.BlackBar# */{
    toString: 'BlackBar',
    extend: CUI.ShellWidget,

    defaults: {
      title: undefined,
      noNavToggle: false,
      noBackButton: false,
      noTitle: false
    },

    /**
     * @extends CUI.ShellWidget
     * @classdesc The BlackBar component is the part of the shell that goes over the main page. It usually holds the current page's title, a hamburger icon for toggling the outer rail, and a back button. Most of these items can be toggled off, and additional items can be added to the right hand side of the component.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.title=undefined] The initial title that should be set on the black bar. The black bar resolves the title element looking for the 'endor-Black-title' class. After initialization this option can be updated via the setTitle method.
     * @param {boolean} [options.noNavToggle=false] When raised, the widget will not generate a nav toggle at initialization time.
     * @param {boolean} [options.noBackButton=false] When raised, the widget will not generate a back button at initialization time.
     * @param {boolean} [options.noTitle=false] When raised, the widget will not generate a title at initialization time.
     */
    construct: function (options) {
    },

    /**
     * Update the black bar's title.
     * @param value {string} The new title to set.
     * @param [force] {Boolean} Used internally to force the widget to update the DOM even if the passed value is equal to the currently set title.
     */
    setTitle: function (value, force) {
      if (force || value != this.options.value) {
        if (this._set('title', value) !== this || force) {
          this._titleBar.html(CUI.Endor.util.escapeHtml(this.options.title || ''));
        }
      }
    },

    /**
     * Add an element to the right hand side of the bar.
     *
     * @param item {jQuery | string} The element to add.
     * @param options
     * @param options.isText {string} If true, marks up the element as text.
     * to the bar's right hand side.
     * @returns {jQuery} The element as it got added.
     */
    addItem: function (item, options) {

      var $container = this._rightContainer,
          isText = options && options.isText;

      item = $(item);
      item.addClass(CLASS_ITEM + (isText ? ' ' + CLASS_ITEM_TEXT : ''))
          .addClass(CLASS_ITEM_HIDEN_XS);

      $container.append(item);

      return item;
    },

    /**
     * Remove an element from the bar.
     *
     * @param item {jQuery | string} The element to remove.
     * @returns {jQuery} The element as it got removed.
     */
    removeItem: function (item) {
      item = this._rightContainer.find(item);
      return item.remove();
    },

    getRightContainer: function () {
      return this._rightContainer;
    },

    // Internals //

    _backButton: null,
    _titleBar: null,
    _rightContainer: $(),

    _init: function (options) {

      this.inherited(arguments);

      this._setupElement();

      this._initLeftBarContents();
      this._initRightBarContents();
      this._initTitleBar();
    },

    _setupElement: function () {
      this.$element.addClass(HTML_CLASSES);
    },

    _initLeftBarContents: function () {

      // Generate a nav toggle if need be:
      var navToggle = this.$element.find(SELECTOR_NAV_TOGGLE);
      if (!this.options.noNavToggle && !navToggle.length) {
        navToggle = $(HTML_NAV_TOGGLE).prependTo(this.$element);
        new CUI.OuterRailToggle({
          element: navToggle
        });
      }

      // Generate a back button if need be:
      this._backButton = this.$element.find(SELECTOR_BACK_BUTTON);
      if (!this._backButton.length && !this.options.noBackButton) {
        this._backButton = $(HTML_BACK_BUTTON).insertAfter(navToggle);
      }
      this._backButton.on('click', this._getRedispatchingHandler(CUI.BlackBar.EVENT_BACK_BUTTON_CLICK));
    },

    _initTitleBar: function () {
      var title = this.options.title;

      this._titleBar = this.$element.find(SELECTOR_TITLE);
      if (!this._titleBar.length && !this.options.noTitle) {
        this._titleBar = $(HTML_TITLE).appendTo(this.$element);
        this.setTitle(title, true);
      } else if (title === undefined) {
        title = this._titleBar.html();
        this.options.title = title;
      } else {
        this.setTitle(title, true);
      }

      this._titleBar.on('click', this._getRedispatchingHandler(CUI.BlackBar.EVENT_TITLE_CLICK));
    },

    _initRightBarContents: function () {
      //Create the right content container if it doesn't exist yet.
      this._rightContainer = this.$element.find(SELECTOR_RIGHT_CONTENTS);
      if (!this._rightContainer.length) {
        this._rightContainer = $(HTML_RIGHT_CONTENTS).appendTo(this.$element);
      }
    },

    // Tools //

    _getRedispatchingHandler: function (type) {
      return function (event) {
        event.preventDefault();
        this.$element.trigger(type, [event, this]);
      }.bind(this);
    }

  });



  /**
   * Triggered when the user clicks the black bar title. It is recommended to use
   * CUI.BlackBar.EVENT_TITLE_CLICK instead of this literal.
   *
   * @event CUI.BlackBar#cui-blackbar-title-click.
   */

  /**
   * The type of the event that is triggered when the title bar is clicked.
   * @type {string}
   */
  CUI.BlackBar.EVENT_TITLE_CLICK = 'cui-blackbar-title-click';

  /**
   * Triggered when the user clicks the black bar back button. It is recommended to use
   * CUI.BlackBar.EVENT_BACK_BUTTON_CLICK instead of this literal.
   *
   * @event CUI.BlackBar#cui-blackbar-back-button-click
   */

  /**
   * The type of the event that is triggered when the back button is clicked.
   * @type {string}
   */
  CUI.BlackBar.EVENT_BACK_BUTTON_CLICK = 'cui-blackbar-back-button-click';

  CUI.Endor.util.registerWidget(CUI.BlackBar);

}(jQuery, this));

(function ($, window) {
  //Assign the appropriate requestAnimationFrame function to the global requestAnimationFrame.
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || null;

  var SELECTOR_NAVIGATION_VIEW = 'coral-NavigationView',
    SELECTOR_NAVIGATION_VIEW_BRAND_HEIGHT = 'coral-NavigationView--brandHeight',

    SELECTOR_COLUMN = 'coral-ColumnView',    
    SELECTOR_NAV_ELEMENT = 'coral-ColumnView--navigation',
    SELECTOR_NAV_CONTENT = 'coral-NavigationView-content',
    SELECTOR_NAV_CONTENT_SEARCH_BOX_HEIGHT = 'coral-NavigationView-content--searchBoxHeight',
    SELECTOR_COLUMN_BASE = 'coral-ColumnView-column',
    SELECTOR_NAV_COLUMN = 'coral-NavigationView-column',
    SELECTOR_NAV_COLUMN_CONTENT = 'coral-NavigationView-columnContent',
    SELECTOR_NAV_ITEM = 'coral-ColumnView-item',
    SELECTOR_NAV_ITEM_BACK = 'coral-ColumnView-item--back',
    SELECTOR_NAV_ITEM_TITLE = 'coral-ColumnView-item--title',
    SELECTOR_CORAL_ICON = 'coral-Icon',
    SELECTOR_NAV_ITEM_ICON = 'coral-ColumnView-icon',
    SELECTOR_NAV_FOLDER = 'coral-ColumnView-item--hasChildren',
    SELECTOR_NAV_ITEM_BACK_HEIGHT = 'coral-NavigationView-columnContent--backButtonHeight',
    SELECTOR_NAV_ITEM_BACK_HOME_HEIGHT = 'coral-NavigationView-columnContent--homeAndBackHeight',
    SELECTOR_LOADING_ICON = 'coral-Wait coral-Wait--large coral-Wait--center',
    
    SELECTOR_ACTIVE_COLUMN = 'is-active',
    SELECTOR_PREVIOUS_COLUMN = 'is-left',
    SELECTOR_NEXT_COLUMN = 'is-right',
    SELECTOR_SLIDING_COLUMN = 'is-sliding',

    DATA_TARGET_COLUMN = 'coralColumnviewTarget',
    DATA_TARGET_COLUMN_DASHERIZED = 'data-coral-columnview-target',
    DATA_COLUMN_ID = 'coralColumnviewId',
    DATA_COLUMN_ID_DASHERIZED = 'data-coral-columnview-id';

  CUI.NavigationView = new Class(/** @lends CUI.NavigationView# */{
    toString: 'NavigationView',
    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc This widget creates, manages and visualises tree structured data.
     *
     * @constructs
     * @param {Object} options
     * @param {string} [options.jsonUrl=null] A reference to an external url for loading in json to this component.
     * @param {Object} [options.jsonData=null] A reference to an object that already contains the json menu structure.
     * @param {boolean} [options.searchEnabled=false] A flag to indicate whether navigation search is enabled or not.
     * @param {String} [options.searchPlaceholderText="Search Navigation"] The placeholder text for the searchBox.
     * @param {Function} [options.itemClickHandler=null] A custom item click handler for performing your own navigation.
     * @param {boolean} [options.accountForBrand=true] If a brand is present then this option will account for the brand height.
     */
    construct: function (options) {
      this._init(options);
    },

    defaults: {
      jsonUrl: null,          //Build from JSON supplied asynchronously.
      jsonData: null,         //Build from JSON passed into the constructor.
      searchEnabled: false,   //Enable Navigation Search
      searchPlaceholderText: "Search Navigation", //Text to display as a placeholder for navigation.
      itemClickHandler: null,  //A custom item selection handler.
      accountForBrand: true    //Account for the height of the brand
    },

    /**
     * Called from CUI.ShellWidget base class constructor before the instance being registered.
     *
     * @private
     */
    _init: function (options) {

      if (options.jsonData && $.type(options.jsonData) === "string") {
        //Transform the global object string into an actual object.
        this.options.jsonData = window[options.jsonData];
      }

      this.$element.addClass(SELECTOR_NAVIGATION_VIEW);  
      
      if (this.options.accountForBrand){
        this.$element.addClass(SELECTOR_NAVIGATION_VIEW_BRAND_HEIGHT);
      }

      // Build out the components if they don't exist yet and all all associated event listeners.
      this._initSearchBox();
      this._initNavElement();

      this._applyOptions();
    },

    /**
     * A reference to the home column (the one that you navigate to when clicking the marketing cloud logo).
     * @private
     */
    _homeColumnId: null,

    /**
     * A reference to the current columns id.
     * @private
     */
    _currentColumnId: null,

    /**
     * A reference to the target column id.
     * @private
     */
    _targetColumnId: null,

    /**
     * A hashmap of all nested lists with an associated id.
     * @private
     */
    _jsonColumnCache: {},

    /**
     * An array of items that can be searched on.
     * @private
     */
    _searchableItems: [],

    /**
     * Generate the menu from JSON that was passed in or do an ajax request with the json url that was
     * provided.
     * @private
     */
    _applyOptions: function () {
      if (this.options.jsonData) {
        this._applyJSONData(this.options.jsonData);
      } else if (this.options.jsonUrl) {
        var wait = $('<div></div>').addClass(SELECTOR_LOADING_ICON).appendTo(this.$navElement);
        $.ajax({
          url: this.options.jsonUrl
        }).done(function (data) {
          this.updateJSONData(data);
        }.bind(this))
        .always(function () {
          wait.remove();
        });
      }
    },

    /**
     * Completely create a new menu from JSON.
     * @param {Object} data The new menu model object.
     */
    updateJSONData: function (data) {
      //Remove any cached data associated with the last json array.
      this._currentColumnId = null;
      this._targetColumnId = null;
      this._homeColumnId = null;
      this._jsonColumnCache = {};

      //Remove every column view container from the view.
      this.$navElement.empty();

      //Set the new jsonData
      this.options.jsonData = data;
      this._applyJSONData(data);
    },

    /**
     * Transitions to the home menu.
     */
    navigateHome: function () {
      var currentColumn = this.$element.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._currentColumnId + '"]'),
          homeColumn = this.$element.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._homeColumnId + '"]');

      // Store a reference to the target column id so that it will become the current column id on transition end.
      this._targetColumnId = this._homeColumnId;

      if (homeColumn.length) {
        this._performNavNextFrame(currentColumn, homeColumn, true);
      } else if (this._getTargetColumnJSON(this._homeColumnId)) { //Navigate to a json column.
        //The column doesn't yet exist so we need to re-create it and then navigate in the next frame.
        this._targetJSONColumnData = this._getTargetColumnJSON(this._homeColumnId);
        homeColumn = this._createColumnViewFromJSON(this._targetJSONColumnData, SELECTOR_PREVIOUS_COLUMN);
        this._performNavNextFrame(currentColumn, homeColumn, true);
      }
    },

    // Internals //

    /**
     * Create the initial column from JSON.
     * @param jsonData
     * @private
     */
    _applyJSONData: function (jsonData) {
      jsonData.id = 'json_' + CUI.util.getNextId();
      this._jsonColumnCache[jsonData.id] = jsonData; //Make sure to add the list to the json cache
      this._homeColumnId = jsonData.id; //This will be the home column.

      //massage the data so that it has a parent and enough data to create a back button.
      this._initJSONData(jsonData, jsonData.children);

      if (this._currentColumnId) {
        this._createColumnViewFromJSON(this._jsonColumnCache[this._currentColumnId], SELECTOR_ACTIVE_COLUMN);
      } else {
        this._createColumnViewFromJSON(jsonData, SELECTOR_ACTIVE_COLUMN);
      }
    },

    /**
     * Create the coral-ColumnView--navigation element if it doesn't exist yet and assign all associated
     * event listeners.
     * @private
     */
    _initNavElement: function () {
      this.$navElement = this.$element.find('.' + SELECTOR_NAV_ELEMENT);
      //Create the navigation list if it doesn't exist yet.
      if (!this.$navElement.length) {
        this.$navElement = $('<div></div>')
          .addClass(SELECTOR_COLUMN)
          .addClass(SELECTOR_NAV_ELEMENT)
          .appendTo(this.$element);
      }

      this.$navElement.addClass(SELECTOR_NAV_CONTENT);

      if (this.options.searchEnabled){
        //Account for the search box within the columns
        this.$navElement.addClass(SELECTOR_NAV_CONTENT_SEARCH_BOX_HEIGHT);
      }

      //Assign a listener to the navigation element for going back and forth.
      this.$navElement.on('click', '.' + SELECTOR_NAV_ITEM, function (e) {
        var activator = $(e.currentTarget);
        if (activator.data(DATA_TARGET_COLUMN) || activator.hasClass(SELECTOR_NAV_FOLDER)) {
          e.preventDefault();
          this._navigateColumnView(activator);
        } else {
          //Change the visual selection.
          this._selectItemHandler(activator);

          if (this.options.itemClickHandler) {
            //Prevent the link event from firing and allow call the callback with the item and the associated
            //data if there is any.
            e.preventDefault();

            this.options.itemClickHandler.apply(this, [e, this._selectedItem]);
          }
        }
      }.bind(this));
    },

    /**
     * Find the current and target columns if they exist. Otherwise, either create a column from a data cache or load
     * the columns data asynchronously. If columns are loaded asynchronously a loader will be displayed to the user
     * until the column has completed loading and is added to the DOM. Once both the current and target columns are in
     * view call performNav or performNavNextFrame to provide the actual navigation.
     *
     * @param activator
     * @private
     */
    _navigateColumnView: function (activator) {
      var columnView = activator.closest('.' + SELECTOR_COLUMN),
          currentColumn = activator.closest('.' + SELECTOR_COLUMN_BASE),
          targetId = activator.data(DATA_TARGET_COLUMN),
          isBack = activator.hasClass(SELECTOR_NAV_ITEM_BACK),
          targetColumn = columnView.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + targetId + '"]');

      //Store a reference to the current column id
      this._currentColumnId = currentColumn.data(DATA_COLUMN_ID);
      this._targetColumnId = targetId;

      //If we haven't created a reference yet to the home column then this column should be it.
      if (!this._homeColumnId) {
        this._homeColumnId = this._currentColumnId;
      }

      if (targetColumn.length) {
        this._performNavNextFrame(currentColumn, targetColumn, isBack);
      } else if (this._getTargetColumnJSON(targetId)) { //Navigate to a json column.
        this._targetJSONColumnData = this._getTargetColumnJSON(targetId);
        targetColumn = this._createColumnViewFromJSON(this._targetJSONColumnData, isBack ? SELECTOR_PREVIOUS_COLUMN : SELECTOR_NEXT_COLUMN);
        this._performNavNextFrame(currentColumn, targetColumn, isBack);
      } else if (activator.prop('href')) {
        //Make an async call to get the next column
        var wait = $('<div></div>').addClass(SELECTOR_LOADING_ICON).appendTo(currentColumn);
        $.get(activator.prop('href')).done(function (data) {
              //If html was returned it will be of type string.
              if ($.type(data) === "string") {
                targetColumn = $(data).addClass(SELECTOR_NEXT_COLUMN).appendTo(columnView);
              } else {
                var jsonData = data;
                jsonData.id = targetId;
                //The back button is created from a json object. In this case we need to derive that data
                //from the button that ws clicked on and then merge it with the current object.
                jsonData = $.extend(jsonData, this._getBackButtonDataFromButton(activator));

                this._initJSONData(jsonData, jsonData.children);

                this._jsonColumnCache[targetId] = jsonData; //Make sure to add the list to the json cache
                targetColumn = this._createColumnViewFromJSON(jsonData, isBack ? SELECTOR_PREVIOUS_COLUMN : SELECTOR_NEXT_COLUMN);
              }
              this._performNavNextFrame(currentColumn, targetColumn, isBack);
            }.bind(this))
            .always(function () {
              wait.remove(); //Remove the wait indicator
            });
      }
    },

    /**
     * This is where all the magic happens. The css for the navigation consists of elements that are positioned
     * to the right and left of the current element and an active element.
     * @param currentColumn
     * @param targetColumn
     * @param isBack
     * @private
     */
    _performNav: function (currentColumn, targetColumn, isBack) {
      // used to clear all the added classes
      var transitionEvent = this._getTransitionEvent(),
        self = this,
        onSlideEnd = function(event) {
          $(event.currentTarget).off(transitionEvent, onSlideEnd);
          self._removeColumnAnimation($(event.currentTarget));
          self._onNavComplete();
        };

      this._addCurrentColumnAnimation(currentColumn, isBack);
      this._addTargetColumnAnimation(targetColumn, isBack);

      // listens to transition end to remove all the added classes
      //The transition end event is used for removing the last json column to keep things light. It also changes
      //both the current and target column id's.
      if (transitionEvent){
        currentColumn.on(transitionEvent, onSlideEnd);
        targetColumn.on(transitionEvent, onSlideEnd);
      } else {
        self._removeColumnAnimation(currentColumn);
        self._removeColumnAnimation(targetColumn);
        this._onNavComplete();
      }
    },

    _addTargetColumnAnimation: function(column, isBack) {
      // remove any previous animations
      this._removeColumnAnimation(column);

      //The target column will become the new active column.
      column.addClass(SELECTOR_ACTIVE_COLUMN);

      // is-sliding class enables the css transition.
      column.addClass(SELECTOR_SLIDING_COLUMN);
    },

    _addCurrentColumnAnimation: function(column, isBack){
      // remove any previous animations
      this._removeColumnAnimation(column);

      //Remove the active class from the current column
      column.removeClass(SELECTOR_ACTIVE_COLUMN);

      // Add the new location
      if (isBack) {
        column.addClass(SELECTOR_NEXT_COLUMN);
      } else {
        column.addClass(SELECTOR_PREVIOUS_COLUMN);
      }

      // is-sliding class enables the css transition.
      column.addClass('is-sliding');
    },

    _removeColumnAnimation: function(column){
      column.removeClass(SELECTOR_SLIDING_COLUMN + ' ' + SELECTOR_PREVIOUS_COLUMN + ' ' + SELECTOR_NEXT_COLUMN);
    },

    /**
     * An element that is first added to the DOM will not transition even if it has an is-right or is-left state
     * assigned to it because it has not yet been drawn to the DOM. The best way to tell if the DOM has been repainted
     * is to use requestAnimationFrame. This method is called directly before a repaint. In this case we will use
     * requestAnimationFrame twice because the first time it is called will be before an animation has happend. The
     * second time will be directly before the next repaint at which time we can call performNav.
     *
     * @param currentColumn
     * @param targetColumn
     * @param isBack
     *
     * @private
     */
    _performNavNextFrame: function (currentColumn, targetColumn, isBack) {
      if (window.requestAnimationFrame) {
        var animationStart = null,
            performNav = function (timestamp) {
              //If animationStart is null then this is the first time that this method has
              //been called by requestAnimationFrame. This means that a repaint has not happend
              //yet. Call requestAnimationFrame one more time and we can be sure that the new
              //components that were added have been drawn.
              if (animationStart === null) {
                animationStart = timestamp;
                window.requestAnimationFrame(performNav.bind(this));
              } else {
                this._performNav(currentColumn, targetColumn, isBack);
              }
            };

        // add the correct class as an initial state
        targetColumn.removeClass(SELECTOR_NEXT_COLUMN + ' ' + SELECTOR_PREVIOUS_COLUMN + ' ' + SELECTOR_SLIDING_COLUMN);
        if(isBack) {
          targetColumn.addClass(SELECTOR_PREVIOUS_COLUMN);
        } else {
          targetColumn.addClass(SELECTOR_NEXT_COLUMN);
        }

        //An animation frame is is called right before a repaint.
        //Since we want this to happen after a repaint we are actually going
        //to call this twice.
        window.requestAnimationFrame(performNav.bind(this));
      } else {
        //If requestAnimationFrame does not exist (IE9) then call _performNav immediately.
        this._performNav(currentColumn, targetColumn, isBack);

        //Call onNavComplete directly because the transitionend event will not exist.
        this._onNavComplete();
      }
    },

    /**
     * Listener for the native transitionend event that fires after a css transitino has completed. This handler
     * removes the last json column from the DOM.
     *
     * @param event
     * @private
     */
    _onNavComplete: function () {
      var column = this.$navElement.find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + this._currentColumnId + '"]');

      if (this._targetColumnId && column.data(DATA_COLUMN_ID) === this._currentColumnId) {
        //Remove any json menus that we added.
        if (this._jsonColumnCache[this._currentColumnId]) {
          column.remove();
        }

        //The current column now becomes the target column.
        this._currentColumnId = this._targetColumnId;
        this._targetColumnId = null;
      }
    },

    /**
     * Deselect the last item and select a new item. This is very important for Single Page Applications where there
     * is no page refresh to indicate a menu change.
     * @param activator
     * @private
     */
    _selectItemHandler: function (activator) {
      //Unselect the current JSON item.
      if (this._selectedItem) {
        this._selectedItem.selected = false;
      }

      //Find the new json item within the current json column if there is one.
      if (this._currentColumnId && this._jsonColumnCache[this._currentColumnId]) {
        var columnData = this._jsonColumnCache[this._currentColumnId],
            itemText = activator.text(),
            itemData;

        for (var i = 0; i < columnData.children.length; i++) {
          itemData = columnData.children[i];
          if (itemData.name == itemText) {
            this._selectedItem = itemData;
            this._selectedItem.selected = true;
            break;
          }
        }
      }

      //deselect the current item visually if there is one.
      this.$navElement.find('.' + SELECTOR_NAV_ITEM + '.' + SELECTOR_ACTIVE_COLUMN).removeClass(SELECTOR_ACTIVE_COLUMN);

      //Select the item that was just clicked on.
      activator.addClass(SELECTOR_ACTIVE_COLUMN);
    },

    /*
     ----------------------------------------------------------------------------------------------------------
     JSON COLUMN LOGIC
     ----------------------------------------------------------------------------------------------------------
     */

    /**
     * Look for a column in the json cache. If one exists then return it immediately. Otherwise, look through the
     * children of the currently selected column and find the next column, put it in the cache, and then return
     * the results.
     *
     * @param targetId
     * @returns {*}
     * @private
     */
    _getTargetColumnJSON: function (targetId) {
      if (this._jsonColumnCache[targetId]) {
        return this._jsonColumnCache[targetId];
      } else {
        var currentColumnJSON = this._jsonColumnCache[this._currentColumnId],
            targetColumnJSON,
            listItem;

        if (!currentColumnJSON) {
          return null;
        }

        for (var i = 0; i < currentColumnJSON.children.length; i++) {
          listItem = currentColumnJSON.children[i];
          if (listItem.id == targetId) {
            targetColumnJSON = listItem;
            //Cache the results so that we don't have to do this every-time they come to this list item.
            this._jsonColumnCache[targetId] = targetColumnJSON;
            break;
          }
        }
        return targetColumnJSON;
      }
    },

    /**
     * Generate a new column from a JSON object.
     * @param columnJSON
     * @param state
     * @returns {appendTo|*}
     * @private
     */
    _createColumnViewFromJSON: function (columnJSON, state) {
      var self = this,
        columnView = $('<div></div>')
          .addClass(SELECTOR_NAV_COLUMN)
          .addClass(SELECTOR_COLUMN_BASE)
          .addClass(state)
          .attr(DATA_COLUMN_ID_DASHERIZED, columnJSON.id);

      if (columnJSON.homeColumnId) {
        columnView.append(this._createHomeButtonFromJSON(columnJSON));
      }

      if (columnJSON.parentColumnId || columnJSON.backButtonLink) {
        columnView.append(this._createBackButtonFromJSON(columnJSON));
      }
      
      return columnView
        .append(function(){
          var columnContent = $('<div></div>').addClass(SELECTOR_NAV_COLUMN_CONTENT);
          if (columnJSON.homeColumnId && (columnJSON.parentColumnId || columnJSON.backButtonLink)) {
            columnContent.addClass(SELECTOR_NAV_ITEM_BACK_HOME_HEIGHT);
          } else if (columnJSON.homeColumnId || columnJSON.parentColumnId || columnJSON.backButtonLink) {
            columnContent.addClass(SELECTOR_NAV_ITEM_BACK_HEIGHT);
          }

          
          columnJSON.children.forEach(function(columnViewItem){
            columnContent.append(self._createColumnViewItemFromJSON(columnViewItem));
          });

          return columnContent;
        })
        .appendTo(this.$navElement);
    },

    /**
     * Generate a back button from the data provided. NOTE: This data is generated inside the _initJSONData method.
     * @param columnJSON
     * @returns {string}
     * @private
     */
    _createBackButtonFromJSON: function (columnJSON) {
      var backButton = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .addClass(SELECTOR_NAV_ITEM_BACK)
        .addClass(SELECTOR_NAV_ITEM_TITLE)
        .text(columnJSON.backButtonLabel);
        
      if (columnJSON.backButtonIcon) {
        backButton.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnJSON.backButtonIcon)
        );
      }

      if (columnJSON.parentColumnId) {
        backButton.attr(DATA_TARGET_COLUMN_DASHERIZED, columnJSON.parentColumnId);
      }

      if (columnJSON.backButtonLink) {
        backButton.attr('href', columnJSON.backButtonLink);
      }

      return backButton;
    },

    /**
     * Generate the html for each nav button. Add an icon if the item has an associated icon.
     * @param columnViewItem
     * @private
     */
    _createColumnViewItemFromJSON: function (columnViewItem) {
      var columnView = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .text(columnViewItem.name);

      if (columnViewItem.selected && !columnViewItem.children) { columnView.addClass(SELECTOR_ACTIVE_COLUMN); }
      if (columnViewItem.children) { columnView.addClass(SELECTOR_NAV_FOLDER); }
      if (columnViewItem.url) { columnView.attr('href', columnViewItem.url); }
      if (columnViewItem.id) { columnView.attr(DATA_TARGET_COLUMN_DASHERIZED, columnViewItem.id); }
      if (columnViewItem.tooltip) { columnView.attr('title', columnViewItem.tooltip); }
      if (columnViewItem.icon) {
        columnView.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnViewItem.icon)
        );
      }

      return columnView;
    },

    /**
     * Generate a menuHome button. NOTE: This is data centric and will only apply if users have set a menuHome
     * flag within the parent lists data set.
     *
     * @param columnJSON
     * @returns {string}
     * @private
     */
    _createHomeButtonFromJSON: function (columnJSON) {
      var homeButton = $('<a></a>')
        .addClass(SELECTOR_NAV_ITEM)
        .addClass(SELECTOR_NAV_ITEM_BACK)
        .addClass(SELECTOR_NAV_ITEM_TITLE)
        .attr(DATA_TARGET_COLUMN_DASHERIZED, columnJSON.homeColumnId)
        .text(columnJSON.homeColumnLabel);

      if (columnJSON.homeColumnIcon) {
        homeButton.prepend(
          $('<i></i>')
            .addClass(SELECTOR_NAV_ITEM_ICON)
            .addClass(SELECTOR_CORAL_ICON)
            .addClass(columnJSON.homeColumnIcon)
        );
      }

      return homeButton;
    },

    /**
     * If a JSON menu was created by clicking on an existing DOM element we want to generate the back button data
     * by getting that button, finding its text, icon and other data associated with it and then assigning it to
     * the JSON item. This data will be used to create the actual back button.
     *
     * @param target
     * @returns {{parentColumnId: (null|_currentColumnId), backButtonLabel: *, backButtonIcon: string}}
     * @private
     */
    _getBackButtonDataFromButton: function (target) {
      var $target = $(target),
          backButtonData = {
            parentColumnId: this._currentColumnId,
            backButtonLabel: $target.text(),
            backButtonIcon: ''
          },
          btnIcon = $(target).find('.' + SELECTOR_NAV_ITEM_ICON),
          backButtonIcon;

      if (btnIcon.length > 0) {
        backButtonIcon = btnIcon.attr('class');
        backButtonIcon = backButtonIcon.replace(SELECTOR_NAV_ITEM_ICON, ''); //Get rid of everything except the icon class. The others will be added dynamically.
        backButtonIcon = backButtonIcon.replace(SELECTOR_CORAL_ICON, '');
        backButtonData.backButtonIcon = $.trim(backButtonIcon);
      }

      return backButtonData;
    },

    /**
     * Recursively go through each item in the JSON menu and assign a parent, setup a backbutton, create a unique id,
     * add a menuHome button if a parent has that flag set, and cache the results for easy retrieval of the menu and
     * for searchability of menu options.
     *
     * @param parentColumnData
     * @param columnData
     * @param menuHome
     * @private
     */
    _initJSONData: function (parentColumnData, columnData, menuHome) {
      //Create a reference to the parent in each child in order to build menus both forwards and backwards.
      for (var i = 0; i < columnData.length; i++) {
        var listItem = columnData[i];

        if (parentColumnData) {
          listItem.parentColumnId = parentColumnData.id;
          listItem.backButtonLabel = listItem.name;
          listItem.backButtonIcon = listItem.icon;
        }

        if (menuHome) {
          listItem.homeColumnId = menuHome.id;
          listItem.homeColumnLabel = menuHome.homeMenuLabel || menuHome.name;
          listItem.homeColumnIcon = menuHome.homeMenuIcon || '';
        }

        if (listItem.children) {
          listItem.id = 'json_' + CUI.util.getNextId();

          if (listItem.selected) {
            this._currentColumnId = listItem.id;
          }

          this._jsonColumnCache[listItem.id] = listItem;
          this._initJSONData(listItem, listItem.children, listItem.isMenuHome ? listItem : menuHome);
        } else {
          if (listItem.selected) {
            this._currentColumnId = parentColumnData.id || this._currentColumnId;
            this._selectedItem = listItem;  
          }

          this._searchableItems.push(listItem);
        }
      }
    },

    /**
     * Make sure to get the appropriate vendor prefixed transition end event.
     * @private
     */
    _getTransitionEvent: function (){
      var t,
        el = this.$navElement.get(0),
        transitions = {
          'WebkitTransition' :'webkitTransitionEnd',
          'MozTransition'    :'transitionend',
          'MSTransition'     :'msTransitionEnd',
          'OTransition'      :'oTransitionEnd',
          'transition'       :'transitionEnd'
        };

      for(t in transitions){
        if( el.style[t] !== undefined ){
          return transitions[t];
        }
      }

      return null;
    },

    /**
     * Search is an optional feature that most solutions won't have. You can enable search by setting data-search-enabled to
     * true. By default this option is set to false. The Analytics team has been authorized by Alan to enable searching
     * the menu for different navigation options because of how deep our menu can be. This may also be a need for other
     * teams and can easily be enabled if desired. Please talk to Alan before turning data-search-enabled to true. NOTE:
     * because this is an optional feature I have added everything to it's own closure so that it is obvious where the
     * code is for searching on different menu options.
     * @private
     */
    _initSearchBox: function () {
      if (this.options.searchEnabled) {
        var filteredList = null,
            searchBox = this.$element.find('.coral-ColumnView-searchbox'),
            searchField = searchBox.find('.coral-Textfield'),
            clearSearchButton = searchBox.find(''),
            searchList = null,
            searchListContent = null,
            searchText = '',
            cursorIndex = 1,
            currentItem = null,
            $this = this,

            init = function () {
              if (!searchBox.length) {
                searchBox = $([
                  '<div class="coral-ColumnView-item coral-ColumnView-item--searchBox">',
                    '<div class="coral-DecoratedTextfield coral-NavigationView-DecoratedTextfield">',
                      '<i class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search"></i>',
                      '<input placeholder="' + $this.options.searchPlaceholderText + '" type="text" class="coral-DecoratedTextfield-input coral-Textfield">',
                      '<button type="button" class="coral-DecoratedTextfield-button coral-MinimalButton" style="display:none;">',
                        '<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>',
                      '</button>',
                    '</div>',
                  '</div>'
                ].join('')).appendTo($this.$element);

                searchField = searchBox.find('.coral-Textfield');
                clearSearchButton = searchBox.find('.coral-DecoratedTextfield-button');
              }

              searchField.on("keydown", onKeyDown);
              searchField.on("keyup", onKeyUp);

              //Add a clear event listener.
              clearSearchButton.on("click", function () {
                clearSearch();
                searchField.focus();
              });

              //Add a hotkey for getting into the search box.
              $(document).bind('keyup', function (evt) {
                if (evt.target.tagName.toLowerCase() !== "input" &&
                    evt.target.tagName.toLowerCase() !== "textarea" &&
                    evt.keyCode == 191) { //forward slash
                  searchField.focus();
                }
              });
            },

            onKeyDown = function (event) {
              switch (event.keyCode) {
                case 38 : // up
                  event.preventDefault();
                  if (searchText !== "") {
                    if (cursorIndex > 1) {
                      cursorIndex -= 1;
                    } else {
                      cursorIndex = filteredList.length;
                    }
                    updateCursorIndex();
                  }
                  break;
                case 40 : // down
                  event.preventDefault();
                  if (searchText !== "") {
                    if (cursorIndex < filteredList.length) {
                      cursorIndex += 1;
                    } else {
                      cursorIndex = 1;
                    }
                    updateCursorIndex();
                  }
                  break;
                case 13 : //enter
                  event.preventDefault();
                  if (cursorIndex > 0 && filteredList.length) {
                    window.location.href = filteredList[cursorIndex - 1].url;
                  }
                  break;
                case 27 : //esc
                  //Remove the cursor from the search input.
                  clearSearch();
                  searchField.blur();
                  break;
              }
            },

            onKeyUp = function (event) {
              event.stopPropagation();
              var newVal = $(event.target).val();

              if (newVal != searchText) {
                searchText = newVal;
                currentItem = null;

                //If the searchList hasn't been created yet then make sure to create it.
                searchList = searchList ||
                  $('<div></div>')
                    .addClass(SELECTOR_NAV_COLUMN)
                    .addClass(SELECTOR_COLUMN_BASE)
                    .addClass(SELECTOR_ACTIVE_COLUMN)
                    .css('display', 'none')
                    .append(
                      $('<div></div>').addClass(SELECTOR_NAV_COLUMN_CONTENT)
                    )
                    .appendTo($this.$navElement);

                searchListContent = searchListContent || searchList.find('.' + SELECTOR_NAV_COLUMN_CONTENT);

                if (searchText === "") {
                  clearSearchButton.hide();
                  hideSearchList();
                } else {
                  clearSearchButton.show();
                  //Update the actual filtered list of elements.
                  updateFilteredList();

                  //The z-index will always be 1 if the list length is greater than 1.
                  cursorIndex = filteredList.length ? 1 : 0;

                  //Remove all items from the list.
                  searchListContent.empty();

                  //Now add all of the new items to the list.
                  for (var i = 0; i < filteredList.length; i++) {
                    var item = filteredList[i],
                      itemCls = SELECTOR_NAV_ITEM + ((i == cursorIndex - 1) ? ' ' + SELECTOR_ACTIVE_COLUMN : ''),
                      searchItem = $('<a></a>')
                        .addClass(itemCls)
                        .attr('href', item.url)
                        .text(item.name);

                    if (item.tooltip) { searchItem.attr('title', item.tooltip); }

                    searchListContent.append(searchItem);
                  }

                  displaySearchList();
                }
              }
            },

            clearSearch = function () {
              searchText = "";
              searchField.val('');
              clearSearchButton.hide();
              hideSearchList();
            },

            displaySearchList = function () {
              searchList.css('display', 'block');

              //Hide the current list
              $this.$element
                  .find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + $this._currentColumnId + '"]')
                  .css('display', 'none');
            },

            hideSearchList = function () {
              $this.$element
                  .find('.' + SELECTOR_COLUMN_BASE + '[' + DATA_COLUMN_ID_DASHERIZED + '="' + $this._currentColumnId + '"]')
                  .css('display', 'block');

              if (searchList) {
                //Hide the search list
                searchList.css('display', 'none');  
              }
            },

            updateCursorIndex = function () {
              currentItem = currentItem || searchList.find('.' + SELECTOR_NAV_ITEM + '.' + SELECTOR_ACTIVE_COLUMN);
              if (currentItem) {
                currentItem.removeClass(SELECTOR_ACTIVE_COLUMN);
              }

              currentItem = searchList.find('.' + SELECTOR_NAV_ITEM + ':nth-child(' + cursorIndex + ')');
              currentItem.addClass(SELECTOR_ACTIVE_COLUMN);
            },

            updateFilteredList = function (isAdd) {
              //Filter the items.
              filteredList = $this._searchableItems.filter(function (item) {
                //Get the lowercase version of the item name.
                var itemName = $.type(item.name) == "string" ? item.name.toLowerCase() : '',
                    score = 0,
                    char,
                    j = 0, // remembers position of last found character
                    nextj;

                // consider each search character one at a time providing a fuzzy match.
                for (var i = 0; i < searchText.length; i++) {
                  char = searchText[i].toLowerCase();
                  if (char == ' ') continue;     // ignore spaces

                  nextj = itemName.indexOf(char, i === 0 ? j : j + 1);   // search for character & update position
                  score += (nextj - j) * (i === 0 ? 1 : 3); //Figure out the gap between characters and multiply the result by three if it is not the first char.
                  j = nextj;
                  if (j == -1) return false;  // if it's not found, exclude this item
                }

                //increase the score based on the overall item length
                score = score + (itemName.length - j);

                //Increase the score by 100 if the text doesn't have an exact match.
                if (itemName.indexOf(searchText) === -1) score += 100;

                item.score = score;
                return true;
              });

              //Now sort all of the filtered items according to their score.
              filteredList.sort(function (a, b) {
                if (a.score > b.score)
                  return 1;
                if (a.score < b.score)
                  return -1;
                // a must be equal to b
                return 0;
              });
            };

        init();
      }
    }
  });

  CUI.Widget.registry.register('navigationView', CUI.NavigationView);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.NavigationView.init($('[data-init~="navigation-view"]', event.target));
    });
  }

  // When this code gets moved out of the shell repository, then this line needs
  // to stay behind, to be called *after* the widget gets defined:
  CUI.ShellWidgetMixin.applyTo(CUI.NavigationView);

}(jQuery, this));

(function ($, window, undefined) {
  CUI.ColumnView = new Class(/** @lends CUI.ColumnView# */{
    toString: 'ColumnView',
    extend: CUI.ShellWidget,

    /**
     * @extends CUI.ShellWidget
     * @classdesc this widget enables column view features
     * <div class="coral-ColumnView" data-init="columnview">
     *    <div class="coral-ColumnView-column">
     *    </div>
     *    <div class="coral-ColumnView-column">
     *    </div>
     * </div>
     * @example
     * <caption>Instantiate with Class</caption>
     * var columnview = new CUI.ColumnView({
         *     element: '#myColumnView'
         * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myColumnView').ColumnView();
     *
     * @example
     * <caption>Markup</caption>
     * todo
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
    },

    defaults: {
      url: '{+path}',
      path: '',
      wrapLabels: true // wrap long labels
    },

    /**
     * Get the selected items. This does not include the breadcrumb items of other columns.
     * @return {jQuery}
     */
    getSelectedItems: function () {
      return this.getActiveColumn().children('.is-selected');
    },

    /**
     * Get the paths of the selected items. This does not include the breadcrumb items of other columns.
     * @return {String[]}
     */
    getSelectedPaths: function () {
      var paths = [];
      this.getSelectedItems().each(function () {
        paths.push($(this).data('path'));
      });
      return paths;
    },

    /**
     * Get the items of the breadcrumb i.e. selected items not located in the active column.
     * @return {jQuery}
     */
    getBreadcrumbItems: function () {
      return this.getActiveColumn().prevAll().children('.is-selected');
    },

    /**
     *
     * @param path
     */
    selectItemByPath: function (path, selectBreadcrumb) {
      //todo: different column (simply find?), load missing levels (or extra method loadPath?)
      var $item = this.getActiveColumn().children('.coral-ColumnView-item[data-path="' + path + '"]');

      this._setActiveColumn($item, false);
      $item.addClass('is-selected');

      //todo: breadcrumb
    },

    checkItemByPath: function (path, selectBreadcrumb) {
      //todo
    },

    /**
     * Get the active column.
     * @return {jQuery}
     */
    getActiveColumn: function () {
      return this.$element.children('.is-active');
    },

    /**
     * Get the column where actions like adding or pasting items will be applied to. If a single folder is selected
     * this would be the sub column and otherwise the active column.
     * @return {jQuery}
     */
    getTargetColumn: function () {
      var activeColumn = this.getActiveColumn();
      var items = this.getSelectedItems().filter(':not(.is-checked)');
      if (items.length === 1 && items.hasClass('coral-ColumnView-item--hasChildren')) {
        return activeColumn.next();
      } else {
        return activeColumn;
      }
    },

    _init: function (options) {
      this.inherited(arguments);

      if (this.options.path) {
        // only load a column if a path is provided; otherwise the initial column is provided by markup
        var $column = this._addColumn();
        $column.addClass('is-active');
        this._loadColumn($column, this.options.url, this.options.path);
      } else {
        // remove (empty) text nodes to avoid spacing between columns
        this.$element.contents().filter(function () {
          return this.nodeType === 3;
        }).remove();

        this._wrapLabels(this.$element.children('.coral-ColumnView-column'));
      }

      if (!this.$element.hasClass('coral-ColumnView--navigation')) {
        // select: tap the text: single selection
        this.$element.on('click', '.coral-ColumnView-item', this._selectItemHandler.bind(this));

        // check: tap the icon: multiple selection
        this.$element.on('click', '.coral-ColumnView-icon', this._checkItemHandler.bind(this));
      }
    },

    /**
     * Adds a new column to the ColumnView.
     * @return {jQuery}
     * @private
     */
    _addColumn: function () {
      var $column = $('<div class="coral-ColumnView-column"><div class="wait small center"></div></div>');
      this.$element.append($column);
      return $column;
    },

    /**
     * Sets the response of <code>url</code> as content of the given column. The response must be contain a
     * <code>coral-ColumnView-column</code>. The inner HTML of this element will be used (but not the column
     * itself).
     * @param {jQuery} $column The column
     * @param {String} url The URL with a placeholder for the path: <code>{+path}</code>
     * @param {String} path The path injected to <code>url</code>
     * @example
     * //todo: finalize
     * <!DOCTYPE html>
     * <html lang="en">
     *    <head></head>
     *    <body>
     *       <div class="coral-ColumnView-column">
     *           <a class="coral-ColumnView-item" href="#" data-path="...">
     *              <i title="" class="coral-ColumnView-icon icon-file small"></i>
     *              Name
     *           </a>
     *       </div>
     *    </body>
     * </html>
     * @private
     */
    _loadColumn: function ($column, url, path) {
      var columnView = this;
      $.ajax({
        url: url.replace("{+path}", path)
      }).done(function (data) {
        var $loadedColumn = $('<div />').append(data).find('.coral-ColumnView-column');

        $column.html($loadedColumn.html());
        $column.addClass($loadedColumn.attr("class"));

        columnView._wrapLabels($column);

      }).always(function () {
        $column.children('.wait').remove();
        columnView.$element.trigger("loadcolumn", $column, path);
      });
    },

    /**
     * Checks each label of the given column if it does overflow the column. If yes and {{this.option.wrapLabels}}
     * is {{true}} the class {{coral-ColumnView-item--doublespaced}} is applied to the item.
     * @param $column
     * @private
     */
    _wrapLabels: function ($column) {
      if (this.options.wrapLabels === true) {
        $column.find('.coral-ColumnView-item').each(function () {
          var $this = $(this);
          $this.addClass('coral-ColumnView-item--checkWrap');
          if (this.scrollWidth > this.clientWidth) {
            // items with overflowing text: reduce font size
            $this.addClass('coral-ColumnView-item--doublespaced');
          }
          $this.removeClass('coral-ColumnView-item--checkWrap');
        });
      }
    },

    /**
     * The handler to select items. Selecting results in a single selected item, loads its
     * <code>data-url</code> and adds the data to a new column.
     * @param {jQuery.Event} event
     * @private
     */
    _selectItemHandler: function (event) {
      // selecting a single item: deselect items in former active column
      var $item = $(event.target);
      if (!$item.hasClass('coral-ColumnView-item')) {
        $item = $item.parents('.coral-ColumnView-item');
      }

      this._setActiveColumn($item, false);

      $item.addClass('is-selected');
      var $column = this.getActiveColumn().next();
      if ($column.length === 0) {
        // no column after the active one available: add a column
        $column = this._addColumn();
      } else {
        // remove additional classes e.g. coral-ColumnView-preview
        $column.attr("class", "").addClass("coral-ColumnView-column");
      }
      this._loadColumn($column, $item.data('url') || this.options.url,
          $item.data('path'));

      this._scrollToColumn();

      this.$element.trigger("select", $item);
    },

    /**
     * The handler to check and uncheck items. Checking may result in none, a single or multiple selected items.
     * and adds the data to a new column.
     * @param {jQuery.Event} event
     * @private
     */
    _checkItemHandler: function (event) {
      // selecting multiple items
      event.stopPropagation();

      var $item = $(event.target).parents('.coral-ColumnView-item');
      this._setActiveColumn($item, true);

      $item.toggleClass('is-selected is-checked');

      if (this.getSelectedItems().length === 0) {
        // unchecked last item of a column: parent column (if available) is new active column
        var $column = this.getActiveColumn();
        var $parentColumn = $column.prev();
        if ($parentColumn.length !== 0) {
          $column.removeClass('is-active');
          $parentColumn.addClass('is-active');
        }
      }

      this._scrollToColumn();

      this.$element.trigger("check", $item);
    },

    /**
     * Sets the parent of the given item to active column and handles. Selected items are deselected and unchecked.
     * If the former active column is the same as the new one the items will be unchecked solely if
     * <code>forceUncheck</code> is true.
     * @param $item {jQuery} The lastly selected item
     * @param checking {Boolean} <code>true</code> when the "checkbox" (icon) was tapped
     * @private
     */
    _setActiveColumn: function ($item, checking) {
      var $formerActiveColumn = this.getActiveColumn();
      var $activeColumn = $item.parent();

      if (checking === true) {
        // tapping "checkbox": convert selected item of active column into checked
        $activeColumn.children('.is-selected:not(.is-checked)').addClass('is-checked');
      } else {
        // tapping label: deselect all items (note: does not include checked items, see below)
        $activeColumn.children('.is-selected:not(.is-checked)').removeClass('is-selected');
      }

      if (checking === false || $activeColumn.hasClass('is-active') === false) {
        // tapping label or a "checkbox" in a different column: uncheck all items
        $formerActiveColumn.children('.is-checked').removeClass('is-selected is-checked');
      }

      // the parent of the item is the new active column
      $formerActiveColumn.removeClass('is-active');
      $activeColumn.addClass('is-active')
        // clear the columns after the new active column
          .nextAll().html('');
    },

    /**
     * Scroll to the relevant column. If the target column is right of the visible area it will be scrolled into
     * view. Otherwise if the active column is left of the visible area this one will be scrolled into view.
     * @private
     */
    _scrollToColumn: function () {
      var left, duration;
      var $activeColumn = this.getActiveColumn();

      // most right column: target column, preview column or active column
      var $rightColumn;
      var items = this.getSelectedItems().filter(':not(.is-checked)');
      if (items.length === 1) {
        $rightColumn = $activeColumn.next();
      } else {
        $rightColumn = $activeColumn;
      }

      if ($rightColumn.position() && $rightColumn.position().left + $rightColumn.outerWidth() >= this.$element.width()) {
        // most right column is (partially) right of visible area: scroll right column into view

        // remove empty columns right of most right column
        $rightColumn.nextAll().remove();

        left = this.$element[0].scrollWidth - this.$element.outerWidth();
        duration = (left - this.$element.scrollLeft()) * 1.5; // constant speed

        this.$element.animate({
          scrollLeft: left
        }, duration);

      } else if ($activeColumn.position() && $activeColumn.position().left < 0) {
        // active column is (partially) left of visible area: scroll active column into view

        left = 0;
        $activeColumn.prevAll().each(function () {
          left += $(this).outerWidth();
        });
        duration = (this.$element.scrollLeft() - left) * 1.5; // constant speed

        this.$element.animate({
          scrollLeft: left
        }, duration);
      }
    }


    /**
     Triggered when an item is selected (single selection)

     @name CUI.ColumnView#select
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} item                   The selected item
     */

    /**
     Triggered when an item is checked (multi selection)

     @name CUI.ColumnView#check
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} item                   The checked item
     */

    /**
     Triggered when a column is loaded

     @name CUI.ColumnView#loadcolumn
     @event

     @param {jQuery.Event} evt              The event object
     @param {jQuery} column                 The loaded column
     @param {String} path                   The loaded path
     */

  });


  CUI.Widget.registry.register('columnview', CUI.ColumnView);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.ColumnView.init($('[data-init~=columnview]', event.target));
    });
  }

}(jQuery, this));

(function ($, window) {
  CUI.ShellMac = new Class(/** @lends CUI.ShellMac# */{
    toString: 'ShellMac',
    extend: CUI.Shell,

    /**
     * These are the default options if you don't pass things in. Most of these options actually 
     * come from CUI.Shell except for the last five that are specific to the marketing cloud API's.
     * 
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    brandIcon: null,
     *    brandTitle: null,
     *    brandHref: null,
     *    generateBreadcrumbBar: false,
     *    breadcrumbBarOptions: {
     *      isClosed: true
     *    },
     *    generatePage: false,
     *    pageOptions: {
     *      generateOuterRail: true,
     *      generateInnerRail: true,
     *      generateBlackBar: true,
     *      generateActionBar: true,
     *      generateFooter: true,
     *      footerOptions: {
     *        isSticky: true
     *      }
     *    },
     *    locale: 'en_US',             //Current locale. This will be used in pulling in different MAC api's
     *    hasImsSession: false,        //Flag to indicate whether to load data from the marketing cloud.
     *    macServer: 'https://marketing.adobe.com', //The base marketing cloud url to pull data from.
     *    activeOrgId: null,          //The current active organization within the marketing cloud.
     *    searchProduct: "mcloud"     //The search product
     * }
     */
    defaults: {
      brandIcon: null,
      brandTitle: null,
      brandHref: null,

      generateBreadcrumbBar: false,
      breadcrumbBarOptions: {
        isClosed: true
      },

      generatePage: false,
      pageOptions: {
        generateOuterRail: true,
        generateInnerRail: true,
        generateBlackBar: true,
        generateActionBar: true,
        generateFooter: true,
        footerOptions: {
          isSticky: true
        }
      },

      locale: 'en_US',            //Current locale. This will be used in pulling in different MAC api's
      hasImsSession: false,       //Flag to indicate whether to load data from the marketing cloud.
      imsServer: 'https://marketing.adobe.com', //The base marketing cloud url to pull data from.
      activeOrgId: null,          //The current active organization within the marketing cloud.
      searchProduct: "mcloud"
    },

    _badge: null,                 // CUI.Badge widget
    _notificationsPopover: null,    // CUI.NotificationsPopover widget
    _brand: null,                 // CUI.Brand widget
    _navigationView: null,        // CUI.NavigationView widget

    /**
     * @extends CUI.Shell
     * @classdesc The marketing cloud specifc shell.
     *
     * @constructs
     * @param options
     */
    construct: function (options) {
    },

    /**
     * External API for setting the current locale. NOTE: if data has already been pulled from the MAC 
     * API's it will pull it again using the new locale. 
     */
    setLocale: function(locale){
      CUI.MacApiService.configure({locale: locale});
      $(document).trigger(CUI.ShellMac.EVENT_IMS_INFO_UPDATED);
      $(document).trigger(CUI.ShellMac.EVENT_HELP_CONFIG_UPDATED);
    },

    /**
     * External API for setting whether or not a current IMS session exists. Some customers may need to 
     * figure this out on the client through an HTTP request. This is an API for configuring this value 
     * even after the page may have been loaded. It will also trigger the associated classes to re-pull 
     * in data if necessary.
     */
    setHasImsSession: function(hasImsSession){
      CUI.MacApiService.configure({hasImsSession: hasImsSession});
      $(document).trigger(CUI.ShellMac.EVENT_IMS_INFO_UPDATED);
    },

    /**
     * External API for setting the Marketing Cloud server to pull in data.
     */
    setImsServer: function(imsServer){
      CUI.MacApiService.configure({imsServer: imsServer});
      $(document).trigger(CUI.ShellMac.EVENT_IMS_INFO_UPDATED);
    },

    /**
     * External API for setting the Active IMS org id. NOTE: This is necessary to account for tenant 
     * routing within the marketing cloud. It is possible that we will not get back any data without 
     * it.
     */
    setActiveOrgId: function(activeOrgId){
      CUI.MacApiService.configure({activeOrgId: activeOrgId});
      $(document).trigger(CUI.ShellMac.EVENT_IMS_INFO_UPDATED);
    },

    /**
     * External API for setting the search product to pull in help topics from the MAC search url's.
     */
    setSearchProduct: function(searchProduct){
      CUI.MacApiService.configure({searchProduct: searchProduct});
      $(document).trigger(CUI.ShellMac.EVENT_HELP_CONFIG_UPDATED);
    },

    /**
     * External API for adding a new notification. This will call both the CUI.Badge and the CUI.NotificationsPopover 
     * instances and update the notifications within each. 
     */
    addNotification: function(notification){
      //Make sure that the notification is in the right format.
      if (!notification.hasOwnProperty('html')) {
        notification = {
          html: notification
        };
      }

      if (this._badge){
        this._badge.addNotification(notification);  
      }
      
      if (this._notificationsPopover){
        this._notificationsPopover.refreshList();  
      }
    },

    /**
     * External API for removing all notifications from both the CUI.Badge and the CUI.NotificationsPopover instances. 
     */
    removeAllNotifications: function(){
      var notifications = {newNotifications: []};

      if (this._badge){
        this._badge.updateNotifications(notifications);  
      }
      
      if (this._notificationsPopover){
        this._notificationsPopover.updateNotifications(notifications);  
      }
    },

    /**
     * @private
     */
    _init: function(options){
      this.inherited(arguments);

      //Configure the Mac service with the configuration options.
      CUI.MacApiService.configure({
        hasImsSession: options.hasImsSession,
        imsServer: options.imsServer,
        activeOrgId: options.activeOrgId,
        locale: options.locale,
        searchProduct: options.searchProduct
      });

      this._initEventListeners();
    },

    /**
     * @private
     */
    _initEventListeners: function(){
      $(document).on(CUI.Brand.EVENT_CLICK, this._handleBrandClicked.bind(this));
    },

    /**
     * @private
     */
    _resolveWidgets: function(){
      this.inherited(arguments);
      this._resolveWidget(CUI.Badge, this._handleBadgeResolved);
      this._resolveWidget(CUI.NotificationsPopover, this._handleNotificationsPopoverResolved);
      this._resolveWidget(CUI.NavigationView, this._handleNavigationViewResolved);
    },

    /**
     * @private
     */
    _handleBadgeResolved: function (badge){
      this._badge = badge;
    },

    /**
     * @private
     */
    _handleNotificationsPopoverResolved: function (notificationsPopover){
      this._notificationsPopover = notificationsPopover;
    },

    /**
     * @private
     */
    _handleNavigationViewResolved: function(navigationView){
      this._navigationView = navigationView;
    },

    /**
     * @private
     */
    _handleBrandClicked: function(){
      if (this._navigationView){
        this._navigationView.navigateHome();
      }
    }
  });

  CUI.ShellMac.EVENT_IMS_INFO_UPDATED = "cui-shellmac-ims-info-updated";
  CUI.ShellMac.EVENT_HELP_CONFIG_UPDATED = "cui--helpconfig-info-updated";

  CUI.Endor.util.registerWidget(CUI.ShellMac);

}(jQuery, this));

(function ($, window){
  // Allow console.log:
  /*jshint devel:true */

  var cache = {},
    macConfig = {
      hasImsSession: false, //Indicates whether or not a current ims session exists.
      imsServer: 'https://marketing.adobe.com', //Base marketing cloud url
      activeOrgId: null, //The current active id.
      locale: 'en_US',
      searchProduct: "mcloud"
    },
    macPreReqPromise = null,
    macTenantPromise = null,
    macHeaderPromise = null,
    macUserPromise = null,
    macNotificationsPromise = null,
    macChangeOrgPromise = null,
    macAPIEndpoints = {
      header: '/content/mac/default/header.jsonp',
      notifications: '/content/mac/default/header/notifications.jsonp',
      user: '/content/mac/default/header/user.jsonp',
      setActiveOrg: '/content/mac/default/header.setActiveOrg.jsonp',
      tenant: '/content/mac/default/services/tenant.jsonp',
      tartanLogin: '/libs/granite/core/content/login.autologin.html'
    },
    tenantId = null,
    tenantUrl = null,
    headerData = null,
    baseUrl = null;

  /**
   * @class 
   * CUI.MacApiService defines a consistent method of pulling data both from the MAC api's and user 
   * specified URL's.
   */
  CUI.MacApiService = /** @lends CUI.MacApiService# */{    
    /**
     * Provide a custom config object through mixin inheritance.
     * @param config
     */
    configure: function(config){
      macConfig = $.extend(macConfig, config);
    },

    /**
     * Public method for determining whether or not there is an IMS session.
     */
    hasImsSession: function(){
      return macConfig.hasImsSession;
    },

    /**
     * Public method for determining the MAC locale for pulling data.
     */
    getLocale: function(){
      return macConfig.locale;
    },

    /**
     * Return the MAC searchProduct.
     */
    getSearchProduct: function(){
      return macConfig.searchProduct;
    },

    /**
     * Return the activeOrgId.
     */
    getActiveOrgId: function(){
      return macConfig.activeOrgId;
    },

    /**
     * Return the MAC server that data is being pulled from.
     */ 
    getImsServer: function(){
      return macConfig.imsServer;
    },

    /**
     * Load user by a custom url (data-user-url) passed into the header. This method caches a promise until it has been
     * completed so that any other service that hits this api while it is loading will get the same promise. NOTE: 
     * If hasImsSession has been set to true then this will return a user using the marketing cloud.
     *
     * @param url
     * @returns {promise}
     */
    getUser: function(){
      if (macConfig.hasImsSession){
        return this.getMACUser();
      } else if (arguments.length) {
        var url = arguments[0],
          userPromise = cache[url];

        //If two things request a user it should return the same promise until it
        if (!userPromise){
          userPromise = $.get(url)
            .always(function(){
              //Remove the promise from the cache once things have resolved.
              delete cache[url];
            });

          cache[url] = userPromise;
        }

        return userPromise;
      }
      return null;
    },

    /**
     * Load the MAC user. This is a CRAZY SPIDERWEB!!! There are multiple methods that must be called before
     * we can actually call the user API including:
     *
     * 1. Call the tenant API to get the specific tenant endpoint.
     * 2. Make sure that the headerData is loaded.
     * 3. If the header data or the user fail to load we may have lost our login to the marketing cloud which means
     *    that we will need to attempt to log back into the marketing cloud and then retry a method.
     * 4. Finally, if all other methods are successful then we will call the actual user API.
     *
     * Although this method is complex I want to make it simple to consume. For this reason this method creates a custom
     * promise that it returns immediately. If anything fails along the way it will call reject on that promise. If all
     * is successful then the promise will be resolved.
     *
     * One other thing that this does is make it so that if multiple consumers hit the API at one time it will return the
     * exact same promise. This is the case with the UserAccountButton and the UserAccountPopup.
     *
     * @returns {promise}
     */
    getMACUser: function(){
      var success = function(user){
        macUserPromise.resolve(user);
        macUserPromise = null;
      };

      var fail = function(e){
        macUserPromise.reject(e);
        macUserPromise = null;
      };

      if (!macUserPromise){
        macUserPromise = new $.Deferred();

        if (!headerData){
          this._loadMACPreReqs().then(function(){
            this._loadJSONP(macConfig.imsServer + macAPIEndpoints.user, success, fail);
          }.bind(this), fail);
        } else {
          this._loadJSONP(macConfig.imsServer + macAPIEndpoints.user, success, fail);
        }
      }
      return macUserPromise;
    },

    /**
     * Load notifications by a custom url (data-notifications-url) passed into the header. This method caches a promise
     * until it has been completed so that any other service that hits this api while it is loading will get the same promise. NOTE: 
     * if hasImsSession has been set to true then this function will return a user using the marketing cloud API's.
     *
     * @param url
     * @returns {promise}
     */

    getNotifications: function(){
      if (macConfig.hasImsSession){
        return this.getMACNotifications();
      } else if (arguments.length) {
        var url = arguments[0],
          notificationsPromise = cache[url];


        //If two things request a user it should return the same promise until it
        if (!notificationsPromise){
          notificationsPromise = $.get(url)
            .always(function(){
              //Remove the promise from the cache once things have resolved.
              delete cache[url];
            });

          cache[url] = notificationsPromise;
        }

        return notificationsPromise;
      }
      return null;
    },

    /**
     * Load the MAC notifications. This is a CRAZY SPIDERWEB!!! There are multiple methods that must be called before
     * we can actually call the notifications API including:
     *
     * 1. Call the tenant API to get the specific tenant endpoint.
     * 2. Make sure that the headerData is loaded.
     * 3. If the header data or the notifications fail to load we may have lost our login to the marketing cloud which means
     *    that we will need to attempt to log back into the marketing cloud and then retry a method.
     * 4. Finally, if all other methods are successful then we will call the actual notifications API.
     *
     * Although this method is complex I want to make it simple to consume. For this reason this method creates a custom
     * promise that it returns immediately. If anything fails along the way it will call reject on that promise. If all
     * is successful then the promise will be resolved.
     *
     * One other thing that this does is make it so that if multiple consumers hit the API at one time it will return the
     * exact same promise. This is the case with the NotificationsPopup and the Badge.
     *
     * @returns {promise}
     */
    getMACNotifications: function(){
      var success = function(notifications){
        macNotificationsPromise.resolve(notifications);
        macNotificationsPromise = null;
      };

      var fail = function(e){
        macNotificationsPromise.reject(e);
        macNotificationsPromise = null;
      };

      if (!macNotificationsPromise){
        macNotificationsPromise = new $.Deferred();

        if (!headerData){
          //The pre-reqs include the tenant and the header api's.
          this._loadMACPreReqs().then(function(){
            this._loadJSONP(macConfig.imsServer + macAPIEndpoints.notifications, success, fail);
          }.bind(this), fail);
        } else {
          this._loadJSONP(macConfig.imsServer + macAPIEndpoints.notifications, success, fail);
        }
      }
      return macNotificationsPromise;
    },

    /**
     * Load the actual header API. This will be satisfied by loading in the prereqs (tenant and header).
     * @returns {headerData|promise}
     */
    getMACHeader: function(){
      return this._loadMACPreReqs();
    },

    /**
     * Before we can hit API's such as user or notifications we need to first get the appopriate tenant url and
     * second make sure that the header data is loaded. This method makes sure that both of these api's are loaded
     * through a promise. NOTE: There will only be one promise until it is satisfied which means that we will only
     * go through the step of loading the tenant and the header data once. When that promise is resolved all parties
     * that care about it will be notified.
     *
     * @returns promise
     * @private
     */
    _loadMACPreReqs: function(){
      var success = function(data){
          if (macPreReqPromise){
            macPreReqPromise.resolve(data);
            macPreReqPromise = null;
          }
        },
        error = function(e){
          if (macPreReqPromise){
            macPreReqPromise.reject(e);
            macPreReqPromise = null;
          }
        };

      if (!macPreReqPromise){
        macPreReqPromise = new $.Deferred();

        if (macConfig.activeOrgId){
          this._loadMACTenantApi().then(function(data){
            this._loadMACHeaderApi().then(success, error);
          }.bind(this), error);
        } else {
          //Attempt to call load header directly without a tenant
          this._loadMACHeaderApi().then(success, error);
        }
      }

      return macPreReqPromise;
    },

    /**
     * This is an extremely important API because all other api's will not work without it. The marketing cloud does
     * load balancing by tenant id (Really just a company id). Every request (besides this one) is required to be done
     * using the tenant. Let me give you an example:
     *
     * If you were using marketing-dev then you would hit the tenant api using the following base url:
     * https://marketing-dev.corp.adobe.com
     *
     * If you are logged into a company like Obu Eng SC then you would hit all endpoints using the following url:
     * https://obuengsc.marketing-dev.corp.adobe.com
     *
     * This method allows us to grab to appropriate tenant url to hit all other endpoints.
     *
     * @returns promise
     * @private
     */
    _loadMACTenantApi: function(){
      if (!macTenantPromise){
        macTenantPromise = new $.Deferred();

        $.ajax({
          type: 'GET',
          data: {
            orgId: macConfig.activeOrgId
          },
          url: macConfig.imsServer + macAPIEndpoints.tenant,
          contentType: "application/json",
          dataType: "jsonp",
          success: function(data){
            if (data && data.tenantUrl){ tenantUrl = data.tenantUrl; }
            if (data && data.tenantId){ tenantId = data.tenantId; }

            baseUrl = macConfig.imsServer;
            macConfig.imsServer = tenantUrl || macConfig.imsServer;

            macTenantPromise.resolve(data);
            macTenantPromise = null;
          },
          error: function(e){
            macTenantPromise.reject(e);
            macTenantPromise = null;
          }
        });
      }
      return macTenantPromise;
    },

    /**
     * Private method to load in the base header api.
     * @returns promise
     * @private
     */
    _loadMACHeaderApi: function(){
      if (!macHeaderPromise){
        macHeaderPromise = new $.Deferred();

        this._loadJSONP(macConfig.imsServer + macAPIEndpoints.header, function(json){
          headerData = json;
          macHeaderPromise.resolve(headerData);
          macHeaderPromise = null;
        }, function(e){
          macHeaderPromise.reject(e);
          macHeaderPromise = null;
        });
      }
      return macHeaderPromise;
    },

    /**
     * Set the currently active organization.
     * @param org
     * @returns {*}
     */
    setActiveOrg: function(org){
      if (!macChangeOrgPromise){
        macChangeOrgPromise = new $.Deferred();
        $.ajax({
          type: 'GET',
          url: macConfig.imsServer + macAPIEndpoints.setActiveOrg,
          contentType: "application/json",
          dataType: 'jsonp',
          data: {
            orgId: org.orgId
          },
          success: function(data){
            macConfig.imsServer = macConfig.imsServer.replace(tenantId, org.tenantId);
            macChangeOrgPromise.resolve({
              redirect:macConfig.imsServer
            });
            macChangeOrgPromise = null;
          },
          error: function(e){
            macChangeOrgPromise.reject(e);
            macChangeOrgPromise = null;
          }
        });
      }
      return macChangeOrgPromise;
    },

    /**
     * This is a generic method for loading in jsonp from the marketing cloud API's.
     *
     * @param url
     * @param success
     * @param error
     * @private
     */
    _loadJSONP: function(url, success, error){
      $.ajax({
        type: 'GET',
        url: url,
        data: {
          lang:macConfig.locale
        },
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(data){
          success(data);
        },
        error: function(e){
          //Don't give up on the first failed attempt because we could have a live IMS session but our marketing
          //cloud login could be dead.
          this._retryOnceAfterMACLoginAttempt(url, success, error);
        }.bind(this)
      });
    },

    /**
     * If a Marketing Cloud login is dead then any API call will fail. Because we are dealing with two different logins
     * (a MAC login and an IMS login) these can easily get out of sync. It is possible to have a live IMS session but
     * lose our authentication to the marketing cloud. This method attempts to login back into the marketing cloud
     * using the IMS session and then retry the failed method once.
     *
     * @param url
     * @param success
     * @param error
     * @private
     */
    _retryOnceAfterMACLoginAttempt: function(url, success, error){
      this._attemptMACLoginFromIMSSession(function(){
        $.ajax({
          type: 'GET',
          url: url,
          contentType: "application/json",
          dataType: 'jsonp',
          success: function(data){
            success(data);
          },
          error: function(e){
            if (window.console) { console.log('Unable to reach ' + url + ' even after an attempt to login to tartan.'); }
            error(e);
          }
        });
      }, function(e){
        if (window.console) { console.log('IMS Session is dead. Unable to log back into tartan.'); }
        error(e);
      });
    },

    /**
     * Occasionally an IMS login will live on but the associated Marketing Cloud login will die. This method will
     * attempt to log back into the MAC using the current IMS session.
     *
     * @param success
     * @param error
     * @private
     */
    _attemptMACLoginFromIMSSession: function(success, error){
      var autoLoginUrl = (baseUrl || macConfig.imsServer) + macAPIEndpoints.tartanLogin;

      var ifrm = $('<iframe></iframe>')
        .attr('src', autoLoginUrl)
        .css('display', 'none')
        .appendTo($('body'));

      var onMessage = function(event){
        if (autoLoginUrl.indexOf(event.origin + '/') === 0){
          //Remove the iframe
          ifrm.remove();

          try {
            //Parse the JSON data that was returned.
            var data = JSON.parse(event.data);

            //Auto login passes back a redirect url with the appropriate tenant id.
            //This is useful in the case of tenant routing when no activeOrgId is
            //passed in.
            if (data.redirect){
              data.redirect = data.redirect.replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
            }

            if (data.success){
              success(data);
            } else {
              error();
            }
          } catch (e) {
            error();
          }

          window.removeEventListener('message', onMessage);
        }
      };

      window.addEventListener('message', onMessage);

    }
  };
}(jQuery, window));
(function ($, window){
  // Allow console.log:
  /*jshint devel:true */

  /**
   * @class 
   * CUI.MacApiService.util provides multiple utility methods for dealing with data that comes back from 
   * the MacApiService.
   */
  CUI.MacApiService.util = /** @lends CUI.MacApiService.util# */{
    /**
     * Convenience method for getting the html safe name for the current organization.
     * @param user
     * @returns {*}
     */
    getActiveOrgNameFromUser: function(user){
      var activeOrg = this.getActiveOrgFromUser(user);
      if (activeOrg){
        return CUI.Endor.util.escapeHtml(activeOrg.name);
      }
      return '';
    },

    /**
     * Convenience method for getting the number of organizations from a user.
     * @param user
     * @returns {*}
     */
    getNumOrganizationsFromUser: function(user){
      if (user && user.organizations){
        return user.organizations.length;
      }
      return 0;
    },

    /**
     * An avatar for a user is specific to an organization within the marketing cloud. So to get an Avatar we need to
     * get the current active org and then return the associated avatar. This method makes sure that we return an
     * empty string of no avatar exists as opposed to returning null or some other bogus value.
     *
     * @param user
     * @returns {string}
     */
    getAvatarFromUser: function(user){
      var avatar = '';

      if (user && user.info && user.info.avatar && user.info.avatar !== ''){
        avatar = user.info.avatar;
      }

      return avatar;
    },

    /**
     * The user api returns an array of organizations that may or may not have an active flag set. This is a
     * convenience method for obtaining the current active organization for a specified user.
     *
     * @param user
     * @returns {*}
     */
    getActiveOrgFromUser: function(user){
      if (user && user.organizations && user.organizations.length > 0){
        var activeOrg = null;

        for (var i = 0; i < user.organizations.length; i++){
          if (user.organizations[i].active){
            activeOrg = user.organizations[i];
            break;
          }
        }
        return activeOrg;
      }
      return null;
    },

    /**
     * Select an organization from an orgId. This is important when clicking on an organization to switch orgs.
     *
     * @param user
     * @param orgId
     * @returns {*}
     */
    getOrgFromOrgId: function(user, orgId){
      if (user && user.organizations){
        var org = null;

        for (var i = 0; i < user.organizations.length; i++){
          var o = user.organizations[i];
          if (o.orgId == orgId){
            org = o;
            break;
          }
        }
        return org;
      }
      return null;
    },

    /**
     * The mac user api returns a user object with an array of actions including logout and settings. This is a
     * convenience method for retrieving an action from an associated user object.
     *
     * @param user
     * @param actionId
     * @returns {*}
     */
    getActionFromUser: function(user, actionId){
      var action = null;
      if (user && user.actions){
        user.actions.forEach(function(a){
          if (a.id == actionId){
            action = a;
          }
        });
      }
      return action;
    }
  };
}(jQuery, window));
(function ($, window) {
  var INTERACTIVE_LIST_ITEM_CLASS = "endor-List-item endor-List-item--interactive";
  // Allow console.log:
  /*jshint devel:true */
  CUI.HelpPopover = new Class(/** @lends CUI.HelpPopover# */{
    toString: 'HelpPopover',
    extend: CUI.Popover,

    /**
     * @extends CUI.Popover
     * @classdesc This widget controls the HelpPopover component
     *
     * This class will most likely be used in conjunction with the BlackBar component but can be initialized
     * elsewhere if desired. Every product will want to make sure that they pass in the search product so that
     * they get results that are specific to their specific product. It will default to pulling in help topics
     * from the marketing cloud.
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init();
    },

    /**
     * Public method for getting the search text.
     */
    getSearchText: function(){
      return this._searchText;
    },

    /**
     * Public method for setting the search text.
     */
    setSearchText: function(searchText){
      this._searchText = searchText;
      this._searchElement.val(searchText);
      this._toggleClearButton();
    },

    /**
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    whatsNewLabel: "What's New",
     *    customerCareLabel: "Customer Care",
     *    helpHomeLabel: "Help Home",
     *    communityLabel: "Community",
     *    searchPlaceholder: "Search",
     *    helpModuleBase: "https://microsite.omniture.com", //The base help home url. All links will be built from this.
     *    customerCareLink: "https://helpx.adobe.com/marketing-cloud/contact-support.html" //The actual link to customer care. This doesn't follow the same link pattern.
     * }
     */
    defaults: {
      whatsNewLabel: "What's New",
      customerCareLabel: "Customer Care",
      helpHomeLabel: "Help Home",
      communityLabel: "Community",
      searchPlaceholder: "Search",
      helpModuleBase: "https://microsite.omniture.com", //The base help home url. All links will be built from this.
      customerCareLink: "https://helpx.adobe.com/marketing-cloud/contact-support.html" //The actual link to customer care. This doesn't follow the same link pattern.
    },

    _searchForm: null,

    /**
     * Storage variable for the current searchText.
     * @private
     */
    _searchText: '',

    /**
     * Storage variable for the current element.
     * @private
     */
    _searchElement: null,

    /**
     * Storage variable for the clear button.
     * @private
     */
    _clearButton: null,

    /**
     * Create the inner html elements if they don't exist yet.
     * @private
     */
    _init: function(){
      this.$element.on('show', this._onShowElement.bind(this));
      
      //Make sure that the popover has an id. If it doesn't then add one. 
      if (!this.$element.attr('id')){
        this.$element.attr('id', 'help-popover');
      }
      
      //Make sure that this class has been initialized with the popover class.
      this.$element.addClass('coral-Popover');

      //If the markup hasn't yet been generated then generate it. 
      if (!this.$element.find('.endor-List').length){
        this.$element.empty().append(this._generateMarkup());
      }

      //Store a reference to the different form elements for performance.
      this._searchForm = this.$element.find('form');
      this._searchElement = this.$element.find('.coral-DecoratedTextfield-input');
      this._clearButton = this.$element.find('.coral-DecoratedTextfield-button');

      this._initEventListeners();
    },

    /**
     * Initialize the event listeners that make this class interactive.
     * @private
     */
    _initEventListeners: function(){
      this._clearButton.on('click', this._onClearClick.bind(this));
      this._searchElement.on('keyup', this._onInputKeyUp.bind(this));
      this._searchForm.submit(this._onSearchSubmit.bind(this));
    },

    _onSearchSubmit: function(event) {
      this.$element.find('[name="q"]').val(this._searchElement.val());
      this.$element.data('popover').hide();
    },

    /**
     * Keyup event handler for the search input. If enter is pressed then open a new window with the results.
     * @param event
     * @private
     */
    _onInputKeyUp: function(event){
      if (event.keyCode !== 13){
        var newVal = this._searchElement.val();
        if (newVal != this._searchText){
          this._searchText = newVal;
          this._toggleClearButton();
        }
      }
    },

    /**
     * Event handler for the clear search button.
     * @private
     */
    _onClearClick: function(){
      this._searchText = '';
      this._searchElement.val('');
      this._toggleClearButton();
    },

    /**
     * Either hide or show the clear button depending on the search text. This will be called every time tha text changes.
     * @private
     */
    _toggleClearButton: function(){
      if (this._searchText === ''){
        this._clearButton.hide();
      } else {
        this._clearButton.show();
      }
    },

    /**
     * Set the focus into the text input the moment that show is called on the help popover.
     * @private
     */
    _onShowElement: function(){
      //allow time for the click event to propagate all the way to the top or it will steal focus.
      setTimeout(function(){
        this._searchElement.focus();
      }.bind(this), 50);
    },

    /**
     * Generate all of the markup for the help popover if it hasn't been server generated.
     * @private
     */
    _generateMarkup: function(){
      var locale = CUI.MacApiService.getLocale() == 'jp_JP' ? 'ja_JP' : CUI.MacApiService.getLocale(),
        helpBase = this.options.helpModuleBase + '/t2/help/' + locale + '/home/index.html',
        searchProduct = CUI.MacApiService.getSearchProduct(),
        searchAction = this.options.helpModuleBase + "/t2/help/" + locale + "/home/index.html";

      return [
        '<div class="endor-List">',
          '<div class="endor-List-item">',
            '<form class="coral-Form coral-Form--vertical" action="' + searchAction + '" method="get" target="_blank">',
              '<div class="coral-Form-field coral-DecoratedTextfield coral-Form-field--singleItem">',
                '<i class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search"></i>',
                '<input type="text" class="coral-DecoratedTextfield-input coral-Textfield" placeholder="' + this.options.searchPlaceholder + '">',
                '<button type="button" class="coral-DecoratedTextfield-button coral-MinimalButton" style="display:none;">',
                  '<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>',
                '</button>',
              '</div>',
              '<input type="hidden" name="q" >',
              '<input type="hidden" name="r" value="' + searchProduct + '">',
              '<input type="submit" value="submit" style="display:none;">',
            '</form>',
          '</div>',
          '<a href="' + helpBase + '?r=' + searchProduct + '&f=release" target="_blank" class="' + INTERACTIVE_LIST_ITEM_CLASS + '">' + this.options.whatsNewLabel + '</a>',
          '<a href="' + helpBase + '?r=' + searchProduct + '&f=home" target="_blank" class="' + INTERACTIVE_LIST_ITEM_CLASS + '">' + this.options.helpHomeLabel + '</a>',
          '<a href="' + this.customerCareLink + '" target="_blank" class="' + INTERACTIVE_LIST_ITEM_CLASS + '">' + this.options.customerCareLabel + '</a>',
          '<a href="' + helpBase + '?r=' + searchProduct + '&f=community" target="_blank" class="' + INTERACTIVE_LIST_ITEM_CLASS + '">' + this.options.communityLabel + '</a>',
        '</div>'
      ].join('');
    }
  });

  CUI.Widget.registry.register('helpPopover', CUI.HelpPopover);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.HelpPopover.init($('[data-init~="help-popover"]', event.target));
    });
  }

  // Make this available to the shell.
  CUI.ShellWidgetMixin.applyTo(CUI.HelpPopover);

}(jQuery, this));

(function ($, window){
  CUI.Badge = new Class(/** @lends CUI.Badge# */{
    toString: 'Badge',
    extend: CUI.Widget,

    /**
     * @extends CUI.ShellWidget
     * @classdesc This widget controls the Badge component.
     *
     * This class will most likely be used in conjunction with the BlackBar component but can be initialized elsewhere
     * if desired. The data that is passed into this class matches the format defined by the marketing cloud unified
     * header. Specifically, the API to get notifications /content/mac/default/header/notifications.json.
     * If you have set the active org id (data-active-org-id="0006220750E719050A490D04@AdobeOrg") and set hasImsSession
     * (data-has-ims-session="true") on the shell component then all data will be loaded from the marketing cloud api's.
     *
     * @example
     * <caption>Example Data Object</caption>
     * {
     *      "viewAll": {
     *          "url": "#",
     *          "text": "View all (0 new)"
     *      },
     *      "newNotifications": [
     *          {
     *              "html": "First Notification"
     *          },
     *          {
     *              "html": "Second Notification"
     *          }
     *      ]
     * }
     *
     * For a reference to the marketing cloud header API's please refer to https://wiki.corp.adobe.com/display/marketingcloud/Unified+Header
     *
     * @constructs
     * @param options
     */
    construct: function(options){
      this._init();
      $(document).on(CUI.ShellMac.EVENT_IMS_INFO_UPDATED, CUI.Endor.util.debounce(this._loadNotificationsAsync).bind(this));
    },

    /**
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    notificationsCount: 0,
     *    notifications: null,
     *    notificationsUrl: null
     * }
     */
    defaults: {
      notificationsCount: 0,
      notifications: null,
      notificationsUrl: null
    },

    /**
     * Initialize the badge with the appropriate class and all of the appropriate data entry points to open the different
     * popovers.
     * @private
     */
    _init: function(){
      this.$element.addClass('endor-BlackBar-item endor-Badge');

      if (!this.$element.attr('data-target')){
        this.$element.attr('data-target', '#notifications-popover');
      }

      if (!this.$element.data('toggle')){
        this.$element.attr('data-toggle', 'popover');
      }

      if (!this.$element.data('pointFrom')){
        this.$element.attr('data-point-from', 'bottom');
      }

      if (!this.$element.data('alignFrom')){
        this.$element.attr('data-align-from', 'right');
      }

      this.options.notifications = this.options.notifications || {};

      this.updateNotifications(this.options.notifications);
      this._loadNotificationsAsync();
    },

    _loadNotificationsAsync: function(){
      if ((this.options.notificationsUrl && this.options.notificationsUrl !== '') || CUI.MacApiService.hasImsSession()){
        var notificationsPromise = CUI.MacApiService.getNotifications(this.options.notificationsUrl);
        if (notificationsPromise) {
          notificationsPromise.done(function(notifications){
            this.updateNotifications(notifications);
          }.bind(this));
        }  
      }
    },

    addNotification: function(notification){
      if (!notification.hasOwnProperty('html')) {
        notification = {
          html: notification
        };
      }

      this.options.notifications = this.options.notifications || {};
      this.options.notifications.newNotifications = this.options.notifications.newNotifications || [];
      this.options.notifications.newNotifications.push(notification);
      this.updateNotifications(this.options.notifications);
    },

    /**
     * Public API to update the notifications if they have changed.
     * @param notifications
     */
    updateNotifications: function(notifications){
      this.options.notifications = notifications || {};
      this.options.notificationsCount = notifications.newNotifications ? notifications.newNotifications.length : 0;

      this.$element.text(this.options.notificationsCount);
      if (this.options.notificationsCount === 0){
        this.$element.addClass('is-empty');
      } else {
        this.$element.removeClass('is-empty');
      }
    },

    /**
     * Public API to remove all notifications.
     */
    removeAllNotifications: function(){
      this.$element.text('0');
      this.$element.addClass('is-empty');
    }
  });

  CUI.Widget.registry.register('badge', CUI.Badge);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.Badge.init($('[data-init~="badge"]', event.target));
    });
  }

  CUI.ShellWidgetMixin.applyTo(CUI.Badge);

}(jQuery, window));
(function ($, window) {
  // Allow console.log:
  /*jshint devel:true */
  CUI.NotificationsPopover = new Class(/** @lends CUI.NotificationsPopover# */{
    toString: 'NotificationsPopover',
    extend: CUI.Popover,

    /**
     * @extends CUI.Popover
     * @classdesc This widget controls the NotificationsPopover component
     *
     * This class will most likely be used in conjunction with the BlackBar component but can be initialized
     * elsewhere if desired. The data that is passed into this class matches the format defined by the marketing
     * cloud unified header. Specifically the API to get notifications /content/mac/default/header/notifications.json.
     * If you have set the active org id (data-active-org-id="0006220750E719050A490D04@AdobeOrg") and set hasImsSession
     * (data-has-ims-session="true") on the shell component then all data will be loaded from the marketing cloud api's.
     *
     * @example
     * <caption>Example Data Object</caption>
     * {
     *      "viewAll": {
     *          "url": "#",
     *          "text": "View all (0 new)"
     *      },
     *      "newNotifications": [
     *          {
     *              "html": "First Notification"
     *          },
     *          {
     *              "html": "Second Notification"
     *          }
     *      ]
     * }
     *
     * For a reference to the marketing cloud header API's please refer to https://wiki.corp.adobe.com/display/marketingcloud/Unified+Header
     *
     * @example
     * <caption>Instantiate with JavaScript</caption>
     * new CUI.NotificationsPopover({
     *    element: '#notificationsPopup',
     *    config: CustomConfigObject
     *  });
     *
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init();
      $(document).on(CUI.ShellMac.EVENT_IMS_INFO_UPDATED, CUI.Endor.util.debounce(this._loadNotificationsAsync).bind(this));
    },

    /**
     * The defaults reflect the api defined by the marketing cloud. Please look above for details or refer to
     * https://wiki.corp.adobe.com/display/marketingcloud/Unified+Header
     *
     *
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    noNewNotificationsLabel: "You have no new notifications",
     *    notificationsUrl: null,
     *    notifications: null
     * }
     */
    defaults: {
      noNewNotificationsLabel: "You have no new notifications",
      notificationsUrl: null,
      notifications: null
    },

    /**
     * Add notifications, the view all button, or a label indicating that there are no new notifications.
     */
    applyOptions: function (options) {
    },

    /**
     * External api for adding a notification to the list.
     * @param notification
     */
    addNotification: function(notification){
      if (!notification.hasOwnProperty('html')) {
        notification = {
          html: notification
        };
      }

      //make sure that the objects exist in memory.
      this.options.notifications = this.options.notifications || {};
      this.options.notifications.newNotifications = this.options.notifications.newNotifications || [];
      this.options.notifications.newNotifications.push(notification);

      this.refreshList();
    },

    refreshList: function(){
      this._updateList();

      if (this.$element.is(':visible')){
        this._updatePopoverTail();
      }
    },

    /**
     * External api for changing all of the notifications with a new list.
     * @param notifications
     */
    updateNotifications: function(notifications){
      //make sure that the objects exist in memory.
      this.options = this.options || {};
      this.options.notifications = notifications;

      this.refreshList();
    },

    /**
     * External API for removing all notifications from the list.
     */
    removeAllNotifications: function(){
      this.options = this.options || {};
      this.options.notifications = this.options.notifications || {};
      this.options.notifications.newNotifications = [];

      this.updateNotifications(this.options.notifications);
    },

    /**
     * Load the notifications from a url provided through the notificationsUrl or from the IMS header API.
     */
    _loadNotificationsAsync: function(){
      if ((this.options.notificationsUrl && this.options.notificationsUrl !== "") || CUI.MacApiService.hasImsSession()){
        var notificationsPromise = CUI.MacApiService.getNotifications(this.options.notificationsUrl);
        if (notificationsPromise) {
          notificationsPromise.done(function(notifications){
            this.updateNotifications(notifications);
          }.bind(this)).fail(function(error){
            console.log('unable to pull in the notifications: ');
            console.log(error);
          });
        }
      }
    },

    /**
     * Update the location of the popover tail when something has changed.
     * @private
     */
    _updatePopoverTail: function(){
      //Only reposition the tail if the popover is open because otherwise it will be re-positioned on the next
      //show event.
      if (this.$element.is(':visible') && this.$element.data('popover')){
        //Calling hide and show on the popover so that the pointer will be re-positioned.
        this.$element.data('popover').hide();
        this.$element.data('popover').show();
      }
    },

    /**
     * Update the label/url of the view all notifications link.
     * @param viewAll
     */
    updateViewAll: function(viewAll){
      this.options.viewAll = viewAll;
      this._updateList();
    },

    /**
     * A reference to the list element so that we aren't always grabbing it through a jQuery selector.
     * @private
     */
    _listElement: null,

    /**
     * Remove all existing notifications and then add all of the new ones along with a view all notifications
     * button.
     * @private
     */
    _updateList: function(){
      this._listElement.empty();

      var newNotifications = this.options && this.options.notifications && this.options.notifications.newNotifications ?
        this.options.notifications.newNotifications : [];

      if (newNotifications.length > 0){
        newNotifications.forEach(function(notification){
          this._listElement.append('' +
            '<div class="endor-List-item endor-List-item--interactive endor-Notification is-unread">' +
              notification.html +
            '</div>'
          );
        }.bind(this));
      } else {
        this._listElement.append('' +
          '<div class="endor-List-item endor-List-item--interactive endor-Notification">' +
            this.options.noNewNotificationsLabel +
          '</div>'
        );
      }

      if (this.options.notifications.viewAll){
        this._listElement.append('' +
          '<div class="endor-List-item endor-List-item--interactive endor-Notification">' +
            '<a href="' + this.options.notifications.viewAll.url + '">' + this.options.notifications.viewAll.text + '</a>' +
          '</div>'
        );
      }
    },

    /**
     * Initialize the notifications popup with the appropriate class. If the list element hasn't been added yet
     * then make sure it is added. This method also provides a hook to the list element so that it can be referenced
     * later.
     * @private
     */
    _init: function(options){
      this.options.notifications = this.options.notifications || {};

      this.$element.addClass('coral-Popover');
      this._listElement = this.$element.find('.endor-List');
      if (!this._listElement.length){
        this._listElement = $('<div class="endor-List"></div>');
        this.$element.append(this._listElement);
      }

      this._loadNotificationsAsync();
      this._updateList();
    }
  });

  CUI.Widget.registry.register('notificationsPopover', CUI.NotificationsPopover);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.NotificationsPopover.init($('[data-init~="notifications-popover"]', event.target));
    });
  }

  // When this code gets moved out of the shell repository, then this line needs
  // to stay behind, to be called *after* the widget gets defined:
  CUI.ShellWidgetMixin.applyTo(CUI.NotificationsPopover);

}(jQuery, this));

(function ($, window) {
  // Allow console.log:
  /*jshint devel:true */
  CUI.UserAccountPopover = new Class(/** @lends CUI.UserAccountPopover# */{
    toString: 'UserAccountPopover',
    extend: CUI.Popover,

    /**
     * @extends CUI.Popover
     * @classdesc This widget controls the UserAccountPopover component
     *
     * This class will most likely be used in conjunction with the BlackBar component but can be initialized
     * elsewhere if desired. The data that is passed into this class matches the format defined by the marketing cloud
     * unified header. Specifically the API to get the user /content/mac/default/header/user.jsonp. If you have set the
     * active org id (data-active-org-id="customid@AdobeOrg") and set hasImsSession (data-has-ims-session="true")
     * on the shell component then all data will be loaded from the marketing cloud api's.
     *
     * @example
     * <caption>Example User Object</caption>
     * {
     *    "info": {
     *      "displayName": "Sally Social",
     *      "title": "Marketer",
     *      "avatar": "../images/user/avatar.png",
     *    },
     *    "actions": [
     *      {
     *        "id": "logout",
     *        "url": "",
     *        "text": "Sign out"
     *      },
     *      {
     *        "id": "settings",
     *        "url": "",
     *        "text": "Account Settings"
     *      }
     *    ],
     *    "organizations": [
     *      {
     *        "orgId": "",
     *        "tenantId": "",
     *        "active": false,
     *        "name": "Obu Eng SC",
     *        "avatar": ""
     *      },
     *      {
     *        "orgId": "",
     *        "tenantId": "",
     *        "active": true,
     *        "name": "Tartan Dev",
     *        "avatar": ""
     *      }
     *    ]
     * }
     *
     * For a reference to the marketing cloud header API's please refer to https://wiki.corp.adobe.com/display/marketingcloud/Unified+Header
     *
     * @example
     * <caption>Instantiate with JavaScript</caption>
     * new CUI.UserAccountPopover({
     *      element: '#myElement'
     *      config: ConfigObject
     * });
     *
     * @constructs
     * @param {Object} options
     */
    construct: function (options) {
      this._init();
    },

    /**
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    user: null,
     *    userUrl: null,
     *    customLogout: false
     * }
     */
    defaults: {
      user: null,
      userUrl: null,
      customLogout: false
    },

    /**
     * Public method for updating the UI for the user by injecting a new user object.
     * @param user
     */
    updateUser: function(user){
      //User can either be a promise or an object.
      this.options.user = user;

      var userHtml = this._generateTenantHtml();
      this.$endorList.html(userHtml);
    },

    /**
     * Create the inner html elements if they don't exist yet.
     * @private
     */
    _init: function(){
      this.$element.addClass('coral-Popover');

      if (!this.$element.find('.endor-List').length){
        this.$element.empty().append('<div class="endor-List" ></div>');
      }

      this.$endorList = this.$element.find('.endor-List');
      this.$endorList.on('click', '.endor-Account-logout', this._onLogoutClick.bind(this));
      this.$endorList.on('click', '.endor-list-item--tenant', this._onTenantClick.bind(this));

      if (this.user){
        this.$endorList.html(this._generateTenantHtml());
      } else {
        this.$endorList.html(this._generateLoaderHtml());
      }

      //Load a user again when the ims information has been updated.
      $(document).on(CUI.ShellMac.EVENT_IMS_INFO_UPDATED, CUI.Endor.util.debounce(this._loadUserAsync).bind(this));

      this._loadUserAsync();
    },

    _loadUserAsync: function(){
      if ((this.options.userUrl && this.options.userUrl !== '') || CUI.MacApiService.hasImsSession()){
        var userPromise = CUI.MacApiService.getUser(this.options.userUrl);
        if (userPromise) {
          userPromise.done(function(user){
            this.updateUser(user);
          }.bind(this));
        }   
      }
    },

    /**
     * There are a couple different states that may exist with the user popover including a single tenant state and
     * a multi-tenant state. In a single tenant state the current org will be placed under the users title. In a multi-tenant
     * state the current org will be placed in a list of clickable orgs. This method will generate the appropriate
     * user html.
     * @returns {string}
     * @private
     */
    _generateTenantHtml: function(){
      var numOrgs = CUI.MacApiService.util.getNumOrganizationsFromUser(this.options.user),
        activeOrg = CUI.MacApiService.util.getActiveOrgFromUser(this.options.user),
        settingsConfig = CUI.MacApiService.util.getActionFromUser(this.options.user, 'settings'),
        signOutConfig = CUI.MacApiService.util.getActionFromUser(this.options.user, 'logout'),
        tenantHtml = '' +
          '<div class="endor-List-item endor-List-item--highlight endor-Account">' +
            this._getUserAvatarHtml(this.options.user) +
            '<a href="' + settingsConfig.url + '" title="' + settingsConfig.text + '" ' +
              'class="endor-Account-configLink coral-Icon coral-Icon--gear coral-Icon--sizeM"></a>' +
            '<div class="endor-Account-data">' +
              '<span class="endor-Account-name">' + this.options.user.info.displayName + '</span>' +
              '<span class="endor-Account-caption">' + this.options.user.info.title + '</span>' +
              (numOrgs == 1 ? '<span class="endor-Account-caption">' + activeOrg.name + '</span>' : '') +
            '</div>' +
          '</div>';

      if (numOrgs > 1){
        this.options.user.organizations.forEach(function(org){
          tenantHtml += '<a' + (org.orgId ? ' data-org-id="' + org.orgId + '"' : '') +
            ' class="endor-List-item endor-List-item--interactive endor-list-item--tenant">' +
            org.name + '</a>';
        });
      }

      tenantHtml += '' +
        '<div class="endor-List-item endor-List-item--highlight">' +
          '<button class="coral-Button coral-Button--primary coral-Button--block endor-Account-logout">' + signOutConfig.text + '</button>' +
        '</div>';

      return tenantHtml;
    },

    /**
     * Generate an empty loader container if a user is null. For now we are just going to assume that a user will only
     * be null temporarily until the API returns data.
     * @returns {string}
     * @private
     */
    _generateLoaderHtml: function(){
      return '' +
        '<div class="endor-Account-loaderContainer">' +
          '<div class="coral-Wait coral-Wait--large coral-Wait--center"></div>' +
        '</div>';
    },

    /**
     * Generate an avatar with an image or an icon depending on whether or not the user has an avatar. this method will
     * also optionally allow the user to edit their avatar.
     * @param user
     * @returns {string}
     * @private
     */
    _getUserAvatarHtml: function(user){
      var userAvatar = (user.info && user.info.avatar) ? user.info.avatar : '',
        settingsAction = CUI.MacApiService.util.getActionFromUser(this.options.user, 'settings'),
        editAvatarUrl = (user.info && user.info.disableEditAvatar === true) ? '' : settingsAction.url || '';

      if (userAvatar !== ''){
        return '' +
          '<a class="endor-Account-avatar"' + (editAvatarUrl !== '' ? ' href="' + editAvatarUrl + '"' : '') + ' title="Edit">' +
            '<img src="' + user.info.avatar + '" alt="avatar"/>' +
            (editAvatarUrl !== '' ?  '<i class="endor-Account-avatar-overlay coral-Icon coral-Icon--sizeS coral-Icon--edit"></i>' : '') +
          '</a>';
      } else {
        return '' +
          '<a class="endor-Account-avatar endor-Account-avatar--default"' + (editAvatarUrl !== '' ? ' href="' + editAvatarUrl + '"' : '') + ' title="Edit">' +
            '<i class="coral-Icon coral-Icon--sizeL coral-Icon--user"></i>' +
            (editAvatarUrl !== '' ? '<i class="endor-Account-avatar-overlay coral-Icon coral-Icon--sizeS coral-Icon--edit"></i>' : '') +
          '</a>';
      }
    },

    /**
     * Click handler for the logout button. If a customLogout flag has been set then this method will dispatch an event
     * that should be listened for outside of this class. Otherwise, it will simply forward the user to the logout url.
     * @param event
     * @private
     */
    _onLogoutClick: function(event){
      var logoutAction = CUI.MacApiService.util.getActionFromUser(this.options.user, 'logout');
      if (this.options.customLogout || logoutAction.url === ""){
        $(document).trigger(CUI.UserAccountPopover.EVENT_CUSTOM_LOGOUT, [logoutAction.url]);
      } else {
        window.location.href = logoutAction.url;
      }
    },

    /**
     * Click handler for a specific organization within the list of organizations. This really is something that is
     * specific to a marketing cloud login.
     * @param event
     * @private
     */
    _onTenantClick: function(event){
      var orgId = $(event.target).data('orgId'),
        org = CUI.MacApiService.util.getOrgFromOrgId(this.options.user, orgId),
        activeOrg = CUI.MacApiService.util.getActiveOrgFromUser(this.options.user),
        loadIcon = $('' +
          '<div class="endor-Account-modalLoaderContainer">' +
            '<div class="coral-Wait coral-Wait--large coral-Wait--center"></div>' +
          '</div>'
        ).appendTo(this.$endorList);

      if (org && org != activeOrg){
        CUI.MacApiService.setActiveOrg(org)
          .done(function(data){
            if (data.redirect){
              window.location.href = data.redirect;
            }
          })
          .fail(function(e){
            if (window.console) { console.log('failed to set the active org.'); }
          })
          .always(function(){
            loadIcon.remove();
          });
      } else {
        loadIcon.remove();
      }
    }
  });

  CUI.UserAccountPopover.EVENT_CUSTOM_LOGOUT = 'cui-useraccountpopup-logout-click';

  CUI.Widget.registry.register('userAccountPopover', CUI.UserAccountPopover);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.UserAccountPopover.init($('[data-init~="user-account-popover"]', event.target));
    });
  }

  CUI.ShellWidgetMixin.applyTo(CUI.UserAccountPopover);

}(jQuery, window));
(function ($, window){
  // Allow console.log:
  /*jshint devel:true */
  var HTML_DEFAULT_AVATAR = '<i class="coral-Icon coral-Icon--sizeM coral-Icon--user"></i>';
  var SELECTOR_AVATAR = 'endor-UserProfile-avatar';
  var SELECTOR_DEFAULT_AVATAR = 'endor-UserProfile-avatar--default';

  CUI.UserProfile = new Class(/** @lends CUI.UserProfile# */{
    toString: "UserProfile",
    extend: CUI.Widget,

    /**
     * @extends CUI.ShellWidget
     * @classdesc This widget controls the UserProfile component.
     *
     * This class will most likely be used in conjunction with the BlackBar component but can be initialized
     * elsewhere if desired. The data that is passed into this class matches the format defined by the marketing cloud
     * unified header. Specifically the API to get the user /content/mac/default/header/user.jsonp. If you have set the
     * active org id (data-active-org-id="0006220750E719050A490D04@AdobeOrg") and set hasImsSession (data-has-ims-session="true")
     * on the shell component then all data will be loaded from the marketing cloud api's.
     *
     * @example
     * <caption>Example User Object</caption>
     * {
     *    "info": {
     *      "displayName": "Sally Social",
     *      "title": "Marketer",
     *      "avatar": "../images/user/avatar.png",
     *    },
     *    "actions": [
     *      {
     *        "id": "logout",
     *        "url": "",
     *        "text": "Sign out"
     *      },
     *      {
     *        "id": "settings",
     *        "url": "",
     *        "text": "Account Settings"
     *      }
     *    ],
     *    "organizations": [
     *      {
     *        "orgId": "",
     *        "tenantId": "",
     *        "active": false,
     *        "name": "Obu Eng SC",
     *        "avatar": ""
     *      },
     *      {
     *        "orgId": "",
     *        "tenantId": "",
     *        "active": true,
     *        "name": "Tartan Dev",
     *        "avatar": ""
     *      }
     *    ]
     * }
     *
     * For a reference to the marketing cloud header API's please refer to https://wiki.corp.adobe.com/display/marketingcloud/Unified+Header
     *
     * @constructs
     * @param options
     */
    construct: function(options){
      this._init();
    },

    /**
     * @example
     * <caption>Default Parameters</caption>
     * {
     *    user: null,
     *    userUrl: null
     * }
     */
    defaults: {
      user: null,
      userUrl: null
    },

    /**
     * Storage variable for the tenant DOM element.
     * @private
     */
    _tenant: null,

    /**
     * Storage variable for the avatar DOM element.
     * @private
     */
    _avatar: null,

    /**
     * Public method to update the UI from a user object..
     * @param user
     */
    updateUser: function(user){
      var activeOrg = CUI.MacApiService.util.getActiveOrgFromUser(user),
        orgCount = CUI.MacApiService.util.getNumOrganizationsFromUser(user);

      this.options.user = user;
      this._updateTenant(activeOrg, orgCount);
      this._updateAvatar();
    },

    updateAvatar: function(avatar){
      this.options.user = this.options.user || {};
      this.options.user.info = this.options.user.info || {};
      this.options.user.info.avatar = avatar;
      this._updateAvatar();
    },

    _init: function(){
      //Add the appropriate class
      this.$element.addClass('endor-BlackBar-item endor-UserProfile');

      //Make sure that the button points to the user-account-popover.
      if (!this.$element.attr('data-target')){
        this.$element.attr('data-target', '#user-account-popover');
      }

      if (!this.$element.data('toggle')){
        this.$element.attr('data-toggle', 'popover');
      }

      if (!this.$element.data('pointAt')){
        this.$element.attr('data-point-at', '#user-profile-avatar');
      }

      if (!this.$element.data('pointFrom')){
        this.$element.attr('data-point-from', 'bottom');
      }

      if (!this.$element.data('alignFrom')){
        this.$element.attr('data-align-from', 'right');
      }

      this._initTenant();
      this._initAvatar();

      //Load a user again when the ims information has been updated.
      $(document).on(CUI.ShellMac.EVENT_IMS_INFO_UPDATED, CUI.Endor.util.debounce(this._loadUserAsync).bind(this));

      if (this.options.user){
        this.updateUser(this.options.user);
      } else {
        this._loadUserAsync();  
      }
    },

    /**
     * Create the tenant if it hasn't been created yet.
     * @private
     */
    _initTenant: function(){
      this._tenant = this.$element.find('.endor-UserProfile-tenant');
      if (!this._tenant.length){
        this._tenant = $('' +
          '<div class="endor-UserProfile-tenant">' +
            CUI.MacApiService.util.getActiveOrgNameFromUser(this.options.user) +
          '</div>'
        ).appendTo(this.$element);
      }
    },

    _loadUserAsync: function(){
      if ((this.options.userUrl && this.options.userUrl !== '') || CUI.MacApiService.hasImsSession()){
        var userPromise = CUI.MacApiService.getUser(this.options.userUrl);
        if (userPromise) {
          userPromise.done(function(user){
            this.updateUser(user);
          }.bind(this));
        } 
      }
    },

    /**
     * Update the text of the tenant. If there is more than one tenant then add the text of the active tenant. Otherwise,
     * leave the tenant box blank.
     * @param activeOrg
     * @param orgCount
     * @private
     */
    _updateTenant: function(activeOrg, orgCount){
      if (activeOrg && orgCount > 1) {
        this._tenant.text(activeOrg.name);
      } else {
        this._tenant.text('');
      }
    },

    /**
     * Initialize the user avatar. If there is no user or the avatar does not exist then set it to the default.
     * @private
     */
    _initAvatar: function(){
      this._avatar = this.$element.find('.endor-UserProfile-avatar');
      if (!this._avatar.length){
        this._avatar = $('<div id="user-profile-avatar" class="' + SELECTOR_AVATAR + '"></div>').appendTo(this.$element);
        this._updateAvatar();
      }
    },

    /**
     * Update the UI with the appropriate avatar. This will be an empty person icon if there is no avatar or the avatar
     * is equal to an empty string. Otherwise, it will actually create an image with the appropriate user avatar.
     * @private
     */
    _updateAvatar: function(){
      var userAvatar = CUI.MacApiService.util.getAvatarFromUser(this.options.user);
      //Update the users avatar.
      if (userAvatar !== '') {
        this._avatar.removeClass(SELECTOR_DEFAULT_AVATAR).html('' +
          '<img src="' + userAvatar + '" alt="avatar">'
        );
      } else {
        this._avatar.addClass(SELECTOR_DEFAULT_AVATAR).html(HTML_DEFAULT_AVATAR);
      }
    }
  });

  CUI.Widget.registry.register('userProfile', CUI.UserProfile);
  if (CUI.options.dataAPI) {
    $(document).on('cui-contentloaded.data-api', function (event) {
      CUI.UserProfile.init($('[data-init~="user-profile"]', event.target));
    });
  }

  CUI.ShellWidgetMixin.applyTo(CUI.UserProfile);

})(jQuery, window);

// Report Suite Selector

(function ($) {
	CUI.ReportSuiteSelector = new Class({
		toString: 'ReportSuiteSelector',
		extend: CUI.Widget,
		defaults: {
			// The URL this component should use to get report suites.
			reportSuiteListUrl: null,
			// The URL this component should POST to to change report suite.
			changeReportSuitesEndpoint: null,
			// If true, this component will POST a form to the changeReportSuitesEndpoint.
			// If false, this component will emit a changeReportSuiteEvent.
			reloadPage: true,
			// If true, will show a confirmation dialog asking the user to confirm report suite change.
			confirm: false,
			// The report suite that should be selected when this component is initialized.
			rsid: null, 
			// The l10n show all label.
			showAllLabel: "Show All",
			// The l10n search placeholder label.
			searchPlaceholderLabel: "Search Report Suites",
			// The l10n label to represent no report suites.
			noReportSuitesLabel: "No report suites."
		},
		construct: function(options) {

			var thisWidget = this;

			// Increment selector count. This is to avoid ID collisions
			// if multiple selectors are used on the same page.
			if (CUI.ReportSuiteSelector.hasOwnProperty('count'))
				CUI.ReportSuiteSelector.count++;
			else
				CUI.ReportSuiteSelector.count = 0;

			// Build HTML elements for component.
			var ui = thisWidget._buildElements();

			// Wire up events.
			thisWidget._wireEvents();

			// Load initial report suite data and store it.
			// Pass in a callback and do the rest of the setup within it.
			thisWidget._loadData(false, function () {

				// Populate report suite list with initial data.
				thisWidget._populateList();

				// If an initial report suite was supplied, select it.
				if (thisWidget.options.rsid !== null && thisWidget._cachedReportSuiteData.length > 0) {
					// Pass in false to prevent changeSuite from reloading the page.
					// If you don't pass in false then the initial setting of report suite would
					// cause the page to refresh in an infinite loop.
					thisWidget.changeSuite(thisWidget.options.rsid, false, true);
				} else {
					ui.$triggerLink.setText("No Report Suite");
				}

				// Select the top report suite.
				ui.$selectedSuite = ui.$suiteList
					.find('li')
					.first()
					.addClass('suite-selected');

			});

		},

		// PUBLIC: Changes the currently selected report suite.
		changeSuite: function (rsid, confirmAndPost, initialSuite) {
			var thisWidget = this,
				ui = thisWidget.uiElements;

			// Put the suite change logic into a function.
			// If options.confirm is true then we'll show a modal and fire this function when the user clicks confirm.
			// If confirm is false then we will simply fire this logic immediately.
			var performChange = function() {
				if (thisWidget.selectedSuite && thisWidget.selectedSuite === rsid) {
					return;
				}
				thisWidget.selectedSuite = rsid;
				ui.$triggerLink.setText(reportSuiteData.name);
				var changeSuiteAndReload = function (rsid) {
					// Construct a form to be posted.
					var $form = $('<form>')
						.attr('method', 'POST')
						.attr('action', thisWidget.options.changeReportSuitesEndpoint)
						.appendTo('body');
					$('<input>')
						.attr('type', 'hidden')
						.attr('name', 'd_url')
						.attr('id', 'switch_destination_url')
						.val(window.btoa(location.href))
						.appendTo($form);
					$('<input>')
						.attr('type', 'hidden')
						.attr('name', 'switch_accnt')
						.val(rsid)
						.appendTo($form);

					// Submit the form, thus making a POST request to the server
					// and refreshing the page.
					$form.submit();
				};
				if (confirmAndPost !== false && CUI.ReportSuiteSelector.reloadPage !== false) {
					changeSuiteAndReload(rsid);
				} else {
					// Trigger a report-suite-changed event if we're not going to
					// reload the page.
					var suiteChangedEvent = $.Event(CUI.ReportSuiteSelector.EVENT_REPORT_SUITE_CHANGED);
					suiteChangedEvent.initialSuite = initialSuite;
					$(document).trigger(suiteChangedEvent, {
						rsid: rsid,
						changeSuiteAndReload: changeSuiteAndReload
					});
				}
			};

			// Iterate over all loaded report suites.
			for (var key in thisWidget._cachedReportSuiteData) {
				var reportSuiteData = thisWidget._cachedReportSuiteData[key];
				// Find the report suite that was selected to confirm it exists.
				if (reportSuiteData.value === rsid) {
					// If options.confirm is true then show a modal.
					if (thisWidget.options.confirm && !initialSuite) {
						// Get reference to the modal API.
						var modal = ui.$modal.data('modal');
						// If there is no modal API then no modal has been created yet.
						if (!modal)
							// Instantiate the modal.
							modal = ui.$modal.modal();
						// Set up a one-time click event on the confirm button of the modal.
						ui.$modalConfirmButton.one('click', performChange);
						// Show the modal.
						modal.show();
					} else
						// Skip modal logic and just change the suite.
						performChange();
					return;
				}
			}
			// If we've made it this far then we have no report suite that matches the
			// supplied RSID. Throw an error.
			throw new Error("Report suite \"" + rsid + "\" was specified but none were found with that RSID.");
		},
		// PRIVATE: Builds all HTML elements required. (called from construct)
		_buildElements: function () {

			// Create and add trigger link.
			var $link = $('<a>')
				.addClass('coral-ButtonGroup-item coral-Button coral-Button--secondary coral-Button--quiet coral-Button--rsidSelector')
				.attr('data-toggle', 'popover')
				.attr('data-target', '#reportSuiteSelector:' + CUI.ReportSuiteSelector.count)
				.appendTo(this.$element);

			// Helper function for updating the link text so it always includes the icon.
			// I preferred this over adding an entirely separate element to this.uiElements
			// just for updating the displayed text.
			$link.setText = function (text) {
				$link.html('<i class="endor-ActionButton-icon coral-Icon coral-Icon--data"></i>');
				$('<span class="endor-ActionButton-label">').text(text).appendTo($link);
			};

			/*** SELECTOR MARKUP ***/

			// Create and add popover container.
			var $container = $('<div>')
				.attr('data-align-from', this.options.alignFrom)
				.attr('data-point-from', this.options.pointFrom)
				.attr('id', 'reportSuiteSelector:' + CUI.ReportSuiteSelector.count)
				.addClass('coral-Popover report-suite-selector')
				.appendTo(this.$element);

			// Create list for search box list item.
			var $searchList = $('<div>')
				.addClass('endor-List')
				.appendTo($container);

			// Create endor list item for search box.
			var $searchListItem = $('<div>')
				.addClass('endor-List-item')
				.appendTo($searchList);

			var $searchFieldContainer = $('<div>')
				.addClass('searchfield')
				.appendTo($searchListItem);

			// Create container for search box and icon.
			var $searchBoxContainer = $('<div>')
				.addClass('coral-DecoratedTextfield coral-Popover-content--Textfield')
				.appendTo($searchFieldContainer);

			// Create icon.
			var $searchBoxIcon = $('<i>')
				.addClass('coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search')
				.appendTo($searchBoxContainer);

			// Add a filter input to popover.
			var $searchBox = $('<input>')
				.addClass('coral-DecoratedTextfield-input coral-Textfield')
				.attr('type', 'text')
				.attr('placeholder', this.options.searchPlaceholderLabel)
				.appendTo($searchBoxContainer);

			// Add a filter input clear button.
			var $clearButton = $('<button>')
				.addClass('coral-DecoratedTextfield-button coral-MinimalButton')
				.attr('type', 'button')
				.html('<i class="coral-MinimalButton-icon coral-Icon coral-Icon--sizeXS coral-Icon--close">')
				.hide()
				.appendTo($searchBoxContainer);

			// Create and add a container for the report suite list.
			var $suiteList = $('<div>')
				.addClass('endor-List report-suite-list')
				.appendTo($container);

			// Create a "show all" link that only shows if the search box is empty.
			var $showAllLink = $('<a>')
				.addClass('endor-List-item show-all-link')
				.text(this.options.showAllLabel)
				.appendTo($container);

			/*** MODAL MARKUP ***/

			var $modal = $('<div>')
				.addClass('coral-Modal')
				.appendTo(this.$element);

			var $modalHeader = $('<div>')
				.addClass('coral-Modal-header')
				.appendTo($modal);

			$('<i>')
				.addClass('coral-Modal-typeIcon coral-Icon coral-Icon-sizeS')
				.appendTo($modalHeader);

			$('<h2>')
				.addClass('coral-Modal-title coral-Heading coral-Heading--2')
				.text('Are you sure?')
				.appendTo($modalHeader);

			var $modalCloseButton = $('<button>')
				.attr('type', 'button')
				.attr('title', 'Close')
				.attr('data-dismiss', 'modal')
				.addClass('coral-MinimalButton coral-Modal-closeButton')
				.appendTo($modalHeader);

			$('<i>')
				.addClass('coral-Icon coral-Icon-sizeXS coral-Icon--close coral-MinimalButton-icon')
				.appendTo($modalCloseButton);

			var $modalBody = $('<div>')
				.addClass('coral-Modal-body')
				.appendTo($modal);

			var $modalText = $('<p>')
				.text('Changing report suites may cause any unsaved data on the page to be lost.')
				.appendTo($modalBody);

			var $modalFooter = $('<div>')
				.addClass('coral-Modal-footer')
				.appendTo($modal);

			var $modalCancelButton = $('<button>')
				.attr('type', 'button')
				.attr('data-dismiss', 'modal')
				.addClass('coral-Button')
				.text('Cancel')
				.appendTo($modalFooter);

			var $modalConfirmButton = $('<button>')
				.attr('type', 'button')
				.attr('data-dismiss', 'modal')
				.addClass('coral-Button coral-Button--primary')
				.text('Yes')
				.appendTo($modalFooter);

			/********************/

			// Attach elements to component for easy access.
			this.uiElements = {
				$triggerLink: $link,
				$popoverContainer: $container,
				$searchBox: $searchBox,
				$clearButton: $clearButton,
				$suiteList: $suiteList,
				$showAllLink: $showAllLink,
				$modal: $modal,
				$modalHeader: $modalHeader,
				$modalCloseButton: $modalCloseButton,
				$modalBody: $modalBody,
				$modalText: $modalText,
				$modalFooter: $modalFooter,
				$modalCancelButton: $modalCancelButton,
				$modalConfirmButton: $modalConfirmButton
			};

			return this.uiElements;

		},

		// PRIVATE: Wires events to UI elements. (called from construct)
		_wireEvents: function () {

			var thisWidget = this,
				ui = thisWidget.uiElements;

			// Declare function to see if an element is in its parent's viewport.
			var visibleY = function(childElement, parentElement){
				// Get the child element's rectangle.
				var childRectangle = childElement.getBoundingClientRect();
				// Get the parent element's rectangle.
				var parentRectangle = parentElement.getBoundingClientRect();
				// Check if the bottom of the child's rectangle is below the bottom of the parent's rectangle.
				var isBelow = childRectangle.bottom < parentRectangle.bottom;
				// Check if the top of the child's rectangle is above the top of the parent's rectangle.
				var isAbove = childRectangle.top > parentRectangle.top;
				// If the child rectangle is above or below the parent rectangle, even slightly, we consider it not visible.
				return !isBelow && !isAbove;
			};

			// Repopulate report suite list when the user stops typeing in the search for more than half a second.
			// Also allow arrow keys to scroll through list items.
			ui.$searchBox.on('keydown', function (e) {

				// Hash of key names to key codes for readability.
				var keys = {
					upArrow: 38,
					downArrow: 40,
					enter: 13,
					escape: 27
				};

				// Check which key was pressed.
				switch (e.keyCode) {
					case keys.upArrow:
						// If the selected element is not the first element...
						if (ui.$selectedSuite.index() > 0) {
							ui.$selectedSuite.removeClass('suite-selected');
							// Select previous sibling.
							ui.$selectedSuite = ui.$selectedSuite.prev();
							// If the list item is visible within the vertically scrollable viewport...
							if (!visibleY(ui.$selectedSuite[0], ui.$suiteList[0]))
								// Scroll the element into view, aligning with the top of the viewport.
								ui.$selectedSuite[0].scrollIntoView(true);
							ui.$selectedSuite.addClass('suite-selected');
						}
						break;
					case keys.downArrow:
						// If the selected element is not the last element...
						if (ui.$selectedSuite.index() < ui.$suiteList.children('li').length - 1) {
							ui.$selectedSuite.removeClass('suite-selected');
							// Select next sibling.
							ui.$selectedSuite = ui.$selectedSuite.next();
							// If the list item is visible within the vertically scrollable viewport...
							if (!visibleY(ui.$selectedSuite[0], ui.$suiteList[0]))
								// Scroll the element into view, aligning with the bottom of the viewport.
								ui.$selectedSuite[0].scrollIntoView(false);
							ui.$selectedSuite.addClass('suite-selected');
						}
						break;
					case keys.enter:
						// Prevent default because enter key press is somehow clearing the confirmation modal.
						e.preventDefault();
						// If the user presses the enter key then fire its click event.
						ui.$selectedSuite.click();
						break;
					case keys.escape:
						// If the search box has text...
						if (ui.$searchBox.val().length > 0) {
							// Clear search text by clicking clear button.
							ui.$clearButton.click();
						}
						// If the search box has no text...
						else {
							// Close entire popover.
							ui.$popoverContainer.data('popover').hide();
						}
						break;
					default:
						// If none of the above keys were pressed then re-populate the result list.
						$(this).data('delayId', setTimeout(function () {
							thisWidget._populateList();
							// Select the top report suite.
							ui.$selectedSuite = ui.$suiteList
								.find('li')
								.first()
								.addClass('suite-selected');
						}, 500));
						if ($(this).val().length > 0) {
							ui.$clearButton.show();
						} else {
							ui.$clearButton.hide();
						}
						break;
				}
			});

			// Show all report suites when "show all" is clicked.
			ui.$showAllLink.on('click', function (e) {
				e.preventDefault();
				thisWidget._loadData(true, function () {
					thisWidget._populateList();
					ui.$showAllLink.hide();

					// Select the top report suite.
					ui.$selectedSuite = ui.$suiteList
						.find('li')
						.first()
						.addClass('suite-selected');
				});
			});

			// Clear filter text when clear button is clicked.
			ui.$clearButton.click(function (e) {
				e.preventDefault();
				// Hide clear button.
				$(this).hide();
				// Clear filter text.
				ui.$searchBox.val('');
				// Repopulate list.
				thisWidget._populateList();
				// Select the top report suite.
				ui.$selectedSuite = ui.$suitList
					.find('li')
					.first()
					.addClass('suite-selected');
			});

			// Focus filter box when popup opens.
			ui.$popoverContainer.on('show', function (e) {
				setTimeout(ui.$searchBox.focus.bind(ui.$searchBox), 100);
			});

		},

		// PRIVATE: The raw list data is cached here.
		_cachedReportSuiteData: [],

		// PRIVATE: Load list data. If loadAll is set to true then retrieve all report suites.
		_loadData: function (loadAll, callback) {
			var thisWidget = this;

			$.ajax({
				url: thisWidget.options.reportSuiteListUrl,
				data: { limit: loadAll ? 0 : 10 }
			}).done(function (data) {
				thisWidget._cachedReportSuiteData = data;
				thisWidget._populateList();
				if (callback) callback();
			});
		},

		// PRIVATE: Populates the list of report suites.
		// (called once from construct and again from search box keydown event)
		_populateList: function () {

			var data = this._cachedReportSuiteData,
				thisWidget = this,
				ui = thisWidget.uiElements,
				searchText = ui.$searchBox.val();

			// If there is search text then load full data set if it hasn't been loaded already.
			// We pass in _populateList as a callback so this method will re-run after the full list is loaded.
			if (searchText.length > 0 && ui.$showAllLink.is(':visible')) {
				ui.$showAllLink.hide();
				thisWidget._loadData(true, function () {
					thisWidget._populateList();
					// Select the top report suite.
					ui.$selectedSuite = ui.$suiteList
						.find('li')
						.first()
						.addClass('suite-selected');
				});
				return;
			}

			// Empty the report suite list and rebuild it using stored data.
			ui.$suiteList.empty();
			function reportSuiteClick(e) {
				var reportSuiteData = $(this).data('reportSuiteData');
				thisWidget.changeSuite(reportSuiteData.value, thisWidget.options.reloadPage, false);
				ui.$popoverContainer.data('popover').hide();
			}

			// Only load the item into the list if there is no search text or the item matches the search text.
			if (searchText.length > 0) {
				data = this._cachedReportSuiteData.filter(function (item) {
					var itemName = item.name.toLowerCase(),
						score = 0,
						currentChar,
						charPosition = 0,
						nextPosition;

					// Iterate over search text characters.
					for (var index = 0; index < searchText.length; index++) {
						// Get the current character.
						currentChar = searchText[index].toLowerCase();
						// If the character is a space, move on.
						if (currentChar === ' ') continue;
						// Check if current character is in the string, starting from the index of the last found character.
						nextPosition = itemName.indexOf(currentChar, index === 0 ? charPosition : charPosition + 1);
						// Calculate a score by subtracting the current character position from the next character position.
						score += (nextPosition - charPosition) * (index === 0 ? 1 : 3);
						// Set the current character position to the next character position.
						charPosition = nextPosition;
						// If the next character position is -1 then it was not found in the string so return false.
						if (charPosition === -1) return false;
					}
					// Increase the score based on string length.
					score = score + (itemName.length - charPosition);
					// Add the current score onto the current item to be used later when sorting.
					item.score = score;
					return true;
				});

				// Sort items by score.
				data.sort(function (current, next) {
					if (current.score > next.score) return 1;
					if (current.score < next.score) return -1;
					// If a is equal to be then return zero.
					return 0;
				});
			}

			// Iterate over all cached report suites and generate list item for each.
			for (var index = 0; index < data.length; index++) {
				var reportSuiteData = data[index];
				// Build list item.
				var $reportSuiteListItem = $('<li>')
					// Attach the report suite data item to the list element for later access.
					.data('reportSuiteData', reportSuiteData)
					.addClass('endor-List-item endor-List-item--interactive')
					.attr('data-rsid', reportSuiteData.value)
					.text(reportSuiteData.name)
					.appendTo(ui.$suiteList);
				
				$reportSuiteListItem.on('click', reportSuiteClick);
			}
			
			// If there are no cached report suite items then display "no report suites".
			if (data.length === 0) {
				$('<li>')
					.addClass('endor-List-item')
					.text(this.options.noReportSuitesLabel)
					.appendTo(ui.$suiteList);
			}

		}

	});

	// Static event constants.
	CUI.ReportSuiteSelector.EVENT_REPORT_SUITE_CHANGED = 'report-suite-changed';
	
	/*
	 * Coral jazz...
	 */
	CUI.Widget.registry.register('reportSuiteSelector', CUI.ReportSuiteSelector);

	if (CUI.options.dataAPI) {
		$(document).on("cui-contentloaded.data-api", function(e) {
			CUI.ReportSuiteSelector.init($("[data-init~=report-suite-selector]", e.target));
		});
	}
})(jQuery);

/* jshint devel:true */
/* global adobe */
/* global OM */
(function($){
	CUI.LanguageSelector = new Class({
		toString: 'LanguageSelector',
		extend: CUI.Widget,
		construct: function(options){
			this.$anchorLabel = $('.endor-currentLanguage');

			if (!options.languages){
				//If the languages array is null then assume that it was built server side and generate the array from the
				//DOM.
				this._buildLanguagesArrayFromDOM();
			} else {
				this._buildDOMFromLanguagesArray();
			}

			this._updateAnchorLabel(options.currentLocale);

			this._addListeners();
		},

		defaults: {
			languages: null,
			changeLocaleUrl: null,
			currentLocaleCode: 'en_US',
			currentLocale: "English"
		},

		_addListeners: function(){
			this.$element.on('click', '.coral-SelectList-item', function(event){
				var language = this._getLanguageObjectFromLocaleCode($(event.target).data('locale'));
				if (language){
					this.options.currentLocaleCode = language.localeCode;
					this.options.currentLocale = language.displayName;
					this._updateAnchorLabel(language.displayName);
					this._updateLocale(language.localeCode);
				}
				this.$element.data('popover').hide();
			}.bind(this));
		},

		_buildLanguagesArrayFromDOM: function(){
			var languages = [];
			this.$element.find('.coral-SelectList-item').each(function(){
				languages.push({
					displayName: $(this).text(),
					localeCode: $(this).data('locale')
				});
			});

			this.options.languages = languages;
		},

		_buildDOMFromLanguagesArray: function(){
			var list = this.$element.find('.coral-SelectList');
			list.empty();

			this.options.languages.forEach(function(language){
				list.append('<li class="coral-SelectList-item coral-SelectList-item--option" data-locale="' + language.localeCode + '">' + language.displayName + '</li>');
			});
		},

		_getLanguageObjectFromLocaleCode: function(locale){
			var languageObj = null;
			if (this.options.languages){
				this.options.languages.forEach(function(language){
					if (language.localeCode == locale){
						languageObj = language;
					}
				});
			}
			return languageObj;
		},

		_updateAnchorLabel: function(text){
			this.$anchorLabel.text(text);
		},

		_updateLocale: function(localeCode){
			location.href = this.options.changeLocaleUrl + '&change_locale=' + localeCode + location.hash;
		}
	});

	CUI.Widget.registry.register('languageSelector', CUI.LanguageSelector);

	if (CUI.options.dataAPI) {
		$(document).on("cui-contentloaded.data-api", function(e) {
			CUI.LanguageSelector.init($("[data-init~=language-selector]", e.target));
		});
	}
}(jQuery));
/* global OM */
/* global Event */
/* global adobe */
/* jshint devel:true */
(function($){
	window.adobe = window.adobe || {};

	//Run jQuery in noConflict mode so that it will work in traditional SiteCatalyst. 
	if (window.OM && OM.Config){
		$.noConflict();
	}

	//Set the boundary where two rails can be open at the same time. 
	CUI.Shell.COMPACT_WINDOW_WIDTH_BOUNDARY = 1300;

	//Add a click event listener for the beta feedback button. 
	$(document).on('click', '.js-beta-feedback-btn', function(){
		if ($("#beta_feedback_iframe").length === 0) {
			var betaFeedbackConfig = (window.OM && OM.Config) ? OM.Config.betaFeedbackConfig : adobe.analytics.betaFeedbackConfig;
			var p = "?",
				css,
				url = betaFeedbackConfig.betaFeedBackFormUrl,
				iframe;

			p += "&project=AN";
			p += "&environment=";

			for(var name in betaFeedbackConfig.betaFeedBackData)
			{
				if (betaFeedbackConfig.betaFeedBackData.hasOwnProperty(name))
				{
					p += name + ": " + betaFeedbackConfig.betaFeedBackData[name] + ", ";
				}
			}

			css = "width: 100%; height: 100%; background-color: transparent; border: none; padding: 0; margin: 0; position: absolute; top: 0; left: 0; z-index: 30000;";

			iframe = $("<iframe frameborder='0' src='" + url + encodeURI(p) + "' id='beta_feedback_iframe' style='" + css + "'/>");

			$("body").append(iframe);

			$(window).on("message", function messageHandler(e) {
				e = e.originalEvent;
				if (e.source == iframe[0].contentWindow) {
					var data = JSON.parse(e.data);
					switch (data.type) {
						case "closed":
							iframe.remove();
							$(window).off("message", messageHandler);
							break;
					}
				}
			});
		}
	});

	//Dispatch the jQuery event as a prototype event.
	$(document).on('report-suite-changed', function(e, data){
		if ( window.Prototype ) {
			Event.fire(window.document, 'jq:' + CUI.ReportSuiteSelector.EVENT_REPORT_SUITE_CHANGED, {
				rsid: data.rsid,
				changeSuiteAndReload: data.changeSuiteAndReload,
				initialSuite: e.initialSuite
			});
		}
	});

	//Close the more popup when you click on one of the items.
	$(document).on('click', '#more-popup .endor-List-item', function(){
		$('#more-popup').data('popover').hide();
	});

	adobe.manuallyBootstrapShell = function(){
		/**
		 * Initialize Shell directly and don't wait for the cui-contentloaded.data event.
		 */

		CUI.Page.init($('[data-manual-init~=page]'));
		CUI.ShellMac.init($('[data-manual-init~=shell-mac]'));
		CUI.Crumbs.init($('[data-manual-init~=crumbs]'));
		CUI.BreadcrumbBar.init($('[data-manual-init~=breadcrumb-bar]'));

		//Outer rail
		CUI.OuterRail.init($('[data-manual-init~=outer-rail]'));
		CUI.Brand.init($('[data-manual-init~=brand]'));
		CUI.NavigationView.init($('[data-manual-init~=navigation-view]'));

		//BlackBar and BlackBar components
		CUI.BlackBar.init($('[data-manual-init~=black-bar]'));
		CUI.OuterRailToggle.init($('[data-manual-init~=outer-rail-toggle]'));
		CUI.Badge.init($('[data-manual-init~=badge]'));
		CUI.UserProfile.init($('[data-manual-init~=user-profile]'));
		CUI.HelpPopover.init($('[data-manual-init~=help-popover]'));
		CUI.NotificationsPopover.init($('[data-manual-init~=notifications-popover]'));
		CUI.UserAccountPopover.init($('[data-manual-init~=user-account-popover]'));

		CUI.ActionBar.init($('[data-manual-init~=action-bar]'));
		CUI.InnerRail.init($('[data-manual-init~=inner-rail]'));
		CUI.InnerRailToggle.init($('[data-manual-init~=inner-rail-toggle]'));
		CUI.ReportSuiteSelector.init($('[data-manual-init~=report-suite-selector]'));
	};

	adobe.linkImsAccounts = function(){
		var imsLinkingURL = (window.OM && OM.Config) ? OM.Config.imsLinkingURL : adobe.analytics.imsLinkingURL;

		$.ajax ({ url: imsLinkingURL,
        success: function(response) {
            var jsonres = JSON.parse(response);
            if (jsonres.ims_userid && jsonres.ims_userid !== ""){
                $("#link-wizard-button").remove();
            }
        }
    });
	};

	//Add a click event listener for the link accounts button. 
	$(document).on('click', '.js-link-accounts-btn', function(){
		window.startWizard();
	});
}(jQuery));
