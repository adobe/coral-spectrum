import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Tooltip-label';

/**
 @class Coral.Tooltip.Content
 @classdesc Tooltip's content component
 @htmltag coral-tooltip-content
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class TooltipContent extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default TooltipContent;
