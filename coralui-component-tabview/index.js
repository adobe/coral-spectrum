import '/coralui-externals';
import TabView from './src/scripts/TabView';

window.customElements.define('coral-tabview', TabView);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.TabView = TabView;

export {TabView};
