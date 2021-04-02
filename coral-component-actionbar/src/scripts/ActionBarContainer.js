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
import BaseActionBarContainer from './BaseActionBarContainer';
import '../../../coral-component-list';

const CLASSNAME = '_coral-ActionBar-container';

/**
 Enumeration for {@link ActionBarContainer} positions.

 @typedef {Object} ActionBarContainerPositionEnum

 @property {String} PRIMARY
 Primary (left) ActionBar container.
 @property {String} SECONDARY
 Secondary (right) ActionBar container.
 @property {String} INVALID
 Invalid ActionBar container.
 */
const position = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  INVALID: 'invalid'
};

/**
 @class Coral.ActionBar.Container
 @classdesc An ActionBar container component
 @htmltag coral-actionbar-container
 @extends {HTMLElement}
 @extends {BaseComponent}

 @deprecated
 */
class ActionBarContainer extends BaseActionBarContainer(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    commons._log('warn', `Coral.ActionBar.Container: coral-actionbar-container has been deprecated.
    Please use coral-actionbar-primary and coral-actionbar-secondary instead`);
  }

  /**
   The container position inside the actionbar.

   @private
   @type {String}
   @readonly
   @default ActionBarContainerPositionEnum.INVALID
   */
  get _position() {
    if (this.parentNode) {
      const containers = this.parentNode.getElementsByTagName('coral-actionbar-container');

      if (containers.length > 0 && containers[0] === this) {
        return position.PRIMARY;
      } else if (containers.length > 1 && containers[1] === this) {
        return position.SECONDARY;
      }
    }

    return position.INVALID;
  }

  /** @ignore */
  _attachMoreButtonToContainer() {
    if (this.parentNode && this.parentNode.secondary === this) {
      this.insertBefore(this._elements.moreButton, this.firstChild);
    } else {
      // add the button to the left/primary contentzone
      this.appendChild(this._elements.moreButton);
    }
  }

  /**
   Returns {@link ActionBarContainer} positions.

   @return {ActionBarContainerPositionEnum}
   */
  static get position() {
    return position;
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

    // Cleanup resize helpers object (cloneNode support)
    const resizeHelpers = this.getElementsByTagName('object');
    for (let i = 0 ; i < resizeHelpers.length ; ++i) {
      const resizeElement = resizeHelpers[i];
      if (resizeElement.parentNode === this) {
        this.removeChild(resizeElement);
      }
    }

    // Cleanup 'More' button
    this._elements.moreButton = this.querySelector('[coral-actionbar-more]');
    if (this._elements.moreButton) {
      this.removeChild(this._elements.moreButton);
    }

    // Cleanup 'More' popover
    this._elements.overlay = this.querySelector('[coral-actionbar-popover]');
    if (this._elements.overlay) {
      this.removeChild(this._elements.overlay);
    }

    // Init 'More' button
    this._elements.moreButton.label.textContent = this.moreButtonText;
    // 'More' button might be moved later in dom when Container is attached to parent
    this.appendChild(this._elements.moreButton);

    // Init 'More' popover
    this._elements.overlay.target = this._elements.moreButton;

    // Insert popover always as firstChild to ensure element order (cloneNode support)
    this.insertBefore(this._elements.overlay, this.firstChild);

    this._attachMoreButtonToContainer();
  }
}

export default ActionBarContainer;
