import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Alert-header';

/**
 @class Coral.Alert.Header
 @classdesc The Alert header content
 @htmltag coral-alert-header
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class AlertHeader extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default AlertHeader;
