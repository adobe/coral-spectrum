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
import colorArea from '../templates/colorArea';
import {validate, transform, events, commons, i18n, Keys} from '../../../coral-utils';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "./ColorUtil";

const CLASSNAME = '_coral-ColorPicker-ColorArea';

/**
 @class Coral.ColorPicker.ColorArea
 @classdesc A ColorPicker area component to select Saturation and Value
 @htmltag coral-colorpicker-colorarea
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorArea extends BaseComponent(HTMLElement) {
  constructor() {
    super();

    this._delegateEvents(commons.extend(this._events, {
      'key:up': '_handleKey',
      'key:right': '_handleKey',
      'key:down': '_handleKey',
      'key:left': '_handleKey',
      'key:pageUp': '_handleKey',
      'key:pageDown': '_handleKey',
      'key:home': '_handleKey',
      'key:end': '_handleKey',
      
      'input': '_onInputChangeHandler',
      
      'touchstart': '_onMouseDown',
      'mousedown': '_onMouseDown',
      'capture:focus': '_focus',
      'capture:blur': '_blur'
    }));
    
    // Templates
    this._elements = {};
    colorArea.call(this._elements, {commons, i18n});
    // default values
    this._x = 1;
    this._y = 1;
    this._hue = 120;
    this._minX = 0;
    this._minY = 0;
    this._maxX = 1;
    this._maxY = 1;
    this._stepX = 0.01;
    this._stepY = 0.01;
  }

  /** @ignore */  
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.colorAreaGradient);
    frag.appendChild(this._elements.colorHandle);
    frag.appendChild(this._elements.sliderX);
    frag.appendChild(this._elements.sliderY);

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

    // These should be used to set a property since property handler aren't called until elements are attached to dom.
    // Attribute values are delivered to change-listeners even if element isn't attached to dom yet, so attributes 
    // can be set to e.g. this._elements.colorHandle.
    this._handle = this.querySelector('._coral-ColorPicker-ColorArea-colorHandle');
    this._sliderX = this.querySelector('._coral-ColorPicker-ColorArea-slider[name="x"]');
    this._sliderY = this.querySelector('._coral-ColorPicker-ColorArea-slider[name="y"]');
    this._gradient = this.querySelector('._coral-ColorPicker-ColorArea-gradient');
    this._updateHue(this._hue);
    this.x = this._x;
    this.y = this._y;
    this._updateHandle(this._hue, this.x, this.y, this.color);
    this._reflectAttribute('color', this.color);
  }

  /**   
   The ColorArea label.
   @default ''
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
    if(this._elements.sliderX.getAttribute('aria-label') !== this._label) {
      this._elements.sliderX.setAttribute('aria-label', this._label);
      this._elements.sliderY.setAttribute('aria-label', this._label);
    }
  } 

  /**   
   The ColorArea x value. value should be in multiple of x-step size.
   @default 1
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get x() {
    return this._x;
  }
  
  set x(value) {
    let rawX =  Number(value, 10);
    if(parseFloat(rawX).toFixed(3) !== parseFloat(this._x).toFixed(3)) {
      if(isNaN(rawX)) {
         rawX = this._minX;
       } 
      this._x = this._snapValueToStep(rawX, this._minX, this._maxX,  this._stepX);
      this._reflectAttribute('x', this._x);
      this.color = this._toHsvString(this._hue, this._x, this.y);
    }
    this._elements.sliderX.setAttribute('aria-valuetext', `${i18n.get('Saturation')}: ${Math.round(this._x / (this._maxX - this._minX) * 100)}%`);
    this._elements.sliderX.setAttribute('title', this.color);
    this._elements.sliderX.setAttribute('value', this._x);
  }

  /** @private */
  _toHsvString(hue, x, y) {
      const s = `${Math.round(this._x / (this._maxX - this._minX) * 100)}%`;
      const v = `${Math.round(this._y / (this._maxY - this._minY) * 100)}%`;
      return `hsv(${this._hue}, ${s}, ${v})`;
  }

  /**   
   The ColorArea y value. value should be in multiple of y-step size.
   @default 1
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get y() {
    return this._y;
  }
  
  set y(value) {
    let rawY = Number(value, 10);
    if(parseFloat(rawY).toFixed(3) !== parseFloat(this._y).toFixed(3)) {
      if(isNaN(rawY)) {
        rawY = this._minY;
      }
      this._y = this._snapValueToStep(rawY, this._minY, this._maxY,  this._stepY);
      this._reflectAttribute('y', this._y);
      this.color = this._toHsvString(this._hue, this.x, this._y);
    }
    this._elements.sliderY.setAttribute('aria-valuetext', `${i18n.get('Brightness')}: ${Math.round(this._y / (this._maxY - this._minY) * 100)}%`);
    this._elements.sliderY.setAttribute('title', this.color);
    this._elements.sliderY.setAttribute('value', this._y);
  }
  
  /**
   The ColorArea color string in hsla format.
   @default hsla(0, 100%, 50%, 1)
   @type {String}
   @htmlattribute color
   @htmlattributereflected
   */   
  get color() {
    return colorUtil.toHslString(this._hue, new TinyColor({h:this._hue, s:this.x, v:this.y}).toHslString());
  }
  
  set color(value) {
    let color = new TinyColor(value);
    if(!color.isValid) {
      color = new TinyColor("hsla(120, 100%, 50%, 1)");
      value = color.toHslString();
    }
    
    // if  color strings are equal or colors are equivalent  
    if(this.color === value || new TinyColor(this.color).toString(color.format) === color) {
       return;
    }

    const {h,s,v} = colorUtil.extractHsv(value);
    if(h !== this._hue) {
      this._updateHue(colorUtil.getHue(value)); 
    }
    if(s !== this._x) {
      this.x = s;
    }
    if(v !== this.Y) {
      this.y = v;
    }
    this._updateHandle(this._hue, this.x, this.y, this.color);
    this._reflectAttribute('color', this.color);
  }
        
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'label',
      'x',
      'y',
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
    this._elements.sliderX[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.sliderY[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.colorHandle[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
  }
  
  focus() {
    this._sliderX.focus();
  }

  /** @private **/
  _updateHue(hue) {
    this._hue = hue;
    if(this._gradient){
      this._gradient.style.background = `linear-gradient(to top, black 0%, hsla(${this._hue}, 100%, 0%, 0) 100%),
        linear-gradient(to right, white 0%, hsla(${this._hue}, 100%, 0%, 0) 100%),
        hsl(${this._hue}, 100%, 50%)`;
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
  _updateHandle(hue, x, y, colorStr) {
    let percent = 100 - ((y - this._minY) / (this._maxY - this._minY) * 100);
    if(this._handle) {
      this._handle.style.top = `${percent}%`;
    }
    
    percent = (x - this._minX) / (this._maxX - this._minX) * 100;
    if(this._handle) {
      this._handle.style.left = `${percent}%`;
    }   
    this._elements.colorHandle.setAttribute('color', colorStr); 
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
  _changeValue(x, y) {
     if(this.x !== x || this.y !== y) {
       var currX = this.x;
       var currY = this.y;
       this.x = x;
       this.y = y;
       if(this.x !== currX || this.y !== currY) {
         this.trigger('change');
       }
     }
  }

  _focusX() {
    this._sliderX.focus();
  }

  _focusY() {
    this._sliderY.focus();
  }  
/******* Events Handling **************/

  /** @private */
  _onInputChangeHandler(event) {
    this._focusHandle(true);
    event.stopPropagation();
    if(event.target === this._sliderX) {
      this._changeValue(event.target.value, this.y);
    } 
    else {
      this._changeValue(this.x, event.target.value);
    }
  }

  /** @private */
  _handleKey(event) {
    this._focusHandle(true);
    event.preventDefault();
    event.stopPropagation();
    let y = this.y;
    let x = this.x;
    // increase
    if (event.keyCode === Keys.keyToCode('up') ||
      event.keyCode === Keys.keyToCode('pageUp')) {
      y += this._stepY;
      this._focusY();
    }
    // decrease
    else if (event.keyCode === Keys.keyToCode('down') ||
      event.keyCode === Keys.keyToCode('pageDown')) {
      y -= this._stepY;
      this._focusY();
    }

    // increase
    if (event.keyCode === Keys.keyToCode('right')) {
      x += this._stepX;
      this._focusX();
    }
    // decrease
    else if (event.keyCode === Keys.keyToCode('left')) {
      x -= this._stepX;
      this._focusX();
    }
        
    // min
    else if (event.keyCode === Keys.keyToCode('home')) {
      x = this._minX;
      y = this._minY;
      this._focusX();
    }
    // max
    else if (event.keyCode === Keys.keyToCode('end')) {
      x = this._maxX;
      y = this._maxY;
      this._focusX();
    }
    
    this._changeValue(x, y);  
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
    
    const {x,y} = this._getValuesFromCoord(this._getPoint(event));
    this._changeValue(x, y);
         
    const classNameSelector = "." + CLASSNAME;
    this._draggingHandler = this._handleDragging.bind(this);
    this._mouseUpHandler = this._mouseUp.bind(this);    
    
    events.on('mousemove.CoralArea', this._draggingHandler);
    events.on('mouseup.CoralArea', this._mouseUpHandler);

    events.on('touchmove.CoralArea', this._draggingHandler);
    events.on('touchend.CoralArea', this._mouseUpHandler);
    events.on('touchcancel.CoralArea', this._mouseUpHandler);  
  }

  /**  @private */
  _getValuesFromCoord(point) {
    const boundingClientRect = this.getBoundingClientRect();
    const height = boundingClientRect.height;
    const width = boundingClientRect.width;
    let posY = point.clientY;
    let posX = point.clientX;
    
    if(posY < boundingClientRect.top) {
      posY = boundingClientRect.top;
    }
    else if(posY > boundingClientRect.bottom) {
      posY = boundingClientRect.bottom;
    }

    if(posX < boundingClientRect.left) {
      posX = boundingClientRect.left;
    }
    else if(posX > boundingClientRect.right) {
      posX = boundingClientRect.right;
    }
        
    let positionFraction = (height -(posY - boundingClientRect.top)) / height; 
    const rawY = this._minY + positionFraction * (this._maxY - this._minY);

    positionFraction =  (posX - boundingClientRect.left) / width; 
    const rawX = this._minX + positionFraction * (this._maxX - this._minX);
       
    return {x: rawX, y: rawY};
  }
    
  /** @private */
  _handleDragging(event) {
    const {x,y} = this._getValuesFromCoord(this._getPoint(event));
    this._changeValue(x, y);
    event.preventDefault();
  }  

  /** @private */
  _mouseUp(event) {
    this._handle.style.cursor = 'grab';
    this._handle.classList.remove('is-dragged');
    document.body.classList.remove('u-coral-closedHand');
    this._focusHandle(false); 
    const classNameSelector = "." + CLASSNAME;
    
    events.off('mousemove.CoralArea', this._draggingHandler);
    events.off('touchmove.CoralArea', this._draggingHandler);
    events.off('mouseup.CoralArea', this._mouseUpHandler);
    events.off('touchend.CoralArea', this._mouseUpHandler);
    events.off('touchcancel.CoralArea', this._mouseUpHandler);

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
export default ColorArea;