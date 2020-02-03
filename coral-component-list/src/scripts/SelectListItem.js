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
import {transform} from '../../../coral-utils';
import {Icon} from '../../../coral-component-icon';
import checkIcon from '../templates/checkIcon';

const CLASSNAME = '_coral-Menu-item';

/**
 @class Coral.SelectList.Item
 @classdesc A SelectList item component
 @htmltag coral-selectlist-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class SelectListItem extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Templates
    this._elements = {
      // Fetch or create the content zone element
      content: this.querySelector('coral-selectlist-item-content') || document.createElement('coral-selectlist-item-content')
    };
    checkIcon.call(this._elements, {Icon});
  }
  /**
   Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return typeof this._value === 'string' ? this._value : this.textContent.replace(/\s{2,}/g, ' ').trim();
  }
  set value(value) {
    this._value = transform.string(value);
    this._reflectAttribute('value', this._value);
  }
  
  /**
   The content element for the item.
   
   @type {SelectListItemContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-selectlist-item-content',
      insert: function(content) {
        content.classList.add(`${CLASSNAME}Label`);
  
        // Remove content icon before processing content zone
        const checkIcon = this._elements.checkIcon;
        const contentIcon = content.querySelector('coral-icon:not(._coral-Menu-item-icon)');
        if (contentIcon && contentIcon.icon) {
          contentIcon.remove();
          this.icon = contentIcon.icon;
        }
        
        this.insertBefore(content, this.contains(checkIcon) ? checkIcon : null);
      }
    });
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
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this.disabled ? false : this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected);
    
    // Toggle check icon
    this._elements.checkIcon.hidden = !this._selected;
    
    this.trigger('coral-selectlist-item:_selectedchanged');
  }
  
  /**
   Whether this item is disabled.
   
   @type {Boolean}
   @default false
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
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    
    this.selected = this.selected;
  }
  
  get _contentZones() { return {'coral-selectlist-item-content': 'content'}; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'value']);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    this.setAttribute('role', 'option');
  
    // Support cloneNode
    const template = this.querySelector('._coral-SelectList-icon');
    if (template) {
      template.remove();
    }
    
    // Fetch or create the content content zone element
    const content = this._elements.content;
  
    // Move any remaining elements into the content sub-component
    if (!content.parentNode) {
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
  
    // Add template
    this.appendChild(this._elements.checkIcon);
  
    // Assign the content zones, moving them into place in the process
    this.content = content;
  }
}

export default SelectListItem;
