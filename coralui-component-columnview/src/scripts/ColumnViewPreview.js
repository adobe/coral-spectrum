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

const CLASSNAME = '_coral-MillerColumns-item';

/**
 @class Coral.ColumnView.Preview
 @classdesc A ColumnView Preview component
 @htmltag coral-columnview-preview
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ColumnViewPreview extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Content zone
    this._elements = {
      content: this.querySelector('coral-columnview-preview-content') || document.createElement('coral-columnview-preview-content')
    };
  }
  
  /**
   The content of the Preview.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-columnview-preview-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  get _contentZones() { return {'coral-columnview-preview-content': 'content'}; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const content = this._elements.content;
  
    // when the content zone was not created, we need to make sure that everything is added inside it as a content.
    // this stops the content zone from being voracious
    if (!content.parentNode) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
    
    // Call content zone insert
    this.content = content;
  }
}

export default ColumnViewPreview;
