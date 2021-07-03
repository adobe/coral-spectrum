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
 @classdesc A ColorPicker color slider hue component
 @htmltag coral-colorpicker-colorsliderhue
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorSliderHue extends ColorSlider {
  /** @ignore */
  constructor() {
    super();
  }
  
  /** @ignore */ 
  render() {
    super.render();
    this.classList.add(CLASSNAME);
  }

  /** @private */
  _min() {
    return 0;
  }
  
  /** @private */ 
  _max() {
    return 360;
  }
  
  /** @private */ 
  _step() {
    return 1;
  }

  /** @private */ 
  _colorFromValue(value) {
    return new TinyColor({ h: value, s: 1, l: .50, a:1 });
  }  
}
export default ColorSliderHue;