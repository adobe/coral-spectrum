import '/coralui-externals';
import Slider from './src/scripts/Slider';
import SliderContent from './src/scripts/SliderContent';
import SliderItem from './src/scripts/SliderItem';
import RangedSlider from './src/scripts/RangedSlider';

window.customElements.define('coral-slider', Slider);
window.customElements.define('coral-slider-item', SliderItem);
window.customElements.define('coral-rangedslider', RangedSlider);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Slider = Slider;
window.Coral.Slider.Content = SliderContent;
window.Coral.Slider.Item = SliderItem;
window.Coral.RangedSlider = RangedSlider;

export {Slider, SliderItem, SliderContent, RangedSlider};
