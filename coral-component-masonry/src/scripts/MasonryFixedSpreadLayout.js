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
