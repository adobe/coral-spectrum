/**
 * Copyright 2020 Adobe. All rights reserved.
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
import {BaseFieldGroup} from '../../../coral-base-fieldgroup';
import '../../../coral-component-checkbox';

/**
 @class Coral.CheckboxGroup
 @classdesc A CheckboxGroup component to group checkbox fields
 @htmltag coral-checkboxgroup
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFieldGroup}
 */
class CheckboxGroup extends BaseFieldGroup(BaseComponent(HTMLElement)) {
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-checkbox';
  }
  
  /**
   Returns an Array containing the selected field group items.
   
   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected('checked');
  }
}

export default CheckboxGroup;
