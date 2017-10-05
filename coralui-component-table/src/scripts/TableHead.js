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
import {transform} from 'coralui-util';

const CLASSNAME = 'coral-Table-head';

/**
 @class Coral.Table.Head
 @classdesc A Table head component
 @htmltag coral-table-head
 @htmlbasetag thead
 @extends HTMLTableSectionElement
 @extends Coral.mixin.component
 @extends Coral.mixin.tableSection
 */
class TableHead extends TableSection(Component(HTMLTableSectionElement)) {
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
   
   @type {Boolean}
   @default false
   @htmlattribute sticky
   @htmlattributereflected
   @memberof Coral.Table.Head#
   */
  get sticky() {
    return this._sticky || false;
  }
  set sticky(value) {
    this._sticky = transform.booleanAttr(value);
    this._reflectAttribute('sticky', this._sticky);
    
    const self = this;
    // Delay execution for better performance
    window.requestAnimationFrame(() => {
      self.trigger('coral-table-head:_stickychanged');
    });
  }
  
  /** @private */
  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      this.trigger('coral-table-head:_contentchanged', {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
    }, this);
  }
  
  static get observedAttributes() {
    return super.observedAttributes.concat(['sticky']);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
  
  /**
   Triggered when the content changed.
   
   @event Coral.Table.Head#coral-table-head:_contentchanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Head#sticky} changed.
   
   @event Coral.Table.Head#coral-table-head:_stickychanged
   
   @param {Object} event Event object
   @private
   */
}

export default TableHead;
