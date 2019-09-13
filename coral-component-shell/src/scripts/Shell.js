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
import {Collection} from '../../../coral-collection';

const CLASSNAME = '_coral-Shell';

/**
 @class Coral.Shell
 @classdesc The Shell base component to be used with its family for console like applications. See examples for how to
 integrate all Shell sub components.
 @htmltag coral-shell
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Shell extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-shell-header') || document.createElement('coral-shell-header'),
      content: this.querySelector('coral-shell-content') || document.createElement('coral-shell-content')
    };
  }
  
  /**
   The menu collection.
   
   @type {Collection}
   @readonly
   */
  get menus() {
    // Construct the collection on first request:
    if (!this._menus) {
      this._menus = new Collection({
        host: this,
        itemTagName: 'coral-shell-menu'
      });
    }
    
    return this._menus;
  }
  
  /**
   The shell header zone.
   
   @type {ShellHeader}
   @contentzone
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-shell-header',
      insert: function(header) {
        this.insertBefore(header, this.firstChild);
      }
    });
  }
  
  /**
   The shell content zone.
   
   @type {ShellContent}
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
  
  get _contentZones() {
    return {
      'coral-shell-header': 'header',
      'coral-shell-content': 'content'
    };
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const header = this._elements.header;
    const menus = this.menus.getAll();
    const content = this._elements.content;
  
    // If the the content zone is not provided, we need to make sure that it holds all children
    if (!content.parentNode) {
      // Remove header
      if (header.parentNode) {
        header.parentNode.removeChild(header);
      }
      
      // Remove menus
      this.menus.clear();
      
      // Move the rest into content
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
  
    // Call the content zone insert
    this.header = header;
    menus.forEach((menu) => this.menus.add(menu));
    this.content = content;
  }
}

export default Shell;
