import '../coralui-theme-spectrum';
import '../coralui-externals';

import Textfield from './src/scripts/Textfield';

// Expose component on the Coral namespace
window.customElements.define('coral-textfield', Textfield, {extends: 'input'});

export {Textfield};
