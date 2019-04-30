import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Card-title';

/**
 @class Coral.Card.Title
 @classdesc A Card title component
 @htmltag coral-card-title
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardTitle extends ComponentMixin(HTMLElement) {
  /**
   The title's content zone.
   
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
    
    this.classList.add(CLASSNAME, 'coral-Heading', 'coral-Heading--4');
  }
}

export default CardTitle;
