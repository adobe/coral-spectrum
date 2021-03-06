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
import {BaseListItem} from '../../../coral-base-list';
import {Decorator} from '../../../coral-decorator';

/**
 @class Coral.List.Item
 @classdesc A List item component
 @htmltag coral-list-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseListItem}
 */
const ListItem = Decorator(class extends BaseListItem(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Events
    this._delegateEvents(this._events);
  }
});

export default ListItem;
