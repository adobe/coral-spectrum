import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Card-subtitle';

/**
 @class Coral.Card.Subtitle
 @classdesc A Card sub title component
 @htmltag coral-card-subtitle
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardSubtitle extends ComponentMixin(HTMLElement) {
  /**
   The subtitle's content zone.
   
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
    
    this.classList.add(CLASSNAME, 'coral-Body--secondary');
  }
}

export default CardSubtitle;
