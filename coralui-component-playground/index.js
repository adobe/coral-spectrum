// Import all components
import '../index';

import '/coralui-theme-spectrum';
import '/coralui-externals';

import Playground from './src/scripts/Playground';
import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-playground', Playground);

export {Playground};
