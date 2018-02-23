/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import {Slider} from '/coralui-component-slider';
import '/coralui-component-tooltip';
import sliderBase from '../templates/sliderBase';
import {transform} from '/coralui-util';

const CLASSNAMES = ['coral3-ColorInput-slider', 'coral3-Slider--color'];

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
