import ListMixin from './src/scripts/ListMixin';
import ListItemMixin from './src/scripts/ListItemMixin';
import {mixin} from '../coral-utils';

// Expose mixin on Coral namespace
mixin._list = ListMixin;
mixin._list.item = ListItemMixin;

export {ListMixin, ListItemMixin};
