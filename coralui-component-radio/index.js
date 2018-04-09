import '../coralui-theme-spectrum';
import '../coralui-externals';

import Radio from './src/scripts/Radio';
import RadioLabel from './src/scripts/RadioLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-radio', Radio);

Radio.Label = RadioLabel;

export {Radio};
