import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import Button from './src/scripts/Button';
import ButtonLabel from './src/scripts/ButtonLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-button', Button, {extends: 'button'});

Button.Label = ButtonLabel;

export {Button};
