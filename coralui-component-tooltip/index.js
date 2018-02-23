import '/coralui-externals';
import Tooltip from './src/scripts/Tooltip';
import TooltipContent from './src/scripts/TooltipContent';

window.customElements.define('coral-tooltip', Tooltip);
window.customElements.define('coral-tooltip-content', TooltipContent);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tooltip = Tooltip;
window.Coral.Tooltip.Content = TooltipContent;


export {Tooltip, TooltipContent};
