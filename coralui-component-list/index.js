import '../coralui-theme-spectrum';
import '../coralui-externals';

import List from './src/scripts/List';
import ListDivider from './src/scripts/ListDivider';
import ListItem from './src/scripts/ListItem';
import ListItemContent from './src/scripts/ListItemContent';
import AnchorList from './src/scripts/AnchorList';
import AnchorListItem from './src/scripts/AnchorListItem';
import ButtonList from './src/scripts/ButtonList';
import ButtonListItem from './src/scripts/ButtonListItem';
import SelectList from './src/scripts/SelectList';
import SelectListGroup from './src/scripts/SelectListGroup';
import SelectListItem from './src/scripts/SelectListItem';
import SelectListItemContent from './src/scripts/SelectListItemContent';

// Expose component on the Coral namespace
window.customElements.define('coral-list', List);
window.customElements.define('coral-list-divider', ListDivider);
window.customElements.define('coral-list-item', ListItem);
window.customElements.define('coral-anchorlist', AnchorList);
window.customElements.define('coral-anchorlist-item', AnchorListItem, {extends: 'a'});
window.customElements.define('coral-buttonlist', ButtonList);
window.customElements.define('coral-buttonlist-item', ButtonListItem, {extends: 'button'});
window.customElements.define('coral-selectlist', SelectList);
window.customElements.define('coral-selectlist-item', SelectListItem);
window.customElements.define('coral-selectlist-item-content', SelectListItemContent);
window.customElements.define('coral-selectlist-group', SelectListGroup);

List.Divider = ListDivider;
List.Item = ListItem;
List.Item.Content = ListItemContent;
AnchorList.Item = AnchorListItem;
ButtonList.Item = ButtonListItem;
SelectList.Group = SelectListGroup;
SelectList.Item = SelectListItem;
SelectList.Item.Content = SelectListItemContent;

export {List, AnchorList, ButtonList, SelectList};
