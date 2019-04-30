/**
 @class Coral.ColumnView.Column.Content
 @classdesc ColumnView's Column content component
 @htmltag coral-columnview-column-content
 @extends {HTMLElement}
 */
class ColumnViewColumnContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add('_coral-AssetList');
  }
}

export default ColumnViewColumnContent;
