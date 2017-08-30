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
import FormField from 'coralui-mixin-formfield';
import Color from './Color';
import ColorInputItem from './ColorInputItem';
import {SelectableCollection} from 'coralui-collection';
import {Icon} from 'coralui-component-icon';
import 'coralui-component-textfield';
import 'coralui-component-button';
import 'coralui-component-overlay';
import './ColorInputColorProperties';
import './ColorInputSwatches';
import base from '../templates/base';
import {validate, transform, commons, i18n} from 'coralui-util';

const CLASSNAME = 'coral3-ColorInput';

/**
 Enumeration for colorinput variant.
 
 @memberof Coral.ColorInput
 @enum {String}
 */
const variant = {
  /** Use ColorInput as a formfield (default)*/
  DEFAULT: 'default',
  /** Use a simple swatch as ColorInput */
  SWATCH: 'swatch'
};

/**
 Enumeration for auto generated colors state.
 
 @memberof Coral.ColorInput
 @enum {String}
 */
const autoGenerateColors = {
  /** Disable auto generation */
  OFF: 'off',
  /** Automatically generate shades (darker colors) of all colors */
  SHADES: 'shades',
  /** Automatically generate tints (lighter colors) of all colors */
  TINTS: 'tints'
};

/**
 Whether swatches view should be displayed.
 
 @memberof Coral.ColorInput
 @enum {String}
 */
const showSwatches = {
  /** Display swatches view (default). */
  ON: 'on',
  /** Hide swatches view. */
  OFF: 'off'
};

/**
 Whether color properties view should be displayed.
 
 @memberof Coral.ColorInput
 @enum {String}
 */
const showProperties = {
  /** Display color properties view (default). */
  ON: 'on',
  /** Hide color properties view. */
  OFF: 'off'
};

/**
 Whether default colors should be displayed.
 
 @memberof Coral.ColorInput
 @enum {String}
 */
const showDefaultColors = {
  /** Display default colors (default). */
  ON: 'on',
  /** Hide default colors. */
  OFF: 'off'
};

