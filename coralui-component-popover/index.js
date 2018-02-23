import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import Popover from './src/scripts/Popover';
import PopoverHeader from './src/scripts/PopoverHeader';
import PopoverContent from './src/scripts/PopoverContent';
import PopoverFooter from './src/scripts/PopoverFooter';
import PopoverSeparator from './src/scripts/PopoverSeparator';

// i18n
commons.extend(strings, {
  'coralui-component-popover': translations
});

window.customElements.define('coral-popover', Popover);
window.customElements.define('coral-popover-header', PopoverHeader);
window.customElements.define('coral-popover-content', PopoverContent);
window.customElements.define('coral-popover-footer', PopoverFooter);
window.customElements.define('coral-popover-separator', PopoverSeparator);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Popover = Popover;
window.Coral.Popover.Header = PopoverHeader;
window.Coral.Popover.Content = PopoverContent;
window.Coral.Popover.Footer = PopoverFooter;
window.Coral.Popover.Separator = PopoverSeparator;


export {Popover, PopoverHeader, PopoverContent, PopoverFooter, PopoverSeparator};
