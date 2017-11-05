/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import {ComponentMixin} from 'coralui-mixin-component';
import base from '../templates/base';
import {transform, validate} from 'coralui-util';

/**
 Enumeration for {@link Progress} sizes.
 
 @typedef {Object} ProgressSizeEnum
 
 @property {String} SMALL
 A small progress bar.
 @property {String} MEDIUM
 A medium progress bar.
 @property {String} LARGE
 A large progress bar.
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
 @property {String} RIGHT
 Show the label to the right of the bar.
 @property {String} LARGE
 Show the label below the bar.
 */
const labelPosition = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom'
};

// Base classname
// We're not using coral-Progress here to avoid conflicts with core
const CLASSNAME = 'coral3-Progress';

// size mapping
const SIZE_CLASSES = {
  S: 'small',
  M: 'medium',
  L: 'large'
};

// A string of all possible size classnames
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(`${CLASSNAME}--${SIZE_CLASSES[size[sizeValue]]}`);
}

// A string of all possible label position classnames
const ALL_LABEL_POSITION_CLASSES = [];
for (const position in labelPosition) {
  ALL_LABEL_POSITION_CLASSES.push(`${CLASSNAME}--${labelPosition[position]}Label`);
}

/**
 @class Coral.Progress
 @classdesc A Progress component to indicate progress of processes.
 @htmltag coral-progress
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Progress extends ComponentMixin(HTMLElement) {
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
    this._observer = new MutationObserver(this._toggleLabelBasedOnContent.bind(this));
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
    }
    else if (value < 0) {
      value = 0;
    }
    
    this._value = value;
    this._reflectAttribute('value', this._value);
  
    this._elements.status.style.width = `${this.value}%`;
  
    if (!this.indeterminate) {
      // ARIA: Reflect value for screenreaders
      this.setAttribute('aria-valuenow', this._value);
    
      if (this.showPercent === true) {
        // Only update label text in percent mode
        this._setLabelContent(`${this._value}%`);
      }
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
    }
    else {
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
  
    this.classList.remove(...ALL_SIZE_CLASSES);
    this.classList.add(`${CLASSNAME}--${SIZE_CLASSES[this._size]}`);
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
      this._setLabelContent(content);
      this._showLabel();
    }
    else {
      // This clears the content of the label when showPercent is turned off
      // Ideally, if a label was set and showPercent was set to false, we wouldn't mess with it
      // However, in this case, we don't want to leave incorrect label contents around, so we remove it to be safe
      this.label.innerHTML = '';
    }
  }
  
  /**
   Used to access to the {@link Coral.Progress.Label} element. Keep in mind that the width of a custom label is
   limited for {@link Coral.Progress.labelPosition.LEFT} and {@link Coral.Progress.labelPosition.RIGHT}.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-progress-label',
      insert: function(label) {
        this.appendChild(label);
      }
    });
  }
  
  /**
   Label position. See {@link ProgressLabelPositionEnum}.
   
   @type {String}
   @default ProgressLabelPositionEnum.RIGHT
   @htmlattribute labelposition
   @htmlattributereflected
   */
  get labelPosition() {
    return this._labelPosition || labelPosition.RIGHT;
  }
  set labelPosition(value) {
    value = transform.string(value).toLowerCase();
    this._labelPosition = validate.enumeration(labelPosition)(value) && value || labelPosition.RIGHT;
    this._reflectAttribute('labelposition', this._labelPosition);
  
    this.classList.remove(...ALL_LABEL_POSITION_CLASSES);
    if (this._elements.label.textContent.length > 0) {
      this.classList.add(`${CLASSNAME}--${this._labelPosition}Label`);
    }
  }
  
  /** @ignore */
  _toggleLabelBasedOnContent() {
    if (this._elements.label.textContent.length > 0) {
      this._showLabel();
    }
    else {
      this._hideLabel();
    }
  }
  
  /** @ignore */
  _hideLabel() {
    this._elements.label.hidden = true;
    this.classList.remove(...ALL_LABEL_POSITION_CLASSES);
    this.classList.add(`${CLASSNAME}--noLabel`);
    
    // Remove the value for accessibility so the screenreader knows we're unlabelled
    this.removeAttribute('aria-valuetext');
  }
  
  /** @ignore */
  _showLabel() {
    this._elements.label.hidden = false;
    this.classList.remove(`${CLASSNAME}--noLabel`);
    this.classList.add(`${CLASSNAME}--${this.labelPosition}Label`);
    
    if (this.showPercent === false) {
      // Update the value for accessibility as it was cleared when the label was hidden
      this.setAttribute('aria-valuetext', this.label.textContent);
    }
  }
  
  /** @ignore */
  _setLabelContent(content) {
    this._elements.label.textContent = content;
    
    // ARIA
    if (this.showPercent === true) {
      this.removeAttribute('aria-valuetext');
    }
    else {
      this.setAttribute('aria-valuetext', this.label.textContent);
    }
  }
  
  /**
   The default content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get defaultContentZone() { return this.label; }
  set defaultContentZone(value) { this.label = value; }
  
  get _contentZones() { return {'coral-progress-label': 'label'}; }
  
  /**
   Returns {@link Progress} label position options.
   
   @return {ProgressLabelPositionEnum}
   */
  static get labelPosition() { return labelPosition; }
  
  /**
   Returns {@link Progress} sizes.
   
   @return {ProgressSizeEnum}
   */
  static get size() { return size; }
  
  /** @ignore */
  static get observedAttributes() {
    return [
      'value',
      'indeterminate',
      'size',
      'showpercent',
      'showPercent',
      'labelposition',
      'labelPosition'
    ];
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
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._value) { this.value = this.value; }
    if (!this._size) { this.size = size.MEDIUM; }
    if (!this._labelPosition) { this.labelPosition = labelPosition.RIGHT; }
  
    // Create a fragment
    const fragment = document.createDocumentFragment();
    
    // Render the template
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
        child.getAttribute('handle') !== 'bar') {
        // Add non-template elements to the label
        label.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(fragment);
  
    // Assign the content zone
    this.label = label;
  
    // Toggle label based on content
    this._toggleLabelBasedOnContent();
  
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
