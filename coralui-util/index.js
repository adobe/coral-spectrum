import '../coralui-externals';

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
