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
import '../coral-compat';

import ColorPicker from './src/scripts/ColorPicker';
import ColorProperties from './src/scripts/ColorProperties';
import colorArea from  './src/scripts/ColorArea';
import ColorSliderHue from  './src/scripts/ColorSliderHue';
import ColorHandle from  './src/scripts/ColorHandle';
import translations from './i18n/translations';
import {strings, commons} from '../coral-utils';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-colorpicker': translations
});

// Expose component on the Coral namespace
commons._define('coral-colorpicker', ColorPicker);
commons._define('coral-colorpicker-colorproperties', ColorProperties);
commons._define('coral-colorpicker-colorarea', colorArea);
commons._define('coral-colorpicker-colorsliderhue', ColorSliderHue);
commons._define('coral-colorpicker-colorhandle', ColorHandle);

ColorPicker.ColorProperties = ColorProperties;
ColorPicker.ColorHandle = ColorHandle;
ColorPicker.colorArea = colorArea;
ColorPicker.ColorSliderHue = ColorSliderHue;

export {ColorPicker};