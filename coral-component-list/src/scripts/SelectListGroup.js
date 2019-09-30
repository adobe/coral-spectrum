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
import {SelectableCollection} from '../../../coral-collection';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-SelectList-group';

/**
 @class Coral.SelectList.Group
 @classdesc A SelectList group component
 @htmltag coral-selectlist-group
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class SelectListGroup extends BaseComponent(HTMLElement) {
  /**
   The label of the group. It reflects the <code>label</code> attribute to the DOM.
   
   @type {String}
   @default ""
   @htmlattribute label
   @htmlattributereflected
   */
  get label() {
    return this._label || '';
  }
  set label(value) {
    this._label = transform.string(value);
    this._reflectAttribute('label', this._label);
  
    this.setAttribute('aria-label', this._label);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-selectlist-item'
      });
    }
    return this._items;
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['label']);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    this.setAttribute('role', 'group');
  }
}

export default SelectListGroup;
