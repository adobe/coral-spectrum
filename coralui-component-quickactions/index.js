import '../coralui-theme-spectrum';
import '../coralui-externals';

import QuickActions from './src/scripts/QuickActions';
import QuickActionsItem from './src/scripts/QuickActionsItem';
import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-util';

// i18n
commons.extend(strings, {
  'coralui-component-quickactions': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-quickactions', QuickActions);
window.customElements.define('coral-quickactions-item', QuickActionsItem);

QuickActions.Item = QuickActionsItem;

export {QuickActions};
