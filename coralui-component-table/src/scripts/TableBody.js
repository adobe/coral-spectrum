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

import {ComponentMixin} from '../../../coralui-mixin-component';
import TableSectionMixin from './TableSectionMixin';
import {getRows} from './TableUtil';

const CLASSNAME = '_coral-Table-body';

/**
 @class Coral.Table.Body
 @classdesc A Table body component
 @htmltag coral-table-body
 @htmlbasetag tbody
 @extends {HTMLTableSectionElement}
 @extends {ComponentMixin}
 @extends {TableSectionMixin}
 */
class TableBody extends TableSectionMixin(ComponentMixin(HTMLTableSectionElement)) {
  /** @ignore */
  constructor() {
    super();
  
    // Init content MO
    this._observer = new MutationObserver(this._handleMutations.bind(this));
  
    this._observer.observe(this, {
      childList: true,
      subtree: true
    });
  }
  
  /** @private */
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      this.trigger('coral-table-body:_contentchanged', {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
    }, this);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    if (getRows([this]).length === 0) {
      this.trigger('coral-table-body:_empty');
    }
  }
  
  /**
   Triggered when the {@link TableBody} content changed.
   
   @typedef {CustomEvent} coral-table-body:_contentchanged
   
   @private
   */
  
  /**
   Triggered when the {@link TableBody} is initialized without rows.
   
   @typedef {CustomEvent} coral-table-body:_empty
   
   @private
   */
}

export default TableBody;
