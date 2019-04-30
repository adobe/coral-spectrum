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
