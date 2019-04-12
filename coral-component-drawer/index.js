import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import Drawer from './src/scripts/Drawer';
import DrawerContent from './src/scripts/DrawerContent';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-drawer', Drawer);

Drawer.Content = DrawerContent;

export {Drawer};
