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
