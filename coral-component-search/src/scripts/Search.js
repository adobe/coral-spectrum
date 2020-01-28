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
import '../../../coral-component-textfield';
import '../../../coral-component-button';
import {Icon} from '../../../coral-component-icon';
import base from '../templates/base';
import {transform, validate, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Search';

/**
 Enumeration for {@link Search} variants.
 
 @typedef {Object} SearchVariantEnum
 
 @property {String} DEFAULT
 A default, gray search input.
 @property {String} QUIET
 A search with no border, no background, no glow.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

/**
 @class Coral.Search
 @classdesc A Search component is a search styled form field.
 @htmltag coral-search
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Search extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    this._delegateEvents(commons.extend(this._events, {
      // @todo use Coral.keys when key combos don't interfere with single key execution
      'keydown [handle=input]': '_onEnterKey',
      'keyup [handle=input]': '_onKeyUp',
  
      // @todo use coralinternalinput from Autocomplete
      'input [handle=input]': '_triggerInputEvent',
  
      'key:escape [handle=input]': '_clearInput',
      'click [handle=clearButton]:not(:disabled)': '_clearInput'
    }));
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements, {i18n, Icon});
  
    // Pre-define labellable element
    this._labellableElement = this._elements.input;
  }
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.input.name = value;
  }
  
  /**
   The submitted input value. Changing this value will not trigger an event.
   
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._elements.input.value || '';
  }
  set value(value) {
    this._elements.input.value = value;
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
    this._elements.input.disabled = this._disabled;
    this._elements.clearButton.disabled = this._disabled;
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
    
    this._elements.input.required = this._required;
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
    
    this._elements.input.readOnly = this._readOnly;
    this._elements.clearButton.disabled = this._readOnly;
  }
  
  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
    // in case the user focuses the buttons, he will still get a notion of the usage of the component
    this[this.labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.labelledBy);
  }
  
  /**
   Short hint that describes the expected value of the Search. It is displayed when the Search is empty.
   
   @type {String}
   @default ""
   @htmlattribute placeholder
   @htmlattributereflected
   */
  get placeholder() {
    return this._elements.input.placeholder || '';
  }
  set placeholder(value) {
    value = transform.string(value);
    this._reflectAttribute('placeholder', value);
  
    this._elements.input.placeholder = value;
  }
  
  /**
   Max length for the Input field.
   @type {Number}
   @htmlattribute maxlength
   @htmlattributereflected
   */
  get maxLength() {
    return this._elements.input.maxLength;
  }
  set maxLength(value) {
    this._elements.input.maxLength = value;
    this._reflectAttribute('maxlength', this.maxLength);
  }
  
  /**
   The search's variant. See {@link SearchVariantEnum}.
   
   @type {String}
   @default SearchVariantEnum.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
    
    this._elements.input.variant = value;
  }
  
  /**
   @ignore
   
   Not supported anymore.
   */
  get icon() {
    return this._icon || 'search';
  }
  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
  }
  
  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
  }
  
  /** @ignore */
  _triggerInputEvent() {
    this.trigger('coral-search:input');
  }
  
  /**
   Handles the up action by steping up the Search. It prevents the default action.
   
   @ignore
   */
  _onEnterKey(event) {
    if (event.which === 13) {
      event.preventDefault();
    
      // stops interaction if the search is disabled
      if (this.disabled) {
        return;
      }
    
      this.trigger('coral-search:submit');
    }
  }
  
  /**
   Handles the keydown action.
   
   @ignore
   */
  _onKeyUp() {
    this._updateClearButton();
  }
  
  /**
   Updates the clear button's display status.
   
   @ignore
   */
  _updateClearButton() {
    if (this._elements.input.value === '') {
      this._elements.clearButton.style.display = 'none';
    }
    else {
      this._elements.clearButton.style.display = '';
    }
  }
  
  /**
   Clears the text in the input box.
   
   @ignore
   */
  _clearInput() {
    this._elements.input.value = '';
    this._updateClearButton();
    this._elements.input.focus();
  
    // If we've been cleared, trigger the event
    this.trigger('coral-search:clear');
  }
  
  // overrides the behavior from BaseFormField
  reset() {
    // since there is an internal value, this one handles the reset
    this._elements.input.reset();
  }
  
  // overrides the behavior from BaseFormField
  clear() {
    // since there is an internal value, this one handles the clear
    this._elements.input.clear();
  }
  
  /**
   Returns {@link Search} variants.
   
   @return {SearchVariantEnum}
   */
  static get variant() { return variant; }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      maxlength: 'maxLength'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['placeholder', 'icon', 'variant', 'maxlength']);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
  
    // Default reflected attributes
    if (!this._icon) { this.icon = 'search'; }
    if (!this._variant) { this.variant = variant.DEFAULT; }
  
    // Support cloneNode
    const templates = this.querySelectorAll('._coral-Search-input, ._coral-Search-icon, ._coral-Search-clear');
    for (let i = 0; i < templates.length; i++) {
      templates[i].remove();
    }
    
    // Create a fragment
    const fragment = document.createDocumentFragment();
  
    // Render the main template
    fragment.appendChild(this._elements.input);
    fragment.appendChild(this._elements.clearButton);
  
    // Add the frag to the component
    this.appendChild(fragment);
    
    // Insert search icon
    this._elements.input.insertAdjacentHTML('afterend', Icon._renderSVG('spectrum-css-icon-Magnifier', ['_coral-Search-icon', '_coral-UIIcon-Magnifier']));
   
    this._updateClearButton();
  }
  
  /**
   Triggered when {@link Search} input is given.
   
   @typedef {CustomEvent} coral-search:input
   */
  
  /**
   Triggered when the user presses {@link Search} enter.
   
   @typedef {CustomEvent} coral-search:submit
   */
  
  /**
   Triggered when the {@link Search} is cleared.
   
   @typedef {CustomEvent} coral-search:clear
   */
}

export default Search;
