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
    isTouch: 'ontouchstart' in window,

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
        if (CUI.Widget.fromElement(Widget, $element) === undefined) {
          $element[CUI.util.decapitalize(Widget.toString())]();
        }
      }
    }
  };

}(jQuery, this));
(function ($, window, undefined) {

  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    toString: 'Modal',

    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A dialog that prevents interaction with page elements while displayed. Modal will use existing markup if it is present, or create markup if <code>options.element</code> has no children.

     <h2 class="line">Example</h2>
     <a href="#myModal" class="button" data-toggle="modal">Show Modal</a>
     <div id="myModal" class="modal">
     <div class="modal-header">
     <h2>A Sample Modal</h2>
     <button type="button" class="close" data-dismiss="modal">&times;</button>
     </div>
     <div class="modal-body">
     <p>Some sample content.</p>
     </div>
     <div class="modal-footer">
     <button data-dismiss="modal">Ok</button>
     </div>
     </div>
     @example


     <caption>The constructors below act on the expected HTML markup:</caption>
     &lt;div id=&quot;myModal&quot; class=&quot;modal&quot;&gt;
     &lt;div class=&quot;modal-header&quot;&gt;
     &lt;h2&gt;A Sample Modal&lt;/h2&gt;
     &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-body&quot;&gt;
     &lt;p&gt;Some sample content.&lt;/p&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-footer&quot;&gt;
     &lt;button data-dismiss=&quot;modal&quot;&gt;Ok&lt;/button&gt;
     &lt;/div&gt;
     &lt;/div&gt;


     @example

     <caption>Instantiate with Class</caption>
     var modal = new CUI.Modal({
              element: '#myModal',
              header: 'My Modal',
              content: '&lt;p&gt;Content here.&lt;/p&gt;',
              buttons: [{
                  label: 'Save',
                  className: 'primary',
                  click: function(evt) {
                      console.log('Modal: This would usually trigger a save...');
                      this.hide(); // could also use evt.dialog.hide();
                  }
              }]
          });
     *
     // Hide the modal, change the heading, then show it again
     modal.hide().set({ header: 'My Modal Again'}).show();
     *
     @example
     <caption>Instantiate with jQuery</caption>
     $('#myModal').modal({
              header: 'My Modal',
              content: '&lt;p&gt;Content here.&lt;/p&gt;',
              buttons: [{
                  label: 'Close',
                  click: 'hide', // Specifying 'hide' causes the dialog to close when clicked
              }]
          });
     *
     // jQuery style works as well
     $('#myModal').modal('hide');
     *
     // A reference to the element's modal instance is stored as data-modal
     var modal = $('#myModal').data('modal');
     modal.hide();
     *
     @example
     <caption>Data API: Instantiate and show modal</caption>
     <description>When using a <code class="prettify">&lt;button&gt;</code>, specify the jQuery selector for the element using <code>data-target</code>. Markup should exist already if no options are specified.</description>
     &lt;button data-target=&quot;#myModal&quot; data-toggle=&quot;modal&quot;&gt;Show Modal&lt;/button&gt;
     *
     @example
     <caption>Data API: Instantiate, set options, and show</caption>
     <description>When using an <code class="prettify">&lt;a&gt;</code>, specify the jQuery selector for the element using <code>href</code>. Markup is optional since options are specified as data attributes.</description>
     &lt;a
     href=&quot;#modal&quot;
     data-toggle=&quot;modal&quot;
     data-heading=&quot;Test Modal&quot;
     data-content=&quot;&amp;lt;p&amp;gt;Test content&amp;lt;/p&amp;gt;&quot;
     data-buttons=&#x27;[{ &quot;label&quot;: &quot;Close&quot;, &quot;click&quot;: &quot;close&quot; }]&#x27;
     &gt;Show Modal&lt;/a&gt;
     *
     @example
     <caption>Data API: Instantiate, load content asynchronously, and show</caption>
     <description>When loading content asynchronously, regardless of what tag is used, specify the jQuery selector for the element using <code>data-target</code> and the URL of the content to load with <code>href</code>.</description>
     &lt;button
     data-target="#myModal"
     data-toggle=&quot;modal&quot;
     href=&quot;content.html&quot;
     &gt;Show Modal&lt;/button&gt;

     @example
     <caption>Markup</caption>
     &lt;h2 class=&quot;line&quot;&gt;Example&lt;/h2&gt;
     &lt;a href=&quot;#myModal&quot; class=&quot;button&quot; data-toggle=&quot;modal&quot;&gt;Show Modal&lt;/a&gt;
     &lt;div id=&quot;myModal&quot; class=&quot;modal&quot;&gt;
     &lt;div class=&quot;modal-header&quot;&gt;
     &lt;h2&gt;A Sample Modal&lt;/h2&gt;
     &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-body&quot;&gt;
     &lt;p&gt;Some sample content.&lt;/p&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-footer&quot;&gt;
     &lt;button data-dismiss=&quot;modal&quot;&gt;Ok&lt;/button&gt;
     &lt;/div&gt;
     &lt;/div&gt;

     @example
     <caption>Markup with &lt;form&gt; tag</caption>
     <description>Modals can be created from the <code class="prettify">&lt;form&gt;</code> tag as well. Make sure to set <code class="prettify">type="button"</code> on buttons that should not perform a submit.</description>
     &lt;form id=&quot;myModal&quot; class=&quot;modal&quot; action="/users" method="post"&gt;
     &lt;div class=&quot;modal-header&quot;&gt;
     &lt;h2&gt;Create User&lt;/h2&gt;
     &lt;button type=&quot;button&quot; class=&quot;close&quot; data-dismiss=&quot;modal&quot;&gt;&amp;times;&lt;/button&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-body&quot;&gt;
     &lt;label for=&quot;name&quot;&gt;Name&lt;/label&gt;&lt;input id=&quot;name&quot; name=&quot;name&quot; type=&quot;text&quot;&gt;
     &lt;/div&gt;
     &lt;div class=&quot;modal-footer&quot;&gt;
     &lt;button type="button" data-dismiss=&quot;modal&quot;&gt;Cancel&lt;/button&gt;
     &lt;button type="submit"&gt;Submit&lt;/button&gt;
     &lt;/div&gt;
     &lt;/form&gt;


     @desc Creates a new modal dialog
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
        .fipo('tap', 'click', '[data-dismiss="modal"]', this.hide.bind(this));

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

      // center before showing
      this.center();

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
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A tabbed panel with several variants.

     * <p>Tabs markup must be initialized with CUI's data-init property.  However, keeping a reference to
     * a tabs instance ($.tabs or new CUI.Tabs) is not needed for basic functionality. This is only
     * needed if programmatic access is necessary.</p>
     *
     * <h2 class="line">Examples</h2>
     *
     * <section class="line">
     * <h3>Default</h3>
     * <div class="coral-TabPanel" data-init="tabs">
     *     <nav class="coral-TabPanel-navigation">
     *         <a class="coral-TabPanel-tab is-active" data-toggle="tab">Tab 1</a>
     *         <a class="coral-TabPanel-tab" data-toggle="tab">Tab 2</a>
     *         <a class="coral-TabPanel-tab" href="../examples/remote.html" data-toggle="tab">Tab 3</a>
     *         <a class="coral-TabPanel-tab is-disabled" data-toggle="tab">Disabled Tab</a>
     *     </nav>
     *     <div class="coral-TabPanel-content">
     *         <section class="coral-TabPanel-pane is-active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *         <section class="coral-TabPanel-pane">Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *         <section class="coral-TabPanel-pane">This will be replaced :)</section>
     *         <section class="coral-TabPanel-pane">This section will never be shown :(</section>
     *     </div>
     * </div>
     * </section>
     * <section>
     * <h3>Stacked</h3>
     * <div class="tabs stacked" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * <section>
     * <h3>Nav</h3>
     * <div class="tabs nav" data-init="tabs">
     *     <nav>
     *         <a data-toggle="tab" class="active">Tab 1</a>
     *         <a data-toggle="tab">Tab 2</a>
     *         <a data-toggle="tab" class="disabled">Disabled Tab</a>
     *     </nav>
     *     <section class="active">Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.</section>
     *     <section>Nulla gangsta. Brizzle shizzlin dizzle pharetra.</section>
     *     <section>This section will never be shown :(</section>
     * </div>
     * </section>
     * @example
     * <caption>Instantiate with Class</caption>
     * var tabs = new CUI.Tabs({
         *     element: '#myTabs'
         * });
     *
     * // Hide the tabs, set the active tab, and show it again
     * tabs.hide().set({active: 3}).show();
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myTabs').tabs({
         *     type: 'stacked'
         * });
     *
     * // jQuery style works as well for show/hide
     * $('#myTabs').tabs('show');
     *
     * // A reference to the element's tabs instance is stored as data-tabs
     * var tabs = $('#myTabs').data('tabs');
     * tabs.hide();
     *
     * @example
     * <caption>Data API: Instantiate, set options, and show</caption>
     * <description>There is no need to programatically  instantiate a tabs instance to use the tabs
     *  functionality. The data API will handle switching between tabs as long as you have created a
     * <code class="prettify">&lt;div&gt;</code> with the <code class="prettify">tabs</code> class and added
     * the <code class="prettify">data-init='tabs'</code> attribute.
     * When using markup to instantiate tabs, the overall container is
     * <code class="prettify">div class=&quot;tabs&quot</code>. The tabs themselves are specified within the
     * <code>nav</code> block as simple <code class="prettify">a</code> elements. The
     * <code class="prettify">data-toggle=&quot;tab&quot;</code> attribute on <code>a</code> nav links is
     * essential for the data API; do not omit. The <code>href</code> can be a remote link
     * (see next example). When the tab is activated, content from the remote link will
     * be loaded into the respective panel.</description>
     * &lt;div class=&quot;tabs&quot; data-init=&quot;tabs&quot;&gt;
     *     &lt;nav&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
     *         &lt;a href=&quot;../examples/remote.html&quot; data-toggle=&quot;tab&quot;&gt;Tab 3&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Tab&lt;/a&gt;
     *     &lt;/nav&gt;
     *     &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
     *     &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra.&lt;/section&gt;
     *     &lt;section&gt;This will be replaced :)&lt;/section&gt;
     *     &lt;section&gt;This section will never be shown :(&lt;/section&gt;
     * &lt;/div&gt;
     *
     * @example
     * <caption>Variants</caption>
     * <description>The possible variants, <code class="prettify">stacked</code>
     * and <code class="prettify">nav</code>, are specified either via the <code>type</code> argument to the
     * constructor, or via manually specifying the class alongside <code>tabs</code>.</description>
     * &lt;div class=&quot;tabs nav&quot; data-init=&quot;tabs&quot;&gt;
     *     &lt;nav&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;active&quot;&gt;Tab 1&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot;&gt;Tab 2&lt;/a&gt;
     *         &lt;a data-toggle=&quot;tab&quot; class=&quot;disabled&quot;&gt;Disabled Tab&lt;/a&gt;
     *     &lt;/nav&gt;
     *     &lt;section class=&quot;active&quot;&gt;Lorizzle ipsizzle fo shizzle mah nizzle fo rizzle.&lt;/section&gt;
     *     &lt;section&gt;Nulla gangsta. Brizzle shizzlin dizzle pharetra.&lt;/section&gt;
     *     &lt;section&gt;This section will never be shown :(&lt;/section&gt;
     * &lt;/div&gt;
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
      // find elements for tab widget
      this.tablist = this.$element.find('.coral-TabPanel-navigation');

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
        this.tablist.after($panel);
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
      return this.$element.find('.coral-TabPanel-pane');
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


        // gets all the class mappins
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

      this.$element.fipo('tap', 'click', sel,function (event) {
        var tab = $(event.currentTarget);

        // prevent the default anchor
        event.preventDefault();

        self._activateTab(tab);
      }).finger('click', sel, false);
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

(function ($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc An optionally closeable alert message.
     <style> div.alert {
          width: 400px;
      }
     </style>

     <div class="alert error">
     <button class="close" data-dismiss="alert">&times;</button>
     <strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>
     </div>

     @example

     <caption>The constructors below act on the expected HTML markup:</caption>

     &lt;div id=&quot;myAlert&quot;&gt;
     &lt;button class=&quot;close&quot; data-dismiss=&quot;alert&quot;&gt;&amp;times;&lt;/button&gt;
     &lt;strong&gt;ERROR&lt;/strong&gt;&lt;div&gt;Uh oh, something went wrong with the whozit!&lt;/div&gt;
     &lt;/div&gt;

     @example
     <caption>Instantiate with Class</caption>
     var alert = new CUI.Alert({
        element: '#myAlert',
        heading: 'ERROR',
        content: 'An error has occurred.',
        closeable: true
      });

     // Hide the alert, change the content, then show it again
     alert.hide().set({ content: 'Another error has occurred.'}).show();

     // jQuery style works as well
     $('#myAlert').alert('hide');

     @example
     <caption>Instantiate with jQuery</caption>
     $('#myAlert').alert({
        heading: 'ERROR',
        content: 'An error has occurred.',
        closeable: true
      });

     // Hide the alert, change the content, then show it again
     $('#myAlert').alert('hide').alert({ heading: 'Another error has occurred.'}).alert('show');

     // A reference to the element's alert instance is stored as data-alert
     var alert = $('#myAlert').data('alert');
     alert.hide();

     @example
     <caption>Data API: Hide alert</caption>
     <description>When an element within the alert has <code><span class="atn">data-dismiss</span>=<span class="atv">"alert"</span></code>, it will hide the alert.</description>
     &lt;a data-dismiss=&quot;alert&quot;&gt;Dismiss&lt;/a&gt;

     @example
     <caption>Markup</caption>
     &lt;div class=&quot;alert error&quot;&gt;
     &lt;button class=&quot;close&quot; data-dismiss=&quot;alert&quot;&gt;&amp;times;&lt;/button&gt;
     &lt;strong&gt;ERROR&lt;/strong&gt;&lt;div&gt;Uh oh, something went wrong with the whozit!&lt;/div&gt;
     &lt;/div&gt;

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
        $('body').fipo('tap.popover-hide-' + this.uuid, 'click.popover-hide-' + this.uuid, function (e) {
          var el = this.$element.get(0);

          if (e.target !== el && !$.contains(el, e.target)) {
            this.hide();
            $('body').off('.popover-hide-' + this.uuid);
          }
        }.bind(this));
      }
    },

    /** @ignore */
    _hide: function () {
      this.$element.hide().prop('aria-hidden', true);
      $('body').off('.popover-hide-' + this.uuid);
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
    $('body').fipo('tap.popover.data-api', 'click.popover.data-api', '[data-toggle="popover"]',function (e) {
      var $trigger = $(this),
        $target = CUI.util.getDataTarget($trigger);

      // if data target is not defined try to find the popover as a sibling
      $target = $target && $target.length > 0 ? $target : $trigger.next('.coral-Popover');

      var popover = $target.popover($.extend({pointAt: $trigger}, $target.data(), $trigger.data())).data('popover');

      popover.toggleVisibility();
    }).on('click.popover.data-api', '[data-toggle="popover"]', false);
  });
}(window.jQuery));

