/**
  Utility functions used by CoralUI widgets

  @namespace
*/
CUI.util = {};

/**
  Get the target element of a data API action using the data attributes of an element.

  @param {jQuery} $element    The jQuery object representing the element to get the target from

  @returns {jQuery}           The jQuery object representing the target element
*/
CUI.util.getDataTarget = function($element) {
  var href = $element.attr('href');
  var $target = $($element.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
  return $target;
};

/**
  Decapitalize a string by converting the first letter to lowercase.

  @param {String} str     The string to de-capitalize

  @returns {String}       The de-capitalized string
*/
CUI.util.decapitalize = function(str) {
  return str.slice(0,1).toLowerCase()+str.slice(1);
};

/**
  Capitalize a string by converting the first letter to uppercase.

  @param {String} str     The string to capitalize

  @returns {String}       The capitalized string
*/
CUI.util.capitalize = function(str) {
  return str.slice(0,1).toUpperCase()+str.slice(1);
};

(function($) {
  /**
    Create a jQuery plugin from a class

    @param {Class} PluginClass                              The class to create to create the plugin for
    @param {String} [pluginName=PluginClass.toString()]     The name of the plugin to create. The de-capitalized return value of PluginClass.toString() is used if left undefined
    @param {Function} [callback]                              A function to execute in the scope of the jQuery object when the plugin is activated. Used for tacking on additional initialization procedures or behaviors for other plugin functionality.
  */
  CUI.util.plugClass = function(PluginClass, pluginName, callback) {
    pluginName = pluginName || CUI.util.decapitalize(PluginClass.toString());

    $.fn[pluginName] = function(optionsIn) {
      return this.each(function() {
        var $element = $(this);

        // Combine defaults, data, options, and element config
        var options = $.extend({}, $element.data(), typeof optionsIn === 'object' && optionsIn, { element: this });

        // Get instance, if present already
        var instance = $element.data(pluginName) || new PluginClass(options);

        if (typeof optionsIn === 'string') // Call method, pass args
          instance[optionsIn].apply(instance, Array.prototype.slice.call(arguments, 1));
        else if ($.isPlainObject(optionsIn)) // Apply options
          instance.set(optionsIn);

        if (typeof callback === 'function')
          callback.call(this, instance);
      });
    };

    $.fn[pluginName].Constructor = PluginClass;
  };

    /**
     Register a callback from a string

     @param {String} callbackAsString The string containing the callback function to register
     @param {Object} [params]         Parameters to provide when executing callback
     @return {Function} The callback function generated from the provided string
     */
    CUI.util.buildFunction = function(callbackAsString, params) {
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
    };

    /**
     * Selects text in the provided field
     * @param {Number} start (optional) The index where the selection should start (defaults to 0)
     * @param {Number} end (optional) The index where the selection should end (defaults to the text length)
     */
    CUI.util.selectText = function(field, start, end) {
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
    };

  /**    
    Load remote content in an element with a CUI spinner
    NOTE: This function should be moved to another file as it is not part of the CUI.util namespace. Maybe CUI.jQuery.js? Ignored from docs for now.

    @param {String} remote                                  The remote URL to pass to $.load
    @param {Boolean} [force]                                Set force to true to force the load to happen with every call, even if it has succeeded already. Otherwise, subsequent calls will simply return.
    @param {Function} [callback]                            A function to execute in the scope of the jQuery $.load call when the load finishes (whether success or failure). The arguments to the callback are the load results: response, status, xhr.
    
    @ignore
  */
  $.fn.loadWithSpinner = function(remote, force, callback) {
    var $target = $(this);

    // load remote link, if necessary
    if (remote && (force || $target.data('loaded-remote') !== remote)) {
      // only show the spinner if the request takes an appreciable amount of time, otherwise
      // the flash of the spinner is a little ugly
      var timer = setTimeout(function() {
        $target.html('<div class="spinner large"></div>');
      }, 50);

      $target.load(remote, function(response, status, xhr) {
        clearTimeout(timer); // no need for the spinner anymore!

        if (status === 'error') {
          $target.html('<div class="alert error"><strong>ERROR</strong> Failed to load content: '+xhr.statusText+' ('+xhr.status+')</div>');
          $target.data('loaded-remote', '');
        }

        if (typeof callback === 'function') {
          callback.call(this, response, status, xhr);
        }
      });

      $target.data('loaded-remote', remote);
    }
  };

  /*
   * Find first absolute/relative positioned parent
   */
  $.fn.positionedParent = function() {
    var parent;

    $(this).parents().each(function() {
      var $this = $(this), position = $this.css('position');

      if (position === 'absolute' || position === 'relative') {
        parent = $this;
        return false;
      }
    });

    return parent || $('body');
  };
  
  $.extend({
      /**
        Utility function to get the value of a nested key within an object
        NOTE: This function should be moved to CUI.util namespace as it is not jQuery specific. Ignored from docs for now.
      
        @param {Object} object    The object to retrieve the value from
        @param {String} nestedKey The nested key. For instance "foo.bar.baz"
        @return {Object} The object value for the nested key
        
        @ignore
      */
      getNested: function(object, nestedKey) {
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
      }
  });
  
  // :focusable and :tabbable selectors 
  // from https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js
  function focusable( element, isTabIndexNotNaN ) {
      var map, mapName, img,
          nodeName = element.nodeName.toLowerCase();
      if ( "area" === nodeName ) {
          map = element.parentNode;
          mapName = map.name;
          if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
              return false;
          }
          img = $( "img[usemap=#" + mapName + "]" )[0];
          return !!img && visible( img );
      }
      return ( /input|select|textarea|button|object/.test( nodeName ) ?
          !element.disabled :
          "a" === nodeName ?
              element.href || isTabIndexNotNaN :
              isTabIndexNotNaN) &&
          // the element and all of its ancestors must be visible
          visible( element );
  }
  
  function visible( element ) {
      return $.expr.filters.visible( element ) &&
          !$( element ).parents().addBack().filter(function() {
              return $.css( this, "visibility" ) === "hidden";
          }).length;
  }
  
  $.extend( $.expr[ ":" ], {
      data: $.expr.createPseudo ?
          $.expr.createPseudo(function( dataName ) {
              return function( elem ) {
                  return !!$.data( elem, dataName );
              };
          }) :
          // support: jQuery <1.8
          function( elem, i, match ) {
              return !!$.data( elem, match[ 3 ] );
          },
  
      focusable: function( element ) {
        return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
      },
  
      tabbable: function( element ) {
          var tabIndex = $.attr( element, "tabindex" ),
              isTabIndexNaN = isNaN( tabIndex );
          return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
      }
  });
}(window.jQuery));
