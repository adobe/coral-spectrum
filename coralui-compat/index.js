import Promise from 'promise-polyfill';
import Vent from '@adobe/vent';
import {commons, events, i18n, keys, Keys, mixin, strings, transform, validate} from '../coralui-util';
import 'document-register-element/build/document-register-element';
import './libs/Coral.register';
import './libs/Coral.Property';
import './libs/Coral.Component';

// @ie11
window.Promise = window.Promise || Promise;

// @compat
window.Vent = window.Vent || Vent;
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
