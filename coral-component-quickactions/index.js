import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import QuickActions from './src/scripts/QuickActions';
import QuickActionsItem from './src/scripts/QuickActionsItem';
import translations from './i18n/translations.json';
import {strings, commons} from '../coral-utils';

// i18n
commons.extend(strings, {
  'coral-component-quickactions': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-quickactions', QuickActions);
window.customElements.define('coral-quickactions-item', QuickActionsItem);

QuickActions.Item = QuickActionsItem;

export {QuickActions};
