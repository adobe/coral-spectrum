import '../coralui-theme-spectrum';

import '../coralui-externals';
import '../coralui-compat';

import TabView from './src/scripts/TabView';

// Expose component on the Coral namespace
window.customElements.define('coral-tabview', TabView);

export {TabView};
