import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';

import Dialog from './src/scripts/Dialog';
import DialogHeader from './src/scripts/DialogHeader';
import DialogContent from './src/scripts/DialogContent';
import DialogFooter from './src/scripts/DialogFooter';

// i18n
commons.extend(strings, {
  'coralui-component-dialog': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-dialog', Dialog);
window.customElements.define('coral-dialog-header', DialogHeader);
window.customElements.define('coral-dialog-content', DialogContent);
window.customElements.define('coral-dialog-footer', DialogFooter);

Dialog.Header = DialogHeader;
Dialog.Content = DialogContent;
Dialog.Footer = DialogFooter;

export {Dialog};
