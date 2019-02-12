import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import AnchorButton from './src/scripts/AnchorButton';
import AnchorButtonLabel from './src/scripts/AnchorButtonLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-anchorbutton', AnchorButton, {extends: 'a'});

AnchorButton.Label = AnchorButtonLabel;

export {AnchorButton};
