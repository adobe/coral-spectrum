const CLASSNAME = '_coral-Tags-item-label';

/**
 @class Coral.Tag.Label
 @classdesc Tag's label component
 @htmltag coral-tag-label
 @extends {HTMLElement}
 */
class TagLabel extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default TagLabel;
