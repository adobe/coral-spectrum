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

import {build, next, target} from './helpers.build';
import {cloneComponent} from './helpers.cloneComponent';
import {event, mouseEvent} from './helpers.events';
import {keydown, keyup, keypress} from './helpers.key';

import {serializeArray, testFormField} from './helpers.formField';
import {testButton} from './helpers.button';
import {overlay, testSmartOverlay} from './helpers.overlay';

const helpers = {
  build,
  next,
  target,
  cloneComponent,
  event,
  mouseEvent,
  keydown,
  keyup,
  keypress,
  serializeArray,
  testFormField,
  testButton,
  overlay,
  testSmartOverlay
};

export {helpers};
