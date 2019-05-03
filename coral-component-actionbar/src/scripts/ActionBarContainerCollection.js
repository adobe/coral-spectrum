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

import {SelectableCollection} from '../../../coral-collection';
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
