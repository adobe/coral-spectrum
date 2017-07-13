import 'coralui-externals';
import Button from './src/scripts/Button';

window.customElements.define('coral-button', Button, {extends: 'button'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Button = Button;
window.Coral.Button.Label = function() {
  return document.createElement('coral-button-label');
};

export default Button;
