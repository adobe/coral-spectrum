import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Switch from './src/scripts/Switch';
import SwitchLabel from './src/scripts/SwitchLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-switch', Switch);

Switch.Label = SwitchLabel;

export {Switch};
