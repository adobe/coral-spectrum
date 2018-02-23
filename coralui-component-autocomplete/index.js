import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import Autocomplete from './src/scripts/Autocomplete';
import AutocompleteItem from './src/scripts/AutocompleteItem';

// i18n
commons.extend(strings, {
  'coralui-component-autocomplete': translations
});

window.customElements.define('coral-autocomplete-item', AutocompleteItem);
window.customElements.define('coral-autocomplete', Autocomplete);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Autocomplete = Autocomplete;
window.Coral.Autocomplete.Item = AutocompleteItem;

export {Autocomplete, AutocompleteItem};
