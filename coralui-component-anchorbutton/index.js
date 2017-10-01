import 'coralui-externals';
import AnchorButton from './src/scripts/AnchorButton';
import AnchorButtonLabel from './src/scripts/AnchorButtonLabel';

window.customElements.define('coral-anchorbutton', AnchorButton, {extends: 'a'});
window.customElements.define('coral-anchorbutton-label', AnchorButtonLabel);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.AnchorButton = AnchorButton;
window.Coral.AnchorButton.Label = AnchorButtonLabel;

export {AnchorButton, AnchorButtonLabel};
