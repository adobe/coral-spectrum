import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-BarLoader-label';

/**
 @class Coral.Progress.Label
 @classdesc The Progress label content
 @htmltag coral-progress-label
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ProgressLabel extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default ProgressLabel;
