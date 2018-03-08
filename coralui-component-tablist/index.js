import '/coralui-externals';
import Tab from './src/scripts/Tab';
import TabLabel from './src/scripts/TabLabel';
import TabList from './src/scripts/TabList';

// Expose component on the Coral namespace
window.customElements.define('coral-tab', Tab);
window.customElements.define('coral-tab-label', TabLabel);
window.customElements.define('coral-tablist', TabList);

Tab.Label = TabLabel;

export {Tab, TabList};
