import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import Icon from './src/scripts/Icon';

// Expose component on the Coral namespace
window.customElements.define('coral-icon', Icon);

export {Icon};
