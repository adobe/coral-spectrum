var helpers = helpers || {};

/**
  Check the number of CSS classes this element has in a cross-browser compatible fashion

  @param {HTMLElement} element  The element to check

  @returns {Number} The number of CSS classes the element has
*/
helpers.classCount = function(element) {
  'use strict';
  return (element.className.trim() === '') ? 0 : element.className
    .replace(/^\s+|\s+$/g, '') // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Remove double spaces
    .split(' ').length;
};
