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

import {Icon} from '../../../coral-component-icon';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Menu-item';

/**
 @base BaseListItem
 @classdesc The base element for List Item components
 */
const BaseListItem = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {
      // Fetch or create the content zone element
      content: this.querySelector('coral-list-item-content') || document.createElement('coral-list-item-content')
    };
  }
  
  /**
   The content of the help item.
   
   @type {ListItemContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-list-item-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }

  /**
   Whether this item is disabled.
   
   @default false
   @type {Boolean}
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
  
    this.classList.toggle('is-disabled', this._disabled);
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  /**
   The icon to display. See {@link Icon}.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    const el = this._getIconElement();
    return el.icon;
  }
  set icon(value) {
    const el = this._getIconElement();
    if (transform.string(value) === '') {
      el.remove();
    }
    else {
      this.insertBefore(el, this.firstChild);
    }
    
    el.icon = value;
  }
  
  _getIconElement() {
    if (!this._elements.icon) {
      this._elements.icon = this.querySelector('._coral-Menu-item-icon') || new Icon();
      this._elements.icon.size = Icon.size.SMALL;
      this._elements.icon.classList.add('_coral-Menu-item-icon');
    }
    return this._elements.icon;
  }
  
  get _contentZones() { return {'coral-list-item-content': 'content'}; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['disabled', 'icon']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // The attribute that makes different types of list items co-exist
    // This is also used for event delegation
    this.setAttribute('coral-list-item', '');
  
    // Fetch or create the content content zone element
    const content = this._elements.content;
  
    // This stops the content zone from being voracious
    if (!content.parentNode) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
  
    // Assign the content zones, moving them into place in the process
    this.icon = this.icon;
    this.content = content;
  }
};

export default BaseListItem;
