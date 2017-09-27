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

const CLASSNAME = 'coral-Table-headerCell';

/**
 @class Coral.Table.HeaderCell
 @classdesc A Table header cell component
 @htmltag coral-table-headercell
 @htmlbasetag th
 @extends HTMLTableCellElement
 @extends Coral.mixin.component
 */
class TableHeaderCell extends Component(HTMLTableCellElement) {
  constructor() {
    super();
    
    // Templates
    this._elements = {
      content: this.querySelector('coral-table-headercell-content') || document.createElement('coral-table-headercell-content')
    };
  
    // Watch for content changes in sticky header cell
    this._stickyCellObserver = new MutationObserver(this._handleMutations.bind(this));
    this._stickyCellObserver.observe(this._elements.content, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   The header cell's content.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Table.HeaderCell#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-table-headercell-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /** @private */
  _handleMutations() {
    this.trigger('coral-table-headercell:_contentchanged');
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-table-headercell-content': 'content'};}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Fetch or create the content zone element
    const content = this._elements.content;
    
    if (!content.parentNode) {
      // Move component children into the content
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
    
    // Assign the content zone so the insert function will be called
    this.content = content;
  }
  
  /**
   Triggered when the content changed.
   
   @event Coral.Table.HeaderCell#coral-table-headercell:_contentchanged
   
   @param {Object} event Event object
   @private
   */
}

export default TableHeaderCell;
