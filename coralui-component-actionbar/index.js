import '../coralui-theme-spectrum';
import '../coralui-externals';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-util';
import ActionBar from './src/scripts/ActionBar';
import ActionBarItem from './src/scripts/ActionBarItem';
import ActionBarPrimary from './src/scripts/ActionBarPrimary';
import ActionBarSecondary from './src/scripts/ActionBarSecondary';
import ActionBarContainer from './src/scripts/ActionBarContainer';

// i18n
commons.extend(strings, {
  'coralui-component-actionbar': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-actionbar', ActionBar);
window.customElements.define('coral-actionbar-item', ActionBarItem);
window.customElements.define('coral-actionbar-primary', ActionBarPrimary);
window.customElements.define('coral-actionbar-secondary', ActionBarSecondary);
window.customElements.define('coral-actionbar-container', ActionBarContainer);

ActionBar.Item = ActionBarItem;
ActionBar.Primary = ActionBarPrimary;
ActionBar.Secondary = ActionBarSecondary;
ActionBar.Container = ActionBarContainer;

export {ActionBar};
