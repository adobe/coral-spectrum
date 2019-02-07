import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Textfield from './src/scripts/Textfield';

// Expose component on the Coral namespace
window.customElements.define('coral-textfield', Textfield, {extends: 'input'});

export {Textfield};
