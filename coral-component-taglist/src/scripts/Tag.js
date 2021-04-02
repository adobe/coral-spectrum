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
import '../../../coral-component-button';
import {Icon} from '../../../coral-component-icon';
import base from '../templates/base';
import {transform, validate, events, i18n, commons} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Tags-item';
const LABEL_CLASSNAME = '_coral-Label';

/**
 Enumeration for {@link Tag} sizes. Only colored tags can have different sizes.

 @typedef {Object} TagSizeEnum

 @property {String} SMALL
 A small sized tag.
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
 @property {String} YELLOW
 @property {String} SEA_FOAM
 @property {String} FUCHSIA
 @property {String} LIGHT_BLUE
 Not supported. Falls back to BLUE.
 @property {String} PERIWINKLE
 Not supported. Falls back to BLUE.
 @property {String} CYAN
 Not supported. Falls back to BLUE.
 @property {String} PLUM
 Not supported. Falls back to RED.
 @property {String} MAGENTA
 Not supported. Falls back to RED.
 @property {String} TANGERINE
 Not supported. Falls back to ORANGE.
 @property {String} CHARTREUSE
 Not supported. Falls back to GREEN.
 @property {String} KELLY_GREEN
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
  magenta: 'red',
  tangerine: 'orange',
  chartreuse: 'green',
  kelly_green: 'green'
};

const swappedSize = commons.swapKeysAndValues(size);

// builds a string containing all possible color classnames. this will be used to remove classnames when the color
// changes
const ALL_COLOR_CLASSES = [];
for (const colorValue in color) {
  ALL_COLOR_CLASSES.push(`${LABEL_CLASSNAME}--${color[colorValue]}`);
}

// builds a string containing all possible size classnames. this will be used to remove classnames when the size
// changes
const ALL_SIZE_CLASSES = [];
for (const sizeValue in Object.keys(size)) {
  ALL_SIZE_CLASSES.push(`${LABEL_CLASSNAME}--${sizeValue}`);
}

const QUIET_CLASSNAME = `${CLASSNAME}--quiet`;
const MULTILINE_CLASSNAME = `${CLASSNAME}--multiline`;

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
 @extends {BaseComponent}
 */
const Tag = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Attach events
    this._delegateEvents({
      'click [handle="button"]': '_onRemoveButtonClick',
      'key:backspace': '_onRemoveButtonClick',
      'key:delete': '_onRemoveButtonClick'
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

   @type {TagLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-tag-label',
      insert: function (label) {
        label.classList.add(`${CLASSNAME}Label`);
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
    this._toggleTagVariant();

    if (this._closable && !this.contains(this._elements.buttonCell)) {
      // Insert the buttonCell if it was not added to the DOM
      this.appendChild(this._elements.buttonCell);
    }

    this._elements.button.hidden = !this._closable;
    this._elements.buttonCell.hidden = !this._closable;
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
    let _value = transform.string(value);

    if(this._value === _value) {
      return;
    }
    this._value = _value;
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
    this._toggleTagVariant();
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
   The tag's size. See {@link {TagSizeEnum}. Only colored tags can have different sizes.

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

    this._toggleTagVariant();
  }

  /**
   The tags's color. See {@link TagColorEnum}.

   @type {String}
   @default Coral.Tag.color.DEFAULT
   @htmlattribute color
   @htmlattributereflected
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

    this._toggleTagVariant();
  }

  /**
   Toggle between Tag and Label styles

   @private
   */
  _toggleTagVariant() {
    const isColored = this.color !== color.DEFAULT;

    // Base
    this.classList.toggle(CLASSNAME, !isColored);
    this.classList.toggle(LABEL_CLASSNAME, isColored);

    // Closable
    this.classList.toggle(`${CLASSNAME}--deletable`, !isColored);

    // Quiet
    this.classList.toggle(QUIET_CLASSNAME, !isColored && this.quiet);

    // Size
    this.classList.remove(...ALL_SIZE_CLASSES);
    this.classList.toggle(`${LABEL_CLASSNAME}--${swappedSize[this.size].toLowerCase()}`, isColored);

    // Color
    this.classList.remove(...ALL_COLOR_CLASSES);
    this.classList.toggle(`${LABEL_CLASSNAME}--${this.color}`, isColored);
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
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
    if (this.closable && !this._elements.button.disabled) {
      event.stopPropagation();
      this.focus();

      const host = this._host;
      this.remove();

      if (host) {
        host._onTagButtonClicked(this, event);
      }
    }
  }

  /**
   Updates the aria-label property from the button and label elements.

   @ignore
   */
  _updateAriaLabel() {
    const button = this._elements.button;
    const buttonCell = this._elements.buttonCell;
    const label = this._elements.label;

    // In the edge case that this is a Tag without a TagList,
    // just treat the Tag as a container element without special labelling.
    if (this.getAttribute('role') !== 'row') {
      buttonCell.removeAttribute('role');
      label.removeAttribute('role');
      if (this.getAttribute('aria-labelledby') === label.id) {
        this.removeAttribute('aria-labelledby');
      }
      return;
    }

    buttonCell.setAttribute('role', 'gridcell');
    label.setAttribute('role', this._closable ? 'rowheader' : 'gridcell');

    const buttonAriaLabel = button.getAttribute('title');
    const labelTextContent = label.textContent;

    // button should be labelled, "Remove: labelTextContent".
    button.setAttribute('aria-label', `${buttonAriaLabel}: ${labelTextContent}`);

    if (!label.id) {
      label.id = commons.getUID();
    }
    this.setAttribute('aria-labelledby', label.id);
  }

  get _contentZones() {
    return {'coral-tag-label': 'label'};
  }

  /**
   Returns {@link Tag} sizes.

   @return {TagSizeEnum}
   */
  static get size() {
    return size;
  }

  /**
   Returns {@link Tag} colors.

   @return {TagColorEnum}
   */
  static get color() {
    return color;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'closable',
      'value',
      'quiet',
      'multiline',
      'size',
      'color',
      'disabled',
      'role'
    ]);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    // This is required by TagList but we don't need to expose disabled publicly as API
    if (name === 'disabled') {
      this._elements.button.disabled = value;
    }
    // This is required by TagList but we don't need to expose disabled publicly as API
    else if (name === 'role') {
      this._updateAriaLabel();
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    // Used to inform the tag list that it's added
    this.trigger('coral-tag:_connected');
  }

  /** @ignore */
  render() {
    super.render();

    // Default reflected attributes
    if (!this._size) {
      this.size = size.MEDIUM;
    }
    if (!this._color) {
      this.color = color.DEFAULT;
    }

    const templateHandleNames = ['input', 'button', 'buttonCell'];

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
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Assign the content zones, moving them into place in the process
    this.label = label;
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
});

export default Tag;
