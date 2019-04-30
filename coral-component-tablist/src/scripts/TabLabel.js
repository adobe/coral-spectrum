const CLASSNAME = '_coral-Tabs-itemLabel';

/**
 @class Coral.Tab.Label
 @classdesc Tab's label component
 @htmltag coral-tab-label
 @extends {HTMLElement}
 */
class TabLabel extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  }
}

export default TabLabel;
