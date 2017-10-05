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

import Component from 'coralui-mixin-component';
import TableSection from './TableSection';
import {getRows} from './TableUtil';

const CLASSNAME = 'coral-Table-body';

/**
 @class Coral.Table.Body
 @classdesc A Table body component
 @htmltag coral-table-body
 @htmlbasetag tbody
 @extends HTMLTableSectionElement
 @extends Coral.mixin.component
 @extends Coral.mixin.tableSection
 */
class TableBody extends TableSection(Component(HTMLTableSectionElement)) {
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
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    if (getRows([this]).length === 0) {
      this.trigger('coral-table-body:_empty');
    }
  }
  
  /**
   Triggered when the content changed.
   
   @event Coral.Table.Body#coral-table-body:_contentchanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when the body is initialized without rows.
   
   @event Coral.Table.Body#coral-table-body:_empty
   
   @param {Object} event Event object
   @private
   */
}

export default TableBody;
