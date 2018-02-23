import '/coralui-externals';
import Radio from './src/scripts/Radio';
import RadioLabel from './src/scripts/RadioLabel';

window.customElements.define('coral-radio', Radio);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Radio = Radio;
window.Coral.Radio.Label = RadioLabel;

export {Radio, RadioLabel};
