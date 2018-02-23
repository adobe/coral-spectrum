import '/coralui-externals';
import Drawer from './src/scripts/Drawer';
import DrawerContent from './src/scripts/DrawerContent';

window.customElements.define('coral-drawer', Drawer);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Drawer = Drawer;
window.Coral.Drawer.Content = DrawerContent;

export {Drawer, DrawerContent};
