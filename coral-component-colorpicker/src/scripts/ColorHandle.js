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
import subView from '../templates/colorHandle';
import {validate, transform, commons, i18n} from '../../../coral-utils';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "./ColorUtil";

const CLASSNAME = '_coral-ColorPicker-colorHandle';

/**
 @class Coral.ColorPicker.ColorHandle
 @classdesc A ColorHandle component
 @htmltag coral-colorpicker-colorhandle
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColorHandle extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._delegateEvents(commons.extend(this._events, {
    }));

    // Templates
    this._elements = {};
    subView.call(this._elements, {commons, i18n});
    this._color = new TinyColor("hsla(0, 100%, 50%, 1)");
    this._hue = 0;
  }
  
  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.colorHandleSubView);

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
    
    this._subView = this.querySelector("._coral-ColorPicker-colorHandle-color");
    this.color = colorUtil.toHslString(this._hue, this._color.toHslString());
  }
  
  /** @ignore */
  focus() {
    this.classList.add("is-focused");
  }
  
  /** @ignore */
  blur() {
    this.classList.remove("is-focused");
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
  }

  /**   
   The ColorSlider color.
   @default hsla(0, 100%, 50%, 1)
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get color() {
    return this._color.toHslString();
  }
  
  set color(value) {
    let color = new TinyColor(value);
    if(!color.isValid) {
      color = new TinyColor("hsla(0, 100%, 50%, 1)");
      value = color.toHslString();
    }
    this._color = color;
    this._hue = colorUtil.getHue(value);
    this._reflectAttribute('color', colorUtil.toHslString(this._hue, this._color.toHslString()));  
    if(this._subView){
     this._subView.style["background-color"] =  colorUtil.toHslString(this._hue, this._color.toHslString());
    }
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'disabled',
      'color'
    ]);
  }
    
}
export default ColorHandle;