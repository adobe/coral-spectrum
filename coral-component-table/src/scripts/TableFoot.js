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

const CLASSNAME = '_coral-Table-foot';

/**
 @class Coral.Table.Foot
 @classdesc A Table foot component
 @htmltag coral-table-foot
 @htmlbasetag tfoot
 @extends {HTMLTableSectionElement}
 @extends {BaseComponent}
 @extends {BaseTableSection}
 */
class TableFoot extends BaseTableSection(BaseComponent(HTMLTableSectionElement)) {
  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);
  }
}

export default TableFoot;
