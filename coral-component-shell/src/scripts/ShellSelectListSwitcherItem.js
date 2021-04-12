/**
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BaseComponent} from '../../../coral-base-component';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Shell-selectlistswitcher-item';

/**
 @class Coral.Shell.SelectListSwitcherItem
 @classdesc A Shell SelectListSwitcherItem component
 @htmltag coral-shell-selectListSwitcher-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSelectListSwitcherItem extends BaseComponent(HTMLElement) {

/**
   Whether a switcherItem is linked or not

   @type {Boolean}
   @default false
   @htmlattribute linked
   @htmlattributereflected
   */
  get linked() {
    return this._linked || false;
  }

  set linked(value) {
    this._linked = transform.booleanAttr(value);
    this._reflectAttribute('linked', this._linked);
  }
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['linked']);
  }
    /** @ignore */
    render() {
      super.render();
      this.classList.add(CLASSNAME);
    }
  }

  export default ShellSelectListSwitcherItem;
