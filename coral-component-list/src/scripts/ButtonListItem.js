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
import {ListItemMixin} from '../../../coral-mixin-list';

const CLASSNAME = '_coral-ButtonList-item';

/**
 @class Coral.ButtonList.Item
 @classdesc An ButtonList item component
 @htmltag coral-buttonlist-item
 @extends {HTMLButtonElement}
 @extends {ComponentMixin}
 @extends {ListItemMixin}
 */
class ButtonListItem extends ListItemMixin(ComponentMixin(HTMLButtonElement)) {
  /**
   Inherited from {@link ComponentMixin#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      this.content.textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ButtonListItem;
