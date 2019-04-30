import {ComponentMixin} from '../../../coral-mixin-component';
import {ListItemMixin} from '../../../coral-mixin-list';

const CLASSNAME = '_coral-AnchorList-item';

/**
 @class Coral.AnchorList.Item
 @classdesc An AnchorList item component
 @htmltag coral-anchorlist-item
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 @extends {ListItemMixin}
 */
class AnchorListItem extends ListItemMixin(ComponentMixin(HTMLAnchorElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      click: '_onClick'
    });
  }
  
  /**
   Whether this field is disabled or not.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return super.disabled;
  }
  set disabled(value) {
    super.disabled = value;
    
    if (this.disabled) {
      // It's not tabbable anymore
      this.setAttribute('tabindex', '-1');
    }
    else {
      // Now it's tabbable
      this.setAttribute('tabindex', '0');
    }
  }
  
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
  
  /** @private */
  _onClick(event) {
    // Support disabled property
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default AnchorListItem;
