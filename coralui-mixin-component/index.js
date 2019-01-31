import '../coralui-externals';

import ComponentMixin from './src/scripts/ComponentMixin';
import {mixin} from '../coralui-utils';

// Expose mixin on Coral namespace
mixin._component = ComponentMixin;

export {ComponentMixin};
