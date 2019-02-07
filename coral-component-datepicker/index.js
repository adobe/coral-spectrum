import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';
import Datepicker from './src/scripts/Datepicker';

// i18n
commons.extend(strings, {
  'coral-component-datepicker': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-datepicker', Datepicker);

export {Datepicker};
