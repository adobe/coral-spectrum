import '../coralui-theme-spectrum';
import '../coralui-externals';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-util';
import Popover from './src/scripts/Popover';
import PopoverHeader from './src/scripts/PopoverHeader';
import PopoverContent from './src/scripts/PopoverContent';
import PopoverFooter from './src/scripts/PopoverFooter';
import PopoverSeparator from './src/scripts/PopoverSeparator';

// i18n
commons.extend(strings, {
  'coralui-component-popover': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-popover', Popover);
window.customElements.define('coral-popover-header', PopoverHeader);
window.customElements.define('coral-popover-content', PopoverContent);
window.customElements.define('coral-popover-footer', PopoverFooter);
window.customElements.define('coral-popover-separator', PopoverSeparator);

Popover.Header = PopoverHeader;
Popover.Content = PopoverContent;
Popover.Footer = PopoverFooter;
Popover.Separator = PopoverSeparator;

export {Popover};
