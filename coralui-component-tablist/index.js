import '/coralui-externals';
import Tab from './src/scripts/Tab';
import TabLabel from './src/scripts/TabLabel';
import TabList from './src/scripts/TabList';

window.customElements.define('coral-tab', Tab);
window.customElements.define('coral-tab-label', TabLabel);
window.customElements.define('coral-tablist', TabList);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tab = Tab;
window.Coral.Tab.Label = TabLabel;
window.Coral.TabList = TabList;

export {Tab, TabLabel, TabList};
