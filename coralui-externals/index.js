// polyfills
import './polyfills/element.closest.js';
import './polyfills/element.matches.js';
import './polyfills/element.remove.js';
import './polyfills/classList-partial-shim.js';
import './polyfills/requestAnimationFrame.js';
import './polyfills/CustomEvent.js';
import './polyfills/focus-ring.js';
// Positioning
import PopperJS from 'popper.js';
// Eventing
import Vent from '@coralui/vent';
// Adobe fonts
import './libs/typekit.js';
// Promise required to support customElements.when()
import Promise from 'promise-polyfill';

// Force custom elements polyfill to work with ES5 for IE11 support
import './polyfills/forcePolyfill.js';
// Using custom polyfill built from https://github.com/joeldenning/custom-elements/tree/builtin instead.
// customElements.enableCustomizedBuiltins is set to true by default here.
import './polyfills/custom-elements.min.js';
// Patch document.createElement for custom elements v0 usage
import './polyfills/document.createElement-patch.js';

export {
  Promise,
  Vent,
  PopperJS
}
