import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Card-description';

/**
 @class Coral.Card.Description
 @classdesc A Card description component
 @htmltag coral-card-title
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardDescription extends ComponentMixin(HTMLElement) {
  /**
   The description's content zone.
   
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

export default CardDescription;
