import '/coralui-externals';
import Switch from './src/scripts/Switch';
import SwitchLabel from './src/scripts/SwitchLabel';

window.customElements.define('coral-switch', Switch);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Switch = Switch;
window.Coral.Switch.Label = SwitchLabel;

export {Switch, SwitchLabel};
