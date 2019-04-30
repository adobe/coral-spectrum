import ShellOrganization from './ShellOrganization';
import {Icon} from '../../../coral-component-icon';

const CLASSNAME = `_coral-BasicList-item, _coral-Shell-orgSwitcher-subitem `;

/**
 @class Coral.Shell.Suborganization
 @classdesc A Shell Sub organization component
 @htmltag coral-shell-suborganization
 @extends {ShellOrganization}
 */
class ShellSuborganization extends ShellOrganization {
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    // Has to be first to override padding from ._coral-Shell-orgSwitcher-item
    /** @ignore */
    this.className = CLASSNAME + this.className;
  
    // Set the icon size
    this._elements.icon.size = Icon.size.SMALL;
  
    // Be accessible
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', 0);
  }
}

export default ShellSuborganization;
