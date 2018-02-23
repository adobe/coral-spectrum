import '/coralui-externals';
import CharacterCount from './src/scripts/CharacterCount';

window.customElements.define('coral-charactercount', CharacterCount);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.CharacterCount = CharacterCount;

export {CharacterCount};
