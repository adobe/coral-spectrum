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

import {BaseComponent} from '../../../coral-base-component';
import BaseTableSection from './BaseTableSection';
import {getRows} from './TableUtil';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Table-body';

/**
 @class Coral.Table.Body
 @classdesc A Table body component
 @htmltag coral-table-body
 @htmlbasetag tbody
 @extends {HTMLTableSectionElement}
 @extends {BaseComponent}
 @extends {BaseTableSection}
 */
const TableBody = Decorator(class extends BaseTableSection(BaseComponent(HTMLTableSectionElement)) {
  /** @ignore */
  constructor() {
    super();

    this._toggleObserver(true);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    if (getRows([this]).length === 0) {
      this.trigger('coral-table-body:_empty');
    }
  }

  /**
   Triggered when the {@link TableBody} content changed.

   @typedef {CustomEvent} coral-table-body:_contentchanged

   @private
   */

  /**
   Triggered when the {@link TableBody} is initialized without rows.

   @typedef {CustomEvent} coral-table-body:_empty

   @private
   */
});

export default TableBody;
