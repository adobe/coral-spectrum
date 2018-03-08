import '/coralui-theme-spectrum';
import '/coralui-externals';

import translations from './i18n/translations.json';
import {commons, strings} from '/coralui-util';
import Calendar from './src/scripts/Calendar';

// i18n
commons.extend(strings, {
  'coralui-component-calendar': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-calendar', Calendar);

export {Calendar};
