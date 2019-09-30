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
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Shell-solutions';

/**
 @class Coral.Shell.Solutions
 @classdesc A Shell Solutions component
 @htmltag coral-shell-solutions
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSolutions extends BaseComponent(HTMLElement) {
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
        itemTagName: 'coral-shell-solution',
        itemBaseTagName: 'a'
      });
    }
  
    return this._items;
  }
  
  /**
   Whether the solution list is secondary.
   
   @type {Boolean}
   @default false
   @htmlattribute secondary
   @htmlattributereflected
   */
  get secondary() {
    return this._secondary || false;
  }
  set secondary(value) {
    this._secondary = transform.booleanAttr(value);
    this._reflectAttribute('secondary', this._secondary);
  
    this.classList.toggle(`${CLASSNAME}--secondary`, this._secondary);
  }
  
  _sortSolutions() {
    if (this.items.length > 1) {
      const linked = [];
      const nonLinked = [];
      const isSecondary = this.hasAttribute('secondary');
      
      this.items.getAll().forEach((item, i) => {
        // Exclude the first secondary item
        if (!(isSecondary && i === 0)) {
          if (item.hasAttribute('linked')) {
            linked.push(item);
          }
          else {
            nonLinked.push(item);
          }
        }
      });
  
      const alphabeticalSort = (a, b) => {
        const aText = a.textContent.trim().toLowerCase();
        const bText = b.textContent.trim().toLowerCase();
    
        if (aText < bText) {return -1;}
        if (aText > bText) {return 1;}
        return 0;
      };
  
      linked.sort(alphabeticalSort);
      nonLinked.sort(alphabeticalSort);
  
      linked.forEach((item) => {
        this.appendChild(item);
      });
  
      nonLinked.forEach((item) => {
        this.appendChild(item);
      });
    }
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['secondary']); }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    // Sort linked solutions then non linked solutions alphabetically
    this._sortSolutions();
  }
}

export default ShellSolutions;
