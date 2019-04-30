/**
 @class Coral.ColumnView.Item.Content
 @classdesc ColumnView's Item content component
 @htmltag coral-columnview-item-content
 @extends {HTMLElement}
 */
class ColumnViewItemContent extends HTMLElement {
  connectedCallback() {
    this.classList.add('_coral-AssetList-itemLabel');
  }
}

export default ColumnViewItemContent;
