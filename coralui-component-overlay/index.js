import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import Overlay from './src/scripts/Overlay';

// Expose component on the Coral namespace
window.customElements.define('coral-overlay', Overlay);

export {Overlay};
