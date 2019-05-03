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

import {commons} from '../../../coral-utils';

/**
 @class Coral.Shell.Solutions.Header
 @classdesc Shell's solution sub-cloud name
 @htmltag coral-shell-solutions-header
 @return {HTMLElement}
 
 @deprecated
 */
export default () => {
  commons._log('warn', 'Coral.Shell.Solutions.Header: coral-shell-solutions-header is deprecated.');
  return document.createElement('coral-shell-solutions-header');
};
