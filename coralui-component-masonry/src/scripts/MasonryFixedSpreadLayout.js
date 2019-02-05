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

import MasonryColumnLayout from './MasonryColumnLayout';
import {getFirstRowFilledColumns} from './MasonryLayoutUtil';

/**
 Layout with fixed width and evenly spread items. The width of the items is defined with the <code>columnwidth</code>
 attribute.
 
 @example
 <coral-masonry layout="fixed-spread" columnwidth="300">
 
 @class Coral.Masonry.FixedSpreadLayout
 @extends {MasonryColumnLayout}
 */
class MasonryFixedSpreadLayout extends MasonryColumnLayout {
  /** @inheritdoc */
  _writeStyles(items) {
    const columns = this._columns;
    
    // If the first row is not filled, then the items should be aligned left
    this._alignLeft = getFirstRowFilledColumns(columns, items) < columns.length;
    if (!this._alignLeft) {
      const remainingWidth = this._masonryInnerWidth - this._columnWidth * columns.length;
      this._horSpacing = remainingWidth / (columns.length + 1);
    }
    
    super._writeStyles(items);
  }
  
  /** @inheritdoc */
  _getItemWidth(colspan) {
    return this._columnWidth * colspan + this._horSpacing * (colspan - 1);
  }
  
  /** @inheritdoc */
  _getItemLeft(columnIndex) {
    return this._zeroOffsetLeft + this._columnWidth * columnIndex + this._horSpacing * (columnIndex + 1);
  }
}

export default MasonryFixedSpreadLayout;
