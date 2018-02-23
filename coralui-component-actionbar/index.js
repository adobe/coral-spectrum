import '/coralui-externals';
import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';
import ActionBar from './src/scripts/ActionBar';
import ActionBarItem from './src/scripts/ActionBarItem';
import ActionBarPrimary from './src/scripts/ActionBarPrimary';
import ActionBarSecondary from './src/scripts/ActionBarSecondary';
import ActionBarContainer from './src/scripts/ActionBarContainer';

// i18n
commons.extend(strings, {
  'coralui-component-actionbar': translations
});

window.customElements.define('coral-actionbar', ActionBar);
window.customElements.define('coral-actionbar-item', ActionBarItem);
window.customElements.define('coral-actionbar-primary', ActionBarPrimary);
window.customElements.define('coral-actionbar-secondary', ActionBarSecondary);
window.customElements.define('coral-actionbar-container', ActionBarContainer);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.ActionBar = ActionBar;
window.Coral.ActionBar.Item = ActionBarItem;
window.Coral.ActionBar.Primary = ActionBarPrimary;
window.Coral.ActionBar.Secondary = ActionBarSecondary;
window.Coral.ActionBar.Container = ActionBarContainer;

export {ActionBar, ActionBarItem, ActionBarPrimary, ActionBarSecondary, ActionBarContainer};
