import '/coralui-externals';

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

window.customElements.define('coral-columnview', ColumnView);
window.customElements.define('coral-columnview-column', ColumnViewColumn);
window.customElements.define('coral-columnview-item', ColumnViewItem);
window.customElements.define('coral-columnview-item-thumbnail', ColumnViewItemThumbnail);
window.customElements.define('coral-columnview-item-content', ColumnViewItemContent);
window.customElements.define('coral-columnview-preview', ColumnViewPreview);
window.customElements.define('coral-columnview-preview-content', ColumnViewPreviewContent);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.ColumnView = ColumnView;
window.Coral.ColumnView.Column = ColumnViewColumn;
window.Coral.ColumnView.Column.Content = ColumnViewColumnContent;
window.Coral.ColumnView.Item = ColumnViewItem;
window.Coral.ColumnView.Item.Content = ColumnViewItemContent;
window.Coral.ColumnView.Item.Thumbnail = ColumnViewItemThumbnail;
window.Coral.ColumnView.Preview = ColumnViewPreview;
window.Coral.ColumnView.Preview.Asset = ColumnViewPreviewAsset;
window.Coral.ColumnView.Preview.Content = ColumnViewPreviewContent;
window.Coral.ColumnView.Preview.Label = ColumnViewPreviewLabel;
window.Coral.ColumnView.Preview.Separator = ColumnViewPreviewSeparator;
window.Coral.ColumnView.Preview.Value = ColumnViewPreviewValue;

export {
  ColumnView,
  ColumnViewColumn,
  ColumnViewColumnContent,
  ColumnViewItem,
  ColumnViewItemContent,
  ColumnViewItemThumbnail,
  ColumnViewPreview,
  ColumnViewPreviewAsset,
  ColumnViewPreviewContent,
  ColumnViewPreviewLabel,
  ColumnViewPreviewSeparator,
  ColumnViewPreviewValue
};
