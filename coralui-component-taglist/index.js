import '/coralui-externals';
import translations from './i18n/translations.json';
import {commons, strings} from '/coralui-util';
import Tag from './src/scripts/Tag';
import TagLabel from './src/scripts/TagLabel';
import TagList from './src/scripts/TagList';

// i18n
commons.extend(strings, {
  'coralui-component-taglist': translations
});

window.customElements.define('coral-tag', Tag);
window.customElements.define('coral-tag-label', TagLabel);
window.customElements.define('coral-taglist', TagList);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Tag = Tag;
window.Coral.Tag.Label = TagLabel;
window.Coral.TagList = TagList;

export {Tag, TagLabel, TagList};
