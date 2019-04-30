const CLASSNAME = 'coral-Body--small';

/**
 @class Coral.ColumnView.Preview.Content
 @classdesc ColumnView's preview content component
 @htmltag coral-columnview-preview-content
 @extends {HTMLElement}
 */
class ColumnViewPreviewContent extends HTMLElement {
  /** @ignore */
  constructor() {
    super();
    
    this.classList.add(CLASSNAME);
  }
}

export default ColumnViewPreviewContent;
