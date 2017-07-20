import 'coralui-externals';
import SelectList from './src/scripts/SelectList';
import SelectListItem from './src/scripts/SelectListItem';
import SelectListGroup from './src/scripts/SelectListGroup';

window.customElements.define('coral-selectlist', SelectList);
window.customElements.define('coral-selectlist-item', SelectListItem);
window.customElements.define('coral-selectlist-group', SelectListGroup);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.SelectList = SelectList;
window.Coral.SelectList.Item = SelectListItem;
window.Coral.SelectList.Group = SelectListGroup;

export {SelectList, SelectListItem, SelectListGroup};
