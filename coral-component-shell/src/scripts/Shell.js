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

import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-Shell';

/**
 @class Coral.Shell
 @classdesc The Shell base component to be used with its family for console like applications. See examples for how to
 integrate all Shell sub components.
 @htmltag coral-shell
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Shell extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      content: this.querySelector('coral-shell-content') || document.createElement('coral-shell-content')
    };
  }
  
  /**
   The outer shell content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-shell-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  get _contentZones() { return {'coral-shell-content': 'content'}; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const content = this._elements.content;
  
    // If the the content zone is not provided, we need to make sure that it holds all children
    if (!content.parentNode) {
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
  
    // Call the content zone insert
    this.content = content;
  }
}

export default Shell;
