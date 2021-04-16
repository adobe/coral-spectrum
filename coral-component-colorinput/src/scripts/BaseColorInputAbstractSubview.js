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
 @base BaseColorInputAbstractSubview
 @classdesc An abstract subview class that other subviews should extend.
 */
const BaseColorInputAbstractSubview = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();

    this._events = {
      'click ._coral-ColorInput-preview': '_onPreviewClicked'
    };

    // export a static variable used by all subviews
    this.constructor._lastValidColor = null;
  }

  /** @ignore */
  _onPreviewClicked() {
    if (this._colorinput.valueAsColor !== null) {
      this.constructor._lastValidColor = this._colorinput.valueAsColor;
      this._colorinput._setActiveColor(null);
    } else if (this.constructor._lastValidColor !== null) {
      this._colorinput._setActiveColor(this.constructor._lastValidColor);
    }
  }

  /** @ignore */
  _beforeOverlayOpen() {
    // overwrite callback in subclass if needed
  }

  /** @ignore */
  _onColorInputChange() {
    // overwrite callback in subclass if needed
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    const overlay = this.closest('._coral-ColorInput-overlay');

    if (overlay && overlay._colorinput) {
      // save references to bound callbacks (in order to be able to remove them again from event system)
      this.__beforeOverlayOpen = this._beforeOverlayOpen.bind(this);
      this.__onColorInputChange = this._onColorInputChange.bind(this);

      // cache colorinput if this component is attached to dom
      this._colorinput = overlay._colorinput;
      this._colorinput.on('coral-overlay:beforeopen', this.__beforeOverlayOpen);
      this._colorinput.on('coral-colorinput:_valuechange', this.__onColorInputChange);

      // trigger one change initially
      this._onColorInputChange();
    }
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._colorinput) {
      this._colorinput.off('coral-overlay:beforeopen', this.__beforeOverlayOpen);
      this._colorinput.off('coral-colorinput:_valuechange', this.__onColorInputChange);
    }

    this._colorinput = null;
  }
}

export default BaseColorInputAbstractSubview;
