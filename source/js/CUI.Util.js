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
                console.log("ERROR: Unable to register callback from string: ", callbackAsString, e);
                return null;
            }
        }
    };

  /**
    $.load with a CUI spinner

    @param {String} remote                                  The remote URL to pass to $.load
    @param {Boolean} [force]                                Set force to true to force the load to happen with every call, even if it has succeeded already. Otherwise, subsequent calls will simply return.
    @param {Function} [callback]                            A function to execute in the scope of the jQuery $.load call when the load finishes (whether success or failure). The arguments to the callback are the load results: response, status, xhr.
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
}(window.jQuery));
