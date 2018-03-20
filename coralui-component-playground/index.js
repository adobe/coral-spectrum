// Import all components
import * as components from '../index';

import Playground from './src/scripts/Playground';
import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-playground', Playground);
window.Coral.Playground = Playground;

for (const component in components) {
  window.Coral[component] = components[component];
}
