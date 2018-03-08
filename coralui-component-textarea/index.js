import '/coralui-theme-spectrum';
import '/coralui-externals';

import Textarea from './src/scripts/Textarea';

// Expose component on the Coral namespace
window.customElements.define('coral-textarea', Textarea, {extends: 'textarea'});

export {Textarea};
