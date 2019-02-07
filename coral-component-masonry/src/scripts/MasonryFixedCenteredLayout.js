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
 Layout with fixed width centered items. The width of the items is defined with the <code>columnwidth</code>
 attribute.
 
 @example
 <coral-masonry layout="fixed-centered" columnwidth="300">
 
 @class Coral.Masonry.FixedCenteredLayout
 @extends {MasonryColumnLayout}
 */
class MasonryFixedCenteredLayout extends MasonryColumnLayout {
  /** @inheritdoc */
  _writeStyles(items) {
    this._outerColumnWidth = this._columnWidth + this._horSpacing;
    
    // If the first row isn't filled, then the items will be centered
    const filledColumns = getFirstRowFilledColumns(this._columns, items);
    this._offsetLeft += (this._masonryAvailableWidth - filledColumns * this._outerColumnWidth) / 2;
    
    super._writeStyles(items);
  }
  
  /** @inheritdoc */
  _getItemWidth(colspan) {
    return this._columnWidth * colspan + this._horSpacing * (colspan - 1);
  }
  
  /** @inheritdoc */
  _getItemLeft(columnIndex) {
    return this._offsetLeft + this._outerColumnWidth * columnIndex;
  }
}

export default MasonryFixedCenteredLayout;
