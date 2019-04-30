import {commons} from '../../../coral-utils';
import {ComponentMixin} from '../../../coral-mixin-component';
import {ListMixin} from '../../../coral-mixin-list';

const CLASSNAME = '_coral-ButtonList';

/**
 @class Coral.ButtonList
 @classdesc A ButtonList component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-buttonlist
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListMixin}
 */
class ButtonList extends ListMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    // Events
    this._delegateEvents(commons.extend(this._events, {
      'click [coral-list-item]': '_onItemClick'
    }));
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-buttonlist-item';
  }
  
  /** @private */
  get _itemBaseTagName() {
    // Used for Collection
    return 'button';
  }
  
  _onItemClick(event) {
    this._trackEvent('click', 'coral-buttonlist-item', event, event.matchedTarget);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ButtonList;
