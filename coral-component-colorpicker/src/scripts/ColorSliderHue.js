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
import ColorSlider from './ColorSlider';
import { TinyColor } from '@ctrl/tinycolor';

const CLASSNAME = '_coral-ColorPicker-ColorSlider-hue';

/**
 @class Coral.ColorPicker.ColorSliderHue
 @classdesc A ColorPicker color slider hue component to select Hue
 @htmltag coral-colorpicker-colorsliderhue
 @extends {ColorSlider}
 */
class ColorSliderHue extends ColorSlider {
  /** @ignore */
  constructor() {
    super();
    this._min = 0;
    this._max = 360;
    this._step = 1;    
  }

  /** @private */ 
  _updateValue(value) {
    super._updateValue(value);
    this._elements.slider.setAttribute('aria-valuetext', `${this.value}°`);
  }
  
  /** @ignore */ 
  render() {
    super.render();
    this.classList.add(CLASSNAME);
    this._updateValue(this.value);
  }

  /** @private */ 
  _colorFromValue(value) {
    return new TinyColor({ h: value, s: 1, l: .50, a:1 });
  }  
}
export default ColorSliderHue;