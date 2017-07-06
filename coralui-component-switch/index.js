import 'coralui-externals';
import Switch from './src/scripts/Switch';

window.customElements.define('coral-switch', Switch);

// Expose Switch on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Switch = Switch;

export default Switch;
