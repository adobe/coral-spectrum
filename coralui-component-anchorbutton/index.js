import 'coralui-externals';
import AnchorButton from './src/scripts/AnchorButton';

window.customElements.define('coral-anchorbutton', AnchorButton, {extends: 'a'});

// Expose Button on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.AnchorButton = AnchorButton;
window.Coral.AnchorButton.Label = function() {
  return document.createElement('coral-anchorbutton-label');
};

export default AnchorButton;
