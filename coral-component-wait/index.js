import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Wait from './src/scripts/Wait';

// Expose component on the Coral namespace
window.customElements.define('coral-wait', Wait);

export {Wait};
