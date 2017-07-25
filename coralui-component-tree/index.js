import 'coralui-externals';
import Tree from './src/scripts/Tree';
import TreeItem from './src/scripts/TreeItem';

window.customElements.define('coral-tree', Tree);
window.customElements.define('coral-tree-item', TreeItem);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tree = Tree;
window.Coral.Tree.Item = TreeItem;
window.Coral.Tree.Item.Content = function() {
  return document.createElement('coral-tree-item-content');
};

export {Tree, TreeItem};
