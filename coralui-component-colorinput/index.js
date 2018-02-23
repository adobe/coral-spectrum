import '/coralui-externals';
import Color from './src/scripts/Color';
import ColorInput from './src/scripts/ColorInput';
import ColorInputItem from './src/scripts/ColorInputItem';
import ColorInputSwatches from './src/scripts/ColorInputSwatches';
import ColorInputSwatch from './src/scripts/ColorInputSwatch';
import ColorInputSlider from './src/scripts/ColorInputSlider';
import ColorInputColorProperties from './src/scripts/ColorInputColorProperties';

import translations from './i18n/translations.json';
import {strings, commons} from '/coralui-util';

// i18n
commons.extend(strings, {
  'coralui-component-colorinput': translations
});

window.customElements.define('coral-colorinput', ColorInput);
window.customElements.define('coral-colorinput-item', ColorInputItem);
window.customElements.define('coral-colorinput-swatches', ColorInputSwatches);
window.customElements.define('coral-colorinput-swatch', ColorInputSwatch);
window.customElements.define('coral-colorinput-slider', ColorInputSlider);
window.customElements.define('coral-colorinput-colorproperties', ColorInputColorProperties);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Color = Color;
window.Coral.ColorInput = ColorInput;
window.Coral.ColorInput.Item = ColorInputItem;
window.Coral.ColorInput.Swatches = ColorInputSwatches;
window.Coral.ColorInput.Swatch = ColorInputSwatch;
window.Coral.ColorInput.Slider = ColorInputSlider;
window.Coral.ColorInput.ColorProperties = ColorInputColorProperties;

export {Color, ColorInput, ColorInputItem, ColorInputSwatches, ColorInputSwatch, ColorInputSlider, ColorInputColorProperties};
