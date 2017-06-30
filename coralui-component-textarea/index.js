import 'coralui-externals';
import Textarea from './src/scripts/Textarea';

window.customElements.define('coral-textarea', Textarea, {extends: 'textarea'});

// Expose Textarea on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Textarea = Textarea;

export default Textarea;
