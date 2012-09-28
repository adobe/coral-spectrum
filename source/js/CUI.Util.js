/** 
  Utility functions used by CoralUI widgets
   
  @namespace
*/
CUI.util = {};

/**
  Get the data API target via the data attributes of an element
*/
CUI.util.getDataTarget = function($element) {
  var href = $element.attr('href');
  var $target = $($element.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // Strip for ie7
  return $target;
};

CUI.util.deCapitalize = function(str) {
  return str.slice(0,1).toLowerCase()+str.slice(1);
};

CUI.util.capitalize = function(str) {
  return str.slice(0,1).toUpperCase()+str.slice(1);
};

(function($) {
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