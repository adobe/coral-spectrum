import '/coralui-externals';
import QuickActions from './src/scripts/QuickActions';
import QuickActionsItem from './src/scripts/QuickActionsItem';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';

// i18n
commons.extend(strings, {
  'coralui-component-quickactions': translations
});

window.customElements.define('coral-quickactions', QuickActions);
window.customElements.define('coral-quickactions-item', QuickActionsItem);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.QuickActions = QuickActions;
window.Coral.QuickActions.Item = QuickActionsItem;

export {QuickActions, QuickActionsItem};
