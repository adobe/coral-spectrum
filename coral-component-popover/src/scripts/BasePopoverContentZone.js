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

/**
 @base BasePopoverContentZone
 @classdesc The base element for popover content zones
 */
const BasePopoverContentZone = (superClass) => class extends superClass {
  _toggleCoachMark(isCoachMark) {
    this.classList.toggle(`_coral-Dialog-${this._type}`, !isCoachMark);
    this.classList.toggle(`_coral-CoachMarkPopover-${this._type}`, isCoachMark);
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['_coachmark']);
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_coachmark') {
      this._toggleCoachMark(value !== null);
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this._toggleCoachMark(this.hasAttribute('_coachmark'));
  }
};

export default BasePopoverContentZone;
