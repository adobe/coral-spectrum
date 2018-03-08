import '/coralui-theme-spectrum';
import '/coralui-externals';

import Drawer from './src/scripts/Drawer';
import DrawerContent from './src/scripts/DrawerContent';

// Expose component on the Coral namespace
window.customElements.define('coral-drawer', Drawer);

Drawer.Content = DrawerContent;

export {Drawer};
