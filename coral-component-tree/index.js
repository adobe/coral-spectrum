import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Tree from './src/scripts/Tree';
import TreeItem from './src/scripts/TreeItem';
import TreeItemContent from './src/scripts/TreeItemContent';

// Expose component on the Coral namespace
window.customElements.define('coral-tree', Tree);
window.customElements.define('coral-tree-item', TreeItem);

Tree.Item = TreeItem;
Tree.Item.Content = TreeItemContent;

export {Tree, TreeItem};
