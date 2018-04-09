import '../coralui-theme-spectrum';
import '../coralui-externals';

import Icon from './src/scripts/Icon';

// Expose component on the Coral namespace
window.customElements.define('coral-icon', Icon);

export {Icon};
