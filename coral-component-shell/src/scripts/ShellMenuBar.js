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
import {Collection} from '../../../coral-collection';

const CLASSNAME = '_coral-Shell-menubar';

/**
 @class Coral.Shell.MenuBar
 @classdesc A Shell MenuBar component
 @htmltag coral-shell-menubar
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellMenuBar extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this.setAttribute('role', 'list');
    
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-menubar-item'
      });
    }
  
    return this._items;
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
  }
}

export default ShellMenuBar;
