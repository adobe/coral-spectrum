/**
 * Copyright 2021 Adobe. All rights reserved.
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
 * Decorator will be used to intercept any call before passing it to actual element.
 * kind of wrapper around each coral component
 * @private
 */
const Decorator = (superClass) => class extends superClass {

  /** @ignore */
  _resumeCallback() {
    super._resumeCallback();
  }

  /** @ignore */
  _suspendCallback() {
    super._suspendCallback();
  }

  /** @ignore */
  connectedCallback() {
    if(!this.isConnected) {
      // component is not connected  do nothing
      return;
    } else if (this._disconnected === false || this._ignoreConnectedCallback === true) {
      // either component is being moved around DOM or callback are ignored, resume suspended component
      // use this hook to only change required state and properties.
      // avoid executing whole connect and disconnect hooks
      this._resumeCallback();
    } else {
      // normal flow
      super.connectedCallback();
    }
  }

  /** @ignore */
  disconnectedCallback() {
    if(!(this._disconnected === false)) {
      // component is already disconnected do nothing
      return;
    } else if(this.isConnected || this._ignoreConnectedCallback === true) {
      // either component is being moved around DOM or callback are ignored, only suspend component.
      // use this hook to only change required state and properties.
      // avoid executing whole connect and disconnect hooks
      this._suspendCallback();
    } else {
      // normal flow
      super.disconnectedCallback();
    }
  }
};

export default Decorator;
