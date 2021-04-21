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

import {divider} from './TableUtil';
import {transform, validate} from '../../../coral-utils';

// Builds a string containing all possible divider classnames. This will be used to remove classnames when the
// divider changes
const ALL_DIVIDER_CLASSES = [];
for (const dividerValue in divider) {
  ALL_DIVIDER_CLASSES.push(`_coral-Table-divider--${divider[dividerValue]}`);
}

/**
 @base BaseTableSection
 @classdesc The base element for table sections
 */
const BaseTableSection = (superClass, tagName) => class extends superClass {
  /** @ignore */
  constructor() {
    super();

    this._tagName = tagName;
  }

  /**
   The table section divider. See {@link TableSectionDividerEnum}.

   @type {String}
   @default TableSectionDividerEnum.ROW
   @htmlattributereflected
   @htmlattribute divider
   */
  get divider() {
    return this._divider || divider.ROW;
  }

  set divider(value) {
    value = transform.string(value).toLowerCase();
    this._divider = validate.enumeration(divider)(value) && value || divider.ROW;
    this._reflectAttribute('divider', this._divider);

    this.classList.remove(...ALL_DIVIDER_CLASSES);
    this.classList.add(`_coral-Table-divider--${this.divider}`);
  }

  _toggleObserver(enable) {
    this._observer = this._observer || new MutationObserver(this._handleMutations.bind(this));

    if (enable) {
      // Initialize content MO
      this._observer.observe(this, {
        childList: true,
        subtree: true
      });
    } else {
      this._observer.disconnect();
    }
  }

  _handleMutations(mutations) {
    mutations.forEach((mutation) => {
      this.trigger(`${this._tagName}:_contentchanged`, {
        addedNodes: mutation.addedNodes,
        removedNodes: mutation.removedNodes
      });
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['divider', '_observe']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_observe') {
      this._toggleObserver(value !== 'off');
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  render() {
    super.render();

    // Default reflected attributes
    if (!this._divider) {
      this.divider = divider.ROW;
    }
  }
};

export default BaseTableSection;
