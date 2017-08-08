import 'coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from 'coralui-util';
import Popover from './src/scripts/Popover';
import PopoverSeparator from './src/scripts/PopoverSeparator';

// i18n
commons.extend(strings, {
  'coralui-component-popover': translations
});

window.customElements.define('coral-popover', Popover);
window.customElements.define('coral-popover-separator', PopoverSeparator);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Popover = Popover;
window.Coral.Popover.Header = function() {
  return document.createElement('coral-popover-header');
};
window.Coral.Popover.Content = function() {
  return document.createElement('coral-popover-content');
};
window.Coral.Popover.Separator = PopoverSeparator;


export {Popover, PopoverSeparator};
