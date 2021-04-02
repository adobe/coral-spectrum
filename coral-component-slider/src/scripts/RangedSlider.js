/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Slider from './Slider';
import range from '../templates/range';
import {commons, transform} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

/**
 @class Coral.RangedSlider
 @classdesc A Ranged Slider
 @htmltag coral-rangedslider
 @extends {Slider}
 */
const RangedSlider = Decorator(class extends Slider {
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
      commons._log('warn', 'Coral.RangedSlider: filled can not be set to false.');
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
    } else {
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

  /**
   Inherited from {@link BaseFormField#clear}.
   */
  clear() {
    this.startValue = this.min;
    this.endValue = this.max;
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // since the 'value' property is not reflected, form components use it to restore the initial value. When a
    // component has support for values, this method needs to be overwritten
    const initialStartValue = this.getAttribute('startvalue') || this.getAttribute('value');
    const initialEndValue = this.getAttribute('endvalue');

    this.startValue = transform.string(initialStartValue);
    this.endValue = transform.string(initialEndValue);
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      startvalue: 'startValue',
      endvalue: 'endValue'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'startvalue',
      'endvalue'
    ]);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add('_coral-Slider--range');

    // Set filled attribute by default
    this.setAttribute('filled', '');
  }
});

export default RangedSlider;
