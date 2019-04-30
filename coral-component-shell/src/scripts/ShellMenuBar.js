import {ComponentMixin} from '../../../coral-mixin-component';
import {Collection} from '../../../coral-collection';

const CLASSNAME = '_coral-Shell-menubar';

/**
 @class Coral.Shell.MenuBar
 @classdesc A Shell MenuBar component
 @htmltag coral-shell-menubar
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ShellMenuBar extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-menubar-item'
      });
    }
  
    return this._items;
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ShellMenuBar;
