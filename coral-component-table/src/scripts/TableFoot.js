import {ComponentMixin} from '../../../coral-mixin-component';
import TableSectionMixin from './TableSectionMixin';

const CLASSNAME = '_coral-Table-foot';

/**
 @class Coral.Table.Foot
 @classdesc A Table foot component
 @htmltag coral-table-foot
 @htmlbasetag tfoot
 @extends {HTMLTableSectionElement}
 @extends {ComponentMixin}
 @extends {TableSectionMixin}
 */
class TableFoot extends TableSectionMixin(ComponentMixin(HTMLTableSectionElement)) {
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default TableFoot;
