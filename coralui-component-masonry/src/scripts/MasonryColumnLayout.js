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

import MasonryLayout from './MasonryLayout';
import {setTransition, setTransform, csspx, getPositiveNumberProperty} from './MasonryLayoutUtil';
import {Keys} from '../../../coralui-utils';

/**
 Base class for column-based masonry layouts.
 
 @class Coral.Masonry.ColumnLayout
 @classdesc A Masonry Column layout
 @extends {MasonryLayout}
 */
class MasonryColumnLayout extends MasonryLayout {
  /**
   Takes a {Masonry} instance as argument.
   
   @param {Masonry} masonry
   */
  constructor(masonry) {
    super(masonry);
  
    this._columns = [];
  
    const up = this._moveFocusVertically.bind(this, true);
    const down = this._moveFocusVertically.bind(this, false);
    const left = this._moveFocusHorizontally.bind(this, true);
    const right = this._moveFocusHorizontally.bind(this, false);
    const home = this._moveFocusHomeEnd.bind(this, true);
    const end = this._moveFocusHomeEnd.bind(this, false);
  
    const keys = this._keys = new Keys(masonry, {
      context: this
    });
    keys.on('up', up).on('k', up);
    keys.on('down', down).on('j', down);
    keys.on('left', left).on('h', left);
    keys.on('right', right).on('l', right);
    keys.on('home', home);
    keys.on('end', end);
  }
  
  /**
   Hook to remove layout specific style and data from the item.
   
   @param item
   @private
   */
  // eslint-disable-next-line no-unused-vars
  _resetItem(item) {
    // To override
  }
  
  /**
   Initialize layout variables.
   
   @private
   */
  _init(items) {
    const firstItem = items[0];
    const masonry = this._masonry;
    this._columnWidth = getPositiveNumberProperty(masonry, 'columnWidth', 'columnwidth', 200);
    
    this._zeroOffsetLeft = -csspx(firstItem, 'marginLeft');
    // with padding
    this._masonryInnerWidth = masonry.clientWidth;
    
    const spacing = this._masonry.spacing;
    if (typeof spacing === 'number') {
      this._horSpacing = spacing;
      this._verSpacing = spacing;
      this._offsetLeft = spacing + this._zeroOffsetLeft;
      this._offsetTop = spacing - csspx(firstItem, 'marginTop');
      this._verPadding = 2 * spacing;
      this._masonryAvailableWidth = masonry.clientWidth - spacing;
    }
    else {
      this._horSpacing = csspx(firstItem, 'marginLeft') + csspx(firstItem, 'marginRight');
      this._verSpacing = csspx(firstItem, 'marginTop') + csspx(firstItem, 'marginBottom');
      this._offsetLeft = csspx(masonry, 'paddingLeft');
      this._offsetTop = csspx(masonry, 'paddingTop');
      this._verPadding = this._offsetTop + this._verSpacing + csspx(masonry, 'paddingBottom');
      this._masonryAvailableWidth = masonry.clientWidth - this._offsetLeft - csspx(masonry, 'paddingRight');
    }
    
    // Initialize column objects
    const columnCount = Math.max(1, Math.floor(this._masonryAvailableWidth / (this._columnWidth + this._horSpacing)));
    this._columns.length = columnCount;
    for (let ci = 0; ci < columnCount; ci++) {
      this._columns[ci] = {
        height: this._offsetTop,
        items: []
      };
    }
    
    // Prepare layout data
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii];
      
      let layoutData = item._layoutData;
      if (!layoutData) {
        item._layoutData = layoutData = {};
      }
      
