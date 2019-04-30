import {ComponentMixin} from '../../../coral-mixin-component';
import {Collection} from '../../../coral-collection';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Shell-solutions';

/**
 @class Coral.Shell.Solutions
 @classdesc A Shell Solutions component
 @htmltag coral-shell-solutions
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ShellSolutions extends ComponentMixin(HTMLElement) {
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
        itemTagName: 'coral-shell-solution',
        itemBaseTagName: 'a'
      });
    }
  
    return this._items;
  }
  
  /**
   Whether the solution list is secondary.
   
   @type {Boolean}
   @default false
   @htmlattribute secondary
   @htmlattributereflected
   */
  get secondary() {
    return this._secondary || false;
  }
  set secondary(value) {
    this._secondary = transform.booleanAttr(value);
    this._reflectAttribute('secondary', this._secondary);
  
    this.classList.toggle(`${CLASSNAME}--secondary`, this._secondary);
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['secondary']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ShellSolutions;
