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
import {Button} from '../../../coral-component-button';
import {SelectableCollection} from '../../../coral-collection';
import base from '../templates/base';
import {transform, validate, commons} from '../../../coral-utils';

/**
 Enumeration for {@link ButtonGroup} selection options.

 @typedef {Object} ButtonGroupSelectionModeEnum

 @property {String} NONE
 None is default, selection of buttons doesn't happen based on click.
 @property {String} SINGLE
 Single selection mode, button group behaves like radio input elements.
 @property {String} MULTIPLE
 Multiple selection mode, button group behaves like checkbox input elements.
 */
const selectionMode = {
  NONE: 'none',
  SINGLE: 'single',
  MULTIPLE: 'multiple'
};

/** @const Selector used to recognized an item of the ButtonGroup */
const ITEM_SELECTOR = 'button[is="coral-button"]';

/**
 Extracts the value from the item in case no explicit value was provided.
 @param {HTMLElement} item
 the item whose value will be extracted.
 @returns {String} the value that will be submitted for this item.
 @private
 */
const itemValueFromDOM = function (item) {
  const attr = item.getAttribute('value');
  // checking explicitely for null allows to differenciate between non set values and empty strings
  return attr !== null ? attr : item.textContent.replace(/\s{2,}/g, ' ').trim();
};

const CLASSNAME = '_coral-ButtonGroup';

