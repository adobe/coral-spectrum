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

/**
 Enumeration for {@link ColumnView} selection options.

 @typedef {Object} ColumnViewSelectionModeEnum

 @property {String} NONE
 None is default, selection of items does not happen based on click.
 @property {String} SINGLE
 Single selection mode, only one item per column can be selected.
 @property {String} MULTIPLE
 Multiple selection mode, multiple items per column can be selected.
 */
const selectionMode = {
  NONE: 'none',
  SINGLE: 'single',
  MULTIPLE: 'multiple'
};

export default selectionMode;
