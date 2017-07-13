import 'coralui-externals';
import Accordion from './src/scripts/Accordion';
import AccordionItem from './src/scripts/AccordionItem';

window.customElements.define('coral-accordion', Accordion);
window.customElements.define('coral-accordion-item', AccordionItem);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Accordion = Accordion;
window.Coral.Accordion.Item = AccordionItem;
window.Coral.Accordion.Item.Label = function() {
  return document.createElement('coral-accordion-item-label');
};
window.Coral.Accordion.Item.Content = function() {
  return document.createElement('coral-accordion-item-content');
};

export {Accordion, AccordionItem};
