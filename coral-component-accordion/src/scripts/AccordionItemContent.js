const CLASSNAME = '_coral-Accordion-itemContent';

/**
 @class Coral.Accordion.Item.Content
 @classdesc Accordion item's content component
 @htmltag coral-accordion-item-content
 @extends {HTMLElement}
 */
class AccordionItemContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    // WAI-ARIA 1.1
    this.setAttribute('role', 'region');
  }
}

export default AccordionItemContent;
