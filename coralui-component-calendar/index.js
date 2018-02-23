import '/coralui-externals';
import translations from './i18n/translations.json';
import {commons, strings} from '/coralui-util';
import Calendar from './src/scripts/Calendar';

// i18n
commons.extend(strings, {
  'coralui-component-calendar': translations
});

window.customElements.define('coral-calendar', Calendar);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Calendar = Calendar;

export {Calendar};
