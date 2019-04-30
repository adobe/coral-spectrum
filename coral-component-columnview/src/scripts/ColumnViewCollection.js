import {SelectableCollection} from '../../../coral-collection';

/**
 @class Coral.ColumnView.Collection
 @classdesc The ColumnView collection
 @extends {SelectableCollection}
 */
class ColumnViewCollection extends SelectableCollection {
  _deselectAndDeactivateAllExcept(item) {
    this
      .getAll()
      .forEach((el) => {
        if (el.hasAttribute('selected') || el.hasAttribute('active')) {
          el.removeAttribute('selected');
          if (el !== item) {
            el.removeAttribute('active');
          }
        }
      });
  }
  
  _deactivateAll() {
    this._deselectAllExcept(null, 'active');
  }
  
  _deactivateAllExceptFirst() {
    this._deselectAllExceptFirst('active');
  }
  
  _getAllActive() {
    return this._getAllSelected('active');
  }
}

export default ColumnViewCollection;
