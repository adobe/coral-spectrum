import '/coralui-externals';
import Overlay from './src/scripts/Overlay';

// Expose component on the Coral namespace
window.customElements.define('coral-overlay', Overlay);

export {Overlay};
