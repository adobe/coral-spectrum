/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coralui-mixin-component';
import TableSectionMixin from './TableSectionMixin';
import {transform} from '../../../coralui-utils';

const CLASSNAME = '_coral-Table-head';

/**
 @class Coral.Table.Head
 @classdesc A Table head component
 @htmltag coral-table-head
 @htmlbasetag thead
 @extends {HTMLTableSectionElement}
 @extends {ComponentMixin}
 @extends {TableSectionMixin}
 */
class TableHead extends TableSectionMixin(ComponentMixin(HTMLTableSectionElement)) {
  /** @ignore */
  constructor() {
    super();
  
    // Initialize content MO
    this._observer = new MutationObserver(this._handleMutations.bind(this));
    this._observer.observe(this, {
      childList: true,
      subtree: true
    });
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
  
  /** @private */
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      this.trigger('coral-table-head:_contentchanged', {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
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
