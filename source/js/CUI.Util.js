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
