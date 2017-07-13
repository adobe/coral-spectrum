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
import {ListItem} from 'coralui-mixin-list';

const CLASSNAME = 'coral3-AnchorList-item';

/**
 @class Coral.AnchorList.Item
 @classdesc An AnchorList item component
 @htmltag coral-anchorlist-item
 @extends HTMLAnchorElement
 @extends Coral.mixin.component
 @extends Coral.mixin.list.item
 */
class AnchorListItem extends ListItem(Component(HTMLAnchorElement)) {
  constructor() {
    super();
    
    // Events
    this.on({
      'click': '_onClick'
    });
  }
  
  // JSDoc inherited
  get disabled() {
    return super.disabled;
  }
  set disabled(value) {
    super.disabled = value;
    
    if (this.disabled) {
      // It's not tabbable anymore
      this.tabIndex = -1;
    }
    else {
      // Now it's tabbable
      this.tabIndex = 0;
    }
  }
  
  /** @private */
  _onClick(event) {
    // Support disabled property
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default AnchorListItem;
