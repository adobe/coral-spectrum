import '/coralui-externals';
import AnchorButton from './src/scripts/AnchorButton';
import AnchorButtonLabel from './src/scripts/AnchorButtonLabel';

window.customElements.define('coral-anchorbutton', AnchorButton, {extends: 'a'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.AnchorButton = AnchorButton;
window.Coral.AnchorButton.Label = AnchorButtonLabel;

export {AnchorButton, AnchorButtonLabel};
