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

import ColumnView from './src/scripts/ColumnView';
import ColumnViewColumn from './src/scripts/ColumnViewColumn';
import ColumnViewColumnContent from './src/scripts/ColumnViewColumnContent';
import ColumnViewItem from './src/scripts/ColumnViewItem';
import ColumnViewItemContent from './src/scripts/ColumnViewItemContent';
import ColumnViewItemThumbnail from './src/scripts/ColumnViewItemThumbnail';
import ColumnViewPreview from './src/scripts/ColumnViewPreview';
import ColumnViewPreviewAsset from './src/scripts/ColumnViewPreviewAsset';
import ColumnViewPreviewContent from './src/scripts/ColumnViewPreviewContent';
import ColumnViewPreviewLabel from './src/scripts/ColumnViewPreviewLabel';
import ColumnViewPreviewSeparator from './src/scripts/ColumnViewPreviewSeparator';
import ColumnViewPreviewValue from './src/scripts/ColumnViewPreviewValue';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-columnview', ColumnView);
window.customElements.define('coral-columnview-column', ColumnViewColumn);
window.customElements.define('coral-columnview-column-content', ColumnViewColumnContent);
window.customElements.define('coral-columnview-item', ColumnViewItem);
window.customElements.define('coral-columnview-item-thumbnail', ColumnViewItemThumbnail);
window.customElements.define('coral-columnview-item-content', ColumnViewItemContent);
window.customElements.define('coral-columnview-preview', ColumnViewPreview);
window.customElements.define('coral-columnview-preview-content', ColumnViewPreviewContent);

ColumnView.Column = ColumnViewColumn;
ColumnView.Column.Content = ColumnViewColumnContent;
ColumnView.Item = ColumnViewItem;
ColumnView.Item.Content = ColumnViewItemContent;
ColumnView.Item.Thumbnail = ColumnViewItemThumbnail;
ColumnView.Preview = ColumnViewPreview;
ColumnView.Preview.Asset = ColumnViewPreviewAsset;
ColumnView.Preview.Content = ColumnViewPreviewContent;
ColumnView.Preview.Label = ColumnViewPreviewLabel;
ColumnView.Preview.Separator = ColumnViewPreviewSeparator;
ColumnView.Preview.Value = ColumnViewPreviewValue;

export {ColumnView};