(function ($, window, undefined) {
  CUI.TagList = new Class(/** @lends CUI.TagList# */{
    toString: 'TagList',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc A tag list for input widgets. This widget is intended to be used by other widgets.
     *
     * <h2 class="line">Examples</h2>
     *
     * <ol class="taglist" data-init="taglist" data-fieldname="myrequestparam" style="margin: 2rem">
     *     <li>
     *         <button class="icon-close"></button>
     *         Carrot
     *         <input type="hidden" value="Carrot"/>
     *     </li>
     *     <li>
     *         <button class="icon-close"></button>
     *         Banana
     *         <input type="hidden" value="Banana"/>
     *     </li>
     *     <li>
     *         <button class="icon-close"></button>
     *         Apple
     *         <input type="hidden" value="Apple"/>
     *     </li>
     * </ol>
     *
     * @example
     * <caption>Data API: Instantiate, set options, and show</caption>
     *
     * &lt;ol class=&quot;taglist&quot; data-init=&quot;taglist&quot; data-fieldname=&quot;myrequestparam&quot;&gt;
     *     &lt;li&gt;
     *         &lt;button class=&quot;icon-close&quot;&gt;&lt;/button&gt;
     *         Carrot
     *         &lt;input type=&quot;hidden&quot; value=&quot;Carrot&quot;/&gt;
     *     &lt;/li&gt;
     *     &lt;li&gt;
     *         &lt;button class=&quot;icon-close&quot;&gt;&lt;/button&gt;
     *         Banana
     *         &lt;input type=&quot;hidden&quot; value=&quot;Banana&quot;/&gt;
     *     &lt;/li&gt;
     *     &lt;li&gt;
     *         &lt;button class=&quot;icon-close&quot;&gt;&lt;/button&gt;
     *         Apple
     *         &lt;input type=&quot;hidden&quot; value=&quot;Apple&quot;/&gt;
     *     &lt;/li&gt;
     * &lt;/ol&gt;
     *
     * @description Creates a new tag list
     * @constructs
     *
     * @param  {Object} options Component options
     * @param  {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param  {String} options.fieldname fieldname for the input fields
     * @param  {Array} options.values to set the taglist
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

      this.$element.fipo('tap', 'click', 'button', function (event) {
        var elem = $(event.currentTarget).parent().children('input');

        self.removeItem(elem.val());
      });

      // accessibility
      this._makeAccessible();
    },

    defaults: {
      fieldname: "",
      values: null,
      tag: 'li'
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
      var elem = this.$element.find('input[value="' + item + '"]');

      if (elem.length > 0) {
        elem.parent().remove();

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
      var display, val, elem, displayElem, btn;

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

      // add DOM element
      elem = $('<' + this.options.tag + '/>', {
        'role': 'listitem',
        'class': 'coral-TagList-tag'
      });

      btn = $('<button/>', {
        'class': 'coral-MinimalButton coral-TagList-tag-removeButton',
        'type': 'button',
        'title': 'Remove'
      }).appendTo(elem);

      $('<i/>', {
        'class': 'coral-Icon coral-Icon--sizeXS coral-Icon--close'
      }).appendTo(btn);

      displayElem = $('<span/>', {
        'class': 'coral-TagList-tag-label',
        'text': display
      }).appendTo(elem);

      $('<input/>', {
        'type': 'hidden',
        'value': val,
        'name': this.options.fieldname
      }).appendTo(elem);

      this.$element.append(elem);

      this.$element.trigger($.Event('itemadded'), {
        value: val,
        display: display
      });
    },

    /**
     * @param {String} item value to be deleted
     */
    removeItem: function (item) {
      var idx = this._existingValues.indexOf("" + item);

      if (idx > -1) {
        this._removeItem(item);
        this._existingValues.splice(idx, 1);
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

}(jQuery, this));

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
      position: 'center bottom-1'  // -1 to override the border
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

      this.$element.position({
        my: 'top',
        at: this.options.position,
        of: this.options.relatedElement
      });

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
        display = cur.text();

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
              !callback.call(this, $item.data('value'), $item.text());

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
      if (selectList.get('autohide')) {
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
  CUI.Select = new Class(/** @lends CUI.Select# */{
    toString: 'Select',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc a widget which is similar to the native &lt;select&gt;
     *
     * <h2 class="line">Examples</h2>
     *
     * <span class="select" data-init="select">
     *     <button type="button">Select</button>
     *     <select>
     *         <option value="1">One</option>
     *         <option value="2">Two</option>
     *         <option value="3">Three</option>
     *     </select>
     * </span>
     *
     * <span class="select" data-init="select">
     *     <button type="button">Select</button>
     *     <select multiple="true">
     *         <option value="1">One</option>
     *         <option value="2">Two</option>
     *         <option value="3">Three</option>
     *     </select>
     * </span>
     *
     * @example
     * <caption>Instantiate with Class</caption>
     * var selectlist = new CUI.Select({
         *     element: '#mySelect'
         * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#mySelect').select({
         *
         * });
     *
     * @example
     * <caption>Data API: Instantiate, set options</caption>
     *
     * &lt;span class=&quot;select&quot; data-init=&quot;select&quot;&gt;
     *     &lt;button type=&quot;button&quot;&gt;Select&lt;/button&gt;
     *     &lt;select&gt;
     *         &lt;option value=&quot;1&quot;&gt;One&lt;/option&gt;
     *         &lt;option value=&quot;2&quot;&gt;Two&lt;/option&gt;
     *         &lt;option value=&quot;3&quot;&gt;Three&lt;/option&gt;
     *     &lt;/select&gt;
     * &lt;/span&gt;
     *
     * @description Creates a new select
     * @constructs
     *
     * @param {Object} options Component options
     * @param {Mixed} options.element jQuery selector or DOM element to use for panel
     * @param {String} [options.type=static] static or dynamic list
     * @param {Boolean} [nativewidget=false] shows a native &lt;select&gt; instead of a SelectList widget
     * @param {Boolean} [nativewidgetonmobile=true] forces a native &lt;select&gt; on a mobile device if possible
     * @param {Boolean} [multiple=false] multiple selection, will automatically be detected form a given &lt;select&gt; source
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
        this.$element.addClass('native');

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
        this.$element.removeClass('native');
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

        self._buttonText.text(selectedElem.text);

        selected = selectedElem.value;
      }

      if (event) {
        this.$element.trigger($.Event('selected', {
          selected: selected
        }));
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
      if (this.options.multiple) {
        // if the element is not there, create it
        if (this._tagList.length === 0) {
          this._tagList = $('<ol/>', {
            'class': 'coral-TagList'
          }).appendTo(this.$element);
        }

        this._tagList.tagList(this.options.tagConfig || {});

        this._tagListWidget = this._tagList.data('tagList');
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
      if (event.selectedValue === true) {
        // work-around a bug in jQuery's val() function which is a NOP when the parameter is "true"
        this._select.find('option[value=true]').prop('selected', 'selected');
      } else {
        this._select.val(event.selectedValue);
      }

      if (this.options.multiple) {
        this._tagListWidget.addItem({
          value: event.selectedValue,
          display: event.displayedValue
        });

        selected = this._tagListWidget.getValues();
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

(function ($, window, undefined) {
  CUI.Slider = new Class(/** @lends CUI.Slider# */{
    toString: 'Slider',

    extend: CUI.Widget,

    /**
     * @extends CUI.Widget
     * @classdesc <p><span id="slider-label">A slider widget</span></p>
     *
     *
     * <div class="slider ticked filled tooltips" data-init="slider">
     *      <input aria-labelledby="slider-label" type="range" value="14" min="10" max="20" step="2">
     * </div>
     *
     * <p>
     * You should provide some information in the HTML markup, as this widget will read most of its options
     * directly from the HTML elements:
     * </p>
     *
     * <ul>
     *      <li>Current, min, max and step values are read from the input element</li>
     *      <li>The toggles for tooltips, ticks, vertical orientation and filled bars are set if the CSS classes tooltips, ticked, vertical or filled are present</li>
     *      <li>Use the attribute data-slide='true' to make handles slide smoothly. Use with care: This can make the slider unresponsive on some systems.</li>
     * </ul>
     * <p>
     * As an alternative you can also directly create an instance of this widget with the class constructor CUI.Slider() or with the jQUery plugin $.slider().
     * </p>
     *
     * @example
     * <caption>Simple horizontal slider</caption>
     * &lt;div class="slider" data-init="slider"&gt;
     *      &lt;label&gt;
     *          Horizontal Slider
     *          &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
     *      &lt;/label&gt;
     * &lt;/div&gt;
     *
     * @example
     * <caption>Full-featured slider with two handles, tooltips, ticks and a filled bar</caption>
     * &lt;div class="slider tooltips ticked filled" data-init="slider"&gt;
     *      &lt;fieldset&gt;
     *          &lt;legend&gt;Vertical Range Slider with Tooltips&lt;/legend&gt;
     *          &lt;label&gt; Minimum value
     *              &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
     *          &lt;/label&gt;
     *          &lt;label&gt; Maximum value
     *              &lt;input type="range" value="16" min="10" max="20" step="2"&gt;
     *          &lt;/label&gt;
     *     &lt;/fieldset&gt;
     * &lt;/div&gt;
     *
     * @example
     * <caption>Instantiate by jQuery plugin</caption>
     * $(".slider-markupless").slider({
     *      min: 0,
     *      max: 100,
     *      step: 5,
     *      value: 50,
     *      ticks: true,
     *      filled: true,
     *      orientation: "vertical",
     *      tooltips: true,
     *      slide: true
     * });
     *
     * @desc Creates a slider from a div
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
      var that = this,
        elementId = this.$element.attr('id'),
      // sliders with two inputs should be contained within a fieldset to provide a label for the grouping
        fieldset = this.$element.children('fieldset'),
        legend = fieldset.children('legend'),

        values = [];

      // reads the options from markup
      this._readOptions();

      // if the element doesn't have an id, build a unique id using new Date().getTime()
      if (!elementId) {
        elementId = CUI.util.getNextId();
        this.$element.attr('id', elementId);
      }

      this._renderMissingElements();

      // [~dantipa]
      // this block has to be optimized
      // taking the content of fieldset and appending it somewhere else causes flashing
      // future markup should be like the expected markup (breaking change)
      if (fieldset.length > 0) {
        // move all fieldset children other than the legend to be children of the element.
        this.$element.append(fieldset.contents(":not(legend)"));

        // create a new wrapper div with role="group" and class="sliderfieldset," which will behave as a fieldset but render as an inline block
        this._group = $('<div/>', {
          'role': 'group',
          'class': 'coral-Slider-fieldset '
        });

        // wrap the element with the new "coral-Slider-fieldset " div
        // @todo Why not use the existing div? This is slow, do something different here unless absolutely requried
        that.$element.wrap(this._group);

        if (legend.length > 0) {
          // create new label element and append the contents of the legend
          this._grouplegend = $('<label/>').append(legend.contents());

          // give the new label element all the same attributes as the legend
          $.each(legend.prop('attributes'), function () {
            that._grouplegend.attr(this.name, this.value);
          });

          // if the new label/legend has no id, assign one.
          if (!this._grouplegend.attr('id')) {
            this._grouplegend.attr('id', elementId + '-legend');
          }

          this._group.attr('aria-labelledby', this._grouplegend.attr('id'));

          // replace the original fieldset, which now only contains the original legend, with the new legend label element
          fieldset.replaceWith(this._grouplegend);

          // insert the new label/legend before the element
          legend = this._grouplegend.insertBefore(this.$element);
        }
      }

      // get all input value fields
      this.$inputs = this.$element.find('input');

      this.$inputs.each(function (index) {

        var $this = $(this),
          thisId = $this.attr('id');

        // if the input doesn't have an id, make one
        if (!thisId) {
          $this.attr('id', elementId + "-input" + index);
          thisId = $this.attr("id");
        }

        if (!$this.attr("aria-labelledby")) {
          $this.attr("aria-labelledby", "");
        }

        // existing labels that use the "for" attribute to identify the input
        var $label = that.$element.find('label[for="' + thisId + '"]');

        // if we have a legend, the input should first be labelled by the legend
        if (legend) {
          if ($this.attr("aria-labelledby").indexOf(legend.attr("id")) === -1) {
            $this.attr("aria-labelledby", legend.attr("id") + ($this.attr("aria-labelledby").length ? " " : "") + $this.attr("aria-labelledby"));
          }
        }

        // for existing labels that use the "for" attribute to identify the input
        if ($label.length > 0) {
          // the label is not the inputs parent, move it before the slider element tag
          $label.not($this.parent()).insertBefore(that.$element);
          $label.each(function (index) {
            // if the label doesn't have an id, create one
            if (!$(this).attr("id")) {
              $(this).attr("id", thisId + "-label" + index);
            }

            // explicity identify the input's label
            if ($this.attr("aria-labelledby").indexOf(thisId + "-label" + index) === -1) {
              $this.attr("aria-labelledby", ($this.attr("aria-labelledby").length ? " " : "") + thisId + "-label" + index);
            }

            if (!CUI.util.isTouch) {
              $(this).fipo("touchstart", "mousedown", function (event) {
                that.$handles.eq(index).focus();
              }.bind(this));
            }
          });
        }

        // if the input is contained by a label
        if ($this.parent().is("label")) {
          $label = $this.parent();

          // make sure it has an id
          if (!$label.attr("id")) {
            $label.attr("id", thisId + "-label");
          }

          // make sure it explicitly identifies the input it labels
          if (!$label.attr("for")) {
            $label.attr("for", thisId);
          }

          // move the input after the label
          $this.insertAfter($label);

          // if there is a legend, this is a two thumb slider; internal labels identify the minimum and maximum, and they should have the class="hidden-accessible"
          if (legend) {
            $label.addClass("coral-u-screenReaderOnly");
          }

          // move the label outside the slider element tag
          $label.insertBefore(that.$element);
        }

        // if the input has a label and it is not included in the aria-labelledby attribute, add the label id to the "aria-labelledby" attribute
        if ($label.length && $this.attr("aria-labelledby").indexOf($label.attr("id")) === -1) {
          $this.attr("aria-labelledby", $this.attr("aria-labelledby") + ($this.attr("aria-labelledby").length ? " " : "") + $label.attr("id"));
        }

        if ($label.length === 0 && $this.attr("aria-labelledby").length > 0) {
          $label = $("#" + $this.attr("aria-labelledby").split(" ")[0]);
        }

        if ($this.attr("aria-labelledby").length === 0) {
          $this.removeAttr("aria-labelledby");
        }

        // setting default step
        if (!$this.is("[step]")) $this.attr('step', that.options.step);

        // setting default min
        if (!$this.is("[min]")) $this.attr('min', that.options.min);

        // setting default max
        if (!$this.is("[max]")) $this.attr('max', that.options.max);

        // setting default value
        if (!$this.is("[value]")) {
          $this.attr({'value': that.options.value, 'aria-valuetext': that.options.valuetextFormatter(that.options.value)});
          values.push(that.options.value);
        } else {
          values.push($this.attr('value'));
        }

        if (index === 0) {
          if ($this.is(":disabled")) {
            that.options.disabled = true;
            that.$element.addClass("is-disabled");
          } else {
            if (that.options.disabled) {
              $this.attr("disabled", "disabled");
              that.$element.addClass("is-disabled");
            }
          }
        }

        if (CUI.util.isTouch) {
          // handle input value changes
          $this.on("change", function (event) {
            if (that.options.disabled) return;
            if ($this.val() === that.values[index]) return;
            that.setValue($this.val(), index);
          }.bind(this));

          // On mobile devices, the input receives focus; listen for focus and blur events, so that the parent style updates appropriately.
          $this.on("focus", function (event) {
            that._focus(event);
          }.bind(this));

          $this.on("blur", function (event) {
            that._blur(event);
          }.bind(this));
        } else {
          // on desktop, we don't want the input to receive focus
          $this.attr({"aria-hidden": true, "tabindex": -1, "hidden": "hidden"});

          if (index === 0) {
            if ($label) {
              $label.on("click", function (event) {
                if (that.options.disabled) return;
                that._clickLabel(event);
              }.bind(this));
            }

            if (legend) {
              legend.on("click", function (event) {
                if (that.options.disabled) return;
                that._clickLabel(event);
              }.bind(this));
            }
          }
        }
      });

      that.values = values;
      if (this.options.orientation === 'vertical') this.isVertical = true;

      // Set up event handling
      this.$element.fipo("touchstart", "mousedown", function (event) {
        this._mouseDown(event);
      }.bind(this));

      // Listen to changes to configuration
      this.$element.on('change:value', this._processValueChanged.bind(this));
      this.$element.on('change:disabled', this._processDisabledChanged.bind(this));
      this.$element.on('change:min', this._processMinMaxStepChanged.bind(this));
      this.$element.on('change:max', this._processMinMaxStepChanged.bind(this));
      this.$element.on('change:step', this._processMinMaxStepChanged.bind(this));

      // Adjust dom to our needs
      this._render();
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
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    draggingPosition: -1,

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

      if (this.$element.data("slide")) {
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
      if (!this.$element.find("input").length) {
        var that = this,
          el,
          values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
        $.each(values, function (index, value) {
          el = $("<input>");
          el.attr({
            "type": "range",
            "min": that.options.min,
            "max": that.options.max,
            "step": that.options.step,
            "value": value
          }).val(value);
          that.$element.append(el);
        });
      }

      if (!this.$element.find("div.coral-Slider-clickarea").length) {
        var el2 = $("<div class=\"coral-Slider-clickarea\">");
        this.$element.prepend(el2); // Prepend: Must be first element to not hide handles!
      }

      // @todo This is not a missing element, so it's odd to have this method called as such
      this.$element.toggleClass("coral-Slider", true);
      this.$element.toggleClass("coral-Slider--vertical", this.options.orientation === 'vertical');
      this.$element.toggleClass("coral-Slider--tooltips", this.options.tooltips); // Not used in CSS
      this.$element.toggleClass("coral-Slider--ticked", this.options.ticks); // Not used in CSS
      this.$element.toggleClass("coral-Slider--filled", this.options.filled); // Not used in CSS
    },

    _processValueChanged: function () {
      var that = this,
        values = ($.isArray(this.options.value)) ? this.options.value : [this.options.value];
      $.each(values, function (index, value) {
        that._updateValue(index, value, true); // Do not trigger change event on programmatic value update!
      });
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processMinMaxStepChanged: function () {
      var that = this;
      this.$element.find("input").attr("min", this.options.min);
      this.$element.find("input").attr("max", this.options.max);
      this.$element.find("input").attr("step", this.options.step);

      $.each(this.values, function (index, value) {
        that._updateValue(index, value, true); // Ensure current values are between min and max
      });

      if (this.options.ticks) {
        this.$element.find(".coral-Slider-ticks").remove();
        this._buildTicks();
      }

      if (this.options.filled) {
        this.$element.find(".coral-Slider-fill").remove();
        this._buildFill();
      }

      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
    },

    _processDisabledChanged: function () {
      if (this.options.disabled) {
        this.$inputs.attr("disabled", "disabled");
        this.$handles.each(function () {
          // @todo always chain class or cache selectors
          $(this).removeClass("is-focused");
          $(this).parent().removeClass("is-focused");
        });
        if (CUI.util.isTouch)
          this.$handles.attr("aria-disabled", true).removeAttr("tabindex");
      } else {
        this.$inputs.removeAttr("disabled");
        if (CUI.util.isTouch)
          this.$handles.removeAttr("aria-disabled").attr("tabindex", 0);
      }
      this.$element.toggleClass("is-disabled", this.options.disabled);
    },
    _render: function () {
      var that = this;

      // get maximum max value
      var maximums = that.$inputs.map(function () {
        return $(this).attr('max');
      });
      that.options.max = Math.max.apply(null, maximums.toArray());

      // get minimum min value
      var minimums = that.$inputs.map(function () {
        return $(this).attr('min');
      });
      that.options.min = Math.min.apply(null, minimums.toArray());

      // get minimum step value
      var steps = that.$inputs.map(function () {
        return $(this).attr('step');
      });
      that.options.step = Math.min.apply(null, steps.toArray());

      // Todo: do not add already existing elements or remove them before adding new elements
      // build ticks if needed
      if (that.options.ticks) {
        that._buildTicks();
      }

      // build fill if needed
      if (that.options.filled) {
        that._buildFill();
      }

      that._buildHandles();
    },

    _buildTicks: function () {
      // The ticks holder
      var $ticks = $("<div></div>").addClass('coral-Slider-ticks');
      this.$element.prepend($ticks);

      var numberOfTicks = Math.round((this.options.max - this.options.min) / this.options.step) - 1;
      var trackDimensions = this.isVertical ? this.$element.height() : this.$element.width();
      for (var i = 0; i < numberOfTicks; i++) {
        var position = (i + 1) * (trackDimensions / (numberOfTicks + 1));
        var percent = (position / trackDimensions) * 100;
        var tick = $("<div></div>").addClass('coral-Slider-tick').css((this.isVertical ? 'bottom' : 'left'), percent + "%");
        $ticks.append(tick);
      }
      this.$ticks = $ticks.find('.coral-Slider-tick');
      if (this.options.filled) {
        this._coverTicks();
      }
    },

    _buildFill: function () {
      var that = this;

      this.$fill = $("<div></div>").addClass('coral-Slider-fill');

      if (that.values.length !== 0) {
        var percent, fillPercent;
        if (that.values.length < 2) {
          percent = (that.values[0] - that.options.min) / (that.options.max - that.options.min) * 100;
          this.$fill.css((that.isVertical ? 'height' : 'width'), percent + "%");
        } else {
          percent = (this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;
          fillPercent = (this._getHighestValue() - this._getLowestValue()) / (that.options.max - that.options.min) * 100;
          this.$fill.css((that.isVertical ? 'height' : 'width'), fillPercent + "%")
            .css((that.isVertical ? 'bottom' : 'left'), percent + "%");
        }
      }
      this.$element.prepend(this.$fill);
      that.options.filled = true;
    },

    _buildHandles: function () {
      var that = this;

      // Wrap each input field and add handles and tooltips (if required)
      that.$inputs.each(function (index) {

        var wrap = $(this).wrap("<div></div>").parent().addClass("coral-Slider-value");

        // Add handle for input field
        var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
        var handle = $('<div></div>').addClass('coral-Slider-handle coral-u-openHand').css((that.isVertical ? 'bottom' : 'left'), percent + "%")
          .attr({
            "role": "slider",
            "id": $(this).attr("id") + "-handle",
            "aria-valuemin": that.options.min,
            "aria-valuemax": that.options.max,
            "aria-valuenow": that.values[index],
            "aria-valuetext": that.options.valuetextFormatter(that.values[index])
          });

        // position the input relative to the slider container element
        $(this).css((that.isVertical ? 'bottom' : 'left'), percent + "%");
        $(wrap).append(handle);

        // Add tooltip to handle if required
        if (that.options.tooltips) {
          // @todo replace with correct classnames for coral-Tooltip-arrow**
          var tooltip = $("<output>" + $(this).attr('value') + "</output>").addClass('coral-Tooltip coral-Tooltip--info').addClass(that.isVertical ? 'coral-Tooltip--positionRight' : 'coral-Tooltip--positionAbove')
            .attr({'id': $(this).attr("id") + "-tooltip", 'for': $(this).attr("id")});
          handle.append(tooltip);
        }

        if ($(this).attr("aria-labelledby")) {
          handle.attr("aria-labelledby", $(this).attr("aria-labelledby"));
        }

        if (that.$inputs.length > 1 && $(this).attr("aria-labelledby")) {
          var inputlabelids = $(this).attr("aria-labelledby").split(" "),
            label;
          for (var i = 0; i < inputlabelids.length; i++) {
            label = $("#" + inputlabelids[i]);
            if (i > 0) {
              label.removeAttr("for");
              handle.prepend(label);
            }
          }
        }

        if (CUI.util.isTouch) {
          handle.attr("aria-hidden", true);
          $(this).attr("tabindex", 0).removeAttr("aria-hidden").removeAttr("hidden");
        } else {
          handle.on("focus", function (event) {
            that._focus(event);
          }.bind(this));

          handle.on("blur", function (event) {
            that._blur(event);
          }.bind(this));

          handle.on("keydown", function (event) {
            that._keyDown(event);
          }.bind(this));

          handle.attr("tabindex", 0);
          $(this).attr({"aria-hidden": true, "tabindex": -1, "hidden": "hidden"});
        }

        if (that.options.disabled) {
          handle.attr("aria-disabled", true).removeAttr("tabindex");
        }
      });

      that.$handles = that.$element.find('.coral-Slider-handle');
      that.$tooltips = that.$element.find('.coral-Tooltip');
    },

    _handleClick: function (event) {
      if (this.options.disabled) return false;
      var that = this;

      // Mouse page position
      var mouseX = event.pageX;
      var mouseY = event.pageY;

      if (event.type === "touchstart") {
        var touches = (event.originalEvent.touches.length > 0) ? event.originalEvent.touches : event.originalEvent.changedTouches;
        mouseX = touches[0].pageX;
        mouseY = touches[0].pageY;
      }

      if (mouseX === undefined || mouseY === undefined) return; // Do not use undefined values!

      // Find the nearest handle
      var pos = that._findNearestHandle(mouseX, mouseY);

      var val = that._getValueFromCoord(mouseX, mouseY, true);

      if (!isNaN(val)) {
        that._updateValue(pos, val);
        that._moveHandles();
        if (that.options.filled) {
          that._updateFill();
        }
      }

      if (!CUI.util.isTouch) {
        if (event.type === "mousedown") {
          that.$handles.eq(pos).data("mousedown", true);
        }
        that.$handles.eq(pos).focus();
      }
    },

    _findNearestHandle: function (mouseX, mouseY) {
      var that = this;

      var closestDistance = 999999; // Incredible large start value

      // Find the nearest handle
      var pos = 0;
      that.$handles.each(function (index) {

        // Handle position
        var handleX = $(this).offset().left;
        var handleY = $(this).offset().top;

        // Handle Dimensions
        var handleWidth = $(this).width();
        var handleHeight = $(this).height();

        // Distance to handle
        var distance = Math.abs(mouseX - (handleX + (handleWidth / 2)));
        if (that.options.orientation === "vertical") {
          distance = Math.abs(mouseY - (handleY + (handleHeight / 2)));
        }

        if (distance < closestDistance) {
          closestDistance = distance;
          pos = index;
        }
      });

      return pos;
    },

    _focus: function (event) {
      if (this.options.disabled) return false;

      var $this = $(event.target);
      var $value = $this.closest(".coral-Slider-value");
      var $handle = $value.find(".coral-Slider-handle");

      if (!$handle.data("mousedown")) {
        this.$element.addClass("is-focused");
        $value.addClass("is-focused");
        $handle.addClass("is-focused");
      }
    },

    _blur: function (event) {
      if (this.options.disabled) return false;
      var $this = $(event.target);
      var $value = $this.closest(".coral-Slider-value");
      var $handle = $value.find(".coral-Slider-handle");
      this.$element.removeClass("is-focused");
      $value.removeClass("is-focused");
      $handle.removeClass("is-focused").removeData("mousedown");
    },

    _keyDown: function (event) {
      if (this.options.disabled) return;
      var that = this,
        $this = $(event.target),
        $input = $this.closest(".coral-Slider-value").find("input"),
        index = that.$inputs.index($input),
        val = Number($input.val()),
        step = Number(that.options.step),
        minimum = Number(that.options.min),
        maximum = Number(that.options.max),
        page = Math.max(step, Math.round((maximum - minimum) / 10));

      $this.removeData("mousedown");
      that._focus(event);

      switch (event.keyCode) {
        case 40:
        case 37:
          // down/left
          val -= step;
          event.preventDefault();
          break;
        case 38:
        case 39:
          // up/right
          val += step;
          event.preventDefault();
          break;
        case 33:
          // page up
          val += (page - (val % page));
          event.preventDefault();
          break;
        case 34:
          // page down
          val -= (page - (val % page === 0 ? 0 : page - val % page));
          event.preventDefault();
          break;
        case 35:
          // end
          val = maximum;
          event.preventDefault();
          break;
        case 36:
          // home
          val = minimum;
          event.preventDefault();
          break;
      }
      if (val !== Number($input.val())) {
        that.setValue(val, index);
        $input.change();
      }
    },

    _mouseDown: function (event) {
      if (this.options.disabled) return false;
      event.preventDefault();

      var that = this, $handle;

      this.draggingPosition = -1;
      this.$handles.each(function (index, handle) {
        if (handle === event.target) that.draggingPosition = index;
      }.bind(this));

      this.$tooltips.each(function (index, tooltip) {
        if (tooltip === event.target) that.draggingPosition = index;
      }.bind(this));

      // Did not touch any handle? Emulate click instead!
      if (this.draggingPosition < 0) {
        this._handleClick(event);
        return;
      }

      $handle = this.$handles.eq(this.draggingPosition);

      $handle.addClass("is-dragged");
      $("body").addClass("coral-u-closedHand");

      $(window).fipo("touchmove.slider", "mousemove.slider", this._handleDragging.bind(this));
      $(window).fipo("touchend.slider", "mouseup.slider", this._mouseUp.bind(this));

      if ($handle !== document.activeElement && !CUI.util.isTouch) {
        if (event.type === "mousedown") {
          $handle.data("mousedown", true);
        }
        $handle.focus();
      }
      //update();
    },

    _handleDragging: function (event) {
      var mouseX = event.pageX;
      var mouseY = event.pageY;

      // Handle touch events
      if (event.originalEvent.targetTouches) {
        var touch = event.originalEvent.targetTouches.item(0);
        mouseX = touch.pageX;
        mouseY = touch.pageY;
      }

      this._updateValue(this.draggingPosition, this._getValueFromCoord(mouseX, mouseY));
      this._moveHandles();
      if (this.options.filled) {
        this._updateFill();
      }
      event.preventDefault();
    },

    _mouseUp: function () {
      this.$handles.eq(this.draggingPosition).removeClass("is-dragged");
      $("body").removeClass("coral-u-closedHand");

      this.draggingPosition = -1;
      $(window).unbind("mousemove.slider touchmove.slider");
      $(window).unbind("mouseup.slider touchend.slider");
    },

    _clickLabel: function (event) {
      this.$handles.eq(0)[0].focus(); // @todo What if there are no handles? Impossible case?
    },

    _updateValue: function (pos, value, doNotTriggerChange) {
      var that = this;
      if (that.$inputs.eq(pos).attr("value") !== value.toString() || (that.values[pos] !== value.toString())) {
        if (value > this.options.max) value = this.options.max;
        if (value < this.options.min) value = this.options.min;

        if (pos === 0 || pos === 1) {
          if (that.$inputs.length === 2 && this.options.bound) {
            if (pos === 0) {
              value = Math.min(value, Number(that.$inputs.eq(1).val()));
              that.$inputs.eq(1).attr({"min": value});
              that.$inputs.eq(pos).attr({"max": that.$inputs.eq(1).val()});
              that.$handles.eq(1).attr({"aria-valuemin": value});
              that.$handles.eq(pos).attr({"aria-valuemax": that.$inputs.eq(1).val()});
            } else {
              value = Math.max(value, Number(that.$inputs.eq(0).val()));
              that.$inputs.eq(0).attr({"max": value});
              that.$inputs.eq(pos).attr({"min": that.$inputs.eq(0).val()});
              that.$handles.eq(0).attr({"aria-valuemax": value});
              that.$handles.eq(pos).attr({"aria-valuemin": that.$inputs.eq(0).val()});
            }
          }
          that.values[pos] = value.toString();
          that.$inputs.eq(pos).val(value).attr({"value": value, "aria-valuetext": that.options.valuetextFormatter(value)});
          that.$handles.eq(pos).attr({"aria-valuenow": value, "aria-valuetext": that.options.valuetextFormatter(value)});
          if (!doNotTriggerChange) {
            setTimeout(function () {
              that.$inputs.eq(pos).change(); // Keep input element value updated too and fire change event for any listeners
            }, 1); // Not immediatly, but after our own work here
          }
        }
      }
    },

    _moveHandles: function () {
      var that = this;

      // Set the handle position as a percentage based on the stored values
      this.$handles.each(function (index) {
        var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
        var $input = that.$inputs.eq(index);

        if (that.options.orientation === "vertical") {
          if (that.options.slide) {
            // @todo this is really awful UX, the handle never continues to animate if you're dragging up and moving around
            $(this).stop().animate({bottom: percent + "%"});
            $input.stop().animate({bottom: percent + "%"});
          } else {
            $(this).css("bottom", percent + "%");
            $input.css("bottom", percent + "%");
          }
        } else { // Horizontal
          if (that.options.slide) {
            // @todo this is really awful UX, the handle never continues to animate if you're dragging up and moving around
            $(this).stop().animate({left: percent + "%"});
            $input.stop().animate({left: percent + "%"});
          } else {
            $(this).css("left", percent + "%");
            $input.css("left", percent + "%");
          }
        }

        // Update tooltip value (if required)
        if (that.options.tooltips) {
          that.$tooltips.eq(index).html(that.options.tooltipFormatter(that.values[index]));
        }
      });
    },

    _updateFill: function () {
      var that = this;
      var percent;

      if (that.values.length !== 0) {
        if (that.values.length === 2) { // Double value/handle
          percent = ((that._getLowestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
          var secondPercent = ((that._getHighestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
          var percentDiff = secondPercent - percent;
          if (that.options.orientation === "vertical") {
            if (that.options.slide) {
              that.$fill.stop().animate({bottom: percent + "%", height: percentDiff + "%"});
            } else {
              that.$fill.css("bottom", percent + "%").css("height", percentDiff + "%");
            }
          } else { // Horizontal
            if (that.options.slide) {
              that.$fill.stop().animate({left: percent + "%", width: percentDiff + "%"});
            } else {
              that.$fill.css("left", percent + "%").css("width", percentDiff + "%");
            }
          }
        } else { // Single value/handle
          percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
          if (that.options.orientation === "vertical") {
            if (that.options.slide) {
              that.$fill.stop().animate({height: percent + "%"});
            } else {
              that.$fill.css("height", percent + "%");
            }
          } else {
            if (that.options.slide) {
              that.$fill.stop().animate({width: percent + "%"});
            } else {
              that.$fill.css("width", percent + "%");
            }
          }
        }
      }
      if (that.options.ticks) {
        that._coverTicks();
      }
    },

    _coverTicks: function () {
      var that = this;

      // Ticks covered by the fill are given a different class
      that.$ticks.each(function (index) {
        var value = that._getValueFromCoord($(this).offset().left, $(this).offset().top);
        if (that.values.length === 2) { // @todo Figure out what previous comitter said when they wrote "add a parameter to indicate multi values/handles" here
          if ((value > that._getLowestValue()) && (value < that._getHighestValue())) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
        else {
          if (value < that._getHighestValue()) {
            $(this).addClass('coral-Slider-tick--covered');
          }
          else {
            $(this).removeClass('coral-Slider-tick--covered');
          }
        }
      });
    },

    _getValueFromCoord: function (posX, posY, restrictBounds) {
      var that = this;
      var percent, snappedValue, remainder;
      var elementOffset = that.$element.offset();

      if (that.options.orientation === "vertical") {
        var elementHeight = that.$element.height();
        percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
      } else {
        var elementWidth = that.$element.width();
        percent = ((posX - elementOffset.left) / elementWidth);
      }

      // if the bounds are retricted, as with _handleClick, we souldn't change the value.
      if (restrictBounds && (percent < 0 || percent > 1)) return NaN;

      var rawValue = that.options.min * 1 + ((that.options.max - that.options.min) * percent);

      if (rawValue >= that.options.max) return that.options.max;
      if (rawValue <= that.options.min) return that.options.min;

      // Snap value to nearest step
      remainder = ((rawValue - that.options.min) % that.options.step);
      if (Math.abs(remainder) * 2 >= that.options.step) {
        snappedValue = (rawValue - remainder) + (that.options.step * 1); // *1 for IE bugfix: Interpretes expr. as string!
      } else {
        snappedValue = rawValue - remainder;
      }

      return snappedValue;
    },

    _getHighestValue: function () {
      return Math.max.apply(null, this.values);
    },

    _getLowestValue: function () {
      return Math.min.apply(null, this.values);
    }

    /*
    update: function() {
     // @todo Figure out what last committer meant when they wrote "Single update method" here
    }
    */
  });

  CUI.Widget.registry.register("slider", CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Slider.init($(".coral-Slider[data-init~='slider']", e.target));
    });
  }
}(jQuery, this));


(function ($) {
  CUI.LabeledSlider = new Class(/** @lends CUI.LabeledSlider# */{
    toString: 'LabeledSlider',
    extend: CUI.Slider,

    alternating: false,
    /**
     @extends CUI.Slider
     @classdesc <p><span id="slider-label">A slider widget with labeled ticks</span></p>

     <div class="slider ticked filled label-alternating" data-init="labeled-slider">
     <fieldset>
     <legend>Slider with alternating labels<br></legend>
     <label>Minimum <input type="range" value="14" min="10" max="22" step="2"></label>
     <label>Maximum <input type="range" value="16" min="10" max="22" step="2"></label>
     </fieldset>
     <ul class="tick-labels">
     <li>First label</li>
     <li>Second label</li>
     <li>Third label</li>
     <li>Fourth label</li>
     <li>Fifth label</li>
     </ul>
     </div>

     <p>
     The labeled slider uses the same options/markup as the slider label, but with one addition: You can provide a list of labels for the
     slider's ticks. (And of course use data-init="labeled-slider"!)
     </p>
     <p><em>Please note</em> that you have to list the labels for the ticks exactly in the order and count that you configured
     your slider's ticks. If your slider has 5 ticks, provide 5 labels for it. The number of ticks depends on the step / min / max values and
     can be calculated by ceil((max - min) / step) - 1.</p>

     @example
     <caption>Slider with labeled ticks</caption>
     &lt;div class="slider ticked filled" data-init="labeled-slider"&gt;
     &lt;fieldset&gt;
     &lt;legend&gt;Slider with alternating labels&lt;br&gt;&lt;/legend&gt;
     &lt;label&gt;Minimum &lt;input type="range" value="14" min="10" max="20" step="2"&gt;&lt;/label&gt;
     &lt;label&gt;Maximum &lt;input type="range" value="16" min="10" max="20" step="2"&gt;&lt;/label&gt;
     &lt;/fieldset&gt;
     &lt;ul class="tick-labels"&gt;
     &lt;li&gt;First label&lt;/li&gt;
     &lt;li&gt;Second label&lt;/li&gt;
     &lt;li&gt;Third label&lt;/li&gt;
     &lt;li&gt;Fourth label&lt;/li&gt;
     &lt;li&gt;Fifth label&lt;/li&gt;
     &lt;/ul&gt;
     &lt;/div&gt;

     @example
     <caption>Slider with labeled ticks that alternate in two lines (note the label-alternating class)</caption>
     &lt;div class="slider ticked filled label-alternating" data-init="labeled-slider"&gt;
     &lt;fieldset&gt;
     &lt;legend&gt;Slider with alternating labels&lt;br&gt;&lt;/legend&gt;
     &lt;label&gt;Minimum &lt;input type="range" value="14" min="10" max="20" step="2"&gt;&lt;/label&gt;
     &lt;label&gt;Maximum &lt;input type="range" value="16" min="10" max="20" step="2"&gt;&lt;/label&gt;
     &lt;/fieldset&gt;
     &lt;ul class="tick-labels"&gt;
     &lt;li&gt;First label&lt;/li&gt;
     &lt;li&gt;Second label&lt;/li&gt;
     &lt;li&gt;Third label&lt;/li&gt;
     &lt;li&gt;Fourth label&lt;/li&gt;
     &lt;li&gt;Fifth label&lt;/li&gt;
     &lt;/ul&gt;
     &lt;/div&gt;

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
     **/
    construct: function () {
      this.$element.addClass("coral-Slider--labeled");
    },

    _getTickLabel: function (index) {
      var el = this.$element.find("ul.coral-Slider-tickLabels li").eq(index);
      return el.html();
    },

    _buildTicks: function () {
      var that = this;

      // @todo This shouldn't be read from the className, it should be stored as an option
      if (this.$element.hasClass("coral-Slider--alternatingLabels")) this.alternating = true;

      // The ticks holder
      var $ticks = $("<div></div>").addClass('coral-Slider-ticks');
      this.$element.prepend($ticks);

      var numberOfTicks = Math.ceil((that.options.max - that.options.min) / that.options.step) - 1;
      var trackDimensions = that.isVertical ? that.$element.height() : that.$element.width();
      var maxSize = trackDimensions / (numberOfTicks + 1);

      if (this.alternating) maxSize *= 2;
      for (var i = 0; i < numberOfTicks; i++) {
        var position = trackDimensions * (i + 1) / (numberOfTicks + 1);
        var tick = $("<div></div>").addClass('coral-Slider-tick').css((that.isVertical ? 'bottom' : 'left'), position + "px");
        $ticks.append(tick);
        var className = "coral-Slider-tickLabel-" + i; // @todo Is this necessary?
        var ticklabel = $("<div></div>").addClass('coral-Slider-tickLabel ' + className);
        if (!that.isVertical) position -= maxSize / 2;
        ticklabel.css((that.isVertical ? 'bottom' : 'left'), position + "px");
        if (!that.isVertical) ticklabel.css('width', maxSize + "px");
        if (that.alternating && !that.isVertical && i % 2 === 1) {
          // @todo Are either of these styled anywhere?
          // @todo Can't we just rely on nth-child? It's supported in IE9
          ticklabel.addClass('coral-Slider-tickLabel--alternate');
          tick.addClass('coral-Slider-tick--alternate');
        }
        ticklabel.append(that._getTickLabel(i));
        $ticks.append(ticklabel);
      }
      that.$ticks = $ticks.find('.tick');
      if (that.options.filled) {
        that._coverTicks();
      }
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




(function ($) {

  // Instance id counter:
  var datepicker_guid = 0;

  CUI.Datepicker = new Class(/** @lends CUI.Datepicker# */{
    toString: 'Datepicker',
    extend: CUI.Widget,

    /**
     @extends CUI.Widget
     @classdesc A datepicker widget

     <p>
     <div class="CoralUI-DatePicker" data-init="datepicker">
     <input type="datetime" value="1987-04-06T20:35Z">
     <button><span class="icon-calendar small">Datetime picker</span></button>
     </div>
     </p>

     @example
     <caption>Instantiate by data API</caption>
     &lt;div class=&quot;datepicker&quot; data-init=&quot;datepicker&quot;&gt;
     &lt;input type=&quot;datetime&quot; value=&quot;1987-04-06T20:35Z&quot;&gt;
     &lt;button&gt;&lt;span class=&quot;icon-calendar small&quot;&gt;Datetime picker&lt;/span&gt;&lt;/button&gt;
     &lt;/div&gt;

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

     Additionally the type (date, time, datetime) is read from the &lt;input&gt; field.

     @example
     <caption>Instantiate with Class</caption>
     var datepicker = new CUI.Datepicker({
          element: '#myOrdinarySelectBox'
        });

     @example
     <caption>Instantiate by jQuery plugin</caption>
     $("div.datepicker").datepicker();


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
      if (element.hasClass("is-invalid")) {
        options.hasError = true;
      }
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
      $element.addClass("datepicker");

      if (!this.options.useNativeControls) {
        if ($element.find("input").not("[type=hidden]").length === 0) {
          $element.append(HTML_INPUT);
        }
        if ($element.find("button").length === 0) {
          $element.append(HTML_BUTTON);
        }
        var id = "popguid" + this.guid;
        var idQuery = "#" + id + ".coral-DatePicker-popover";
        this.$popover = $('body').find(idQuery);
        if (this.$popover.length === 0) {
          $('body').append(HTML_POPOVER.replace("%ID%", id));
          this.$popover = $('body').find(idQuery);
          if (this.options.isDateEnabled) {
            this.$popover.find(".coral-DatePicker-popoverContent").append(HTML_CALENDAR);
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

      // Force button to be a button, not a submit thing
      var $button = $element.find('>button');
      if ($button.length && $button.attr('type') === undefined) {
        $button.attr('type', 'button');
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
      var date = moment(value, format || this.options.displayedFormat);
      if (!date || !date.isValid()) {
        // Fallback: Try automatic guess if none of our formats match
        date = moment(value);
      }
      this.displayDateTime = this.options.selectedDateTime = date;
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
        this.$element.find("input,button").addClass("is-invalid");
      } else {
        this.$element.removeClass("is-invalid");
        this.$element.find("input,button").removeClass("is-invalid");
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
      var convertedInput = $input.detach().attr('type', 'text');
      this.$element.prepend(convertedInput);
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

      var newDate = moment(this.$input.val(), this.options.displayedFormat);
      if (newDate !== null && !isDateInRange(newDate, this.options.minDate, this.options.maxDate)) {
        this.options.hasError = true;
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
      var title = $('<div class="coral-DatePicker-calendarHeader"><h2>' + heading + '</h2></div>').
        append($("<button class=\"coral-MinimalButton coral-DatePicker-nextMonth\">›</button>")).
        append($("<button class=\"coral-MinimalButton coral-DatePicker-prevMonth\">‹</button>"));
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
        this.$element.find(".coral-DatePicker-popoverContent").append(html);
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


  /*  <button type="button" class="coral-Button coral-Button--square coral-Button--transparent" title="Datepicker">
  <i class="coral-Icon coral-Icon--calendar" ></i>
  </button>
    */

    HTML_INPUT = '<input type="text" class="Coral-Textfield">',
    HTML_BUTTON = '<button class="coral-MinimalButton coral-DatePicker-selectButton" type="button" title="Remove"><i class="coral-Icon coral-MinimalButton-icon coral-Icon--small coral-Icon--calendar"></i></button>',
    HTML_CALENDAR = [
      '<div class="coral-DatePicker-calendar">',
      '<div class="coral-DatePicker-calendarHeader"></div>',
      '<div class="coral-DatePicker-calendarBody"></div>',
      '</div>'
    ].join(''),
    HTML_POPOVER = [
      '<div class="coral-DatePicker-popover" style="display:none" id="%ID%">',
      '<div class="coral-DatePicker-popoverContent"></div>',
      '</div>'
    ].join(''),

    HTML_CLOCK_ICON = '<div class="coral-DatePicker-timeControls"><i class="coral-Icon coral-Icon--clock coral-Icon--small"></i></div>',
    HTML_HOUR_DROPDOWN = '<div class="coral-Select coral-DatePicker-hour"><button class="coral-Select-button"><span class="coral-Select-button-text"></span></button></div>',
    HTML_MINUTE_DROPDOWN = '<div class="coral-Select coral-DatePicker-minute"><button class="coral-Select-button"><span class="coral-Select-button-text"></span></button></div>',

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
        navStep = refNavStep.clone().text(step.data("stepTitle") || step.attr("title"));

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

     @example
     <caption>Instantiate FlexWizard with data API</caption>
     &lt;form class="flexwizard" data-init="flexwizard" action="test" method="post">
     &lt;div class="step" data-step-title="Step1">
     &lt;a class="flexwizard-control button" href="cancel.html" data-action="cancel">Cancel&lt;/a>
     &lt;button class="flexwizard-control" type="button" data-action="next">Next&lt;/button>

     &lt;h2>Simple Step&lt;/h2>
     &lt;p>Content.&lt;/p>
     &lt;/div>

     &lt;div class="step" title="Step2">
     &lt;button class="flexwizard-control" type="button" data-action="prev">Back&lt;/button>
     &lt;button class="flexwizard-control" type="button" data-action="next">Next&lt;/button>

     &lt;h2>Custom Nav Buttons&lt;/h2>
     &lt;p>Word on a future state of a page or site section without impacting the production state.&lt;/p>
     &lt;/div>
     &lt;/form>

     @example
     <caption>Instantiate Flexwizard with jQuery plugin</caption>
     $("#flexwizard").flexWizard();

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
     Removes the given step from the wizard.
     If the current step is removed, the resulting behaviour is undefined.

     @param {HTMLElement|jQuery} step The step to be removed
     */
    remove: function(step) {
      var wizard = this.$element;

      if (!step.jquery) {
          step = $(step);
      }

      var index = wizard.children(".js-coral-Wizard-step").index(step);
      wizard.find(".js-coral-Wizard-steplist-item").eq(index).remove();

      step.remove();
    }
  });

  CUI.Widget.registry.register("flexwizard", CUI.FlexWizard);

  CUI.util.plugClass(CUI.FlexWizard);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.FlexWizard.init($("[data-init~=flexwizard]", e.target));
    });
  }
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

     <p>
     <span class="fileupload button icon-upload" data-init="fileupload"><input type="file" data-placeholder="Select file(s)"></span>
     </p>

     @desc Creates a file upload field
     @constructs

     @param {Object}   options                                    Component options
     @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
     @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
     @param {String}   [options.uploadUrl=null]                   URL where to upload the file
     @param {String}   [options.uploadUrlBuilder=null]            Upload URL builder
     @param {boolean}  [options.disabled=false]                   Is this component disabled?
     @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
     @param {int}      [options.sizeLimit=null]                   File size limit
     @param {Array}    [options.mimeTypes=[]]                     Mime types allowed for uploading (proper mime types, wildcard "*" and file extensions are supported)
     @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
     @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
     @param {boolean}  [options.useHTML5=true]                    (Optional) Prefer HTML5 to upload files (if browser allows it)
     @param {boolean}  [options.dropZone=null]                    (Optional) Drop zone to upload files from file system directly (if browser allows it)
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
      this.inputElement = this.$element.find(".coral-FileUpload-input");

      // Read configuration from markup
      this._readDataFromMarkup();

      if (!CUI.util.HTTP.html5UploadSupported()) {
        this.options.useHTML5 = false;
      }

      this._createMissingElements();

      if (this.inputElement.attr("title")) {
        this.$inputContainer.prepend($("<label/>", {
          "for": self.options.name
        }).html(this.inputElement.attr("title")));
      }

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

              self._activateDropZone();
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

                  self._deactivateDropZone();
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

              self._deactivateDropZone();

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
        self.$element.prepend(self.inputElement);
      } else {
        self.inputElement.attr("multiple", multiple);
      }
    },

    /** @ignore */
    _activateDropZone: function () {
      if (this.$inputContainer.is(".coral-Button")) {
        this.$inputContainer.addClass("coral-Button--primary");
      }
      this.options.dropZone.addClass("is-active");
    },

    /** @ignore */
    _deactivateDropZone: function () {
      if (this.$inputContainer.is(".coral-Button")) {
        this.$inputContainer.removeClass("coral-Button--primary");
      }
      this.options.dropZone.removeClass("is-active");
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
        fileMimeType = CUI.FileUpload.MimeTypes.getMimeTypeFromFileName(fileName);
      }
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
          self.inputElement.prependTo(self.$element);
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
    ".3dm": "x-world/x-3dmf",
    ".3dmf": "x-world/x-3dmf",
    ".a": "application/octet-stream",
    ".aab": "application/x-authorware-bin",
    ".aam": "application/x-authorware-map",
    ".aas": "application/x-authorware-seg",
    ".abc": "text/vnd.abc",
    ".acgi": "text/html",
    ".afl": "video/animaflex",
    ".ai": "application/postscript",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".aim": "application/x-aim",
    ".aip": "text/x-audiosoft-intra",
    ".ani": "application/x-navi-animation",
    ".aos": "application/x-nokia-9000-communicator-add-on-software",
    ".aps": "application/mime",
    ".arc": "application/octet-stream",
    ".arj": "application/octet-stream",
    ".art": "image/x-jg",
    ".asf": "video/x-ms-asf",
    ".asm": "text/x-asm",
    ".asp": "text/asp",
    ".asx": "video/x-ms-asf-plugin",
    ".au": "audio/x-au",
    ".avi": "video/x-msvideo",
    ".avs": "video/avs-video",
    ".bcpio": "application/x-bcpio",
    ".bin": "application/x-macbinary",
    ".bm": "image/bmp",
    ".bmp": "image/x-windows-bmp",
    ".boo": "application/book",
    ".book": "application/book",
    ".boz": "application/x-bzip2",
    ".bsh": "application/x-bsh",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".c": "text/x-c",
    ".c++": "text/plain",
    ".cat": "application/vnd.ms-pki.seccat",
    ".cc": "text/x-c",
    ".ccad": "application/clariscad",
    ".cco": "application/x-cocoa",
    ".cdf": "application/x-netcdf",
    ".cer": "application/x-x509-ca-cert",
    ".cha": "application/x-chat",
    ".chat": "application/x-chat",
    ".class": "application/x-java-class",
    ".com": "text/plain",
    ".conf": "text/plain",
    ".cpio": "application/x-cpio",
    ".cpp": "text/x-c",
    ".cpt": "application/x-cpt",
    ".crl": "application/pkix-crl",
    ".crt": "application/x-x509-user-cert",
    ".csh": "text/x-script.csh",
    ".css": "text/css",
    ".cxx": "text/plain",
    ".dcr": "application/x-director",
    ".deepv": "application/x-deepv",
    ".def": "text/plain",
    ".der": "application/x-x509-ca-cert",
    ".dif": "video/x-dv",
    ".dir": "application/x-director",
    ".dl": "video/x-dl",
    ".doc": "application/msword",
    ".dot": "application/msword",
    ".dp": "application/commonground",
    ".drw": "application/drafting",
    ".dump": "application/octet-stream",
    ".dv": "video/x-dv",
    ".dvi": "application/x-dvi",
    ".dwf": "model/vnd.dwf",
    ".dwg": "image/x-dwg",
    ".dxf": "image/x-dwg",
    ".dxr": "application/x-director",
    ".el": "text/x-script.elisp",
    ".elc": "application/x-elc",
    ".env": "application/x-envoy",
    ".eps": "application/postscript",
    ".es": "application/x-esrehber",
    ".etx": "text/x-setext",
    ".evy": "application/x-envoy",
    ".exe": "application/octet-stream",
    ".f": "text/x-fortran",
    ".f77": "text/x-fortran",
    ".f90": "text/x-fortran",
    ".fdf": "application/vnd.fdf",
    ".fif": "image/fif",
    ".fli": "video/x-fli",
    ".flo": "image/florian",
    ".flx": "text/vnd.fmi.flexstor",
    ".fmf": "video/x-atomic3d-feature",
    ".for": "text/x-fortran",
    ".fpx": "image/vnd.net-fpx",
    ".frl": "application/freeloader",
    ".funk": "audio/make",
    ".g": "text/plain",
    ".g3": "image/g3fax",
    ".gif": "image/gif",
    ".gl": "video/x-gl",
    ".gsd": "audio/x-gsm",
    ".gsm": "audio/x-gsm",
    ".gsp": "application/x-gsp",
    ".gss": "application/x-gss",
    ".gtar": "application/x-gtar",
    ".gz": "application/x-gzip",
    ".gzip": "multipart/x-gzip",
    ".h": "text/x-h",
    ".hdf": "application/x-hdf",
    ".help": "application/x-helpfile",
    ".hgl": "application/vnd.hp-hpgl",
    ".hh": "text/x-h",
    ".hlb": "text/x-script",
    ".hlp": "application/x-winhelp",
    ".hpg": "application/vnd.hp-hpgl",
    ".hpgl": "application/vnd.hp-hpgl",
    ".hqx": "application/x-mac-binhex40",
    ".hta": "application/hta",
    ".htc": "text/x-component",
    ".htm": "text/html",
    ".html": "text/html",
    ".htmls": "text/html",
    ".htt": "text/webviewhtml",
    ".htx": "text/html",
    ".ice": "x-conference/x-cooltalk",
    ".ico": "image/x-icon",
    ".idc": "text/plain",
    ".ief": "image/ief",
    ".iefs": "image/ief",
    ".iges": "model/iges",
    ".igs": "model/iges",
    ".ima": "application/x-ima",
    ".imap": "application/x-httpd-imap",
    ".inf": "application/inf",
    ".ins": "application/x-internett-signup",
    ".ip": "application/x-ip2",
    ".isu": "video/x-isvideo",
    ".it": "audio/it",
    ".iv": "application/x-inventor",
    ".ivr": "i-world/i-vrml",
    ".ivy": "application/x-livescreen",
    ".jam": "audio/x-jam",
    ".jav": "text/x-java-source",
    ".java": "text/x-java-source",
    ".jcm": "application/x-java-commerce",
    ".jfif": "image/pjpeg",
    ".jfif-tbnl": "image/jpeg",
    ".jpe": "image/pjpeg",
    ".jpeg": "image/pjpeg",
    ".jpg": "image/pjpeg",
    ".jps": "image/x-jps",
    ".js": "application/x-javascript",
    ".jut": "image/jutvision",
    ".kar": "music/x-karaoke",
    ".ksh": "text/x-script.ksh",
    ".la": "audio/x-nspaudio",
    ".lam": "audio/x-liveaudio",
    ".latex": "application/x-latex",
    ".lha": "application/x-lha",
    ".lhx": "application/octet-stream",
    ".list": "text/plain",
    ".lma": "audio/x-nspaudio",
    ".log": "text/plain",
    ".lsp": "text/x-script.lisp",
    ".lst": "text/plain",
    ".lsx": "text/x-la-asf",
    ".ltx": "application/x-latex",
    ".lzh": "application/x-lzh",
    ".lzx": "application/x-lzx",
    ".m": "text/x-m",
    ".m1v": "video/mpeg",
    ".m2a": "audio/mpeg",
    ".m2v": "video/mpeg",
    ".m3u": "audio/x-mpequrl",
    ".man": "application/x-troff-man",
    ".map": "application/x-navimap",
    ".mar": "text/plain",
    ".mbd": "application/mbedlet",
    ".mc$": "application/x-magic-cap-package-1.0",
    ".mcd": "application/x-mathcad",
    ".mcf": "text/mcf",
    ".mcp": "application/netmc",
    ".me": "application/x-troff-me",
    ".mht": "message/rfc822",
    ".mhtml": "message/rfc822",
    ".mid": "x-music/x-midi",
    ".midi": "x-music/x-midi",
    ".mif": "application/x-mif",
    ".mime": "www/mime",
    ".mjf": "audio/x-vnd.audioexplosion.mjuicemediafile",
    ".mjpg": "video/x-motion-jpeg",
    ".mm": "application/x-meme",
    ".mme": "application/base64",
    ".mod": "audio/x-mod",
    ".moov": "video/quicktime",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "video/x-mpeq2a",
    ".mp3": "video/x-mpeg",
    ".mpa": "video/mpeg",
    ".mpc": "application/x-project",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpga": "audio/mpeg",
    ".mpp": "application/vnd.ms-project",
    ".mpt": "application/x-project",
    ".mpv": "application/x-project",
    ".mpx": "application/x-project",
    ".mrc": "application/marc",
    ".ms": "application/x-troff-ms",
    ".mv": "video/x-sgi-movie",
    ".my": "audio/make",
    ".mzz": "application/x-vnd.audioexplosion.mzz",
    ".nap": "image/naplps",
    ".naplps": "image/naplps",
    ".nc": "application/x-netcdf",
    ".ncm": "application/vnd.nokia.configuration-message",
    ".nif": "image/x-niff",
    ".niff": "image/x-niff",
    ".nix": "application/x-mix-transfer",
    ".nsc": "application/x-conference",
    ".nvd": "application/x-navidoc",
    ".o": "application/octet-stream",
    ".oda": "application/oda",
    ".omc": "application/x-omc",
    ".omcd": "application/x-omcdatamaker",
    ".omcr": "application/x-omcregerator",
    ".p": "text/x-pascal",
    ".p10": "application/x-pkcs10",
    ".p12": "application/x-pkcs12",
    ".p7a": "application/x-pkcs7-signature",
    ".p7c": "application/x-pkcs7-mime",
    ".p7m": "application/x-pkcs7-mime",
    ".p7r": "application/x-pkcs7-certreqresp",
    ".p7s": "application/pkcs7-signature",
    ".part": "application/pro_eng",
    ".pas": "text/pascal",
    ".pbm": "image/x-portable-bitmap",
    ".pcl": "application/x-pcl",
    ".pct": "image/x-pict",
    ".pcx": "image/x-pcx",
    ".pdb": "chemical/x-pdb",
    ".pdf": "application/pdf",
    ".pfunk": "audio/make.my.funk",
    ".pgm": "image/x-portable-greymap",
    ".pic": "image/pict",
    ".pict": "image/pict",
    ".pkg": "application/x-newton-compatible-pkg",
    ".pko": "application/vnd.ms-pki.pko",
    ".pl": "text/x-script.perl",
    ".plx": "application/x-pixclscript",
    ".pm": "text/x-script.perl-module",
    ".pm4": "application/x-pagemaker",
    ".pm5": "application/x-pagemaker",
    ".png": "image/png",
    ".pnm": "image/x-portable-anymap",
    ".pot": "application/vnd.ms-powerpoint",
    ".pov": "model/x-pov",
    ".ppa": "application/vnd.ms-powerpoint",
    ".ppm": "image/x-portable-pixmap",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppt": "application/x-mspowerpoint",
    ".ppz": "application/mspowerpoint",
    ".pre": "application/x-freelance",
    ".prt": "application/pro_eng",
    ".ps": "application/postscript",
    ".psd": "application/octet-stream",
    ".pvu": "paleovu/x-pv",
    ".pwz": "application/vnd.ms-powerpoint",
    ".py": "text/x-script.phyton",
    ".pyc": "applicaiton/x-bytecode.python",
    ".qcp": "audio/vnd.qcelp",
    ".qd3": "x-world/x-3dmf",
    ".qd3d": "x-world/x-3dmf",
    ".qif": "image/x-quicktime",
    ".qt": "video/quicktime",
    ".qtc": "video/x-qtc",
    ".qti": "image/x-quicktime",
    ".qtif": "image/x-quicktime",
    ".ra": "audio/x-realaudio",
    ".ram": "audio/x-pn-realaudio",
    ".ras": "image/x-cmu-raster",
    ".rast": "image/cmu-raster",
    ".rexx": "text/x-script.rexx",
    ".rf": "image/vnd.rn-realflash",
    ".rgb": "image/x-rgb",
    ".rm": "audio/x-pn-realaudio",
    ".rmi": "audio/mid",
    ".rmm": "audio/x-pn-realaudio",
    ".rmp": "audio/x-pn-realaudio-plugin",
    ".rng": "application/vnd.nokia.ringing-tone",
    ".rnx": "application/vnd.rn-realplayer",
    ".roff": "application/x-troff",
    ".rp": "image/vnd.rn-realpix",
    ".rpm": "audio/x-pn-realaudio-plugin",
    ".rt": "text/vnd.rn-realtext",
    ".rtf": "text/richtext",
    ".rtx": "text/richtext",
    ".rv": "video/vnd.rn-realvideo",
    ".s": "text/x-asm",
    ".s3m": "audio/s3m",
    ".saveme": "application/octet-stream",
    ".sbk": "application/x-tbook",
    ".scm": "video/x-scm",
    ".sdml": "text/plain",
    ".sdp": "application/x-sdp",
    ".sdr": "application/sounder",
    ".sea": "application/x-sea",
    ".set": "application/set",
    ".sgm": "text/x-sgml",
    ".sgml": "text/x-sgml",
    ".sh": "text/x-script.sh",
    ".shar": "application/x-shar",
    ".shtml": "text/x-server-parsed-html",
    ".sid": "audio/x-psid",
    ".sit": "application/x-stuffit",
    ".skd": "application/x-koan",
    ".skm": "application/x-koan",
    ".skp": "application/x-koan",
    ".skt": "application/x-koan",
    ".sl": "application/x-seelogo",
    ".smi": "application/smil",
    ".smil": "application/smil",
    ".snd": "audio/x-adpcm",
    ".sol": "application/solids",
    ".spc": "text/x-speech",
    ".spl": "application/futuresplash",
    ".spr": "application/x-sprite",
    ".sprite": "application/x-sprite",
    ".src": "application/x-wais-source",
    ".ssi": "text/x-server-parsed-html",
    ".ssm": "application/streamingmedia",
    ".sst": "application/vnd.ms-pki.certstore",
    ".step": "application/step",
    ".stl": "application/x-navistyle",
    ".stp": "application/step",
    ".sv4cpio": "application/x-sv4cpio",
    ".sv4crc": "application/x-sv4crc",
    ".svf": "image/x-dwg",
    ".svr": "x-world/x-svr",
    ".swf": "application/x-shockwave-flash",
    ".t": "application/x-troff",
    ".talk": "text/x-speech",
    ".tar": "application/x-tar",
    ".tbk": "application/x-tbook",
    ".tcl": "text/x-script.tcl",
    ".tcsh": "text/x-script.tcsh",
    ".tex": "application/x-tex",
    ".texi": "application/x-texinfo",
    ".texinfo": "application/x-texinfo",
    ".text": "text/plain",
    ".tgz": "application/x-compressed",
    ".tif": "image/x-tiff",
    ".tiff": "image/x-tiff",
    ".tr": "application/x-troff",
    ".tsi": "audio/tsp-audio",
    ".tsp": "audio/tsplayer",
    ".tsv": "text/tab-separated-values",
    ".turbot": "image/florian",
    ".txt": "text/plain",
    ".uil": "text/x-uil",
    ".uni": "text/uri-list",
    ".unis": "text/uri-list",
    ".unv": "application/i-deas",
    ".uri": "text/uri-list",
    ".uris": "text/uri-list",
    ".ustar": "multipart/x-ustar",
    ".uu": "text/x-uuencode",
    ".uue": "text/x-uuencode",
    ".vcd": "application/x-cdlink",
    ".vcs": "text/x-vcalendar",
    ".vda": "application/vda",
    ".vdo": "video/vdo",
    ".vew": "application/groupwise",
    ".viv": "video/vnd.vivo",
    ".vivo": "video/vnd.vivo",
    ".vmd": "application/vocaltec-media-desc",
    ".vmf": "application/vocaltec-media-file",
    ".voc": "audio/x-voc",
    ".vos": "video/vosaic",
    ".vox": "audio/voxware",
    ".vqe": "audio/x-twinvq-plugin",
    ".vqf": "audio/x-twinvq",
    ".vql": "audio/x-twinvq-plugin",
    ".vrml": "x-world/x-vrml",
    ".vrt": "x-world/x-vrt",
    ".vsd": "application/x-visio",
    ".vst": "application/x-visio",
    ".vsw": "application/x-visio",
    ".w60": "application/wordperfect6.0",
    ".w61": "application/wordperfect6.1",
    ".w6w": "application/msword",
    ".wav": "audio/x-wav",
    ".wb1": "application/x-qpro",
    ".wbmp": "image/vnd.wap.wbmp",
    ".web": "application/vnd.xara",
    ".wiz": "application/msword",
    ".wk1": "application/x-123",
    ".wmf": "windows/metafile",
    ".wml": "text/vnd.wap.wml",
    ".wmlc": "application/vnd.wap.wmlc",
    ".wmls": "text/vnd.wap.wmlscript",
    ".wmlsc": "application/vnd.wap.wmlscriptc",
    ".word": "application/msword",
    ".wp": "application/wordperfect",
    ".wp5": "application/wordperfect6.0",
    ".wp6": "application/wordperfect",
    ".wpd": "application/x-wpwin",
    ".wq1": "application/x-lotus",
    ".wri": "application/x-wri",
    ".wrl": "x-world/x-vrml",
    ".wrz": "x-world/x-vrml",
    ".wsc": "text/scriplet",
    ".wsrc": "application/x-wais-source",
    ".wtk": "application/x-wintalk",
    ".xbm": "image/xbm",
    ".xdr": "video/x-amt-demorun",
    ".xgz": "xgl/drawing",
    ".xif": "image/vnd.xiff",
    ".xl": "application/excel",
    ".xla": "application/x-msexcel",
    ".xlb": "application/x-excel",
    ".xlc": "application/x-excel",
    ".xld": "application/x-excel",
    ".xlk": "application/x-excel",
    ".xll": "application/x-excel",
    ".xlm": "application/x-excel",
    ".xls": "application/x-msexcel",
    ".xlt": "application/x-excel",
    ".xlv": "application/x-excel",
    ".xlw": "application/x-msexcel",
    ".xm": "audio/xm",
    ".xml": "text/xml",
    ".xmz": "xgl/movie",
    ".xpix": "application/x-vnd.ls-xpix",
    ".xpm": "image/xpm",
    ".x-png": "image/png",
    ".xsr": "video/x-amt-showrun",
    ".xwd": "image/x-xwindowdump",
    ".xyz": "chemical/x-pdb",
    ".z": "application/x-compressed",
    ".zip": "multipart/x-zip",
    ".zoo": "application/octet-stream",
    ".zsh": "text/x-script.zsh"
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
  CUI.Tooltip = new Class(/** @lends CUI.Tooltip# */{
    toString: 'Tooltip',

    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc <p>A tooltip that can be attached to any other element and may be displayed immediately, on mouse over or only on API call.</p>
     <p>Please always have in mind that there are two elements to deal with: The tooltip HTML element itself, and a "target" element.
     The tooltip is bound to this "target" element. Only on mouseover (or touch) of the "target" element the tooltip is shown (in interactive mode).</p>
     <h3>Quicktip</h3>
     <p>There is also a special "quicktip" mode that gives you a quick way to define tooltips on any element: This element will turn into the target element
     of a newly and dynamically created tooltip (see example below). This "quicktip" even works for dynamically inserted elements.</p>
     <p>
     <button data-init="quicktip" data-quicktip-content="Maybe an error?">Quicktip</button>
     </p>
     @example
     <caption>Instantiate by data API</caption>
     &lt;button id="my-button"&gt;My Button&lt;/button&gt;
     &lt;span class="coral-Tooltip coral-Tooltip--positionLeft" data-interactive="true" data-init="tooltip" data-target="#my-button"&gt;Tooltip content&lt;/span&gt;

     Currently there are the following data options:
     data-init="tooltip"         Inits the tooltip widget after page load
     data-interactive            Set to "true" for interactive show/hide on mouseover/touch.
     data-target                 Give an CSS-Selector for defining the target element this tooltips targets at.
     coral-Tooltip-position* CSS classes One of coral-Tooltip--positionLeft, coral-Tooltip--positionRight, coral-Tooltip--positionBelow, coral-Tooltip--positionAbove to define the position of the tooltip
     type CSS classes            One of coral-Tooltip--success, coral-Tooltip--error , coral-Tooltip--info, coral-Tooltip--notice, coral-Tooltip--inspect to define the type of the tooltip

     @example
     <caption>Instantiate by special "quicktip" data option</caption>
     <description>The "quicktip" options are a quick and convenient way of defining tooltips for your elements, even if they are dynamically injected into your page.</description>
     &lt;button id="dynamic-button" data-init="quicktip" data-quicktip-content="This is a quicktip" data-quicktip-type="success" data-quicktip-arrow="bottom"&gt;
     Dynamic quicktip creation
     &lt;/button&gt;

     The quicktip data options are applied to the target element of the tooltip (see above for the behaviour of "target" elements). These are the options:
     data-init="quicktip"          Creates a new tooltip on mouseover/touch (="quicktip").
     data-quicktip-content         Defines a content for the dynamic tooltip. If this is not given, the html() of the element itself is used.
     data-quicktip-arrow           Defines the direction of the arrow of the new tooltip (and therefore the position). One of left, right, top or bottom.
     data-quicktip-type            One of "info", "success", "error", "notice", "inspect"

     @example
     <caption>Instantiate by Class</caption>
     &lt;button id="dynamic-button"&gt;Dynamic tooltip creation&lt;/button&gt;
     &lt;script type="text/javascript"&gt;
     new CUI.Tooltip({target: "#dynamic-button",
                           content: "Dynamic tooltip",
                           interactive: true});
     // Note: No need for a "element" option here, just define the targeted element
     &lt;/script&gt;


     @desc Creates a new tooltip
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
      
      this.$element.toggleClass("hidden", !this.options.visible);

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
      if (this.$element.hasClass("hidden")) {
        this.$element.removeClass('hidden');
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
      var el = $(this);
      var tooltip = el.data("tooltip");

      if (!tooltip) {
        new CUI.Tooltip({
          target: el,
          content: el.data("quicktip-content") || el.html(),
          type: el.data("quicktip-type"),
          arrow: el.data("quicktip-arrow"),
          interactive: true,
          autoDestroy: true
        });
        el.trigger(e);
      }
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

     @example
     <caption>Instantiate with Class</caption>
     &lt;div id=&quot;jsNumberInput&quot;&gt;
     &lt;button type=&quot;button&quot;&gt;decrement&lt;/button&gt;
     &lt;input type=&#039;text&#039;&gt;
     &lt;button type=&quot;button&quot;&gt;increment&lt;/button&gt;
     &lt;/div&gt;

     var numberInput = new CUI.NumberInput({
        element: '#jsNumberInput'
      });

     @example
     <caption>Instantiate with jQuery</caption>
     &lt;div id=&quot;jsNumberInput&quot;&gt;
     &lt;button type=&quot;button&quot;&gt;decrement&lt;/button&gt;
     &lt;input type=&#039;text&#039;&gt;
     &lt;button type=&quot;button&quot;&gt;increment&lt;/button&gt;
     &lt;/div&gt;

     $('#jsNumberInput').numberInput();

     @example
     <caption>Markup</caption>
     &lt;!-- Standard Number Input --&gt;
     &lt;div class=&quot;numberinput&quot; data-init=&quot;numberinput&quot;&gt;
     &lt;button type=&quot;button&quot; class=&#039;decrement&#039;&gt;decrement&lt;/button&gt;
     &lt;input type=&#039;text&#039;&gt;
     &lt;button type=&quot;button&quot; class=&#039;increment&#039;&gt;increment&lt;/button&gt;
     &lt;/div&gt;

     @desc Creates a Number Input object
     @constructs
     @param {Object} options Component options
     @param {numberic} [options.min=NaN] (Optional) Minimum value allowed for input.
     @param {numberic} [options.max=NaN] (Optional) Maximum value allowed for input.
     @param {numberic} [options.step=1] Amount increment/decrement for input.
     @param {boolean} [options.hasError=false] Set the error state of the widget.
     @param {boolean} [options.disabled=false] Set the disabled state of the widget.

     */

    construct: function (options) {

      this._initMarkup();
      this._setListeners();
      this._setAttributes();

    },

    defaults: {
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
      this.$input = this.$element.children('.coral-NumberInput-input');
      if (this.$input.attr('type') != 'text') {
        this._switchInputTypeToText(this.$input);
      }

      this.$decrementElement = this.$element.children('.coral-NumberInput-decrementButton');
      this.$incrementElement = this.$element.children('.coral-NumberInput-incrementButton');
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

      this.$element.addClass('numberinput');

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

      this.setStep(this.options.step || CUI.Datepicker.step);

      this.setValue(this.$input.val() || 0);

      if (this.$element.attr('disabled') || this.$element.attr('data-disabled')) {
        this._toggleDisabled();
      }

      if (this.$element.hasClass('error') || this.$element.attr('data-error')) {
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
        this.$decrementElement.addClass('is-invalid');
        this.$incrementElement.addClass('is-invalid');

      } else {
        this.$input.removeClass('is-invalid');
        this.$decrementElement.removeClass('is-invalid');
        this.$incrementElement.removeClass('is-invalid');
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
  "use strict";

  function getNext(from) {
    var next = from.next();

    if (next.length > 0) {
      return next;
    }

    // returns the first child. i.e. rotating
    return from.prevAll().last();
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

     @example
     &lt;span class="cyclebutton" data-init="cyclebutton">
     &lt;button class="cyclebuttons-active icon-viewcard" type="button">Card&lt;/button>
     &lt;button class="icon-viewlist" type="button">List&lt;/button>
     &lt;/span>

     @desc Creates a new instance
     @constructs

     @param {Object} options Widget options
     */
    construct: function () {
      // Currently doesn't support form submission
      // When you need it please raise the issue in the mailing first, as the feature should not be necessarily implemented in this component

      this.$element.on("click tap", function (e) {
        if (e._cycleButton) {
          return;
        }

        e.stopPropagation();
        e.preventDefault();

        var toggle = $(this);

        if (toggle.children().length === 1) {
          return;
        }

        var from = toggle.children(".is-active");
        var to = getNext(from);

        from.removeClass("is-active");
        to.addClass("is-active");

        var click = $.Event("click", {
          _cycleButton: true
        });
        to.trigger(click);
      });
    }
  });

  CUI.Widget.registry.register("cyclebutton", CUI.CycleButton);

  // Data API
  $(document).on("cui-contentloaded.data-api", function (e) {
    CUI.CycleButton.init($("[data-init~='cyclebutton']", e.target));
  });
}(window.jQuery));

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
     * <h2 class="line">Examples</h2>
     *
     * <span class="autocomplete icon-search" data-init="autocomplete" data-multiple="true">
     *   <input type="text" name="name1" placeholder="Search">
     *   <button class="autocomplete-suggestion-toggle"></button>
     *   <ul class="autocomplete-suggestions selectlist">
     *     <li data-value="af">Afghanistan</li>
     *     <li data-value="al">Albania</li>
     *     <li data-value="bs">Bahamas</li>
     *     <li data-value="bh">Bahrain</li>
     *     <li data-value="kh">Cambodia</li>
     *     <li data-value="cm">Cameroon</li>
     *     <li data-value="dk">Denmark</li>
     *     <li data-value="dj">Djibouti</li>
     *     <li data-value="ec">Ecuador</li>
     *     <li data-value="eg">Egypt</li>
     *   </ul>
     * </span>
     *
     * @example
     * <caption>Instantiate with Class</caption>
     * var selectlist = new CUI.Autocomplete({
     *   element: '#myAutocomplete'
     *   mode: 'contains',
     *   ignorecase: false,
     *   delay: 400,
     *   multiple: true,
     *   selectlistConfig: {
     *     ...
     *   },
     *   tagConfig: {
     *     ...
     *   }
     * });
     *
     * @example
     * <caption>Instantiate with jQuery</caption>
     * $('#myAutocomplete').autocomplete({
     *   mode: 'contains',
     *   ignorecase: false,
     *   delay: 400,
     *   multiple: true,
     *   selectlistConfig: {
     *     ...
     *   },
     *   tagConfig: {
     *     ...
     *   }
     * });
     *
     * @example
     * <caption>Data API: Instantiate, set options</caption>
     &lt;span class=&quot;autocomplete icon-search&quot; data-init=&quot;autocomplete&quot;
     data-mode=&quot;contains&quot; data-ignorecase=&quot;false&quot;
     data-delay=&quot;400&quot; data-multiple=&quot;true&quot;&gt;
     &lt;input type=&quot;text&quot; name=&quot;name1&quot; placeholder=&quot;Search&quot;&gt;
     &lt;button class=&quot;autocomplete-suggestion-toggle&quot;&gt;&lt;/button&gt;
     &lt;ul class=&quot;autocomplete-suggestions selectlist&quot;&gt;
     &lt;li data-value=&quot;af&quot;&gt;Afghanistan&lt;/li&gt;
     &lt;li data-value=&quot;al&quot;&gt;Albania&lt;/li&gt;
     ...
     &lt;/ul&gt;
     &lt;/span&gt;
     *
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
     * @param {Object} [options.selectlistConfig] A configuration object
     * that is passed through to the select list. See {@link CUI.SelectList}
     * for more information.
     * @param {Object} [options.tagConfig] A configuration object
     * that is passed through to the tag list. See {@link CUI.TagList}
     * for more information.
     */
    construct: function () {
      // find elements
      this._input = this.options.predefine.input || this.$element.children('.coral-Autocomplete-textfield');
      this._selectlist = this.options.predefine.selectlist || this.$element.find('.coral-SelectList');
      this._tags = this.options.predefine.tags || this.$element.find('.coral-TagList');
      this._suggestionsBtn = this.options.predefine.suggestionsBtn || this.$element.find('.coral-Autocomplete-toggleButton');

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
    },

    /**
     * Sets up listeners for option changes.
     * @private
     */
    _setOptionListeners: function () {
      this.on('change:multiple', function() {
        this._setInput();
        this._setTags();
      }.bind(this));
    },

    /**
     * Initializes the text input
     * @private
     */
    _setInput: function() {
      if (this.options.multiple) {
        this._input.on('keypress.autocomplete-preventsubmit', function(event) {
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
          'class': 'coral-SelectList'
        }).appendTo(this.$element);
      } else if (!this._selectlist.attr('id')) {
        this._selectlist.attr('id', CUI.util.getNextId());
      }

      this._selectlist.selectList($.extend({
        relatedElement: this._input,
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
      if (this.options.multiple && !this._tagList) {
        // if the element is not there, create it
        if (this._tags.length === 0) {
          this._tags = $('<ul/>', {
            'class': 'coral-TagList'
          }).appendTo(this.$element);
        }

        this._tags.tagList(this.options.tagConfig || {});
        this._tagList = this._tags.data('tagList');
        this._input.on('keyup.autocomplete-addtag', this._addTag.bind(this));

      } else if (!this.options.multiple && this._tagList) {
        this._tags.remove();
        this._tags = null;
        this._tagList = null;
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
      if (event.which !== 13) {
        return;
      }

      this._tagList.addItem(this._input.val());
      this.clear();
      this._selectListWidget.hide();
    },

    /**
     * @private
     * @param  {jQuery.Event} event
     */
    _handleSelected: function (event) {
      this._selectListWidget.hide();

      if (this.options.multiple) {
        this._tagList.addItem({
          display: event.displayedValue,
          value: event.selectedValue
        });
        this.clear();
      } else {
        this._input.val(event.displayedValue);
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
        this._selectListWidget.filter(function(value, display) {
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
      this._selectListWidget.set('dataadditional', {
        query: query
      });
      this._selectListWidget.triggerLoadData(true);
    },

    /**
     * clears the autocomplete input field
     */
    clear: function () {
      this._input.val('');
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
     <p>
     <textarea maxlength="50" rows="10" cols="20" data-init="character-count"></textarea>
     </p>

     @example
     <caption>Instantiate with Class</caption>
     var alert = new CUI.CharacterCount({
  element: '#myTextField',
  maxlength: 50
});

     @example
     <caption>Instantiate with jQuery</caption>
     $('#myTextField').characterCount({maxlength: 50});

     @example
     <caption>Markup</caption>
     &lt;input type="text" maxlength="50" data-init="character-count"&gt;

     @desc Create a character count for a textfield or textarea.
     @constructs

     @param {Object} options                               Component options
     @param {String} [options.maxlength]                   Maximum length for the textfield/textarea (will be read from markup if given)
     */
    construct: function (options) {

      this.$input = $(options.related);

      if (this.$input.attr("maxlength")) {
        this.options.maxlength = this.$input.attr("maxlength");
      }
      this.$input.removeAttr("maxlength"); // Remove so that we can do our own error handling

      this.$input.on("input", this._render.bind(this));
      this.$element.on("change:maxlength", this._render.bind(this));

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

     */
    construct: function (options) {
      // determines the type of component that it is building
      this.isAccordion = (!this.$element.hasClass("coral-Collapsible")) && (this.$element.data("init") !== "collapsible");

      if (this.isAccordion) {

        // adds the required class
        this.$element.addClass("coral-Accordion");

        var activeIndex = this.$element.children(".is-active").index();
        if (this.options.active !== false) activeIndex = this.options.active;
        this.$element.children().each(function (index, element) {
          this._initElement(element, index != activeIndex);
        }.bind(this));
      } else {
        this._initElement(this.$element, !(this.options.active || this.$element.hasClass("is-active")));
      }

      this._setListeners();
      this._makeAccessible();
      this._updateDOMForDisabled();
    },

    defaults: {
      active: false,
      disabled: false
    },

    isAccordion: false,

    _setListeners: function () {
      // header selector
      var selector = this.isAccordion ? '> .coral-Accordion-item > .coral-Accordion-header' : '> .coral-Collapsible-header';
      this.$element.on('click', selector, this._toggle.bind(this));

      this.$element.on("change:is-active", this._changeActive.bind(this));

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
        isCurrentlyActive = el.hasClass("is-active"),
        active = (isCurrentlyActive) ? false : ((this.isAccordion) ? el.index() : true);
      this.setActive(active);
    },
    _changeActive: function () {
      if (this.isAccordion) {
        this._collapse(this.$element.children(".is-active"));
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
      this.options.active = active;
      this._changeActive();
    },
    _initElement: function (element, collapse) {
      // Add correct header
      if (this._getHeaderElement($(element)).length === 0) this._prependHeaderElement($(element));
      if (this._getHeaderIconElement($(element)).length === 0) this._prependHeaderIconElement($(element));

      // adds the content class
      if (this._getContentElement($(element)).length === 0) this._prependContentElement($(element));

      // adds the corresponding container class
      $(element).addClass(this.isAccordion ? 'coral-Accordion-item' : 'coral-Collapsible');

      var header = this._getHeaderElement($(element)),
        content = this._getContentElement($(element)),
        icon = this._getHeaderIconElement($(element));

      // move the heading before the collapsible content
      header.prependTo(element);

      // Set correct initial state
      if (collapse) {
        $(element).removeClass("is-active");
        $(element).height(header.innerHeight());
        if (!icon.hasClass("coral-Icon")) {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass("coral-Icon--chevronDown").addClass("coral-Icon--chevronUp");
      } else {
        $(element).addClass("is-active");
        $(element).css("height", "auto");
        if (!icon.hasClass("coral-Icon"))  {
          icon.addClass("coral-Icon coral-Icon--sizeXS");
        }
        icon.removeClass("coral-Icon--chevronUp").addClass("coral-Icon--chevronDown");
      }
    },
    _collapse: function (el) {
      this._getHeaderIconElement(el).removeClass("coral-Icon--chevronDown").addClass("coral-Icon--chevronUp");
      el.animate({height: this._getHeaderElement(el).innerHeight()}, {
        duration: "fast",
        complete: function () {
          el.removeClass("is-active"); // remove the active class after animation so that background color doesn't change during animation
          el.find("> div[aria-expanded]").hide(); // After animation we want to hide the collapsed content so that it cannot be focused
          el.trigger("deactivate");
        },
        progress: function(animation, progress, remainingMs) {
          el.trigger("collapse", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      var header = this._getHeaderElement(el),
        content = header.next("div[aria-expanded]");
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
      el.addClass("is-active");
      this._getHeaderIconElement(el).removeClass("coral-Icon--chevronUp").addClass("coral-Icon--chevronDown");
      var h = this._calcHeight(el);

      el.animate({height: h}, {
        duration: "fast",
        complete: function () {
          el.css("height", "auto"); // After animation we want the element to adjust its height automatically
          el.trigger("activate");
        },
        progress: function(animation, progress, remainingMs) {
          el.trigger("expand", {animation: animation, progress: progress, remainingMs: remainingMs});
        }
      });

      // update WAI-ARIA accessibility properties
      var header = this._getHeaderElement(el),
        content = header.next("div[aria-expanded]");
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
    _getCollapsibleSelector: function() {
        return this.isAccordion ? '.coral-Accordion-item' : '.coral-Collapsible';
    },
    /** @ignore */
    _calcHeight: function (el) {
      // Dimension calculation of invisible elements is not trivial.
      // "Best practice": Clone it, put it somwhere on the page, but not in the viewport,
      // and make it visible.
      var el2 = $(el).clone(),
        content2 = el2.find('> div[aria-expanded]');
      content2.show();
      el2.css({display: "block",
        position: "absolute",
        top: "-10000px",
        width: el.width(), // Ensure we calculate with the same width as before
        height: "auto"});
      el.parent().append(el2);
      var h = el2.height();
      el2.remove();
      return h;
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
            isActive = section.hasClass("is-active"),
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
        isActive = section.hasClass("is-active");
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

  var COLOPICKER_FOOTER_TEMPLATE = "<div class=\"coral-ButtonGroup navigation-bar\"></div>";
  var CLASSIC_PALETTE_BUTTON = "<button class='coral-ButtonGroup-item coral-Button' id='classicButton'><i class=\"coral-Icon coral-Icon--viewGrid\"></i></button>";
  var EDIT_BUTTON = "<button class='coral-ButtonGroup-item coral-Button' id='editButton'><i class=\"coral-Icon coral-Icon--edit\"></i></button>";
  var COLOR_SLIDER_BUTTON = "<button class='coral-ButtonGroup-item coral-Button'><i class=\"coral-Icon coral-Icon--properties\"></i></button>";
  var EDIT_MODE = "editMode";
  var CLASSIC_MODE = "classicMode";

  CUI.Colorpicker = new Class(
    /** @lends CUI.Colorpicker# */
    {
      toString: 'Colorpicker',

      extend: CUI.Widget,

      defaults: {
        config: {
          colors: {},
          displayModes: {}
        },
        disabled: false,
        name: null,
        title: ""
      },

      palettePageSize: 3,
      colorShadeNo: 6,
      lowerLimit: 0,
      upperLimit: 0,
      colorNames: [],
      currentPage: 0,
      pages: 1,

      /**
       * @extends CUI.Widget
       * @classdesc Colorpicker will create markup after the template.
       *
       * @desc Creates a new colorpicker
       * @constructs
       */
      construct: function (options) {
        this._readDataFromMarkup();
        this._adjustMarkup();

        if (this.options.config === null ||
          this.options.config.colors.length === 0) {
          this.options.disabled = true;
        }
        if (!this.options.disabled &&
          (this.options.config.displayModes.classicPalette && this.options.config.displayModes.freestylePalette)) {
          this.options.disabled = true;
        }
        if (!this.options.disabled &&
          (this.options.config.displayModes.length === 0 || (!this.options.config.displayModes.classicPalette && !this.options.config.displayModes.freestylePalette))) {
          this.options.config.displayModes.classicPalette = true;
        }

        this.$openButton = this.$element
          .find('.coral-ColorPicker-button');
        this.$hiddenInput = this.$element.find("input[name='" +
          this.options.name + "']");

        if (this.$element.attr("value")) {
          var initialVal = this.$element.attr("value");
          if (CUI.util.color.isValid("rgba", initialVal) || CUI.util.color.isValid("rgb", initialVal)) {
            this._setColor(initialVal);
          } else {
            this.$element.removeAttr("value");
          }

        }

        if (this.options.disabled) {
          this.$element.find(">.coral-ColorPicker-button").attr("disabled",
            "disabled");
        } else {
          this.colorNames = [];
          $.each(this.options.config.colors,
            function (key, value) {
              this.colorNames.push(key);
            }.bind(this));
          $('body').off(
              "tap." + this.options.name + " click." +
                this.options.name).fipo(
              "tap." + this.options.name,
              "click." + this.options.name, function (event) {
                if (!this.keepShown) {
                  if (this.$popover.has(event.target).length === 0) {
                    this._hidePicker();
                  }
                }
              }.bind(this));

          this.$openButton.on("click", function (event) {
            try {
              if (!this.pickerShown) {
                this._openPicker();
              } else {
                this._hidePicker();
              }
              this.keepShown = true;
              setTimeout(function () {
                this.keepShown = false;
              }.bind(this), 200);
            } catch (e) {
//                                console.log(e.message);
            }

          }.bind(this));
        }

      },

      _readDataFromMarkup: function () {

        if (this.$element.data("disabled")) {
          this.options.disabled = true;
        }

        if (this.$element.data("name")) {
          this.options.name = this.$element.data("name");
        }

        if (this.$element.attr("title")) {
          this.options.title = this.$element.attr("title");
        }

        var el = this.$element;
        if (el.data('config') !== undefined) {
          this.options.config = {};
          this.options.config.colors = {};
          this.options.config.displayModes = {};
          if (el.data('config').colors) {
            this.options.config.colors = el.data('config').colors;
          } else {
            this.options.disabled = true;
          }
          if (el.data('config').pickerModes) {
            this.options.config.displayModes = el.data('config').pickerModes;
          }
        }
      },

      _adjustMarkup: function () {
        this.$popover = this.$element.find(".coral-Popover");

        if (this.$popover.length === 0) {
          this.$popover = $('<div class="coral-ColorPicker-popover coral-Popover"><div class="coral-ColorPicker-popover-inner"></div><div class="coral-ColorPicker-popover-arrow coral-Popover-arrow coral-Popover-arrow--up"></div></div>');

          this.$element
            .append(this.$popover);
          this.$element
            .find(".coral-ColorPicker-popover-inner")
            .append(
              '<div class="colorpicker-holder"><div class="palette-header"></div><div class="colorpicker-body"></div><div class="colorpicker-footer"></div></div>');
        }

        /*this.$popoverWidget = new CUI.Popover({
          element: this.$popover
        });*/

        if (this.$element.find("input[type=hidden]").length === 0) {
          this.$element.append("<input type=\"hidden\" name=\"" +
            this.options.name + "\">");
        }

        var $button = this.$element
          .find('.coral-ColorPicker-button');
        if ($button.attr('type') === undefined) {
          $button.attr('type', 'button');
        }
      },

      _openPicker: function () {

        this._renderPicker(CLASSIC_MODE);
        //take into consideration the popover border width

        var left = this.$openButton.position().left +
          this.$openButton.width() / 2 -
          (this.$popover.width() / 2 + 9);
        if (left < 0) {
          left = 0;
        }
        var top = this.$openButton.position().top +
          this.$openButton.outerHeight() + 14;
        this._renderPickerFooter();

        this.$popover.css({
          "position": "absolute",
          "left": left + "px",
          "top": top + "px"
        }).show();
        this.pickerShown = true;
      },

      _hidePicker: function () {
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.currentPage = 0;
        this.$element.removeClass("focus");
        this.$popover.hide();
        this.pickerShown = false;
      },

      //render color picker based on the palette mode
      _renderPicker: function (mode, slide, pageNo) {

        if (mode === CLASSIC_MODE && !this._calculatePaletteBoundaries(slide, pageNo)) {
          return;
        }

        var table = null;
        if (mode === CLASSIC_MODE) {
          table = this._renderPalette();
        } else {
          table = this._renderEditPalette();
        }

        var $picker = this.$element.find(".colorpicker-holder");
        var $palette_nav = $picker.find(".palette-navigator");
        var $picker_body = $picker.find(".colorpicker-body");

        if (slide && $picker.find("table").length > 0) {
          this._slidePicker(table, (slide === "left"));
        } else {
          //display selected color if any and selected page
          $picker.find("table").remove();
          $picker.find(".sliding-container").remove();
          if (mode === EDIT_MODE) {
            $picker_body.append(table);
            $palette_nav.remove();
            if (this.$hiddenInput.val() !== undefined && this.$hiddenInput.val().length > 0) {
              table.find("div.color").css("background", this.$hiddenInput.val());
              var hex = CUI.util.color.RGBAToHex(this.$hiddenInput.val());
              table.find("input[name=':hex']").val(hex);
              var rgb = CUI.util.color.HexToRGB(hex);
              this._fillRGBFields(rgb);
              var cmyk = CUI.util.color.RGBtoCMYK(rgb);
              this._fillCMYKFields(cmyk);
            }
          } else {
            if ($palette_nav.length > 0) {
              $palette_nav.before(table);
            } else {
              $picker_body.append(table);
              this._renderPaletteNavigation();
            }

          }

        }

      },
      //display navigation mode buttons and select the one corresponding to the current display mode
      _renderPickerFooter: function () {
        this.$element.find(".colorpicker-footer").html(
          COLOPICKER_FOOTER_TEMPLATE);
        if (this.options.config.displayModes !== undefined) {
          if (this.options.config.displayModes.classicPalette ||
            this.options.config.displayModes.freestylePalette) {
            var paletteButton = $(CLASSIC_PALETTE_BUTTON);
            paletteButton.addClass("selected");
            this.$element.find(".navigation-bar").append(
              paletteButton);
          }
          if (this.options.config.displayModes.edit) {
            this.$element.find(".navigation-bar").append(
              EDIT_BUTTON);
          } else {
            this.$element.find(".colorpicker-footer").remove();
            return;
          }
        }

        this.$element.find(".colorpicker-footer button").off("tap.button click.button").fipo("tap.button", "click.button", function (event) {
          event.stopPropagation();
          event.preventDefault();
          var $target = $(event.target);
          var $button = null;
          this.$element.find(
              ".navigation-bar > .selected")
            .removeClass("selected");
          if (event.target.nodeName === "BUTTON") {
            $target.addClass("selected");
            $button = $(event.target);
          } else {
            $target.parent().addClass(
              "selected");
            $button = $target.parent();
          }
          if ($button.attr("id") === "editButton") {
            this._renderPicker(EDIT_MODE);
          } else {
            this._renderPicker(CLASSIC_MODE, false, this.currentPage);
          }

        }.bind(this));
      },
      //function for palette navigation
      _calculatePaletteBoundaries: function (slide, pageNo) {
        var colorsPerPage = 0;
        if (this.options.config.displayModes.freestylePalette) {
          colorsPerPage = this.palettePageSize *
            this.colorShadeNo;
        } else {
          colorsPerPage = this.palettePageSize;
        }
        if (!slide) {
          if (pageNo !== undefined) {
            this.lowerLimit = colorsPerPage * pageNo;
            this.upperLimit = this.lowerLimit + colorsPerPage -
              1;
            this.currentPage = pageNo;
          } else {
            this.upperLimit += colorsPerPage - 1;
            this.lowerLimit = 0;
            this.currentPage = 0;
          }
        } else if (slide === "left") {
          pageNo = this.currentPage + 1;
          if (pageNo + 1 > this.pages) {
            return false;
          }
          this.lowerLimit = colorsPerPage * pageNo;
          this.upperLimit = this.lowerLimit + colorsPerPage - 1;
          this.currentPage = pageNo;
        } else {
          pageNo = this.currentPage - 1;
          if (pageNo < 0) {
            return false;
          }
          this.lowerLimit = colorsPerPage * pageNo;
          this.upperLimit = this.lowerLimit + colorsPerPage - 1;
          this.currentPage = pageNo;
        }
        return true;
      },
      //display navigation bullets
      _renderPaletteNavigation: function () {
        this.$element.find(".palette-navigator").remove();
        var navigator = $("<div>");
        navigator.addClass("palette-navigator");
        if (this.options.config.displayModes.classicPalette) {
          this.pages = Math.ceil(this.colorNames.length /
            this.palettePageSize);
        } else {
          this.pages = Math.ceil(this.colorNames.length /
            (this.palettePageSize * this.colorShadeNo));
        }
        if (this.pages > 1) {
          for (var i = 0; i < this.pages; i++) {
            navigator.append("<i class='dot coral-Icon coral-Icon--circle' page='" + i +
              "'></i>");
          }
        }
        this.$element.find(".colorpicker-body").append(navigator);
        this.$element.find("i[page='" + this.currentPage + "']")
          .addClass("is-active");

        // Move around
        this.$element.find(".colorpicker-body").on("swipe",
          function (event) {
            this._renderPicker(CLASSIC_MODE, event.direction === "left" ? "left" : "right");
          }.bind(this));
        this.$element.find(".dot").off("tap.dot click.dot").fipo("tap.dot", "click.dot", function (event) {
          event.stopPropagation();

          if (this.currentPage === parseInt($(event.target).attr("page"), 10)) {
            return;
          }

          this._renderPicker(CLASSIC_MODE, false, parseInt($(event.target).attr("page"), 10));
        }.bind(this));
      },

      _slidePicker: function (newtable, isLeft) {
        this.$element.find(".sliding-container table").stop(true,
          true);
        this.$element.find(".sliding-container").remove();

        var oldtable = this.$element.find("table");
        var width = oldtable.width();
        var height = oldtable.height();

        var container = $("<div class=\"sliding-container\">");

        container.css({
          "display": "block",
          "position": "relative",
          "width": width + "px",
          "height": height + "px",
          "overflow": "hidden"
        });

        this.$element.find(".palette-navigator").before(container);
        container.append(oldtable).append(newtable);
        oldtable.css({
          "position": "absolute",
          "left": 0,
          "top": 0
        });
        oldtable.after(newtable);
        newtable.css({
          "position": "absolute",
          "left": (isLeft) ? width : -width,
          "top": 0
        });

        var speed = 400;

        oldtable.animate({
          "left": (isLeft) ? -width : width
        }, speed, function () {
          oldtable.remove();
        });

        newtable.animate({
          "left": 0
        }, speed, function () {
          if (container.parents().length === 0)
            return; // We already were detached!
          newtable.css({
            "position": "relative",
            "left": 0,
            "top": 0
          });
          newtable.detach();
          this.$element.find(".palette-navigator").before(
            newtable);
          container.remove();
        }.bind(this));
      },
      //render the selected color name and hex code
      _renderPaletteHeader: function () {
        var title = $('<div class="palette-header"><div class="title"></div><div class="selection"></div></div>');
        var $picker = this.$element.find(".colorpicker-holder");
        if ($picker.find(".palette-header").length > 0) {
          $picker.find(".palette-header").replaceWith(title);
        } else {
          $picker.prepend(title);
        }
        $picker.find(".title").html(
          "<span>" + this.options.title + "</span>");
      },

      _renderPalette: function () {
        this._renderPaletteHeader();

        var table = $("<table>");
        var html = "";

        for (var i = 0; i < this.palettePageSize; i++) {
          html += "<tr>";
          var opacity = 0;
          var rgb = "";
          var cssClass = "";
          var shade = "";
          for (var sh = 0; sh < this.colorShadeNo; sh++) {
            if (this.options.config.displayModes.classicPalette) {
              //display colors with shades
              if (this.colorNames.length - 1 < i +
                this.lowerLimit) {
                html += "<td><a></a></td>";
              } else {
                rgb = CUI.util.color.HexToRGB(this.options.config.colors[this.colorNames[i +
                  this.lowerLimit]]);
                shade = "rgba(" + rgb.r + "," + rgb.g +
                  "," + rgb.b + "," +
                  (1 - opacity).toFixed(2) + ")";
                opacity += 0.16;
                if (CUI.util.color.isSameColor(shade,
                  this.$hiddenInput.val())) {
                  cssClass = "selected";
                  this._fillSelectedColor(this.colorNames[i + this.lowerLimit], CUI.util.color.RGBAToHex(shade));
                } else {
                  cssClass = "";
                }
                html += "<td class='filled'><a style='background-color:" +
                  shade +
                  "' color='" +
                  shade +
                  "' colorName='" +
                  this.colorNames[i + this.lowerLimit] +
                  "' class='" +
                  cssClass +
                  "'>" +
                  "</a></td>";
              }
            } else {
              //display colors without shades (freestyle)
              if (this.colorNames.length - 1 < i *
                this.colorShadeNo + sh) {
                html += "<td><a></a></td>";
              } else {
                rgb = CUI.util.color.HexToRGB(this.options.config.colors[this.colorNames[i *
                  this.colorShadeNo + sh]]);
                shade = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + 1 + ")";
                if (CUI.util.color.isSameColor(shade,
                  this.$hiddenInput.val())) {
                  cssClass = "selected";
                } else {
                  cssClass = "";
                }
                html += "<td class='filled'><a style='background-color:" +
                  shade +
                  "' color='" +
                  shade +
                  "' colorName='" +
                  this.colorNames[i *
                    this.colorShadeNo + sh] +
                  "' class='" +
                  cssClass +
                  "'>" +
                  "</a></td>";
              }
            }
          }
          html += "</tr>";
        }
        table.append("<tbody>" + html + "</tbody>");
        //click on a color box
        table.find("a").off("tap.a click.a").fipo("tap.a", "click.a", function (event) {
          event.stopPropagation();
          event.preventDefault();

          if (CUI.util.color.isSameColor(this.$hiddenInput
            .val(), $(event.target).attr(
            "color"))) {
            return;
          }

          this.$element.find("table").find(
              ".selected").removeClass(
              "selected");
          $(event.target).addClass("selected");

          var colorName = $(event.target).attr("colorName") !== undefined ? $(event.target).attr("colorName") : "";
          this._fillSelectedColor(colorName, CUI.util.color.RGBAToHex($(event.target).attr("color")));

          this._setColor($(event.target).attr("color"));
        }.bind(this));
        var $navigator = this.$element.find(".palette-navigator");
        $navigator.find(".is-active").removeClass("is-active");
        $navigator.find("i[page='" + this.currentPage + "']").addClass("is-active");

        return table;
      },

      _fillSelectedColor: function (colorName, hexVal) {
        this.$element.find(".colorpicker-holder").find(".selection")
          .html(
            "<div><span>" +
              colorName +
              "</span><span>" +
              hexVal +
              "</span></div>");
      },
      //render edit mode screen
      _renderEditPalette: function () {
        var table = $("<table>");
        var html = "<tr>" +
          //hex color representation
          "<td colspan='2' rowspan='2' class='color-field'>" +
          "<div class='color'></div>" +
          "</td>" +
          "<td class='label'>HEX</td>" +
          "<td colspan='2'>" +
          "<input class='coral-Textfield' type='text' name=':hex'/>" +
          "</td>" +
          "<td colspan='2'>&nbsp;</td>" +
          "</tr>" +
          //RGB color representation in 3 input fields(r, g,b)
          "<tr>" +
          "<td class='label'>RGB</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_r'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_g'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':rgb_b'/>" +
          "</td>" +
          "<td>&nbsp;</td>" +
          "</tr>" +
          //CMYK color representation in 4 input fields(c,m,y,k)
          "<tr>" +
          "<td colspan='2'>&nbsp;</td>" +
          "<td class='label'>CMYK</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_c'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_m'/>" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_y'/" +
          "</td>" +
          "<td>" +
          "<input class='coral-Textfield' type='text' name=':cmyk_k'/>" +
          "</td>" +
          "</tr>" +
          //save button to store the color on the launcher
          "<tr>" +
          "<td colspan='3'>&nbsp;</td>" +
          "<td colspan='4'>" +
          "<button class='coral-Button coral-Button--primary'>Save Color</button>" +
          "</td>" +
          "</tr>";

        table.append("<tbody>" + html + "</tbody>");

        this.$element.find(".palette-header").remove();
        //input validations for change events
        table.find("input[name^=':rgb_']").each(function (index, element) {
          $(element).attr("maxlength", "3");
          $(element).on("blur", function (event) {
            var rgbRegex = /^([0]|[1-9]\d?|[1]\d{2}|2([0-4]\d|5[0-5]))$/;
            if (!rgbRegex.test($(event.target).val().trim()) || $("input:text[value=''][name^='rgb_']").length > 0) {
              $(event.target).val("");
              this._clearCMYKFields();
              this.$element.find("input[name=':hex']").val("");
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var rgb = {r: this.$element.find("input[name=':rgb_r']").val(), g: this.$element.find("input[name=':rgb_g']").val(), b: this.$element.find("input[name=':rgb_b']").val()};
            var cmyk = CUI.util.color.RGBtoCMYK(rgb);
            var hex = CUI.util.color.RGBToHex(rgb);
            this._fillCMYKFields(cmyk);
            this.$element.find("input[name=':hex']").val(hex);
            this.$element.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));
        table.find("input[name^=':cmyk_']").each(function (index, element) {
          $(element).attr("maxlength", "3");
          $(element).on("blur", function (event) {
            var cmykRegex = /^[1-9]?[0-9]{1}$|^100$/;
            if (!cmykRegex.test($(event.target).val().trim()) || $("input:text[value=''][name^='cmyk_']").length > 0) {
              $(event.target).val("");
              this._clearRGBFields();
              this.$element.find("input[name=':hex']").val("");
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var cmyk = {c: this.$element.find("input[name=':cmyk_c']").val(), m: this.$element.find("input[name=':cmyk_m']").val(), y: this.$element.find("input[name=':cmyk_y']").val(), k: this.$element.find("input[name=':cmyk_k']").val()};
            var rgb = CUI.util.color.CMYKtoRGB(cmyk);
            var hex = CUI.util.color.RGBToHex(rgb);
            this.$element.find("input[name=':hex']").val(hex);
            this._fillRGBFields(rgb);
            this.$element.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));
        table.find("input[name=':hex']").each(function (index, element) {
          $(element).attr("maxlength", "7");
          $(element).on("blur", function (event) {
            var hex = CUI.util.color.fixHex($(event.target).val().trim());
            if (hex.length === 0) {
              this._clearRGBFields();
              this._clearCMYKFields();
              this.$element.find("div.color").removeAttr("style");
              return;
            }
            var rgb = CUI.util.color.HexToRGB(hex);
            var cmyk = CUI.util.color.RGBtoCMYK(rgb);
            this._fillRGBFields(rgb);
            this._fillCMYKFields(cmyk);
            table.find("div.color").css("background", hex);
          }.bind(this));
        }.bind(this));

        table.on("click tap", "input, div",
          function (event) {
            event.stopPropagation();
            event.preventDefault();

          });
        table.on("click tap", "button",
          function (event) {
            event.stopPropagation();
            event.preventDefault();
            if (this.$element.find("input[name=':hex']").val() !== undefined && this.$element.find("input[name=':hex']").val().length > 0) {
              this._setColor(this.$element.find("input[name=':hex']").val());
            }
          }.bind(this));

        return table;
      },
      //set selected color on the launcher
      _setColor: function (color) {
        this.$hiddenInput.val(color);
        this.$openButton.css("background-color", this.$hiddenInput
          .val());
      },

      _fillRGBFields: function (rgb) {
        this.$element.find("input[name=':rgb_r']").val(rgb.r);
        this.$element.find("input[name=':rgb_g']").val(rgb.g);
        this.$element.find("input[name=':rgb_b']").val(rgb.b);
      },

      _clearRGBFields: function () {
        this.$element.find("input[name^=':rgb']").val("");
      },

      _fillCMYKFields: function (cmyk) {
        this.$element.find("input[name=':cmyk_c']").val(cmyk.c);
        this.$element.find("input[name=':cmyk_m']").val(cmyk.m);
        this.$element.find("input[name=':cmyk_y']").val(cmyk.y);
        this.$element.find("input[name=':cmyk_k']").val(cmyk.k);
      },

      _clearCMYKFields: function () {
        this.$element.find("input[name^=':cmyk']").val("");
      }

    });

  CUI.Widget.registry.register("colorpicker", CUI.Colorpicker);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Colorpicker.init($("[data-init~=colorpicker]", e.target));
    });
  }
}(window.jQuery));


(function ($) {
  "use strict";

  var ns = ".coral-DragAction";

  /**
   * Find for the first parent that has an overflow of hidden, auto or scroll.
   * @ignore
   */
  function getViewContainer(element) {
    while (true) {
      var p = element.parent();

      if (p.length === 0) return p;
      if (p.is("body")) return p;

      var flow = p.css("overflow");
      if (flow === "hidden" || flow === "auto" || flow === "scroll") return p;

      element = p;
    }
  }

  function pagePosition(event) {
    var touch = {};
    if (event.originalEvent) {
      var o = event.originalEvent;
      if (o.changedTouches && o.changedTouches.length > 0) {
        touch = o.changedTouches[0];
      }
      if (o.touches && o.touches.length > 0) {
        touch = o.touches[0];
      }
    }

    return {
      x: touch.pageX || event.pageX,
      y: touch.pageY || event.pageY
    };
  }

  function within(x, y, element) {
    var offset = element.offset();
    return x >= offset.left && x < (offset.left + element.outerWidth()) &&
      y >= offset.top && y < offset.top + element.outerHeight();
  }


  CUI.DragAction = new Class(/** @lends CUI.DragAction# */{
    /**
     Constructs a new Drag Action. After the initialization the drag is performed immediatly.

     @param {Event} event The event that triggered the drag
     @param {jQuery} source The element that is the source of this drag
     @param {jQuery} dragElement The element that will be dragged
     @param {Array} dropZones An Array of elements that can be destinations for this drag
     @param {String} [restrictAxis] Restricts the drag movement to a particular axis. Value: ("horizontal" | "vertical")
     */
    construct: function (event, source, dragElement, dropZones, restrictAxis) {
      this.sourceElement = source;
      this.dragElement = dragElement;
      this.container = getViewContainer(dragElement);
      this.containerHeight = this.container.get(0).scrollHeight; // Save current container height before we start dragging
      this.dropZones = dropZones;
      this.axis = restrictAxis;
      this.scrollZone = 20; // Use 20px as scrolling zone, static for now

      this.dragStart(event);
    },

    currentDragOver: null,

    dragStart: function (event) {
      event.preventDefault();

      var p = this.dragElement.position();
      var pp = pagePosition(event);

      this.dragElement.css({
        "left": p.left,
        "top": p.top,
        "width": this.dragElement.width() + "px"
      }).addClass("is-dragging");

      this.dragStart = {x: pp.x - p.left, y: pp.y - p.top};

      $(document).fipo("touchmove" + ns, "mousemove" + ns, this.drag.bind(this));
      $(document).fipo("touchend" + ns, "mouseup" + ns, this.dragEnd.bind(this));

      this.sourceElement.trigger(this._createEvent("dragstart", event));

      this.drag(event);
    },

    drag: function (event) {
      event.preventDefault();

      var pos = pagePosition(event);

      // Need to scroll?
      if (this.container.is("body")) {
        if (pos.y - this.container.scrollTop() < this.scrollZone) {
          this.container.scrollTop(pos.y - this.scrollZone);
        }
        if (pos.y - this.container.scrollTop() > this.container.height() - this.scrollZone) {
          this.container.scrollTop(pos.y - this.container.height() - this.scrollZone);
        }
      } else {
        var oldTop = this.container.scrollTop();
        var t = this.container.offset().top + this.scrollZone;

        if (pos.y < t) {
          this.container.scrollTop(this.container.scrollTop() - (t - pos.y));
        }

        var h = this.container.offset().top + this.container.height() - this.scrollZone;

        if (pos.y > h) {
          var s = Math.min(this.container.scrollTop() + (pos.y - h), Math.max(this.containerHeight - this.container.height(), 0));
          this.container.scrollTop(s);
        }

        var newTop = this.container.scrollTop();
        this.dragStart.y += oldTop - newTop; // Correct drag start position after element scrolling
      }

      var newCss = {};
      if (this.axis !== "horizontal") {
        newCss.top = pos.y - this.dragStart.y;
      }
      if (this.axis !== "vertical") {
        newCss.left = pos.x - this.dragStart.x;
      }

      this.dragElement.css(newCss);

      this.triggerDrag(event);
    },

    dragEnd: function (event) {
      event.preventDefault();

      this.dragElement.removeClass("is-dragging");
      this.dragElement.css({top: "", left: "", width: ""});

      $(document).off(ns);

      this.triggerDrop(event);

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.sourceElement.trigger(this._createEvent("dragend", event));
    },

    triggerDrag: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (dropElement === this.currentDragOver) {
        if (this.currentDragOver) {
          $(this.currentDragOver).trigger(this._createEvent("dragover", event));
        }
        return;
      }

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.currentDragOver = dropElement;

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragenter", event));
      }
    },

    triggerDrop: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (!dropElement) return;

      dropElement.trigger(this._createEvent("drop", event));
    },

    _getCurrentDropZone: function (event) {
      var pos = pagePosition(event);

      var dropElement = null;

      $.each(this.dropZones, function (index, value) {
        if (within(pos.x, pos.y, value)) {
          dropElement = value;
          return false;
        }
      });

      return dropElement;
    },

    _createEvent: function (name, fromEvent) {
      var pos = pagePosition(fromEvent);

      var event = jQuery.Event(name);
      event.pageX = pos.x;
      event.pageY = pos.y;
      event.sourceElement = this.sourceElement;
      event.item = this.dragElement;

      return event;
    }
  });
})(jQuery);

(function ($, console) {
  "use strict";

  var addButton =
    "<button class=\"js-coral-Multifield-add coral-Multifield-add coral-MinimalButton\">" +
      "<i class=\"coral-Icon coral-Icon--sizeM coral-Icon--addCircle coral-MinimalButton-icon\"></i>" +
    "</button>";

  var removeButton =
    "<button class=\"js-coral-Multifield-remove coral-Multifield-remove coral-MinimalButton\">" +
      "<i class=\"coral-Icon coral-Icon--sizeM coral-Icon--minusCircle coral-MinimalButton-icon\"></i>" +
    "</button>";

  var moveButton =
    "<button class=\"js-coral-Multifield-move coral-Multifield-move coral-MinimalButton\">" +
      "<i class=\"coral-Icon coral-Icon--sizeM coral-Icon--navigation coral-MinimalButton-icon\"></i>" +
    "</button>";

  var listTemplate =
    "<ol class=\"js-coral-Multifield-list coral-Multifield-list\"></ol>";

  var fieldTemplate =
    "<li class=\"js-coral-Multifield-input coral-Multifield-input\">" +
      "<div class=\"js-coral-Multifield-placeholder\"></div>" +
      removeButton +
      moveButton +
    "</li>";


  CUI.Multifield = new Class(/** @lends CUI.Multifield# */{
    toString: "Multifield",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget

     @classdesc A composite field that allows you to add/reorder/remove multiple instances of a component.
     The component is added based on a template defined in a <code>&lt;script type=&quot;text/html&quot;&gt;</code> tag.
     The current added components are managed inside a <code>ol</code> element.

     <p>
     <div class="multifield" data-init="multifield">
     <ol>
     <li><input type="text" value="some value" /></li>
     <li><input type="text" value="some other value" /></li>
     </ol>
     <script type="text/html">
     <input type="text" />
     </script>
     </div>
     </p>

     @example
     <caption>Instantiate with Class</caption>
     &lt;div id=&quot;apiMultifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot;&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     var multifield = new CUI.Multifield({
                element: '#apiMultifield'
            });

     @example
     <caption>Instantiate with jQuery</caption>
     &lt;div id=&quot;apiMultifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot;&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     $('#apiMultifield').multifield();

     @example
     <caption>Markup</caption>
     &lt;div class=&quot;multifield&quot; data-init=&quot;multifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot; /&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     @desc Creates a Multifield component.
     @constructs
     */
    construct: function (options) {
      this.script = this.$element.find(".js-coral-Multifield-input-template");
      this.ol = this.$element.children(".js-coral-Multifield-list");

      if (this.ol.length === 0) {
        this.ol = $(listTemplate).prependTo(this.$element);
      }

      this._adjustMarkup();
      this._addListeners();
    },

    /**
     * Enhances the markup required for multifield.
     * @private
     */
    _adjustMarkup: function () {
      this.$element.addClass("coral-Multifield");
      this.ol.children(".js-coral-Multifield-input").append(removeButton, moveButton);
      this.ol.after(addButton);
    },

    /**
     * Initializes listeners.
     * @private
     */
    _addListeners: function () {
      var self = this;

      this.$element.on("click", ".js-coral-Multifield-add", function (e) {
        var item = $(fieldTemplate);
        item.find(".js-coral-Multifield-placeholder").replaceWith(self.script.html().trim());
        item.appendTo(self.ol);
        $(self.ol).trigger("cui-contentloaded");
      });

      this.$element.on("click", ".js-coral-Multifield-remove", function (e) {
        $(this).closest(".js-coral-Multifield-input").remove();
      });

      this.$element
        .fipo("taphold", "mousedown", ".js-coral-Multifield-move", function (e) {
          e.preventDefault();

          var item = $(this).closest(".js-coral-Multifield-input");
          item.prevAll().addClass("coral-Multifield-input--dragBefore");
          item.nextAll().addClass("coral-Multifield-input--dragAfter");

          // Fix height of list element to avoid flickering of page
          self.ol.css({height: self.ol.height() + $(e.item).height() + "px"});
          new CUI.DragAction(e, self.$element, item, [self.ol], "vertical");
        })
        .on("dragenter", function (e) {
          self.ol.addClass("drag-over");
          self._reorderPreview(e);
        })
        .on("dragover", function (e) {
          self._reorderPreview(e);
        })
        .on("dragleave", function (e) {
          self.ol.removeClass("drag-over").children().removeClass("coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter");
        })
        .on("drop", function (e) {
          self._reorder($(e.item));
          self.ol.children().removeClass("coral-Multifield-input--dragBefore coral-Multifield-input--dragAfter");
        })
        .on("dragend", function (e) {
          self.ol.css({height: ""});
        });
    },

    _reorder: function (item) {
      var before = this.ol.children(".coral-Multifield-input--dragAfter").first();
      var after = this.ol.children(".coral-Multifield-input--dragBefore").last();

      if (before.length > 0) item.insertBefore(before);
      if (after.length > 0) item.insertAfter(after);
    },

    _reorderPreview: function (e) {
      var pos = this._pagePosition(e);

      this.ol.children(":not(.dragging)").each(function () {
        var el = $(this);
        var isAfter = pos.y < (el.offset().top + el.outerHeight() / 2);
        el.toggleClass("coral-Multifield-input--dragAfter", isAfter);
        el.toggleClass("coral-Multifield-input--dragBefore", !isAfter);
      });
    },

    _pagePosition: function (e) {
      var touch = {};
      if (e.originalEvent) {
        var o = e.originalEvent;
        if (o.changedTouches && o.changedTouches.length > 0) {
          touch = o.changedTouches[0];
        }
        if (o.touches && o.touches.length > 0) {
          touch = o.touches[0];
        }
      }

      return {
        x: touch.pageX || e.pageX,
        y: touch.pageY || e.pageY
      };
    }
  });

  CUI.Widget.registry.register("multifield", CUI.Multifield);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Multifield.init($("[data-init~=multifield]", e.target));
    });
  }
})(jQuery, window.console);

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
    CUI.ColumnView = new Class(/** @lends CUI.ColumnView# */{
        toString: 'ColumnView',
        extend: CUI.Widget,

        /**
         * @extends CUI.Widget
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

            if (this.options.path) {
                // only load a column if a path is provided; otherwise the initial column is provided by markup
                var $column = this._addColumn();
                $column.addClass('is-active');
                this._loadColumn($column, this.options.url, this.options.path);
            }
            this.applyOptions();
        },

        defaults: {
            url: '{+path}',
            path: '',
            wrapLabels: true // wrap long labels
        },

        /**
         * sets all options
         */
        applyOptions: function () {
//            this._findElements();

            this._initialize();

            // accessibility
            //this._makeAccessible();
        },

        /**
         * Get the selected items. This does not include the breadcrumb items of other columns.
         * @return {jQuery}
         */
        getSelectedItems: function() {
            return this.getActiveColumn().children('.is-selected');
        },

        /**
         * Get the paths of the selected items. This does not include the breadcrumb items of other columns.
         * @return {String[]}
         */
        getSelectedPaths: function() {
            var paths = [];
            this.getSelectedItems().each(function() {
                paths.push($(this).data('path'));
            });
            return paths;
        },

        /**
         * Get the items of the breadcrumb i.e. selected items not located in the active column.
         * @return {jQuery}
         */
        getBreadcrumbItems: function() {
            return this.getActiveColumn().prevAll().children('.is-selected');
        },

        /**
         *
         * @param path
         */
        selectItemByPath: function(path, selectBreadcrumb) {
            //todo: different column (simply find?), load missing levels (or extra method loadPath?)
            var $item = this.getActiveColumn().children('.coral-ColumnView-item[data-path="' + path + '"]');

            this._setActiveColumn($item, false);
            $item.addClass('is-selected');

            //todo: breadcrumb
        },

        checkItemByPath: function(path, selectBreadcrumb) {
            //todo
        },

        /**
         * Get the active column.
         * @return {jQuery}
         */
        getActiveColumn: function() {
            return this.$element.children('.is-active');
        },

        /**
         * Get the column where actions like adding or pasting items will be applied to. If a single folder is selected
         * this would be the sub column and otherwise the active column.
         * @return {jQuery}
         */
        getTargetColumn: function() {
            var activeColumn = this.getActiveColumn();
            var items = this.getSelectedItems().filter(':not(.is-checked)');
            if (items.length === 1 && items.hasClass('coral-ColumnView-item--hasChildren')) {
                return activeColumn.next();
            } else {
                return activeColumn;
            }
        },


//        _findElements: function () {
//
//        },

        _initialize: function() {
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
        _addColumn: function() {
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
        _loadColumn: function($column, url, path) {
            var columnView = this;
            $.ajax({
                url: url.replace("{+path}", path)
            }).done(function (data) {
                    var html = $('<div />').append(data).find('.coral-ColumnView-column').html();
                    $column.html(html);

                    if (columnView.options.wrapLabels === true) {
                        $column.find('.coral-ColumnView-item').each(function() {
                            var $this = $(this);
                            $this.addClass('coral-ColumnView-item--checkWrap');
                            if (this.scrollWidth > this.clientWidth) {
                                // items with overflowing text: reduce font size
                                $this.addClass('coral-ColumnView-item--doublespaced');
                            }
                            $this.removeClass('coral-ColumnView-item--checkWrap');
                        });
                    }


                }).always(function(){
                    $column.children('.wait').remove();
                });
        },

        /**
         * The handler to select items. Selecting results in a single selected item, loads its
         * <code>data-url</code> and adds the data to a new column.
         * @param {jQuery.Event} event
         * @private
         */
        _selectItemHandler: function(event) {
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
            }
            this._loadColumn($column, $item.data('url') || this.options.url,
                    $item.data('path'));

            this._scrollToColumn();
        },

        /**
         * The handler to check and uncheck items. Checking may result in none, a single or multiple selected items.
         * and adds the data to a new column.
         * @param {jQuery.Event} event
         * @private
         */
        _checkItemHandler: function(event) {
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
        },

        //tmp
        _log: function() {
//            console.log(this.getActiveColumn());
//            console.log(this.getSelectedPaths());
//            console.log(this.getTargetColumn()[0]);
//            console.log(this.getBreadcrumbItems());
//            console.log(this.selectItemByPath('content/fr'));

        },

        /**
         * Sets the parent of the given item to active column and handles. Selected items are deselected and unchecked.
         * If the former active column is the same as the new one the items will be unchecked solely if
         * <code>forceUncheck</code> is true.
         * @param $item {jQuery} The lastly selected item
         * @param checking {Boolean} <code>true</code> when the "checkbox" (icon) was tapped
         * @private
         */
        _setActiveColumn: function($item, checking) {
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
        _scrollToColumn: function() {
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
                $activeColumn.prevAll().each(function() {
                    left += $(this).outerWidth();
                });
                duration = (this.$element.scrollLeft() - left) * 1.5; // constant speed

                this.$element.animate({
                    scrollLeft: left
                }, duration);
            }
        }


    });


    CUI.Widget.registry.register('columnview', CUI.ColumnView);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (event) {
            CUI.ColumnView.init($('[data-init~=columnview]', event.target));
        });
    }

}(jQuery, this));

(function ($, window, undefined) {

  // debounce function will be extracted
  function debounce(fn, threshold, execAsap) {
    var timeout;
    return function debounced () {
      var obj = this, args = arguments; // arguments which were passed
      function delayed () {
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
  }

  function saveState(name, value) {
    $.cookie(name, value, { expires: 7, path: '/' });
  }

  function clearState(name) {
    $.removeCookie(name, { path: '/' });
  }

  function toggleBreadcrumbBar() {
    $('.endor-Brand').toggleClass('is-closed');
    return !$('.endor-Panel-header.endor-BreadcrumbBar').toggleClass('is-closed').hasClass('is-closed');
  }

  function truncateCrumbs() {
    var crumbs = $('.endor-Crumbs');
    var items = crumbs.find('.endor-Crumbs-item');

    var availableWidth = crumbs.width() - 100; // 50 for spacing

    items.removeClass('is-collapsed');

    var fullWidth = Array.prototype.reduce.call(items, function(memo, v) {
      return memo += $(v).outerWidth();
    }, 0);

    // truncate each item just enough
    // the first and the last item always stay
    var w = fullWidth;
    for (var i = 1, ln = items.length -1; i < ln && w > availableWidth; i++) {
      var item = $(items[i]);
      w -= item.width();
      item.addClass('is-collapsed');
    }
  }

  /**
   * Toggles the navigation rail. The behaviour depends on the size of
   * the screen since only one bar sidepanel.
   */
  function toggleNavRail() {
    var page = $('.js-endor-page');
    var navrail = $('.js-endor-navrail');

    // if the screen is small, the inner rail is closed
    if (window.innerWidth <= 1024 && page.hasClass('is-innerRailOpen')) {
      toggleInnerRail();

      // stops the rail styles from triggering in case the rail was already open
      if (!navrail.hasClass('is-closed')) {
        return true;
      }
    }

    navrail.toggleClass('is-closed');
    $('.endor-BreadcrumbBar').toggleClass('is-compact');
    $('.js-endor-navrail-toggle').toggleClass('is-active');

    return !navrail.hasClass('is-closed');
  }

  function toggleInnerRail(activator) {
    var page = $('.js-endor-page');
    var activeView = $('.coral-MultiPanel.is-active').first();

    var targetView, targetId;

    if (activator) {
      targetId = activator.data('target');
      var target = $(targetId).first();

      if (!activeView.is(target)) {
        targetView = target;
      }
    }

    $('.js-endor-innerrail-toggle').removeClass('is-selected');

    if (targetView) {
      activator.addClass('is-selected');
      activeView.removeClass('is-active');
      targetView.addClass('is-active');
      page.addClass('is-innerRailOpen');

      return targetId;
    } else {
      activeView.removeClass('is-active');
      page.removeClass('is-innerRailOpen');
    }
  }

  function toggleFooter() {
    var footer = $('.endor-Footer'),
      content = $('.js-endor-content')[0];

    footer.toggleClass('endor-Footer--sticky', content && content.scrollHeight <= content.offsetHeight);
  }

  function performNav(currentColumn, targetColumn, isBack) {
    currentColumn.removeClass('is-left is-right is-active');

    // should transition back
    if (isBack) {
      currentColumn.addClass('is-right');
    } else {
      currentColumn.addClass('is-left');
    }

    // removes any previous animations
    targetColumn.removeClass('is-left is-right');

    // marks the current column as active which causes to animate to the center no matter the current position
    targetColumn.addClass('is-active');
  }

  function navigateColumnView(activator) {
    var columnView = activator.closest('.coral-ColumnView');
    var currentColumn = activator.closest('.coral-ColumnView-column');
    var targetId = activator.data('coral-columnview-target');
    var isBack = activator.hasClass('coral-ColumnView-item--back');

    var targetColumn = columnView.find('.coral-ColumnView-column[data-coral-columnview-id="' + targetId +'"]');

    if (targetColumn.length) {
      performNav(currentColumn, targetColumn, isBack);
      return;
    }

    var href = activator.prop('href');

    if (!href) {
      return;
    }

    var wait = $('<div class="wait large center"></div>').appendTo(currentColumn);

    $.get(href)
      .done(function(html) {
        columnView.append(html);
        targetColumn = columnView.find('.coral-ColumnView-column[data-coral-columnview-id="' + targetId +'"]');

        if (targetColumn) {
          performNav(currentColumn, targetColumn, isBack);
        }
      })
      .always(function() {
        wait.remove();
      });
  }


  $(document).on('click', '.coral-ColumnView-item[data-coral-columnview-target]', function(e) {
    e.preventDefault();
    navigateColumnView($(this));
  });

  $(document).on('click', '.js-endor-navrail-toggle', function(e) {
    e.preventDefault();
    var open = toggleNavRail();
    saveState('endor.navrail.open', open);
  });

  $(document).on('click', '.js-endor-innerrail-toggle', function(e) {
    e.preventDefault();
    var current = toggleInnerRail($(this));

    if (current) {
      saveState('endor.innerrail.current', current);
    } else {
      clearState('endor.innerrail.current');
    }
  });

  $(document).on('click', '.endor-BreadcrumbBar, .endor-BlackBar-title', function(e) {
    if ($(e.target).closest(".endor-Crumbs-item:not(.endor-Crumbs-item--unavailable)").length) {
      return;
    }

    e.preventDefault();

    var open = toggleBreadcrumbBar();
    saveState('endor.breadcrumbbar.open', open);
  });

  $(window).on('resize load', debounce(function() {
    truncateCrumbs();
    if (window.innerWidth <= 1024) {
      $('.endor-BreadcrumbBar').addClass('is-compact');
      $('.js-endor-navrail').addClass('is-closed');
    }
  }, 500));

  $(document).on('cui-contentloaded', toggleFooter);

}(jQuery, window));
