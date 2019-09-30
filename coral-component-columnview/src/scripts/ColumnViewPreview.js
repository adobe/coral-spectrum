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

const CLASSNAME = '_coral-MillerColumns-item';

/**
 @class Coral.ColumnView.Preview
 @classdesc A ColumnView Preview component
 @htmltag coral-columnview-preview
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColumnViewPreview extends BaseComponent(HTMLElement) {
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
   
   @type {ColumnViewPreviewContent}
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
        content.classList.add('coral-Body--small');
        this.appendChild(content);
      }
    });
  }
  
  get _contentZones() { return {'coral-columnview-preview-content': 'content'}; }
  
  /** @ignore */
  render() {
    super.render();
    
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
