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

import Component from 'coralui-mixin-component';
import FormField from 'coralui-mixin-formfield';
import {Collection} from 'coralui-collection';
import {Tooltip} from 'coralui-component-tooltip';
import base from '../templates/base';
import {transform, validate, events, commons, Keys} from 'coralui-util';

const CLASSNAME = 'coral3-Slider';
const CLASSNAME_HANDLE = 'coral3-Slider-handle';
const CLASSNAME_INPUT = 'coral3-Slider-input';

/**
 Slider orientations.
 
 @enum {String}
 @memberof Coral.Slider
 */
const orientation = {
  /** Horizontal slider. */
  HORIZONTAL: 'horizontal',
  /** Vertical slider. */
  VERTICAL: 'vertical'
};

/**
 @class Coral.Slider
 @classdesc A Slider component
 @htmltag coral-slider
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class Slider extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
  
    this._delegateEvents(commons.extend(this._events, {
      'key:up .coral3-Slider-handle': '_handleKey',
      'key:right .coral3-Slider-handle': '_handleKey',
      'key:down .coral3-Slider-handle': '_handleKey',
      'key:left .coral3-Slider-handle': '_handleKey',
      'key:pageUp .coral3-Slider-handle': '_handleKey',
      'key:pageDown .coral3-Slider-handle': '_handleKey',
      'key:home .coral3-Slider-handle': '_handleKey',
      'key:end .coral3-Slider-handle': '_handleKey',
  
      'capture:mouseenter .coral3-Slider-handle': '_onMouseEnter',
      'capture:mouseleave .coral3-Slider-handle': '_onMouseLeave',
  
      'input': '_onInputChangeHandler',
  
      'touchstart': '_onMouseDown',
      'mousedown': '_onMouseDown',
  
      'capture:focus': '_focus',
      'capture:blur': '_blur'
    }));
    
    // Prepare templates
    this._elements = {};
    this._getTemplate().call(this._elements);
  
    // Additional shortcuts
    const handleContainer = this._elements.handleContainer;
    this._elements.handles = Array.prototype.slice.call(handleContainer.querySelectorAll(`.${CLASSNAME_HANDLE}`));
    this._elements.inputs = Array.prototype.slice.call(handleContainer.querySelectorAll(`.${CLASSNAME_INPUT}`));
  
    // Binding
    this._onInteraction = this._onInteraction.bind(this);
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains. See
   {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Slider#
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
   @memberof Coral.Slider#
   */
  get step() {
    return this._getValueOf('step', 1);
  }
  set step(value) {
    value = transform.number(value);
    if (value > 0) {
      this._step = value;
      this._reflectAttribute('step', this._step);
  
      this.setAttribute('aria-valuestep', this._step);
      this._elements.inputs.forEach((input) => {
        input.setAttribute('step', this._step);
        input.setAttribute('aria-valuestep', this._step);
      }, this);
    }
  }
  
  /**
   The minimum value.
   
   @type {Number}
   @default 1
   @htmlattribute min
   @htmlattributereflected
   @memberof Coral.Slider#
   */
  get min() {
    return this._getValueOf('min', 1);
  }
  set min(value) {
    this._min = transform.number(value);
    this._reflectAttribute('min', this._min);
  
    this.setAttribute('aria-valuemin', this._min);
    this._elements.inputs.forEach((input) => {
      input.setAttribute('min', this._min);
      input.setAttribute('aria-valuemin', this._min);
    }, this);
  }
  
  /**
   The maximum value.
   
   @type {Number}
   @default 100
   @htmlattribute max
   @htmlattributereflected
   @memberof Coral.Slider#
   */
  get max() {
    return this._getValueOf('max', 100);
  }
  set max(value) {
    this._max = transform.number(value);
    this._reflectAttribute('max', this._max);
  
    this.setAttribute('aria-valuemax', this._max);
    this._elements.inputs.forEach((input) => {
      input.setAttribute('max', this._max);
      input.setAttribute('aria-valuemax', this._max);
    }, this);
  }
  
  /**
   Display tooltips for the slider value.
   
   @type {Boolean}
   @default false
   @htmlattribute tooltips
   @htmlattributereflected
   @memberof Coral.Slider#
   */
  get tooltips() {
    return this._tooltips || false;
  }
  set tooltips(value) {
    this._tooltips = transform.booleanAttr(value);
    this._reflectAttribute('tooltips', this._tooltips);
  }
  
  /**
   Orientation of the slider, which can be VERTICAL or HORIZONTAL.
   
   @type {Coral.Slider.orientation}
   @default Coral.Slider.orientation.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   @memberof Coral.Slider#
   */
  get orientation() {
    return this._orientation || orientation.HORIZONTAL;
  }
  set orientation(value) {
    value = transform.string(value).toLowerCase();
    this._orientation = validate.enumeration(orientation)(value) && value || orientation.HORIZONTAL;
    this._reflectAttribute('orientation', this._orientation);
    
    const isVertical = this._orientation === orientation.VERTICAL;
    
    this.classList.toggle(`${CLASSNAME}--vertical`, isVertical);
    this.setAttribute('aria-orientation', this._orientation);
    this._elements.inputs.forEach((input) => {
      input.setAttribute('aria-orientation', this._orientation);
    }, this);
  
    this._moveHandles();
  
    this._updateFill();
  }
  
  /**
   Fill a value or value range using a highlight color.
   
   @type {Boolean}
   @default false
   @htmlattribute filled
   @htmlattributereflected
   @memberof Coral.Slider#
   */
  get filled() {
    return this._filled || false;
  }
  set filled(value) {
    this._filled = transform.booleanAttr(value);
    this._reflectAttribute('filled', this._filled);
  
    if (this._filled) {
      this._updateFill();
    }
    this._elements.fillHandle.classList.toggle('is-hidden', !this._filled);
  }
  
  /**
   The value returned as a Number. Value is <code>NaN</code> if conversion to Number is not possible.
   
   @type {Number}
   @default NaN
   @memberof Coral.Slider#
   */
  get valueAsNumber() {
    return parseFloat(this.value);
  }
  set valueAsNumber(value) {
    this.value = transform.float(value);
  }
  
  // JSDoc inherited
  get name() {
    return this._elements.inputs[0].name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.inputs.forEach((input) => {
      input.name = this.getAttribute('name');
    }, this);
  }
  
  // JSDoc inherited
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
      input.setAttribute('aria-valuenow', value);
      input.setAttribute('aria-valuetext', this._getLabel(value));
      
      this._moveHandles();
      
      // in order to keep the reset value in sync, we need to handle the "value" attribute of the inner input
      const valueAttribute = this.getAttribute('value');
      input[valueAttribute ? 'setAttribute' : 'removeAttribute']('value', valueAttribute);
    }
  
    this._updateFill();
  }
  
  // JSDoc inherited
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.setAttribute('aria-disabled', this._disabled);
    this._elements.inputs.forEach((input) => {
      input.disabled = this._disabled;
    }, this);
  }
  
  // JSDoc inherited
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    this.setAttribute('aria-required', this._required);
    this._elements.inputs.forEach((input) => {
      input.required = this._required;
    }, this);
  }
  
  // JSDoc inherited
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    
    this.setAttribute('aria-readonly', this._readOnly);
    this._elements.inputs.forEach((input) => {
      input.readOnly = this._readOnly;
    }, this);
  }
  
  // JSDoc inherited
  get labelledBy() {
    return this._elements.handles.length === 1 ? this._elements.inputs[0].getAttribute('aria-labelledby') : this.getAttribute('aria-labelledby');
  }
  set labelledBy(value) {
    this._labelledBy = transform.string(value);
  
    // Removing the labels
    if (!this._labelledBy) {
      this._updateForAttributes(this.labelledBy, this._elements.inputs[0].id, true);
      this.removeAttribute('aria-labelledby');
    
      this._elements.handles.forEach((handle, i) => {
        handle.removeAttribute('aria-labelledby');
        this._elements.inputs[i].removeAttribute('aria-labelledby');
      }, this);
    }
    // Adding labels
    else {
      if (this._elements.handles.length === 1) {
        this._elements.handles[0].setAttribute('aria-labelledby', this._labelledBy);
        this._elements.inputs[0].setAttribute('aria-labelledby', this._labelledBy);
      }
      else {
        this.setAttribute('aria-labelledby', this._labelledBy);
    
        this._elements.handles.forEach((handle, i) => {
          const label = `${this._labelledBy} ${handle.querySelector('label').id}`;
      
          handle.setAttribute('aria-labelledby', label);
          this._elements.inputs[i].setAttribute('aria-labelledby', label);
        }, this);
      }
      
      this._updateForAttributes(this._labelledBy, this._elements.inputs[0].id);
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
        input.setAttribute('aria-valuenow', value);
        input.setAttribute('aria-valuetext', this._getLabel(value));
      }, this);
    
      this._moveHandles();
    }
  
    this._updateFill();
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
    
    if (this.tooltips) {
      const idx = this._elements.handles.indexOf(this._currentHandle);
      this._openTooltip(this._currentHandle, this._getLabel(this._values[idx]));
    }
    
    this._draggingHandler = this._handleDragging.bind(this);
    this._mouseUpHandler = this._mouseUp.bind(this);
    
    events.on('mousemove', this._draggingHandler);
    events.on('mouseup', this._mouseUpHandler);
    
    events.on('touchmove', this._draggingHandler);
    events.on('touchend', this._mouseUpHandler);
    events.on('touchcancel', this._mouseUpHandler);
    
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
      const box = elem.getBoundingClientRect(),
        top = box.top + window.pageYOffset,
        left = box.left + window.pageXOffset;
      
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
    const self = this;
    const calculatePercent = (value) => (value - self.min) / (self.max - self.min) * 100;
    
    // Set the handle position as a percentage based on the stored values
    this._elements.handles.forEach((handle, index) => {
      const percent = calculatePercent(this._values[index]);
      
      if (this.orientation === orientation.VERTICAL) {
        handle.style.bottom = `${percent}%`;
        handle.style.left = '';
      }
      // Horizontal
      else {
        handle.style.left = `${percent}%`;
        handle.style.bottom = '';
      }
      
      this._updateTooltip(handle, this._getLabel(this._values[index]));
    }, this);
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
    const handle = event.target.closest(`.${CLASSNAME_HANDLE}`);
    const index = this._elements.handles.indexOf(handle);
    
    this.classList.add('is-focused');
    handle.classList.add('is-focused');
    
    if (this.tooltips) {
      this._openTooltip(handle, this._getLabel(this._values[index]));
    }
    
    events.on('touchstart.CoralSlider', this._onInteraction);
    events.on('mousedown.CoralSlider', this._onInteraction);
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
    const handle = event.target.closest(`.${CLASSNAME_HANDLE}`);
    
    this.classList.remove('is-focused');
    handle.classList.remove('is-focused');
    
    if (this.tooltips) {
      this._closeTooltip(handle);
    }
    
    events.off('.CoralSlider');
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
  _getValueFromCoord(posX, posY, restrictBounds) {
    let percent;
    const boundingClientRect = this.getBoundingClientRect();
    
    if (this.orientation === orientation.VERTICAL) {
      const elementHeight = boundingClientRect.height;
      percent = (boundingClientRect.top + elementHeight - posY) / elementHeight;
    }
    else {
      const elementWidth = boundingClientRect.width;
      percent = (posX - boundingClientRect.left) / elementWidth;
    }
    
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
  
  /** @private */
  _onMouseEnter(event) {
    const handle = event.matchedTarget;
    const index = this._elements.handles.indexOf(handle);
    
    if (this.tooltips) {
      this._openTooltip(handle, this._getLabel(this._values[index]));
    }
  }
  
  /** @private */
  _onMouseLeave(event) {
    const handle = event.matchedTarget;
    
    // in case the user drags the handle
    // we do not close the tooltip
    if (this.tooltips && !handle.classList.contains('is-dragged')) {
      this._closeTooltip(handle);
    }
  }
  
  /**
   end operation of a dragging flow
   @private
   */
  _mouseUp() {
    this._currentHandle.classList.remove('is-dragged');
    document.body.classList.remove('u-coral-closedHand');
    
    this._closeTooltip(this._currentHandle);
    
    events.off('mousemove', this._draggingHandler);
    events.off('touchmove', this._draggingHandler);
    events.off('mouseup', this._mouseUpHandler);
    events.off('touchend', this._mouseUpHandler);
    events.off('touchcancel', this._mouseUpHandler);
    
    this._currentHandle = null;
    this._draggingHandler = null;
    this._mouseUpHandler = null;
  }
  
  /**
   called when it is necessary to update the fill
   @protected
   */
  _updateFill() {
    const percent = (this._values[0] - this.min) / (this.max - this.min) * 100;
    
    if (this.orientation === orientation.VERTICAL) {
      this._elements.fillHandle.style.height = `${percent}%`;
      this._elements.fillHandle.style.width = '';
    }
    else {
      this._elements.fillHandle.style.height = '';
      this._elements.fillHandle.style.width = `${percent}%`;
    }
  }
  
  /**
   Opens the tooltip of a handle
   @protected
   */
  _openTooltip(handle, value) {
    const tooltip = handle.querySelector('coral-tooltip');
    const placement = this.orientation === orientation.VERTICAL ? Tooltip.placement.RIGHT : Tooltip.placement.TOP;
    
    tooltip.set({
      content: {
        textContent: value
      },
      target: handle,
      placement: placement
    });
    
    tooltip.open = true;
  }
  
  /**
   Updates the tooltip of a handle
   @protected
   */
  _updateTooltip(handle, value) {
    const tooltip = handle.querySelector('coral-tooltip');
    tooltip.content.textContent = value;
  }
  
  /**
   Closes the tooltip of a handle
   @protected
   */
  _closeTooltip(handle) {
    const tooltip = handle.querySelector('coral-tooltip');
    tooltip.open = false;
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
      if (transform.number(items[i].value) === transform.number(value)) {
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
  
  // Expose enumerations
  static get orientation() { return orientation; }
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'step',
      'min',
      'max',
      'tooltips',
      'orientation',
      'filled'
    ]);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._min) { this.min = this.min; }
    if (!this._max) { this.max = this.max; }
    if (!this._step) { this.step = this.step; }
    if (!this._orientation) { this.orientation = orientation.HORIZONTAL; }
    
    // A11y
    this.setAttribute('role', 'presentation');
    
    // Create a fragment
    const frag = document.createDocumentFragment();
    
    const templateHandleNames = ['bar', 'handleContainer'];
    
    // Render the main template
    frag.appendChild(this._elements.bar);
    frag.appendChild(this._elements.handleContainer);
  
    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
      
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1 ||
        child.nodeName === 'CORAL-SLIDER-ITEM') {
        // Add non-template elements to the fragment
        frag.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(frag);
  }
}

export default Slider;
