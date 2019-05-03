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