      // Read colspan
      layoutData.colspan = Math.min(getPositiveNumberProperty(item, 'colspan', 'colspan', 1), this._columns.length);
    }
  }
  
  /**
   Updates the width of all items.
   
   @param items
   @private
   */
  _writeStyles(items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const layoutData = item._layoutData;
      
      // Update width
      const itemWidth = Math.round(this._getItemWidth(layoutData.colspan));
      if (layoutData.width !== itemWidth) {
        item.style.width = `${itemWidth}px`;
        layoutData.width = itemWidth;
      }
      this._writeItemStyle(item);
    }
  }
  
  /**
   @param colspan column span of the item
   @return the width of the item for the given colspan
   @private
   */
  // eslint-disable-next-line no-unused-vars
  _getItemWidth(colspan) {
    // To override
  }
  
  /**
   Hook to execute layout specific item preparation.
   
   @param item
   @private
   */
  // eslint-disable-next-line no-unused-vars
  _writeItemStyle(item) {
    // To override
  }
  
  /**
   Reads the dimension of all items.
   
   @param items
   @private
   */
  _readStyles(items) {
    // Record size of items in a separate loop to avoid unneccessary reflows
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const layoutData = item._layoutData;
      layoutData.height = Math.round(item.getBoundingClientRect().height);
      layoutData.ignored = layoutData.detached || !item.offsetParent;
    }
  }
  
  /**
   Update the position of all items.
   
   @param items
   @private
   */
  _positionItems(items) {
    let j;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const layoutData = item._layoutData;
      // Skip ignored items
      if (layoutData.ignored) {
        continue;
      }
      
      // Search for column with the least height
      const maxLength = this._columns.length - (layoutData.colspan - 1);
      let minColumnIndex = -1;
      let minColumnHeight;
      for (j = 0; j < maxLength; j++) {
        // can be negative if set spacing < item css margin
        let columnHeight = this._offsetTop;
        for (let y = 0; y < layoutData.colspan; y++) {
          columnHeight = Math.max(columnHeight, this._columns[j + y].height);
        }
        if (minColumnIndex === -1 || columnHeight < minColumnHeight) {
          minColumnIndex = j;
          minColumnHeight = columnHeight;
        }
      }
      
      const top = minColumnHeight;
      const left = Math.round(this._getItemLeft(minColumnIndex));
      
      // Check if position has changed
      if (layoutData.left !== left || layoutData.top !== top) {
        layoutData.columnIndex = minColumnIndex;
        layoutData.itemIndex = this._columns[minColumnIndex].items.length;
        layoutData.left = left;
        layoutData.top = top;
        
        setTransform(item, `translate(${left}px, ${top}px)`);
      }
      
      // Remember new column height to position all other items
      const newColumnHeight = top + layoutData.height + this._verSpacing;
      for (j = 0; j < layoutData.colspan; j++) {
        const column = this._columns[minColumnIndex + j];
        column.height = newColumnHeight;
        column.items.push(item);
      }
    }
  }
  
  /**
   @param columnIndex
   @return the left position for the given column index
   @private
   */
  // eslint-disable-next-line no-unused-vars
  _getItemLeft(columnIndex) {
    // To override
  }
  
  /**
   @returns {number} the height of the content (independent of the current gird container height)
   @private
   */
  _getContentHeight() {
    return this._columns.reduce((height, column) => Math.max(height, column.height), 0) - this._offsetTop;
  }
  
  /**
   Hook which is called after the positioning is done.
   
   @param contentHeight
   @private
   */
  // eslint-disable-next-line no-unused-vars
  _postLayout(contentHeight) {
    // To override
  }
  
  /**
   Moves the focus vertically.
   
   @private
   */
  _moveFocusVertically(up, event) {
    const currentLayoutData = event.target._layoutData;
    if (!currentLayoutData) {
      return;
    }
    
    // Choose item above or below
    const nextItemIndex = currentLayoutData.itemIndex + (up ? -1 : 1);
    const nextItem = this._columns[currentLayoutData.columnIndex].items[nextItemIndex];
    
    if (nextItem) {
      nextItem.focus();
      // prevent scrolling at the same time
      event.preventDefault();
    }
  }
  
  /**
   Moves the focus horizontally.
   
   @private
   */
  _moveFocusHorizontally(left, event) {
    const currentLayoutData = event.target._layoutData;
    if (!currentLayoutData) {
      return;
    }
    
    let nextItem;
    
    // Choose item on the left or right which overlaps the most with the current item
    const nextColumnIndex = currentLayoutData.columnIndex + (left ? -1 : currentLayoutData.colspan);
    const nextColumn = this._columns[nextColumnIndex];
    if (nextColumn) {
      const currentItemBottom = currentLayoutData.top + currentLayoutData.height;
      let nextItemOverlap = 0;
      
      // Iterate through all items in the bordering column and look for the item which overlaps the most
      for (let i = 0; i < nextColumn.items.length; i++) {
        const item = nextColumn.items[i];
        const layoutData = item._layoutData;
        const itemBottom = layoutData.top + layoutData.height;
        
        // Check if items overlap
        if (currentLayoutData.top <= itemBottom && currentItemBottom >= layoutData.top) {
          // Calculate the overlapping height
          const itemOverlap = (currentLayoutData.height - Math.max(0, layoutData.top - currentLayoutData.top) -
            // relative overlap with current item
            Math.max(0, currentItemBottom - itemBottom)) / layoutData.height;
          if (itemOverlap > nextItemOverlap) {
            nextItemOverlap = itemOverlap;
            nextItem = item;
          }
        }
        else if (currentLayoutData.top + currentLayoutData.height < layoutData.top) {
          // Item is too far below, stop searching
          break;
        }
      }
    }
    
    if (nextItem) {
      nextItem.focus();
      // prevent scrolling at the same time
      event.preventDefault();
    }
  }
  
  /**
   Moves the focus to first or last item based on the visual order.
   
   @private
   */
  _moveFocusHomeEnd(home, event) {
    const currentLayoutData = event.target._layoutData;
    if (!currentLayoutData) {
      return;
    }
    
    let nextItem;
    const columns = this._columns;
    
    // when home is pressed, we take the first item of the first column
    if (home) {
      nextItem = columns[0] && columns[0].items[0];
    }
    else {
      // when end is pressed, we take the last item of the last column; since some columns are empty, we need to
      // iterate backwards to find the first column that has items
      for (let i = columns.length - 1; i > -1; i--) {
        // since we found a column with items, we take the last item as the next one
        if (columns[i].items.length > 0) {
          nextItem = columns[i].items[columns[i].items.length - 1];
          break;
        }
      }
    }
    
    if (nextItem) {
      nextItem.focus();
      // we prevent the scrolling
      event.preventDefault();
    }
  }
  
  /** @inheritdoc */
  layout(secondTry) {
    const masonry = this._masonry;
    
    const items = masonry.items.getAll();
    if (items.length > 0) {
      // For best possible performance none of these function calls must both read and write attributes in a loop to
      // avoid unnecessary reflows.
      this._init(items);
      this._writeStyles(items);
      this._readStyles(items);
      this._positionItems(items);
    }
    else {
      this._columns.length = 0;
    }
    
    // Update the height of the masonry (otherwise it has a height of 0px due to the absolutely positioned items)
    const contentHeight = this._getContentHeight();
    masonry.style.height = `${contentHeight - this._verSpacing + this._verPadding}px`;
    
    // Check if the masonry has changed its width due to the changed height (can happen because of appearing/disappearing scrollbars)
    if (!secondTry && this._masonryInnerWidth !== masonry.clientWidth) {
      this.layout(true);
    }
    else {
      // Post layout hook for sub classes
      this._postLayout(contentHeight);
    }
  }
  
  /** @inheritdoc */
  destroy() {
    this._keys.destroy();
    
    const items = this._masonry.items.getAll();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item._layoutData = undefined;
      setTransform(item, '');
      this._resetItem(item);
    }
  }
  
  /** @inheritdoc */
  detach(item) {
    item._layoutData.detached = true;
  }
  
  /** @inheritdoc */
  reattach(item) {
    const layoutData = item._layoutData;
    layoutData.detached = false;
    
    const rect = item.getBoundingClientRect();
    // Disable transition while repositioning
    setTransition(item, 'none');
    item.style.left = '';
    item.style.top = '';
    setTransform(item, '');
    
    const nullRect = item.getBoundingClientRect();
    layoutData.left = rect.left - nullRect.left;
    layoutData.top = rect.top - nullRect.top;
    setTransform(item, `translate(${layoutData.left}px, ${layoutData.top}px)`);
    // Enforce position
    item.getBoundingClientRect();
    // Enable transition again
    setTransition(item, '');
  }
  
  /** @inheritdoc */
  itemAt(x, y) {
    // TODO it would be more efficient to pick first the right column
    const items = this._masonry.items.getAll();
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const layoutData = item._layoutData;
      
      if (layoutData && !layoutData.ignored && (
        layoutData.left <= x && layoutData.left + layoutData.width >= x &&
        layoutData.top <= y && layoutData.top + layoutData.height >= y)) {
        
        return item;
      }
    }
    
    return null;
  }
}

export default MasonryColumnLayout;
