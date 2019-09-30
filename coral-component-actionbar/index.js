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

import translations from './i18n/translations';
import {strings, commons} from '../coral-utils';
import ActionBar from './src/scripts/ActionBar';
import ActionBarItem from './src/scripts/ActionBarItem';
import ActionBarPrimary from './src/scripts/ActionBarPrimary';
import ActionBarSecondary from './src/scripts/ActionBarSecondary';
import ActionBarContainer from './src/scripts/ActionBarContainer';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-actionbar': translations
});

// Expose component on the Coral namespace
commons._define('coral-actionbar-item', ActionBarItem);
commons._define('coral-actionbar-primary', ActionBarPrimary);
commons._define('coral-actionbar-secondary', ActionBarSecondary);
commons._define('coral-actionbar-container', ActionBarContainer);
commons._define('coral-actionbar', ActionBar);

ActionBar.Item = ActionBarItem;
ActionBar.Primary = ActionBarPrimary;
ActionBar.Secondary = ActionBarSecondary;
ActionBar.Container = ActionBarContainer;

export {ActionBar};
