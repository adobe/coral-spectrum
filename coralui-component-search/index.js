import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import Search from './src/scripts/Search';

// i18n
commons.extend(strings, {
  'coralui-component-search': translations
});

window.customElements.define('coral-search', Search);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Search = Search;

export {Search};
