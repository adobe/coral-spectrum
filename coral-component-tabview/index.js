import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import TabView from './src/scripts/TabView';

// Expose component on the Coral namespace
window.customElements.define('coral-tabview', TabView);

export {TabView};
