import 'coralui-externals';
import List from './src/scripts/List';
import ListItem from './src/scripts/ListItem';
import ListItemContent from './src/scripts/ListItemContent';
import AnchorList from './src/scripts/AnchorList';
import AnchorListItem from './src/scripts/AnchorListItem';
import ButtonList from './src/scripts/ButtonList';
import ButtonListItem from './src/scripts/ButtonListItem';

window.customElements.define('coral-list', List);
window.customElements.define('coral-list-item', ListItem);
window.customElements.define('coral-list-item-content', ListItemContent);
window.customElements.define('coral-anchorlist', AnchorList);
window.customElements.define('coral-anchorlist-item', AnchorListItem, {extends: 'a'});
window.customElements.define('coral-buttonlist', ButtonList);
window.customElements.define('coral-buttonlist-item', ButtonListItem, {extends: 'button'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.List = List;
window.Coral.List.Item = ListItem;
window.Coral.List.Item.Content = ListItemContent;
window.Coral.AnchorList = AnchorList;
window.Coral.AnchorList.Item = AnchorListItem;
window.Coral.ButtonList = ButtonList;
window.Coral.ButtonList.Item = ButtonListItem;

export {
  List,
  ListItem,
  AnchorList,
  AnchorListItem,
  ButtonList,
  ButtonListItem
};
