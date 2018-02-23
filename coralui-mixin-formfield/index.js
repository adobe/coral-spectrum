import '/coralui-externals';

import FormFieldMixin from './src/scripts/FormFieldMixin';
import {mixin} from '/coralui-util';

// Expose mixin on Coral namespace
mixin._formField = FormFieldMixin;

export {FormFieldMixin};
