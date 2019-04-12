import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';
import Search from './src/scripts/Search';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-search': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-search', Search);

export {Search};
