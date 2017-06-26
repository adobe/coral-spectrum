var helpers = helpers || {};

/**
  Get the element's "visibility," based on the computer value of the display property

  @param {HTMLElement} element  The element to check the visibility of

  @returns {Boolean} Whether the element is visible
*/
helpers.visible = function(element) {
  'use strict';
  if (!element.parentNode) {
    throw new Error('helpers.visible: Cannot reliably check if an element is hidden if it is not in the DOM');
  }

  var style = window.getComputedStyle(element);
  return style.display !== 'none';
};
