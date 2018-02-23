import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';

import Dialog from './src/scripts/Dialog';
import DialogHeader from './src/scripts/DialogHeader';
import DialogContent from './src/scripts/DialogContent';
import DialogFooter from './src/scripts/DialogFooter';

// i18n
commons.extend(strings, {
  'coralui-component-dialog': translations
});

window.customElements.define('coral-dialog', Dialog);
window.customElements.define('coral-dialog-header', DialogHeader);
window.customElements.define('coral-dialog-content', DialogContent);
window.customElements.define('coral-dialog-footer', DialogFooter);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Dialog = Dialog;
window.Coral.Dialog.Header = DialogHeader;
window.Coral.Dialog.Content = DialogContent;
window.Coral.Dialog.Footer = DialogFooter;

export {Dialog, DialogHeader, DialogContent, DialogFooter};
