var helpers = helpers || {};

before(function() {
  'use strict';
  // Add coral--light to the body
  document.body.classList.add('coral--light');
});

beforeEach(function() {
  'use strict';
  if (helpers.target && helpers.target.parentNode) {
    helpers.target.parentNode.removeChild(helpers.target);
  }

  // Create a target element
  helpers.target = document.createElement('div');
  
  // Expose a DOM parser
  helpers.DOMParser = new DOMParser();

  // Add it to the body
  document.body.appendChild(helpers.target);
});

afterEach(function() {
  'use strict';
  // Empty target
  helpers.target.innerHTML = '';
  // Reset pressed keys
  Coral.keys.reset();
});

/**
  It behaves like {@link Coral.commons.nextFrame} with the difference that the timeout is longer for tests.

  @param {Function} callback
    The callback to execute.
*/
helpers.next = (window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(cb) {'use strict'; return window.setTimeout(cb, 100); }).bind(window);

/**
  Build and return an instance based on the provided markup

  @param {String} markup
    The markup to build the instance from. This should only every contain a single root tag.
*/
helpers.build = function(markup) {
  'use strict';
  
  var instance = helpers.DOMParser.parseFromString(markup, 'text/html').body.firstChild;
  helpers.target.appendChild(instance);
  return instance;

  // // Create a container element and populate it with the markup
  // var div = document.createElement('div');
  // div.innerHTML = markup;
  //
  // // Get the element from the container element
  // var instance = div.children[0];
  //
  // // Add the element to the DOM
  // helpers.target.appendChild(instance);
  //
  // if (typeof callback === 'function') {
  //   // Components are upgraded asynchronously in polyfilled environments
  //   // Wait until components are ready
  //   Coral.commons.ready(helpers.target, function() {
  //     // The sync methods won't be called until the frame after that
  //     // Wait until sync methods have been called
  //     helpers.next(function() {
  //       // Pass the instance along
  //       callback(instance);
  //     });
  //   });
  // }
  //
  // return instance;
};
