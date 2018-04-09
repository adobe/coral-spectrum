import '../coralui-theme-spectrum';
import '../coralui-externals';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-util';
import Search from './src/scripts/Search';

// i18n
commons.extend(strings, {
  'coralui-component-search': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-search', Search);

export {Search};
