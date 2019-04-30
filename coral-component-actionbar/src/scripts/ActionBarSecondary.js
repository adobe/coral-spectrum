import {ComponentMixin} from '../../../coral-mixin-component';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import ActionBarContainer from './ActionBarContainerMixin';

const CLASSNAME = '_coral-ActionBar-secondary';

/**
 @class Coral.ActionBar.Secondary
 @classdesc An ActionBar secondary component
 @htmltag coral-actionbar-secondary
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ActionBarSecondary extends ActionBarContainer(ComponentMixin(HTMLElement)) {
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
      
      this.insertBefore(item, this.firstChild.nextSibling);
    }
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    this.insertBefore(this._elements.moreButton, this.firstChild);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarSecondary;
