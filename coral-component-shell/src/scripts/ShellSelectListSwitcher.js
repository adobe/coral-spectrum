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

const CLASSNAMES = ['_coral-Menu', '_coral-Shell-selectListSwitcher'];

/**
 @class Coral.Shell.SelectListSwitcher
 @classdesc A Shell SelectList Switcher component
 @htmltag coral-shell-selectlistswitcher
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSelectListSwitcher extends SelectList {
  /** @ignore */
  constructor() {
    super();

    // Template
    this._elements = {};
    selectListSwitcher.call(this._elements);
    this._delegateEvents({
        'click coral-shell-switcherlist-item': '_onItemClick'
    });

    // Listen for mutations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];
          if (addedNode.nodeName === 'CORAL-SHELL-SWITCHERLIST-ITEM') {
            this._elements.container.appendChild(addedNode);
          }
        }
      });
    });

    observer.observe(this, {
      // Only care about direct children
      childList: true
    });
  }
  _onItemClick(event) {
     const item = event.matchedTarget;
     if (item.hasAttribute("href")) {
     const href = item.getAttribute("href");
     window.open(href, '_self');
     }
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
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }

    return this._items;
  }


  /** @ignore */
  render() {
    super.render();

    this.classList.add(...CLASSNAMES);
    const container = this.querySelector('._coral-Shell-switcherList-container') || this._elements.container;

    Array.prototype.forEach.call(this.querySelectorAll('coral-shell-switcherlist-item'), (item) => {
      container.appendChild(item);
    });
    // Put the container as first child
    this.insertBefore(container, this.firstChild);
  }
}

export default ShellSelectListSwitcher;
