import '../coral-externals';

import Vent from '@adobe/vent';
import './src/scripts/document.createElement-patch.js';
import 'document-register-element/build/document-register-element';
import 'document-register-element/build/innerHTML';
import './src/scripts/CustomElements';
import register from './libs/register';
import property from './libs/property';
import Component from './libs/Component';

window.Vent = window.Vent || Vent;

export {register, property, Component}
