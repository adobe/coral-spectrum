// polyfills
import './polyfills/element.closest.js';
import './polyfills/element.matches.js';
import './polyfills/element.remove.js';
import './polyfills/classList-partial-shim.js';
import './polyfills/CustomEvent.js';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver';
// Accessibility
import '@adobe/focus-ring-polyfill';
// @IE
import Promise from 'promise-polyfill';

// Positioning
import PopperJS from 'popper.js';
// Eventing
import Vent from '@adobe/vent';
// Adobe fonts
import './libs/typekit';

// @IE Force custom elements polyfill to work with ES5
import './polyfills/forcePolyfill.js';
// Using custom polyfill built from https://github.com/joeldenning/custom-elements/tree/builtin instead.
// customElements.enableCustomizedBuiltins is set to true by default here.
import './polyfills/custom-elements.min.js';
// @compat patch document.createElement for custom elements v0 usage
import './polyfills/document.createElement-patch.js';

export {
  Promise,
  Vent,
  PopperJS,
  ResizeObserver
}
