import {ComponentMixin} from '../../../coral-mixin-component';

import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Slider-item';

/**
 @class Coral.Slider.Item
 @classdesc The Slider item
 @htmltag coral-slider-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class SliderItem extends ComponentMixin(HTMLElement) {
  /**
   The slider's item value.
   This should contain a number formatted as a string (e.g.: "10") or an empty string.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this.getAttribute('value');
  }
  set value(value) {
    this._reflectAttribute('value', transform.string(value));
  }
  
  /**
   The content zone element of the item.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    if (value instanceof HTMLElement) {
      /** @ignore */
      this.innerHTML = value.innerHTML;
    }
  }
  
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default SliderItem;
