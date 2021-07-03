/**
 * Copyright 2021 Adobe. All rights reserved.
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
import view from '../templates/colorSlider';
import {validate, transform, events, commons, i18n} from '../../../coral-utils';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "./ColorUtil";

const CLASSNAME = '_coral-ColorPicker-ColorSlider';

/**
 @@base ColorSlider
 @classdesc A ColorPicker color slider component
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorSlider extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._delegateEvents(commons.extend(this._events, {
      'key:up ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:right ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:down ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:left ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:pageUp ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:pageDown ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:home ._coral-ColorPicker-ColorSlider': '_handleKey',
      'key:end ._coral-ColorPicker-ColorSlider': '_handleKey',
      
      'input': '_onInputChangeHandler',
      
      'touchstart': '_onMouseDown',
      'mousedown': '_onMouseDown',
      'capture:focus': '_focus',
      'capture:blur': '_blur'
    }));

    // Templates
    this._elements = {};
    view.call(this._elements, {commons, i18n});
    
    // default value
    this._label = "";
    this._value = 180;
    this._color = new TinyColor("hsla(180, 100%, 50%, 1)");
    this._hue = 180;
  }
  
  /** @ignore */ 
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.checkerboard);
    frag.appendChild(this._elements.colorHandle);
    frag.appendChild(this._elements.slider);

    // Support cloneNode
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('handle')) {
        this.removeChild(child);
      } 
      else {
        frag.appendChild(child);
      }
    }

    this.appendChild(frag);
    
    this._syncInputSliderAttrs();
    // These should be used to set a property since property handler aren't called until elements are attached to dom.
    // Attribute values are delivered to change-listeners even if element isn't attached to dom yet, so attributes 
    // can be set to e.g. this._elements.colorHandle.    
    this._handle = this.querySelector('._coral-ColorPicker-ColorSlider-colorHandle');
    this._slider = this.querySelector('._coral-ColorPicker-ColorSlider-slider');
    
    this._calculateValue();
    this._updateValue(this._hue);
  }

  /**   
   The ColorSlider label.
   @default 'Hue'
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get label() {
     return this._label;
  }
  
  set label(value) {
    this._label = value;
    this._reflectAttribute('label', this._label);
    this._syncInputSliderAttrs();
  } 

  /**   
   The ColorSlider value. value should be in multiple of step size.
   @default 0
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get value() {
    return this._value;
  }
  
  set value(value) {
    if(this._value !== value) {
      this._updateValue(value);
    }
  }

  /**
   The ColorSlider color string in hsla format.
   @default hsla(0, 100%, 50%, 1)
   @type {String}
   @htmlattribute color
   @htmlattributereflected
   */   
  get color() {
    return colorUtil.toHslString(this._hue, this._color.toHslString());
  }
  
  set color(value) {
    if(this.color === value) {
       return;
    }
    let color = new TinyColor(value);
    if(!color.isValid) {
      color = new TinyColor("hsla(180, 100%, 50%, 1)");
      value = color.toHslString();
    }
    this._hue = colorUtil.getHue(value);
    this._updateValue(this._hue);
  }
        
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'label',
      'value',
      'disabled',
      'color'
    ]);
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
    this._elements.slider[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.colorHandle[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
  }
  
  focus() {
    this._slider.focus();
  }

// min, max, step and colorFromValue can be overidden by subclasses to customise this picker for other uses. e.g. for alptha channel slider.
  /** @private */
  _min() {
    return 0;
  }
  
  /** @private */ 
  _max() {
    return 100;
  }
  
  /** @private */ 
  _step() {
    return 1;
  }

  /** @private */ 
  _colorFromValue(value) {
    return new TinyColor({ h: value, s: 1, l: .5, a:1 });
  }
      
  /** @private */
  _syncInputSliderAttrs() {
    if(Number(this._elements.slider.getAttribute('min')) !== this._min()) {
      this._elements.slider.setAttribute('min', this._min());
    }
    
    if(Number(this._elements.slider.getAttribute('max')) !== this._max()) {
      this._elements.slider.setAttribute('max', this._max());
    }
    
    if(Number(this._elements.slider.getAttribute('step')) !== this._step()) {
      this._elements.slider.setAttribute('step', this._step());
    }  
    
    if(this._elements.slider.getAttribute('aria-label') !== this._label) {
      this._elements.slider.setAttribute('aria-label', this._label);
    }
  }

  /** @private */  
  _snapValueToStep(rawValue, min, max, step) {
    const remainder = (rawValue - min) % step;
    let snappedValue = rawValue;
    
    if (Math.abs(remainder) * 2 >= step) {
      snappedValue = rawValue - remainder + step;
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
    return snappedValue;
  }
  
  /** @private */
  _updateHandlePosition() {
    const percent = 100 - ((this._value - this._min()) / (this._max() - this._min()) * 100);
    if(this._handle) {
      this._handle.style.top = `${percent}%`;
    }
  }
    
  /** @private */  
  _focusHandle(isFocused) {
    if(this._handle) {
       if(isFocused === true) {
        this._handle.focus();  
      } 
      else {
        this._handle.blur(); 
      }
    }
  }

  /** @private */ 
  _updateValue(value) {
    let rawValue = Number(value, 10);
    if(isNaN(rawValue)) {
      rawValue = this._min();
    }
    
    this._value = this._snapValueToStep(rawValue, this._min(), this._max(),  this._step());
    this._hue = this._value;
    // update color
    this._color = this._colorFromValue(this._value);
    this._elements.colorHandle.setAttribute('color', colorUtil.toHslString(this._hue, this._color.toHslString()));
    this._reflectAttribute('color', colorUtil.toHslString(this._hue, this._color.toHslString()));
    this._reflectAttribute('value', this._value);
    this._elements.slider.setAttribute('value', this._value);
    this._updateHandlePosition();
  }

  /** @private */ 
  _changeValue(value) {
     this._updateValue(value);
     this.trigger('change');
  }

  /** @private */
  _calculateValue() {
    if(this._handle && this._handle.offsetParent)  {
      const handleTop = this._handle.offsetTop + this._handle.offsetHeight/2; // adding  half height to account for margin-top
      const height = this._handle.offsetParent.offsetHeight;
      const positionFraction = (height - handleTop) / height;
      const rawValue = this._min() + positionFraction * (this._max() - this._min());
      this._updateValue(rawValue);
    }
  }

/******* Events Handling **************/

  /** @private */
  _onInputChangeHandler(event) {
    this.focus();
    this._focusHandle(true);
    event.stopPropagation();
    this._changeValue(event.target.value);
  }

  /** @private */
  _handleKey(event) {
    this.focus();
    this._focusHandle(true);
    event.preventDefault();
    let value = this._value;
    // increase
    if (event.keyCode === Keys.keyToCode('up') ||
      event.keyCode === Keys.keyToCode('right') ||
      event.keyCode === Keys.keyToCode('pageUp')) {
      value += this._step();
    }
    // decrease
    else if (event.keyCode === Keys.keyToCode('down') ||
      event.keyCode === Keys.keyToCode('left') ||
      event.keyCode === Keys.keyToCode('pageDown')) {
      value -= this._step();
    }
    // min
    else if (event.keyCode === Keys.keyToCode('home')) {
      value = this._min();
    }
    // max
    else if (event.keyCode === Keys.keyToCode('end')) {
      value = this._max;
    }
    this._changeValue(value);  
  }
   
  /** @private */
  _onMouseDown() {
    if (event instanceof MouseEvent) {
      if ((event.which || event.button) !== 1) {
        return;
      }
    }
    event.preventDefault();
    
    this._handle.classList.add('is-dragged');
    document.body.classList.add('u-coral-closedHand');
    this.focus();
    this._focusHandle(true);
    this._changeValue(this._getValueFromCoord(this._getPoint(event).clientY));
         
    const classNameSelector = "." + CLASSNAME;
    this._draggingHandler = this._handleDragging.bind(this);
    this._mouseUpHandler = this._mouseUp.bind(this);    
    
    events.on('mousemove.CoralSlider', this._draggingHandler);
    events.on('mouseup.CoralSlider', this._mouseUpHandler);

    events.on('touchmove.CoralSlider', this._draggingHandler);
    events.on('touchend.CoralSlider', this._mouseUpHandler);
    events.on('touchcancel.CoralSlider', this._mouseUpHandler);  
  }

  /**  @private */
  _getValueFromCoord(posY) {
    const boundingClientRect = this.getBoundingClientRect();
    const height = boundingClientRect.height;
    if(posY < boundingClientRect.top) {
      posY = boundingClientRect.top;
    }
    else if(posY > boundingClientRect.bottom) {
      posY = boundingClientRect.bottom;
    }
    const positionFraction = (height -(posY - boundingClientRect.top)) / height; 
    const rawValue = this._min() + positionFraction * (this._max() - this._min());
    return this._snapValueToStep(rawValue, this._min(), this._max(), this._step());
  }
    
  /** @private */
  _handleDragging(event) {
    this._changeValue(this._getValueFromCoord(this._getPoint(event).clientY));
    event.preventDefault();
  }  

  /** @private */
  _mouseUp(event) {
    this._handle.style.cursor = 'grab';
    this._handle.classList.remove('is-dragged');
    document.body.classList.remove('u-coral-closedHand');
    this._focusHandle(false); 
    const classNameSelector = "." + CLASSNAME;
    
    events.off('mousemove.CoralSlider', this._draggingHandler);
    events.off('touchmove.CoralSlider', this._draggingHandler);
    events.off('mouseup.CoralSlider', this._mouseUpHandler);
    events.off('touchend.CoralSlider', this._mouseUpHandler);
    events.off('touchcancel.CoralSlider', this._mouseUpHandler);

    this._currentHandle = null;
    this._draggingHandler = null;
    this._mouseUpHandler = null;  
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
   Handles "focusin" event.

   @private
   */
  _focus(event) {
    this._focusHandle(true);
  }
  
  /**
   Handles "focusout" event.

   @private
   */
  _blur(event) {
    this._focusHandle(false);
  }
        
}
export default ColorSlider;