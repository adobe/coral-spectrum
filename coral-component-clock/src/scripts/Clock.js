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
import {DateTime} from '../../../coral-datetime';
import '../../../coral-component-textfield';
import '../../../coral-component-select';
import base from '../templates/base';
import {transform, commons, validate, i18n} from '../../../coral-utils';

// Default for display and value format
const DEFAULT_HOUR_FORMAT = 'HH';
const DEFAULT_MINUTE_FORMAT = 'mm';
const DEFAULT_TIME_FORMAT = `${DEFAULT_HOUR_FORMAT}:${DEFAULT_MINUTE_FORMAT}`;

// Used to extract the time format from a date format
const AUTHORIZED_TOKENS = '(A|a|H{1,2}|h{1,2}|k{1,2}|m{1,2})';
const TIME_REG_EXP = new RegExp(`${AUTHORIZED_TOKENS}.*${AUTHORIZED_TOKENS}|${AUTHORIZED_TOKENS}`);
const HOUR_REG_EXP = new RegExp('h{1,2}|H{1,2}|k{1,2}');
const MIN_REG_EXP = new RegExp('m{1,2}');

/**
 Enumeration for {@link Clock} variants.
 
 @typedef {Object} ClockVariantEnum
 
 @property {String} DEFAULT
 A default, gray Clock.
 @property {String} QUIET
 A Clock with no border or background.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

const CLASSNAME = '_coral-Clock';

// builds an array containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Clock
 @classdesc A Clock component that can be used as a time selection form field. Leverages {@link momentJS} if loaded
 on the page.
 @htmltag coral-clock
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Clock extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    // Default value
    this._value = '';
    
    // Events
    this._delegateEvents(commons.extend(this._events, {
      'change [handle="period"]': '_onPeriodChange'
    }));
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements, {commons, i18n});
  
    // Pre-define labellable element
    this._labellableElement = this;
  }
  
  /**
   The format used to display the selected time to the user. If the user manually types a time, this format
   will be used to parse the value. 'HH:mm' is supported by default. Include momentjs to support additional format
   string options see http://momentjs.com/docs/#/displaying/.
   
   @type {String}
   @default "HH:mm"
   @htmlattribute displayformat
   @htmlattributereflected
   */
  get displayFormat() {
    return this._displayFormat || DEFAULT_TIME_FORMAT;
  }
  set displayFormat(value) {
    this._displayFormat = this._extractTimeFormat(transform.string(value).trim(), TIME_REG_EXP, DEFAULT_TIME_FORMAT);
    this._reflectAttribute('displayformat', this._displayFormat);
    
    this._syncDisplay();
  }
  
  /**
   The format to use on expressing the time as a string on the <code>value</code> attribute. The value
   will be sent to the server using this format. If an empty string is provided, then the default value per type
   will be used. 'HH:mm' is supported by default. Include momentjs to support additional format string options
   see http://momentjs.com/docs/#/displaying/.
   
   @type {String}
   @default "HH:mm"
   @htmlattribute valueformat
   @htmlattributereflected
   */
  get valueFormat() {
    return this._valueFormat || DEFAULT_TIME_FORMAT;
  }
  set valueFormat(value) {
    const setValueFormat = (newValue) => {
      this._valueFormat = this._extractTimeFormat(transform.string(newValue).trim(), TIME_REG_EXP, DEFAULT_TIME_FORMAT);
      this._reflectAttribute('valueformat', this._valueFormat);
    };
  
    // Once the valueFormat is set, we make sure the value is also correct
    if (!this._valueFormat && this._originalValue) {
      setValueFormat(value);
      this.value = this._originalValue;
    }
    else {
      setValueFormat(value);
      this._elements.input.value = this.value;
    }
  }
  
  /**
   The current value as a Date. If the value is "" or an invalid date, <code>null</code> will be returned.
   
   @type {Date}
   @default null
   */
  get valueAsDate() {
    return this._value ? new Date(this._value.toDate().getTime()) : null;
  }
  set valueAsDate(value) {
    this.value = value instanceof Date ? new DateTime.Moment(value, null, true).format(this.valueFormat) : '';
  }
  
  /**
   The clock's variant. See {@link ClockVariantEnum}.
   
   @type {String}
   @default ClockVariantEnum.DEFAULT
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
  
    // passes down the variant to the underlying components
    this._elements.hours.variant = this._variant;
    this._elements.minutes.variant = this._variant;
    this._elements.period.variant = this._variant;
  
    // removes every existing variant
    this.classList.remove(...ALL_VARIANT_CLASSES);
  
    if (this._variant !== variant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
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
    
    this.setAttribute('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    
    this._elements.hours.disabled = this._disabled;
    this._elements.minutes.disabled = this._disabled;
    // stops the form submission
    this._elements.input.disabled = this._disabled;
  }
  
  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
  
    this._elements.hours.invalid = this._invalid;
    this._elements.minutes.invalid = this._invalid;
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
    
    this.setAttribute('aria-required', this._required);
  
    this._elements.hours.required = this._required;
    this._elements.minutes.required = this._required;
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
    this.setAttribute('aria-readonly', this._readOnly);
  
    this._elements.hours.readOnly = this._readOnly;
    this._elements.minutes.readOnly = this._readOnly;
    this._elements.input.readOnly = this._readOnly;
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._getValueAsString(this._value, this.valueFormat);
  }
  set value(value) {
    value = typeof value === 'string' ? value : '';
    // This is used to change the value if valueformat is also set but afterwards
    this._originalValue = value;
    
    // we do strict conversion of the values
    const time = new DateTime.Moment(value, this.valueFormat, true);
    this._value = time.isValid() ? time : '';
    this._elements.input.value = this.value;
  
    this._syncValueAsText();
    this._syncDisplay();
  }
  
  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    // Get current aria-labelledby attribute on the labellable element.
    let labelledBy = this.getAttribute('aria-labelledby');
  
    // If a labelledBy attribute has been defined,
    if (labelledBy) {
      // and strip the valueAsText element id from the end of the aria-labelledby string.
      labelledBy = labelledBy.replace(this._elements.valueAsText.id, '').trim();
    
      // If the resulting labelledBy string is empty, return null.
      if (!labelledBy.length) {
        labelledBy = null;
      }
    }
    return labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
  
    // The specified labelledBy property.
    const labelledBy = this.labelledBy;
  
    // An array of element ids to label control, the last being the valueAsText element id.
    const ids = [this._elements.valueAsText.id];
  
    // If a labelledBy property exists,
    if (labelledBy) {
      // prepend the labelledBy value to the ids array
      ids.unshift(labelledBy);
  
      // Set aria-labelledby attribute on the labellable element joining ids array into space-delimited list of ids.
      this.setAttribute('aria-labelledby', ids.join(' '));
  
      // Set label for attribute
      const labelElement = document.getElementById(labelledBy);
      if (labelElement && labelElement.tagName === 'LABEL') {
        labelElement.setAttribute('for', this._elements.hours.id);
        this._labelElement = labelElement;
      }
    }
    else {
      // labelledBy property is null, remove the aria-labelledby attribute.
      this.removeAttribute('aria-labelledby');
  
      // Remove label for attribute
      if (this._labelElement) {
        this._labelElement.removeAttribute('for');
      }
    }
  }
  
  /**
   Ignore the date part and use the time part only
   
   @private
   */
  _extractTimeFormat(format, regExp, defaultFormat) {
    const match = regExp.exec(format);
    return match && match.length && match[0] !== '' ? match[0] : defaultFormat;
  }
  
  /**
   Sync time display based on the format
   
   @private
   */
  _syncDisplay() {
    const hourFormat = this._extractTimeFormat(this.displayFormat, HOUR_REG_EXP, DEFAULT_HOUR_FORMAT);
    const minuteFormat = this._extractTimeFormat(this.displayFormat, MIN_REG_EXP, DEFAULT_MINUTE_FORMAT);
    
    this._elements.hours.placeholder = hourFormat;
    this._elements.minutes.placeholder = minuteFormat;
    
    this._elements.hours.value = this._getValueAsString(this._value, hourFormat);
    this._elements.minutes.value = this._getValueAsString(this._value, minuteFormat);
    
    this._syncPeriod();
    this._syncValueAsText();
  }
  
  /**
   Sync period selector based on the format
   
   @private
   */
  _syncPeriod() {
    const period = this._elements.period;
    const time = this._value;
    const am = i18n.get('am');
    const pm = i18n.get('pm');
    const items = period.items.getAll();
    
    if (time && time.isValid()) {
      if (time.hours() < 12) {
        period.value = 'am';
      }
      else {
        period.value = 'pm';
      }
    }
    
    // Check for am/pm
    if (this.displayFormat.indexOf('a') !== -1) {
      items[0].textContent = am;
      items[1].textContent = pm;
      this._togglePeriod(true);
    }
    else if (this.displayFormat.indexOf('A') !== -1) {
      items[0].textContent = am.toUpperCase();
      items[1].textContent = pm.toUpperCase();
      this._togglePeriod(true);
    }
    else {
      this._togglePeriod(false);
    }
  }
  
  /** @private */
  _togglePeriod(show) {
    this.classList.toggle(`${CLASSNAME}--extended`, show);
    this._elements.period.hidden = !show;
  }
  
  /** @private */
  _onPeriodChange(event) {
    // stops the event from leaving the component
    event.stopImmediatePropagation();
    
    const time = this._value;
    const period = this._elements.period;
    
    // we check if a change event needs to be triggered since it was produced via user interaction
    if (time && time.isValid()) {
      if (this.displayFormat.indexOf('h') !== -1) {
        if (period.value === 'am') {
          time.subtract(12, 'h');
        }
        else {
          time.add(12, 'h');
        }
      }
      
      this.value = time.format(this.valueFormat);
      this.trigger('change');
    }
  }
  
  _syncValueAsText() {
    this._elements.valueAsText.textContent = this._getValueAsString(this._value, this.displayFormat);
    
    if (!this.getAttribute('aria-labelledby')) {
      this.labelledBy = this.labelledBy;
    }
  }
  
  /**
   Kills the internal _onInputChange from BaseFormField because it does not check the target.
   
   @private
   */
  _onInputChange(event) {
    // stops the event from leaving the component
    event.stopImmediatePropagation();
    
    let newTime = new DateTime.Moment();
    const oldTime = this._value;
    
    let hours = parseInt(this._elements.hours.value, 10);
    const minutes = parseInt(this._elements.minutes.value, 10);
    
    if (window.isNaN(hours) || window.isNaN(minutes)) {
      newTime = '';
    }
    else {
      if (!this._elements.period.hidden &&
        this.displayFormat.indexOf('h') !== -1 &&
        this._elements.period.value === 'pm') {
        hours += 12;
      }
      
      newTime.hours(hours);
      newTime.minutes(minutes);
    }
    
    // we check if a change event needs to be triggered since it was produced via user interaction
    if (newTime && newTime.isValid()) {
      // @polyfill ie
      this.invalid = false;
      
      if (!newTime.isSame(oldTime, 'hour') || !newTime.isSame(oldTime, 'minute')) {
        this.value = newTime.format(this.valueFormat);
        this.trigger('change');
      }
    }
    else {
      // @polyfill ie
      this.invalid = true;
      // does not sync the inputs so allow the user to continue typing the date
      this._value = '';
      
      if (newTime !== oldTime) {
        this.trigger('change');
      }
    }
  }
  
  /**
   Helper class that converts the internal moment value into a String using the provided date format. If the value is
   invalid, empty string will be returned.
   
   @param {?Moment} value
   The value representing the date. It has to be a moment object or <code>null</code>
   @param {String} format
   The Date format to be used.
   
   @returns {String} a String representing the value in the given format.
   
   @ignore
   */
  _getValueAsString(value, format) {
    return value && value.isValid() ? value.format(format) : '';
  }
  
  focus() {
    // Sets focus to appropriate descendant
    if (!this.contains(document.activeElement)) {
      this._elements.hours.focus();
    }
  }
  
  /**
   Returns {@link Clock} variants.
   
   @return {ClockVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'displayformat',
      'displayFormat',
      'valueformat',
      'valueFormat',
      'variant'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'group');
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    if (!this._valueFormat) { this.valueFormat = DEFAULT_TIME_FORMAT; }
    if (!this._displayFormat) { this.displayFormat = DEFAULT_TIME_FORMAT; }
  
    // clean up to be able to clone it
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    
    // Render template
    ['input', 'valueAsText', 'hours', 'divider', 'minutes', 'period'].forEach((handle) => {
      this.appendChild(this._elements[handle]);
    });
    
    this._syncDisplay();
  }
}

export default Clock;
