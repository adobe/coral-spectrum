import List from './src/scripts/List';
import ListItem from './src/scripts/ListItem';
import {mixin} from 'coralui-util';

// Expose List mixin on Coral namespace
mixin.list = List;
mixin.list.item = ListItem;

export {List, ListItem};
