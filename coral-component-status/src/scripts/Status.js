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

/**
 Enumeration for {@link Status} variants.

 @typedef {Object} StatusVariantEnum

 @property {String} NEUTRAL
 A default semantic neutral status.
 @property {String} WARNING
 A notice semantic status.
 @property {String} SUCCESS
 A positive semantic status.
 @property {String} ERROR
 A negative semantic status.
 @property {String} INFO
 An informative semantic status.
 */
const variant = {
  NEUTRAL: 'neutral',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info'
};

/**
 Enumeration for {@link Status} colors.

 @typedef {Object} StatusColorEnum

 @property {String} DEFAULT
 @property {String} CELERY
 @property {String} YELLOW
 @property {String} FUCHSIA
 @property {String} INDIGO
 @property {String} SEA_FOAM
 @property {String} CHARTREUSE
 @property {String} MAGENTA
 @property {String} PURPLE
 */
const color = {
  DEFAULT: '',
  CELERY: 'celery',
  YELLOW: 'yellow',
  FUCHSIA: 'fuchsia',
  INDIGO: 'indigo',
  SEA_FOAM: 'seafoam',
  CHARTREUSE: 'chartreuse',
  MAGENTA: 'magenta',
  PURPLE: 'purple'
};

const CLASSNAME = '_coral-StatusLight';
const variantMapping = {
  SUCCESS: 'positive',
  ERROR: 'negative',
  WARNING: 'notice'
};

const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variantMapping[variantValue] || variant[variantValue]}`);
}

const ALL_COLOR_CLASSES = [];
for (const colorValue in color) {
  ALL_COLOR_CLASSES.push(`${CLASSNAME}--${color[colorValue]}`);
}

/**
 @class Coral.Status
 @classdesc A Status component to describe the condition of another entity. They can be used to convey semantic meaning
 such as statuses and categories.

 @htmltag coral-status
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Status extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {
      // Fetch or create the content zone element
      label: this.querySelector('coral-status-label') || document.createElement('coral-status-label')
    };
  }

  /**
   Whether the status is disabled or not.

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
  }

  /**
   The status variant. See {@link StatusVariantEnum}.
   When a status has a semantic meaning, it should use semantic colors.

   @type {String}
   @default StatusVariantEnum.NEUTRAL
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.NEUTRAL;
  }

  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.NEUTRAL;
    this._reflectAttribute('variant', this._variant);

    this.classList.remove(...ALL_VARIANT_CLASSES);
    this.classList.add(`${CLASSNAME}--${variantMapping[this._variant.toUpperCase()] || this._variant}`);
  }

  /**
   The status color. See {@link StatusColorEnum}.
   When a status is used to color code categories and labels commonly found in data visualization, they should use
   colors.

   The ideal usage for colors is when there are 8 or fewer categories or labels being color coded.
   Use them in the following order to ensure the greatest possible color differences for multiple forms of color
   blindness:
   - Indigo
   - Celery
   - Magenta
   - Yellow
   - Fuchsia
   - Seafoam
   - Chartreuse
   - Purple

   If a color is set, it'll override any semantic variant.

   @type {String}
   @default StatusColorEnum.DEFAULT
   @htmlattribute color
   @htmlattributereflected
   */
  get color() {
    return this._color || color.DEFAULT;
  }

  set color(value) {
    value = transform.string(value).toLowerCase();
    this._color = validate.enumeration(color)(value) && value || color.DEFAULT;
    this._reflectAttribute('color', this._color);

    this.classList.remove(...ALL_COLOR_CLASSES);
    if (this._color !== color.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._color}`);
    }
  }

  /**
   The status label element.

   @type {StatusLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-status-label',
      insert: function (label) {
        this.appendChild(label);
      }
    });
  }

  get _contentZones() {
    return {
      'coral-status-label': 'label'
    };
  }

  /**
   Returns {@link Status} variants.

   @return {StatusVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /**
   Returns {@link Status} colors.

   @return {StatusColorEnum}
   */
  static get color() {
    return color;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['variant', 'color', 'disabled']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.NEUTRAL;
    }
    if (!this._color) {
      this.color = color.DEFAULT;
    }

    // Fetch or create the content content zone element
    const label = this._elements.label;

    // This stops the content zone from being voracious
    if (!label.parentNode) {
      // move the contents into the content zone
      while (this.firstChild) {
        label.appendChild(this.firstChild);
      }
    }

    // Assign the content zone moving it into place
    this.label = label;
  }
}

export default Status;
