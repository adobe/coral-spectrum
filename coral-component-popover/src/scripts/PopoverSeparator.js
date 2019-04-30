import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAMES = ['coral-Rule', 'coral-Rule--subsection2'];

/**
 @class Coral.Popover.Separator
 @classdesc The Popover separator
 @htmltag coral-popover-separator
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class PopoverSeparator extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(...CLASSNAMES);
  }
}

export default PopoverSeparator;
