import Overlay from './src/scripts/Overlay';
import {trapFocus, returnFocus, focusOnShow, FADETIME} from './src/scripts/enums';
import {mixin} from 'coralui-util';

// @legacy
Overlay.trapFocus = trapFocus;
Overlay.returnFocus = returnFocus;
Overlay.focusOnShow = focusOnShow;
Overlay.FADETIME = FADETIME;

// Expose mixin on Coral namespace
mixin.overlay = Overlay;

export default Overlay;
