import {ComponentMixin} from '../../../coral-mixin-component';
import {ListItemMixin} from '../../../coral-mixin-list';

const CLASSNAME = '_coral-ButtonList-item';

/**
 @class Coral.ButtonList.Item
 @classdesc An ButtonList item component
 @htmltag coral-buttonlist-item
 @extends {HTMLButtonElement}
 @extends {ComponentMixin}
 @extends {ListItemMixin}
 */
class ButtonListItem extends ListItemMixin(ComponentMixin(HTMLButtonElement)) {
  /**
   Inherited from {@link ComponentMixin#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.content || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ButtonListItem;
