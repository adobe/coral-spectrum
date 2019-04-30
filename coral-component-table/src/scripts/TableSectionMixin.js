import {divider} from './TableUtil';
import {transform, validate} from '../../../coral-utils';

// Builds a string containing all possible divider classnames. This will be used to remove classnames when the
// divider changes
const ALL_DIVIDER_CLASSES = [];
for (const dividerValue in divider) {
  ALL_DIVIDER_CLASSES.push(`_coral-Table-divider--${divider[dividerValue]}`);
}

/**
 @mixin TableSectionMixin
 @classdesc The base element for table sections
 */
const TableSectionMixin = (superClass) => class extends superClass {
  /**
   The table section divider. See {@link TableSectionDividerEnum}.
   
   @type {String}
   @default TableSectionDividerEnum.ROW
   @htmlattributereflected
   @htmlattribute divider
   */
  get divider() {
    return this._divider || divider.ROW;
  }
  set divider(value) {
    value = transform.string(value).toLowerCase();
    this._divider = validate.enumeration(divider)(value) && value || divider.ROW;
    this._reflectAttribute('divider', this._divider);
  
    this.classList.remove(...ALL_DIVIDER_CLASSES);
    this.classList.add(`_coral-Table-divider--${this.divider}`);
  }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['divider']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
  
    // a11y
    this.setAttribute('role', 'rowgroup');
    
    // Default reflected attributes
    if (!this._divider) { this.divider = divider.ROW; }
  }
};

export default TableSectionMixin;
