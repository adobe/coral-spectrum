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

import MasonryVariableLayout from './MasonryVariableLayout';

/**
 Layout with variable width items which are expanded in their height to fill gaps (which are common with colspan).
 The minimal width of the items is defined with the <code>columnwidth</code> attribute.

 @example
 <coral-masonry layout="dashboard" columnwidth="300">

 @class Coral.Masonry.DashboardLayout
 @extends {MasonryVariableLayout}
 */
class MasonryDashboardLayout extends MasonryVariableLayout {
  /** @inheritdoc */
  _writeItemStyle(item) {
    // Reset height because otherwise getBoundingClientRect() will not return the real height
    this._resetItem(item);
  }

  /** @inheritdoc */
  _postLayout(contentHeight) {
    for (let columnIndex = 0 ; columnIndex < this._columns.length ; columnIndex++) {
      const column = this._columns[columnIndex];
      let nextItemTop = contentHeight + this._offsetTop;

      // Fill gaps by expanding the height of the items
      for (let itemIndex = column.items.length - 1 ; itemIndex >= 0 ; itemIndex--) {
        const item = column.items[itemIndex];
        const layoutData = item._layoutData;
        if (layoutData.columnIndex === columnIndex) {
          const expandedHeight = nextItemTop - layoutData.top - this._verSpacing;
          item.style.height = `${expandedHeight}px`;
        }
        nextItemTop = layoutData.top;
      }
    }
  }

  /** @inheritdoc */
  _resetItem(item) {
    item.style.height = '';
  }
}

export default MasonryDashboardLayout;
