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

import {BaseComponent} from '../../../coral-base-component';
import {transform} from '../../../coral-utils';
import {SelectList} from '../../../coral-component-list';
import {SelectableCollection} from '../../../coral-collection';

const CLASSNAME = '_coral-Shell-switcherList';

/**
 @class Coral.Shell.SwitcherList
 @classdesc A Shell SwitcherList component
 @htmltag coral-shell-switcherlist
 @extends {HTMLElement}
 @extends {SelectList}
 */
class ShellSwitcherList extends SelectList {

    constructor(){
      super();
      this._delegateEvents({
            'click coral-selectlist-item': '_onItemClick'
      });

    }

    _onItemClick(event) {
       const item = event.matchedTarget;
       if (item.hasAttribute("href")) {
       const href = item.getAttribute("href");
       window.open(href, '_self');
       }
     }

    /** @ignore */
    render() {
      super.render();
      this.classList.add(CLASSNAME);
    }
  }

  export default ShellSwitcherList;
