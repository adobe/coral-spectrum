import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAME = '_coral-MillerColumns-item';

/**
 @class Coral.ColumnView.Preview
 @classdesc A ColumnView Preview component
 @htmltag coral-columnview-preview
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ColumnViewPreview extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Content zone
    this._elements = {
      content: this.querySelector('coral-columnview-preview-content') || document.createElement('coral-columnview-preview-content')
    };
  }
  
  /**
   The content of the Preview.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-columnview-preview-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  get _contentZones() { return {'coral-columnview-preview-content': 'content'}; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const content = this._elements.content;
  
    // when the content zone was not created, we need to make sure that everything is added inside it as a content.
    // this stops the content zone from being voracious
    if (!content.parentNode) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }
    
    // Call content zone insert
    this.content = content;
  }
}

export default ColumnViewPreview;
