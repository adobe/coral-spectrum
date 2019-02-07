import '../coral-externals';

import FormFieldMixin from './src/scripts/FormFieldMixin';
import {mixin} from '../coral-utils';

// Expose mixin on Coral namespace
mixin._formField = FormFieldMixin;

export {FormFieldMixin};
