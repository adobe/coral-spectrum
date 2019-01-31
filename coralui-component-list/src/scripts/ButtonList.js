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

import {commons} from '../../../coralui-utils';
import {ComponentMixin} from '../../../coralui-mixin-component';
import {ListMixin} from '../../../coralui-mixin-list';

const CLASSNAME = '_coral-ButtonList';

/**
 @class Coral.ButtonList
 @classdesc A ButtonList component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-buttonlist
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListMixin}
 */
class ButtonList extends ListMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    // Events
    this._delegateEvents(commons.extend(this._events, {
      'click [coral-list-item]': '_onItemClick'
    }));
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-buttonlist-item';
  }
  
  /** @private */
  get _itemBaseTagName() {
    // Used for Collection
    return 'button';
  }
  
  _onItemClick(event) {
    this._trackEvent('click', 'coral-buttonlist-item', event, event.matchedTarget);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ButtonList;
