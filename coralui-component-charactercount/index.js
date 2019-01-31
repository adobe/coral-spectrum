import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import CharacterCount from './src/scripts/CharacterCount';

// Expose component on the Coral namespace
window.customElements.define('coral-charactercount', CharacterCount);

export {CharacterCount};
