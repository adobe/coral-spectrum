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
import BaseColorInputAbstractSubview from './BaseColorInputAbstractSubview';
import Color from './Color';
import '../../../coral-component-button';
import '../../../coral-component-textfield';
import './ColorInputSlider';
import propertiesSubview from '../templates/colorProperties';
import {commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-ColorInput-colorProperties';

/**
 @class Coral.ColorInput.ColorProperties
 @classdesc A ColorInput Color properties component
 @htmltag coral-colorinput-colorproperties
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseColorInputAbstractSubview}
 */
class ColorInputColorProperties extends BaseColorInputAbstractSubview(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    this._delegateEvents(commons.extend(this._events, {
      'change [handle="redSlider"]': '_onRedSliderChange',
      'change [handle="greenSlider"]': '_onGreenSliderChange',
      'change [handle="blueSlider"]': '_onBlueSliderChange',
      'change [handle="alphaSlider"]': '_onAlphaSliderChange',
      'change ._coral-ColorInput-editHex': '_onChangeHex',
      'change ._coral-ColorInput-editRgba': '_onChangeRgba'
    }));

    // Templates
    this._elements = {};
    propertiesSubview.call(this._elements, {commons, i18n});
  }

  /** @ignore */
  _onColorInputChange() {
    const newColor = this._colorinput.valueAsColor;
    const colorPreview = this._elements.colorPreview2;
    let rgba;

    if (!newColor) {
      // update the colorPreview background color, state, and label
      colorPreview.setAttribute('aria-pressed', 'true');
      colorPreview.setAttribute('aria-label', i18n.get('Color not set'));

      // reset Hex value to empty
      this._elements.hexInput.value = '';
    } else {
      rgba = newColor.rgba;

      // update the colorPreview background color, state, and label
      colorPreview.style.backgroundColor = newColor.rgbValue;
      colorPreview.setAttribute('aria-pressed', 'false');
      colorPreview.setAttribute('aria-label', i18n.get('{value}, Color', {
        value: parseFloat(rgba.a) === 1 ? newColor.value : newColor.rgbaValue
      }));

      // update the Hex input value
      this._elements.hexInput.value = newColor.hexValue.substr(1);
    }

    const prefixes = ['red', 'green', 'blue', 'alpha'];
    const prefixesLength = prefixes.length;
    let prefix;
    let abbr;
    let isAlpha;
    let val;

    // update rgba slider and input values
    for (let i = 0 ; i < prefixesLength ; i++) {
      prefix = prefixes[i];
      abbr = prefix.substr(0, 1);
      isAlpha = i === prefixesLength - 1;

      // default slider and input value
      val = isAlpha ? 100 : 127;

      // with new color, get appropriate RGBA value
      if (newColor) {
        if (!rgba) {
          val = '';
        } else if (isAlpha) {
          val = parseInt(rgba[abbr] * 100, 10);
        } else {
          val = rgba[abbr];
        }
      }

      // update the slider and input values
      this._elements[`${prefix}Slider`].value = this._elements[`${prefix}Input`].value = val;
    }

    if (colorPreview === document.activeElement) {
      // force blur and focus on colorButton so that new color or state is announced
      colorPreview.blur();

      // delay focus by 100ms so that screen reader has time to adjust to label with updated color value
      window.setTimeout(() => {
        colorPreview.focus();
      }, 100);
    }
  }

  /** @ignore */
  _onRedSliderChange(event) {
    this._elements.redInput.value = this._elements.redSlider.value;
    this._onChangeRgba(event);
  }

  /** @ignore */
  _onGreenSliderChange(event) {
    this._elements.greenInput.value = this._elements.greenSlider.value;
    this._onChangeRgba(event);
  }

  /** @ignore */
  _onBlueSliderChange(event) {
    this._elements.blueInput.value = this._elements.blueSlider.value;
    this._onChangeRgba(event);
  }

  /** @ignore */
  _onAlphaSliderChange(event) {
    this._elements.alphaInput.value = this._elements.alphaSlider.value;
    this._onChangeRgba(event);
  }

  /** @ignore */
  _onChangeHex(event) {
    event.stopPropagation();

    // Value of hexInput field is without '#'.
    const value = `#${this._elements.hexInput.value}`;
    const color = new Color();
    color.value = value;

    if (color.hex === null) {
      // no valid color value
      this._elements.hexInput.value = '';
      // Save last valid color
      if (this._colorinput.valueAsColor !== null) {
        this.constructor._lastValidColor = this._colorinput.valueAsColor;
      }
      this._colorinput._setActiveColor(null);
    } else {
      this._colorinput._setActiveColor(color);
    }
  }

  /** @ignore */
  _onChangeRgba(event) {
    event.stopPropagation();

    const r = parseInt(this._elements.redInput.value, 10);
    const g = parseInt(this._elements.greenInput.value, 10);
    const b = parseInt(this._elements.blueInput.value, 10);
    const a = parseInt(this._elements.alphaInput.value, 10);

    let colorValid = true;
    if (isNaN(r) || r < 0 || r > 255) {
      colorValid = false;
      this._elements.redInput.value = '';
    }

    if (isNaN(g) || g < 0 || g > 255) {
      colorValid = false;
      this._elements.greenInput.value = '';
    }

    if (isNaN(b) || b < 0 || b > 255) {
      colorValid = false;
      this._elements.blueInput.value = '';
    }

    if (isNaN(a) || a < 0 || a > 100) {
      colorValid = false;
      this._elements.alphaInput.value = '';
    }

    if (colorValid) {
      const color = new Color();
      color.rgba = {
        r: r,
        g: g,
        b: b,
        a: a / 100
      };
      this._colorinput._setActiveColor(color);
    }
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

    // Support cloneNode
    const subview = this.querySelector('._coral-ColorInput-propertiesSubview');
    if (subview) {
      subview.remove();
    }

    this.appendChild(this._elements.propertiesSubview);
  }
}

export default ColorInputColorProperties;
