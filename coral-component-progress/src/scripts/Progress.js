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
import base from '../templates/base';
import {commons, transform, validate} from '../../../coral-utils';

/**
 Enumeration for {@link Progress} sizes.

 @typedef {Object} ProgressSizeEnum

 @property {String} SMALL
 A small progress bar.
 @property {String} MEDIUM
 A default medium progress bar.
 @property {String} LARGE
 Not supported. Falls back to MEDIUM.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L'
};

/**
 Enumeration for {@link Progress} label positions.

 @typedef {Object} ProgressLabelPositionEnum

 @property {String} LEFT
 Show the label to the left of the bar.
 @property {String} SIDE
 Show the label to the side of the bar.
 @property {String} RIGHT
 Not supported. Falls back to LEFT.
 @property {String} BOTTOM
 Not supported. Falls back to LEFT.
 */
const labelPosition = {
  LEFT: 'left',
  RIGHT: 'right',
  SIDE: 'side',
  BOTTOM: 'bottom'
};

// Base classname
const CLASSNAME = '_coral-BarLoader';

/**
 @class Coral.Progress
 @classdesc A Progress component to indicate progress of processes.
 @htmltag coral-progress
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Progress extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {
      // Fetch or create the content content zone element
      label: this.querySelector('coral-progress-label') || document.createElement('coral-progress-label')
    };
    base.call(this._elements);

    // Watch for label changes
    this._observer = new MutationObserver(this._toggleLabelVisibility.bind(this));
    this._observer.observe(this._elements.label, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  /**
   The current progress in percent.

   @type {Number}
   @default 0
   @emits {coral-progress:change}
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this.indeterminate ? 0 : this._value || 0;
  }

  set value(value) {
    value = transform.number(value) || 0;

    // Stay within bounds
    if (value > 100) {
      value = 100;
    } else if (value < 0) {
      value = 0;
    }

    this._value = value;
    this._reflectAttribute('value', this._value);

    if (!this.indeterminate) {
      this._elements.status.style.width = `${this.value}%`;

      // ARIA: Reflect value for screenreaders
      this.setAttribute('aria-valuenow', this._value);

      if (this.showPercent) {
        // Only update label text in percent mode
        this._setPercentage(`${this._value}%`);
      }
    } else {
      this._elements.status.style.width = '';
    }

    this.trigger('coral-progress:change');
  }

  /**
   Whether to hide the current value and show an animation. Set to true for operations whose progress cannot be
   determined.

   @type {Boolean}
   @default false
   @htmlattribute indeterminate
   @htmlattributereflected
   */
  get indeterminate() {
    return this._indeterminate || false;
  }

  set indeterminate(value) {
    this._indeterminate = transform.booleanAttr(value);
    this._reflectAttribute('indeterminate', this._indeterminate);

    if (this._indeterminate) {
      this.classList.add(`${CLASSNAME}--indeterminate`);

      // ARIA: Remove attributes
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');

      this.value = 0;
    } else {
      this.classList.remove(`${CLASSNAME}--indeterminate`);

      // ARIA: Add attributes
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');

      this.value = this._oldValue;
    }
  }

  /**
   The vertical and text size of this progress bar. To adjust the width, simply set the CSS width property.
   See {@link ProgressSizeEnum}.

   @type {String}
   @default ProgressSizeEnum.MEDIUM
   @htmlattribute size
   @htmlattributereflected size
   */
  get size() {
    return this._size || size.MEDIUM;
  }

  set size(value) {
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.MEDIUM;
    this._reflectAttribute('size', this._size);

    this.classList.toggle(`${CLASSNAME}--small`, this._size === size.SMALL);
  }

  /**
   Boolean attribute to toggle showing progress percent as the label content.
   Default is true.

   @type {Boolean}
   @default false
   @htmlattribute showpercent
   */
  get showPercent() {
    return this._showPercent || false;
  }

  set showPercent(value) {
    this._showPercent = transform.booleanAttr(value);
    this._reflectAttribute('showpercent', this._showPercent);

    if (this._showPercent) {
      const content = this.indeterminate ? '' : `${this.value}%`;
      this._setPercentage(content);
    }

    this._toggleLabelVisibility();
  }

  /**
   Used to access to the {@link Coral.Progress.Label} element. Keep in mind that the width of a custom label is
   limited for {@link Coral.Progress.labelPosition.LEFT} and {@link Coral.Progress.labelPosition.RIGHT}.

   @type {ProgressLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-progress-label',
      insert: function (label) {
        label.classList.add(`${CLASSNAME}-label`);
        this.appendChild(label);
      }
    });
  }

  /**
   Label position. See {@link ProgressLabelPositionEnum}.

   @type {String}
   @default ProgressLabelPositionEnum.LEFT
   @htmlattribute labelposition
   @htmlattributereflected
   */
  get labelPosition() {
    return this._labelPosition || labelPosition.LEFT;
  }

  set labelPosition(value) {
    value = transform.string(value).toLowerCase();
    this._labelPosition = validate.enumeration(labelPosition)(value) && value || labelPosition.LEFT;
    this._reflectAttribute('labelposition', this._labelPosition);

    this.classList.toggle('_coral-BarLoader--sideLabel', this._labelPosition === labelPosition.SIDE);

    const elements = this.labelPosition === labelPosition.SIDE ? ['label', 'bar', 'percentage'] : ['label', 'percentage', 'bar'];
    // @spectrum should be supported with classes
    elements.forEach((el, i) => {
      this._elements[el].style.order = i;
    });

    this._toggleLabelVisibility();
  }

  /** @ignore */
  _toggleLabelVisibility() {
    const percentage = this._elements.percentage;
    const label = this._elements.label;
    const isSidePositioned = this.labelPosition === labelPosition.SIDE;

    // Handle percentage
    if (this.showPercent) {
      percentage.style.visibility = 'visible';
      percentage.setAttribute('aria-hidden', 'false');

      if (isSidePositioned) {
        percentage.hidden = false;
      }
    } else {
      percentage.style.visibility = 'hidden';
      percentage.setAttribute('aria-hidden', 'true');

      if (isSidePositioned) {
        percentage.hidden = true;
      }
    }

    // Handle label
    if (label.textContent.length > 0) {
      label.style.visibility = 'visible';
      label.setAttribute('aria-hidden', 'false');

      if (isSidePositioned) {
        label.hidden = false;
      }

      if (!this.showPercent) {
        // Update the value for accessibility as it was cleared when the label was hidden
        this.setAttribute('aria-valuetext', label.textContent);
      }
    } else {
      label.style.visibility = 'hidden';
      label.setAttribute('aria-hidden', 'true');

      if (isSidePositioned) {
        label.hidden = true;
      }

      // Remove the value for accessibility so the screenreader knows we're unlabelled
      this.removeAttribute('aria-valuetext');
    }
  }

  /** @ignore */
  _setPercentage(content) {
    this._elements.percentage.textContent = content;

    // ARIA
    this[this.showPercent ? 'removeAttribute' : 'setAttribute']('aria-valuetext', content);
  }

  get _contentZones() {
    return {'coral-progress-label': 'label'};
  }

  /**
   Returns {@link Progress} label position options.

   @return {ProgressLabelPositionEnum}
   */
  static get labelPosition() {
    return labelPosition;
  }

  /**
   Returns {@link Progress} sizes.

   @return {ProgressSizeEnum}
   */
  static get size() {
    return size;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      showpercent: 'showPercent',
      labelposition: 'labelPosition'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'value',
      'indeterminate',
      'size',
      'showpercent',
      'labelposition'
    ]);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'indeterminate' && transform.booleanAttr(value)) {
      // Remember current value in case indeterminate is toggled
      this._oldValue = this._value || 0;
    }

    super.attributeChangedCallback(name, oldValue, value);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._value) {
      this.value = this.value;
    }
    if (!this._size) {
      this.size = size.MEDIUM;
    }
    if (!this._labelPosition) {
      this.labelPosition = labelPosition.LEFT;
    }

    // Create a fragment
    const fragment = document.createDocumentFragment();

    const templateHandleNames = ['bar', 'percentage'];

    // Render the template
    fragment.appendChild(this._elements.percentage);
    fragment.appendChild(this._elements.bar);

    const label = this._elements.label;

    // Remove it so we can process children
    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }

    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        label.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Add the frag to the component
    this.appendChild(fragment);

    // Assign the content zone
    this.label = label;

    // Toggle label based on content
    this._toggleLabelVisibility();

    // ARIA
    this.setAttribute('role', 'progressbar');
    this.setAttribute('aria-valuenow', '0');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '100');
  }

  /**
   Triggered when the {@link Progress} value is changed.

   @typedef {CustomEvent} coral-progress:change
   */
}

export default Progress;
