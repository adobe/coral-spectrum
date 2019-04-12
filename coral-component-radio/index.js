import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Radio from './src/scripts/Radio';
import RadioLabel from './src/scripts/RadioLabel';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-radio', Radio);

Radio.Label = RadioLabel;

export {Radio};
