import '/coralui-theme-spectrum';
import '/coralui-externals';

import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import Datepicker from './src/scripts/Datepicker';

// i18n
commons.extend(strings, {
  'coralui-component-datepicker': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-datepicker', Datepicker);

export {Datepicker};
