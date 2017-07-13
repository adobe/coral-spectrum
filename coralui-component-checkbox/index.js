import 'coralui-externals';
import Checkbox from './src/scripts/Checkbox';

window.customElements.define('coral-checkbox', Checkbox);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Checkbox = Checkbox;
window.Coral.Checkbox.Label = function() {
  return document.createElement('coral-checkbox-label');
};

export default Checkbox;
