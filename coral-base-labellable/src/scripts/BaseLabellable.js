/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 @base BaseLabellable
 @classdesc Accessibility helper for components with label and icon properties
 */
const BaseLabellable = (superClass) => class extends superClass {
  _observeLabel() {
    this._observableLabel = this._observableLabel || this._elements.label || this._elements.content;

    // Listen for mutations
    this._observer = new MutationObserver(this._toggleIconAriaHidden.bind(this));

    // Watch for changes to the content element
    this._observer.observe(this._observableLabel, {
      // Catch changes to childList
      childList: true,
      // Catch changes to textContent
      characterData: true,
      // Monitor any child node
      subtree: true
    });
  }

  // Hides the icon from screen readers to avoid duplicated labels
  _toggleIconAriaHidden() {
    this._renderedLabel = this._renderedLabel || this.label || this.content;

    // toggle aria-hidden if tab is labelled
    if (this._elements.icon) {
      const isLabelled = (this._renderedLabel && this._renderedLabel.textContent.trim().length) ||
        this.getAttribute('aria-label') !== null ||
        this.getAttribute('aria-labelledby') !== null;

      this._elements.icon[isLabelled ? 'setAttribute' : 'removeAttribute']('aria-hidden', 'true');
    }
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['aria-label', 'aria-labelledby']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'aria-label' || name === 'aria-labelledby') {
      this._toggleIconAriaHidden();
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
};

export default BaseLabellable;
