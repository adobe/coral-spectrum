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
import '../../../coral-component-icon';
import homeAnchorIcon from '../templates/homeAnchorIcon';

const CLASSNAME = '_coral-Shell-homeAnchor';

/**
 @class Coral.Shell.HomeAnchor
 @classdesc A Shell Home Anchor component
 @htmltag coral-shell-homeanchor
 @htmlbasetag a
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 */
class ShellHomeAnchor extends ComponentMixin(HTMLAnchorElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      label: this.querySelector('coral-shell-homeanchor-label') || document.createElement('coral-shell-homeanchor-label')
    };
  
    // Create icon by default
    homeAnchorIcon.call(this._elements);
  }
  
  /**
   The label of the anchor.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-shell-homeanchor-label',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Specifies the icon name used in the anchor. See {@link Coral.Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }
  set icon(value) {
    this._elements.icon.icon = value;
  
    // removes the icon element from the DOM.
    if (this.icon === '') {
      this._elements.icon.remove();
    }
    // adds the icon back since it was blown away by textContent
    else if (!this.contains(this._elements.icon)) {
      this.insertBefore(this._elements.icon, this.firstChild);
    }
  }
  
  get _contentZones() { return {'coral-shell-homeanchor-label': 'label'}; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['icon']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Create doc fragment
    const fragment = document.createDocumentFragment();
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label.parentNode) {
      this.removeChild(label);
    }
  
    // Move any remaining elements into the label
    while (this.firstChild) {
      const child = this.firstChild;
    
      if (child.nodeType === Node.TEXT_NODE) {
        // Move text elements to the label
        label.appendChild(child);
      }
      else if (child.nodeName === 'CORAL-ICON') {
        if (!fragment.childNodes.length) {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Remove cloned icon
          this.removeChild(child);
        }
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
    
    // Add fragment back
    this.appendChild(fragment);
    
    // Call label insert
    this.label = label;
  }
}

export default ShellHomeAnchor;
