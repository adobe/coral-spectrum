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

import Slider from './Slider';
import range from '../templates/range';
import {transform} from '../../../coralui-util';

/**
 @class Coral.RangedSlider
 @classdesc A Ranged Slider
 @htmltag coral-rangedslider
 @extends {Slider}
 */
class RangedSlider extends Slider {
  /**
   Ranged sliders are always filled.
   
   @type {Boolean}
   @default true
   @htmlattribute filled
   @htmlattributereflected
   */
  get filled() {
    return true;
  }
  set filled(value) {
    if (!transform.booleanAttr(value)) {
      console.warn('Coral.RangedSlider: filled can not be set to false.');
    }
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this.startValue;
  }
  set value(value) {
    this.startValue = value;
  }
  
  /**
   The starting value of the range.
   
   @type {String}
   @default '1'
   @emits {change}
   @htmlattribute startValue
   */
  get startValue() {
    return this.values[0] || '1';
  }
  set startValue(value) {
    // Snap value to step
    value = String(this._snapValueToStep(transform.number(value), this.min, this.max, this.step));
  
    const values = this.values;
    values[0] = value;
    this.values = values;
  
    // in order to keep the reset value in sync, we need to handle the "startvalue" attribute of the inner input
    const input = this._elements.inputs[0];
    const valueAttribute = this.getAttribute('startvalue') || this.getAttribute('value');
    input[valueAttribute ? 'setAttribute' : 'removeAttribute']('value', valueAttribute);
  }
  
  /**
   The ending value of the range.
   
   @type {String}
   @default '100'
   @emits {change}
   @htmlattribute endValue
   */
  get endValue() {
    return this.values[1] || '100';
  }
  set endValue(value) {
    // Snap value to step
    value = String(this._snapValueToStep(transform.number(value), this.min, this.max, this.step));
  
    const values = this.values;
    values[1] = value;
    this.values = values;
  
    // in order to keep the reset value in sync, we need to handle the "endvalue" attribute of the inner input
    const input = this._elements.inputs[1];
    const valueAttribute = this.getAttribute('endvalue');
    input[valueAttribute ? 'setAttribute' : 'removeAttribute']('value', valueAttribute);
  }
  
  /**
   The current values of the ranged slider.
   
   @type {Array.<String>}
   @default [{@link Coral.RangedSlider#startValue},{@link Coral.RangedSlider#endValue}]
   @emits {change}
   */
  get values() {
    return this._values;
  }
  set values(values) {
    this._values = values;
  }
  
  /** @private */
  _getHighestValue() {
    return Math.max.apply(null, this.values);
  }
  
  /** @private */
  _getLowestValue() {
    return Math.min.apply(null, this.values);
  }
  
  /** @override */
  _updateValue(handle, val) {
    const idx = this._elements.handles.indexOf(handle);
  
    if (idx === 0) {
      if (val > parseFloat(this.values[1])) {
        val = this.values[1];
      }
      this._elements.rightInput.min = val;
      this._elements.rightHandle.setAttribute('aria-valuemin', val);
    }
    else {
      if (val < parseFloat(this.values[0])) {
        val = this.values[0];
      }
      this._elements.leftInput.max = val;
      this._elements.leftHandle.setAttribute('aria-valuemax', val);
    }
  
    const resValue = [this.values[0], this.values[1]];
    resValue[idx] = val;
  
    const oldValues = this.values;
    this.values = resValue;
    const newValues = this.values;
  
    if (oldValues.join(':') !== newValues.join(':')) {
      this.trigger('change');
    }
  }
  
  /** @override */
  _getTemplate() {
    return range;
  }
  
  // JSDocs inherited
  clear() {
    this.startValue = this.min;
    this.endValue = this.max;
  }

  // JSDocs inherited
  reset() {
    // since the 'value' property is not reflected, form components use it to restore the initial value. When a
    // component has support for values, this method needs to be overwritten
    const initialStartValue = this.getAttribute('startvalue') || this.getAttribute('value');
    const initialEndValue = this.getAttribute('endvalue');
    
    this.startValue = transform.string(initialStartValue);
    this.endValue = transform.string(initialEndValue);
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'startvalue',
      'startValue',
      'endvalue',
      'endValue'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add('_coral-Slider--range');
    
    // Set filled attribute by default
    this.setAttribute('filled', '');
  }
}

export default RangedSlider;
