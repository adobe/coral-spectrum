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
    for (let columnIndex = 0; columnIndex < this._columns.length; columnIndex++) {
      const column = this._columns[columnIndex];
      let nextItemTop = contentHeight + this._offsetTop;
      
      // Fill gaps by expanding the height of the items
      for (let itemIndex = column.items.length - 1; itemIndex >= 0; itemIndex--) {
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
