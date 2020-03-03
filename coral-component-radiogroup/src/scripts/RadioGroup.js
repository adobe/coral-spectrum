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
import '../../../coral-component-radio';

/**
 Enumeration for {@link RadioGroup} orientations.
 
 @typedef {Object} RadioGroupOrientationEnum
 
 @property {String} HORIZONTAL
 Horizontal default orientation.
 @property {String} VERTICAL
 Vertical orientation.
 @property {String} LABELS_BELOW
 Renders labels below items.
 */
const orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  LABELS_BELOW: 'labelsbelow',
};

/**
 @class Coral.RadioGroup
 @classdesc A RadioGroup component to group radio fields
 @htmltag coral-radiogroup
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFieldGroup}
 */
class RadioGroup extends BaseFieldGroup(BaseComponent(HTMLElement)) {
  /**
   Orientation of the radio group. See {@link RadioGroupOrientationEnum}.
   
   @type {String}
   @default RadioGroupOrientationEnum.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   */
  get orientation() {
    return super.orientation;
  }
  set orientation(value) {
    super.orientation = value;
  
    this.classList.toggle(`coral-RadioGroup--labelsBelow`, this._orientation === orientation.LABELS_BELOW);
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-radio';
  }
  
  /**
   Returns {@link RadioGroup} orientation options.
   
   @return {RadioGroupEnum}
   */
  static get orientation() { return orientation; }
}

export default RadioGroup;
