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

import '../coral-externals';

// Adobe fonts
import './src/scripts/Typekit';
// Utilities
import commons from './src/scripts/Commons';
import events from './src/scripts/Events';
import {i18n, strings} from './src/scripts/I18nProvider';
import {keys, Keys} from './src/scripts/Keys';
import transform from './src/scripts/Transformation';
import validate from './src/scripts/Validation';
import tracking from './src/scripts/Tracking';

/**
  @private
 
  Utility that holds all mixins.
 */
const mixin = {};

export {
  commons,
  events,
  i18n,
  keys,
  Keys,
  mixin,
  strings,
  transform,
  validate,
  tracking
};
