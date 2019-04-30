import {ComponentMixin} from '../../../coral-mixin-component';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import ActionBarContainer from './ActionBarContainerMixin';

const CLASSNAME = '_coral-ActionBar-primary';

/**
 @class Coral.ActionBar.Primary
 @classdesc An ActionBar primary component
 @htmltag coral-actionbar-primary
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ActionBarPrimary extends ActionBarContainer(ComponentMixin(HTMLElement)) {
  /** @ignore */
  _returnElementsFromPopover() {
    let item = null;
    let wrappedItem = null;
    
    for (let i = 0; i < this._itemsInPopover.length; i++) {
      item = this._itemsInPopover[i];
      
      // remove tabindex again
      wrappedItem = getFirstSelectableWrappedItem(item);
      if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
        wrappedItem.setAttribute('tabindex', -1);
      }
      
      this.insertBefore(item, this._elements.moreButton);
      
      // Reset target
      if (item._button && item._popover) {
        item._popover.target = item._button;
      }
    }
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    // add the button to the left/primary contentzone
    this.appendChild(this._elements.moreButton);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarPrimary;
