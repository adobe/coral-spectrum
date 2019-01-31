import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import Color from './src/scripts/Color';
import ColorInput from './src/scripts/ColorInput';
import ColorInputItem from './src/scripts/ColorInputItem';
import ColorInputSwatches from './src/scripts/ColorInputSwatches';
import ColorInputSwatch from './src/scripts/ColorInputSwatch';
import ColorInputSlider from './src/scripts/ColorInputSlider';
import ColorInputColorProperties from './src/scripts/ColorInputColorProperties';

import translations from './i18n/translations.json';
import {strings, commons} from '../coralui-utils';

// i18n
commons.extend(strings, {
  'coralui-component-colorinput': translations
});

// Expose component on the Coral namespace
window.customElements.define('coral-colorinput', ColorInput);
window.customElements.define('coral-colorinput-item', ColorInputItem);
window.customElements.define('coral-colorinput-swatches', ColorInputSwatches);
window.customElements.define('coral-colorinput-swatch', ColorInputSwatch);
window.customElements.define('coral-colorinput-slider', ColorInputSlider);
window.customElements.define('coral-colorinput-colorproperties', ColorInputColorProperties);

ColorInput.Item = ColorInputItem;
ColorInput.Swatches = ColorInputSwatches;
ColorInput.Swatch = ColorInputSwatch;
ColorInput.Slider = ColorInputSlider;
ColorInput.ColorProperties = ColorInputColorProperties;

export {Color, ColorInput};
