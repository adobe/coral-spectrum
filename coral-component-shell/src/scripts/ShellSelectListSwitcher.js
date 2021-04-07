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
import {SelectableCollection} from '../../../coral-collection';
import selectListSwitcher from '../templates/selectListSwitcher';
import {SelectList} from '../../../coral-component-list';
import {commons} from '../../../coral-utils';

const CLASSNAMES = ['_coral-Menu', '_coral-Shell-selectListSwitcher'];

/**
 @class Coral.Shell.SelectListSwitcher
 @classdesc A Shell SelectList Switcher component
 @htmltag coral-shell-selectlistswitcher
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSelectListSwitcher extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Template
    this._elements = {};

    selectListSwitcher.call(this._elements);

    this._delegateEvents({
      'coral-selectlist:change':'_onSelectListChange'
    });
  }

  /**
   The item collection.
   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-shell-switcherlist-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
    return this._items;
  }

  _onItemAdded(item) {
    item.id = item.id || commons.getUID();

    let selectListItem = document.createElement('coral-selectlist-item');
    selectListItem.setAttribute("href", item.getAttribute("href"));
    selectListItem.textContent = item.textContent;
    selectListItem.id = item.id + "selectlist-item";

    this._elements.container.items.add(selectListItem);
  }

  _onItemRemoved(item) {
    let selectListItemId = item.id + "selectlist-item";
    let selectListItem = this._elements.container.getElementById(selectItemId);

    this._elements.container.items.remove(selectListItem);
  }

  _onSelectListChange(event) {
     const selectList = event.target;
     const selectListItem = selectList.selectedItem;
     if (selectListItem.hasAttribute("href")) {
      const href = selectListItem.getAttribute("href");
      window.open(href, '_self');
     }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(...CLASSNAMES);
    const container = this.querySelector('._coral-Shell-selectList-container') || this._elements.container;
    // Put the container as first child
    this.insertBefore(container, this.firstChild);
    this.items._startHandlingItems();
  }
}

export default ShellSelectListSwitcher;
