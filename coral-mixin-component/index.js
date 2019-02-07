import '../coral-externals';

import ComponentMixin from './src/scripts/ComponentMixin';
import {mixin} from '../coral-utils';

// Expose mixin on Coral namespace
mixin._component = ComponentMixin;

export {ComponentMixin};
