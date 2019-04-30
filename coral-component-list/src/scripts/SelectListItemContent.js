/**
 @class Coral.SelectList.Item.Content
 @classdesc The SelectList Item content
 @htmltag coral-selectlist-item-content
 @extends {HTMLElement}
 */
const CLASSNAME = '_coral-Menu-itemLabel';

class SelectListItemContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default SelectListItemContent;
