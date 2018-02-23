import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import Select from './src/scripts/Select';
import SelectItem from './src/scripts/SelectItem';

// i18n
commons.extend(strings, {
  'coralui-component-select': translations
});

window.customElements.define('coral-select', Select);
window.customElements.define('coral-select-item', SelectItem);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Select = Select;
window.Coral.Select.Item = SelectItem;

export {Select, SelectItem};
