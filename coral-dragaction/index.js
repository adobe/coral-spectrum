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

import DragAction from './src/scripts/DragAction';

// Apply DragAction on HTML elements with the attribute "coral-dragaction"
document.addEventListener('DOMContentLoaded', function () {
  const elements = document.body.querySelectorAll('[coral-dragaction]');
  for (let i = 0 ; i < elements.length ; i++) {
    new DragAction(elements[i]);
  }
});

export {DragAction};
