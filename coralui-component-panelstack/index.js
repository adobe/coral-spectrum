import '/coralui-externals';
import PanelStack from './src/scripts/PanelStack';
import Panel from './src/scripts/Panel';
import PanelContent from './src/scripts/PanelContent';

window.customElements.define('coral-panelstack', PanelStack);
window.customElements.define('coral-panel', Panel);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.PanelStack = PanelStack;
window.Coral.Panel = Panel;
window.Coral.Panel.Content = PanelContent;

export {PanelStack, Panel, PanelContent};
