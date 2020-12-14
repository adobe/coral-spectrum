/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import ShellOrganization from './ShellOrganization';
import {Icon} from '../../../coral-component-icon';

const CLASSNAME = '_coral-Shell-orgSwitcher-subitem';

/**
 @class Coral.Shell.Suborganization
 @classdesc A Shell Sub organization component
 @htmltag coral-shell-suborganization
 @extends {ShellOrganization}
 */
class ShellSuborganization extends ShellOrganization {
  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Set the icon size
    this._elements.icon.size = Icon.size.SMALL;

    // Be accessible
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', 0);
  }
}

export default ShellSuborganization;
