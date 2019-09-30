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
import {BaseListItem} from '../../../coral-base-list';

const CLASSNAME = '_coral-AnchorList-item';

/**
 @class Coral.AnchorList.Item
 @classdesc An AnchorList item component
 @htmltag coral-anchorlist-item
 @extends {HTMLAnchorElement}
 @extends {BaseComponent}
 @extends {BaseListItem}
 */
class AnchorListItem extends BaseListItem(BaseComponent(HTMLAnchorElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      click: '_onClick'
    });
  }
  
  /**
   Whether this field is disabled or not.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return super.disabled;
  }
  set disabled(value) {
    super.disabled = value;
    
    if (this.disabled) {
      // It's not tabbable anymore
      this.setAttribute('tabindex', '-1');
    }
    else {
      // Now it's tabbable
      this.setAttribute('tabindex', '0');
    }
  }
  
  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.content || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /** @private */
  _onClick(event) {
    // Support disabled property
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
  }
}

export default AnchorListItem;
