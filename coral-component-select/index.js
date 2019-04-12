import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';
import Select from './src/scripts/Select';
import SelectItem from './src/scripts/SelectItem';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-select': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-select', Select);
window.customElements.define('coral-select-item', SelectItem);

Select.Item = SelectItem;

export {Select};
