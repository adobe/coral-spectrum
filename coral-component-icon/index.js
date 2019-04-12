import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Icon from './src/scripts/Icon';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-icon', Icon);

export {Icon};
