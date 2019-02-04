import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';
import NumberInput from './src/scripts/NumberInput';

// i18n
commons.extend(strings, {
  'coralui-component-numberinput': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-numberinput', NumberInput);

export {NumberInput};
