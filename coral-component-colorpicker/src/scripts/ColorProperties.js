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
import '../../../coral-component-select';
import ColorFormats from './ColorFormats';
import propertiesSubview from '../templates/colorProperties';
import {validate, transform, commons, i18n} from '../../../coral-utils';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "./ColorUtil";

const CLASSNAME = '_coral-ColorPicker-properties';

/**
 @class Coral.ColorPicker.ColorProperties
 @classdesc A ColorPicker Color properties component
 @htmltag coral-colorpicker-properties
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorProperties extends BaseComponent(HTMLElement) {
  constructor() {
    super();

    this._delegateEvents(commons.extend(this._events, {
       'change [handle="propertyHue"]': '_onHueChange',
       'change [handle="propertySL"]': '_onSLChange',
       'change  [handle="formatSelector"]': '_onFormatChange',
       'capture:change  [handle="colorInput"]': '_onColorInputChange',
       'input  [handle="colorInput"]': "_onColorInputChange"
    }));
    

    // Templates
    this._elements = {};
    propertiesSubview.call(this._elements, {commons, i18n});
    this._hue = 240; 
    this._s = 1;
    this._l = 0.5;
    this._a = 1;
    this._format = ColorFormats.HSV;
  }
  
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.propertiesSubview);

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
    //these should be used to set a property since property handler aren't called until elements are attached to dom.
    // Attribute values are delivered to change-listeners even if element isn't attached to dom yet.
    this._colorArea = this.querySelector("[handle='propertySL']");
    this._colorSliderHue = this.querySelector("[handle='propertyHue']");
    this._formatSelector = this.querySelector("[handle='formatSelector']");
    this._colorInput = this.querySelector("[handle='colorInput']");
    // update color in all subviews
    this._updateFormat(this._format);
    this._updateHue(this._hue);
    this._updateSL(this._s, this._l);
    this._updateAlpha(this._a);
    this._updateValue();
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
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);

    this._elements.propertySL[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.propertyHue[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.formatSelector[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.colorInput[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
  }

  /**
   The ColorProperties formats. comma separated formats should be in supported formats.
   First format will be used as default format.
   Values selected in any other format will be converted to default format.
   @default ColorFormats.HSL
   @type {Array}
   @htmlattribute formats
   @htmlattributereflected
   */   
  get formats() {
    return this._formats || "";
  }
  
  set formats(value) {
    if(value == "") {
      return;
    }
    let formats = value.split(',');
    formats = colorUtil.getValidFormats(formats);
    if(formats.length > 0) {
      this._formats = formats;
      this._format = formats[0];
      this._elements.formatSelector.setAttribute('value', this._format);
      // update input value to this format
      this._elements.colorInput.value = this.color;
      // populate format selector list
      let selList = this._elements.formatSelector.querySelectorAll('coral-select-item');
      selList.forEach(function(element) {
        if(formats.indexOf(element.value) == -1) {
          element.remove();
        }
      });
      this._reflectAttribute('formats', this._formats);
    }
  }
    
  /**
   The ColorProperties color string.
   @default hsla(0, 100%, 50%, 1)
   @type {String}
   @htmlattribute color
   @htmlattributereflected
   */   
  get color() {
    return colorUtil.formatColorString(colorUtil.toHslString(this._hue, this._getColorFromProps()), this._format);
  }
  
  set color(value) {
    let color = new TinyColor(value);
    if(!color.isValid) {
      color = new TinyColor("hsla(240, 100%, 50%, 1)");
      value = color.toHslString();
    }
    
    if(this.color === value) {
       return;
    }
        
    this._updateFormat(color.format);
    this._updateHue(colorUtil.getHue(value));
    this._updateSL(color.toHsl().s, color.toHsl().l);
    this._updateAlpha(color.a);
    this._updateValue();
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'disabled',
      'color',
      'formats'
    ]);
  }  

  /** @private */
  _onHueChange(event) {
    event.stopImmediatePropagation();
    this._updateHue(this._colorSliderHue.value);
    this.trigger('change');
  }

  /** @private */
  _onSLChange(event) {
    event.stopImmediatePropagation();
    const color = new TinyColor({h: this._hue, s: this._colorArea.x, v: this._colorArea.y});
    this._updateSL(color.toHsl().s, color.toHsl().l);
    this.trigger('change');
  }
  
  /** @private */
  _onFormatChange(event) {
    event.stopImmediatePropagation();
    this._updateFormat(this._formatSelector.value);
    this.trigger('change');
  }

  /** @private */
  _onColorInputChange(event) {
    let inputColorText = this._colorInput.value;
    let color = new TinyColor(inputColorText);
    if (!color.isValid) {
      return;
    }
    let cursorLoc = event.target.selectionStart;
    event.stopImmediatePropagation();
    this.color = this._colorInput.value;
    // trigger picker change event & send input color as event details to set it in picker input
    this.trigger('change', inputColorText);
    // restore user input color text in textfield
    this._colorInput.value = inputColorText;
    // set cursor to last user input location
    event.target.setSelectionRange(cursorLoc, cursorLoc);
  }
      
  /** @private */
  _updateFormat(format) {
    this._format  = format;
    this._elements.formatSelector.setAttribute('value', this._format);
    this._updateValue();
  }

  /** @private */
  _updateHue(hue) {
    this._hue = Math.round(hue);
    const color = this._getColorFromProps();
    this._elements.propertyHue.setAttribute('color', colorUtil.toHslString(this._hue, color.toHslString()));
    // need to update hue in ColorArea but not s and v, so get s and v  from ColorArea
    this._elements.propertySL.setAttribute('color', this._toHsvString(this._hue, this._elements.propertySL.x, this._elements.propertySL.y));
    this._updateValue();
  }
    
  /** @private */
  _updateSL(s, l) {
    this._s = s;
    this._l = l;
    const color = new TinyColor({h:this._hue, s:this._s, l:this._l});
    this._elements.propertySL.setAttribute('color', colorUtil.toHslString(this._hue, color.toHslString()));
    this._updateValue();
  }
  
  /** @private */
  _updateAlpha(a) {
    this._a = a;
    this._updateValue();
  }

  /** @private */
  _toHsvString(hue, x, y) {
      const s = `${Math.round(x * 100)}%`;
      const v = `${Math.round(y * 100)}%`;
      return `hsv(${this._hue}, ${s}, ${v})`;
  }
    
  /** @private */
  _getColorFromProps() {
    return  new TinyColor({h:this._hue, s:this._s, l:this._l, a:this._a});
  }
  
  /** @private */ 
  _updateValue() {
    this._reflectAttribute('color', this.color);
    this._elements.colorInput.value = this.color;
  }
}

export default ColorProperties;
