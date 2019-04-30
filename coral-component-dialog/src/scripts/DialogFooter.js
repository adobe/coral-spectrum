import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Dialog-footer';

/**
 @class Coral.Dialog.Footer
 @classdesc The Dialog footer content
 @htmltag coral-dialog-footer
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class DialogFooter extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default DialogFooter;
