import 'coralui-externals';
import Multifield from './src/scripts/Multifield';
import MultifieldItem from './src/scripts/MultifieldItem';

window.customElements.define('coral-multifield', Multifield);
window.customElements.define('coral-multifield-item', MultifieldItem);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Multifield = Multifield;
window.Coral.Multifield.Item = MultifieldItem;
window.Coral.Multifield.Item.Content = function() {
  return document.createElement('coral-multifield-item-content');
};

export {Multifield, MultifieldItem};
