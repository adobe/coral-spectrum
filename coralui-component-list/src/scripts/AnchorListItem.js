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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {ListItemMixin} from '../../../coralui-mixin-list';

const CLASSNAME = '_coral-AnchorList-item';

/**
 @class Coral.AnchorList.Item
 @classdesc An AnchorList item component
 @htmltag coral-anchorlist-item
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 @extends {ListItemMixin}
 */
class AnchorListItem extends ListItemMixin(ComponentMixin(HTMLAnchorElement)) {
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
  
  /** @private */
  _onClick(event) {
    // Support disabled property
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default AnchorListItem;