/**
 @class Coral.ColorInput
 @classdesc A ColorInput component
 @htmltag coral-colorinput
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class ColorInput extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
    
    // @polyfill ie
    this._delegateEvents(commons.extend(this._events, {
      'coral-overlay:beforeopen': '_beforeOverlayOpen',
      'coral-overlay:close': '_onOverlayClose',
      'key:down .coral3-ColorInput-input:not([readonly])': '_onKeyDown',
      'key:down [handle="colorPreview"]': '_onKeyDown',
      'click [handle="colorPreview"]': '_onColorPreviewClick',
      'global:click': '_onGlobalClick',
      'key:esc input': '_onKeyEsc',
      'key:enter input': '_onKeyEsc',
  
      // private
      'coral-colorinput-item:_selectedchanged': '_onItemSelectedChanged',
    }));
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements);
  
    // Used for eventing
    this._oldSelection = null;
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.ColorInput#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-colorinput-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved,
      });
    }
    return this._items;
  }
  
  /**
   The selected item in the ColorInput.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.ColorInput#
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /**
   Variant how the colorinput should be displayed.
   
   @default Coral.ColorInput.variant.DEFAULT
   @type {Coral.ColorInput.variant}
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.ColorInput#
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
    
    if (this._variant === variant.SWATCH) {
      this.classList.add('coral3-ColorInput--swatch');
      this._elements.input.setAttribute('tabindex', -1);
      this._elements.colorPreview.removeAttribute('tabindex');
    }
    else {
      this.classList.remove('coral3-ColorInput--swatch');
      this._elements.input.removeAttribute('tabindex');
      this._elements.colorPreview.setAttribute('tabindex', -1);
    }
  
    this._syncColorPreviewIcon();
  }
  
  /**
   Convenient property to get/set the the current color. If the value is no valid color it will return
   <code>null</code> (The getter will return a copy of the current selected color).
   
   @type {Coral.Color}
   @memberof Coral.ColorInput#
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
    }
    else {
      // set color values
      this._color = value;
    
      if (value.alpha < 1) {
        // if an alpha value is used store rgba in the hidden field (it is the only format that can store alpha)
        this.value = value.rgbaValue;
      }
      else {
        this.value = value.value;
      }
    }
  }
  
  /**
   Should shades (darker colors) or tints (lighter colors) automatically be generated.
   
   @default Coral.ColorInput.autoGenerateColors.OFF
   @type {Coral.ColorInput.autoGenerateColors}
   @htmlattribute autogeneratecolors
   @memberof Coral.ColorInput#
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
   Whether swatches view should be displayed.
   
   @default Coral.ColorInput.showSwatches.ON
   @type {Coral.ColorInput.swatches}
   @htmlattribute showswatches
   @memberof Coral.ColorInput#
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
   Whether properties view should be displayed.
   
   @default Coral.ColorInput.showProperties.ON
   @type {Coral.ColorInput.colorProperties}
   @htmlattribute showproperties
   @memberof Coral.ColorInput#
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
   Whether default colors should be displayed.
   
   @default Coral.ColorInput.showDefaultColors.ON
   @type {Coral.ColorInput.showDefaultColors}
   @htmlattribute showdefaultcolors
   @memberof Coral.ColorInput#
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
    }
    else if (defaultPalette.parentNode) {
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
   @memberof Coral.ColorInput#
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
   @fires Coral.mixin.formField#change
   @memberof Coral.ColorInput#
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
  
  // JSDocs inherited
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
  
    this._elements.input.name = value;
  }
  
  // JSDoc inherited
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.setAttribute('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    
    this._elements.input.disabled = this.disabled;
    this._elements.colorPreview.disabled = this._disabled || this.readOnly;
  
    this._syncColorPreviewIcon();
  }
  
  // JSDoc inherited
  get invalid() {
    return super.invalid
  }
  set invalid(value) {
    super.invalid = value;
    
    this._elements.input.invalid = this.invalid;
  }
  
  // JSDoc inherited
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    this.setAttribute('aria-required', this._required);
    this._elements.input.required = this._required;
  }
  
  // JSDoc inherited
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    this.setAttribute('aria-readonly', this._readOnly);
  
    this._elements.input.readOnly = this._readOnly;
    this._elements.colorPreview.disabled = this.disabled || this._readOnly;
  }
  
  // JSDoc inherited
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
    }
    else {
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
    let selectedItems = this.items._getAllSelected();
    
    // Last selected item wins
    item = item || selectedItems[selectedItems.length - 1];
    
    if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
      selectedItems.forEach((selectedItem) => {
        if (selectedItem !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selectedItem.removeAttribute('selected');
        }
      }, this);
      
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
    this._elements.overlay.returnFocusTo((this.variant === variant.SWATCH ? event.matchedTarget : this._elements.input));
    
    this._elements.overlay.open = !this._elements.overlay.open;
  }
  
  /** @ignore */
  _onGlobalClick(event) {
    if (!this._elements.overlay.open) {
      return;
    }
    
    //Don't close when clicked inside itself
    if (!this.contains(event.target)) {
      this._elements.overlay.open = false;
    }
  }
  
  // JSDocs inherited from Coral.mixin.formField
  _onInputChange(event) {
    // method used by Coral.mixin.formField as a callback whenever a form field changes
    
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
    this._elements.overlay.returnFocusTo((this.variant === variant.SWATCH ? event.matchedTarget : this._elements.input));
    
    this._elements.overlay.open = true;
  }
  
  /** @ignore */
  _onKeyEsc() {
    if (!this._elements.overlay.open) {
      return;
    }
    
    this._elements.overlay.open = false;
  }
  
  /** @ignore */
  _beforeOverlayOpen() {
    // Make sure appropriate tabbable descendant will receive focus
    if (this.showProperties === showProperties.ON) {
      this._elements.overlay.focusOnShow = this._elements.propertiesView._elements.colorPreview2;
    }
    else if (this.showSwatches === showSwatches.ON) {
      this._elements.overlay.focusOnShow =
        this._elements.overlay.querySelector('coral-colorinput-swatch[selected] > button') ||
        'coral-colorinput-swatch > button';
    }
    
    // set aria-expanded state
    this._elements.colorPreview.setAttribute('aria-expanded', true);
  }
  
  /** @ignore */
  _onOverlayClose() {
    // set aria-expanded state
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
    //Remove both classes and add only the required one
    this._elements.overlay.classList.remove('coral3-ColorInput-onlySwatchesView', 'coral3-ColorInput-onlyPropertiesView');
    
    if (!this._elements.propertiesView.hidden && this._elements.swatchesView.hidden) {
      this._elements.overlay.classList.add('coral3-ColorInput-onlyPropertiesView');
    }
    else if (this._elements.propertiesView.hidden && !this._elements.swatchesView.hidden) {
      this._elements.overlay.classList.add('coral3-ColorInput-onlySwatchesView');
    }
    
    // Update accessibility label for colorPreview button when only swatches are shown
    if (this.showProperties === showProperties.OFF &&
      this.showSwatches === showSwatches.ON) {
      this._elements.colorPreview.label.textContent = i18n.get('Swatches');
      this._elements.overlay.setAttribute('aria-label', i18n.get('Swatches'));
    }
    else {
      this._elements.colorPreview.label.textContent = i18n.get('Color Picker');
      this._elements.overlay.setAttribute('aria-label', i18n.get('Color Picker'));
    }
  }
  
  /** @ignore */
  _recalculateGeneratedColors() {
    // remove old generated tint colors
    const childrenList = this.querySelectorAll('coral-colorinput-item[coral-colorinput-generatedcolor]');
    const childrenListLength = childrenList.length;
    for (let i = 0; i < childrenListLength; i++) {
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
      
      for (colorIndex = 0; colorIndex < colorElements.length; colorIndex++) {
        colorEl = colorElements[colorIndex];
        color = new Color();
        color.value = colorEl.value;
        
        generatedColors = (this.autoGenerateColors === autoGenerateColors.TINTS) ? color.calculateTintColors(5) : color.calculateShadeColors(5);
        
        for (generatedIndex = generatedColors.length - 1; generatedIndex >= 0; generatedIndex--) {
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
    
    colorPreview.icon = (this.disabled && this.variant === variant.SWATCH) ? 'lockOn' : '';
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
      for (let i = 0; i < colorElementsCount; i++) {
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
    // update color preview
    const currentColor = this.valueAsColor;
    this._elements.colorPreview.style.backgroundColor = currentColor ? currentColor.rgbaValue : '';
    this.classList.toggle('coral3-ColorInput--novalue', this.value === '');
  }
  
  // Expose enums
  static get variant() {return variant;}
  static get autoGenerateColors() {return autoGenerateColors;}
  static get showSwatches() {return showSwatches;}
  static get showDefaultColors() {return showDefaultColors;}
  static get showProperties() {return showProperties;}
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'variant',
      'autoGenerateColors',
      'autogeneratecolors',
      'showSwatches',
      'showswatches',
      'showProperties',
      'showproperties',
      'showDefaultColors',
      'showdefaultcolors',
      'placeholder'
    ]);
  }
  
  connectedCallback() {
    super.connectedCallback();
  
    this.classList.add(CLASSNAME);
  
    this.setAttribute('role', 'combobox');
    this.setAttribute('aria-expanded', false);
    
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
      }
      else {
        frag.appendChild(child);
      }
    }
    
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
    
    // we use 'this' so properly aligns to the input
    this._elements.overlay.target = this;
  }
}

export default ColorInput;
