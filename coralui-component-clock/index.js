import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';
import Clock from './src/scripts/Clock';

// i18n
commons.extend(strings, {
  'coralui-component-clock': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-clock', Clock);

export {Clock};
