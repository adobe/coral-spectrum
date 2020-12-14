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
import {Tag} from '../../../coral-component-taglist';
import {SelectableCollection} from '../../../coral-collection';
import AutocompleteItem from './AutocompleteItem';
import {Textfield} from '../../../coral-component-textfield';
import {Icon} from '../../../coral-component-icon';
import '../../../coral-component-button';
import '../../../coral-component-list';
import '../../../coral-component-popover';
import '../../../coral-component-wait';
import base from '../templates/base';
import loadIndicator from '../templates/loadIndicator';
import {transform, validate, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Autocomplete';

/**
 The distance, in pixels, from the bottom of the List at which we assume the user has scrolled
 to the bottom of the list.
 @type {Number}
 @ignore
 */
const SCROLL_BOTTOM_THRESHOLD = 50;

/**
 The number of milliseconds for which scroll events should be debounced.
 @type {Number}
 @ignore
 */
const SCROLL_DEBOUNCE = 100;

/**
 Enumeration for {@link Autocomplete} variants.

 @typedef {Object} AutocompleteVariantEnum

 @property {String} DEFAULT
 A default, gray Autocomplete.
 @property {String} QUIET
 An Autocomplete with no border or background.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

/**
 Enumeration for {@link Autocomplete} match options.

 @typedef {Object} AutocompleteMatchEnum

 @property {String} STARTSWITH
 Include only matches that start with the user provided value.
 @property {String} CONTAINS
 Include only matches that contain the user provided value.
 */
const match = {
  STARTSWITH: 'startswith',
  CONTAINS: 'contains'
};

/**
 @class Coral.Autocomplete
 @classdesc An Autocomplete component that allows users to search and select from a list of options.
 @htmltag coral-autocomplete
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Autocomplete extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Template
    this._elements = {};
    base.call(this._elements, {Icon, commons, i18n});

    this._elements.tagList.reset = () => {
      // Kill inner tagList reset so it doesn't interfer with the autocomplete reset
    };

    // Pre-define labellable element
    this._labellableElement = this._elements.input;

    const overlayId = this._elements.overlay.id;
    const events = {
      // ARIA Autocomplete role keyboard interaction
      // http://www.w3.org/TR/wai-aria-practices/#autocomplete
      'key:up [handle="input"]': '_handleInputUpKeypress',
      'key:alt+up [handle="input"]': '_handleInputUpKeypress',
      'key:down [handle="input"]': '_handleInputDownKeypress',
      'key:alt+down [handle="input"]': '_handleInputDownKeypress',
      'key:tab [handle="input"]': '_handleInputTabKeypress',
      'key:shift+tab [handle="input"]': '_handleListFocusShift',
      'capture:change [handle="input"]': '_handleInput',
      'input [handle="input"]': '_handleInputEvent',

      // Manually listen to keydown event due to CUI-3973
      'keydown': '_handleInputKeypressEnter',

      // Interaction
      'click [handle="trigger"]': '_handleTriggerClick',
      'mousedown [handle="trigger"]': '_handleTriggerMousedown',

      // Focus
      'capture:blur': '_handleFocusOut',
      'global:click': '_onGlobalClick',
      'global:touchstart': '_onGlobalClick',

      // Taglist
      'coral-collection:add [handle="tagList"]': '_handleTagAdded',
      'coral-collection:remove [handle="tagList"]': '_handleTagRemoved',
      'change [handle="tagList"]': '_preventTagListChangeEvent',

      // Items
      'coral-autocomplete-item:_valuechanged': '_handleItemValueChange',
      'coral-autocomplete-item:_selectedchanged': '_handleItemSelectedChange',
      'coral-autocomplete-item:_contentchanged': '_handleItemContentChange'
    };

    // Interaction
    events[`global:key:shift+tab #${overlayId} [is="coral-buttonlist-item"]`] = '_handleListFocusShift';
    events[`global:key:esc`] = '_handleListFocusShift';

    // Overlay
    events[`global:capture:coral-overlay:positioned #${overlayId}`] = '_onOverlayPositioned';
    events[`global:capture:coral-overlay:open #${overlayId}`] = '_onOverlayOpenOrClose';
    events[`global:capture:coral-overlay:close #${overlayId}`] = '_onOverlayOpenOrClose';

    // SelectList
    events[`global:key:enter #${overlayId} button[is="coral-buttonlist-item"]`] = '_handleSelect';
    events[`global:capture:mousedown #${overlayId} button[is="coral-buttonlist-item"]`] = '_handleSelect';
    events[`global:capture:scroll #${overlayId} [handle="selectList"]`] = '_onScroll';
    events[`global:capture:mousewheel #${overlayId} [handle="selectList"]`] = '_onMouseWheel';
    events[`global:capture:mousedown #${overlayId} [handle="selectList"]`] = '_onMouseDown';

    // Events
    this._delegateEvents(events);

    // A map of values to tags
    this._tagMap = {};

    // A list of selected values
    this._values = [];

    // A list of options objects
    this._options = [];

    // A map of option values to their content
    this._optionsMap = {};

    // Used for reset
    this._initialSelectedValues = [];

    // Bind the debounced scroll method
    this._handleScrollBottom = this._handleScrollBottom.bind(this);

    // Listen for mutations
    this._observer = new MutationObserver(this._handleMutation.bind(this));
    this._startObserving();
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
   The item collection.

   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        itemTagName: 'coral-autocomplete-item',
        host: this
      });
    }

    return this._items;
  }

  /**
   Indicates if the autocomplete is a single or multiple mode. In multiple mode, the user can select multiple
   values.

   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   */
  get multiple() {
    return this._multiple || false;
  }

  set multiple(value) {
    this._multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this._multiple);

    this._setName(this.name);

    if (this._multiple) {
      this._elements.tagList.hidden = false;
    } else {
      this._elements.tagList.hidden = true;
      this._elements.tagList.items.clear();
    }

    this.labelledBy = this.labelledBy;
  }

  /**
   Amount of time, in milliseconds, to wait after typing a character before the suggestion is shown.

   @type {Number}
   @default 200
   @htmlattribute delay
   */
  get delay() {
    return typeof this._delay === 'number' ? this._delay : 200;
  }

  set delay(value) {
    value = transform.number(value);

    if (typeof value === 'number' && value >= 0) {
      this._delay = transform.number(value);
    }
  }

  /**
   Set to <code>true</code> to restrict the selected value to one of the given options from the suggestions.
   When set to <code>false</code>, users can enter anything.

   <strong>NOTE:</strong> This API is under review and may be removed or changed in a subsequent release.
   @ignore

   @type {Boolean}
   @default false
   @htmlattribute forceselection
   @htmlattributereflected
   */
  get forceSelection() {
    return this._forceSelection || false;
  }

  set forceSelection(value) {
    this._forceSelection = transform.booleanAttr(value);
    this._reflectAttribute('forceselection', this._forceSelection);
  }

  /**
   A hint to the user of what can be entered.

   @type {String}
   @default ""
   @htmlattribute placeholder
   @htmlattributereflected
   */
  get placeholder() {
    return this._elements.input.placeholder;
  }

  set placeholder(value) {
    this._elements.input.placeholder = value;
    this._reflectAttribute('placeholder', this.placeholder);
  }

  /**
   Max length for the Input field

   @type {Number}
   @htmlattribute maxlength
   @htmlattributereflected
   */
  get maxLength() {
    return this._elements.input.maxLength;
  }

  set maxLength(value) {
    this._elements.input.maxLength = value;
    this._reflectAttribute('maxlength', this._elements.input.maxLength);
  }

  /**
   The Autocomplete's variant. See {@link AutocompleteVariantEnum}.

   @type {AutocompleteVariantEnum}
   @default AutocompleteVariantEnum.DEFAULT
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

    if (this._variant === variant.QUIET) {
      this._elements.inputGroup.classList.add('_coral-InputGroup--quiet');
      this._elements.input.variant = Textfield.variant.QUIET;
      this._elements.trigger.classList.add('_coral-FieldButton--quiet');
    } else {
      this._elements.inputGroup.classList.remove('_coral-InputGroup--quiet');
      this._elements.input.variant = Textfield.variant.DEFAULT;
      this._elements.trigger.classList.remove('_coral-FieldButton--quiet');
    }
  }

  /**
   The match mode. See {@link AutocompleteMatchEnum}.

   @type {String}
   @default AutocompleteMatchEnum.CONTAINS
   @htmlattribute match
   */
  get match() {
    return this._match || match.CONTAINS;
  }

  set match(value) {
    if (typeof value === 'function') {
      this._match = value;
      this._matchFunction = value;
    } else {
      value = transform.string(value).toLowerCase();
      this._match = validate.enumeration(match)(value) && value || match.CONTAINS;

      if (this._match === match.STARTSWITH) {
        this._matchFunction = this._optionStartsWithValue;
      } else if (this._match === match.CONTAINS) {
        this._matchFunction = this._optionContainsValue;
      }
    }
  }

  /**
   Indicates that the component is currently loading remote data. This will set the wait indicator inside the list.

   @type {Boolean}
   @default false
   @htmlattribute loading
   */
  get loading() {
    return this._loading || false;
  }

  set loading(value) {
    this._loading = transform.booleanAttr(value);

    if (this._loading) {
      const overlay = this._elements.overlay;

      // we decide first if we need to scroll to the bottom since adding the load will change the dimensions
      const scrollToBottom = overlay.scrollTop >= overlay.scrollHeight - overlay.clientHeight;

      // if it does not exist we create it
      if (!this._elements.loadIndicator) {
        loadIndicator.call(this._elements);
      }

      // inserts the item at the end
      this._elements.selectList.appendChild(this._elements.loadIndicator);

      // we make the load indicator visible
      if (scrollToBottom) {
        overlay.scrollTop = overlay.scrollHeight;
      }
    } else if (this._elements.loadIndicator) {
      this._elements.loadIndicator.remove();
    }
  }

  /**
   Returns an Array containing the set selected items.
   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }

  /**
   Returns the first selected item in the Autocomplete. The value <code>null</code> is returned if no element is
   selected.
   @type {?HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getAllSelected()[0] || null;
  }

  /**
   The current value, as submitted during form submission.
   When {@link Coral.Autocomplete#multiple} is <code>true</code>, the first selected value will be returned.

   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    // Get the first value (or empty string)
    const values = this.values;
    return values && values.length > 0 ? values[0] : '';
  }

  set value(value) {
    this.values = [transform.string(value)];
  }

  /**
   The current values, as submitted during form submission.
   When {@link Coral.Autocomplete#multiple} is <code>false</code>, this will be an array of length 1.

   @type {Array.<String>}
   */
  get values() {
    return this._values;
  }

  set values(values) {
    if (values === undefined || values === null) {
      values = [];
    }

    if (Array.isArray(values)) {
      // if value was set to empty string
      if (values.length === 1 && values[0] === '') {
        values = [];
      }

      let i;
      let value;
      const selectedValues = [];

      // Valid values only
      if (this.forceSelection) {
        // Add each valid value
        for (i = 0 ; i < values.length ; i++) {
          value = values[i];
          if (this._optionsMap[value] !== undefined) {
            selectedValues.push(value);
          }
        }
      }
      // Any value goes
      else {
        for (i = 0 ; i < values.length ; i++) {
          value = values[i];
          selectedValues.push(value);
        }
      }

      if (this.multiple) {
        // Remove existing tags, DOM selection, etc
        // This is a full override
        this._clearValues();

        // Add each tag
        for (i = 0 ; i < selectedValues.length ; i++) {
          value = selectedValues[i];

          // Ensure the item is selected if it's present in the DOM
          // This keeps the DOM in sync with the JS API and prevents bugs like CUI-5681
          this._selectItem(value);

          // Add the value to the tag list
          this._addValue(value, null, true);
        }
      } else {
        // Set value
        this._values = selectedValues.length > 0 ? [selectedValues[0]] : [];
        this._reflectCurrentValue();
      }
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
    return this._getName();
  }

  set name(value) {
    this._reflectAttribute('name', value);

    this._setName(value);
  }

  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }

  set invalid(value) {
    super.invalid = value;

    // Add to outer component
    this._elements.inputGroup.classList.toggle('is-invalid', this.invalid);
    this._elements.trigger.classList.toggle('is-invalid', this.invalid);
    this._elements.input.invalid = this.invalid;
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
    this._elements.inputGroup.classList.toggle('is-disabled', this._disabled);

    this._elements.input.disabled = this._disabled;

    const disabledOrReadOnly = this._disabled || this.readOnly;
    this._elements.trigger.disabled = disabledOrReadOnly;
    this._elements.tagList.disabled = disabledOrReadOnly;
    // Prevents the overlay to be shown
    this._elements.inputGroup.disabled = disabledOrReadOnly;
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

    const readOnlyOrDisabled = this._readOnly || this.disabled;
    this._elements.trigger.readOnly = readOnlyOrDisabled;
    this._elements.tagList.readOnly = readOnlyOrDisabled;
    // Prevents the overlay to be shown
    this._elements.inputGroup.disabled = readOnlyOrDisabled;
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
   Inherited from {@link BaseFormField#labelled}.
   */
  get labelled() {
    return super.labelled;
  }

  set labelled(value) {
    super.labelled = value;

    this[this.labelled ? 'setAttribute' : 'removeAttribute']('aria-label', this.labelled);
    this._elements.selectList[this.labelled ? 'setAttribute' : 'removeAttribute']('aria-label', this.labelled);

    if (this.labelled && this.multiple) {
      this._elements.tagList.setAttribute('aria-label', this.labelled);
    } else {
      this._elements.tagList.removeAttribute('aria-label');
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

    this[this.labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.labelledBy);
    this._elements.selectList[this.labelledBy ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.labelledBy);

    if (this.labelledBy && this.multiple) {
      this._elements.tagList.setAttribute('aria-labelledby', this.labelledBy);
    } else {
      this._elements.tagList.removeAttribute('aria-labelledby');
    }
  }

  /**
   @ignore

   Not supported anymore.
   */
  get icon() {
    return this._icon || '';
  }

  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
  }

  /** @private */
  _getName() {
    if (this.multiple) {
      return this._elements.tagList.name;
    }

    return this._elements.field.name;
  }

  /**
   Set the name accordingly for multiple/single mode so the form submits contain only the right fields.

   @private
   */
  _setName(value) {
    if (this.multiple) {
      this._elements.tagList.name = value;
      this._elements.field.name = '';
    } else {
      this._elements.field.name = value;
      this._elements.tagList.name = '';
    }
  }

  /** @private */
  _startObserving() {
    this._observer.observe(this, {
      // Only watch the childList
      // Items will tell us if selected/value/content changes
      childList: true
    });
  }

  /**
   Stop watching for mutations. This should be done before manually updating observed properties.

   @protected
   */
  _stopObserving() {
    this._observer.disconnect();
  }

  // Override to do nothing
  _onInputChange(event) {
    // stops the current event
    event.stopPropagation();

    if (!this.multiple) {
      const inputText = this._elements.input.value.toLowerCase();

      if (this.forceSelection || inputText === '') {
        // We need a way to deselect item in single selection mode
        // 1) by using an empty string if this.forceSelection === false
        // 2) by using an invalid string if this.forceSelection === true
        const items = this.items.getAll();
        for (let i = 0 ; i < items.length ; i++) {
          if (items[i].value.toLowerCase() !== inputText) {
            items[i].selected = false;
          }
        }
      }
    }
  }

  /**
   Handle mutations to children and childList. This is used to keep the options in sync with DOM changes.

   @private
   */
  _handleMutation(mutations) {
    for (let i = 0 ; i < mutations.length ; i++) {
      const mutation = mutations[i];
      const target = mutation.target;

      if (mutation.type === 'childList' && target === this) {
        this._setStateFromDOM();
        return;
      }
    }
  }

  /**
   Update the option set and selected options from the DOM.

   @private
   */
  _setStateFromDOM() {
    this._createOptionsFromDOM();
    this._setSelectedFromDOM();
  }

  /**
   Create the set of options from nodes in the DOM.

   @private
   */
  _createOptionsFromDOM() {
    // Reset options array and value to content map
    this._options.length = 0;
    this._optionsMap = {};

    this.items.getAll().forEach((item) => {
      // Don't use properties as children may not be initialized yet
      const itemObj = {
        value: item.getAttribute('value'),
        icon: item.getAttribute('icon'),
        disabled: item.hasAttribute('disabled'),
        content: item.innerHTML.replace(/\s{2,}/g, ' ').trim(),
        text: item.innerText
      };
      this._options.push(itemObj);
      this._optionsMap[itemObj.value] = itemObj;
    });

    // @todo update value in hidden field if changed value = old value?
  }

  /** @private */
  _setInputValues(value, content) {
    this._elements.field.value = value;

    // Set text into input if in "multiple selection mode" or in "single selection mode and content is not empty"
    // otherwise keep the current text for us (should be marked red)
    if (this.multiple || content !== '') {
      this._elements.input.value = content.trim();
    }
  }

  /** @private */
  _reflectCurrentValue() {
    // Use empty string if no values
    const value = this._values.length > 0 ? this._values[0] : '';

    // Reflect the value in the field for form submit
    this._elements.field.value = value;

    let content = '';
    if (value !== '') {
      // Find the object with the corresponding content
      const itemObj = this._optionsMap[value];

      if (itemObj) {
        // Reflect the content in the input
        content = itemObj.content;
      } else {
        // Just use the provided value
        content = value;
      }
    }

    this._setInputValues(value, content);
  }

  /**
   Update the option set and selected options from the DOM
   @ignore
   */
  _setSelectedFromDOM() {
    const selectedItems = this.selectedItems;

    if (selectedItems.length) {
      // Use this.hasAttribute('multiple') instead of this.multiple here, as this method is called from _render and element might not be ready
      if (this.hasAttribute('multiple')) {
        // Remove current tags
        this._resetValues();

        // Add new ones
        for (let i = 0 ; i < selectedItems.length ; i++) {
          const value = selectedItems[i].getAttribute('value');
          const content = selectedItems[i].innerHTML;
          this._addValue(value, content, true);
        }
      } else {
        // Select last
        const last = selectedItems[selectedItems.length - 1];

        // Deselect others
        this._deselectExcept(last, selectedItems);

        // Set value from the attribute
        // We don't want to use the property as the sub-component may not have been upgraded yet
        this.value = last.getAttribute('value');
      }
    } else if (!this.hasAttribute('value')) {
      if (this.hasAttribute('multiple')) {
        this._resetValues();
      } else {
        this.value = '';
      }
    }
  }

  /**
   De-select every item except the provided item.

   @param {HTMLElement} exceptItem
   The item not to select
   @param {Array.<HTMLElement>} [items]
   The set of items to consider when deselecting. If not provided, the current set of selected items is used.

   @private
   */
  _deselectExcept(exceptItem, items) {
    const selectedItems = items || this.selectedItems;

    // Deselect others
    this._stopObserving();
    for (let i = 0 ; i < selectedItems.length ; i++) {
      if (selectedItems[i] !== exceptItem) {
        selectedItems[i].removeAttribute('selected');
      }
    }
    this._startObserving();
  }

  /**
   Add a tag to the taglist.

   @private
   */
  _addValue(value, content, asHTML) {
    if (!content) {
      // Find the content
      const itemObj = this._optionsMap[value];
      if (itemObj) {
        content = itemObj.content;
      } else {
        // Just use the value
        content = value;
      }
    }

    // Add to selected values
    const index = this._values.indexOf(value);
    if (index === -1) {
      this._values.push(value);
    }

    const labelContent = {};
    if (asHTML) {
      labelContent.innerHTML = content;
    } else {
      labelContent.textContent = content;
    }

    // Create a new tag
    const tag = new Tag().set({
      label: labelContent,
      value: value
    });

    // Add to map
    this._tagMap[value] = tag;

    // Add to taglist
    this._elements.tagList.items.add(tag);

    // make sure to remove text from input box (to easily choose next item)
    this._setInputValues('', '');
  }

  /**
   Remove a tag from the taglist.

   @private
   */
  _removeValue(value) {
    // Remove from selected values
    const index = this._values.indexOf(value);

    if (index === -1) {
      // Get out if we don't have the value
      return;
    }

    this._values.splice(index, 1);

    // Select autocomplete item
    const item = this.querySelector(`coral-autocomplete-item[value=${JSON.stringify(value)}]`);

    if (item) {
      if (item.hasAttribute('selected')) {
        this._stopObserving();
        item.removeAttribute('selected');
        this._startObserving();
      }
    }

    // Look up the tag by value
    const tag = this._tagMap[value];

    if (tag) {
      // Remove from map
      this._tagMap[value] = null;

      // Remove from taglist
      this._elements.tagList.items.remove(tag);
    }

    if (index !== -1) {
      // Emit the change event when a value is removed but only after a user interaction
      this.trigger('change');
    }
  }

  /**
   Remove all tags from the taglist.

   @private
   */
  _clearValues() {
    this._resetValues();

    // Deselect items
    this._stopObserving();
    const items = this.querySelectorAll('coral-autocomplete-item[selected]');
    for (let i = 0 ; i < items.length ; i++) {
      items[i].removeAttribute('selected');
    }

    this._startObserving();
  }

  /**
   Reset values without affecting the DOM.

   @private
   */
  _resetValues() {
    // Reset values
    this._values = [];

    // Drop references to tags
    this._tagMap = {};

    // Clear taglist
    this._elements.tagList.items.clear();
  }

  /** @private */
  _focusNextItem() {
    // Display focus on next item in the selectList
    const selectList = this._elements.selectList;
    const currentItem = selectList.querySelector('.is-focused');
    const input = this._elements.input;
    const items = selectList._getSelectableItems();
    let index;
    let item;

    if (currentItem) {
      index = items.indexOf(currentItem);
      if (index < items.length - 1) {
        item = items[index + 1];
      }
    } else if (items && items.length > 0) {
      item = items[0];
    }

    window.requestAnimationFrame(() => {
      if (item) {
        if (currentItem) {
          currentItem.classList.remove('is-focused');
        }
        this._scrollItemIntoView(item);
        item.classList.add('is-focused');
        input.setAttribute('aria-activedescendant', item.id);
      }
      if (!selectList.querySelector('.is-focused')) {
        input.removeAttribute('aria-activedescendant');
      }
    });
  }

  /** @private */
  _focusPreviousItem() {
    // Display focus on previous item in the selectList
    const selectList = this._elements.selectList;
    const currentItem = selectList.querySelector('.is-focused');
    const input = this._elements.input;
    const items = selectList._getSelectableItems();
    let index;
    let item;

    if (currentItem) {
      index = items.indexOf(currentItem);
      if (index > 0) {
        item = items[index - 1];
      }
      currentItem.classList.remove('is-focused');
    } else if (items && items.length > 0) {
      item = items[items.length - 1];
    }

    window.requestAnimationFrame(() => {
      if (item) {
        this._scrollItemIntoView(item);
        item.classList.add('is-focused');
        input.setAttribute('aria-activedescendant', item.id);
      }
      if (!selectList.querySelector('.is-focused')) {
        input.removeAttribute('aria-activedescendant');
      }
    });
  }

  /** @private */
  _showSuggestions() {
    // Get value from the input
    const inputValue = this._elements.input.value.toLowerCase().trim();

    // Since we're showing fresh suggestions, clear the existing suggestions
    this.clearSuggestions();

    // Trigger an event
    const event = this.trigger('coral-autocomplete:showsuggestions', {
      // Pass user input
      value: inputValue,
      // Started at zero here, always
      start: 0
    });

    // Flag to indicate that the private method is called before public showSuggestions method
    this._showSuggestionsCalled = true;

    if (event.defaultPrevented) {
      // Set loading mode
      this.loading = true;

      // Show the menu
      this.showSuggestions();
    } else {
      // Show suggestions that match in the DOM
      this.addSuggestions(this._getMatches(inputValue, this._optionContainsValue));
      this.showSuggestions();
    }
  }

  _onOverlayPositioned(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    if (this._elements.overlay.open) {
      this._elements.overlay.style.width = `${this.offsetWidth}px`;
    }
  }

  _onGlobalClick(event) {
    if (!this._elements.overlay.open) {
      return;
    }

    const eventTargetWithinOverlayTarget = this._elements.inputGroup.contains(event.target);
    const eventTargetWithinItself = this._elements.overlay.contains(event.target);
    if (!eventTargetWithinOverlayTarget && !eventTargetWithinItself) {
      this.hideSuggestions();
    }
  }

  /** @private */
  _onScroll() {
    this._isOverlayScrolling = true;
    window.clearTimeout(this._scrollTimeout);
    this._scrollTimeout = window.setTimeout(this._handleScrollBottom, SCROLL_DEBOUNCE);
  }

  /** @private */
  _onMouseWheel(event) {
    const selectList = this._elements.selectList;
    // If scrolling with mouse wheel and if it has hit the top or bottom boundary
    // `SCROLL_BOTTOM_THRESHOLD` is ignored when hitting scroll bottom to allow debounced loading
    if (event.deltaY < 0 && selectList.scrollTop === 0 || event.deltaY > 0 && selectList.scrollTop >= selectList.scrollHeight - selectList.clientHeight) {
      event.preventDefault();
    }
  }

  _onMouseDown(event) {
    this._isOverlayScrollBarClicked = event.matchedTarget.clientWidth <= event.offsetX;
  }

  /** @private */
  _handleScrollBottom() {
    const selectList = this._elements.selectList;

    if (selectList.scrollTop >= selectList.scrollHeight - selectList.clientHeight - SCROLL_BOTTOM_THRESHOLD) {
      const inputValue = this._elements.input.value;

      // Do not clear the suggestions here, instead we'll expect them to append

      // Trigger an event
      const event = this.trigger('coral-autocomplete:showsuggestions', {
        // Pass user input
        value: inputValue,
        start: selectList.items.length
      });

      if (event.defaultPrevented) {
        // Set loading mode
        this.loading = true;
      }
    }
  }

  /** @private */
  _handleFocusOut(event) {
    const selectList = this._elements.selectList;
    const target = event.target;
    const inputBlur = target === this._elements.input;

    if (this._blurTimeout) {
      clearTimeout(this._blurTimeout);
    }

    // This is to hack around the fact that you cannot determine which element gets focus in a blur event
    // Firefox doesn't support focusout/focusin, so we're left doing awful things
    this._blurTimeout = window.setTimeout(() => {
      const relatedTarget = document.activeElement;
      const focusOutside = !this.contains(relatedTarget) && !this._elements.overlay.contains(relatedTarget);

      // If focus has moved out of the autocomplete, it's an input event
      if (inputBlur && focusOutside && !this.multiple) {
        this._handleInput(event);
      }
      // Nothing was focused
      else if (!relatedTarget || ((inputBlur || relatedTarget !== document.body) &&
        // Focus is now outside of the autocomplete component
        focusOutside ||
        // Focus has shifted from the selectList to another element inside of the autocomplete component
        selectList.contains(target) && !selectList.contains(relatedTarget))) {
        this.hideSuggestions();
      }
    }, 0);
  }

  /** @private */
  _handleListFocusShift(event) {
    if (this._elements.overlay.open) {
      // Stop focus shift
      event.preventDefault();
      event.stopImmediatePropagation();

      this._hideSuggestionsAndFocus();
    }
  }

  /** @private */
  _hideSuggestionsAndFocus() {
    // Hide the menu and focus on the input
    this.hideSuggestions();
    this._elements.input.focus();
  }

  /** @private */
  _handleTriggerClick() {
    if (this._elements.overlay.classList.contains('is-open')) {
      this._hideSuggestionsAndFocus();
    } else {
      // Focus on the input so down arrow works as expected
      // Per @mijordan
      this._showSuggestions();
      this._elements.input.focus();
    }
  }

  /** @private */
  _handleTriggerMousedown() {
    this._elements.trigger.focus();
  }

  /** @private */
  _handleListItemFocus(event) {
    const item = event.matchedTarget;
    const selectList = this._elements.selectList;
    const currentItem = selectList.querySelector('.is-focused');
    const input = this._elements.input;

    if (currentItem) {
      currentItem.classList.remove('is-focused');
      input.removeAttribute('aria-activedescendant');
    }
    if (!item.disabled) {
      this._scrollItemIntoView(item);
      item.classList.add('is-focused');
      input.setAttribute('aria-activedescendant', item.id);
    }
  }

  /** @private */
  _scrollItemIntoView(item) {
    const itemRect = item.getBoundingClientRect();
    const selectListRect = this._elements.selectList.getBoundingClientRect();
    if (itemRect.top < selectListRect.top) {
      item.scrollIntoView();
    } else if (itemRect.bottom > selectListRect.bottom) {
      item.scrollIntoView(false);
    }
  }

  /** @private */
  _getMatches(value, optionMatchesValue) {
    optionMatchesValue = optionMatchesValue || this._matchFunction;

    const matches = [];

    for (let i = 0 ; i < this._options.length ; i++) {
      if (optionMatchesValue(this._options[i], value)) {
        matches.push(this._options[i]);
      }
    }

    if (!matches.length) {
      // If there are no matches in _options,
      // Check for matches in list, which could have been added after mounting the element
      const buttons = this._elements.selectList.items.getAll();
      for (let i = 0 ; i < buttons.length ; i++) {
        const option = {
          value: buttons[i].value,
          content: buttons[i].textContent.trim()
        };
        if (optionMatchesValue(option, value)) {
          matches.push(option);
        }
      }
    }

    return matches;
  }

  /** @private */
  _handleInputKeypressEnter(event) {
    // Sigh, CUI-3973 Hitting enter quickly after typing causes form to submit
    if (event.which === 13) {
      this._handleInput(event);
    }
  }

  /** @private */
  _handleInputEvent() {
    // Any input makes this valid again
    this.invalid = false;

    if (this.delay) {
      // Wait until the use has stopped typing for delay milliseconds before getting suggestions
      window.clearTimeout(this._timeout);
      this._timeout = window.setTimeout(this._showSuggestions.bind(this), this.delay);
    } else {
      // Immediately get suggestions
      this._showSuggestions();
    }
  }

  /** @private */
  _handleInput(event) {
    // Don't set value and hide suggestions while scrolling overlay
    if (this._isOverlayScrolling || this._isOverlayScrollBarClicked) {
      this._isOverlayScrolling = false;
      this._isOverlayScrollBarClicked = false;
      return;
    }

    // Stop the event
    event.preventDefault();

    let focusedItemValue;

    // If a selectList item has focus, set the input value to the value of the selected item.
    if (this._elements.overlay.open && this._elements.input.getAttribute('aria-activedescendant')) {
      const focusedItem = this._elements.selectList.querySelector('.is-focused');
      if (focusedItem) {
        // Use the text content value of the item for comparison
        focusedItemValue = focusedItem.textContent.trim();
      }
    }

    const value = focusedItemValue || this._elements.input.value;

    let isChange = false;

    // Get all exact matches
    const exactMatches = this._getMatches(value, this._optionEqualsValue);

    if (exactMatches.length) {
      // Find perfect case sensitive match else defaults to first one
      const exactMatch = exactMatches.filter((option) => option.content === value)[0] || exactMatches[0];

      isChange = this.value !== exactMatch.value;

      // Select the matched item
      this._selectItem(exactMatch.value, exactMatch.content, false);

      if (this.multiple) {
        if (value.trim()) {
          // Add tag for non-empty values
          this._addValue(exactMatch.value, exactMatch.content, false);
        }
      } else {
        // Set value
        this.value = exactMatch.value;
      }

      // value can't be invalid as an exact match is selected
      if (this.forceSelection) {
        this.invalid = false;
      }

      // Hide the suggestions so the result can be seen
      this.hideSuggestions();

      // Emit the change event when a selection is made from an exact match
      if (isChange === true) {
        this.trigger('change');
      }
    } else if (this.forceSelection) {
      // Invalid
      if (this.multiple) {
        this.invalid = value !== '' || (this.values.length === 1 && this.values[0] === '' || this.values.length === 0);
      } else {
        this.invalid = true;
      }
      // Leave suggestions open if nothing matches
    } else {
      // DO NOT select the corresponding item, as this would add an item
      // This would result in adding items that match what the user typed, resulting in selections
      // this._selectItem(value);

      isChange = this.value !== value;

      if (this.multiple) {
        if (value.trim()) {
          // Add tag for non-empty values
          this._addValue(value, null, false);
        }
      } else {
        // Set value
        this.value = value;
      }

      // Hide the suggestions so the result can be seen
      this.hideSuggestions();

      // Emit the change event when arbitrary data is entered
      if (isChange === true) {
        this.trigger('change');
      }
    }

    this._updateButtonAccessibilityLabel();
  }

  /**
   This ensures the collection API is up to date with selected items, even if they come from suggestions.

   @private
   */
  _selectItem(value, content, asHTML) {
    // Don't get caught up with internal changes
    this._stopObserving();

    // Select autocomplete item if it's there
    const item = this.querySelector(`coral-autocomplete-item[value=${JSON.stringify(value)}]`);
    if (item) {
      // Select the existing item
      item.setAttribute('selected', '');
    } else {
      const labelContent = {};
      content = typeof content === 'undefined' ? value : content;
      if (asHTML) {
        labelContent.innerHTML = content;
      } else {
        labelContent.textContent = content;
      }

      // Add a new, selected item
      this.items.add(new AutocompleteItem().set({
        value: value,
        content: labelContent,
        selected: true
      }));
    }

    // Resume watching for changes
    this._startObserving();
  }

  /** @private */
  _handleInputUpKeypress(event) {
    // Stop any consequences of pressing the key
    event.preventDefault();

    if (this._elements.overlay.open) {
      if (event.altKey) {
        this.hideSuggestions();
      } else {
        this._focusPreviousItem();
      }
    } else {
      // Show the menu and do not focus on the first item
      // Implements behavior of http://www.w3.org/TR/wai-aria-practices/#autocomplete
      this._showSuggestions();
    }
  }

  /** @private */
  _handleInputDownKeypress(event) {
    // Stop any consequences of pressing the key
    event.preventDefault();

    if (this._elements.overlay.open) {
      this._focusNextItem();
    } else {
      // Show the menu and do not focus on the first item
      // Implements behavior of http://www.w3.org/TR/wai-aria-practices/#autocomplete
      this._showSuggestions();
    }
  }

  /** @private */
  _handleInputTabKeypress(event) {
    // if the select list is open and a list item has focus, prevent default to trap focus.
    if (this._elements.overlay.open && this._elements.input.getAttribute('aria-activedescendant')) {
      event.preventDefault();
    }
  }

  /**
   Handle selections in the selectList.

   @ignore
   */
  _handleSelect(event) {
    const selectListItem = event.matchedTarget;

    if (!selectListItem || selectListItem.disabled) {
      // @todo it doesn't seem like this should ever happen, but it does
      return;
    }

    // Select the corresponding item, or add one if it doesn't exist
    this._selectItem(selectListItem.value, selectListItem.content.innerHTML, true);

    if (!this.multiple) {
      this.value = selectListItem.value;

      // Make sure the value is changed
      // The setter won't run if we set the same value again
      // This forces the DOM to update
      this._setInputValues(this.value, selectListItem.content.textContent, false);
    } else {
      // Add to values
      this._addValue(selectListItem.value, selectListItem.content.innerHTML, true);
    }

    // Focus on the input element
    // We have to wait a frame here because the item steals focus when selected
    window.requestAnimationFrame(() => {
      this._elements.input.focus();
    });

    // Hide the options when option is selected in all cases
    this.hideSuggestions();

    // Emit the change event when a selection is made
    this.trigger('change');
  }

  /**
   Don't let the internal change event bubble and confuse users

   @ignore
   */
  _preventTagListChangeEvent(event) {
    event.stopImmediatePropagation();
  }

  _handleTagAdded() {
    // Forces tags to wrap
    this._elements.tagList.style.width = `${this.offsetWidth}px`;
  }

  /**
   Handle tags that are removed by the user.

   @ignore
   */
  _handleTagRemoved(event) {
    // Get the tag from the event
    const tagValue = event.detail.item.value;

    // Remove from values only if there is no other tags with the same value are attached (as this component constantly adds and removes tags)
    // this._elements.tagList.values does not seem to work so iterate over the tags to check values
    let removeValue = true;
    const tags = this._elements.tagList.items.getAll();
    for (let i = 0 ; i < tags.length ; i++) {
      if (tags[i].value === tagValue) {
        removeValue = false;
        break;
      }
    }

    if (removeValue) {
      this._removeValue(tagValue);
    }

    // If all tags were removed, return focus to the input
    if (this.selectedItems.length === 0) {
      this._elements.input.focus();
    }

    this._updateButtonAccessibilityLabel();
  }

  /**
   Handles value changes on a child item.

   @private
   */
  _handleItemValueChange(event) {
    // stop event propogation
    event.stopImmediatePropagation();

    // Update option map from scratch
    // @todo use attributeOldValue mutationobserver option and update map instead of re-creating
    this._createOptionsFromDOM();
  }

  /**
   Handles content changes on a child item.

   @private
   */
  _handleItemContentChange(event) {
    // stop event propogation
    event.stopImmediatePropagation();

    // Update option map from scratch with new content
    this._createOptionsFromDOM();
  }

  /**
   Handles selected changes on a child item.

   @private
   */
  _handleItemSelectedChange(event) {
    // stop event propogation
    event.stopImmediatePropagation();

    const target = event.target;
    const selected = target.hasAttribute('selected');
    if (this.multiple) {
      this[selected ? '_addValue' : '_removeValue'](target.value, target.content.innerHTML, true);
    } else if (selected) {
      // Set the input text accordingly
      this._elements.input.value = target.content.textContent.replace(/\s{2,}/g, ' ').trim();
      // Set the value accordingly
      this.value = target.value;
      // value can't be invalid as an item is selected
      this.invalid = false;

      // Deselect the other elements if selected programatically changed
      this._deselectExcept(target);
    }
      // Remove values if deselected
      // Only do this if we're the current value
    // If the selected item was changed, this.value will be different
    else if (this.value === target.value) {
      this.value = '';

      // CUI-5533 Since checks inside of _handleInput will assume the value hasn't change,
      // We need to trigger here
      this.trigger('change');
    }
  }

  /**
   Check if the given option partially matches the given value.

   @param {HTMLElement} option
   The option to test
   @param {String} value
   The value to test

   @returns {Boolean} true if the value matches, false if not.

   @protected
   */
  _optionContainsValue(option, value) {
    value = (typeof value === 'string' ? value : '').toLowerCase();
    return (option.text || option.content).toLowerCase().indexOf(value) !== -1;
  }

  /**
   Check if the given option starts with the given value.

   @param {HTMLElement} option
   The option to test
   @param {String} value
   The value to test

   @returns {Boolean} true if the value matches, false if not.

   @protected
   */
  _optionStartsWithValue(option, value) {
    value = (typeof value === 'string' ? value : '').toLowerCase();
    return option.content.toLowerCase().trim().indexOf(value) === 0;
  }

  /**
   Check if the given option exactly matches the given value.

   @param {HTMLElement} option
   The option to test
   @param {String} value
   The value to test

   @returns {Boolean} true if the value matches, false if not.

   @protected
   */
  _optionEqualsValue(option, value) {
    value = (typeof value === 'string' ? value : '').toLowerCase();
    return option.content.toLowerCase().trim() === value;
  }

  /**
   Updates label on toggle button to communicate number of suggestions in list.

   @param {Number} num
   The number of suggestions available
   @private
   */
  _updateButtonAccessibilityLabel(num) {
    let str = i18n.get('Show suggestions');

    if (num === 1) {
      str = i18n.get('Show suggestion');
    } else if (num > 1) {
      str = i18n.get('Show {0} suggestions', num);
    }

    this._elements.trigger.setAttribute('aria-label', str);
    this._elements.trigger.setAttribute('title', str);
  }

  /**
   Clears the current selected value or items.
   */
  clear() {
    this.value = '';
    this._elements.input.clear();

    if (this.multiple) {
      this._clearValues();
    }
  }

  /**
   Clear the list of suggestions.
   */
  clearSuggestions() {
    this._elements.selectList.items.clear();
    this._updateButtonAccessibilityLabel();
  }

  /**
   A suggestion object.

   @typedef {Object} AutocompleteSuggestion

   @property {String} value
   The form submission value to use when this suggestion is selected.
   @property {String} [content=value]
   The content to disable in the suggestion dropdown.
   */

  /**
   Add the provided list of suggestions and clear loading status.

   @param {Array.<AutocompleteSuggestion>} suggestions
   The list of suggestions to show.
   @param {Boolean} clear
   If true, existing suggestions will be cleared.
   */
  addSuggestions(suggestions, clear) {
    // Disable loading mode
    this.loading = false;

    if (clear) {
      // Remove existing selectList items
      this.clearSuggestions();
    }

    // Add items to the selectlist
    for (let i = 0 ; i < suggestions.length ; i++) {
      const value = suggestions[i].value;
      const content = suggestions[i].content;
      const icon = suggestions[i].icon;
      const disabled = !!suggestions[i].disabled;

      // Only add the item if it's not a selected value or we're in single mode
      if (!this.multiple || this.values.indexOf(value) === -1) {
        this._elements.selectList.items.add({
          value: value,
          type: 'button',
          icon: icon,
          disabled: disabled,
          id: commons.getUID(),
          tabIndex: -1,
          content: {
            innerHTML: content
          }
        });
        this._elements.selectList.items.last().setAttribute('role', 'option');
      }
    }

    if (!suggestions.length && !this._elements.selectList.items.length) {
      // Show "no results" when no suggestions are found at all
      this._elements.selectList.items.add({
        type: 'button',
        content: {
          innerHTML: `<em>${i18n.get('No matching results.')}</em>`
        },
        disabled: true
      });
      this._elements.selectList.items.last().setAttribute('role', 'status');
      this._elements.selectList.items.last().setAttribute('aria-live', 'polite');
      this._elements.input.removeAttribute('aria-activedescendant');
      this._updateButtonAccessibilityLabel();
    } else {
      this._updateButtonAccessibilityLabel(this._elements.selectList.items.length);
    }
  }

  /**
   Shows the suggestion UI.
   */
  showSuggestions() {
    if (!this._showSuggestionsCalled) {
      this._showSuggestions();
    } else {
      this._showSuggestionsCalled = false;
    }

    // Just show
    this._elements.overlay.open = true;

    // Force overlay repositioning (e.g because of remote loading)
    requestAnimationFrame(() => {
      this._elements.overlay._onAnimate();
      this._elements.overlay.reposition();
    });

    this._elements.input.setAttribute('aria-expanded', 'true');
    this._elements.trigger.setAttribute('aria-expanded', 'true');
  }

  /**
   Hides the suggestion UI.
   */
  hideSuggestions() {
    this._elements.overlay.open = false;

    this._elements.input.setAttribute('aria-expanded', 'false');
    this._elements.trigger.setAttribute('aria-expanded', 'false');
    this._elements.input.removeAttribute('aria-activedescendant');

    // Don't let the suggestions show
    window.clearTimeout(this._timeout);

    // Trigger an event
    this.trigger('coral-autocomplete:hidesuggestions');
  }

  /**
   Matches the accessibility to the state of the popover.

   @ignore
   */
  _onOverlayOpenOrClose(event) {
    if (this._elements.overlay.open) {
      this._elements.input.setAttribute('aria-expanded', 'true');
      this._elements.trigger.setAttribute('aria-expanded', 'true');
    } else {
      this._elements.input.setAttribute('aria-expanded', 'false');
      this._elements.trigger.setAttribute('aria-expanded', 'false');
      this._elements.input.removeAttribute('aria-activedescendant');
    }
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // reset the values to the initial values
    this.values = this._initialSelectedValues;
  }

  /**
   Returns {@link Autocomplete} match options.

   @return {AutocompleteMatchEnum}
   */
  static get match() {
    return match;
  }

  /**
   Returns {@link Autocomplete} variants.

   @return {AutocompleteVariantEnum}
   */
  static get variant() {
    return variant;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      forceselection: 'forceSelection',
      maxlength: 'maxLength'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'multiple',
      'delay',
      'forceselection',
      'placeholder',
      'maxlength',
      'icon',
      'match',
      'loading',
      'variant'
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

  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Container role per ARIA Autocomplete
    this.setAttribute('role', 'group');

    // Input attributes per ARIA Autocomplete
    this._elements.input.setAttribute('role', 'combobox');
    this._elements.input.setAttribute('aria-autocomplete', 'list');
    this._elements.input.setAttribute('aria-haspopup', 'listbox');
    this._elements.input.setAttribute('aria-expanded', 'false');
    this._elements.input.setAttribute('aria-controls', this._elements.selectList.id);

    // Trigger button attributes per ARIA Autocomplete
    this._elements.trigger.setAttribute('aria-haspopup', 'listbox');
    this._elements.trigger.setAttribute('aria-expanded', 'false');
    this._elements.trigger.setAttribute('aria-controls', this._elements.selectList.id);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }

    // Create a fragment
    const frag = document.createDocumentFragment();

    // Render the template
    frag.appendChild(this._elements.field);
    frag.appendChild(this._elements.inputGroup);
    frag.appendChild(this._elements.tagList);
    frag.appendChild(this._elements.overlay);

    this._elements.overlay.target = this._elements.trigger;

    // Clean up
    while (this.firstChild) {
      const child = this.firstChild;
      // Only works if all root template elements have a handle attribute
      if (child.nodeType === Node.TEXT_NODE || child.hasAttribute && !child.hasAttribute('handle')) {
        // Add non-template elements to the content
        frag.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Append the fragment to the component
    this.appendChild(frag);

    // Set the state from the DOM when initialized
    this._setStateFromDOM();

    // save initial selection (used for reset)
    this._initialSelectedValues = this.values.slice(0);
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

  /**
   Triggered when the {@link Autocomplete} could accept external data to be loaded by the user.
   If <code>preventDefault()</code> is called, then a loading indicator will be shown.
   {@link Autocomplete#loading} should be set to false to indicate that the data has been successfully loaded.

   @typedef {CustomEvent} coral-autocomplete:showsuggestions

   @property {String} detail.value
   The user input.
   */

  /**
   Triggered when the {@link Autocomplete} hides the suggestions.
   This is typically used to cancel a load request because the suggestions will not be shown anymore.

   @typedef {CustomEvent} coral-autocomplete:hidesuggestions
   */
}

export default Autocomplete;
