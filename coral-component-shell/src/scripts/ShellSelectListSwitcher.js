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
  /*function cloneAttributes(element, sourceNode) {
    let attr;
    let attributes = Array.prototype.slice.call(sourceNode.attributes);
    while(attr = attributes.pop()) {
      element.setAttribute(attr.nodeName, attr.nodeValue);
    }
  }*/

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

    // Listen for mutations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];
          if (addedNode.nodeName === 'CORAL-SHELL-SWITCHERLIST-ITEM') {
            var listItem = document.createElement('coral-selectlist-item');
            listItem.setAttribute("href", addedNode.getAttribute("href"));
            listItem.textContent = addedNode.textContent;
            this._elements.container.appendChild(listItem);
          }
        }
      });
    });

    observer.observe(this, {
      // Only care about direct children
      childList: true
    });
  }
  _onSelectListChange(event) {
     const list = event.target;
     const item = list.selectedItem;
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
      var listItem = document.createElement('coral-selectlist-item');
      listItem.setAttribute("href", item.getAttribute("href"));
      listItem.textContent = item.textContent;
      container.appendChild(listItem);
    });
    // Put the container as first child
    this.insertBefore(container, this.firstChild);
  }
}

export default ShellSelectListSwitcher;
