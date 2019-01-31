import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import Accordion from './src/scripts/Accordion';
import AccordionItem from './src/scripts/AccordionItem';
import AccordionItemLabel from './src/scripts/AccordionItemLabel';
import AccordionItemContent from './src/scripts/AccordionItemContent';

// Expose component on the Coral namespace
window.customElements.define('coral-accordion', Accordion);
window.customElements.define('coral-accordion-item', AccordionItem);
window.customElements.define('coral-accordion-item-label', AccordionItemLabel);
window.customElements.define('coral-accordion-item-content', AccordionItemContent);

Accordion.Item = AccordionItem;
Accordion.Item.Label = AccordionItemLabel;
Accordion.Item.Content = AccordionItemContent;

export {Accordion};
