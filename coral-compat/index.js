import '../coral-externals';

import './src/scripts/document.createElement-patch.js';
import 'document-register-element/build/document-register-element';
import 'document-register-element/build/innerHTML';
import './src/scripts/CustomElements';
import register from './libs/register';
import property from './libs/property';
import Component from './libs/Component';

export {register, property, Component}
