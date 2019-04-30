import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Card-context';

/**
 @class Coral.Card.Context
 @classdesc A Card context component
 @htmltag coral-card-context
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardContext extends ComponentMixin(HTMLElement) {
  /**
   The context's content zone.
   
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
    
    this.classList.add(CLASSNAME, 'coral-Heading', 'coral-Heading--5');
  }
}

export default CardContext;
