import '/coralui-externals';
import Icon from './src/scripts/Icon';

window.customElements.define('coral-icon', Icon);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Icon = Icon;

export {Icon};
