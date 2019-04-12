import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';
import Clock from './src/scripts/Clock';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-clock': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-clock', Clock);

export {Clock};
