import '../coralui-externals';

import ComponentMixin from './src/scripts/ComponentMixin';
import {mixin} from '../coralui-util';

// Expose mixin on Coral namespace
mixin._component = ComponentMixin;

export {ComponentMixin};
