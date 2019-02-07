import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {commons, strings} from '../coral-utils';
import Calendar from './src/scripts/Calendar';

// i18n
commons.extend(strings, {
  'coral-component-calendar': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-calendar', Calendar);

export {Calendar};
