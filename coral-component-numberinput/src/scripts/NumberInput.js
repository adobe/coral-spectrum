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

import {BaseComponent} from '../../../coral-base-component';
import {BaseFormField} from '../../../coral-base-formfield';
import '../../../coral-component-button';
import '../../../coral-component-textfield';
import {Icon} from '../../../coral-component-icon';
import base from '../templates/base';
import {transform, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Stepper';
let clearLiveRegionTimeout;
const LIVEREGION_TIMEOUT_DELAY = 3000;
const MSPOINTER_TYPE_MOUSE = 0x00000004;
let flagTouchStart = false;
let flagStepButtonClick = false;

const exponentialToDecimalString = (value) => {
  const notation = value.toString();
  if (notation.indexOf('e') !== -1) {
    const negative = notation.indexOf('-') === 0;
    const exponent = parseInt(notation.split('-')[negative ? 2 : 1], 10);
    return value.toFixed(exponent).toString();
  }
  
  return value.toString();
};

const handleDecimalOperation = (operator, value1, value2) => {
  let result;
  
  const operation = (operator, value1, value2) => {
    if (operator === '+') {
      return value1 + value2;
    }
    else if (operator === '-') {
      return value1 - value2;
    }
    else if (operator === '%') {
      return value1 % value2;
    }
  };
  
  // Check if we have decimals
  if (value1 % 1 !== 0 || value2 % 1 !== 0) {
    const value1Decimal = exponentialToDecimalString(value1).split('.');
    const value2Decimal = exponentialToDecimalString(value2).split('.');
    const value1DecimalLength = value1Decimal[1] && value1Decimal[1].length || 0;
    const value2DecimalLength = value2Decimal[1] && value2Decimal[1].length || 0;
    const multiplier = Math.pow(10, Math.max(value1DecimalLength, value2DecimalLength));
    
    // Transform the decimals to integers based on the multiplier
    value1 = Math.round(value1 * multiplier);
    value2 = Math.round(value2 * multiplier);
    
    // Perform the operation on integers values to make sure we don't get a fancy decimal value
    result = operation(operator, value1, value2);
    
    // Transform the integer result back to decimal
    result /= multiplier;
  }
  else {
    result = operation(operator, value1, value2);
  }
  
  return result;
};

/**
 @class Coral.NumberInput
 @classdesc A NumberInput component is a numeric control form field. It follows the ARIA specification for spinbutton.
 This means the following keys are valid for interacting with it: <code>up</code>, <code>down</code>, <code>left</code>,
 <code>right</code>, <code>pageup</code>, <code>pagedown</code>, <code>home</code>, <code>end</code> and the Mouse Wheel.
 @htmltag coral-numberinput
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class NumberInput extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    this._delegateEvents(commons.extend(this._events, {
      'key:up': '_onKeyUp',
      'key:pageup': '_onKeyUp',
      'key:down': '_onKeyDown',
      'key:pagedown': '_onKeyDown',
      'key:home': '_onKeyHome',
      'key:end': '_onKeyEnd',
      'touchstart [handle=stepUp], [handle=stepDown]': '_onTouchStart',
      'pointerdown [handle=stepUp], [handle=stepDown]': '_onTouchStart',
      'MSPointerDown [handle=stepUp], [handle=stepUp]': '_onTouchStart',
      'MSPointerDown [handle=stepDown], [handle=stepDown]': '_onTouchStart',
  
      'click [handle=stepUp]': '_onStepUpButtonClick',
      'click [handle=stepDown]': '_onStepDownButtonClick',
  
      'mousewheel [handle="input"]': '_onInputMouseWheel',
      'DOMMouseScroll [handle="input"]': '_onInputMouseWheel',
  
      'capture:focus': '_onFocus',
      'capture:blur': '_onBlur'
    }));
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements, {i18n, commons, Icon});
  
    // Pre-define labellable element
    this._labellableElement = this._elements.input;
  
    // Default is null
    this._min = this._max = null;
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._elements.input.value;
  }
  set value(value) {
    value = isNaN(value) ? '' : String(value);
  
    // sets the value immediately so it is picked up in form submits
    this._elements.input.value = value;
  
    // in order to keep the reset value in sync, we need to handle the "value" attribute of the inner input
    const valueAttribute = this.getAttribute('value');
    this._elements.input[valueAttribute ? 'setAttribute' : 'removeAttribute']('value', valueAttribute);
  
    // @a11y: aria-valuetext is used so that VoiceOver does not announce a percentage
    this._elements.input.setAttribute('aria-valuenow', this.value);
    this._elements.input.setAttribute('aria-valuetext', this.value);
  
    // If the event triggering a value change is a click on a +/- button,
    // announce the new value using the live region.
    if (flagStepButtonClick || !!window.chrome) {
      this._updateLiveRegion(this.value);
      // Otherwise, clear the live region.
    }
    else {
      this._updateLiveRegion();
    }
  
    flagStepButtonClick = false;
    
    this.invalid = this.hasAttribute('invalid');
    this.disabled = this.hasAttribute('disabled');
  }
  
  /**
   The value returned as a Number. Value is <code>NaN</code> if conversion to Number is not possible.
   
   @type {Number}
   @default NaN
   */
  get valueAsNumber() {
    let valueAsNumber = this._valueAsNumber;
    
    if (typeof valueAsNumber !== 'undefined' && valueAsNumber !== null) {
      return valueAsNumber;
    }
    
    valueAsNumber = transform.number(this.value);
    if (valueAsNumber !== null) {
      return valueAsNumber;
    }
    
    return NaN;
  }
  set valueAsNumber(value) {
    this._valueAsNumber = transform.number(value);
  
    this.value = this._valueAsNumber;
    this.invalid = this.hasAttribute('invalid');
    this.disabled = this.hasAttribute('disabled');
  }
  
  /**
   The minimum value for the NumberInput. If a value below the minimum is set, the NumberInput will be marked as
   invalid but the value will be preserved. Stepping down the NumberInput via {@link Coral.NumberInput#stepDown}
   or the decrement button respects the minimum value. It reflects the <code>min</code> attribute to the DOM.
   
   @type {?Number}
   @default null
   @htmlattribute min
   @htmlattributereflected
   */
  get min() {
    return this._min;
  }
  set min(value) {
    value = transform.number(value);
  
    this._min = isNaN(value) ? null : value;
    
    if (this._min === null) {
      this._reflectAttribute('min', false);
      
      this._elements.input.removeAttribute('aria-valuemin');
      this._elements.input.removeAttribute('min');
    }
    else {
      this._reflectAttribute('min', this._min);
      // sets the min in the input so that keyboard handles this component
      this._elements.input.setAttribute('aria-valuemin', this._min);
      this._elements.input.min = this._min;
    }
    
    this.invalid = this.hasAttribute('invalid');
    this.disabled = this.hasAttribute('disabled');
  }
  
  /**
   The maximum value for the NumberInput. If a value above the maximum is set, the NumberInput will be marked as
   invalid but the value will be preserved. Stepping up the NumberInput via {@link Coral.NumberInput#stepUp} or
   the increment button respects the maximum value. It reflects the <code>max</code> attribute to the DOM.
   
   @type {?Number}
   @default null
   @htmlattribute max
   @htmlattributereflected
   */
  get max() {
    return this._max;
  }
  set max(value) {
    value = transform.number(value);
  
    this._max = isNaN(value) ? null : value;
  
    if (this.max === null) {
      this._reflectAttribute('max', false);
      
      this._elements.input.removeAttribute('aria-valuemax');
      this._elements.input.removeAttribute('max');
    }
    else {
      this._reflectAttribute('max', this._max);
      // sets the max in the input so that keyboard handles this component
      this._elements.input.setAttribute('aria-valuemax', this._max);
      this._elements.input.max = this._max;
    }
    
    this.invalid = this.hasAttribute('invalid');
    this.disabled = this.hasAttribute('disabled');
  }
  
  /**
   The amount to increment by when stepping up or down. It can be the string <code>any</code> or any positive
   floating point number. If this is not set to <code>any<code>, the control accepts only values at multiples of
   the step value greater than the minimum.
   
   @type {Number|String}
   @default 1
   @htmlattribute step
   @htmlattributereflected
   */
  get step() {
    return this._step || 1;
  }
  set step(value) {
    if (value !== null && (value > 0 || value === 'any')) {
      this._step = value === 'any' ? value : transform.number(value);
      this._reflectAttribute('step', this._step);
  
      this._elements.input.step = this._step;
    }
  }
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.input.name = value;
  }
  
  /**
   Whether this field is disabled or not.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.setAttribute('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.input.disabled = this._disabled;
    
    this._setButtonState();
  }
  
  /**
   Whether this field is required or not.
   @type {Boolean}
   @default false
   @htmlattribute required
   @htmlattributereflected
   */
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    this.setAttribute('aria-required', this._required);
    this._elements.input.required = this._required;
  }
  
  /**
   Whether this field is readOnly or not. Indicating that the user cannot modify the value of the control.
   @type {Boolean}
   @default false
   @htmlattribute readonly
   @htmlattributereflected
   */
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    this.setAttribute('aria-readonly', this._readOnly);
    this._elements.input.readOnly = this._readOnly;
    this._setButtonState();
  }
  
  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
    this._elements.input.invalid = this._invalid;
  }
  
  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
    // in case the user focuses the buttons, he will still get a notion of the usage of the component
    this[this.labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.labelledBy);
  }
  
  /**
   Short hint that describes the expected value of the NumberInput. It is displayed when the NumberInput is empty.
   
   @type {String}
   @default ""
   @htmlattribute placeholder
   @htmlattributereflected
   */
  get placeholder() {
    return this._elements.input.placeholder || '';
  }
  set placeholder(value) {
    value = transform.string(value);
    this._reflectAttribute('placeholder', value);

    this._elements.input.placeholder = value;
  }
  
  // overrides the behavior from BaseFormField
  reset() {
    // since there is an internal value, this one handles the reset
    this._elements.input.reset();
  }
  
  // overrides the behavior from BaseFormField
  clear() {
    // since there is an internal value, this one handles the clear
    this._elements.input.clear();
  }
  
  /**
   Increments the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
   considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
   */
  stepUp() {
    // uses the Number representation since it simplifies the calculations
    const value = this.valueAsNumber;
    const step = this._getActualStep();
    if (isNaN(value)) {
      this.value = this.max !== null ? Math.min(step, this.max) : step;
    }
    else {
      const newValue = handleDecimalOperation('+', value, step);
  
      this.value = this.max !== null ? Math.min(newValue, this.max) : newValue;
    }
  }
  
  /**
   Decrements the value by <code>step</code>. If the current value is <code>null</code> or <code>''</code>, it is
   considered as 0. The new value will always respect the <code>min</code> and <code>max</code> values if available.
   */
  stepDown() {
    // uses the Number representation since it simplifies the calculations
    const value = this.valueAsNumber;
    const step = this._getActualStep();
    if (isNaN(value)) {
      this.value = this.min !== null ? Math.max(-step, this.min) : -step;
    }
    else {
      const newValue = handleDecimalOperation('-', value, step);
  
      this.value = this.min !== null ? Math.max(newValue, this.min) : newValue;
    }
  }
  
  /**
   If the value is 'any' there is no allowed step, that means we incremenet with the default (as if the step was not
   defined).
 
   @returns {Number} the valid step according to the specs.
 
   @ignore
   */
  _getActualStep() {
    return this.step === 'any' ? 1 : this.step;
  }
  
  /**
   Checks if the current NumberInput is valid or not. This is done by checking that the current value is between the
   provided <code>min</code> and <code>max</code> values. This check is only performed on user interaction.
 
   @ignore
   */
  _validateInputValue() {
    this.invalid = this.value !== '' && (isNaN(Number(this.value)) ||
      (this.max !== null && this.value > this.max || this.min !== null && this.value < this.min) ||
      this.step !== 'any' && handleDecimalOperation('%', Number(this.value), this._getActualStep()) !== 0);
  }
  
  /**
   Sets the correct state of the buttons based on <code>disabled</code>, <code>min</code>, <code>max</code> and
   <code>readOnly</code> properties.
 
   @ignore
   */
  _setButtonState() {
    this._elements.stepUp.disabled = this.disabled || this.max !== null && this.value >= this.max || this.readOnly;
    this._elements.stepDown.disabled = this.disabled || this.min !== null && this.value <= this.min || this.readOnly;
  }
  
  /**
   Triggers a change event. This is only done if the provided values are different.
 
   @param {String} newValue
   The new value of the component.
   @param {String} oldValue
   The old value of the component.
 
   @private
   */
  _triggerChange(newValue, oldValue) {
    // if the underlaying value stayed the same, there no need to trigger an event
    if (newValue !== oldValue) {
      this.trigger('change');
    }
  }
  
  /**
   Flags a touchstart or pointer event so that we can determine if an event originates from a touch screen interaction
   or from a mouse interaction. An event originating from a mouse interaction should shift the focus to the input,
   while an event originating from a touch interaction should not change the focus. On a touch screen, if the user
   presses the increment or decrement button, focus should not shift to the input and open the software keyboard.
 
   @ignore
   */
  _onTouchStart(event) {
    if (event.type === 'touchstart' || event.pointerType !== 'mouse' && event.pointerType !== MSPOINTER_TYPE_MOUSE) {
      flagTouchStart = true;
    }
  }
  
  /**
   Per WAI-ARIA spinbutton design pattern, http://www.w3.org/TR/wai-aria-practices/#spinbutton, shift focus to the
   input if it does not currently have focus. We make an exception for touch devices, because a better user
   experience is for the focus to remain on an increment or decrement button without shifting focus and opening the
   soft keyboard.
 
   @ignore
   */
  _setFocusToInput() {
    if (!flagTouchStart && document.activeElement !== this._elements.input) {
      this._elements.input.focus();
    }
    flagTouchStart = false;
  }
  
  /**
   Handles the click on the step up button. It causes the NumberInput to step up its value and returns the focus back
   to the input. This way the clicked button does not get focus.
 
   @emits {change}
   @ignore
   */
  _onStepUpButtonClick(event) {
    event.preventDefault();
  
    // stores the old value before stepup
    const oldValue = this.value;
  
    flagStepButtonClick = event.type === 'click';
  
    this._setFocusToInput();
  
    this.stepUp();
  
    // we only do this on user interaction
    this._validateInputValue();
  
    // checks if we need to trigger a change event
    this._triggerChange(this.value, oldValue);
  }
  
  /**
   Handles the click on the step down button. It causes the NumberInput to step down its value and returns the focus
   back to the input. This way the clicked button does not get focus.
 
   @emits {change}
   @ignore
   */
  _onStepDownButtonClick(event) {
    event.preventDefault();
  
    // stores the old value before stepdown
    const oldValue = this.value;
  
    flagStepButtonClick = event.type === 'click';
  
    this._setFocusToInput();
  
    this.stepDown();
  
    // we only do this on user interaction
    this._validateInputValue();
  
    // checks if we need to trigger a change event
    this._triggerChange(this.value, oldValue);
  }
  
  /**
   Handles the home key press. If a max has been set, the value will be modified to match it, otherwise the key is
   ignored.
   
   @ignore
   */
  _onKeyHome(event) {
    event.preventDefault();
    
    // stops interaction if the numberinput is disabled or readonly
    if (this.disabled || this.readOnly) {
      return;
    }
    
    // sets the max value only if it exists
    if (this.max !== null) {
      // stores the old value before setting the max
      const oldValue = this.value;
      
      // When appropriate flagStepButtonClick will trigger a live region update.
      flagStepButtonClick = true;
      
      this.value = this.max;
      
      // checks if we need to trigger a change event
      this._triggerChange(this.value, oldValue);
    }
    
    this._setFocusToInput();
  }
  
  /**
   Handles the end key press. If a min has been set, the value will be modified to match it, otherwise the key is
   ignored.
   
   @ignore
   */
  _onKeyEnd(event) {
    event.preventDefault();
    
    // stops interaction if the numberinput is disabled or readonly
    if (this.disabled || this.readOnly) {
      return;
    }
    
    // sets the min value only if it exists
    if (this.min !== null) {
      // stores the old value before setting the min
      const oldValue = this.value;
      
      // When appropriate, flagStepButtonClick will trigger a live region update.
      flagStepButtonClick = true;
      
      this.value = this.min;
      
      // checks if we need to trigger a change event
      this._triggerChange(this.value, oldValue);
    }
    
    this._setFocusToInput();
  }
  
  /**
   Handles the up action by steping up the NumberInput. It prevents the default action.
   
   @ignore
   */
  _onKeyUp(event) {
    event.preventDefault();
    
    // stops interaction if the numberinput is disabled or readonly
    if (this.disabled || this.readOnly) {
      return;
    }
    
    this._onStepUpButtonClick(event);
  }
  
  /**
   Handles the down action by steping down the NumberInput. It prevents the default action.
   
   @ignore
   */
  _onKeyDown(event) {
    event.preventDefault();
    
    // stops interaction if the numberinput is disabled or readonly
    if (this.disabled || this.readOnly) {
      return;
    }
    
    this._onStepDownButtonClick(event);
  }
  
  /**
   Handles the Mousewheel to increment/decrement values.
   
   @ignore
   */
  _onInputMouseWheel(event) {
    // stops interaction if the numberinput is disabled or readonly or is not focused (this is the case where its hovered but not focused)
    if (this.disabled || this.readOnly || this._elements.input !== document.activeElement) {
      return;
    }
    
    // else we prevent the default event like user scrolling the page and handle the mouse wheel input
    event.preventDefault();
    
    // stores the old value to calculate the change
    const oldValue = this.value;
    
    const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail || event.deltaY));
    if (delta < 0) {
      this.stepDown();
    }
    else {
      this.stepUp();
    }
    
    // checks if we need to trigger a change event
    this._triggerChange(this.value, oldValue);
  }
  
  /**
   Overrides the method from formField to be able to add validation after the user has changed the value.
   
   @private
   */
  _onInputChange(event) {
    // stops the current event
    event.stopPropagation();
    
    // we only do this on user interaction
    this._validateInputValue();
    
    // we force the sync of the value,invalid and disabled properties
    this.value = this.value;
    this.invalid = this.invalid;
    this.disabled = this.disabled;
    
    // we always trigger a change since it came from user interaction
    this.trigger('change');
  }
  
  /**
   Handles focus event.
   
   @ignore
   */
  _onFocus() {
    this.classList.add('is-focused');
    this._elements.input.classList.add('is-focused');
    this._elements.liveregion.removeAttribute('role');
    this._elements.liveregion.removeAttribute('aria-hidden');
  }
  
  /**
   Handles blur event.
   
   @ignore
   */
  _onBlur() {
    this.classList.remove('is-focused');
    this._elements.input.classList.remove('is-focused');
    
    // clear liveregion
    this._elements.liveregion.setAttribute('role', 'presentation');
    this._elements.liveregion.setAttribute('aria-hidden', true);
    this._clearLiveRegion();
  }
  
  /** @ignore */
  _clearLiveRegion() {
    const liveregion = this._elements.liveregion;
    if (liveregion.firstChild) {
      liveregion.removeChild(liveregion.firstChild);
    }
  }
  
  /** @ignore */
  _updateLiveRegion(value) {
    let textNode;
    
    clearTimeout(clearLiveRegionTimeout);
    this._clearLiveRegion();
    
    if (value && value !== '') {
      textNode = document.createTextNode(value);
      window.requestAnimationFrame(() => {
        this._elements.liveregion.appendChild(textNode);
        
        clearLiveRegionTimeout = setTimeout(() => {
          this._clearLiveRegion();
        }, LIVEREGION_TIMEOUT_DELAY);
      });
    }
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'min',
      'max',
      'step',
      'placeholder'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._step) { this.step = 1; }
  
    // a11y
    this.setAttribute('role', 'group');
  
    if (this._elements.input.type === 'text') {
      this._elements.input.setAttribute('role', 'spinbutton');
    }
  
    // sets the very initial aria values, in case the 'value' property is never set
    this._elements.input.setAttribute('aria-valuenow', '');
    this._elements.input.setAttribute('aria-valuetext', '');
    
    const frag = document.createDocumentFragment();
  
    const templateHandleNames = ['presentation', 'input'];
    
    // Render main template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.presentation);
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the frag
        frag.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
    
    this.appendChild(frag);
  }
}

export default NumberInput;
