import {ComponentMixin} from '../../../coral-mixin-component';
import {ListMixin} from '../../../coral-mixin-list';

/**
 @class Coral.List
 @classdesc A List component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-list
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListMixin}
 */
class List extends ListMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default List;
