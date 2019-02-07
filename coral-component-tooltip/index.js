import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Tooltip from './src/scripts/Tooltip';
import TooltipContent from './src/scripts/TooltipContent';

// Expose component on the Coral namespace
window.customElements.define('coral-tooltip', Tooltip);
window.customElements.define('coral-tooltip-content', TooltipContent);

Tooltip.Content = TooltipContent;

export {Tooltip};
