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
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import ActionBarContainer from './BaseActionBarContainer';

const CLASSNAME = '_coral-ActionBar-secondary';

/**
 @class Coral.ActionBar.Secondary
 @classdesc An ActionBar secondary component
 @htmltag coral-actionbar-secondary
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ActionBarSecondary extends ActionBarContainer(BaseComponent(HTMLElement)) {
  /** @ignore */
  _returnElementsFromPopover() {
    let item = null;
    let wrappedItem = null;
    
    for (let i = 0; i < this._itemsInPopover.length; i++) {
      item = this._itemsInPopover[i];
  
      item.style.visibility = 'hidden';
  
      // remove tabindex again
      wrappedItem = getFirstSelectableWrappedItem(item);
      if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
        wrappedItem.setAttribute('tabindex', -1);
      }
      
      this.insertBefore(item, this.firstChild.nextSibling);
    }
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    this.insertBefore(this._elements.moreButton, this.firstChild);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarSecondary;
