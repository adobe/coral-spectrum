import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import CharacterCount from './src/scripts/CharacterCount';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-charactercount', CharacterCount);

export {CharacterCount};
