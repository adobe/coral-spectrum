import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import AnchorButton from './src/scripts/AnchorButton';
import AnchorButtonLabel from './src/scripts/AnchorButtonLabel';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-anchorbutton', AnchorButton, {extends: 'a'});

AnchorButton.Label = AnchorButtonLabel;

export {AnchorButton};
