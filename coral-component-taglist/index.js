import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import translations from './i18n/translations.json';
import {commons, strings} from '../coral-utils';
import Tag from './src/scripts/Tag';
import TagLabel from './src/scripts/TagLabel';
import TagList from './src/scripts/TagList';

// i18n
commons.extend(strings, {
  'coral-component-taglist': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-tag', Tag);
window.customElements.define('coral-tag-label', TagLabel);
window.customElements.define('coral-taglist', TagList);

Tag.Label = TagLabel;

export {Tag, TagList};
