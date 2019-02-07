import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Icon from './src/scripts/Icon';

// Expose component on the Coral namespace
window.customElements.define('coral-icon', Icon);

export {Icon};
