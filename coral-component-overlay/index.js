import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Overlay from './src/scripts/Overlay';

// Expose component on the Coral namespace
window.customElements.define('coral-overlay', Overlay);

export {Overlay};
