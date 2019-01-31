// Import all components
import * as components from '../index';

import Playground from './src/scripts/Playground';
import './src/styles/index.css';

window.customElements.define('coral-playground', Playground);

// Export all on the Coral namespace
window.Coral = {};
window.Coral.Playground = Playground;
for (const component in components) {
  window.Coral[component] = components[component];
}
