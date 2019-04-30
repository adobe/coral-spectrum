import {commons} from '../../../coral-utils';
import {ComponentMixin} from '../../../coral-mixin-component';
import {ListMixin} from '../../../coral-mixin-list';

const CLASSNAME = '_coral-AnchorList';

/**
 @class Coral.AnchorList
 @classdesc An AnchorList component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-anchorlist
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListMixin}
 */
class AnchorList extends ListMixin(ComponentMixin(HTMLElement)) {
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
    return 'coral-anchorlist-item';
  }
  
  /** @private */
  get _itemBaseTagName() {
    // Used for Collection
    return 'a';
  }
  
  _onItemClick(event) {
    this._trackEvent('click', 'coral-anchorlist-item', event, event.matchedTarget);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default AnchorList;
