import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-ActionBar-item';

/**
 @class Coral.ActionBar.Item
 @classdesc An ActionBar item component
 @htmltag coral-actionbar-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ActionBarItem extends ComponentMixin(HTMLElement) {
  /**
   Item content element.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ActionBarItem;
