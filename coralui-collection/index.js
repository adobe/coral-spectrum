import '/coralui-externals';
import Collection from './src/scripts/Collection';
import SelectableCollection from './src/scripts/SelectableCollection';

// Expose Collection and SelectableCollection on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Collection = Collection;
window.Coral.SelectableCollection = SelectableCollection;

export {Collection, SelectableCollection};
