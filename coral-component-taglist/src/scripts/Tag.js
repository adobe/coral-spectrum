/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coral-mixin-component';
import '../../../coral-component-button';
import {Icon} from '../../../coral-component-icon';
import base from '../templates/base';
import {transform, validate, events, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Tags-item';
const LABEL_CLASSNAME = '_coral-Label';

/**
 Enumeration for {@link Tag} sizes.
 
 @typedef {Object} TagSizeEnum
 
 @property {String} SMALL
 Not supported. Falls back to MEDIUM.
 @property {String} MEDIUM
 A default sized tag.
 @property {String} LARGE
 A large sized tag.
 */
const size = {
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L'
};

/**
 Enumeration for {@link Tag} colors.
 
 @typedef {Object} TagColorEnum
 
 @property {String} DEFAULT
 @property {String} GREY
 @property {String} BLUE
 @property {String} RED
 @property {String} ORANGE
 @property {String} GREEN
 @property {String} LIGHT_BLUE
 Not supported. Falls back to BLUE.
 @property {String} PERIWINKLE
 Not supported. Falls back to BLUE.
 @property {String} CYAN
 Not supported. Falls back to BLUE.
 @property {String} PLUM
 Not supported. Falls back to RED.
 @property {String} FUCHSIA
 Not supported. Falls back to RED.
 @property {String} MAGENTA
 Not supported. Falls back to RED.
 @property {String} TANGERINE
 Not supported. Falls back to ORANGE.
 @property {String} YELLOW
 Not supported. Falls back to ORANGE.
 @property {String} CHARTREUSE
 Not supported. Falls back to GREEN.
 @property {String} KELLY_GREEN
 Not supported. Falls back to GREEN.
 @property {String} SEA_FOAM
 Not supported. Falls back to GREEN.
 */
const color = {
  DEFAULT: '',
  GREY: 'grey',
  BLUE: 'blue',
  RED: 'red',
  ORANGE: 'orange',
  GREEN: 'green',
  LIGHT_BLUE: 'lightblue',
  PERIWINKLE: 'periwinkle',
  PLUM: 'plum',
  FUCHSIA: 'fuchsia',
  MAGENTA: 'magenta',
  TANGERINE: 'tangerine',
  YELLOW: 'yellow',
  CHARTREUSE: 'chartreuse',
  KELLY_GREEN: 'kellygreen',
  SEA_FOAM: 'seafoam',
  CYAN: 'cyan'
};

const colorMap = {
  lightblue: 'blue',
  periwinkle: 'blue',
  cyan: 'blue',
  plum: 'red',
  fuchsia: 'red',
  magenta: 'red',
  tangerine: 'orange',
  yellow: 'orange',
  chartreuse: 'green',
  kelly_green: 'green',
  sea_foam: 'green'
};

// builds a string containing all possible color classnames. this will be used to remove classnames when the color
// changes
const ALL_COLOR_CLASSES = [];
for (const colorValue in color) {
  ALL_COLOR_CLASSES.push(`${LABEL_CLASSNAME}--${color[colorValue]}`);
}

const QUIET_CLASSNAME = `${CLASSNAME}--quiet`;
const MULTILINE_CLASSNAME = `${CLASSNAME}--multiline`;
const LARGE_CLASSNAME = `${LABEL_CLASSNAME}--large`;

// Store coordinates of a mouse down event to compare against mouseup coordinates.
let bullsEye = null;

// Utility method to detect center point of an element.
const getOffsetCenter = (element) => {
  const rect = element.getBoundingClientRect();
  const body = document.body;
  const documentElement = document.documentElement;
  const scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop;
  const scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
  const clientTop = documentElement.clientTop || body.clientTop || 0;
  const clientLeft = documentElement.clientLeft || body.clientLeft || 0;
  const x = rect.left + rect.width / 2 + scrollLeft - clientLeft;
  const y = rect.top + rect.height / 2 + scrollTop - clientTop;
  return {
    x: Math.round(x),
    y: Math.round(y)
  };
};

/**
 @class Coral.Tag
 @classdesc A Tag component
 @htmltag coral-tag
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Tag extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'click': '_onClick',
      'key:backspace': '_onRemoveButtonClick',
      'key:delete': '_onRemoveButtonClick',
      'key:space': '_onRemoveButtonClick',
      'mousedown': '_onMouseDown'
    });
    
    // Prepare templates
    this._elements = {
      // Create or fetch the label element.
      label: this.querySelector('coral-tag-label') || document.createElement('coral-tag-label')
    };
    base.call(this._elements, {i18n, Icon});
  }
  
  /**
   The tag's label element.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-tag-label',
      insert: function(label) {
        this.insertBefore(label, this.firstChild);
        this._updateAriaLabel();
      }
    });
  }
  
  /**
   Whether this component can be closed.
   
   @type {Boolean}
   @default false
   @htmlattribute closable
   @htmlattributereflected
   */
  get closable() {
    return this._closable || false;
  }
  set closable(value) {
    this._closable = transform.booleanAttr(value);
    this._reflectAttribute('closable', this._closable);
  
    // Only tags are closable
    this._toggleTagVariant(this._closable);
    
    if (this._closable && !this.contains(this._elements.button)) {
      // Insert the button if it was not added to the DOM
      this.appendChild(this._elements.button);
    }
    
    this._elements.button.hidden = !this._closable;
    this._updateAriaLabel();
  }
  
  /**
   Value of the tag. If not explicitly set, the value of <code>Node.textContent</code> is returned.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return typeof this._value === 'string' ? this._value : this.textContent.replace(/\s{2,}/g, ' ').trim();
  }
  set value(value) {
    this._value = transform.string(value);
    this._reflectAttribute('value', this._value);
    
    this.trigger('coral-tag:_valuechanged');
  }
  
  /**
   A quiet tag to differentiate it from default tag.
   
   @type {Boolean}
   @default false
   @htmlattribute quiet
   @htmlattributereflected
   */
  get quiet() {
    return this._quiet || false;
  }
  set quiet(value) {
    this._quiet = transform.booleanAttr(value);
    this._reflectAttribute('quiet', this._quiet);
  
    // Only tags are quiet
    this._toggleTagVariant(this._quiet);
    
    this.classList.toggle(QUIET_CLASSNAME, this._quiet);
  }
  
  /**
   A multiline tag for block-level layout with multiline text.
   
   @type {Boolean}
   @default false
   @htmlattribute multiline
   @htmlattributereflected
   */
  get multiline() {
    return this._multiline || false;
  }
  set multiline(value) {
    this._multiline = transform.booleanAttr(value);
    this._reflectAttribute('multiline', this._multiline);
  
    this.classList.toggle(MULTILINE_CLASSNAME, this._multiline);
  }
  
  /**
   The tag's size. See {@link {TagSizeEnum}.
   
   @type {String}
   @default TagSizeEnum.MEDIUM
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.MEDIUM;
  }
  set size(value) {
    value = this._host ? size.MEDIUM : transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.MEDIUM;
    this._reflectAttribute('size', this._size);
    
    this.classList.toggle(LARGE_CLASSNAME, this._size === size.LARGE);
  }
  
  /**
   The tags's color. See {@link TagColorEnum}.
   
   @type {String}
   @default Coral.Tag.color.DEFAULT
   @htmlattribute color
   */
  get color() {
    return this._color || color.DEFAULT;
  }
  set color(value) {
    value = this._host ? color.DEFAULT : transform.string(value).toLowerCase();
    this._color = validate.enumeration(color)(value) && value || color.DEFAULT;
    
    // Map unsupported colors
    if (Object.keys(colorMap).indexOf(this._color) !== -1) {
      this._color = colorMap[this._color];
    }
    
    this._reflectAttribute('color', this._color);
  
    // removes every existing color
    this.classList.remove(...ALL_COLOR_CLASSES);
    
    const isColored = this._color !== color.DEFAULT;
  
    // Only labels are colored
    this._toggleTagVariant(!isColored);
    
    if (isColored) {
      this.classList.add(`${LABEL_CLASSNAME}--${this._color}`);
    }
  }
  
  /**
    Toggle between Tag and Label styles
   
    @private
   */
  _toggleTagVariant(toggle) {
    this.classList.toggle(CLASSNAME, toggle);
    this.classList.toggle(`${CLASSNAME}--deletable`, toggle);
    this.classList.toggle(LABEL_CLASSNAME, !toggle);
  }
  
  /**
   Inherited from {@link ComponentMixin#trackingElement}.
   */
  get trackingElement() {
    // it uses the name as the first fallback since it is not localized, otherwise it uses the label
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      this.value || (this.label || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /** @private */
  _onRemoveButtonClick(event) {
    event.preventDefault();
    if (this.closable) {
      event.stopPropagation();
      this.focus();
      
      const host = this._host;
      this.remove();
  
      if (host) {
        host._onTagButtonClicked(this, event);
      }
    }
  }
  
  /** @private */
  _onClick(event) {
    if (this._elements.button.disabled) {
      return;
    }
    
    // If the click event originated from a screen reader's event sequence or the remove button, trigger the removal
    // of the tag.
    if (event.target === this._elements.button ||
      this._elements.button.contains(event.target) ||
      bullsEye !== null ||
      /* Detects virtual cursor or Narrator on Windows */
      event.clientX <= 0 && event.clientY <= 0) {
      this._onRemoveButtonClick(event);
      bullsEye = null;
    }
  }
  
  /** @private */
  _onMouseDown(event) {
    // Determine the center point of the event target
    const offsetCenter = getOffsetCenter(event.target);
    // This Tag will be the event.target when mousedown originates from a screen reader.
    if (event.target === this &&
      Math.abs(event.pageX - offsetCenter.x) < 2 &&
      Math.abs(event.pageY - offsetCenter.y) < 2) {
      // If click is close enough to the center, store the coordinates.
      bullsEye = {
        x: event.pageX,
        y: event.pageY
      };
    }
    else {
      bullsEye = null;
    }
    events.on('mouseup.Tag', this._onMouseUp);
  }
  
  /** @private */
  _onMouseUp(event) {
    // If stored bullseye coordinates don't match mouse up event coordinates,
    // don't store them any more.
    if (bullsEye !== null && (event.pageX !== bullsEye.x || event.pageY !== bullsEye.y)) {
      bullsEye = null;
    }
    events.off('mouseup.Tag', this._onMouseUp);
  }
  
  /**
   Updates the aria-label property from the button and label elements.
   
      @ignore
   */
  _updateAriaLabel() {
    const button = this._elements.button;
    const label = this._elements.label;
  
    // In the edge case that this is a Tag without a TagList,
    // just treat the Tag as a container element without special labelling.
    if (this.getAttribute('role') !== 'option') {
      button.removeAttribute('aria-hidden');
      label.removeAttribute('aria-hidden');
      return;
    }
  
    const labelText = [];
  
    const buttonAriaLabel = button.getAttribute('title');
    const labelTextContent = label.textContent;
  
    if (button.parentElement) {
      if (!label.parentElement || labelTextContent !== buttonAriaLabel) {
        if (!button.hidden) {
          labelText.push(buttonAriaLabel);
        }
        button.setAttribute('aria-hidden', 'true');
      }
    }
  
    if (label.parentElement) {
      if (!button.parentElement || buttonAriaLabel !== labelTextContent) {
        labelText.push(labelTextContent);
        label.setAttribute('aria-hidden', 'true');
      }
    }
  
    if (labelText.length) {
      this.setAttribute('aria-label', labelText.join(' '));
    }
    else {
      this.removeAttribute('aria-label');
    }
  }
  
  get _contentZones() { return {'coral-tag-label': 'label'}; }
  
  /**
   Returns {@link Tag} sizes.
   
   @return {TagSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link Tag} colors.
   
   @return {TagColorEnum}
   */
  static get color() { return color; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'closable',
      'value',
      'quiet',
      'multiline',
      'size',
      'color',
      'disabled'
    ]);
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    // This is required by TagList but we don't need to expose disabled publicly as API
    if (name === 'disabled') {
      this._elements.button.disabled = true;
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
  
    // Default reflected attributes
    if (!this._size) { this.size = size.MEDIUM; }
    if (!this._color) { this.color = color.DEFAULT; }
  
    const templateHandleNames = ['input', 'button'];
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label.parentNode) {
      this.removeChild(label);
    }
  
    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        label.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Assign the content zones, moving them into place in the process
    this.label = label;
    
    // Used to inform the tag list that it's added
    this.trigger('coral-tag:_connected');
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    // Used to inform the tag list that it's removed synchronously
    if (this._host) {
      this._host._onItemDisconnected(this);
    }
  }
  
  /**
   Triggered when the {@link Tag} value is changed.
 
   @typedef {CustomEvent} coral-tag:_valuechanged
   
   @private
   */
  
  /**
   Triggered when the {@link Tag} is added to the document.
 
   @typedef {CustomEvent} coral-tag:_connected
   
   @private
   */
}

export default Tag;
