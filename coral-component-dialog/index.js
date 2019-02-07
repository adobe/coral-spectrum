import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';

import Dialog from './src/scripts/Dialog';
import DialogHeader from './src/scripts/DialogHeader';
import DialogContent from './src/scripts/DialogContent';
import DialogFooter from './src/scripts/DialogFooter';

// i18n
commons.extend(strings, {
  'coral-component-dialog': translations
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
