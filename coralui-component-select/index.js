import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';
import Select from './src/scripts/Select';
import SelectItem from './src/scripts/SelectItem';

// i18n
commons.extend(strings, {
  'coralui-component-select': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-select', Select);
window.customElements.define('coral-select-item', SelectItem);

Select.Item = SelectItem;

export {Select};
