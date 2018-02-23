import '/coralui-externals';
import Checkbox from './src/scripts/Checkbox';
import CheckboxLabel from './src/scripts/CheckboxLabel';

window.customElements.define('coral-checkbox', Checkbox);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Checkbox = Checkbox;
window.Coral.Checkbox.Label = CheckboxLabel;

export {Checkbox, CheckboxLabel};
