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
import Color from './Color';
import ColorInputItem from './ColorInputItem';
import {SelectableCollection} from '../../../coral-collection';
import {Icon} from '../../../coral-component-icon';
import '../../../coral-component-textfield';
import '../../../coral-component-button';
import '../../../coral-component-popover';
import './ColorInputColorProperties';
import './ColorInputSwatches';
import base from '../templates/base';
import {validate, transform, commons, i18n} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-ColorInput';

/**
 Enumeration for {@link ColorInput} variants.

 @typedef {Object} ColorInputVariantEnum

 @property {String} DEFAULT
 Use ColorInput as a formfield (default).
 @property {String} SWATCH
 Use a simple swatch as ColorInput.
 */
const variant = {
  DEFAULT: 'default',
  SWATCH: 'swatch'
};

/**
 Enumeration for {@link ColorInput} auto generated colors options.

 @typedef {Object} ColorInputAutoGenerateColorsEnum

 @property {String} OFF
 Disable auto generation.
 @property {String} SHADES
 Automatically generate shades (darker colors) of all colors.
 @property {String} TINTS
 Automatically generate tints (lighter colors) of all colors.
 */
const autoGenerateColors = {
  OFF: 'off',
  SHADES: 'shades',
  TINTS: 'tints'
};

/**
 Enumeration for {@link ColorInput} swatches display options.

 @typedef {Object} ColorInputShowSwatchesEnum

 @property {String} ON
 Display swatches view (default).
 @property {String} OFF
 Hide swatches view.
 */
const showSwatches = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link ColorInput} color properties display options.

 @typedef {Object} ColorInputShowPropertiesEnum

 @property {String} ON
 Display color properties view (default).
 @property {String} OFF
 Hide color properties view.
 */
const showProperties = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link ColorInput} default colors display options.

 @typedef {Object} ColorInputShowDefaultColorsEnum

 @property {String} ON
 Display default colors (default).
 @property {String} OFF
 Hide default colors.
 */
const showDefaultColors = {
  ON: 'on',
  OFF: 'off'
};