/**
 @class Coral.ButtonGroup
 @classdesc A ButtonGroup component that can be used as a selection form field.
 @htmltag coral-buttongroup
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class ButtonGroup extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Store template
    this._elements = {};
    base.call(this._elements);

    // Pre-define labellable element
    this._labellableElement = this;

    // save initial selection (used for reset)
    this._initalSelectedValues = [];

    // Attach events
    this._delegateEvents(commons.extend(this._events, {
      'click button[is="coral-button"]': '_onButtonClick',

      'capture:focus button[is="coral-button"]': '_onButtonFocus',
      'capture:blur button[is="coral-button"]': '_onButtonBlur',

      'key:up button[is="coral-button"]': '_onButtonKeyUpLeft',
      'key:left button[is="coral-button"]': '_onButtonKeyUpLeft',
      'key:down button[is="coral-button"]': '_onButtonKeyDownRight',
      'key:right button[is="coral-button"]': '_onButtonKeyDownRight',
      'key:home button[is="coral-button"]': '_onButtonKeyHome',
      'key:end button[is="coral-button"]': '_onButtonKeyEnd',

      'coral-button:_valuechanged button[is="coral-button"]': '_onButtonValueChanged',
      'coral-button:_selectedchanged button[is="coral-button"]': '_onButtonSelectedChanged'
    }));

    // Init the mutation observer but we don't handle the initial items in the constructor
    this.items._startHandlingItems(true);
  }

  /**
   The Collection Interface that allows interacting with the items that the component contains.

   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // we do lazy initialization of the collection
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemBaseTagName: 'button',
        itemTagName: 'coral-button',
        itemSelector: ITEM_SELECTOR,
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved,
        onCollectionChange: this._onCollectionChange
      });
    }

    return this._items;
  }

  /**
   Selection mode of Button group

   @type {String}
   @default ButtonGroupSelectionModeEnum.NONE
   @htmlattribute selectionmode
   @htmlattributereflected
   */
  get selectionMode() {
    return this._selectionMode || selectionMode.NONE;
  }

  set selectionMode(value) {
    value = transform.string(value).toLowerCase();
    this._selectionMode = validate.enumeration(selectionMode)(value) && value || selectionMode.NONE;
    this._reflectAttribute('selectionmode', this._selectionMode);

    // update select element if multiple
    // this is required while appplying default selection
    // if selection mode is single first elem gets selected but for multiple its not
    this._elements.nativeSelect.multiple = this._selectionMode === selectionMode.MULTIPLE;

    // Sync
    if (this._selectionMode === selectionMode.SINGLE) {
      this.setAttribute('role', 'radiogroup');

      // makes sure the internal options are properly initialized
      this._syncItemOptions();

      // we make sure the selection is valid by explicitly finding a candidate or making sure just 1 item is
      // selected
      this._validateSelection();
    } else if (this._selectionMode === selectionMode.MULTIPLE) {
      this.setAttribute('role', 'group');

      // makes sure the internal options are properly initialized
      this._syncItemOptions();
    } else {
      this.setAttribute('role', 'group');

      this._removeItemOptions();
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
    return this._elements.nativeSelect.name;
  }

  set name(value) {
    this._reflectAttribute('name', value);

    this._elements.nativeSelect.name = value;
  }

  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._elements.nativeSelect.value;
  }

  set value(value) {
    if (this.selectionMode === selectionMode.NONE) {
      return;
    }

    // we proceed to select the provided value
    this._selectItemByValue([value]);
  }

  /**
   Returns an Array containing the selected buttons.

   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    if (this.selectionMode === selectionMode.MULTIPLE) {
      return this.items._getAllSelected();
    }

    const item = this.selectedItem;
    return item ? [item] : [];
  }

  /**
   Returns the first selected button in the Button Group. The value <code>null</code> is returned if no button is
   selected.

   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.selectionMode === selectionMode.MULTIPLE ?
      this.items._getFirstSelected() :
      this.items._getLastSelected();
  }

  /**
   Current selected values as submitted during form submission.

   @type {Array.<String>}
   */
  get values() {
    const values = [];

    // uses the nativeSelect since it holds the truth of what will be submitted with the form
    const selectedOptions = this._elements.nativeSelect.querySelectorAll(':checked');
    for (let i = 0, selectedOptionsCount = selectedOptions.length ; i < selectedOptionsCount ; i++) {
      values.push(selectedOptions[i].value);
    }

    return values;
  }

  set values(values) {
    if (Array.isArray(values) && this.selectionMode !== selectionMode.NONE) {
      // just keeps the first value if selectionMode is not multiple
      if (this.selectionMode !== selectionMode.MULTIPLE && values.length > 1) {
        values = [values[0]];
      }

      // we proceed to select the provided values
      this._selectItemByValue(values);
    }
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

    const isDisabled = this.disabled || this.readOnly;
    this._elements.nativeSelect.disabled = isDisabled;
    // Also update for all the items the disabled property so it matches the native select.
    this.items.getAll().forEach((item) => {
      item.disabled = isDisabled;
    });
    this[isDisabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', isDisabled);
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

    this._elements.nativeSelect.disabled = this.readOnly || this.disabled;
    // Also update for all the items the disabled property so it matches the native select.
    this.items.getAll().forEach((item) => {
      item.disabled = this.disabled || this.readOnly && !item.hasAttribute('selected');
      item[this.readOnly ? 'setAttribute' : 'removeAttribute']('aria-disabled', true);
    });
    // aria-readonly is not permitted on elements with role="radiogroup" or role="group"
    this.removeAttribute('aria-readonly');
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

    this._elements.nativeSelect.required = this.required;
    // aria-required is permitted on elements with role="radiogroup" but not with role="group"
    if (this.selectionMode !== selectionMode.SINGLE) {
      this.removeAttribute('aria-required');
    }
  }

  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }

  set labelledBy(value) {
    super.labelledBy = value;
    this._elements.nativeSelect.setAttribute('aria-labelledby', this.labelledBy);
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // reset the values to the initial values
    this.values = this._initalSelectedValues;
  }

  /** @private */
  _onButtonClick(event) {
    // uses matchTarget to make sure the buttons is handled and not an internal component
    const item = event.matchedTarget;

    this._onButtonFocus(event);

    if (this.readOnly) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.selectionMode === selectionMode.SINGLE) {
      // prevent event only if selectionMode is not of type none
      event.preventDefault();

      // first unselect the other element
      const selectedItems = this.items._getAllSelected();

      // we deselect the previously selected item
      if (selectedItems.length !== 0 && selectedItems[0] !== item) {
        this._toggleItemSelection(selectedItems[0], false);
      }

      // forces the selection on the clicked item
      this._toggleItemSelection(item, true);

      // if the same button was clicked we do not need to trigger an event
      if (selectedItems[0] !== item) {
        this.trigger('change');
      }
    } else if (this.selectionMode === selectionMode.MULTIPLE) {
      // prevent event only if selectionMode is not of type none
      event.preventDefault();

      this._toggleItemSelection(item);

      // since we toggle the selection we always trigger a change event
      this.trigger('change');
    }
  }

  /** @private */
  _onButtonFocus(event) {
    const item = event.matchedTarget;
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;

    let button;
    for (let i = 0 ; i < buttonsCount ; i++) {
      // stores the reference
      button = buttons[i];
      button.setAttribute('tabindex', button === item ? 0 : -1);
    }
  }

  /** @private */
  _onButtonBlur(event) {
    const item = event.matchedTarget;
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;

    let button;
    let tabindex;
    const selectedItemsLength = this.selectedItems.length;
    const firstSelectable = this.items._getFirstSelectable();
    let isSelected = false;
    for (let i = 0 ; i < buttonsCount ; i++) {
      // stores the reference
      button = buttons[i];
      isSelected = button.hasAttribute('selected');
      if (this.selectionMode === selectionMode.SINGLE) {
        // selected item should be tabbable
        tabindex = isSelected ? 0 : -1;
      } else if (this.selectionMode === selectionMode.MULTIPLE) {
        tabindex =
          // if no items are selected, first item should be tabbable
          !selectedItemsLength && i === 0 ||
          // if the element losing focus is selected, it should be tabbable
          isSelected && button === item ||
          // if the element losing focus is not selected, the last selected item should be tabbable
          !item.hasAttribute('selected') &&
          button === (this.selectedItems[selectedItemsLength - 1] || firstSelectable) ? 0 : -1;
      } else {
        // first item should be tabbable
        tabindex = button === firstSelectable ? 0 : -1;
      }
      button.setAttribute('tabindex', tabindex);
    }
  }

  /** @private */
  _onButtonKeyUpLeft(event) {
    event.preventDefault();

    const item = event.matchedTarget;
    let button = item.previousElementSibling;

    // skip disabled items
    while (!button || (button.disabled || button.nodeName !== 'BUTTON')) {
      if (!button) {
        button = this.items._getLastSelectable();
      } else {
        button = button.previousElementSibling;
      }
    }

    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }

  /** @private */
  _onButtonKeyDownRight(event) {
    event.preventDefault();

    const item = event.matchedTarget;
    let button = item.nextElementSibling;

    // skip disabled items
    while (!button || (button.disabled || button.nodeName !== 'BUTTON')) {
      if (!button) {
        button = this.items._getFirstSelectable();
      } else {
        button = button.nextElementSibling;
      }
    }

    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }

  /** @private */
  _onButtonKeyHome(event) {
    event.preventDefault();

    const item = event.matchedTarget;
    const button = this.items._getFirstSelectable();

    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }

  /** @private */
  _onButtonKeyEnd(event) {
    event.preventDefault();

    const item = event.matchedTarget;
    const button = this.items._getLastSelectable();

    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }

  /** @private */
  _setFocusToButton(button) {
    if (button) {
      button.focus();
    }
  }

  /** @private */
  _onItemAdded(item) {
    // Store variant to be able to reset it when item is removed
    item._initialVariant = item._initialVariant || item.variant;

    // Force action variant
    if (!(item.variant === Button.variant.ACTION || item.variant === Button.variant.QUIET_ACTION)) {
      item.variant = item.variant === Button.variant.QUIET ? Button.variant.QUIET_ACTION : Button.variant.ACTION;
    }

    if (this.selectionMode !== selectionMode.NONE) {
      if (this.selectionMode === selectionMode.SINGLE) {
        item.setAttribute('role', 'radio');
        item.setAttribute('tabindex', item.hasAttribute('selected') ? 0 : -1);
      } else {
        item.setAttribute('role', 'checkbox');
      }
      item.setAttribute('aria-checked', item.hasAttribute('selected'));
    } else {
      item.removeAttribute('role');
    }

    item.disabled = this.disabled || this.readOnly && !item.hasAttribute('selected');

    item[this.readOnly ? 'setAttribute' : 'removeAttribute']('aria-disabled', true);

    this._addItemOption(item);

    // Handle the case where we might have multiple items selected while single selection mode is on
    if (this.selectionMode === selectionMode.SINGLE) {
      const selectedItems = this.items._getAllSelected();
      // The last added item will stay selected
      if (selectedItems.length > 1 && item.hasAttribute('selected')) {
        item.removeAttribute('selected');
      }
    }
  }

  /** @private */
  _onItemRemoved(item) {
    // Restore variant
    item.variant = item._initialVariant;
    item._initialVariant = undefined;
    item.removeAttribute('role');

    if (!item.parentNode) {
      // Remove the item from the initial selected values
      const index = this._initalSelectedValues.indexOf(item.value);
      if (index !== -1) {
        this._initalSelectedValues.splice(index, 1);
      }
    }

    // delete option
    if (item.option) {
      item.option.parentNode.removeChild(item.option);
      item.option = undefined;
    }
  }

  /** @private */
  _onCollectionChange() {
    // we need to make sure that the state of the selectionMode is valid
    this._validateSelection();
  }

  /** @private */
  _onButtonSelectedChanged(event) {
    event.stopImmediatePropagation();

    const button = event.target;
    const isSelected = button.hasAttribute('selected');

    // when in single mode, we need to make sure the current selection is valid
    if (this.selectionMode === selectionMode.SINGLE) {
      this._validateSelection(isSelected ? button : null);
    } else {
      // we simply toggle the selection
      this._toggleItemSelection(button, isSelected);
    }
  }

  /** @private */
  _onButtonValueChanged(event) {
    event.stopImmediatePropagation();

    const button = event.target;
    // Make sure option is attached before setting the value
    if (this.selectionMode !== selectionMode.NONE) {
      button.option.value = itemValueFromDOM(button);
    }
  }

  /**
   Toggles the selected state of the item. When <code>selected</code> is provided, it is set as the current state. If
   the value is ommited, then the selected is toggled.

   @param {HTMLElement} item
   Item whose selection needs to be updated.
   @param {Boolean} [selected]
   Whether the item is selected. If it is not provided, then it is toggled.

   @private
   */
  _toggleItemSelection(item, selected) {
    const ariaCheckedAttr = item.getAttribute('aria-checked');
    const tabIndexAttr = item.getAttribute('tabindex');

    // if selected is provided it is used to enforce the selection, otherwise we toggle the current state
    selected = typeof selected !== 'undefined' ? selected : !item.hasAttribute('selected');

    // only manipulates the attributes when necessary to avoid unnecessary mutations
    if (selected) {
      if (!item.hasAttribute('selected')) {
        item.setAttribute('selected', '');
      }

      if (ariaCheckedAttr !== 'true') {
        item.setAttribute('aria-checked', true);
      }

      if (this.selectionMode === selectionMode.SINGLE && tabIndexAttr !== '0') {
        item.setAttribute('tabindex', 0);
      }
    } else if (!selected) {
      if (item.hasAttribute('selected')) {
        item.removeAttribute('selected');
      }

      if (this.selectionMode !== selectionMode.NONE) {
        if (ariaCheckedAttr !== 'false') {
          item.setAttribute('aria-checked', false);
        }

        if (this.selectionMode === selectionMode.SINGLE && tabIndexAttr !== '-1') {
          item.setAttribute('tabindex', -1);
        }
      } else {
        item.removeAttribute('aria-checked');
        item.removeAttribute('tabindex');
      }
    }

    // if element.option is present - absent when selection mode changed to none
    if (item.option) {
      item.option.selected = selected;
    }
  }

  _selectItemByValue(values) {
    // queries all the buttons to change their selection state
    const buttons = this.items.getAll();
    let item;

    for (let i = 0, buttonsCount = buttons.length ; i < buttonsCount ; i++) {
      // stores the reference
      item = buttons[i];

      // if the value is inside the new values array it should be selected
      this._toggleItemSelection(item, values.indexOf(itemValueFromDOM(item)) !== -1);
    }
  }

  /** @private */
  _setInitialValues() {
    if (this.selectionMode !== selectionMode.NONE) {
      const selectedItems = this.selectedItems;
      for (let i = 0, selectedItemsCount = selectedItems.length ; i < selectedItemsCount ; i++) {
        // Store _initalSelectedValues for reset
        this._initalSelectedValues.push(selectedItems[i].value);

        // Same goes for native select
        this._addItemOption(selectedItems[i]);
      }
    }
  }

  /** @private */
  _addItemOption(item) {
    if (this.selectionMode === selectionMode.NONE) {
      return;
    }

    // if already attached return
    if (item.option) {
      return;
    }

    const option = document.createElement('option');
    option.value = itemValueFromDOM(item);

    if (item.hasAttribute('selected')) {
      option.setAttribute('selected', '');
    }

    // add it to DOM. In single selectionMode the first item gets selected automatically
    item.option = option;
    this._elements.nativeSelect.add(option);

    // we make sure the options reflect the state of the button
    this._toggleItemSelection(item, item.hasAttribute('selected'));
  }

  /** @private */
  _removeItemOptions() {
    // Find all buttons and try attaching corresponding option elem
    const buttons = this.items.getAll();

    let item;
    for (let i = 0, buttonsCount = buttons.length ; i < buttonsCount ; i++) {
      // stores the reference
      item = buttons[i];

      item.removeAttribute('role');
      item.removeAttribute('aria-checked');

      // single we are removing the options, selection must also go away
      if (item.hasAttribute('selected')) {
        this._toggleItemSelection(item, false);
      }

      // we clear the related option element
      if (item.option) {
        item.option.parentNode.removeChild(item.option);
        delete item.option;
      }
    }
  }

  /** @private */
  _syncItemOptions() {
    // finds all buttons and try attaching corresponding option elem
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;
    let i = 0;

    let role = null;
    if (this.selectionMode === selectionMode.SINGLE) {
      role = 'radio';
    } else if (this.selectionMode === selectionMode.MULTIPLE) {
      role = 'checkbox';
    }

    let button;
    let isSelected = false;

    for (i ; i < buttonsCount ; i++) {
      // try attaching corresponding input element
      this._addItemOption(buttons[i]);
    }

    // We need to set the right state for the native select AFTER all buttons have been added
    // (as we can't disable options while there is only one option attached [at least in FF])
    for (i = buttonsCount - 1 ; i >= 0 ; i--) {
      button = buttons[i];
      isSelected = button.hasAttribute('selected');
      button.option.selected = isSelected;
      button.setAttribute('aria-checked', isSelected);

      if (role) {
        button.setAttribute('role', role);
      } else {
        button.removeAttribute('role');
      }
    }
  }

  /** @private */
  _validateSelection(item) {
    // when selectionMode = single, we need to force a selection
    if (this.selectionMode === selectionMode.SINGLE) {
      // gets the current selection
      const selection = this.items._getAllSelected();
      const selectionCount = selection.length;

      // if no item is currently selected, we need to find a candidate
      if (selectionCount === 0) {
        // gets the first candidate for selection
        const selectable = this.items._getFirstSelectable();

        if (selectable) {
          this._toggleItemSelection(selectable, true);
        }
      }
      // more items are selected, so we find a single item and deselect everything else
      else if (selectionCount > 1) {
        // if no item was provided we force the selection on the first item
        item = item || selection[0];

        // we make sure the item is selected, this is important to match the options with the selection
        this._toggleItemSelection(item, true);

        for (let i = 0 ; i < selectionCount ; i++) {
          if (selection[i] !== item) {
            this._toggleItemSelection(selection[i], false);
          }
        }
      }
    }
  }

  /**
   Returns {@link ButtonGroup} selection options.

   @return {ButtonGroupSelectionModeEnum}
   */
  static get selectionMode() {
    return selectionMode;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      selectionmode: 'selectionMode'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'selectionmode',
      'selectionMode'
    ]);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._selectionMode) {
      this.selectionMode = selectionMode.NONE;
    }

    // Create a fragment
    const frag = document.createDocumentFragment();

    // Render the template
    frag.appendChild(this._elements.nativeSelect);

    // Clean up
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.getAttribute('handle') !== 'nativeSelect') {
        // Add non-template elements to the content
        frag.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Append the fragment to the component
    this.appendChild(frag);

    // Need to store and set the initially selected values in the native select so that it can reset
    this._setInitialValues();

    // Call onItemAdded and onCollectionChange on the existing items
    this.items._startHandlingItems();
  }
}

export default ButtonGroup;
