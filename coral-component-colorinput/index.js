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

import '../coral-theme-spectrum';

import '../coral-externals';

import Color from './src/scripts/Color';
import ColorInput from './src/scripts/ColorInput';
import ColorInputItem from './src/scripts/ColorInputItem';
import ColorInputSwatches from './src/scripts/ColorInputSwatches';
import ColorInputSwatch from './src/scripts/ColorInputSwatch';
import ColorInputSlider from './src/scripts/ColorInputSlider';
import ColorInputColorProperties from './src/scripts/ColorInputColorProperties';

import translations from './i18n/translations';
import {strings, commons} from '../coral-utils';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-colorinput': translations
});

// Expose component on the Coral namespace
commons._define('coral-colorinput-swatches', ColorInputSwatches);
commons._define('coral-colorinput-swatch', ColorInputSwatch);
commons._define('coral-colorinput-slider', ColorInputSlider);
commons._define('coral-colorinput-colorproperties', ColorInputColorProperties);
commons._define('coral-colorinput-item', ColorInputItem);
commons._define('coral-colorinput', ColorInput);

ColorInput.Item = ColorInputItem;
ColorInput.Swatches = ColorInputSwatches;
ColorInput.Swatch = ColorInputSwatch;
ColorInput.Slider = ColorInputSlider;
ColorInput.ColorProperties = ColorInputColorProperties;

export {Color, ColorInput};
