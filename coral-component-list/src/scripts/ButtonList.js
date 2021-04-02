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

import {commons} from '../../../coral-utils';
import {BaseComponent} from '../../../coral-base-component';
import {BaseList} from '../../../coral-base-list';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-ButtonList';

/**
 @class Coral.ButtonList
 @classdesc A ButtonList component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-buttonlist
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseList}
 */
const ButtonList = Decorator(class extends BaseList(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Events
    this._delegateEvents(commons.extend(this._events, {
      'click [coral-list-item]': '_onItemClick'
    }));
  }

  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-buttonlist-item';
  }

  /** @private */
  get _itemBaseTagName() {
    // Used for Collection
    return 'button';
  }

  _onItemClick(event) {
    this._trackEvent('click', 'coral-buttonlist-item', event, event.matchedTarget);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);
  }
});

export default ButtonList;
