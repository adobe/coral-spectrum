import ButtonMixin from './src/scripts/ButtonMixin';
import {mixin} from '../coralui-utils';

// Expose mixin on Coral namespace
mixin._button = ButtonMixin;

export {ButtonMixin};
