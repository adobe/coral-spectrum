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

import {commons} from '../../../coral-utils';

/** @ignore */
export default function getFirstSelectableWrappedItem(wrapperItem) {
  // util method to get first selectable item inside a wrapper item
  if (!wrapperItem) {
    return null;
  }

  if (wrapperItem.hasAttribute('coral-actionbar-more')) {
    // more buttons are no 'real' actionbar items => not wrapped
    return wrapperItem;
  }

  let child = null;
  for (let i = 0 ; i < wrapperItem.children.length ; i++) {
    child = wrapperItem.children[i];

    // maybe filter even more elements? (opacity, display='none', position='absolute' ...)
    if (child.offsetParent && (child.matches(commons.FOCUSABLE_ELEMENT_SELECTOR) || child.matches('a:not([href])')) && !child.hasAttribute('disabled')) {
      return child;
    }
  }

  // search at 2nd level, some elements like coral-fileupload has selectable items inside them
  for (let i = 0 ; i < wrapperItem.children.length ; i++) {
    child = wrapperItem.children[i];
    for (let j = 0 ; j < child.children.length ; j++) {
      let subChild = child.children[j];
      // maybe filter even more elements? (opacity, display='none', position='absolute' ...)
      if (subChild.offsetParent && (subChild.matches(commons.FOCUSABLE_ELEMENT_SELECTOR) || child.matches('a:not([href])'))) {
        return subChild;
      }
    }
  }

  return null;
}
