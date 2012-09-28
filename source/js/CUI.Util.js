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
  De-capitalize a string by converting the first letter to lowercase.
  
  @param {String} str     The string to de-capitalize
  
  @returns {String}       The de-capitalized string
*/
CUI.util.deCapitalize = function(str) {
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
    @param {Function} callback                              A function to execute in the scope of the jQuery object when the plugin is activated. Used for tacking on additional initialization procedures or behaviors for other plugin functionality.
  */
  CUI.util.plugClass = function(PluginClass, pluginName, callback) {
    pluginName = pluginName || CUI.util.deCapitalize(PluginClass.toString());
    
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
          callback.call(this);
      });
    };

    $.fn[pluginName].Constructor = PluginClass;
  };
}(window.jQuery));
