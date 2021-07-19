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
import '../../../coral-component-popover';
import '../../../coral-component-button';
import CycleButtonItem from './CycleButtonItem';
import {Icon} from '../../../coral-component-icon';
import {ButtonList, SelectList} from '../../../coral-component-list';
import {SelectableCollection} from '../../../coral-collection';
import base from '../templates/base';
import {transform, validate, commons} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

/**
 Enumeration for {@link CycleButton} display options.

 @typedef {Object} CycleButtonDisplayModeEnum

 @property {String} ICON
 Icon display mode.
 @property {String} TEXT
 Text display mode.
 @property {String} ICON_TEXT
 Icon and text display mode.
 */
const displayMode = {
  ICON: 'icon',
  TEXT: 'text',
  ICON_TEXT: 'icontext'
};

/**
 Regex used to remove whitespace from selectedItem label for use as an aria-label for accessibility.

 @ignore
 */
const WHITESPACE_REGEX = /[\t\n\r ]+/g;

/** @ignore */
const ACTION_TAG_NAME = 'coral-cyclebutton-action';

const CLASSNAME = '_coral-CycleSelect';

/**
 @class Coral.CycleButton
 @classdesc A CycleButton component is a simple multi-state toggle button that toggles between the possible items below
 a certain threshold, and shows them in a popover selector when above.
 @htmltag coral-cyclebutton
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const CycleButton = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._id = this.id || commons.getUID();

    // Templates
    this._elements = {};
    base.call(this._elements, {Icon, commons, id: this._id});

    const events = {
      'click button[is="coral-button"]': '_onMouseDown',
      'click ._coral-CycleSelect-button': '_onItemClick',
      'click coral-cyclebutton-item': '_onItemClick',
      'key:down ._coral-CycleSelect-button[aria-expanded=false]': '_onItemClick',

      // private
      'coral-cyclebutton-item:_selectedchanged': '_onItemSelectedChanged',
      'coral-cyclebutton-item:_validateselection': '_onValidateSelection',
      'coral-cyclebutton-item:_iconchanged coral-cyclebutton-item[selected]': '_onSelectedItemPropertyChange',
      'coral-cyclebutton-item:_displaymodechanged coral-cyclebutton-item[selected]': '_onSelectedItemPropertyChange',

      'key:pageup coral-selectlist-item, [coral-list-item]': '_onFocusPreviousItem',
      'key:left coral-selectlist-item, [coral-list-item]': '_onFocusPreviousItem',
      'key:up coral-selectlist-item, [coral-list-item]': '_onFocusPreviousItem',
      'key:pagedown coral-selectlist-item, [coral-list-item]': '_onFocusNextItem',
      'key:right coral-selectlist-item, [coral-list-item]': '_onFocusNextItem',
      'key:down coral-selectlist-item, [coral-list-item]': '_onFocusNextItem',
      'key:home coral-selectlist-item, [coral-list-item]': '_onFocusFirstItem',
      'key:end coral-selectlist-item, [coral-list-item]': '_onFocusLastItem',

      'capture:focus coral-selectlist-item, [coral-list-item]': '_onItemFocus',
      'capture:blur coral-selectlist-item, [coral-list-item]': '_onItemBlur',

      'coral-overlay:open': '_onOverlayOpen',
      'coral-overlay:close': '_onOverlayClose'
    };

    const overlay = this._elements.overlay;
    const overlayId = overlay.id;

    // Overlay
    events[`global:capture:click #${overlayId} button[is="coral-buttonlist-item"]`] = '_onActionClick';
    events[`global:capture:coral-selectlist:beforechange #${overlayId}`] = '_onSelectListBeforeChange';
    events[`global:capture:coral-selectlist:change #${overlayId}`] = '_onSelectListChange';
    // Keyboard interaction
    events[`global:keypress #${overlayId}`] = '_onOverlayKeyPress';

    // Attach events
    this._delegateEvents(events);

    // Used for eventing
    this._oldSelection = null;

    // Init the collection mutation observer
    this.items._startHandlingItems(true);
    this.actions._startHandlingItems(true);
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
        itemTagName: 'coral-cyclebutton-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
    return this._items;
  }

  /**
   The selected item in the CycleButton.

   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }

  /**
   General icon of the CycleButton. The icon will be displayed no matter the selection. If the selected item has
   its own icon, it will be overwritten.

   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }

  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);

    const selectedItem = this.selectedItem;
    if (selectedItem) {
      this._renderSelectedItem(selectedItem);
    }
  }

  /**
   Number of items that can be directly cycled through before collapsing. If <code>0</code> is used, the items
   will never be collapsed.

   @type {Number}
   @default 3
   @htmlattribute threshold
   @htmlattributereflected
   */
  get threshold() {
    return typeof this._threshold === 'number' ? this._threshold : 3;
  }

  set threshold(value) {
    value = transform.number(value);
    if (value > -1) {
      this._threshold = value;
      this._checkExtended();
    }
  }

  /**
   The Collection Interface that allows interaction with the {@link CycleButtonAction} elements.

   @type {SelectableCollection}
   @readonly
   */
  get actions() {
    if (!this._actions) {
      this._actions = new SelectableCollection({
        host: this,
        itemTagName: ACTION_TAG_NAME,
        itemSelector: ACTION_TAG_NAME,
        onCollectionChange: this._checkExtended
      });
    }
    return this._actions;
  }

  /**
   The CycleButton's displayMode. This defines how the selected item is displayed. If the selected item does not
   have the necessary icon or text information then fallback to show whichever is available. The appearance of
   collapsed items in the popover are not affected by this property. The displayMode property can be set on an
   item to override the component level value when that item is selected.
   See {@link CycleButtonDisplayModeEnum}.

   @type {String}
   @default CycleButtonDisplayModeEnum.ICON
   @htmlattribute displaymode
   @htmlattributereflected
   */
  get displayMode() {
    return this._displayMode || displayMode.ICON;
  }

  set displayMode(value) {
    value = transform.string(value).toLowerCase();
    this._displayMode = validate.enumeration(displayMode)(value) && value || displayMode.ICON;
    this._reflectAttribute('displaymode', this._displayMode);

    const selectedItem = this.selectedItem;
    if (selectedItem) {
      this._renderSelectedItem(selectedItem);
    }
  }

  /** @private */
  _hasMenuItemRadioGroup() {
    return this.items.getAll().length > 0 && this.actions.getAll().length > 0;
  }

  /** @private */
  _onItemAdded(item) {
    if (!this.selectedItem) {
      item.setAttribute('selected', '');
    }
    else {
      this._validateSelection(item);
    }

    this._checkExtended();
  }

  /** @private */
  _onItemRemoved() {
    if (!this.selectedItem) {
      this._selectFirstItem();
    }

    this._checkExtended();
  }

  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();

    this._validateSelection(event.target);
  }

  /** @private */
  _onValidateSelection(event) {
    event.stopImmediatePropagation();

    this._validateSelection();
  }

  /** @private */
  _selectFirstItem() {
    const item = this.items._getFirstSelectable();
    if (item) {
      item.setAttribute('selected', '');
    }
  }

  /** @private */
  _validateSelection(item) {
    const selectedItems = this.items._getAllSelected();

    if (item) {
      // Deselected item
      if (!item.hasAttribute('selected') && !selectedItems.length) {
        const siblingItem = this.items._getNextSelectable(item);
        // Next selectable item is forced to be selected if selection is cleared
        if (item !== siblingItem) {
          siblingItem.setAttribute('selected', '');
        }
      }
      // Selected item
      else if (item.hasAttribute('selected') && selectedItems.length > 1) {
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
    }
    else if (selectedItems.length > 1) {
      // If multiple items are selected, the last one wins
      item = selectedItems[selectedItems.length - 1];

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
    // First selectable item is forced to be selected if no selection at all
    else if (!selectedItems.length) {
      this._selectFirstItem();
    }

    this._renderSelectedItem(this.selectedItem);

    this._triggerChangeEvent();
  }

  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;

    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-cyclebutton:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });

      this._oldSelection = selectedItem;
    }
  }

  _onMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();
    this._trackEvent('click', 'coral-cyclebutton', event);
  }

  /** @private */
  _onItemClick(event) {
    event.preventDefault();

    const items = this.items.getAll();
    const itemCount = items.length;

    // When we have more than a specified number of items, use the overlay selection. If threshold is 0, then we never
    // show the popover. If there are actions, we always show the popover.
    if (this._isExtended()) {
      // we toggle the overlay if it was already open
      this[this._elements.overlay.classList.contains('is-open') ? '_hideOverlay' : '_showOverlay']();
    }
    // Unless this is the only item we have, select the next item in line:
    else if (itemCount > 1) {
      const neighbor = this.selectedItem.nextElementSibling;
      const nextItem = neighbor.nodeName === 'CORAL-CYCLEBUTTON-ITEM' ? neighbor : items[0];

      this._selectCycleItem(nextItem);
      this._focusItem(this._elements.button);
    }
  }

  /**
   Render the provided item as selected according to resolved icon and displayMode properties.

   @private
   */
  _renderSelectedItem(item) {
    if (!item || !item.content) {
      return;
    }

    // resolve effective values by checking for item and component level properties
    let effectiveDisplayMode = this.displayMode;
    const effectiveIcon = item.icon || this.icon || '';

    if (item.displayMode !== CycleButtonItem.displayMode.INHERIT) {
      effectiveDisplayMode = item.displayMode;
    }
    if (!item.content.textContent.trim() || !effectiveIcon.trim()) {
      // if icon or text missing then we fallback to showing whichever is available
      effectiveDisplayMode = displayMode.ICON_TEXT;
    }

    // manipulate button sub-component depending on display mode
    if (effectiveDisplayMode === displayMode.ICON) {
      this._elements.button.icon = effectiveIcon;
      this._elements.button.label.innerHTML = '';

      // @a11y
      const ariaLabel = item.content.textContent.replace(WHITESPACE_REGEX, ' ');
      this._elements.button.setAttribute('aria-label', ariaLabel);
      this._elements.button.setAttribute('title', ariaLabel);
      if (ariaLabel && effectiveIcon !== '' && this._elements.button._elements.icon) {
        this._elements.button._elements.icon.setAttribute('aria-hidden', true);
      }
    }
    else {
      // handle display modes that include text
      if (effectiveDisplayMode === displayMode.TEXT) {
        this._elements.button.icon = '';
      }
      if (effectiveDisplayMode === displayMode.ICON_TEXT) {
        this._elements.button.icon = effectiveIcon;
        if (effectiveIcon !== '' && this._elements.button._elements.icon) {
          this._elements.button._elements.icon.setAttribute('aria-hidden', true);
        }
      }
      this._elements.button.label.innerHTML = item.content.innerHTML;

      // @a11y we do not require aria attributes since we already show text
      this._elements.button.removeAttribute('aria-label');
      this._elements.button.removeAttribute('title');
    }
  }

  /**
   Update currently selected item if it's <code>icon</code> or <code>displayMode</code> properties have changed.

   @private
   */
  _onSelectedItemPropertyChange(event) {
    // stops propagation because the event is internal to the component
    event.stopImmediatePropagation();
    this._renderSelectedItem(event.target);
  }

  /** @private */
  _onSelectListBeforeChange(event) {
    if (event.detail.item.selected) {
      event.preventDefault();
      if (!this._isPopulatingLists) {
        // Hide the overlay, cleanup will be done before overlay.show()
        this._hideOverlay();
      }
    }
  }

  /** @private */
  _onSelectListChange(event) {
    event.stopImmediatePropagation();
    event.preventDefault();

    let origNode;
    const selectListItem = event.detail.selection;
    if (selectListItem) {
      origNode = selectListItem._originalItem;

      this._selectCycleItem(origNode);

      if (!this._isPopulatingLists) {
        // Hide the overlay, cleanup will be done before overlay.show()
        this._hideOverlay();
      }
    }

    this._trackEvent('selected', 'coral-cyclebutton-item', event, origNode);
  }

  _onOverlayKeyPress(event) {
    // Focus on item which text starts with pressed keys
    this._elements.selectList._onKeyPress(event);
  }

  /** @private */
  _onActionClick(event) {
    event.stopPropagation();

    const item = event.matchedTarget;
    const proxyEvent = item._originalItem.trigger('click');

    if (!proxyEvent.defaultPrevented) {
      this._hideOverlay();
    }

    this._trackEvent('selected', 'coral-cyclebutton-action', event, item);
  }

  /** @private */
  _isExtended() {
    const hasActions = this.actions.getAll().length > 0;
    return this.threshold > 0 && this.items.getAll().length >= this.threshold || hasActions;
  }

  /** @private */
  _checkExtended() {
    const isExtended = this._isExtended();
    this.classList.toggle(`${CLASSNAME}--extended`, isExtended);

    // @a11y
    if (isExtended) {
      this._elements.button.setAttribute('aria-controls', this._elements.overlay.id);
      this._elements.button.setAttribute('aria-haspopup', true);
      this._elements.button.setAttribute('aria-expanded', false);

      // Assign the button as the target for the overlay
      this._elements.overlay.target = this._elements.button;
      this._elements.overlay.hidden = false;

      // Regions within the overlay should have role=presentation
      this._elements.overlay.content.setAttribute('role', 'presentation');
    }
    else {
      this._elements.button.removeAttribute('aria-controls');
      this._elements.button.removeAttribute('aria-haspopup');
      this._elements.button.removeAttribute('aria-expanded');

      // Remove target and hide overlay
      this._elements.overlay.target = null;
      this._elements.overlay.hidden = true;
    }
  }

  /** @ignore */
  _focusItem(item) {
    if (item) {
      item.focus();
    }
  }

  /** @private */
  _onFocusPreviousItem(event) {
    event.preventDefault();
    const items = this._getSelectableItems();
    if (items.length > 1) {
      const el = event.matchedTarget;
      const index = items.indexOf(el);
      if (index > 0) {
        this._focusItem(items[index - 1]);
      }
      else if (document.activeElement !== el) {
        // make sure ButtonList doesn't wrap focus
        this._focusItem(el);
      }
    }
  }

  /** @private */
  _onFocusNextItem(event) {
    event.preventDefault();
    const items = this._getSelectableItems();
    if (items.length > 1) {
      const el = event.matchedTarget;
      const index = items.indexOf(el);
      if (index < items.length - 1) {
        this._focusItem(items[index + 1]);
      }
      else if (document.activeElement !== el) {
        // make sure ButtonList doesn't wrap focus
        this._focusItem(el);
      }
    }
  }

  /** @private */
  _onFocusFirstItem(event) {
    event.preventDefault();
    this._focusItem(this._getSelectableItems()[0]);
  }

  /** @private */
  _onFocusLastItem(event) {
    event.preventDefault();
    const items = this._getSelectableItems();
    this._focusItem(items[items.length - 1]);
  }

  /** @private */
  _getSelectableItems() {
    const items = this.items.getAll();
    const actions = this.actions.getAll();
    return items
      .concat(actions)
      .map(item => item._selectListItem || item._buttonListItem)
      .filter(item => {
        !item.hasAttribute('hidden') &&
        !item.hasAttribute('disabled') &&
        item.offsetParent !== null &&
        (item.offsetWidth > 0 || item.offsetHeight > 0);
      });
  }

  /** @private */
  _onItemFocus(event) {
    this._elements.selectList.classList.toggle('is-focused', true);
    event.matchedTarget.classList.toggle('focus-ring', true);
  }

  /** @private */
  _onItemBlur(event) {
    this._elements.selectList.classList.toggle('is-focused', false);
    event.matchedTarget.classList.toggle('focus-ring', false);
  }

  _onOverlayClose() {
    // @a11y
    this._elements.button.setAttribute('aria-expanded', false);
  }

  _onOverlayOpen() {
    // @a11y
    this._elements.button.setAttribute('aria-expanded', true);
  }

  /** @ignore */
  _hideOverlay() {
    this._elements.overlay.hide();
  }

  /** @ignore */
  _getSelectListItem(item) {
    const selectListItem = new SelectList.Item();

    // Needs to be reflected on the generated Item.
    selectListItem.trackingElement = item.trackingElement;

    // We do first the content, so that the icon is not destroyed
    const selectListItemContent = new SelectList.Item.Content();
    selectListItemContent.innerHTML = item.content.innerHTML;
    selectListItem.content = selectListItemContent;

    // Specify the icon
    if (item.icon) {
      selectListItem.icon = item.icon;
    }

    selectListItem.disabled = item.disabled;
    selectListItem.selected = item.selected;
    selectListItem.setAttribute('role', item.getAttribute('role'));
    selectListItem.setAttribute('aria-checked', item.selected);

    selectListItem._originalItem = item;
    item._selectListItem = selectListItem;

    return selectListItem;
  }

  /** @ignore */
  _getActionListItem(action) {
    const actionListItem = new ButtonList.Item();

    actionListItem.icon = action.icon;
    actionListItem.disabled = action.disabled;
    actionListItem.setAttribute('role', action.getAttribute('role'));
    actionListItem.tabIndex = action.tabIndex;

    // Needs to be reflected on the generated Action.
    actionListItem.trackingElement = action.trackingElement;
    actionListItem.content.innerHTML = action.content.innerHTML;

    actionListItem._originalItem = action;
    action._buttonListItem = actionListItem;

    return actionListItem;
  }

  /** @ignore */
  _populateLists() {
    const selectList = this._elements.selectList;
    const actionList = this._elements.actionList;
    const items = this.items.getAll();
    const actions = this.actions.getAll();
    const itemCount = items.length;
    const actionCount = actions.length;
    let selectListItem;
    let actionListItem;

    this._isPopulatingLists = true;

    // we empty the existing items before populating the lists again
    selectList.items.clear();
    actionList.items.clear();

    // adds the items to the selectList
    for (let i = 0 ; i < itemCount ; i++) {
      const item = items[i];
      selectListItem = this._getSelectListItem(item);

      selectListItem.icon = item.icon;
      selectListItem.setAttribute('aria-checked', item.selected);
      selectListItem._elements.icon.setAttribute('aria-hidden', true);

      selectListItem.set({
        disabled: item.disabled,
        selected: item.selected
      }, true);

      selectList.items.add(selectListItem);
    }

    // adds any additional actions to the actions buttonList
    if (actionCount > 0) {
      for (let j = 0 ; j < actionCount ; j++) {
        const action = actions[j];

        actionListItem = this._getActionListItem(action);
        actionListItem.disabled = action.disabled;
        actionListItem.icon = action.icon;
        actionListItem._elements.icon.setAttribute('aria-hidden', true);

        actionList.items.add(actionListItem);
      }

      this._elements.actionList.removeAttribute('hidden');

      if (itemCount > 0) {
        this._elements.separator.removeAttribute('hidden');
      }
    }
    else {
      this._elements.actionList.setAttribute('hidden', '');
      this._elements.separator.setAttribute('hidden', '');
    }

    commons.nextFrame(() => {
      this._isPopulatingLists = false;
    });
  }

  /** @private */
  _selectCycleItem(item) {
    item.setAttribute('selected', '');
  }

  /** @ignore */
  _showOverlay() {
    this._populateLists();

    this._elements.overlay.show();
  }

  /**
   Returns {@link CycleButton} display options.

   @return {CycleButtonDisplayModeEnum}
   */
  static get displayMode() {
    return displayMode;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      displaymode: 'displayMode'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['icon', 'threshold', 'displaymode', 'aria-label', 'aria-labelledby']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    // The accessibility name for the button element
    if (name === 'aria-label') {
      const hasMenuItemRadioGroup = this._hasMenuItemRadioGroup();

      // aria-labelledby takes precedence over aria-label
      if (this.getAttribute('aria-labelledby')) {
        // Button should be labeled by the container and the button, with the selected value, itself
        this._elements.button.setAttribute('aria-labelledby', `${this.id} ${this._elements.button.id}`);

        // Overlay should be labeled by the container with aria-label
        this._elements.overlay.setAttribute('aria-labelledby', this.id);

        // With both items and actions, the items should be grouped and the group should be labeled
        // SelectList menuitemradio group should be labeled by the container with aria-label,
        // Otherwise the selectList should not be labeled independantly from the menu
        this._elements.selectList[hasMenuItemRadioGroup ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this.id);
      }
      else {
        //  With no aria-label, clean up aria-labelledby on _elements
        this._elements.button.removeAttribute('aria-labelledby');
        this._elements.overlay.setAttribute('aria-labelledby', this._elements.button.id);

        // With both items and actions, the items should be grouped and the group should be labeled
        // SelectList menuitemradio group should be labeled by the button, with the selected value, itself,
        // Otherwise the selectList should not be labeled independantly from the menu
        this._elements.selectList[hasMenuItemRadioGroup ? 'setAttribute' : 'removeAttribute']('aria-labelledby', this._elements.button.id);
      }
    }
    // The id reference for an HTML element that labels the button element accessibility name for the button element
    else if (name === 'aria-labelledby') {
      if (value || !this.getAttribute('aria-label')) {
        this._elements.button.setAttribute('aria-labelledby', `${value} ${this._elements.button.id}`);
        this._elements.overlay.setAttribute('aria-labelledby', value || this._elements.button.id);
        this._elements.selectList[this._hasMenuItemRadioGroup() ? 'setAttribute' : 'removeAttribute']('aria-labelledby', value || this._elements.button.id);
      }
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
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

    if (!this.id) {
      this.id = this._id;
    }

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (typeof this._threshold === 'undefined') {
      this.threshold = 3;
    }
    if (!this._displayMode) {
      this.displayMode = displayMode.ICON;
    }

    // checks the component's extended mode
    this._checkExtended();

    ['button', 'overlay'].forEach((handleName) => {
      const handle = this.querySelector(`[handle="${handleName}"]`);
      if (handle) {
        handle.remove();
      }
    });

    const frag = document.createDocumentFragment();

    // Render the base layout
    frag.appendChild(this._elements.button);
    frag.appendChild(this._elements.overlay);

    // Inserting the template before the items
    this.appendChild(frag);

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
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

  /**
   Triggered when the {@link CycleButton} selected item has changed.

   @typedef {CustomEvent} coral-cyclebutton:change

   @property {CycleButtonItem} detail.oldSelection
   The prior selected item(s).
   @property {CycleButtonItem} detail.selection
   The newly selected item(s).
   */
});

export default CycleButton;
