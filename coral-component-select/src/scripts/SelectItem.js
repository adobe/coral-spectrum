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
import {transform, validate} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';
import {Messenger} from '../../../coral-messenger';

/**
 @class Coral.Select.Item
 @classdesc A Select item component
 @htmltag coral-select-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const SelectItem = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // messenger
    this._messenger = new Messenger(this);
    this._observer = new MutationObserver(this._handleMutation.bind(this));
    this._observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true
    });
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
   Whether this item is disabled. When set to <code>true</code>, this will prevent every user interaction with the
   item. If disabled is set to <code>true</code> for a selected item it will be deselected.

   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }

  set disabled(value) {
    value = transform.booleanAttr(value);

    if(validate.valueMustChange(this._disabled, value)) {
      this._disabled = value;
      this._reflectAttribute('disabled', value);
      this._messenger.postMessage('coral-select-item:_disabledchanged');
    }
  }

  /**
   Whether the item is selected. Selected cannot be set to <code>true</code> if the item is disabled.

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

    if(validate.valueMustChange(this._selected, value)) {
      this._selected = value;
      this._reflectAttribute('selected', value);
      this._messenger.postMessage('coral-select-item:_selectedchanged');
    }
  }

  /**
   Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.

   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    let val = this._value;
    if (typeof this._value === 'undefined') {
      if (this.getAttribute('value') === null) {
        // keep spaces to only 1 max and trim to mimic native select option behavior
        val = this.textContent.replace(/\s{2,}/g, ' ').trim();
      } else {
        val = this.getAttribute('value');
      }
    }

    return val;
  }

  set value(value) {
    value = transform.string(value);

    if(validate.valueMustChange(this._value, value)) {
      this._value = value;
      this._reflectAttribute('value', value);
      this._messenger.postMessage('coral-select-item:_valuechanged');
    }
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      this.value || this.textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  /** @private */
  _handleMutation() {
    this._messenger.postMessage('coral-select-item:_contentchanged', {
      content: this.textContent
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'value']);
  }

  /** @ignore */
  _suspendCallback() {
    super._suspendCallback();
    this._messenger.disconnect();
  }

  /** @ignore */
  _resumeCallback() {
    this._messenger.connect();
    super._resumeCallback();
  }

  /** @ignore */
  connectedCallback() {
    this._messenger.connect();
    super.connectedCallback();
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._messenger.disconnect();
  }
});

export default SelectItem;
