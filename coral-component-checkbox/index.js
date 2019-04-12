import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Checkbox from './src/scripts/Checkbox';
import CheckboxLabel from './src/scripts/CheckboxLabel';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-checkbox', Checkbox);

Checkbox.Label = CheckboxLabel;

export {Checkbox};
