import ButtonMixin from './src/scripts/ButtonMixin';
import {mixin} from '../coralui-util';

// Expose mixin on Coral namespace
mixin._button = ButtonMixin;

export {ButtonMixin};
