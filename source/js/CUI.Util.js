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

CUI.util.jqueryPluginFromClass = function(widgetName, WidgetClass) {  
  $.fn[widgetName] = function(optionsIn) {
    return this.each(function () {
      var $this = $(this);
      
      // Get instance, if present already
      var instance = $this.data(widgetName);
      
      // Combine defaults, data, options, and element config
      var options = $.extend({}, $this.data(), typeof optionsIn === 'object' && optionsIn, { element: this });
    
      if (!instance)
        $this.data(widgetName, (instance = new WidgetClass(options)));
      
      if (typeof optionsIn === 'string') // Call method
        instance[optionsIn]();
      else if ($.isPlainObject(optionsIn)) // Apply options
        instance.set(optionsIn);
    });
  };

  $.fn[widgetName].Constructor = WidgetClass;
};