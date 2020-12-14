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

import {Collection} from '../../../coral-collection';

class MultifieldCollection extends Collection {
  add(item, insertBefore) {
    // _container and _itemTagName are the minimum options that need to be provided to automatically handle this function
    if (this._container && this._itemTagName) {
      if (!(item instanceof HTMLElement)) {
        // creates an instance of an item from the object
        item = document.createElement(this._itemTagName).set(item);
      }

      if (!insertBefore) {
        insertBefore = this.last();
        if (insertBefore) {
          // Insert before the last item
          insertBefore = insertBefore.nextElementSibling;
        }
      }

      // inserts the element in the specified container
      this._container.insertBefore(item, insertBefore || this._container.firstChild);

      return item;
    }
  }
}

export default MultifieldCollection;
