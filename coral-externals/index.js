// polyfills
import './polyfills/element.closest.js';
import './polyfills/element.matches.js';
import './polyfills/element.remove.js';
import './polyfills/classList-partial-shim.js';
import './polyfills/CustomEvent.js';
import Promise from 'promise-polyfill';
import Vent from '@adobe/vent';
// Accessibility
import '@adobe/focus-ring-polyfill';

// @IE Force custom elements polyfill to work with ES5
import './polyfills/forcePolyfill.js';
// Using custom polyfill built from https://github.com/joeldenning/custom-elements/tree/builtin instead.
// customElements.enableCustomizedBuiltins is set to true by default here.
import './polyfills/custom-elements.min.js';

window.Promise = window.Promise || Promise;
window.Vent = window.Vent || Vent;
