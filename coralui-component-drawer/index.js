import 'coralui-externals';
import Drawer from './src/scripts/Drawer';

window.customElements.define('coral-drawer', Drawer);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Drawer = Drawer;
window.Coral.Drawer.Content = function() {
  return document.createElement('coral-drawer-content');
};

export default Drawer;
