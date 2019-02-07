import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Slider from './src/scripts/Slider';
import SliderContent from './src/scripts/SliderContent';
import SliderItem from './src/scripts/SliderItem';
import RangedSlider from './src/scripts/RangedSlider';

// Expose component on the Coral namespace
window.customElements.define('coral-slider', Slider);
window.customElements.define('coral-slider-item', SliderItem);
window.customElements.define('coral-rangedslider', RangedSlider);

Slider.Content = SliderContent;
Slider.Item = SliderItem;

export {Slider, RangedSlider};
