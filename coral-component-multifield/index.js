import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Multifield from './src/scripts/Multifield';
import MultifieldItem from './src/scripts/MultifieldItem';
import MultifieldItemContent from './src/scripts/MultifieldItemContent';

// Expose component on the Coral namespace
window.customElements.define('coral-multifield', Multifield);
window.customElements.define('coral-multifield-item', MultifieldItem);

Multifield.Item = MultifieldItem;
Multifield.Item.Content = MultifieldItemContent;

export {Multifield};
