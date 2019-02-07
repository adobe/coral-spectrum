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
