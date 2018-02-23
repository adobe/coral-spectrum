import '/coralui-externals';
import Accordion from './src/scripts/Accordion';
import AccordionItem from './src/scripts/AccordionItem';
import AccordionItemLabel from './src/scripts/AccordionItemLabel';
import AccordionItemContent from './src/scripts/AccordionItemContent';

window.customElements.define('coral-accordion', Accordion);
window.customElements.define('coral-accordion-item', AccordionItem);
window.customElements.define('coral-accordion-item-label', AccordionItemLabel);
window.customElements.define('coral-accordion-item-content', AccordionItemContent);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Accordion = Accordion;
window.Coral.Accordion.Item = AccordionItem;
window.Coral.Accordion.Item.Label = AccordionItemLabel;
window.Coral.Accordion.Item.Content = AccordionItemContent;

export {Accordion, AccordionItem, AccordionItemLabel, AccordionItemContent};
