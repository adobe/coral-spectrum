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
import BaseColorInputAbstractSubview from './BaseColorInputAbstractSubview';
import Color from './Color';
import '../../../coral-component-button';
import colorButton from '../templates/colorButton';
import {commons, i18n, transform} from '../../../coral-utils';

const CLASSNAME = '_coral-ColorInput-swatch';

/**
 @class Coral.ColorInput.Swatch
 @classdesc A ColorInput Swatch component
 @htmltag coral-colorinput-swatch
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseColorInputAbstractSubview}
 */
class ColorInputSwatch extends BaseColorInputAbstractSubview(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Events
    this._delegateEvents(this._events);

    // Templates
    this._elements = {};
    colorButton.call(this._elements);
  }

  /**
   Whether the Item is selected.
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }

  set selected(value) {
    value = transform.booleanAttr(value);

    if (!value || value && !this.disabled) {
      this._selected = value;
      this._reflectAttribute('selected', this.disabled ? false : this._selected);
      this.removeAttribute('aria-selected', this._selected);

      this.classList.toggle('is-selected', this._selected);
      this._elements.colorButton.setAttribute('aria-selected', this._selected);

      this._elements.colorButton.tabIndex = this.tabIndex;
      this.removeAttribute('tabindex');

      this._elements.colorButton[this._selected ? 'setAttribute' : 'removeAttribute']('aria-label',
        `${i18n.get('checked')} ${this._elements.colorButton.label.textContent}`);

      this.trigger('coral-colorinput-swatch:_selectedchanged');
    }
  }

  /**
   The Coral.ColorInput.Item that the swatch is a visual representation of. It accepts a DOM element or a CSS selector.
   If a CSS selector is provided, the first matching element will be used.

   @type {HTMLElement|String}
   @default null
   @htmlattribute targetcolor
   */
  get targetColor() {
    return this._targetColor || null;
  }

  set targetColor(value) {
    if (typeof value === 'string') {
      value = this.querySelector(value);
    }

    // Store new value
    this._targetColor = value;

    let cssColorValue = '';
    let hexColorValue = '';

    if (this._targetColor) {
      const color = new Color();
      color.value = this._targetColor.value;
      cssColorValue = color.rgbaValue;
      hexColorValue = color.hexValue;
    }

    // Update background color and text label for color swatch
    if (cssColorValue) {
      this._elements.colorButton.style.backgroundColor = cssColorValue;
      this._elements.colorButton.label.textContent = hexColorValue;
      this.setAttribute('data-value', hexColorValue);
    } else {
      this._elements.colorButton.classList.add('_coral-ColorInput-swatch-novalue');
      this._elements.colorButton.label.textContent = i18n.get('unset');
      this.setAttribute('data-value', '');
    }
  }

  /**
   Whether the color preview is disabled or not.

   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._elements.colorButton.disabled;
  }

  set disabled(value) {
    this._elements.colorButton.disabled = value;
    this._reflectAttribute('disabled', this.disabled);
  }

  /**
   The tabindex of the color preview button.
   So that we don't wind up with nested focusable elements,
   the internal colorButton should should receive the tabIndex property,
   while the coral-colorinput-swatch should reflect the value using the _tabindex attribute.

   @type {Integer}
   @default -1
   @htmlattribute tabindex
   @htmlattributereflected
   */
  get tabIndex() {
    return this._elements.colorButton.tabIndex;
  }

  set tabIndex(value) {
    this._elements.colorButton.tabIndex = value;
    this.removeAttribute('tabindex');
  }

  /** @ignore */
  _onColorInputChange() {
    if (this.targetColor) {
      // sync selections
      this.selected = this.targetColor.selected;
    }
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      tabindex: 'tabIndex',
      targetcolor: 'targetColor'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'selected',
      'tabindex',
      'disabled',
      'targetcolor'
    ]);
  }

  /** @ignore */
  connectedCallback() {
    if (this._skipConnectedCallback()) {
      return;
    }
    super.connectedCallback();
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._skipDisconnectedCallback()) {
      return;
    }
    super.disconnectedCallback();
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME, 'u-coral-clearFix');

    // adds the role to support accessibility
    this.setAttribute('role', 'presentation');

    // Support cloneNode
    const button = this.querySelector('[handle="colorButton"]');
    if (button) {
      button.remove();
    }

    this.appendChild(this._elements.colorButton);
  }
}

export default ColorInputSwatch;
