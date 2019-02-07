import {keys} from '../../../../coral-utils';

// Create a target element
let target = document.createElement('div');

// Add it to the body
document.body.appendChild(target);

before(function() {
  // Add coral--light to the body
  document.body.classList.add('coral--light');
});

afterEach(function() {
  // Empty target
  target.innerHTML = '';
  // Reset pressed keys
  keys.reset();
});

/**
  Shorthand for window.requestAnimationFrame.

  @param {Function} callback
    The callback to execute.
*/
const next = window.requestAnimationFrame.bind(window);

/**
  Build and return an instance ready to be used

  @param {String|HTMLElement} element
    The markup or HTML element to prepare. The markup only contain a single root tag.
*/
const build = function(element) {
  if (element instanceof HTMLElement) {
    // Add the element to the DOM
    return target.appendChild(element);
  }
  else if (typeof element === 'string') {
    // Create a container element and populate it with the markup
    const div = document.createElement('div');
    div.innerHTML = element;
  
    // Get the element from the container element
    const instance = div.children[0];
  
    // Add the element to the DOM
    return target.appendChild(instance);
  }
  
  throw Error('helpers.build requires a string markup or an HTMLElement.');
};

export {build, next, target};
