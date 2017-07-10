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

import Component from 'coralui-mixin-component';
import base from '../templates/base';
import {transform, validate} from 'coralui-util';

/**
 Enumeration representing progress bar sizes.
 
 @enum {String}
 @memberof Coral.Progress
 */
const size = {
  /** A small progress bar. */
  SMALL: 'S',
  /** A medium progress bar. */
  MEDIUM: 'M',
  /** A large progress bar. */
  LARGE: 'L'
};

/**
 Enumeration representing progress bar label positions.
 
 @enum {String}
 @memberof Coral.Progress
 */
const labelPosition = {
  /** Show the label to the left of the bar. */
  LEFT: 'left',
  /** Show the label to the right of the bar. */
  RIGHT: 'right',
  /** Show the label below the bar. */
  BOTTOM: 'bottom'
};

// Base classname
// We're not using coral-Progress here to avoid conflicts with core
const CLASSNAME = 'coral3-Progress';

// size mapping
const SIZE_CLASSES = {
  'S': 'small',
  'M': 'medium',
  'L': 'large'
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
 @classdesc A Progress component
 @htmltag coral-progress
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Progress extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      label: document.createElement('coral-progress-label')
    };
    base.call(this._elements);
  }
  
  /**
   The current progress in percent.
   
   @type {Number}
   @default 0
   @fires Coral.Progress.coral-progress:changed
   @htmlattribute value
   @htmlattributereflected
   @memberof Coral.Progress#
   */
  get value() {
    return this.indeterminate ? 0 : (this._value || 0);
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
    transform.reflect(this, 'value', this._value);
  
    this._elements.status.style.width = this.value + '%';
  
    if (!this.indeterminate) {
      // ARIA: Reflect value for screenreaders
      this.setAttribute('aria-valuenow', this._value);
    
      if (this.showPercent === true) {
        // Only update label text in percent mode
        this._setLabelContent(this._value + '%');
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
   @memberof Coral.Progress#
   */
  get indeterminate() {
    return this._indeterminate || false;
  }
  set indeterminate(value) {
    this._indeterminate = transform.booleanAttr(value);
    transform.reflect(this, 'indeterminate', this._indeterminate);
  
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
   
   @type {Coral.Progress.size}
   @default Coral.Progress.size.MEDIUM
   @htmlattribute size
   @htmlattributereflected size
   @memberof Coral.Progress#
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    
    if (validate.enumeration(size)(value)) {
      this._size = value;
      transform.reflect(this, 'size', this._size);
  
      this.classList.remove.apply(this.classList, ALL_SIZE_CLASSES);
      this.classList.add(`${CLASSNAME}--${SIZE_CLASSES[this.size]}`);
    }
  }
  
  /**
   Boolean attribute to toggle showing progress percent as the label content.
   Default is true.
   
   @type {Boolean}
   @default false
   @htmlattribute showpercent
   @memberof Coral.Progress#
   */
  get showPercent() {
    return this._showPercent || false;
  }
  set showPercent(value) {
    this._showPercent = transform.booleanAttr(value);
    transform.reflect(this, 'showpercent', this._showPercent);
  
    if (this._showPercent) {
      const content = this.indeterminate ? '' : this.value + '%';
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
   @memberof Coral.Progress#
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-progress-label',
      defaultContentZone: true,
      insert: function(label) {
        this.appendChild(label);
      }
    });
  }
  
  /**
   Label position.
   
   @type {Coral.Progress.labelPosition}
   @default Coral.Progress.labelPosition.RIGHT
   @htmlattribute labelposition
   @htmlattributereflected
   @memberof Coral.Progress#
   */
  get labelPosition() {
    return this._labelPosition || labelPosition.RIGHT;
  }
  set labelPosition(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(labelPosition)(value)) {
      this._labelPosition = value;
      transform.reflect(this, 'labelposition', this._labelPosition);
  
      this.classList.remove.apply(this.classList, ALL_LABEL_POSITION_CLASSES);
      if (this._elements.label.textContent.length > 0) {
        this.classList.add(`${CLASSNAME}--${this._labelPosition}Label`);
      }
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
    this.classList.remove.apply(this.classList, ALL_LABEL_POSITION_CLASSES);
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
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.label;}
  set defaultContentZone(value) {this.label = value;}
  get _attributes() {return {showpercent: 'showPercent', labelposition: 'labelPosition'};}
  get _contentZones() {return {'coral-progress-label': 'label'};}
  
  // Expose enumerations
  static get labelPosition() {return labelPosition;}
  static get size() {return size;}
  
  static get observedAttributes() {
    return [
      'value',
      'indeterminate',
      'size',
      'showpercent',
      'showPercent',
      'labelposition',
      'labelPosition'
    ]
  }
  
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'indeterminate' && transform.booleanAttr(value)) {
      // Remember current value in case indeterminate is toggled
      this._oldValue = this._value || 0;
    }
    
    super.attributeChangedCallback(name, oldValue, value);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._value) {this.value = this.value;}
    if (!this._size) {this.size = size.MEDIUM;}
    if (!this._labelPosition) {this.labelPosition = labelPosition.RIGHT;}
  
    // Create a temporary fragment
    const fragment = document.createDocumentFragment();
    
    // Render the template
    fragment.appendChild(this._elements.bar);
  
    // Fetch or create the content content zone element
    const label = this.querySelector('coral-progress-label') || this._elements.label;
  
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
  
    // Watch for label changes
    this._observer = new MutationObserver(this._toggleLabelBasedOnContent.bind(this));
    this._observer.observe(this._elements.label, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }
  
  /**
   Triggered when the progress value is changed.
   
   @event Coral.Progress#coral-progress:change
   
   @param {Object} event
   Event object.
   @param {Object} event.detail.value
   The current progress value in percent.
   @param {Object} event.detail.oldValue
   The previous progress value in percent.
   */
}

export default Progress;
