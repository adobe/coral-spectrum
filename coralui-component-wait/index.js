import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import Wait from './src/scripts/Wait';

// Expose component on the Coral namespace
window.customElements.define('coral-wait', Wait);

export {Wait};
