import '/coralui-externals';

import commons from './src/scripts/Commons';
import events from './src/scripts/Events';
import {i18n, strings} from './src/scripts/I18nProvider';
import {keys, Keys} from './src/scripts/Keys';
import transform from './src/scripts/Transformation';
import validate from './src/scripts/Validation';

/**
  @private
 */
const mixin = {};

// @compat
// Expose helpers on Coral namespace required
window.Coral = window.Coral || {};
window.Coral.commons = commons;
window.Coral.events = events;
window.Coral.i18n = i18n;
window.Coral.keys = keys;
window.Coral.Keys = Keys;
window.Coral.mixin = mixin;
window.Coral.strings = strings;
window.Coral.transform = transform;
window.Coral.validate = validate;

export {
  commons,
  events,
  i18n,
  keys,
  Keys,
  mixin,
  strings,
  transform,
  validate
};
