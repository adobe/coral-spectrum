import {AnchorList} from '../../../coral-component-list';

const CLASSNAME = ['_coral-BasicList-item', '_coral-AnchorList-item', '_coral-Shell-help-item'];

/**
 @class Coral.Shell.Help.Item
 @classdesc A Shell Help item component
 @htmltag coral-shell-help-item
 @extends {AnchorListItem}
 */
class ShellHelpItem extends AnchorList.Item {
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(...CLASSNAME);
  }
}

export default ShellHelpItem;
