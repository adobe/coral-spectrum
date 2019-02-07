import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import CharacterCount from './src/scripts/CharacterCount';

// Expose component on the Coral namespace
window.customElements.define('coral-charactercount', CharacterCount);

export {CharacterCount};
