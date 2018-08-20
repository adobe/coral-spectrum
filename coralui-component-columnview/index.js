import '../coralui-theme-spectrum';
import '../coralui-externals';

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
