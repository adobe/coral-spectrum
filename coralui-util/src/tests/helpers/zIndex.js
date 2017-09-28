var helpers = helpers || {};

/**
  Get the zIndex of an element

  @param {HTMLElement} element  The element to get the Zindex of

  @returns {Number} The element's zIndex
*/
helpers.zIndex = function(element) {
  'use strict';
  var elZIndex = element.style.zIndex;
  if (elZIndex === '') {
    return -1;
  }
  else {
    return parseFloat(elZIndex);
  }
};
