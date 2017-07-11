import 'coralui-externals';
import translations from './i18n/translations.json';
import {commons, strings} from 'coralui-util';
import Tag from './src/scripts/Tag';
import TagList from './src/scripts/TagList';

// i18n
commons.extend(strings, {
  'coralui-component-taglist': translations
});

window.customElements.define('coral-tag', Tag);
window.customElements.define('coral-taglist', TagList);

// Expose TagList and Tag on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tag = Tag;
window.Coral.Tag.Label = function() {
  return document.createElement('coral-tag-label');
};
window.Coral.TagList = TagList;

export {Tag, TagList};
