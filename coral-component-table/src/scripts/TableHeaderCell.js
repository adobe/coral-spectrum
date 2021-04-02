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
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Table-headerCell';

/**
 @class Coral.Table.HeaderCell
 @classdesc A Table header cell component
 @htmltag coral-table-headercell
 @htmlbasetag th
 @extends {HTMLTableCellElement}
 @extends {BaseComponent}
 */
const TableHeaderCell = Decorator(class extends BaseComponent(HTMLTableCellElement) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {
      content: this.querySelector('coral-table-headercell-content') || document.createElement('coral-table-headercell-content')
    };

    // Watch for content changes in sticky header cell
    this._stickyCellObserver = new MutationObserver(this._handleMutations.bind(this));
    this._stickyCellObserver.observe(this._elements.content, {
      childList: true,
      subtree: true
    });
  }

  /**
   The header cell's content.

   @type {TableHeaderCellContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-table-headercell-content',
      insert: function (content) {
        this.appendChild(content);
      }
    });
  }

  /** @private */
  _handleMutations() {
    this.trigger('coral-table-headercell:_contentchanged');
  }

  get _contentZones() {
    return {'coral-table-headercell-content': 'content'};
  }

  /** @ignore */
  connectedCallback() {
    if (this._skipConnectedCallback()) {
      return;
    }
    super.connectedCallback();
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._skipDisconnectedCallback()) {
      return;
    }
    super.disconnectedCallback();
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Fetch or create the content zone element
    const content = this._elements.content;

    if (!content.parentNode) {
      // Move component children into the content
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }

    // Assign the content zone so the insert function will be called
    this.content = content;
  }

  /**
   Triggered when the {@link TableHeaderCell} content changed.

   @typedef {CustomEvent} coral-table-headercell:_contentchanged

   @private
   */
});

export default TableHeaderCell;
