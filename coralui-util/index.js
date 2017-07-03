import commons from './src/scripts/commons';
import events from './src/scripts/events';
import i18n from './src/scripts/i18n';
import {keys, Keys} from './src/scripts/keys';
import mixin from './src/scripts/mixin';
import strings from './src/scripts/strings';
import transform from './src/scripts/transform';
import validate from './src/scripts/validate';

// Expose helpers on Coral namespace
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
