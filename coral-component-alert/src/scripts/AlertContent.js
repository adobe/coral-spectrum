import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Alert-content';

/**
 @class Coral.Alert.Content
 @classdesc The Alert default content
 @htmltag coral-alert-content
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class AlertContent extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default AlertContent;
