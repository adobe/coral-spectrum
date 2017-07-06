import 'coralui-externals';
import Textfield from './src/scripts/Textfield';

window.customElements.define('coral-textfield', Textfield, {extends: 'input'});

// Expose Textfield on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Textfield = Textfield;

export default Textfield;
