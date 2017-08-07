import 'coralui-externals';
import Tooltip from './src/scripts/Tooltip';

window.customElements.define('coral-tooltip', Tooltip);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tooltip = Tooltip;
window.Coral.Tooltip.Content = function() {
  return document.createElement('coral-tooltip-content');
};


export default Tooltip;
