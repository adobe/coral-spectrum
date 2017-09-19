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

import MasonryColumnLayout from './MasonryColumnLayout';

/**
 Layout with variable width items. The minimal width of the items is defined with the <code>columnwidth</code>
 attribute.
 
 @example
 <coral-masonry layout="dashboard" columnwidth="300">
 
 @class Coral.Masonry.VariableLayout
 @extends Coral.Masonry.ColumnLayout
 */
class MasonryVariableLayout extends MasonryColumnLayout {
  constructor(masonry) {
    super(masonry);
  }
  
  /** @inheritdoc */
  _getItemWidth(colspan) {
    return this._masonryAvailableWidth / this._columns.length * colspan - this._horSpacing;
  }
  
  /** @inheritdoc */
  _getItemLeft(columnIndex) {
    return this._offsetLeft + this._masonryAvailableWidth * columnIndex / this._columns.length;
  }
}

export default MasonryVariableLayout;
