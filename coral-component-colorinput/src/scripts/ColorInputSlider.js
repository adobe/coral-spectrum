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

import {ExtensibleSlider} from '../../../coral-component-slider';
import '../../../coral-component-tooltip';
import sliderBase from '../templates/sliderBase';
import {transform} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const CLASSNAMES = ['_coral-ColorInput-slider', '_coral-Slider--color'];

/**
 @class Coral.ColorInput.Slider
 @classdesc A ColorInput Slider component
 @htmltag coral-colorinput-slider
 @extends {Slider}
 */
const ColorInputSlider = Decorator(class extends ExtensibleSlider {
  /**
   The gradient shown as slider background as space separated values (at least 2 values needed).
   e.g: #ff0000 #ffff00 #00ff00 #00ffff #0000ff #ff00ff #ff0000

   @type {String}
   @default ""
   @htmlattribute gradient
   */
  get gradient() {
    return this._gradient || '';
  }

  set gradient(value) {
    this._gradient = transform.string(value);

    const bar = this._elements.bar;
    const barStyle = bar.style;

    const stops = this.gradient.split(' ');
    const amountStops = stops.length;

    // remove old gradients
    barStyle.backgroundImage = 'none';
    barStyle.filter = '';

    if (amountStops < 2) {
      return;
    }

    let partialGradientStr = '';
    for (let i = 0 ; i < amountStops ; i++) {
      partialGradientStr += `, ${stops[i]} ${Math.abs(i * 100 / (amountStops - 1))}%`;
    }

    barStyle.backgroundImage = `-moz-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-ms-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-o-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-webkit-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `linear-gradient(to right${partialGradientStr})`;
    barStyle.filter = `progid:DXImageTransform.Microsoft.gradient(startColorstr='${stops[0]}', endColorstr='${stops[1]}', gradientType=1)`;
  }

  _moveHandles() {
    const calculatePercent = (value) => (value - this.min) / (this.max - this.min) * 100;
    const labelValue = [];

    // Set the handle position as a percentage based on the stored values
    this._elements.handles.forEach((handle, index) => {
      const percent = calculatePercent(this._values[index]);
      handle.style.left = `${percent}%`;

      labelValue.push(this._getLabel(this._values[index]));
    });

    this._elements.labelValue.textContent = labelValue.length > 1 ? labelValue.join(' - ') : labelValue[0];
  }

  /** @override */
  _getTemplate() {
    return sliderBase;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['gradient']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(...CLASSNAMES);
  }
});

export default ColorInputSlider;
