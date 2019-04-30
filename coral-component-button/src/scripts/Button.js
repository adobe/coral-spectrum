import {ComponentMixin} from '../../../coral-mixin-component';
import {ButtonMixin} from '../../../coral-mixin-button';

/**
 @class Coral.Button
 @classdesc A Button component containing text and/or an icon.
 @htmltag coral-button
 @htmlbasetag button
 @extends {HTMLButtonElement}
 @extends {ComponentMixin}
 @extends {ButtonMixin}
 */
class Button extends ButtonMixin(ComponentMixin(HTMLButtonElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default Button;
