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
import BaseTableSection from './BaseTableSection';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Table-head';

/**
 @class Coral.Table.Head
 @classdesc A Table head component
 @htmltag coral-table-head
 @htmlbasetag thead
 @extends {HTMLTableSectionElement}
 @extends {BaseComponent}
 @extends {BaseTableSection}
 */
class TableHead extends BaseTableSection(BaseComponent(HTMLTableSectionElement)) {
  /** @ignore */
  constructor() {
    super();
  
    this._toggleObserver(true);
  }
  
  /**
   Whether the table head is sticky. The table content becomes automatically scrollable if the table wrapper height
   is smaller than its content.
   Table exposes the <code>coral-table-scroll</code> attribute that allows in sticky mode to define the table
   scrolling container max-height. This is particularly useful if the table contains dynamic content.
   
   @type {Boolean}
   @default false
   @htmlattribute sticky
   @htmlattributereflected
   */
  get sticky() {
    return this._sticky || false;
  }
  set sticky(value) {
    this._sticky = transform.booleanAttr(value);
    this._reflectAttribute('sticky', this._sticky);
    
    // Delay execution for better performance
    window.requestAnimationFrame(() => {
      this.trigger('coral-table-head:_stickychanged');
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['sticky']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
  
  /**
   Triggered when the {@link TableHead} content changed.
 
   @typedef {CustomEvent} coral-table-head:_contentchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableHead#sticky} changed.
 
   @typedef {CustomEvent} coral-table-head:_stickychanged
   
   @private
   */
}

export default TableHead;
