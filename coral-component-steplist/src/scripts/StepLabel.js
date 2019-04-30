import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Steplist-label';

/**
 @class Coral.Step.Label
 @classdesc A Step Label
 @htmltag coral-step-label
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class StepLabel extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default StepLabel;
