const CLASSNAME = '_coral-Menu-divider';

/**
 @class Coral.List.Divider
 @classdesc The List divider
 @htmltag coral-list-divider
 @extends {HTMLElement}
 */
class ListDivider extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default ListDivider;
