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
import {SelectableCollection} from '../../../coral-collection';
import '../../../coral-component-button';
import {Tag} from '../../../coral-component-taglist';
import {SelectList} from '../../../coral-component-list';
import {Icon} from '../../../coral-component-icon';
import '../../../coral-component-popover';
import base from '../templates/base';
import {transform, validate, commons, i18n, Keys} from '../../../coral-utils';

/**
 Enumeration for {@link Select} variants.

 @typedef {Object} SelectVariantEnum

 @property {String} DEFAULT
 A default, gray Select.
 @property {String} QUIET
 A Select with no border or background.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet'
};

const CLASSNAME = '_coral-Dropdown';

// used in 'auto' mode to determine if the client is on mobile.
const IS_MOBILE_DEVICE = navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) !== null;

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

/**
 Calculates the difference between two given arrays. It returns the items that are in a that are not in b.

 @param {Array.<String>} a
 @param {Array.<String>} b

 @returns {Array.<String>}
 the difference between the arrays.
 */
const arrayDiff = function (a, b) {
  return a.filter((item) => !b.some((item2) => item === item2));
};

/**
 @class Coral.Select
 @classdesc A Select component is a form field that allows users to select from a list of options. If this component is
 shown on a mobile device, it will show a native select list, instead of the select list styled via Coral Spectrum.
 @htmltag coral-select
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Select extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {};
    base.call(this._elements, {commons, Icon, i18n});

    const events = {
      'global:click': '_onGlobalClick',
      'global:touchstart': '_onGlobalClick',

      'coral-collection:add coral-taglist': '_onInternalEvent',
      'coral-collection:remove coral-taglist': '_onInternalEvent',

      // item events
      'coral-select-item:_valuechanged coral-select-item': '_onItemValueChange',
      'coral-select-item:_contentchanged coral-select-item': '_onItemContentChange',
      'coral-select-item:_disabledchanged coral-select-item': '_onItemDisabledChange',
      'coral-select-item:_selectedchanged coral-select-item': '_onItemSelectedChange',

      'change coral-taglist': '_onTagListChange',
      'change select': '_onNativeSelectChange',
      'click select': '_onNativeSelectClick',
      'click > ._coral-Dropdown-trigger': '_onButtonClick',

      'key:space > ._coral-Dropdown-trigger': '_onSpaceKey',
      'key:enter > ._coral-Dropdown-trigger': '_onSpaceKey',
      'key:return > ._coral-Dropdown-trigger': '_onSpaceKey',
      'key:down > ._coral-Dropdown-trigger': '_onSpaceKey'
    };

    // Overlay
    const overlayId = this._elements.overlay.id;
    events[`global:capture:coral-collection:add #${overlayId} coral-selectlist`] = '_onSelectListItemAdd';
    events[`global:capture:coral-collection:remove #${overlayId} coral-selectlist`] = '_onInternalEvent';
    events[`global:capture:coral-selectlist:beforechange #${overlayId}`] = '_onSelectListBeforeChange';
    events[`global:capture:coral-selectlist:change #${overlayId}`] = '_onSelectListChange';
    events[`global:capture:coral-selectlist:scrollbottom #${overlayId}`] = '_onSelectListScrollBottom';
    events[`global:capture:coral-overlay:close #${overlayId}`] = '_onOverlayToggle';
    events[`global:capture:coral-overlay:open #${overlayId}`] = '_onOverlayToggle';
    events[`global:capture:coral-overlay:positioned #${overlayId}`] = '_onOverlayPositioned';
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_onBeforeOpen';
    events[`global:capture:coral-overlay:beforeclose #${overlayId}`] = '_onInternalEvent';
    // Keyboard interaction
    events[`global:keypress #${overlayId}`] = '_onOverlayKeyPress';
    // TODO for some reason this disables tabbing into the select
    // events[`global:key:tab #${overlayId} coral-selectlist-item`] = '_onTabKey';
    // events[`global:key:tab+shift #${overlayId} coral-selectlist-item`] = '_onTabKey';

    // Attach events
    this._delegateEvents(commons.extend(this._events, events));

    // Pre-define labellable element
    this._labellableElement = this._elements.button;

    // default value of inner flag to process events
    this._bulkSelectionChange = false;

    // we only have AUTO mode.
    this._useNativeInput = IS_MOBILE_DEVICE;

    this._elements.taglist.reset = () => {
      // since reseting a form will call the reset on every component, we need to kill the behavior of the taglist
      // otherwise the state will not be accurate
    };

    this._initialValues = [];

    // Init the collection mutation observer
    this.items._startHandlingItems();
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
    // we do lazy initialization of the collection
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-select-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved,
        onCollectionChange: this._onCollectionChange
      });
    }
    return this._items;
  }

  /**
   Indicates whether the select accepts multiple selected values.

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

    // taglist should not be in DOM if multiple === false
    if (!this._multiple) {
      this.removeChild(this._elements.taglist);
    } else {
      this.appendChild(this._elements.taglist);
    }

    // we need to remove and re-add the native select to loose the selection
    if (this._nativeInput) {
      this.removeChild(this._elements.nativeSelect);
    }
    this._elements.nativeSelect.multiple = this._multiple;
    this._elements.nativeSelect.selectedIndex = -1;

    if (this._nativeInput) {
      if (this._multiple) {
        // We might not be rendered yet
        if (this._elements.nativeSelect.parentNode) {
          this.insertBefore(this._elements.nativeSelect, this._elements.taglist);
        }
      } else {
        this.appendChild(this._elements.nativeSelect);
      }
    }

    this._elements.list.multiple = this._multiple;

    // sets the correct name for value submission
    this._setName(this.getAttribute('name') || '');

    // we need to make sure the selection is valid
    this._setStateFromDOM();

    // everytime multiple changes, the state of the selectlist and taglist need to be updated
    this.items.getAll().forEach((item) => {
      if (this._multiple && item.hasAttribute('selected')) {
        this._addTagToTagList(item);
      } else {
        // taglist is never used for multiple = false
        this._removeTagFromTagList(item);

        // when multiple = false and the item is selected, the value needs to be updated in the input
        if (item.hasAttribute('selected')) {
          this._elements.input.value = itemValueFromDOM(item);
        }
      }
    });
  }

  /**
   Contains a hint to the user of what can be selected in the component. If no placeholder is provided, the first
   option will be displayed in the component.

   @type {String}
   @default ""
   @htmlattribute placeholder
   @htmlattributereflected
   */
  // p = placeholder, m = multiple, se = selected
  // case 1:  p +  m +  se = p
  // case 2:  p +  m + !se = p
  // case 3: !p + !m +  se = se
  // case 4: !p + !m + !se = firstSelectable (native behavior)
  // case 5:  p + !m +  se = se
  // case 6:  p + !m + !se = p
  // case 7: !p +  m +  se = 'Select'
  // case 8: !p +  m + !se = 'Select'
  get placeholder() {
    return this._placeholder || '';
  }

  set placeholder(value) {
    this._placeholder = transform.string(value);
    this._reflectAttribute('placeholder', this._placeholder);

    // case 1:  p +  m +  se = p
    // case 2:  p +  m + !se = p
    // case 6:  p + !m + !se = p
    if (this._placeholder && (this.hasAttribute('multiple') || !this.selectedItem)) {
      this._elements.label.classList.add('is-placeholder');
      this._elements.label.textContent = this._placeholder;
    }
      // case 7: !p +  m +  se = 'Select'
    // case 8: !p +  m + !se = 'Select'
    else if (this.hasAttribute('multiple')) {
      this._elements.label.classList.add('is-placeholder');
      this._elements.label.textContent = i18n.get('Select');
    }
    // case 4: !p + !m + !se = firstSelectable (native behavior)
    else if (!this.selectedItem) {
      // we clean the value because there is no selected item
      this._elements.input.value = '';

      // gets the first candidate for selection
      const placeholderItem = this.items._getFirstSelectable();
      this._elements.label.classList.remove('is-placeholder');

      if (placeholderItem) {
        // selects using the attribute in case the item is not yet initialized
        placeholderItem.setAttribute('selected', '');
        this._elements.label.innerHTML = placeholderItem.innerHTML;
      } else {
        // label must be cleared when there is no placeholder and no item to select
        this._elements.label.textContent = '';
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
    return this.multiple ? this._elements.taglist.name : this._elements.input.name;
  }

  set name(value) {
    this._setName(value);
    this._reflectAttribute('name', this.name);
  }

  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    // we leverage the internal elements to know the value, this way we are always sure that the server submission
    // will be correct
    return this.multiple ? this._elements.taglist.value : this._elements.input.value;
  }

  set value(value) {
    // we rely on the the values property to handle this correctly
    this.values = [value];
  }

  /**
   The current selected values, as submitted during form submission. When {@link Coral.Select#multiple} is
   <code>false</code>, this will be an array of length 1.

   @type {Array.<String>}
   */
  get values() {
    if (this.multiple) {
      return this._elements.taglist.values;
    }

    // if there is a selection, we return whatever value it has assigned
    return this.selectedItem ? [this._elements.input.value] : [];
  }

  set values(values) {
    if (Array.isArray(values)) {
      // when multiple = false, we explicitely ignore the other values and just set the first one
      if (!this.multiple && values.length > 1) {
        values = [values[0]];
      }

      // gets all the items
      const items = this.items.getAll();

      let itemValue;
      // if multiple, we need to explicitely set the selection state of every item
      if (this.multiple) {
        items.forEach((item) => {
          // we use DOM API instead of properties in case the item is not yet initialized
          itemValue = itemValueFromDOM(item);
          // if the value is located inside the values array, then we set the item as selected
          item[values.indexOf(itemValue) !== -1 ? 'setAttribute' : 'removeAttribute']('selected', '');
        });
      }
        // if single selection, we find the first item that matches the value and deselect everything else. in case,
      // no item matches the value, we may need to find a selection candidate
      else {
        let targetItem;
        // since multiple = false, there is only 1 value value
        const value = values[0] || '';

        items.forEach((item) => {
          // small optimization to avoid calculating the value from every item
          if (!targetItem) {
            itemValue = itemValueFromDOM(item);

            if (itemValue === value) {
              // selecting the item will cause the taglist or input to be updated
              item.setAttribute('selected', '');
              // we store the first ocurrence, afterwards we deselect all items
              targetItem = item;

              // since we found our target item, we continue to avoid removing the selected attribute
              return;
            }
          }

          // every-non targetItem must be deselected
          item.removeAttribute('selected');
        });

        // if no targetItem was found, _setStateFromDOM will make sure that the state is valid
        if (!targetItem) {
          this._setStateFromDOM();
        }
      }
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

    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);

    this._elements.button.disabled = this._disabled;
    this._elements.input.disabled = this._disabled;
    this._elements.taglist.disabled = this._disabled;
  }

  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }

  set invalid(value) {
    super.invalid = value;

    this.classList.toggle('is-invalid', this.invalid);
    this._elements.button.classList.toggle('is-invalid', this.invalid);
    this._elements.invalidIcon.hidden = !this.invalid;
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
    this._elements.taglist.required = this._required;
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
    this._elements.taglist.readOnly = this._readOnly;
    this._elements.taglist.disabled = this._readOnly;
  }

  /**
   Inherited from {@link BaseFormField#labelled}.
   */
  get labelled() {
    return super.labelled;
  }

  set labelled(value) {
    super.labelled = value;

    if (this.labelled) {
      if (!this.labelledBy) {
        this._elements.button.setAttribute('aria-labelledby', `${this._elements.button.id} ${this._elements.label.id} ${this.invalid ? this._elements.invalidIcon.id : ''}`);
      }
      this._elements.nativeSelect.setAttribute('aria-label', value);
    } else {
      this._elements.button.removeAttribute('aria-label');
      this._elements.nativeSelect.removeAttribute('aria-label');
      if (!this.labelledBy) {
        this._elements.button.removeAttribute('aria-labelledby');
      }
    }

    this._elements.taglist.labelled = value;
  }

  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return this._labelledBy;
  }

  set labelledBy(value) {
    super.labelledBy = value;
    this._labelledBy = super.labelledBy;

    if (this._labelledBy) {
      this._elements.button.setAttribute('aria-labelledby', `${this._labelledBy} ${this._elements.label.id} ${this.invalid ? this._elements.invalidIcon.id : ''}`);
      this._elements.nativeSelect.setAttribute('aria-labelledby', this._labelledBy);
    } else {
      this._elements.nativeSelect.removeAttribute('aria-labelledby');

      // if the select is also labelled, make sure that aria-labelledby gets restored
      if (this.labelled) {
        this.labelled = this.labelled;
      }
    }

    this._elements.taglist.labelledBy = this._labelledBy;
  }

  /**
   Returns the first selected item in the Select. The value <code>null</code> is returned if no element is
   selected.

   @type {?HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.hasAttribute('multiple') ? this.items._getFirstSelected() : this.items._getLastSelected();
  }

  /**
   Returns an Array containing the set selected items.

   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    if (this.hasAttribute('multiple')) {
      return this.items._getAllSelected();
    }

    const item = this.selectedItem;
    return item ? [item] : [];
  }

  /**
   Indicates that the Select is currently loading remote data. This will set the wait indicator inside the list.

   @type {Boolean}
   @default false
   @htmlattribute loading
   */
  get loading() {
    return this._elements.list.loading;
  }

  set loading(value) {
    this._elements.list.loading = value;
  }

  /**
   The Select's variant. See {@link SelectVariantEnum}.

   @type {SelectVariantEnum}
   @default SelectVariantEnum.DEFAULT
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

    this._elements.button.classList.toggle('_coral-FieldButton--quiet', this._variant === variant.QUIET);
  }

  /** @ignore */
  _setName(value) {
    if (this.multiple) {
      this._elements.input.name = '';
      this._elements.taglist.setAttribute('name', value);
    } else {
      this._elements.taglist.setAttribute('name', '');
      this._elements.input.name = value;
    }
  }

  /**
   @param {Boolean} [checkAvailableSpace=false]
   If <code>true</code>, the event is triggered based on the available space.

   @private
   */
  _showOptions(checkAvailableSpace) {
    if (checkAvailableSpace) {
      // threshold in pixels
      const ITEM_SIZE_THRESHOLD = 30;

      let scrollHeight = this._elements.list.scrollHeight;
      const viewportHeight = this._elements.list.clientHeight;
      const scrollTop = this._elements.list.scrollTop;
      // we should not do this, but it increases performance since we do not need to find the item
      const loadIndicator = this._elements.list._elements.loadIndicator;

      // we remove the size of the load indicator
      if (loadIndicator && loadIndicator.parentNode) {
        const outerHeight = function (el) {
          let height = el.offsetHeight;
          const style = getComputedStyle(el);

          height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
          return height;
        };

        scrollHeight -= outerHeight(loadIndicator);
      }

      // if we are not close to the bottom scroll, we cancel triggering the event
      if (scrollTop + viewportHeight < scrollHeight - ITEM_SIZE_THRESHOLD) {
        return;
      }
    }

    // we do not show the list with native
    if (!this._useNativeInput) {
      if (!this._elements.overlay.open) {
        // Show the overlay
        this._elements.overlay.open = true;
      }

      // Force overlay repositioning (remote loading)
      requestAnimationFrame(() => {
        this._elements.overlay._onAnimate();
        this._elements.overlay.reposition();
      });
    }

    // Trigger an event
    // @todo: maybe we should only trigger this event when the button is toggled and we have space for more items
    const event = this.trigger('coral-select:showitems', {
      // amount of items in the select
      start: this.items.length
    });

    // while using native there is no need to show the loading
    if (!this._useNativeInput) {
      // if the default is prevented, we should the loading indicator
      this._elements.list.loading = event.defaultPrevented;
    }

    // communicate expanded state to assistive technology
    this._elements.button.setAttribute('aria-expanded', true);
  }

  /** @private */
  _hideOptions() {
    // Don't close the overlay if selection = multiple
    if (!this.multiple) {
      this._elements.overlay.open = false;

      this.trigger('coral-select:hideitems');
    }

    // communicate collapsed state to assistive technology
    this._elements.button.setAttribute('aria-expanded', false);
  }

  /** @ignore */
  _onGlobalClick(event) {
    if (!this._elements.overlay.open) {
      return;
    }

    const eventTargetWithinOverlayTarget = this._elements.button.contains(event.target);
    const eventTargetWithinItself = this._elements.overlay.contains(event.target);
    if (!eventTargetWithinOverlayTarget && !eventTargetWithinItself) {
      this._hideOptions();
    }
  }

  /** @private */
  _onSelectListItemAdd(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    // When items have been added, we are no longer loading
    this.loading = false;

    // Reset height
    this._elements.list.style.height = '';

    // Measure actual height
    const style = window.getComputedStyle(this._elements.list);
    const height = parseInt(style.height, 10);
    const maxHeight = parseInt(style.maxHeight, 10);

    if (height < maxHeight) {
      // Make it scrollable
      this._elements.list.style.height = `${height - 1}px`;
    }
  }

  _onBeforeOpen(event) {
    event.stopImmediatePropagation();

    // Prevent opening the overlay if select is readonly
    if (this.readOnly) {
      event.preventDefault();
    }

    // focus first selected or tabbable item when the list expands
    this._elements.list._resetTabTarget(true);
  }

  /** @private */
  _onInternalEvent(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();
  }

  /** @ignore */
  _onItemAdded(item) {
    const selectListItemParent = this._elements.list;

    const selectListItem = item._selectListItem || new SelectList.Item();

    // @todo: Make sure it is added at the right index.
    selectListItemParent.appendChild(selectListItem);

    selectListItem.set({
      value: item.value,
      content: {
        innerHTML: item.innerHTML
      },
      disabled: item.disabled,
      selected: item.selected,
      trackingElement: item.trackingElement
    }, true);

    const nativeOption = item._nativeOption || new Option();

    // @todo: make sure it is added at the right index.
    this._elements.nativeSelect.appendChild(nativeOption);

    // Need to store the initially selected values in the native select so that it can be reset
    if (this._initialValues.indexOf(item.value) !== -1) {
      nativeOption.setAttribute('selected', 'selected');
    }

    nativeOption.selected = item.selected;
    nativeOption.value = item.value;
    nativeOption.disabled = item.disabled;
    nativeOption.innerHTML = item.innerHTML;

    if (this.multiple) {
      // in case it was selected before it was added
      if (item.selected) {
        this._addTagToTagList(item);
      }
    }
    // Make sure the input value is set to the selected item
    else if (item.selected) {
      this._elements.input.value = item.value;
    }

    item._selectListItem = selectListItem;
    item._nativeOption = nativeOption;

    selectListItem._selectItem = item;
    nativeOption._selectItem = item;
  }

  /** @private */
  _onItemRemoved(item) {
    if (item._selectListItem) {
      item._selectListItem.remove();
      item._selectListItem._selectItem = undefined;
      item._selectListItem = undefined;
    }

    if (item._nativeOption) {
      this._elements.nativeSelect.removeChild(item._nativeOption);
      item._nativeOption._selectItem = undefined;
      item._nativeOption = undefined;
    }

    this._removeTagFromTagList(item, true);
  }

  /** @private */
  _onItemSelected(item) {
    // in case the component is not in the DOM or the internals have not been created we force it
    if (!item._selectListItem || !item._selectListItem.parentNode) {
      this._onItemAdded(item);
    }

    item._selectListItem.selected = true;
    item._nativeOption.selected = true;

    if (this.multiple) {
      this._addTagToTagList(item);
      // @todo: what happens when ALL items have been selected
      //  1. a message is disabled (i18n?)
      //  2. we don't try to open the selectlist (native behavior).
    } else {
      this._elements.input.value = item.value;
    }
  }

  /** @private */
  _onItemDeselected(item) {
    // in case the component is not in the DOM or the internals have not been created we force it
    if (!item._selectListItem || !item._selectListItem.parentNode) {
      this._onItemAdded(item);
    }

    item._selectListItem.selected = false;
    item._nativeOption.selected = false;

    if (this.multiple) {
      // we use the internal reference to remove the related tag from the taglist
      this._removeTagFromTagList(item);
    }
  }

  /**
   Detects when something is about to change inside the select.

   @private
   */
  _onSelectListBeforeChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    // We prevent the selection to change if we're in single selection and the clicked item is already selected
    if (!this.multiple && event.detail.item.selected) {
      event.preventDefault();
      this._elements.overlay.open = false;
    }
  }

  /**
   Detects when something inside the select list changes.

   @private
   */
  _onSelectListChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    // avoids triggering unnecessary changes in the selectist because selecting items programatically will trigger
    // a change event
    if (this._bulkSelectionChange) {
      return;
    }

    let oldSelection = event.detail.oldSelection || [];
    oldSelection = !Array.isArray(oldSelection) ? [oldSelection] : oldSelection;

    let selection = event.detail.selection || [];
    selection = !Array.isArray(selection) ? [selection] : selection;

    // if the arrays are the same, there is no point in calculating the selection changes
    if (event.detail.oldSelection !== event.detail.selection) {
      this._bulkSelectionChange = true;

      // we deselect first the ones that have to go
      const removedSelection = arrayDiff(oldSelection, selection);
      removedSelection.forEach((listItem) => {
        // selectlist will report on removed items
        if (listItem._selectItem) {
          listItem._selectItem.removeAttribute('selected');
        }
      });

      // we only sync the items that changed
      const newSelection = arrayDiff(selection, oldSelection);
      newSelection.forEach((listItem) => {
        if (listItem._selectItem) {
          listItem._selectItem.setAttribute('selected', '');
        }
      });

      this._bulkSelectionChange = false;

      // hides the list since something was selected. if the overlay was open, it means there was user interaction so
      // the necessary events need to be triggered
      if (this._elements.overlay.open) {
        // closes and triggers the hideitems event
        this._hideOptions();

        // if there is a change in the added or removed selection, we trigger a change event
        if (newSelection.length || removedSelection.length) {
          this.trigger('change');
        }
      }
    }
      // in case they are the same, we just need to trigger the hideitems event when appropiate, and that is when the
    // overlay was previously open
    else if (this._elements.overlay.open) {
      // closes and triggers the hideitems event
      this._hideOptions();
    }

    if (!this.multiple) {
      this._trackEvent('change', 'coral-select-item', event, this.selectedItem);
    }
  }

  /** @private */
  _onTagListChange(event) {
    // cancels the change event from the taglist
    event.stopImmediatePropagation();

    // avoids triggering unnecessary changes in the selectist because selecting items programatically will trigger
    // a change event
    if (this._bulkSelectionChange) {
      return;
    }

    this._bulkSelectionChange = true;

    const values = event.target.values;
    // we use the selected items, because they are the only possible items that may change
    let itemValue;
    this.items._getAllSelected().forEach((item) => {
      // we use DOM API instead of properties in case the item is not yet initialized
      itemValue = itemValueFromDOM(item);
      // if the item is inside the values array, then it has to be selected
      item[values.indexOf(itemValue) !== -1 ? 'setAttribute' : 'removeAttribute']('selected', '');
    });

    this._bulkSelectionChange = false;

    // if the taglist is empty, we should return the focus to the button
    if (!values.length) {
      this._elements.button.focus();
    }

    // reparents the change event with the select as the target
    this.trigger('change');
  }

  /** @private */
  _addTagToTagList(item) {
    // we prepare the tag
    item._tag = item._tag || new Tag();
    item._tag.set({
      value: item.value,
      label: {
        innerHTML: item.innerHTML
      }
    }, true);

    // we add the new tag at the end
    this._elements.taglist.items.add(item._tag);
  }

  /** @private */
  _removeTagFromTagList(item, destroy) {
    if (item._tag) {
      item._tag.remove();
      // we only remove the reference if destroy is passed, this allow us to recycle the tags when possible
      item._tag = destroy ? undefined : item._tag;
    }
  }

  /** @private */
  _onSelectListScrollBottom(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    if (this._elements.overlay.open) {
      // Checking if the overlay is open guards against debounced scroll events being handled after an overlay has
      // already been closed (e.g. clicking the last element in a selectlist always reopened the overlay emediately
      // after closing)

      // triggers the corresponding event
      // since we got the the event from select list we need to trigger the event
      this._showOptions();
    }
  }

  /** @private */
  _onButtonClick(event) {
    event.preventDefault();

    if (this.disabled || this.readOnly) {
      return;
    }

    // if native is required, we do not need to do anything
    if (!this._useNativeInput) {
      // @todo: this was removed cause otherwise the coral-select:showitems event is never triggered.
      // if this is a multiselect and all items are selected, there should be nothing in the list to focus so do
      // nothing.
      // if (this.multiple && this.selectedItems.length === this.items.length) {
      //   return;
      // }

      // Toggle openness
      if (this._elements.overlay.classList.contains('is-open')) {
        this._hideOptions();
      } else {
        // event should be triggered based on the contents
        this._showOptions(true);
      }
    }
  }

  /** @private */
  _onNativeSelectClick() {
    this._showOptions(false);
  }

  _onOverlayKeyPress(event) {
    // Focus on item which text starts with pressed keys
    this._elements.list._onKeyPress(event);
  }

  /** @private */
  _onSpaceKey(event) {
    if (this.disabled || this.readOnly) {
      return;
    }

    event.preventDefault();

    if (this._useNativeInput) {
      // we try to open the native select
      this._elements.nativeSelect.dispatchEvent(new MouseEvent('mousedown'));
    } else if (!this._elements.overlay.open || event.keyCode === Keys.keyToCode('space')) {
      this._elements.button.click();
    }
  }

  /**
   Prevents tab key default handling on selectList Items.

   @private
   */
  // _onTabKey(event) {
  // event.preventDefault();
  // }

  /** @private */
  _onOverlayToggle(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    // Trigger private event instead
    const type = event.type.split(':').pop();
    this.trigger(`coral-select:_overlay${type}`);

    this._elements.button.classList.toggle('is-selected', event.target.open);

    // communicate expanded state to assistive technology
    this._elements.button.setAttribute('aria-expanded', event.target.open);

    if (!event.target.open) {
      this.classList.remove('is-openAbove', 'is-openBelow');
    }
  }

  /** @private */
  _onOverlayPositioned(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    if (this._elements.overlay.open) {
      this._elements.overlay.style.width = `${this.offsetWidth}px`;
    }
  }

  // @todo: while the select is multiple, if everything is deselected no change event will be triggered.
  _onNativeSelectChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    // avoids triggering unnecessary changes in the selectist because selecting items programatically will trigger
    // a change event
    if (this._bulkSelectionChange) {
      return;
    }

    this._bulkSelectionChange = true;
    // extracts the native options for the selected items. We use the selected options, instead of the complete
    // options to make the diff since it will normally be a smaller set
    const oldSelectedOptions = this.selectedItems.map((element) => element._nativeOption);

    // we convert the HTMLCollection to an array
    const selectedOptions = Array.prototype.slice.call(event.target.querySelectorAll(':checked'));

    const diff = arrayDiff(oldSelectedOptions, selectedOptions);
    diff.forEach((item) => {
      item._selectItem.selected = false;
    });

    // we only sync the items that changed
    const newSelection = arrayDiff(selectedOptions, oldSelectedOptions);
    newSelection.forEach((item) => {
      item._selectItem.selected = true;
    });

    this._bulkSelectionChange = false;

    // since multiple keeps the select open, we cannot return the focus to the button otherwise the user cannot
    // continue selecting values
    if (!this.multiple) {
      // returns the focus to the button, otherwise the select will keep it
      this._elements.button.focus();
      // since selecting an item closes the native select, we need to trigger an event
      this.trigger('coral-select:hideitems');
    }

    // if the native change event was triggered, then it means there is some new value
    this.trigger('change');
  }

  /**
   This handles content change of coral-select-item and updates its associatives.

   @private
   */
  _onItemContentChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    const item = event.target;
    if (item._selectListItem) {
      const content = new SelectList.Item.Content();
      content.innerHTML = item.innerHTML;
      item._selectListItem.content = content;
    }

    if (item._nativeOption) {
      item._nativeOption.innerHTML = item.innerHTML;
    }

    if (item._tag && item._tag.label) {
      item._tag.label.innerHTML = item.innerHTML;
    }

    // since the content changed, we need to sync the placeholder in case it was the selected item
    this._syncSelectedItemPlaceholder();
  }

  /** @private */
  _syncSelectedItemPlaceholder() {
    this.placeholder = this.getAttribute('placeholder');

    // case 3: !p + !m +  se = se
    // case 5:  p + !m +  se = se
    if (this.selectedItem && !this.multiple) {
      this._elements.label.classList.remove('is-placeholder');
      this._elements.label.innerHTML = this.selectedItem.innerHTML;
    }
  }

  /**
   This handles value change of coral-select-item and updates its associatives.

   @private
   */
  _onItemValueChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    const item = event.target;
    if (item._selectListItem) {
      item._selectListItem.value = item.value;
    }

    if (item._nativeOption) {
      item._nativeOption.value = item.value;
    }

    if (item._tag) {
      item._tag.value = item.value;
    }
  }

  /**
   This handles disabled change of coral-select-item and updates its associatives.

   @private
   */
  _onItemDisabledChange(event) {
    // stops propagation cause the event is internal to the component
    event.stopImmediatePropagation();

    const item = event.target;
    if (item._selectListItem) {
      item._selectListItem.disabled = item.disabled;
    }

    if (item._nativeOption) {
      item._nativeOption.disabled = item.disabled;
    }
  }

  /**
   In case an item from the initial selection is removed, we need to remove it from the initial values.

   @private
   */
  _validateInitialState(nodes) {
    let item;
    let index;

    // we iterate over all the nodes, checking if they matched the initial value
    for (let i = 0, nodeCount = nodes.length ; i < nodeCount ; i++) {
      // since we are not sure if the item has been upgraded, we try first the attribute, otherwise we extract the
      // value from the textContent
      item = nodes[i];

      index = this._initialValues.indexOf(item.value);

      if (index !== -1) {
        this._initialValues.splice(index, 1);
      }
    }
  }

  /** @private */
  // eslint-disable-next-line no-unused-vars
  _onCollectionChange(addedNodes, removedNodes) {
    // we make sure that items that were part of the initial selection are removed from the internal representation
    this._validateInitialState(removedNodes);
    // makes sure that the selection state matches the multiple variable
    this._setStateFromDOM();
  }

  /**
   Updates the label to reflect the current state. The label needs to be updated when the placeholder changes and
   when the selection changes.

   @private
   */
  _updateLabel() {
    this._syncSelectedItemPlaceholder();
  }

  /**
   Handles the selection state.

   @ignore
   */
  _setStateFromDOM() {
    // if it is not multiple, we need to be sure only one item is selected
    if (!this.hasAttribute('multiple')) {
      // makes sure that only one is selected
      this.items._deselectAllExceptLast();

      // we execute _getFirstSelected instead of _getSelected because it is faster
      const selectedItem = this.items._getFirstSelected();

      // case 1. there is a selected item, so no further change is required
      // case 2. no selected item and no placeholder. an item will be automatically selected
      // case 3. no selected item and a placehoder. we just make sure the value is really empty
      if (!selectedItem) {
        // we clean the value because there is no selected item
        this._elements.input.value = '';

        // when there is no placeholder, we need to force a selection to behave like the native select
        if (transform.string(this.getAttribute('placeholder')) === '') {
          // gets the first candidate for selection
          const selectable = this.items._getFirstSelectable();

          if (selectable) {
            // selects using the attribute in case the item is not yet initialized
            selectable.setAttribute('selected', '');
            // we set the value explicitely, so we do not need to wait for the MO
            this._elements.input.value = itemValueFromDOM(selectable);
          }
        }
      } else {
        // we set the value explicitely, so we do not need to wait for the MO
        this._elements.input.value = itemValueFromDOM(selectedItem);
      }
    }

    // handles the initial item in the select
    this._updateLabel();
  }

  /**
   Handles selecting multiple items. Selection could result a single or multiple selected items.

   @private
   */
  _onItemSelectedChange(event) {
    // we stop propagation since it is a private event
    event.stopImmediatePropagation();

    // the item that was selected
    const item = event.target;

    // setting this to true will ignore any changes from the selectlist al
    this._bulkSelectionChange = true;

    // when the item is selected, we need to enforce the selection mode
    if (item.selected) {
      this._onItemSelected(item);

      if (this.multiple) {
        this._trackEvent('select', 'coral-select-item', event, item);
      }

      // enforces the selection mode
      if (!this.hasAttribute('multiple')) {
        this.items._deselectAllExcept(item);
      }
    } else {
      this._onItemDeselected(item);

      if (this.multiple) {
        this._trackEvent('deselect', 'coral-select-item', event, item);
      }
    }

    this._bulkSelectionChange = false;

    // since there is a change in selection, we need to update the placeholder
    this._updateLabel();
  }

  /**
   Inherited from {@link BaseFormField#clear}.
   */
  clear() {
    this.value = '';
  }

  /**
   Focuses the component.

   @ignore
   */
  focus() {
    if (!this.contains(document.activeElement)) {
      this._elements.button.focus();
    }
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // reset the values to the initial values
    this.values = this._initialValues;
  }

  /**
   Returns {@link Select} variants.

   @return {SelectVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['variant', 'multiple', 'placeholder', 'loading']);
  }

  /** @ignore */
  connectedCallback() {
    if (this._skipConnectedCallback()) {
      return;
    }
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

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }

    this.classList.toggle(`${CLASSNAME}--native`, this._useNativeInput);

    if (!this._useNativeInput && this.contains(this._elements.nativeSelect)) {
      this.removeChild(this._elements.nativeSelect);
    }

    // handles the initial selection
    this._setStateFromDOM();

    // we need to keep a state of the initial items to be able to reset the component. values is not reliable during
    // initialization since items are not yet initialized
    this.selectedItems.forEach((item) => {
      // we use DOM API instead of properties in case the item is not yet initialized
      this._initialValues.push(itemValueFromDOM(item));
    });

    // Cleanup template elements (supporting cloneNode)
    const templateElements = this.querySelectorAll('[handle]');
    for (let i = 0 ; i < templateElements.length ; ++i) {
      const currentElement = templateElements[i];
      if (currentElement.parentNode === this) {
        this.removeChild(currentElement);
      }
    }

    // Render the main template
    const frag = document.createDocumentFragment();

    frag.appendChild(this._elements.button);
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.nativeSelect);
    frag.appendChild(this._elements.taglist);
    frag.appendChild(this._elements.overlay);

    // Assign the button as the target for the overlay
    this._elements.overlay.target = this._elements.button;
    // handles the focus allocation every time the overlay closes
    this._elements.overlay.returnFocusTo(this._elements.button);

    this.appendChild(frag);
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._skipDisconnectedCallback()) {
      return;
    }
    super.disconnectedCallback();

    const overlay = this._elements.overlay;
    // In case it was moved out don't forget to remove it
    if (!this.contains(overlay)) {
      overlay._parent = overlay._repositioned ? document.body : this;
      overlay.remove();
    }
  }

  /**
   Triggered when the {@link Select} could accept external data to be loaded by the user. If <code>preventDefault()</code> is
   called, then a loading indicator will be shown. {@link Select#loading} should be set to false to indicate
   that the data has been successfully loaded.

   @typedef {CustomEvent} coral-select:showitems

   @property {Number} detail.start
   The count of existing items, which is the index where new items should start.
   */

  /**
   Triggered when the {@link Select} hides the UI used to select items. This is typically used to cancel a load request
   because the items will not be shown anymore.

   @typedef {CustomEvent} coral-select:hideitems
   */
}

export default Select;
