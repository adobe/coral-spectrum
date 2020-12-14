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
import {transform} from '../../../coral-utils';

/**
 @class Coral.CycleButton.Action
 @classdesc A CycleButton Action component
 @htmltag coral-cyclebutton-action
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class CycleButtonAction extends BaseComponent(HTMLElement) {
  /**
   The Action's icon. See {@link Coral.Icon} for valid icon names.

   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }

  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
  }

  // @compat
  get content() {
    return this;
  }

  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.content || this).textContent.replace(/\s{2,}/g, ' ').trim() || this.icon :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['icon']);
  }

  /** @ignore */
  render() {
    super.render();

    // adds the role to support accessibility
    this.setAttribute('role', 'menuitem');
    this.tabIndex = -1;
  }
}

export default CycleButtonAction;
