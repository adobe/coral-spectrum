import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';
import Autocomplete from './src/scripts/Autocomplete';
import AutocompleteItem from './src/scripts/AutocompleteItem';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-autocomplete': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-autocomplete-item', AutocompleteItem);
window.customElements.define('coral-autocomplete', Autocomplete);

Autocomplete.Item = AutocompleteItem;

export {Autocomplete};
