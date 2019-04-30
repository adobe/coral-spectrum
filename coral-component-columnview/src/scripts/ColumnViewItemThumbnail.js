/**
 @class Coral.ColumnView.Item.Thumbnail
 @classdesc ColumnView's Item thumbnail component
 @htmltag coral-columnview-item-thumbnail
 @extends {HTMLElement}
 */

class ColumnViewItemThumbnail extends HTMLElement {
  connectedCallback() {
    this.classList.add('_coral-AssetList-itemThumbnail');
  }
}

export default ColumnViewItemThumbnail;
