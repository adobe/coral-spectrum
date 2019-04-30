import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Alert-footer';

/**
 @class Coral.Alert.Footer
 @classdesc The Alert footer content
 @htmltag coral-alert-footer
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class AlertFooter extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default AlertFooter;