/**
 @class Coral.ColorInput
 @classdesc A ColorInput component than can be used as a form field to select from a list of color options.
 @htmltag coral-colorinput
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
const ColorInput = Decorator(class extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {};
    base.call(this._elements, {commons, i18n});

    const overlay = this._elements.overlay;
    const overlayId = overlay.id;

    // Add a reference to this
    overlay._colorinput = this;

    // Extend form field events
    const events = commons.extend(this._events, {
      'key:down ._coral-ColorInput-input:not([readonly])': '_onKeyDown',
      'key:down [handle="colorPreview"]': '_onKeyDown',
      'click [handle="colorPreview"]': '_onColorPreviewClick',
      'key:esc input': '_onKeyEsc',
      'key:enter input': '_onKeyEsc',

      // private
      'coral-colorinput-item:_selectedchanged': '_onItemSelectedChanged'
    });

    // Overlay
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_beforeOverlayOpen';
    events[`global:capture:coral-overlay:close #${overlayId}`] = '_onOverlayClose';
    events[`global:key:esc #${overlayId}`] = '_onKeyEsc';

    // Events
    this._delegateEvents(events);

    // Pre-define labellable element
    this._labellableElement = this._elements.input;

    // Used for eventing
    this._oldSelection = null;

    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }

  /**
   Returns the inner overlay to allow customization.

   @type {Popover}
   @readonly
   */
  get overlay() {
    return this._elements.overlay;
  }

  /**
   The Collection Interface that allows interacting with the items that the component contains.

   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-colorinput-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
    return this._items;
  }

  /**
   The selected item in the ColorInput.

   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }

  /**
   The ColorInput variant. See {@link ColorInputVariantEnum}.

   @default ColorInputVariantEnum.DEFAULT
   @type {String}
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

    if (this._variant === variant.SWATCH) {
      this.classList.add('_coral-ColorInput--swatch');
      this._elements.input.setAttribute('tabindex', -1);
      this._elements.colorPreview.removeAttribute('tabindex');
    } else {
      this.classList.remove('_coral-ColorInput--swatch');
      this._elements.input.removeAttribute('tabindex');
    }

    this._syncColorPreviewIcon();
  }

  /**
   Convenient property to get/set the the current color. If the value is no valid color it will return
   <code>null</code> (The getter will return a copy of the current selected color).

   @type {Color}
   */
  get valueAsColor() {
    if (!this._color) {
      this._color = new Color();
    }

    // sync this._color with the hidden field if necessary
    const newColor = new Color();
    newColor.value = this.value;
    if (!this._color.isSimilarTo(newColor, true)) {
      this._color.value = newColor.value;
      this._color.alpha = newColor.alpha;
    }

    if (this._color.rgb === null) {
      return null;
    }

    return this._color.clone();
  }

  set valueAsColor(value) {
    if (!this._color) {
      this._color = new Color();
    }

    if (!value) {
      // clear color values
      this._color.value = '';
      this.value = '';
    } else {
      // set color values
      this._color = value;

      if (value.alpha < 1) {
        // if an alpha value is used store rgba in the hidden field (it is the only format that can store alpha)
        this.value = value.rgbaValue;
      } else {
        this.value = value.value;
      }
    }
  }

  /**
   Should shades (darker colors) or tints (lighter colors) automatically be generated.
   See {@link ColorInputAutoGenerateColorsEnum}.

   @default Coral.ColorInput.autoGenerateColors.OFF
   @type {String}
   @htmlattribute autogeneratecolors
   */
  get autoGenerateColors() {
    return this._autoGenerateColors || autoGenerateColors.OFF;
  }

  set autoGenerateColors(value) {
    value = transform.string(value).toLowerCase();
    this._autoGenerateColors = validate.enumeration(autoGenerateColors)(value) && value || autoGenerateColors.OFF;

    this._recalculateGeneratedColors();
  }

  /**
   Whether swatches view should be displayed. See {@link ColorInputSwatches}.

   @default ColorInputShowSwatchesEnum.ON
   @type {ColorInputSwatches}
   @htmlattribute showswatches
   */
  get showSwatches() {
    return this._showSwatches || showSwatches.ON;
  }

  set showSwatches(value) {
    value = transform.string(value).toLowerCase();
    this._showSwatches = validate.enumeration(showSwatches)(value) && value || showSwatches.ON;

    this._showOrHideView(this._elements.swatchesView, this._showSwatches === showSwatches.OFF);
  }

  /**
   Whether properties view should be displayed. See {@link ColorInputColorProperties}.

   @default ColorInputShowPropertiesEnum.ON
   @type {String}
   @htmlattribute showproperties
   */
  get showProperties() {
    return this._showProperties || showProperties.ON;
  }

  set showProperties(value) {
    value = transform.string(value).toLowerCase();
    this._showProperties = validate.enumeration(showProperties)(value) && value || showProperties.ON;

    this._showOrHideView(this._elements.propertiesView, this._showProperties === showProperties.OFF);
  }

  /**
   Whether default colors should be displayed. Link {@link ColorInputShowDefaultColorsEnum}.

   @default ColorInputShowDefaultColorsEnum.ON
   @type {String}
   @htmlattribute showdefaultcolors
   */
  get showDefaultColors() {
    return this._showDefaultColors || showDefaultColors.ON;
  }

  set showDefaultColors(value) {
    value = transform.string(value).toLowerCase();
    this._showDefaultColors = validate.enumeration(showDefaultColors)(value) && value || showDefaultColors.ON;

    const defaultPalette = this._elements.defaultPalette;
    if (this._showDefaultColors === showDefaultColors.ON) {
      if (!defaultPalette.parentNode) {
        this.insertBefore(defaultPalette, this.firstChild || null);
      }
    } else if (defaultPalette.parentNode) {
      defaultPalette.parentNode.removeChild(defaultPalette);
    }
  }

  /**
   Short hint that describes the expected value of the ColorInput. It is displayed when the ColorInput is empty
   and the variant is {@link Coral.ColorInput.variant.DEFAULT}

   @type {String}
   @default ""
   @htmlattribute placeholder
   @htmlattributereflected
   */
  get placeholder() {
    return this._elements.input.placeholder;
  }

  set placeholder(value) {
    this._reflectAttribute('placeholder', value);
    this._elements.input.placeholder = value;
  }

  /**
   The value of the color. This value can be set in 5 different formats (HEX, RGB, RGBA, HSB and CMYK). Corrects a
   hex value, if it is represented by 3 or 6 characters with or without '#'

   e.g:
   HEX:  #FFFFFF
   RGB:  rgb(16,16,16)
   RGBA: rgba(215,40,40,0.9)
   RGBA: hsb(360,100,100)
   CMYK: cmyk(0,100,50,0)

   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._value || '';
  }

  set value(value) {
    const oldColor = new Color();
    oldColor.value = this.value;

    const newColor = new Color();
    newColor.value = value;

    if (!newColor.isSimilarTo(oldColor, false)) {
      this._value = value;

      // make sure right ColorInput.Item is selected even if input field was set by hand
      this._selectColorInputColor(newColor);

      // trigger a change event
      this.trigger('coral-colorinput:_valuechange');
    }

    // always set the input to the current value
    this._elements.input.value = this.value;

    this._updateColorPreview();
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

    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);

    this._elements.input.disabled = this.disabled;
    this._elements.colorPreview.disabled = this._disabled || this.readOnly;

    this._syncColorPreviewIcon();
  }

  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }

  set invalid(value) {
    super.invalid = value;

    this._elements.input.invalid = this.invalid;
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
    this._elements.colorPreview.disabled = this.disabled || this._readOnly;
  }

  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }

  set labelledBy(value) {
    super.labelledBy = value;

    // Sync input aria-labelledby
    this._elements.input[value ? 'setAttribute' : 'removeAttribute']('aria-labelledby', value);

    // in case the user focuses the buttons, he will still get a notion of the usage of the component
    if (this.labelledBy) {
      this.setAttribute('aria-labelledby', this.labelledBy);
      this._elements.colorPreview.setAttribute('aria-labelledby',
        [this.labelledBy,
          this._elements.colorPreview.label.id].join(' '));
    } else {
      this.removeAttribute('aria-labelledby');
      this._elements.colorPreview.removeAttribute('aria-labelledby');
    }
  }

  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();

    this._validateSelection(event.target);
  }

  /** @private */
  _onItemAdded(item) {
    this._validateSelection(item);

    if (this._elements.overlay.open) {
      // simply close the overlay whenever a color is added
      this._elements.overlay.open = false;
    }
  }

  /** @private */
  _onItemRemoved() {
    if (this._elements.overlay.open) {
      // simply close the overlay whenever a color is removed
      this._elements.overlay.open = false;
    }
  }

  /** @private */
  _validateSelection(item) {
    const selectedItems = this.items._getAllSelected();

    // Last selected item wins
    item = item || selectedItems[selectedItems.length - 1];

    if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
      selectedItems.forEach((selectedItem) => {
        if (selectedItem !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selectedItem.removeAttribute('selected');
        }
      });

      // We can trigger change events again
      this._preventTriggeringEvents = false;
    }

    this._triggerChangeEvent();
  }

  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;

    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      // update hidden fields
      if (selectedItem) {
        this.value = selectedItem.getAttribute('value');
      }

      this.trigger('coral-colorinput:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });

      this._oldSelection = selectedItem;
    }
  }

  /** @ignore */
  _onColorPreviewClick(event) {
    // restore focus to appropriate element when overlay closes
    this._elements.overlay.returnFocusTo(this.variant === variant.SWATCH ? event.matchedTarget : this._elements.input);
  }

  _onInputChange(event) {
    if (event.target === this._elements.input) {
      // only handle changes to the hidden input field ...

      // stops the current event
      event.stopPropagation();

      const color = new Color();
      color.value = event.target[this._eventTargetProperty];

      this._setActiveColor(color);
    }
  }

  /** @ignore */
  _onKeyDown(event) {
    event.stopPropagation();

    // restore focus to appropriate element when overlay closes
    this._elements.overlay.returnFocusTo(this.variant === variant.SWATCH ? event.matchedTarget : this._elements.input);

    this._elements.overlay.open = true;
  }

  /** @ignore */
  _onKeyEsc(event) {
    if (!this._elements.overlay.open) {
      return;
    }

    event.stopPropagation();

    this._elements.overlay.open = false;
  }

  /** @ignore */
  _beforeOverlayOpen() {
    // Make sure appropriate tabbable descendant will receive focus
    if (this.showProperties === showProperties.ON) {
      this._elements.overlay.focusOnShow = this._elements.propertiesView._elements.colorPreview2;
    } else if (this.showSwatches === showSwatches.ON) {
      this._elements.overlay.focusOnShow =
        this._elements.overlay.querySelector('coral-colorinput-swatch[selected] > button') ||
        'coral-colorinput-swatch > button';
    }

    // set aria-expanded state
    this._elements.input.setAttribute('aria-expanded', true);
    this._elements.colorPreview.setAttribute('aria-expanded', true);
  }

  /** @ignore */
  _onOverlayClose() {
    // set aria-expanded state
    this._elements.input.setAttribute('aria-expanded', true);
    this._elements.colorPreview.setAttribute('aria-expanded', false);
  }

  /**
   Checks if the current input is valid or not. This check will only be performed on user interaction.

   @ignore
   */
  _validateInputValue() {
    this.invalid = this.value !== '' && this.valueAsColor === null;
  }

  /** @ignore */
  _showOrHideView(view, hide) {
    view.hidden = hide;
    // Remove both classes and add only the required one
    this._elements.overlay.classList.remove('_coral-ColorInput-onlySwatchesView', '_coral-ColorInput-onlyPropertiesView');

    if (!this._elements.propertiesView.hidden && this._elements.swatchesView.hidden) {
      this._elements.overlay.classList.add('_coral-ColorInput-onlyPropertiesView');
    } else if (this._elements.propertiesView.hidden && !this._elements.swatchesView.hidden) {
      this._elements.overlay.classList.add('_coral-ColorInput-onlySwatchesView');
    }

    // Update accessibility label for colorPreview button when only swatches are shown
    if (this.showProperties === showProperties.OFF &&
      this.showSwatches === showSwatches.ON) {
      this._elements.colorPreview.label.textContent = i18n.get('Swatches');
      this._elements.overlay.setAttribute('aria-label', i18n.get('Swatches'));
    } else {
      this._elements.colorPreview.label.textContent = i18n.get('Color Picker');
      this._elements.overlay.setAttribute('aria-label', i18n.get('Color Picker'));
    }
  }

  /** @ignore */
  _recalculateGeneratedColors() {
    // remove old generated tint colors
    const childrenList = this.querySelectorAll('coral-colorinput-item[coral-colorinput-generatedcolor]');
    const childrenListLength = childrenList.length;
    for (let i = 0 ; i < childrenListLength ; i++) {
      childrenList[i].remove();
    }

    if (this.autoGenerateColors !== autoGenerateColors.OFF) {
      const colorElements = this.items.getAll();

      let colorEl = null;
      let color = null;
      let colorIndex = 0;
      let generatedIndex = 0;

      let generatedColorEl = null;
      let generatedColors = [];

      for (colorIndex = 0 ; colorIndex < colorElements.length ; colorIndex++) {
        colorEl = colorElements[colorIndex];
        color = new Color();
        color.value = colorEl.value;

        generatedColors = this.autoGenerateColors === autoGenerateColors.TINTS ? color.calculateTintColors(5) : color.calculateShadeColors(5);

        for (generatedIndex = generatedColors.length - 1 ; generatedIndex >= 0 ; generatedIndex--) {
          generatedColorEl = new ColorInputItem();
          // be sure to add alpha
          generatedColorEl.value = generatedColors[generatedIndex].rgbaValue;
          generatedColorEl.setAttribute('coral-colorinput-generatedcolor', '');
          colorEl.parentNode.insertBefore(generatedColorEl, colorEl.nextSibling);
        }
      }
    }
  }

  /** @ignore */
  _syncColorPreviewIcon() {
    const colorPreview = this._elements.colorPreview;

    colorPreview.icon = this.disabled && this.variant === variant.SWATCH ? 'lockClosed' : '';
    colorPreview.iconSize = Icon.size.SMALL;
  }

  /** @ignore */
  _setActiveColor(color) {
    // method used by subviews to set a color and trigger a change event if needed
    const oldColor = this.valueAsColor ? this.valueAsColor : new Color();
    this.valueAsColor = color;

    if (!oldColor.isSimilarTo(this.valueAsColor, false)) {
      // test if current color is invalid
      this._validateInputValue();

      // trigger a change event (change events should only be triggered when an user interaction happened)
      this.trigger('change');
    }
  }

  /** @ignore */
  _selectColorInputColor(newColor) {
    let selectColorInItems = true;

    if (this.selectedItem) {
      const selectedColor = new Color();
      selectedColor.value = this.selectedItem.value;

      // only select color if it is not already selected
      selectColorInItems = !selectedColor.isSimilarTo(newColor, true);
    }

    if (selectColorInItems) {
      // select right color in this.items (if necessary and possible)
      const selectedItem = this.selectedItem;
      if (selectedItem) {
        selectedItem.removeAttribute('selected');
      }

      const colorElements = this.items.getAll();
      const colorElementsCount = colorElements.length;

      let color = null;
      for (let i = 0 ; i < colorElementsCount ; i++) {
        color = new Color();
        color.value = colorElements[i].getAttribute('value');

        if (color.isSimilarTo(newColor, true)) {
          colorElements[i].setAttribute('selected', '');
          break;
        }
      }
    }
  }

  /** @private */
  _setDefaultSelectedItem() {
    const selectedItem = this.selectedItem;
    const value = this.value;

    // Sync selectedItem if value is set
    if (value && !selectedItem) {
      const color = new Color();
      color.value = value;
      this._selectColorInputColor(color);
    }

    // Also sync color preview
    this._updateColorPreview();
  }

  _updateColorPreview() {
    const isValueEmpty = this.value === '';

    // update color preview
    const currentColor = this.valueAsColor;
    this._elements.colorPreview.style.backgroundColor = currentColor ? currentColor.rgbaValue : '';
    this.classList.toggle('_coral-ColorInput--novalue', isValueEmpty);

    // Update preview in overlay
    const preview = this._elements.overlay.querySelector('._coral-ColorInput-preview');
    if (preview) {
      preview.classList.toggle('_coral-ColorInput-preview--novalue', isValueEmpty);
    }
    this._elements.input.setAttribute("aria-label", this._items._container._color._value);
  }

  /**
   Returns {@link ColorInput} variants.

   @return {ColorInputVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /**
   Returns {@link ColorInput} auto generated colors options.

   @return {ColorInputAutoGenerateColorsEnum}
   */
  static get autoGenerateColors() {
    return autoGenerateColors;
  }

  /**
   Returns {@link ColorInput} swatches display options.

   @return {ColorInputShowSwatchesEnum}
   */
  static get showSwatches() {
    return showSwatches;
  }

  /**
   Returns {@link ColorInput} color properties display options.

   @return {ColorInputShowDefaultColorsEnum}
   */
  static get showDefaultColors() {
    return showDefaultColors;
  }

  /**
   Returns {@link ColorInput} default colors display options.

   @return {ColorInputShowPropertiesEnum}
   */
  static get showProperties() {
    return showProperties;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      autogeneratecolors: 'autoGenerateColors',
      showswatches: 'showSwatches',
      showproperties: 'showProperties',
      showdefaultcolors: 'showDefaultColors'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'variant',
      'autogeneratecolors',
      'showswatches',
      'showproperties',
      'showdefaultcolors',
      'placeholder'
    ]);
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    const overlay = this._elements.overlay;
    // Cannot be open by default when rendered
    overlay.removeAttribute('open');
    // Restore in DOM
    if (overlay._parent) {
      overlay._parent.appendChild(overlay);
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    this.setAttribute('role', 'group');

    const frag = document.createDocumentFragment();

    // Render template
    frag.appendChild(this._elements.defaultPalette);
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.buttonWrapper);
    frag.appendChild(this._elements.overlay);

    // Support cloneNode
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.ELEMENT_NODE && child.hasAttribute('handle')) {
        this.removeChild(child);
      } else {
        frag.appendChild(child);
      }
    }

    // we use 'this' so properly aligns to the input
    this._elements.overlay.target = this._elements.colorPreview;

    this.appendChild(frag);

    // Make sure colors are generated
    this.autoGenerateColors = this.autoGenerateColors;
    this.showDefaultColors = this.showDefaultColors;

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;

    // Make sure we don't have multiple items selected
    this._validateSelection();

    // If value is set to default palette item value, we have to make sure it's selected
    this._setDefaultSelectedItem();

    // We can trigger events gain
    this._preventTriggeringEvents = false;

    this._oldSelection = this.selectedItem;
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();

    const overlay = this._elements.overlay;
    // In case it was moved out don't forget to remove it
    if (!this.contains(overlay)) {
      overlay._parent = overlay._repositioned ? document.body : this;
      overlay.remove();
    }
  }
});

export default ColorInput;
