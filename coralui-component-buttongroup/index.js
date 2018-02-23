import '/coralui-externals';
import ButtonGroup from './src/scripts/ButtonGroup';

window.customElements.define('coral-buttongroup', ButtonGroup);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.ButtonGroup = ButtonGroup;

export {ButtonGroup};
