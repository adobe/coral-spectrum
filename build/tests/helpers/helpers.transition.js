var helpers = helpers || {};

helpers.transitionEnd = function transitionEnd(element, callback) {
  'use strict';

  Coral.commons.transitionEnd(element, function(e) {
    window.setTimeout(function() {
      callback(e);
    }, 16);
  });
};
