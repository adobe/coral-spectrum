import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Wait from './src/scripts/Wait';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-wait', Wait);

export {Wait};
