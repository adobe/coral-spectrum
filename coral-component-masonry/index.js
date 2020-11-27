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


import Masonry from './src/scripts/Masonry';
import MasonryItem from './src/scripts/MasonryItem';
import MasonryLayout from './src/scripts/MasonryLayout';
import MasonryFixedCenteredLayout from './src/scripts/MasonryFixedCenteredLayout';
import MasonryFixedSpreadLayout from './src/scripts/MasonryFixedSpreadLayout';
import MasonryVariableLayout from './src/scripts/MasonryVariableLayout';
import MasonryDashboardLayout from './src/scripts/MasonryDashboardLayout';

import './src/styles/index.css';

import {commons} from '../coral-utils';

// Register layouts
Masonry.registerLayout(Masonry.layouts.FIXED_CENTERED, MasonryFixedCenteredLayout);
Masonry.registerLayout(Masonry.layouts.FIXED_SPREAD, MasonryFixedSpreadLayout);
Masonry.registerLayout(Masonry.layouts.VARIABLE, MasonryVariableLayout);
Masonry.registerLayout(Masonry.layouts.DASHBOARD, MasonryDashboardLayout);

// Expose component on the Coral namespace
commons._define('coral-masonry-item', MasonryItem);
commons._define('coral-masonry', Masonry);

Masonry.Item = MasonryItem;
Masonry.Layout = MasonryLayout;

export {Masonry};
