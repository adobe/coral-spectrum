import '/coralui-externals';
import Button from './src/scripts/Button';
import ButtonLabel from './src/scripts/ButtonLabel';

window.customElements.define('coral-button', Button, {extends: 'button'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Button = Button;
window.Coral.Button.Label = ButtonLabel;

export {Button, ButtonLabel};
