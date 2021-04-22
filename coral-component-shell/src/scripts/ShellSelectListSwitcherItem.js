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
 @htmltag coral-shell-selectlistswitcher-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSelectListSwitcherItem extends BaseComponent(HTMLElement) {

/**
   href property of item
   @type {String}
   @htmlattribute href
   @htmlattributereflected
   */
  get href() {
    return this._href;
  }

  set href(value) {
    var href = transform.string(value);
    var update = false;
    if(this._href) {
      update = true;
    }
    this._href = href;
    this._reflectAttribute('href', this._href);
    if(update) {
      this.trigger('coral-shell-selectlistswitcher-item:change');
    }
  }
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['href']);
  }
    /** @ignore */
    render() {
      super.render();
      this.classList.add(CLASSNAME);
    }
  }

  export default ShellSelectListSwitcherItem;
