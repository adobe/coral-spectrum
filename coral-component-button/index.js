import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Button from './src/scripts/Button';
import ButtonLabel from './src/scripts/ButtonLabel';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-button', Button, {extends: 'button'});

Button.Label = ButtonLabel;

export {Button};
