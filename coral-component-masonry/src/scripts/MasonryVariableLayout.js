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

/**
 Layout with variable width items. The minimal width of the items is defined with the <code>columnwidth</code>
 attribute.

 @example
 <coral-masonry layout="dashboard" columnwidth="300">

 @class Coral.Masonry.VariableLayout
 @extends {MasonryColumnLayout}
 */
class MasonryVariableLayout extends MasonryColumnLayout {
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
