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
import {BaseFormField} from '../../../coral-base-formfield';
import ColorFormats from './ColorFormats';
import '../../../coral-component-textfield';
import '../../../coral-component-button';
import '../../../coral-component-popover';
import base from '../templates/base';
import {validate, transform, commons, i18n} from '../../../coral-utils';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "./ColorUtil";

const CLASSNAME = '_coral-ColorPicker';

/**
 @class Coral.ColorPicker
 @classdesc A ColorPicker component than can be used as a form field to select from a list of color options.
 @htmltag coral-colorpicker
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class ColorPicker extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    // Prepare templates
    this._elements = {};
    base.call(this._elements, {commons, i18n});

    const overlay = this._elements.overlay;
    const overlayId = overlay.id;

    // Extend form field events
    const events = commons.extend(this._events, {
      'key:down ._coral-ColorPicker-input:not([readonly])': '_onKeyDown',
      'key:down [handle="colorPreview"]': '_onKeyDown',
      'click [handle="colorPreview"]': '_onColorPreviewClick',
      'key:esc input': '_onKeyEsc',
      'key:enter input': '_onKeyEsc',
      'capture:change  [handle="input"]': '_onColorInputChange',
      'change [handle="propertiesView"]': '_onPropertyChange'
    });

    // Overlay
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_beforeOverlayOpen';
    events[`global:capture:coral-overlay:close #${overlayId}`] = '_onOverlayClose';
    events[`global:key:esc #${overlayId}`] = '_onKeyEsc';

    // Events
    this._delegateEvents(events);
    this.value = "";
    this._format = ColorFormats.HSL;
  }
    
  /** @ignore */  
  connectedCallback() {
    super.connectedCallback();

    const overlay = this._elements.overlay;
    // Cannot be open by default when rendered
    overlay.removeAttribute('open');
    // Restore in DOM
    if (overlay._parent) {
      overlay._parent.appendChild(overlay);
    }
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();

    const overlay = this._elements.overlay;
    // In case it was moved out don't forget to remove it
    if (!this.contains(overlay)) {
      overlay._parent = overlay._repositioned ? document.body : this;
      overlay.remove();
    }
  }
  
  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    this.setAttribute('role', 'group');

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.buttonWrapper);
    frag.appendChild(this._elements.overlay);

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
    // can be set to e.g. this._elements.colorPreview.
    this._input = this.querySelector("[handle='input']");
    this._preview = this.querySelector("[handle='colorPreview']");
    this._overlay = this.querySelector("[handle='overlay']");
    this._properties = this._overlay.querySelector("[handle='propertiesView']");
    this._update(this._value);
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'value',
      'formats',
      'disabled',
      'label',
      'labelledBy'
    ]);
  } 
 
   /**   
   The ColorPicker label.
   @default 'Select Color'
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get label() {
     return this._label || i18n.get('Color Picker');
  }
  
  set label(value) {
    this._label = value;
    this._reflectAttribute('label', this.label);
    this._elements.input.setAttribute('aria-label', this.label);
  } 

   /**   
   The ColorPicker label.
   @default 'Select Color'
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get labelledBy() {
     return super.labelledBy;
  }
  
  set labelledBy(value) {
    super.labelledBy = value;

    // Sync input aria-labelledby
    this._elements.input[value ? 'setAttribute' : 'removeAttribute']('aria-labelledby', value);

    // in case the user focuses the buttons, he will still get a notion of the usage of the component
    if (this.labelledBy) {
      this.setAttribute('aria-labelledby', this.labelledBy);
      var labelElement = document.getElementById(value);
      labelElement.setAttribute('for', this._elements.input.id.substring(1));
      this._elements.colorPreview.setAttribute('aria-labelledby',
        [this.labelledBy,
          this._elements.colorPreview.label.id].join(' '));
    } 
    else {
      this.removeAttribute('aria-labelledby');
      this._elements.colorPreview.removeAttribute('aria-labelledby');
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
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.input[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
    this._elements.colorPreview[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', this._disabled);
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
    this._elements.input[this._readOnly ? 'setAttribute' : 'removeAttribute']('readonly', this._readOnly);
    this._elements.colorPreview[(this.disabled || this._readOnly) ? 'setAttribute' : 'removeAttribute']('disabled', this.disabled || this._readOnly);
  }
    
  /**   
   The ColorPicker value. value should be a valid color in supported format.
   @default Empty
   @type {String}
   @htmlattribute label
   @htmlattributereflected
   */   
  get value() {
    return this._value;
  }
  
  set value(value) {
    this._update(value);
  }  

  /**
   The ColorPicker formats. comma separated formats should be in supported formats.
   Any invalid/unsupported format is ignored.
   Values selected in any other format will be converted to this format.
   @default ColorFormats.HSL
   @type {String}
   @htmlattribute formats
   @htmlattributereflected
   */   
  get formats() {
    return this._formats || "";
  }
  
  set formats(value) {
    let formats = value.split(',');
    formats = colorUtil.getValidFormats(formats);
    if(formats.length > 0) {
      this._formats = formats;
      this._format = formats[0];
      this._reflectAttribute('formats', this._formats);
      this._elements.propertiesView.setAttribute('formats', value);
      // refresh color in this new format
      this._update(colorUtil.formatColorString(this.value, this._format));
    }
  } 
    
  /**  @private */
  _update(value) {
    if(this.value === value) {
      return;
    }
    
    // sync UI for empty value
    this.classList[ (value == "") ? 'add' : 'remove']('_coral-ColorPicker--novalue');
    this._elements.colorPreview.classList[ (value == "") ? 'add' : 'remove']('_coral-ColorPicker-preview--novalue');   
    // Empty value isn't invalid.
    let color = new TinyColor(value);
    let isInvalid = (value !== "" && !color.isValid);
    this[isInvalid ? 'setAttribute' : 'removeAttribute']('invalid', "true");
    this._elements.input[isInvalid ? 'setAttribute' : 'removeAttribute']('invalid', "true"); 
    if(color.isValid && (!this._formats || this._formats.indexOf(color.format) !== -1)) {
        this._format = color.format;
    }
    this._value = (value == "" || !color.isValid) ? value : colorUtil.formatColorString(value, this._format);
    this._elements.input.value = this._value;
    this._elements.propertiesView.setAttribute('color', this._value);
    this._elements.colorPreview.style["background-color"] = new TinyColor(this._value).toHslString();
  }
  
  /**  @private */
  _change(color) {
    this._update(color);
    this.trigger('change');
  }
  /***************** Interaction handlers***********/
  /**  @private */
  _onKeyDown(event) {
    event.stopPropagation();
    // restore focus to appropriate element when overlay closes
    this._elements.overlay.returnFocusTo(event.matchedTarget);
    this._elements.overlay.open = true;
  }
  
  /**  @private */
  _onKeyEsc(event) {
    if (!this._elements.overlay.open) {
      return;
    }

    event.stopPropagation();

    this._elements.overlay.open = false;
  }
  
  /**  @private */
  _onColorPreviewClick(event) {
    // restore focus to appropriate element when overlay closes
    this._elements.overlay.returnFocusTo(event.matchedTarget);
  }  

  /**  @private */
  _beforeOverlayOpen() {
    // set aria-expanded state
    this._elements.input.setAttribute('aria-expanded', true);
    this._elements.colorPreview.setAttribute('aria-expanded', true);
  }
  
  _onOverlayClose() {
    // set aria-expanded state
    this._elements.input.setAttribute('aria-expanded', true);
    this._elements.colorPreview.setAttribute('aria-expanded', false);
  }
  
  /**  @private */      
  _onColorInputChange(event) {
    event.stopImmediatePropagation();
    this._change(this._input.value);
  }
  
  /**  @private */
  _onPropertyChange(event) {
    event.stopImmediatePropagation();
    this._change(this._properties.color);
  }
}
export default ColorPicker;