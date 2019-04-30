import {ComponentMixin} from '../../../coral-mixin-component';
import {ListItemMixin} from '../../../coral-mixin-list';

/**
 @class Coral.List.Item
 @classdesc A List item component
 @htmltag coral-list-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListItemMixin}
 */
class ListItem extends ListItemMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default ListItem;
