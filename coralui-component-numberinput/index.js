import '../coralui-theme-spectrum';
import '../coralui-externals';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-util';
import NumberInput from './src/scripts/NumberInput';

// i18n
commons.extend(strings, {
  'coralui-component-numberinput': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-numberinput', NumberInput);

export {NumberInput};
