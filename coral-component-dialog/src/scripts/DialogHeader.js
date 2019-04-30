import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Dialog-title';

/**
 @class Coral.Dialog.Header
 @classdesc The Dialog header content
 @htmltag coral-dialog-header
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class DialogHeader extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    this.setAttribute('role', 'heading');
    this.setAttribute('aria-level', '2');
  }
}

export default DialogHeader;
