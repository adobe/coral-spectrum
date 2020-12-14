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
import {Collection} from '../../../coral-collection';
import solutionSwitcher from '../templates/solutionSwitcher';

const CLASSNAME = '_coral-Shell-solutionSwitcher';

/**
 @class Coral.Shell.SolutionSwitcher
 @classdesc A Shell Solution Switcher component
 @htmltag coral-shell-solutionswitcher
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellSolutionSwitcher extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Template
    this._elements = {};
    solutionSwitcher.call(this._elements);

    // Listen for mutations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];
          // Move non secondary solutions to the container
          if (addedNode.nodeName === 'CORAL-SHELL-SOLUTIONS' && !addedNode.hasAttribute('secondary')) {
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

  /**
   The item collection.

   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-solutions'
      });
    }

    return this._items;
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // force darkest theme
    this.classList.add('coral--darkest');

    const container = this.querySelector('._coral-Shell-solutions-container') || this._elements.container;

    // Remove it so we can process solutions
    if (container.parentNode) {
      container.remove();
    }

    // Move non secondary solutions to the container
    Array.prototype.forEach.call(this.querySelectorAll('coral-shell-solutions:not([secondary])'), (item) => {
      container.appendChild(item);
    });

    // Put the container as first child
    this.insertBefore(container, this.firstChild);
  }
}

export default ShellSolutionSwitcher;
