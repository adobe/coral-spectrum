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

import List from './src/scripts/List';
import ListDivider from './src/scripts/ListDivider';
import ListItem from './src/scripts/ListItem';
import ListItemContent from './src/scripts/ListItemContent';
import AnchorList from './src/scripts/AnchorList';
import AnchorListItem from './src/scripts/AnchorListItem';
import ButtonList from './src/scripts/ButtonList';
import ButtonListItem from './src/scripts/ButtonListItem';
import SelectList from './src/scripts/SelectList';
import SelectListGroup from './src/scripts/SelectListGroup';
import SelectListItem from './src/scripts/SelectListItem';
import SelectListItemContent from './src/scripts/SelectListItemContent';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-list', List);
window.customElements.define('coral-list-divider', ListDivider);
window.customElements.define('coral-list-item', ListItem);
window.customElements.define('coral-list-item-content', ListItemContent);
window.customElements.define('coral-anchorlist', AnchorList);
window.customElements.define('coral-anchorlist-item', AnchorListItem, {extends: 'a'});
window.customElements.define('coral-buttonlist', ButtonList);
window.customElements.define('coral-buttonlist-item', ButtonListItem, {extends: 'button'});
window.customElements.define('coral-selectlist', SelectList);
window.customElements.define('coral-selectlist-item', SelectListItem);
window.customElements.define('coral-selectlist-item-content', SelectListItemContent);
window.customElements.define('coral-selectlist-group', SelectListGroup);

List.Divider = ListDivider;
List.Item = ListItem;
List.Item.Content = ListItemContent;
AnchorList.Item = AnchorListItem;
ButtonList.Item = ButtonListItem;
SelectList.Group = SelectListGroup;
SelectList.Item = SelectListItem;
SelectList.Item.Content = SelectListItemContent;

export {List, AnchorList, ButtonList, SelectList};
