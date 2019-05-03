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

/* eslint-disable-next-line no-empty-function */
const f = () => {};

// Mostly empty functions to avoid breaking code
if (!window.CustomElements) {
  window.CustomElements = {
    flags: {}
  };
  window.CustomElements.upgrade = f;
  window.CustomElements.upgradeAll = f;
  window.CustomElements.instanceof = (el, ins) => el instanceof ins;
  window.CustomElements.upgradeDocumentTree = f;
  window.CustomElements.upgradeSubtree = f;
  window.CustomElements.addModule = f;
  window.CustomElements.initializeModules = f;
  window.CustomElements.takeRecords = f;
  window.CustomElements.takeRecords = f;
  window.CustomElements.watchShadow = f;
}
