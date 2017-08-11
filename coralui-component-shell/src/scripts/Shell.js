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

const CLASSNAME = 'coral3-Shell';

/**
 @class Coral.Shell
 @classdesc A Shell component
 @htmltag coral-shell
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Shell extends Component(HTMLElement) {
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
   @memberof Coral.Shell#
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
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-shell-content': 'content'};}
  
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
