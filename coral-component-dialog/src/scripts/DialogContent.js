import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Dialog-content';

/**
 @class Coral.Dialog.Content
 @classdesc The Dialog default content
 @htmltag coral-dialog-content
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class DialogContent extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default DialogContent;
