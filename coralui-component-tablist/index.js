import 'coralui-externals';
import Tab from './src/scripts/Tab';
import TabList from './src/scripts/TabList';

window.customElements.define('coral-tab', Tab);
window.customElements.define('coral-tablist', TabList);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tab = Tab;
window.Coral.Tab.Label = function() {
  return document.createElement('coral-tab-label');
};
window.Coral.TabList = TabList;

export {Tab, TabList};
