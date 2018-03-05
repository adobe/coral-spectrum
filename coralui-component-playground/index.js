// Import all components
import '../index';

import '/coralui-externals';
import Playground from './src/scripts/Playground';
import './src/styles/index.css';

window.customElements.define('coral-playground', Playground);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Playground = Playground;

export {Playground};
