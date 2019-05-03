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

import {ComponentMixin} from '../../../coral-mixin-component';
import '../../../coral-component-button';
import item from '../templates/item';
import {DragAction} from '../../../coral-dragaction';

const CLASSNAME = '_coral-Multifield-item';

/**
 @class Coral.Multifield.Item
 @classdesc A Multifield item component. It can have a pre-filled content different from the Multifield template but
 added items will always be rendered based on the template.
 @htmltag coral-multifield-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class MultifieldItem extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Create or fetch the content zones
      content: this.querySelector('coral-multifield-item-content') || document.createElement('coral-multifield-item-content')
    };
    item.call(this._elements);
  }
  
  /**
   The item content.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-multifield-item-content',
      insert: function(content) {
        // Insert the content zone before the move and remove buttons
        this.insertBefore(content, this.firstChild);
      }
    });
  }
  
  get _contentZones() { return {'coral-multifield-item-content': 'content'}; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // a11y
    this.setAttribute('role', 'listitem');
  
    // Create a fragment
    const fragment = document.createDocumentFragment();
  
    const templateHandleNames = ['move', 'remove'];
    
    // Render the main template
    fragment.appendChild(this._elements.move);
    fragment.appendChild(this._elements.remove);
  
    const content = this._elements.content;
  
    // Remove it so we can process children
    if (content.parentNode) {
      this.removeChild(content);
    }
  
    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        content.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(fragment);
  
    // Assign the content zones, moving them into place in the process
    this.content = content;
  
    // Attach drag events
    const dragAction = new DragAction(this);
    dragAction.axis = 'vertical';
    dragAction.handle = this._elements.move;
  }
}

export default MultifieldItem;
