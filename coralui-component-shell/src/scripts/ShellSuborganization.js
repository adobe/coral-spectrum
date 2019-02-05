/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import ShellOrganization from './ShellOrganization';
import {Icon} from '../../../coralui-component-icon';

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
