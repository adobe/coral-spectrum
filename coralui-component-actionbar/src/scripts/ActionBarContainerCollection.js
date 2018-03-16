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

import {SelectableCollection} from '/coralui-collection';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';

/**
 @class Coral.ActionBar.Container.Collection
 @classdesc The ActionBar container collection
 @extends {SelectableCollection}
 */
class ActionBarContainerCollection extends SelectableCollection {
  add(item, before) {
    // in the left actionBar container always insert elements before the 'more' button in right actionBar always append
    // at the end
    if (!before && this._host.tagName === 'CORAL-ACTIONBAR-PRIMARY') {
      const moreButton = this._host._elements.moreButton;
      before = this._host.contains(moreButton) ? moreButton : null;
    }
  
    return super.add(item, before);
  }
  
  clear() {
    const items = super.clear();
  
    this._host._itemsInPopover = [];
  
    return items;
  }
  
  _getAllSelectable() {
    const selectableItems = [];
    
    let child = null;
    for (let i = 0; i < this._host.children.length; i++) {
      child = this._host.children[i];
      if (
        !child.hasAttribute('disabled') &&
        !child.hasAttribute('hidden') &&
        !child.hasAttribute('coral-actionbar-offscreen') &&
        child !== this._host._elements.overlay &&
        getFirstSelectableWrappedItem(child)
      ) {
        selectableItems.push(child);
      }
    }
  
    return selectableItems;
  }
  
  _getAllOffScreen() {
    return Array.prototype.slice.call(this._host.querySelectorAll(`${this._itemTagName}[coral-actionbar-offscreen]`));
  }
}

export default ActionBarContainerCollection;
