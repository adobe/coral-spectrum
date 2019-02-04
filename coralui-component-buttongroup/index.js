import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import ButtonGroup from './src/scripts/ButtonGroup';

// Expose component on the Coral namespace
window.customElements.define('coral-buttongroup', ButtonGroup);

export {ButtonGroup};
