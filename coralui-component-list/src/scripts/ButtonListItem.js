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
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ButtonListItem;
