import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import ButtonGroup from './src/scripts/ButtonGroup';

// Expose component on the Coral namespace
window.customElements.define('coral-buttongroup', ButtonGroup);

export {ButtonGroup};
