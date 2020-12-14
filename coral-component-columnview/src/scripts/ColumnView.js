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

import accessibilityState from '../templates/accessibilityState';
import {BaseComponent} from '../../../coral-base-component';
import ColumnViewCollection from './ColumnViewCollection';
import isInteractiveTarget from './isInteractiveTarget';
import selectionMode from './selectionMode';
import {transform, validate, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-MillerColumns';

const scrollTo = (element, to, duration, scrollCallback) => {
  if (duration <= 0) {
    if (scrollCallback) {
      scrollCallback();
    }
    return;
  }

  const difference = to - element.scrollLeft;
  const perTick = difference / duration * 10;

  window.setTimeout(() => {
    element.scrollLeft = element.scrollLeft + perTick;
    if (element.scrollLeft === to) {
      if (scrollCallback) {
        scrollCallback();
      }
    } else {
      scrollTo(element, to, duration - 10);
    }
  }, 10);
};

/**
 @class Coral.ColumnView
 @classdesc A ColumnView component to display and allow users to browse and select items in a dynamic tree structure
 (e.g. a filesystem or multi-level navigation).
 @htmltag coral-columnview
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ColumnView extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Content zone
    this._elements = {
      accessibilityState: this.querySelector('span[handle="accessibilityState"]')
    };

    if (!this._elements.accessibilityState) {
      // Templates
      accessibilityState.call(this._elements, {commons});
      this._elements.accessibilityState.removeAttribute('aria-hidden');
      this._elements.accessibilityState.hidden = true;
    }

    // Events
    this._delegateEvents({
      // Prevents text selection while selecting multiple items
      'global:keyup': '_onGlobalKeyUp',
      'global:keydown': '_onGlobalKeyDown',

      'key:up': '_onKeyUp',
      'key:down': '_onKeyDown',
      'key:right': '_onKeyRight',
      'key:left': '_onKeyLeft',
      'key:shift+up': '_onKeyShiftAndUp',
      'key:shift+down': '_onKeyShiftAndDown',
      'key:space': '_onKeySpace',
      'key:control+a': '_onKeyCtrlA',
      'key:command+a': '_onKeyCtrlA',
      'key:control+shift+a': '_onKeyCtrlShiftA',
      'key:command+shift+a': '_onKeyCtrlShiftA',
      'key:esc': '_onKeyCtrlShiftA',

      'capture:focus coral-columnview-item': '_onItemFocus',

      'mousedown coral-columnview-item': '_onItemMouseDown',
      'mouseup coral-columnview-item': '_onItemMouseUp',

      // column events
      'coral-columnview-column:_loaditems': '_onColumnLoadItems',
      'coral-columnview-column:_activeitemchanged': '_onColumnActiveItemChanged',
      'coral-columnview-column:_selecteditemchanged': '_onColumnSelectedItemChanged'
    });

    // Defaults
    this._oldActiveItem = null;
    this._oldSelection = [];

    // default value of inner flag to process events
    this._bulkSelectionChange = false;

    // initializes the mutation observer that used to detect when new items are added or removed
    this._observer = new MutationObserver(this._handleMutation.bind(this));
    this._observer.observe(this, {
      // only watch the childList, items will tell us if selected/value/content changes
      childList: true
    });

    // Init the collection mutation observer
    this.items._startHandlingItems(true);
    this.columns._startHandlingItems(true);
  }

  /**
   Collection that holds all the columns inside the ColumnView.

   @type {ColumnViewCollection}
   @readonly
   */
  get columns() {
    // constructs the collection on first request
    if (!this._columns) {
      this._columns = new ColumnViewCollection({
        host: this,
        itemTagName: 'coral-columnview-column'
      });
    }

    return this._columns;
  }

  /**
   Collection used to represent the coral-columnview-item across all columns.

   @type {ColumnViewCollection}
   @readonly

   @private
   */
  get items() {
    // constructs the collection on first request
    if (!this._items) {
      this._items = new ColumnViewCollection({
        host: this,
        itemTagName: 'coral-columnview-item'
      });
    }

    return this._items;
  }

  /**
   Selection mode of the ColumnView. See {@link ColumnViewSelectionModeEnum}.

   @type {String}
   @default ColumnViewSelectionModeEnum.NONE
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

    // propagates the selection mode to the columns
    this.columns.getAll().forEach((item) => {
      item.setAttribute('_selectionmode', this._selectionMode);
    });

    this.classList.remove(`${CLASSNAME}--selection`);

    if (this._selectionMode !== selectionMode.NONE) {
      this.classList.add(`${CLASSNAME}--selection`);
    }

    // @a11y
    this.setAttribute('aria-multiselectable', this._selectionMode === selectionMode.MULTIPLE);
  }

  /**
   First selected item of the ColumnView.

   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.selectionMode !== selectionMode.NONE ? this.items._getFirstSelected() : null;
  }

  /**
   Array containing the set selected items. The items will match only one column since selection across columns is
   not allowed.

   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    return this.selectionMode !== selectionMode.NONE ? this.items._getAllSelected() : [];
  }

  /**
   Active Item that corresponds to the last item in the path.

   @type {HTMLElement}
   @readonly
   */
  get activeItem() {
    return this.items._getAllActive().pop() || null;
  }

  /** @private */
  _onColumnActiveItemChanged(event) {
    // this is a private event and should not leave the column view
    event.stopImmediatePropagation();

    // ignores event handling due to bulk select operation
    if (this._bulkSelectionChange) {
      return;
    }

    const column = event.target;

    // clears the internal selection cursor
    this._handleKeyboardMultiselect(null);

    this._bulkSelectionChange = true;

    if (!event.detail.activeItem) {
      // all items to the right must be removed. we do this at the end to be able to extract the values before
      // removing everything
      this._afterItemSelectedInColumn(column);
    } else {
      // when there is an active item, selection must not exist
      this.items._deselectAllExcept();

      // we need to deactivate every item to the right of the new active item to keep a correct DOM representation
      let nextColumn = column.nextElementSibling;
      while (nextColumn) {
        // We ignore preview columns
        if (nextColumn.tagName === 'CORAL-COLUMNVIEW-COLUMN' && nextColumn.items) {
          nextColumn.items._deactivateAll();
        }

        nextColumn = nextColumn.nextElementSibling;
      }
    }

    this._bulkSelectionChange = false;

    // we trigger the appropiate events
    this._validateColumnViewChange();
  }

  /**
   Requests external data to be loaded.

   @emits {coral-columnview:loaditems}

   @private
   */
  _onColumnLoadItems(event) {
    // this is a private event and should not leave the column view
    event.stopImmediatePropagation();

    this._updateAriaLevel(event.target);
    this._ensureTabbableItem();

    // triggers an event to indicate more data could be loaded
    this.trigger('coral-columnview:loaditems', {
      column: event.target,
      start: event.detail.start,
      item: event.detail.item
    });
  }

  /**
   Handle when first selectable item is added and make sure it is tabbable.
   @param {HTMLElement} [item]
   @private
   */
  _onItemAdd() {
    window.requestAnimationFrame(() => this._ensureTabbableItem());
  }

  /**
   Handle when item is removed, make sure that at least one element is tabbable, or if there are no items, and add listener to handle when item is added.
   @param {HTMLElement} [item]
   Item that was removed.
   @private
   */
  _onItemRemoved() {
    window.requestAnimationFrame(() => this._ensureTabbableItem());
  }

  /* @private */
  _ensureTabbableItem() {
    this._vent.off('coral-collection:add', this._onItemAdd);
    this._vent.off('coral-collection:remove', this._onItemRemoved);
    // Ensures that item will receive focus
    if (!this.selectedItem && !this.activeItem) {
      const selectableItems = this.items._getSelectableItems();
      // If there are no selectable items, stop listening for items being removed and start listening for the next item added.
      if (!selectableItems.length) {
        this._vent.off('coral-collection:remove', this._onItemRemoved);
        this._vent.on('coral-collection:add', this._onItemAdd);
      } else {
        // Otherwise, if there is a selectable item, make sure it has a tabIndex.
        selectableItems[0].tabIndex = 0;
        // Listen for item removal so that we can handle the edge case where all items have been removed.
        this._vent.on('coral-collection:remove', this._onItemRemoved);
      }
    } else if (this.selectedItem && this.selectedItem.tabIndex !== 0) {
      // If the selectedItem is not tabbable, make sure that it has tabIndex === 0
      this.selectedItem.tabIndex = 0;
    } else if (this.activeItem && this.activeItem.tabIndex !== 0) {
      // If the activeItem is not tabbable, make sure that it has tabIndex === 0
      this.activeItem.tabIndex = 0;
    }
  }

  /** @private */
  _onColumnSelectedItemChanged(event) {
    // this is a private event and should not leave the column view
    event.stopImmediatePropagation();

    // ignores event handling due to bulk select operation
    if (this._bulkSelectionChange || this.selectionMode === selectionMode.NONE) {
      return;
    }

    this._bulkSelectionChange = true;
    // we need to deselect any other selection that is not part of the same column
    this._oldSelection.forEach((el) => {
      if (event.detail.selection.indexOf(el) === -1) {
        el.removeAttribute('selected');
      }
    });
    this._bulkSelectionChange = false;

    // we trigger the appropiate events
    this._validateColumnViewChange();
  }

  /** @private */
  _onGlobalKeyUp(event) {
    // removes the class to stop selection
    if (event.keyCode === 16 && !isInteractiveTarget(event.target)) {
      this.classList.remove('is-unselectable');
    }
  }

  /** @private */
  _onGlobalKeyDown(event) {
    // adds a class that prevents the text selection, otherwise shift + click would select the text
    if (event.keyCode === 16 || !isInteractiveTarget(event.target)) {
      this.classList.add('is-unselectable');
    }
  }

  /** @private */
  _onKeyShiftAndUp(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't select items when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (this.selectionMode === selectionMode.NONE) {
      this._onKeyUp(event);
      return;
    }

    // using _oldSelection since it should be equivalent to this.items._getSelectedItems() but faster
    const oldSelectedItems = this._oldSelection;

    this._isKeyBoardMultiselect = true;

    // first make sure to select the active item as we want to multiselect
    if (oldSelectedItems.length === 0) {
      const activeItem = this.activeItem;

      if (activeItem) {
        activeItem.setAttribute('selected', '');
      }
    }

    // gets all the selected items of the active column. calling _getSelectedItems() will include the active item
    // if it was selected
    const selectedItems = this.items._getAllSelected();
    // reference of the last selected item to know the direction of the selection while using the multiselection
    const lastSelected = this._lastSelected;

    let selectedItem;
    // when no previous selection is stored we need to initialize it with the current information
    if (!lastSelected) {
      selectedItem = selectedItems[0].previousElementSibling;
      // selects the item
      selectedItem.setAttribute('selected', '');
    } else if (lastSelected.item) {
      selectedItem = lastSelected.item;

      // we have reached the upper selection limit
      if (selectedItem.matches(':first-child')) {
        this._isKeyBoardMultiselect = false;
        return;
      }

      if (!lastSelected.direction || lastSelected.direction === 'up') {
        selectedItem = selectedItem.previousElementSibling;
        selectedItem.setAttribute('selected', '');
      } else {
        if (selectedItem !== lastSelected.firstSelectedItem) {
          selectedItem.removeAttribute('selected');
        } else {
          // switches the direction if this was the last item selected
          lastSelected.direction = 'up';
        }

        selectedItem = selectedItem.previousElementSibling;
        selectedItem.setAttribute('selected', '');
      }
    }

    // stores the reference and direction to be able to perform the multiple selection correctly
    this._lastSelected = {
      item: selectedItem,
      direction: lastSelected && lastSelected.direction ? lastSelected.direction : 'up',
      firstSelectedItem: lastSelected && lastSelected.firstSelectedItem ?
        lastSelected.firstSelectedItem :
        selectedItem.nextElementSibling
    };

    if (selectedItem && selectedItem !== document.activeElement) {
      selectedItem.focus();
    }

    this._isKeyBoardMultiselect = false;
  }

  /** @private */
  _onKeyShiftAndDown(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't select items when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (this.selectionMode === selectionMode.NONE) {
      this._onKeyDown(event);
      return;
    }

    // using _oldSelection since it should be equivalent to this.items._getSelectedItems() but faster
    const oldSelectedItems = this._oldSelection;

    this._isKeyBoardMultiselect = true;

    // first make sure to select the active item as we want to multiselect
    if (oldSelectedItems.length === 0) {
      const activeItem = this.activeItem;

      if (activeItem) {
        activeItem.setAttribute('selected', '');
      }
    }

    // gets all the selected items of the active column. calling _getSelectedItems() will include the active item
    // if it was selected
    const selectedItems = this.items._getAllSelected();

    // reference of the last selected item to know the direction of the selection while using the multiselection
    const lastSelected = this._lastSelected;

    let selectedItem;
    // when no previous selection is stored we need to initialize it with the current information
    if (!lastSelected) {
      selectedItem = selectedItems[selectedItems.length - 1].nextElementSibling;
      // selects the item
      selectedItem.setAttribute('selected', '');
    } else if (lastSelected.item) {
      selectedItem = lastSelected.item;

      // we have reached the lower selection limit
      if (selectedItem.matches(':last-child')) {
        this._isKeyBoardMultiselect = false;
        return;
      }

      if (!lastSelected.direction || lastSelected.direction === 'down') {
        selectedItem = selectedItem.nextElementSibling;
        selectedItem.setAttribute('selected', '');
      } else {
        if (selectedItem !== lastSelected.firstSelectedItem) {
          selectedItem.removeAttribute('selected');
        } else {
          // switches the direction if this was the last item selected
          lastSelected.direction = 'down';
        }

        selectedItem = selectedItem.nextElementSibling;
        selectedItem.setAttribute('selected', '');
      }
    }

    // stores the reference and direction to be able to perform the multiple selection correctly
    this._lastSelected = {
      item: selectedItem,
      direction: lastSelected && lastSelected.direction ? lastSelected.direction : 'down',
      firstSelectedItem: lastSelected && lastSelected.firstSelectedItem ?
        lastSelected.firstSelectedItem :
        selectedItem.previousElementSibling
    };

    if (selectedItem && selectedItem !== document.activeElement) {
      selectedItem.focus();
    }

    this._isKeyBoardMultiselect = false;
  }

  /** @private */
  _onKeyUp(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't navigate items when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    // selection will win over active buttons, because they are the right most item. using _oldSelection since it
    // should be equivalent to this.items._getSelectedItems() but faster
    const selectedItems = this._oldSelection;

    let item;
    if (selectedItems.length !== 0) {
      const selectedItem = matchedTarget;

      item = selectedItem.previousElementSibling;
      if (!item) {
        item = selectedItem;
      }
    }
      // when there is no active item to select, we get the last item of the column. this way users can interact with
    // the column view when there is nothing selected or activated
    else if (this._oldActiveItem === null) {
      item = this.items._getLastSelectable();
    } else {
      item = this._oldActiveItem.previousElementSibling;
    }

    // we use click instead of selected to force the deselection of the other items
    if (item && item !== document.activeElement) {
      item.focus();
      if (this.selectionMode === selectionMode.NONE ||
        selectedItems.length === 0 ||
        // For use case in cascading schema editor,
        // where the focused item is not in the same column as the selected items,
        // we should activate the item so that coral-columnview:activeitemchange gets called.
        item.parentElement !== selectedItems[0].parentElement) {
        item.click();
      }
    }
  }

  /** @private */
  _onKeyDown(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't navigate items when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    // selection will win over active buttons, because they are the right most item. using _oldSelection since it
    // should be equivalent to this.items._getSelectedItems() but faster
    const selectedItems = this._oldSelection;

    let item;
    if (selectedItems.length !== 0) {
      const selectedItem = matchedTarget;

      item = selectedItem.nextElementSibling;

      // when
      if (!item) {
        item = matchedTarget;
      }
    }
      // when there is no active item to select, we get the first item of the column. this way users can interact with
    // the column view when there is nothing selected or activated
    else if (this._oldActiveItem === null) {
      item = this.items._getFirstSelectable();
    } else {
      item = this._oldActiveItem.nextElementSibling;
    }

    // we use click instead of selected to force the deselection of the other items
    if (item && item !== document.activeElement) {
      item.focus();
      if (this.selectionMode === selectionMode.NONE ||
        selectedItems.length === 0 ||
        // For use case in cascading schema editor,
        // where the focused item is not in the same column as the selected items,
        // we should activate the item so that coral-columnview:activeitemchange gets called.
        item.parentElement !== selectedItems[0].parentElement) {
        item.click();
      }
    }
  }

  /** @private */
  _onKeyRight(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    if (matchedTarget.variant !== ColumnView.Item.variant.DRILLDOWN) {
      return false;
    }

    if (isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    // we can only navigate right when there is a column on the right side to navigate to
    let nextColumn;
    // using _oldSelection since it should be equivalent to this.items._getSelectedItems() but faster
    let selectedItems = this._oldSelection;

    // when there is an active item, we use the item containing the active item as reference
    if (matchedTarget) {
      nextColumn = matchedTarget.closest('coral-columnview-column').nextElementSibling;
    }
    // otherwise when there is selection, we use the item containing the selected items as reference
    else if (selectedItems.length !== 0) {
      nextColumn = selectedItems[0].closest('coral-columnview-column').nextElementSibling;
    }

    if (nextColumn && nextColumn.tagName === 'CORAL-COLUMNVIEW-COLUMN') {
      // we need to make sure the column is initialized
      commons.ready(nextColumn, () => this._focusAndActivateFirstSelectableItem(nextColumn));
    }
  }

  /** @private */
  _onKeyLeft(event) {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    // we can only navigate left when there is a column on the left side to navigate to
    let previousColumn;
    // using _oldSelection since it should be equivalent to this.items._getSelectedItems() but faster
    const selectedItems = this._oldSelection;

    // when there is selection, we use the previous column as a reference
    if (selectedItems.length !== 0) {
      previousColumn = selectedItems[0].closest('coral-columnview-column').previousElementSibling;
    }
    // otherwise we use the activeItems as a reference
    else if (this.activeItem) {
      const col = this.activeItem.closest('coral-columnview-column');
      previousColumn = event.target.closest('coral-columnview-preview') ? col : col.previousElementSibling;
    }

    if (previousColumn && previousColumn.tagName === 'CORAL-COLUMNVIEW-COLUMN') {
      // we need to make sure the column is initialized
      const activeDescendant = previousColumn.activeItem || previousColumn.items._getFirstSelected() || previousColumn.items._getFirstSelectable();
      if (activeDescendant && activeDescendant !== document.activeElement) {
        activeDescendant.focus();
        if (this.selectionMode === selectionMode.NONE ||
          selectedItems.length === 0) {
          activeDescendant.click();
        }
      }
    }
  }

  /** @private */
  _onKeySpace(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't select item when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    // using _oldSelection since it should be equivalent to this.items._getSelectedItems() but faster
    const selectedItems = this._oldSelection;
    let activeDescendant;

    // when there is a selection, we need to activate the first item of the selection
    if (selectedItems.length !== 0) {
      activeDescendant = matchedTarget;
      if (activeDescendant.hasAttribute('selected', '')) {
        if (selectedItems.length === 1) {
          activeDescendant.setAttribute('active', '');
        } else {
          activeDescendant.removeAttribute('selected', '');
        }
      } else {
        activeDescendant.setAttribute('selected', '');
      }
    } else {
      const activeItem = this.activeItem || matchedTarget;
      // toggles the selection between active and selected
      if (activeItem && this.selectionMode !== selectionMode.NONE) {
        // select the item
        activeItem.setAttribute('selected', '');
        activeDescendant = activeItem;
      }
    }
  }

  /** @private */
  _onKeyCtrlA(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't select item when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (this.selectionMode === selectionMode.MULTIPLE) {
      const currentColumn = matchedTarget.closest('coral-columnview-column');
      currentColumn.items._selectAll();
    } else if (this.selectionMode === selectionMode.SINGLE) {
      if (!matchedTarget.hasAttribute('selected')) {
        matchedTarget.setAttribute('selected', '');
      }
    }
  }

  /** @private */
  _onKeyCtrlShiftA(event) {
    const matchedTarget = this._getRealMatchedTarget(event);

    // don't select item when focus is within the preview
    if (matchedTarget.closest('coral-columnview-preview') || isInteractiveTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (this.selectionMode !== selectionMode.NONE) {
      const currentColumn = matchedTarget.closest('coral-columnview-column');
      currentColumn.items._deselectAndDeactivateAllExcept(matchedTarget);
      if (!matchedTarget.hasAttribute('active')) {
        matchedTarget.setAttribute('active', '');
      }
    }
  }

  /** @private */
  _onItemFocus(event) {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    const matchedTarget = this._getRealMatchedTarget(event);
    if (!this.activeItem && !this._oldSelection.length && !matchedTarget._flagMouseDown) {
      matchedTarget.setAttribute('active', '');
    }
    this.items._getSelectableItems().forEach(item => {
      item.tabIndex = item === matchedTarget ? 0 : -1;
    });

    if (matchedTarget.contains(document.activeElement)) {
      matchedTarget.focus();
    }
  }

  /** @ignore */
  _onItemMouseDown(event) {
    if (isInteractiveTarget(event.target)) {
      return;
    }
    var matchedTarget = this._getRealMatchedTarget(event);
    matchedTarget._flagMouseDown = true;
  }

  /** @ignore */
  _onItemMouseUp(event) {
    if (isInteractiveTarget(event.target)) {
      return;
    }
    var matchedTarget = this._getRealMatchedTarget(event);
    delete matchedTarget._flagMouseDown;
  }

  /** @ignore */
  _updateAriaLevel(column) {
    const colIndex = this.columns.getAll().indexOf(column);
    const level = colIndex + 1;
    if (column.items) {
      column.items.getAll().filter((item, index) => {
        item.setAttribute('aria-posinset', index + 1);
        item.setAttribute('aria-setsize', column.items.length);
        return !item.hasAttribute('aria-level');
      }).forEach((item) => {
        item.setAttribute('aria-level', level);
      });
    }

    // root column has role="presentation"
    if (colIndex === 0) {
      column.setAttribute('role', 'presentation');
      // and should not be labeled.
      return;
    }

    // Make sure the column group has a label so that it can be navigated with VoiceOver
    if (!column.hasAttribute('aria-labelledby')) {
      if (!column.hasAttribute('aria-label')) {
        column.setAttribute('aria-label', (this.getAttribute('aria-label') || '…'));
      }
    } else if (column.getAttribute('aria-label') === (this.getAttribute('aria-label') || '…')) {
      column.removeAttribute('aria-label');
    }
  }

  /** @private */
  _arraysAreDifferent(selection, oldSelection) {
    let diff = [];

    if (oldSelection.length === selection.length) {
      diff = oldSelection.filter((item) => selection.indexOf(item) === -1);
    }

    // since we guarantee that they are arrays, we can start by comparing their size
    return oldSelection.length !== selection.length || diff.length !== 0;
  }

  /** @private */
  _handleKeyboardMultiselect(newSelectedItem) {
    if (!this._isKeyBoardMultiselect) {
      this._lastSelected = undefined;

      // if there is a new selected item save this (but without direction info)
      if (newSelectedItem) {
        this._lastSelected = {
          item: newSelectedItem,
          direction: null,
          firstSelectedItem: newSelectedItem
        };
      }
    }
  }

  /**
   Scrolls the given {@link Coral.ColumnView.Column} into view.

   @param {HTMLElement} column
   The column that needs to be scrolled into view.
   @param {Boolean} clearEmptyColumns
   Remove empty columns once animation is done.
   @param {Boolean} triggerEvent

   @private
   */
  _scrollColumnIntoView(column, clearEmptyColumns, triggerEvent) {
    // @todo: improve animation effect when key is kept press
    let left = 0;
    let duration;

    // we return if the column is not inside the current column view
    if (!this.contains(column)) {
      return;
    }

    // make sure to clear columns next to this column if animation is done
    const completeCallback = () => {
      if (clearEmptyColumns) {
        this._removeEmptyColumnsWithSmoothTransition(triggerEvent);
      }
    };

    // scroll right to the given column
    if (column.getBoundingClientRect().left + column.offsetWidth >= this.offsetWidth) {
      let next = column.nextElementSibling;
      while (next) {
        next.parentNode.removeChild(next);
        next = column.nextElementSibling;
      }

      left = this.scrollWidth - this.offsetWidth;
      duration = left - this.scrollLeft;
      scrollTo(this, left, duration, completeCallback);
    } else if (clearEmptyColumns) {
      this._removeEmptyColumnsWithSmoothTransition(triggerEvent);
    }
  }

  /**
   Handling of the column view after selecting an item.

   @param {HTMLElement} column

   @private
   */
  _afterItemSelectedInColumn(column) {
    // @todo: emptying the columns allows them to be queried
    this._emptyColumnsNextToColumn(column);
    this._scrollColumnIntoView(column, true, true);
  }

  /**
   Empties all the columns to the right of the provided column.

   @param {HTMLElement} column

   @private
   */
  _emptyColumnsNextToColumn(column) {
    if (column !== null) {
      let next = column.nextElementSibling;
      while (next && next.innerHTML.length) {
        next.innerHTML = '';
        next = next.nextElementSibling;
      }
    }
  }

  /**
   Remove all empty columns with a smooth transition. Optionally the navigate event is triggered when all the extra
   columns are removed from the DOM.

   @param {Boolean} triggerEvent
   Whether the navigate event must be triggered.

   @private
   */
  _removeEmptyColumnsWithSmoothTransition(triggerEvent) {
    // fade width of empty items to 0 before removing the columns (for better usability while navigating)
    const emptyColumns = Array.prototype.filter.call(this.querySelectorAll('coral-columnview-column, coral-columnview-preview'), el => !el.firstChild);

    if (emptyColumns.length) {
      emptyColumns.forEach((column, i) => {
        column.style.visibility = 'hidden';
        column.classList.add('is-collapsing');
        commons.transitionEnd(column, () => {
          column.remove();
          if (i === emptyColumns.length - 1 && triggerEvent) {
            this._validateNavigation(this.columns.last());
          }
        });
        column.style.width = 0;
      });
    } else if (triggerEvent) {
      this._validateNavigation(this.columns.last());
    }
  }

  /** @private */
  _triggerCollectionEvents(addedNodes, removedNodes) {
    let item;
    const addedNodesCount = addedNodes.length;
    for (let i = 0 ; i < addedNodesCount ; i++) {
      item = addedNodes[i];
      if (this.activeItem) {
        // @a11y add aria-owns attribute to active item to express relationship of added column to the active item
        this.activeItem.setAttribute('aria-owns', item.id);

        // @a11y column or preview should be labelled by active item
        item.setAttribute('aria-labelledby', this.activeItem.content.id);

        // @a11y preview should provide description for active item
        if (item.tagName === 'CORAL-COLUMNVIEW-PREVIEW') {
          this.activeItem.setAttribute('aria-describedby', item.id);
        }
      }

      if (item.tagName === 'CORAL-COLUMNVIEW-COLUMN') {
        // we use the property since the item may not be ready
        item.setAttribute('_selectionmode', this.selectionMode);
        this.trigger('coral-collection:add', {item});
        this._updateAriaLevel(item);
      }
    }

    // @todo: check if special handling is needed when selected column is removed
    const removedNodesCount = removedNodes.length;
    for (let j = 0 ; j < removedNodesCount ; j++) {
      item = removedNodes[j];
      // @todo: should I handle it specially if it was selected? should a selection and active event be triggered?
      if (item.tagName === 'CORAL-COLUMNVIEW-COLUMN') {
        this.trigger('coral-collection:remove', {item});
      }
    }
  }

  /** @private */
  _setStateFromDOM() {
    // @todo: should I trigger change events?
    // initial state of the columnview
    this._oldActiveItem = this.activeItem;
    this._oldSelection = this.selectedItems;

    this._ensureTabbableItem();

    if (this.columns) {
      var columns = this.columns.getAll();
      var self = this;
      columns.forEach(function (column) {
        self._updateAriaLevel(column);
      });
    }
  }

  /** @private */
  _handleMutation(mutations) {
    const mutationsCount = mutations.length;
    for (let i = 0 ; i < mutationsCount ; i++) {
      const mutation = mutations[i];

      // we handle the collection events
      this._triggerCollectionEvents(mutation.addedNodes, mutation.removedNodes);
    }

    // sets the internal state based on the existing columns
    this._setStateFromDOM();
  }

  /**
   Determines if something of the internal state of the component has changed. Active item event is always triggered
   first and then the selection event.

   @private
   */
  _validateColumnViewChange() {
    // we evaluate first the active event since we always need to trigger active first and then selection
    const activeItem = this.activeItem;
    const oldActiveItem = this._oldActiveItem;

    // same column events are only triggered if the active item changed, otherwise they are ignored
    if (activeItem !== oldActiveItem) {
      this.trigger('coral-columnview:activeitemchange', {activeItem, oldActiveItem});

      // we cache the old active item to be able to report correct change events
      this._oldActiveItem = activeItem;
    }

    // when there is no selection we avoid triggering any change event but we do not stop items from having the
    // selected attribute
    if (this.selectionMode === selectionMode.NONE) {
      return;
    }

    const newSelection = this.selectedItems;
    const oldSelection = this._oldSelection || [];

    // use first newly selected item for new selection
    const newSelectedItems = newSelection.filter((item) => oldSelection.indexOf(item) === -1);
    this._handleKeyboardMultiselect(newSelectedItems.length > 0 ? newSelectedItems[0] : null);

    if (this._arraysAreDifferent(newSelection, oldSelection)) {
      this.trigger('coral-columnview:change', {
        selection: newSelection,
        oldSelection: oldSelection
      });

      // changes the old selection array since we selected something new
      this._oldSelection = newSelection;

      // announce the selection state for the focused item
      this._announceActiveElementState();
    }
  }

  /**
   Triggers the navigation event. Navigation would happen when a) a new column is added, and it is ready to be
   used or b) columns are removed and the active changed. In case the column is actually a preview column, the event
   will only be triggered when there is no selection (meanning a real navigation was performed).

   @param {HTMLElement} column
   Last column of the ColumnView.

   @emits {coral-columnview:navigate}

   @private
   */
  _validateNavigation(column) {
    // we use _oldSelection because it is faster
    if (column.tagName === 'CORAL-COLUMNVIEW-PREVIEW' && this._oldSelection.length !== 0) {
      return;
    }

    this.trigger('coral-columnview:navigate', {
      activeItem: this.activeItem,
      column: column
    });
  }

  /* @private */
  _announceActiveElementState() {
    // @a11y Add live region element to ensure announcement of selected state
    const accessibilityState = this._elements.accessibilityState;

    // @a11y accessibility state string should announce in document lang, rather than item lang.
    accessibilityState.setAttribute('lang', i18n.locale);

    // @a11y append live region content element
    if (!this.contains(accessibilityState)) {
      this.insertBefore(accessibilityState, this.firstChild);
    }

    // utility method to clean up accessibility state
    function resetAccessibilityState() {
      accessibilityState.hidden = true;
      accessibilityState.setAttribute('aria-live', 'off');
      accessibilityState.innerHTML = '';
    }

    resetAccessibilityState();

    if (this._addTimeout || this._removeTimeout) {
      clearTimeout(this._addTimeout);
      clearTimeout(this._removeTimeout);
    }

    // we use setTimeout instead of nextFrame to give screen reader
    // more time to respond to live region update in order to announce
    // complete text content when the state changes.
    this._addTimeout = window.setTimeout(() => {
      const activeElement = document.activeElement.closest('coral-columnview-item') || document.activeElement;

      if (!this.contains(activeElement) || activeElement.tagName !== 'CORAL-COLUMNVIEW-ITEM') {
        return;
      }

      const span = document.createElement('span');
      const contentSpan = document.createElement('span');
      const lang = !activeElement.hasAttribute('lang') && activeElement.closest('[lang]') ? activeElement.closest('[lang]').getAttribute('lang') : activeElement.getAttribute('lang');
      if (lang && lang !== i18n.locale) {
        contentSpan.setAttribute('lang', lang);
      }
      contentSpan.innerText = activeElement._elements.content.innerText;
      span.appendChild(contentSpan);
      span.appendChild(
        document.createTextNode(
          i18n.get(activeElement.selected ? ', checked' : ', unchecked')
        )
      );
      accessibilityState.hidden = false;
      accessibilityState.setAttribute('aria-live', 'assertive');
      accessibilityState.appendChild(span);

      // give screen reader 2 secs before clearing the live region, to provide enough time for announcement
      this._removeTimeout = window.setTimeout(() => {
        resetAccessibilityState();
        this._elements.accessibilityState = accessibilityState.parentNode.removeChild(accessibilityState);
      }, 2000);
    }, 20);
  }

  /**
   * Helper function to extract the correct matchedTarget from the event.
   *
   * Tests can interact with ColumnView directly where the key events are triggered on
   * the ColumnView itself. In that case the event.matchedTarget point to the ColumnView
   * instead of the ColumnViewItem, in other word the active or selected element.
   *
   * @private
   **/
  _getRealMatchedTarget(event) {
    if (event.matchedTarget.nodeName !== 'CORAL-COLUMNVIEW') {
      return event.matchedTarget;
    }
    if (event.matchedTarget.contains(document.activeElement) && document.activeElement.nodeName === 'CORAL-COLUMNVIEW-ITEM') {
      return document.activeElement;
    }
    if (event.matchedTarget.selectedItem) {
      return event.matchedTarget.selectedItem;
    }
    if (event.matchedTarget.activeItem) {
      return event.matchedTarget.activeItem;
    }
  }

  _focusAndActivateFirstSelectableItem(column) {
    let item;
    let selectedItems = this.selectedItems;

    if (column.items) {
      item = column.items._getFirstSelectable();
    } else if (column.tagName === 'CORAL-COLUMNVIEW-PREVIEW') {
      item = selectedItems[0] || this.activeItem;
    }

    if (item && item !== document.activeElement) {
      item.focus();
      if (this.selectionMode === selectionMode.NONE ||
        this._oldSelection.length === 0 ||
        selectedItems.length === 0 ||
        // For use case in cascading schema editor,
        // where the focused item is not in the same column as the selected items,
        // we should activate the item so that coral-columnview:activeitemchange gets called.
        item.parentElement !== selectedItems[0].parentElement) {
        item.click();
      }
    }
  }

  /** @ignore */
  focus() {
    // selected items go first because there is no active item in a column with selection
    const item = this.selectedItems[0] || this.activeItem;
    if (item && item !== document.activeElement) {
      item.focus();
    }
  }

  /**
   Sets the next column given a reference column. This will handle cleaning the DOM and removing any columns as
   required.

   @param {HTMLElement} newColumn
   The new column to add to the column view. It will be placed next to the <code>referenceColumn</code> if
   provided.
   @param {HTMLElement} referenceColumn
   The column that will be used as a reference to place the new column. This column needs to be already inside the
   DOM.
   @param {Boolean} [scrollToColumn = true]
   Whether the columnview show scroll to have the <code>newColumn</code> visible.

   @emits {coral-columnview:navigate}
   */
  setNextColumn(newColumn, referenceColumn, scrollToColumn) {
    scrollToColumn = typeof scrollToColumn === 'undefined' || scrollToColumn;

    const column = referenceColumn || null;

    let columnReplacedContainedFocus = false;

    // handles the case where the first column needs to be added
    if (column === null || !this.contains(column)) {
      this.appendChild(newColumn);
    } else {
      const nextColumn = column.nextElementSibling;

      if (nextColumn) {
        columnReplacedContainedFocus = nextColumn.contains(document.activeElement);
        this._emptyColumnsNextToColumn(column);
        const before = nextColumn.nextElementSibling;
        this.removeChild(nextColumn);
        this.insertBefore(newColumn, before);
      } else {
        this.appendChild(newColumn);
      }
    }

    // if we want to scroll to it, we need for it to be ready due to measurements
    commons.ready(newColumn, () => {
      if (scrollToColumn) {
        // event is not triggered because it is handled separately
        this._scrollColumnIntoView(newColumn, true, false);
      }

      // we notify that the columnview navigated and it is ready to be used
      this._validateNavigation(newColumn);

      // if the column the newColumn replaces contained focus, restore focus to an item in the newColumn
      if (columnReplacedContainedFocus && !newColumn.contains(document.activeElement)) {
        this._focusAndActivateFirstSelectableItem(newColumn);
      }
    });
  }

  /**
   Returns {@link ColumnView} selection options.

   @return {ColumnViewSelectionModeEnum}
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
      'selectionmode'
    ]);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // @a11y
    this.setAttribute('role', 'tree');
    // @a11y: the columnview needs to be focusable to handle a11y properly
    this.tabIndex = -1;
    // @a11y: the columnview should be labelled so that its entire content
    // is not read as its accessibility name
    if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
      this.setAttribute('aria-label', i18n.get('Column View'));
    }

    // Default reflect attributes
    if (!this._selectionMode) {
      this._selectionMode = selectionMode.NONE;
    }

    // no need to wait for the mutation observers
    this._setStateFromDOM();
  }

  /**
   Triggered when additional items can be loaded into the {@link ColumnView}. This will happen when the current column can
   still hold more items, when the user scrolls down the current column or when a new column needs to be loaded. If
   <code>preventDefault()</code> is called, then a loading indicator will be shown.
   {@link ColumnViewColumn#loading} should be set to false to indicate that the data has been successfully
   loaded.

   @typedef {CustomEvent} coral-columnview:loaditems

   @property {ColumnViewColumn} detail.column
   The column that is requesting more items. While doing pagination, it will become the target of the loaded items.
   @property {Number} detail.start
   Indicates the current amount of items in the <code>column</code> to do pagination. If <code>item</code> is
   available, start will be 0 to denote that the column should be loaded from the start.
   @property {ColumnViewItem} detail.item
   The item that initialized the load. If item is provided, it means that a new column needs to be added after
   the load is performed. In this scenario, <code>column</code> will be refer to the column that holds the item.
   */

  /**
   Triggered when the selection inside the {@link ColumnViewColumn} changes. In case both the selection and the active item change,
   the <code>coral-columnview:activeitemchange</code> will be triggered first.

   @typedef {CustomEvent} coral-columnview:change

   @property {ColumnViewColumn} detail.column
   The column whose selection changed.
   @property {ColumnViewItem|Array.<ColumnViewItem>} detail.selection
   The new selection of the Column.
   @property {ColumnViewItem|Array.<ColumnViewItem>} detail.oldSelection
   The old selection of the Column.
   */

  /**
   Triggered when the active item of the {@link ColumnViewColumn} changes.

   @typedef {CustomEvent} coral-columnview:activeitemchange

   @property {ColumnViewColumn} detail.column
   The column whose active item has changed.
   @property {ColumnViewItem} detail.activeItem
   The currently active item of the column.
   @property {ColumnViewItem} detail.oldActiveItem
   The item of the column that was active before.
   */

  /**
   Triggered when the {@link ColumnView} navigation is complete and the new columns are ready.

   @typedef {CustomEvent} coral-columnview:navigate

   @property {ColumnViewColumn} detail.column
   The last Column of the ColumnView that is used to determine the path. If the navigate was triggered because a
   new {@link ColumnViewColumn} was added, then it will match that column. In case the path was
   reduced, the column will match the last column.
   @property {ColumnViewItem} detail.activeItem
   The currently active item of the ColumnView.
   */
}

export default ColumnView;
