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

import {SelectableCollection} from '../../../coral-collection';
import {transform, validate} from '../../../coral-utils';

// @compat
const CLASSNAME = 'coral-RadioGroup';

/**
 Enumeration for {@link BaseFieldGroup} orientations.
 
 @typedef {Object} BaseFieldGroupOrientationEnum
 
 @property {String} HORIZONTAL
 Horizontal default orientation.
 @property {String} VERTICAL
 Vertical orientation.
 */
const orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

/**
 @base BaseFieldGroup
 @classdesc The base element for FieldGroup components
 */
const BaseFieldGroup = (superClass) => class extends superClass {
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        itemTagName: this._itemTagName,
        host: this
      });
    }
    
    return this._items;
  }
  
  /**
   Orientation of the field group. See {@link BaseFieldGroupOrientationEnum}.
   
   @type {String}
   @default BaseFieldGroupOrientationEnum.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   */
  get orientation() {
    return this._orientation || orientation.HORIZONTAL;
  }
  set orientation(value) {
    value = transform.string(value).toLowerCase();
    this._orientation = validate.enumeration(this.constructor.orientation)(value) && value || orientation.HORIZONTAL;
    this._reflectAttribute('orientation', this._orientation);
    
    this.classList.toggle(`${CLASSNAME}--vertical`, this._orientation === orientation.VERTICAL);
  }
  
  /**
   Returns the first selected field group item in the Field Group. The value <code>null</code> is returned if no item is
   selected.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getFirstSelected('checked');
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-fieldgroup-item';
  }
  
  /**
   Returns {@link BaseFieldGroup} orientation options.
   
   @return {BaseFieldGroupEnum}
   */
  static get orientation() { return orientation; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['orientation']); }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'group');
    
    // Default reflected attributes
    if (!this._orientation) { this.orientation = orientation.HORIZONTAL; }
  }
};

export default BaseFieldGroup;
