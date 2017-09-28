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
  Shorthand for window.requestAnimationFrame.

  @param {Function} callback
    The callback to execute.
*/
helpers.next = window.requestAnimationFrame.bind(window);

/**
  Build and return an instance ready to be used

  @param {String|HTMLElement} element
    The markup or HTML element to prepare. The markup only contain a single root tag.
*/
helpers.build = function(element) {
  'use strict';
  
  if (element instanceof HTMLElement) {
    // Add the element to the DOM
    return helpers.target.appendChild(element);
  }
  else if (typeof element === 'string') {
    // Create a container element and populate it with the markup
    const div = document.createElement('div');
    div.innerHTML = element;
  
    // Get the element from the container element
    const instance = div.children[0];
  
    // Add the element to the DOM
    return helpers.target.appendChild(instance);
  }
  
  throw Error('helpers.build requires a string markup or an HTMLElement.');
};
