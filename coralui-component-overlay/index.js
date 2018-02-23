import '/coralui-externals';
import Overlay from './src/scripts/Overlay';

window.customElements.define('coral-overlay', Overlay);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Overlay = Overlay;

export {Overlay};
