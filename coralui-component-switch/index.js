import '/coralui-theme-spectrum';
import '/coralui-externals';

import Switch from './src/scripts/Switch';
import SwitchLabel from './src/scripts/SwitchLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-switch', Switch);

Switch.Label = SwitchLabel;

export {Switch};
