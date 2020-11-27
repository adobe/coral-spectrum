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


import translations from './i18n/translations';
import {strings, commons} from '../coral-utils';
import Popover from './src/scripts/Popover';
import PopoverHeader from './src/scripts/PopoverHeader';
import PopoverContent from './src/scripts/PopoverContent';
import PopoverFooter from './src/scripts/PopoverFooter';
import PopoverSeparator from './src/scripts/PopoverSeparator';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-popover': translations
});

// Expose component on the Coral namespace
commons._define('coral-popover-separator', PopoverSeparator);
commons._define('coral-popover', Popover);

Popover.Header = PopoverHeader;
Popover.Content = PopoverContent;
Popover.Footer = PopoverFooter;
Popover.Separator = PopoverSeparator;

export {Popover};
