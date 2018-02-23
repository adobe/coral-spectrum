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
