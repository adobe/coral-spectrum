import 'coralui-externals';
import Radio from './src/scripts/Radio';

window.customElements.define('coral-radio', Radio);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Radio = Radio;
window.Coral.Radio.Label = function() {
  return document.createElement('coral-radio-label');
};

export default Radio;
