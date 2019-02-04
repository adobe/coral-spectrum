import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';
import Search from './src/scripts/Search';

// i18n
commons.extend(strings, {
  'coralui-component-search': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-search', Search);

export {Search};
