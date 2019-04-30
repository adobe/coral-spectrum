import {Slider} from '../../../coral-component-slider';
import '../../../coral-component-tooltip';
import sliderBase from '../templates/sliderBase';
import {transform} from '../../../coral-utils';

const CLASSNAMES = ['_coral-ColorInput-slider', '_coral-Slider--color'];

/**
 @class Coral.ColorInput.Slider
 @classdesc A ColorInput Slider component
 @htmltag coral-colorinput-slider
 @extends {Slider}
 */
class ColorInputSlider extends Slider {
  /**
   The gradient shown as slider background as space separated values (at least 2 values needed).
   e.g: #ff0000 #ffff00 #00ff00 #00ffff #0000ff #ff00ff #ff0000
   
   @type {String}
   @default ""
   @htmlattribute gradient
   */
  get gradient() {
    return this._gradient || '';
  }
  set gradient(value) {
    this._gradient = transform.string(value);
  
    const bar = this._elements.bar;
    const barStyle = bar.style;
  
    const stops = this.gradient.split(' ');
    const amountStops = stops.length;
  
    // remove old gradients
    barStyle.backgroundImage = 'none';
    barStyle.filter = '';
  
    if (amountStops < 2) {
      return;
    }
    
    let partialGradientStr = '';
    for (let i = 0; i < amountStops; i++) {
      partialGradientStr += `, ${stops[i]} ${Math.abs(i * 100 / (amountStops - 1))}%`;
    }
  
    barStyle.backgroundImage = `-moz-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-ms-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-o-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `-webkit-linear-gradient(to right${partialGradientStr})`;
    barStyle.backgroundImage = `linear-gradient(to right${partialGradientStr})`;
    barStyle.filter = `progid:DXImageTransform.Microsoft.gradient(startColorstr='${stops[0]}', endColorstr='${stops[1]}', gradientType=1)`;
  }
  
  _moveHandles() {
    const calculatePercent = (value) => (value - this.min) / (this.max - this.min) * 100;
    const labelValue = [];
    
    // Set the handle position as a percentage based on the stored values
    this._elements.handles.forEach((handle, index) => {
      const percent = calculatePercent(this._values[index]);
      handle.style.left = `${percent}%`;
      
      labelValue.push(this._getLabel(this._values[index]));
    });
    
    this._elements.labelValue.textContent = labelValue.length > 1 ? labelValue.join(' - ') : labelValue[0];
  }
  
  /** @override */
  _getTemplate() {
    return sliderBase;
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['gradient']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(...CLASSNAMES);
  }
}

export default ColorInputSlider;
