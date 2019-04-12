import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Overlay from './src/scripts/Overlay';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-overlay', Overlay);

export {Overlay};
