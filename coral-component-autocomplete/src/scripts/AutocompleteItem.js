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
import {transform} from '../../../coral-utils';

/**
 @class Coral.Autocomplete.Item
 @classdesc The Autocomplete Item
 @htmltag coral-autocomplete-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class AutocompleteItem extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._observer = new MutationObserver(this._handleMutation.bind(this));
    this._observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  /**
   Value of the item. <code>textContent</code> is used if not provided.

   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    // keep spaces to only 1 max and trim to mimic native select option behavior
    return typeof this._value === 'undefined' ?
      this.getAttribute('value') || this.textContent.replace(/\s{2,}/g, ' ').trim() :
      this._value;
  }

  set value(value) {
    let _value = transform.string(value);

    if(this._value === _value) {
      return;
    }

    this._value = _value;
    this._reflectAttribute('value', this._value);

    this.trigger('coral-autocomplete-item:_valuechanged');
  }

  // @compat
  get content() {
    return this;
  }

  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }

  /**
   Whether this item is selected.

   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }

  set selected(value) {
    let _selected = transform.booleanAttr(value);

    if(this._selected === _selected) {
      return;
    }

    this._selected = _selected;
    this._reflectAttribute('selected', this._selected);

    this.trigger('coral-autocomplete-item:_selectedchanged');
  }

  /**
   Whether this item is disabled.

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
  }

  /** @private */
  _handleMutation() {
    this.trigger('coral-autocomplete-item:_contentchanged', {
      content: this.textContent
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'value']);
  }
}

export default AutocompleteItem;
