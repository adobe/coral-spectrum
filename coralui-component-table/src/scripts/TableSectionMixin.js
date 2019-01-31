/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import {divider} from './TableUtil';
import {transform, validate} from '../../../coralui-utils';

// Builds a string containing all possible divider classnames. This will be used to remove classnames when the
// divider changes
const ALL_DIVIDER_CLASSES = [];
for (const dividerValue in divider) {
  ALL_DIVIDER_CLASSES.push(`_coral-Table-divider--${divider[dividerValue]}`);
}

/**
 @mixin TableSectionMixin
 @classdesc The base element for table sections
 */
const TableSectionMixin = (superClass) => class extends superClass {
  /**
   The table section divider. See {@link TableSectionDividerEnum}.
   
   @type {String}
   @default TableSectionDividerEnum.ROW
   @htmlattributereflected
   @htmlattribute divider
   */
  get divider() {
    return this._divider || divider.ROW;
  }
  set divider(value) {
    value = transform.string(value).toLowerCase();
    this._divider = validate.enumeration(divider)(value) && value || divider.ROW;
    this._reflectAttribute('divider', this._divider);
  
    this.classList.remove(...ALL_DIVIDER_CLASSES);
    this.classList.add(`_coral-Table-divider--${this.divider}`);
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['divider']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
  
    // a11y
    this.setAttribute('role', 'rowgroup');
    
    // Default reflected attributes
    if (!this._divider) { this.divider = divider.ROW; }
  }
};

export default TableSectionMixin;
