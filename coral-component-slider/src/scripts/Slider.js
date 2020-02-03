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
import {Collection} from '../../../coral-collection';
import base from '../templates/base';
import {transform, validate, events, commons, Keys} from '../../../coral-utils';

const CLASSNAME = '_coral-Slider';
const CLASSNAME_HANDLE = '_coral-Slider-handle';
const CLASSNAME_INPUT = '_coral-Slider-input';

/**
 Enumeration for {@link Slider} orientations.
 
 @typedef {Object} SliderOrientationEnum
 
 @property {String} HORIZONTAL
 Horizontal slider.
 @property {String} VERTICAL
 Not supported. Falls back to HORIZONTAL.
 */
const orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

/**
 @class Coral.Slider
 @classdesc A Slider component is a form field that can be used to set a number within a range.
 @htmltag coral-slider
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Slider extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    this._delegateEvents(commons.extend(this._events, {
      'key:up ._coral-Slider-handle': '_handleKey',
      'key:right ._coral-Slider-handle': '_handleKey',
      'key:down ._coral-Slider-handle': '_handleKey',
      'key:left ._coral-Slider-handle': '_handleKey',
      'key:pageUp ._coral-Slider-handle': '_handleKey',
      'key:pageDown ._coral-Slider-handle': '_handleKey',
      'key:home ._coral-Slider-handle': '_handleKey',
      'key:end ._coral-Slider-handle': '_handleKey',
      
      'input': '_onInputChangeHandler',
  
      'touchstart': '_onMouseDown',
      'mousedown': '_onMouseDown',
  
      'capture:focus': '_focus',
      'capture:blur': '_blur'
    }));
    
    // Prepare templates
    this._elements = {};
    this._getTemplate().call(this._elements, {commons});
  
    // Pre-define labellable element
    this._labellableElement = this._elements.leftInput;
  
    // Content zone
    this._elements.content = this.querySelector('coral-slider-content') || document.createElement('coral-slider-content');
  
    // Additional shortcuts
    const handleContainer = this._elements.controls;
    this._elements.handles = Array.prototype.slice.call(handleContainer.querySelectorAll(`.${CLASSNAME_HANDLE}`));
    this._elements.inputs = Array.prototype.slice.call(handleContainer.querySelectorAll(`.${CLASSNAME_INPUT}`));
  
    // Binding
    this._onInteraction = this._onInteraction.bind(this);
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The slider's content.
   
   @type {SliderContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-slider-content',
      insert: function(content) {
        this._elements.labelContent.appendChild(content);
      }
    });
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-slider-item'
      });
    }
    return this._items;
  }
  
  /**
   Increment value of one step.
   
   @type {Number}
   @default 1
   @htmlattribute step
   @htmlattributereflected
   */
  get step() {
    return this._getValueOf('step', 1);
  }
  set step(value) {
    value = transform.number(value);
    if (value > 0) {
      this._step = value;
      this._reflectAttribute('step', this._step);
      
      this._elements.inputs.forEach((input) => {
        input.setAttribute('step', this._step);
      });
    }
  }
  
  /**
   The minimum value.
   
   @type {Number}
   @default 1
   @htmlattribute min
   @htmlattributereflected
   */
  get min() {
    return this._getValueOf('min', 1);
  }
  set min(value) {
    this._min = transform.number(value);
    this._reflectAttribute('min', this._min);
    
    this._elements.inputs.forEach((input) => {
      input.setAttribute('min', this._min);
    });
  }
  
  /**
   The maximum value.
   
   @type {Number}
   @default 100
   @htmlattribute max
   @htmlattributereflected
   */
  get max() {
    return this._getValueOf('max', 100);
  }
  set max(value) {
    this._max = transform.number(value);
    this._reflectAttribute('max', this._max);
    
    this._elements.inputs.forEach((input) => {
      input.setAttribute('max', this._max);
    });
  }
  
  /**
   @ignore
   
   Not supported anymore. Use "showValue" instead.
   */
  get tooltips() {
    return this.showValue;
  }
  set tooltips(value) {
    this.showValue = value;
  }
  
  /**
   Display the slider value.
   
   @type {Boolean}
   @default false
   @htmlattribute showvalue
   @htmlattributereflected
   */
  get showValue() {
    return this._showValue || false;
  }
  set showValue(value) {
    this._showValue = transform.booleanAttr(value);
    this._reflectAttribute('showvalue', this._showValue);
    
    this._elements.labelValue.hidden = !this._showValue;
  }
  
  /**
   Orientation of the slider. See {@link SliderOrientationEnum}.
   
   @type {String}
   @default SliderOrientationEnum.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   */
  get orientation() {
    return this._orientation || orientation.HORIZONTAL;
  }
  set orientation(value) {
    value = transform.string(value).toLowerCase();
    this._orientation = validate.enumeration(orientation)(value) && value || orientation.HORIZONTAL;
    this._reflectAttribute('orientation', this._orientation);
  }
  
  /**
   Fill a value or value range using a highlight color.
   
   @type {Boolean}
   @default false
   @htmlattribute filled
   @htmlattributereflected
   */
  get filled() {
    return this._filled || false;
  }
  set filled(value) {
    this._filled = transform.booleanAttr(value);
    this._reflectAttribute('filled', this._filled);
    
    this.classList.toggle(`${CLASSNAME}--filled`, this._filled);
  }
  
  /**
   The value returned as a Number. Value is <code>NaN</code> if conversion to Number is not possible.
   
   @type {Number}
   @default NaN
   */
  get valueAsNumber() {
    return parseFloat(this.value);
  }
  set valueAsNumber(value) {
    this.value = transform.float(value);
  }
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._elements.inputs[0].name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.inputs.forEach((input) => {
      input.name = this.getAttribute('name');
    });
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._elements.inputs[0].value;
  }
  set value(value) {
    value = transform.number(value);
    
    // setting the value should always set the first value
    if (this._elements.handles.length === 1) {
      const input = this._elements.inputs[0];
      
      value = this._snapValueToStep(value, this.min, this.max, this.step);
      
      input.value = value;
      if (input.value) {
        input.setAttribute('aria-valuenow', value);
        input.setAttribute('aria-valuetext', this._getLabel(value));
      }
      else {
        input.removeAttribute('aria-valuenow');
        input.removeAttribute('aria-valuetext');
      }
      
      this._moveHandles();
      
      // in order to keep the reset value in sync, we need to handle the "value" attribute of the inner input
      const valueAttribute = this.getAttribute('value');
      input[valueAttribute ? 'setAttribute' : 'removeAttribute']('value', valueAttribute);
    }
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
    
    this.classList.toggle('is-disabled', this._disabled);
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this._elements.inputs.forEach((input) => {
      input.disabled = this._disabled;
    });
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
    
    this._elements.inputs.forEach((input) => {
      input.required = this._required;
    });
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
    
    this._elements.inputs.forEach((input) => {
      input.readOnly = this._readOnly;
    });
  }
  
  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
    
    if (this._elements.inputs.length > 1) {
      const input = this._elements.inputs[1];
      const labelledBy = this.labelledBy;
      
      input[labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', labelledBy);
    }
  }
  
  /** @private */
  get _values() {
    return this._elements.inputs.map((input) => String(parseInt(input.value, 10)));
  }
  set _values(values) {
    if (values && values.length === this._elements.handles.length) {
      this._elements.inputs.forEach((input, i) => {
        const value = values[i] = this._snapValueToStep(values[i], this.min, this.max, this.step);
      
        input.value = value;
        if (input.value) {
          input.setAttribute('aria-valuenow', value);
          input.setAttribute('aria-valuetext', this._getLabel(value));
        }
        else {
          input.removeAttribute('aria-valuenow');
          input.removeAttribute('aria-valuetext');
        }
      });
    
      this._moveHandles();
    }
  }
  
  /** @private */
  _getValueOf(name, defaultValue) {
    if (typeof this[`_${name}`] === 'number') {
      return this[`_${name}`];
    }
    else if (this.hasAttribute(name)) {
      return parseFloat(this.getAttribute(name));
    }
    
    return defaultValue;
  }
  
  /**
   handles any mousedown/touchstart on the whole slider
   @private
   */
  _onMouseDown(event) {
    if (this.disabled) {
      return;
    }
    
    // do not accept right mouse button clicks
    if (event instanceof MouseEvent) {
      if ((event.which || event.button) !== 1) {
        return;
      }
    }
    
    event.preventDefault();
    
    this._currentHandle = event.target.closest(`.${CLASSNAME_HANDLE}`);
    
    // If no handle was touched:
    // the closest handle needs to jump to the closest valid position
    if (!this._currentHandle) {
      const p = this._getPoint(event);
      const val = this._getValueFromCoord(p.pageX, p.pageY, true);
      
      this._currentHandle = this._findNearestHandle(p.pageX, p.pageY);
      this._updateValue(this._currentHandle, val);
      this._setHandleFocus(this._currentHandle);
    }
    
    this._currentHandle.classList.add('is-dragged');
    document.body.classList.add('u-coral-closedHand');
    
    this._draggingHandler = this._handleDragging.bind(this);
    this._mouseUpHandler = this._mouseUp.bind(this);
    
    events.on('mousemove.Slider', this._draggingHandler);
    events.on('mouseup.Slider', this._mouseUpHandler);
    
    events.on('touchmove.Slider', this._draggingHandler);
    events.on('touchend.Slider', this._mouseUpHandler);
    events.on('touchcancel.Slider', this._mouseUpHandler);
    
    this._setHandleFocus(this._currentHandle);
  }
  
  /**
   @private
   @return {Object} which contains the real coordinates
   */
  _getPoint(event) {
    if (event.changedTouches && event.changedTouches.length > 0) {
      return event.changedTouches[0];
    }
    else if (event.touches && event.touches.length > 0) {
      return event.touches[0];
    }
    
    return event;
  }
  
  /**
   will set the focus either on the handle element
   or its input if range is supported
   
   @protected
   */
  _setHandleFocus(handle) {
    handle.querySelector(`.${CLASSNAME_INPUT}`).focus();
  }
  
  /**
   Handles keyboard interaction with the handlers.
   In case input[type=range] is supported, the focus
   will be on the input and keyboard handling will happen natively
   
   @private
   */
  _handleKey(event) {
    event.preventDefault();
    
    this._focus(event);
    
    const handle = event.matchedTarget;
    const idx = this._elements.handles.indexOf(handle);
    let v = parseInt(this._values[idx], 10);
  
    // increase
    if (event.keyCode === Keys.keyToCode('up') ||
      event.keyCode === Keys.keyToCode('right') ||
      event.keyCode === Keys.keyToCode('pageUp')) {
      v += this.step;
    }
    // decrease
    else if (event.keyCode === Keys.keyToCode('down') ||
      event.keyCode === Keys.keyToCode('left') ||
      event.keyCode === Keys.keyToCode('pageDown')) {
      v -= this.step;
    }
    // min
    else if (event.keyCode === Keys.keyToCode('home')) {
      v = this.min;
    }
    // max
    else if (event.keyCode === Keys.keyToCode('end')) {
      v = this.max;
    }
    
    this._updateValue(handle, v);
  }
  
  /**
   Finds the nearest handle based on X/Y coordinates
   
   @private
   */
  _findNearestHandle(mouseX, mouseY) {
    let closestDistance = Infinity;
    let closestHandle;
    
    function calculateDistance(elem, x, y) {
      const box = elem.getBoundingClientRect();
      const top = box.top + window.pageYOffset;
      const left = box.left + window.pageXOffset;
      
      return Math.floor(
        Math.sqrt(Math.pow(x - (left + box.width / 2), 2) + Math.pow(y - (top + box.height / 2), 2))
      );
    }
    
    // Find the nearest handle
    this._elements.handles.forEach((handle) => {
      const distance = calculateDistance(handle, mouseX, mouseY);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestHandle = handle;
      }
    });
    
    return closestHandle;
  }
  
  /**
   Moves the handles to right position
   based on the data in this._values
   
   @private
   */
  _moveHandles() {
    const calculatePercent = (value) => (value - this.min) / (this.max - this.min) * 100;
    const labelValue = [];
    
    // Set the handle position as a percentage based on the stored values
    if (this._elements.handles.length === 1) {
      const handle = this._elements.handles[0];
      const percent = calculatePercent(this._values[0]);
      handle.style.left = `${percent}%`;
      
      handle.previousElementSibling.style.width = `${percent}%`;
      handle.nextElementSibling.style.width = `${100 - percent}%`;
  
      labelValue.push(this._getLabel(this._values[0]));
    }
    else {
      const leftHandle = this._elements.handles[0];
      const leftPercent = calculatePercent(this._values[0]);
      leftHandle.style.left = `${leftPercent}%`;
      
      const rightHandle = this._elements.handles[1];
      const rightPercent = calculatePercent(this._values[1]);
      rightHandle.style.left = `${rightPercent}%`;
  
      leftHandle.previousElementSibling.style.width = `${leftPercent}%`;
      leftHandle.nextElementSibling.style.left = `${leftPercent}%`;
      
      const middlePercent = 100 - rightPercent;
      leftHandle.nextElementSibling.style.right = `${middlePercent}%`;
      rightHandle.nextElementSibling.style.width = `${middlePercent}%`;
  
      labelValue.push(this._getLabel(this._values[0]));
      labelValue.push(this._getLabel(this._values[1]));
    }
    
    this._elements.labelValue.textContent = labelValue.length > 1 ? labelValue.join(' - ') : labelValue[0];
  }
  
  /**
   Handles "onchange" events from the input.
   This is only neede in case of IE10 which doesn't handle "oninput event".
   In that case, the _onInputChangeHandler will be called from this handler.
   
   @private
   */
  _onInputChange(event) {
    if (typeof event.target.oninput === 'undefined') {
      this._onInputChangeHandler(event);
    }
  }
  
  /**
   Handles "oninput" events from the input.
   This makes ensures native inputs like
   - direct keyboard interaction with input[type=range]
   - accessibility features with input[type=range]
   
   Note we are not using the "_onInputChange" directly because Firefox
   will trigger the "change" event only after the focus has been lost.
   
   @private
   */
  _onInputChangeHandler(event) {
    // stops the current event
    event.stopPropagation();
    
    const handle = event.target.closest(`.${CLASSNAME_HANDLE}`);
    
    if (event.target === document.activeElement) {
      this._focus(event);
    }
    
    this._updateValue(handle, event.target.value, true);
  }
  
  /**
   Handles "focusin" event from  either an input or its handle.
   
   @private
   */
  _focus(event) {
    // Depending on support for input[type=range],
    // the event.target could be either the handle or its child input.
    // Use closest() to locate the actual handle.
    event.target.closest(`.${CLASSNAME_HANDLE}`).classList.add('is-focused');
    
    events.on('touchstart.Slider', this._onInteraction);
    events.on('mousedown.Slider', this._onInteraction);
  }
  
  /**
   Handles the blur
   
   @private
   */
  _onInteraction(event) {
    if (!this.contains(event.target)) {
      return;
    }
    event.target.blur();
  }
  
  /**
   Handles "focusout" event from  either an input or its handle.
   
   @private
   */
  _blur(event) {
    // Depending on support for input[type=range],
    // the event.target could be either the handle or its child input.
    // Use closest() to locate the actual handle.
    event.target.closest(`.${CLASSNAME_HANDLE}`).classList.remove('is-focused');
    
    events.off('touchstart.Slider');
    events.off('mousedown.Slider');
  }
  
  /**
   handles mousemove/touchmove after a succesful start on an handle
   
   @private
   */
  _handleDragging(event) {
    const p = this._getPoint(event);
    
    this._updateValue(this._currentHandle, this._getValueFromCoord(p.pageX, p.pageY));
    
    event.preventDefault();
  }
  
  /**
   updates the value for a handle
   @param handle
   @param val
   @param {Boolean} forceEvent
   Always triggers the event. If <code>true</code> the change event will be triggered without checking if the value really changed. This is useful if we are called from something like the _onInputChange where new value has already been updated AND we are certain the change event should be triggered without checking.
   @protected
   */
  _updateValue(handle, val, forceEvent) {
    // this is prepared to work for multiple handles
    const idx = this._elements.handles.indexOf(handle);
    const values = this._values;
    
    values[idx] = val;
    
    const oldValues = this._values;
    this._values = values;
    const newValues = this._values;
    
    if (forceEvent || oldValues.join(':') !== newValues.join(':')) {
      this.trigger('change');
    }
  }
  
  /** @private */
  // eslint-disable-next-line no-unused-vars
  _getValueFromCoord(posX, posY, restrictBounds) {
    const boundingClientRect = this.getBoundingClientRect();
    const elementWidth = boundingClientRect.width;
    const percent = (posX - boundingClientRect.left) / elementWidth;
    
    // if the bounds are restricted, as with _handleClick, we shouldn't change the value.
    if (restrictBounds && (percent < 0 || percent > 1)) {
      return NaN;
    }
    
    const rawValue = this.min + (this.max - this.min) * percent;
    
    // Snap value to nearest step
    return this._snapValueToStep(rawValue, this.min, this.max, this.step);
  }
  
  /** @private */
  _snapValueToStep(rawValue, min, max, step) {
    step = parseFloat(step);
    const remainder = (rawValue - min) % step;
    const floatString = step.toString().replace(/^(?:\d+)(?:\.(\d+))?$/g, '$1');
    const precision = floatString.length;
    let snappedValue;
    
    if (Math.abs(remainder) * 2 >= step) {
      snappedValue = rawValue - Math.abs(remainder) + step;
    }
    else {
      snappedValue = rawValue - remainder;
    }
    
    if (snappedValue < min) {
      snappedValue = min;
    }
    else if (snappedValue > max) {
      snappedValue = min + Math.floor((max - min) / step) * step;
    }
    
    // correct floating point behavior by rounding to step precision
    if (precision > 0) {
      snappedValue = parseFloat(snappedValue.toFixed(precision));
    }
    
    return snappedValue;
  }
  
  /**
   end operation of a dragging flow
   @private
   */
  _mouseUp() {
    this._currentHandle.style.cursor = 'grab';
    this._currentHandle.classList.remove('is-dragged');
    document.body.classList.remove('u-coral-closedHand');
    
    events.off('mousemove.Slider', this._draggingHandler);
    events.off('touchmove.Slider', this._draggingHandler);
    events.off('mouseup.Slider', this._mouseUpHandler);
    events.off('touchend.Slider', this._mouseUpHandler);
    events.off('touchcancel.Slider', this._mouseUpHandler);
    
    this._currentHandle = null;
    this._draggingHandler = null;
    this._mouseUpHandler = null;
  }
  
  /**
   Gets the label for a passed value.
   
   @param value
   @return {String|Number} the known label from the item or the value itself
   @protected
   */
  _getLabel(value) {
    const items = this.items.getAll();
    let item;
    
    for (let i = 0; i < items.length; i++) {
      if (transform.number(items[i].getAttribute('value')) === transform.number(value)) {
        item = items[i];
        break;
      }
    }
    
    // Use the innerHTML of the item if one was found
    return item ? item.innerHTML : value;
  }
  
  // To be overridden by RangedSlider
  _getTemplate() {
    return base;
  }
  
  get _contentZones() { return {'coral-slider-content': 'content'}; }
  
  /**
   Returns {@link Slider} orientation options.
   
   @return {SliderOrientationEnum}
   */
  static get orientation() { return orientation; }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      showvalue: 'showValue'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'step',
      'min',
      'max',
      'tooltips',
      'showvalue',
      'orientation',
      'filled'
    ]);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._min) { this.min = this.min; }
    if (!this._max) { this.max = this.max; }
    if (!this._step) { this.step = this.step; }
    if (!this._orientation) { this.orientation = orientation.HORIZONTAL; }
    
    // A11y
    this.setAttribute('role', 'presentation');
  
    // Support cloneNode
    const template = this.querySelectorAll('._coral-Slider-labelContainer, ._coral-Slider-controls');
    for (let i = 0; i < template.length; i++) {
      template[i].remove();
    }
    
    // Render the main template
    const frag = document.createDocumentFragment();
    frag.appendChild(this._elements.label);
    frag.appendChild(this._elements.controls);
    
    const content = this._elements.content;
    
    // If no default content zone was provided, move everything there
    if (!content.parentNode) {
      // Process remaining elements as necessary
      while (this.firstChild) {
        const child = this.firstChild;
    
        if (child.nodeName === 'CORAL-SLIDER-ITEM') {
          // Add items to the fragment
          frag.appendChild(child);
        }
        else {
          // Add anything else to the content
          content.appendChild(child);
        }
      }
    }
  
    // Add the frag to the component
    this.appendChild(frag);
  
    // Assign the content zone so the insert function will be called
    this.content = content;
  
    // Defaults
    this._moveHandles();
  }
}

export default Slider;
