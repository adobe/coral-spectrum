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
import {SelectableCollection} from '../../../coral-collection';
import {transform, validate, Keys} from '../../../coral-utils';

// Key codes
const PAGE_UP = 33;
const PAGE_DOWN = 34;
const LEFT_ARROW = 37;
const UP_ARROW = 38;

/**
 Enumeration for {@link Accordion} variants.

 @typedef {Object} AccordionVariantEnum

 @property {String} DEFAULT
 Default look and feel.
 @property {String} QUIET
 Not supported. Falls back to DEFAULT.
 @property {String} LARGE
 Not supported. Falls back to DEFAULT.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet',
  LARGE: 'large'
};

// the accordions's base classname
const CLASSNAME = '_coral-Accordion';

/**
 @class Coral.Accordion
 @classdesc An Accordion component consisting of multiple collapsible items.
 @htmltag coral-accordion
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Accordion extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    // Attach events
    this._delegateEvents({
      'click coral-accordion-item:not([disabled]) ._coral-Accordion-itemHeader': '_onItemClick',

      'key:space ._coral-Accordion-itemHeader': '_onToggleItemKey',
      'key:return ._coral-Accordion-itemHeader': '_onToggleItemKey',
      'key:pageup ._coral-Accordion-itemHeader': '_focusPreviousItem',
      'key:left ._coral-Accordion-itemHeader': '_focusPreviousItem',
      'key:up ._coral-Accordion-itemHeader': '_focusPreviousItem',
      'key:pagedown ._coral-Accordion-itemHeader': '_focusNextItem',
      'key:right ._coral-Accordion-itemHeader': '_focusNextItem',
      'key:down ._coral-Accordion-itemHeader': '_focusNextItem',
      'key:home ._coral-Accordion-itemHeader': '_onHomeKey',
      'key:end ._coral-Accordion-itemHeader': '_onEndKey',
      'keydown ._coral-Accordion-itemHeader': '_onItemContentKeyDown',

      // private
      'coral-accordion-item:_selectedchanged': '_onItemSelectedChanged'
    });

    // Used for eventing
    this._oldSelection = [];

    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }

  /**
   The Accordion's variant. See {@link AccordionVariantEnum}.

   @type {String}
   @default AccordionVariantEnum.DEFAULT
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
  }

  /**
   The Collection Interface that allows interacting with the items that the component contains.

   @type {Collection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-accordion-item',
        // allows accordions to be nested
        itemSelector: ':scope > coral-accordion-item',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
    return this._items;
  }

  /**
   Indicates whether the accordion accepts multiple selected items.
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

    this._validateSelection();
  }

  /**
   Returns an Array containing the set selected items.
   @type {Array.<AccordionItem>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }

  /**
   Returns the first selected item in the Accordion. The value <code>null</code> is returned if no element is
   selected.
   @type {AccordionItem}
   @readonly
   */
  get selectedItem() {
    return this.items._getFirstSelected();
  }

  /**
    The heading level for Accordion items within the Accordion

    @type {Number}
    @default 3
    @htmlattribute level
    @htmlattributereflected
  */
  get level() {
    return this._level || 3;
  }

  set level(value) {
    value = transform.number(value);
    if (validate.valueMustChange(value, this._level) && value > 0 && value < 7) {
      this._level = value;
      this._reflectAttribute('level', this._level);
      this.items.getAll().forEach(item => item.setAttribute('level', this._level));
    }
  }

  /** @private **/
  get _tabTarget() {
    return this.__tabTarget || null;
  }
  set _tabTarget(value) {
    this.__tabTarget = value;

    // Set all but the current set _tabTarget to not be a tab target:
    this.items.getAll().forEach((item) => {
      item._isTabTarget = item === value;
    });
  }

  /** @private */
  _onHomeKey(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusItem(this.items._getFirstSelectable());
  }

  /** @private */
  _onEndKey(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusItem(this.items._getLastSelectable());
  }

  /**
   References:
   http://www.w3.org/WAI/PF/aria-practices/#accordion &

   Handlers for when focus is on an element inside of the panel:
   http://test.cita.illinois.edu/aria/tabpanel/tabpanel2.php

   @private
   */
  _onItemContentKeyDown(event) {
    // Required since sometimes the value is a number
    const key = parseFloat(event.keyCode);
    const item = event.matchedTarget.parentNode;

    switch (key) {
      case UP_ARROW:
      case LEFT_ARROW:
        // Set focus on the tab button for the currently displayed tab.
        if ((event.metaKey || event.ctrlKey) && Keys.filterInputs(event)) {
          event.preventDefault();
          event.stopPropagation();

          this._focusItem(item);
        }
        break;
      case PAGE_UP:
        // Show the previous tab and set focus on its corresponding tab button. Shows the last tab in the panel if
        // current tab is the first one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          const prevItem = this.items._getPreviousSelectable(item);
          this._toggleItemSelection(prevItem);
          this._focusItem(prevItem);
        }
        break;
      case PAGE_DOWN:
        // Show the next tab and set focus on its corresponding tab button. Shows the first tab in the panel if current
        // tab is the last one.
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();

          const nextItem = this.items._getNextSelectable(item);
          this._toggleItemSelection(nextItem);
          this._focusItem(nextItem);
        }
        break;
    }
  }

  /** @private */
  _focusPreviousItem(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusItem(this.items._getPreviousSelectable(event.target.closest('coral-accordion-item')));
  }

  /** @private */
  _focusNextItem(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusItem(this.items._getNextSelectable(event.target.closest('coral-accordion-item')));
  }

  /** @private */
  _onItemClick(event) {
    // Clickable elements included in an item header shouldn't automatically trigger the selection of that item
    if (event.target.hasAttribute('coral-interactive') || event.target.closest('[coral-interactive]')) {
      return;
    }

    // The click was performed on the header so we select the item (parentNode) the selection is toggled
    const item = event.target.closest('coral-accordion-item');
    if (item) {
      event.preventDefault();
      event.stopPropagation();

      this._toggleItemSelection(item);
      this._focusItem(item);
    }
  }

  /** @private */
  _onToggleItemKey(event) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.target.closest('coral-accordion-item');
    this._toggleItemSelection(item);
    this._focusItem(item);
  }

  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();

    this._validateSelection(event.target);
  }

  /** @private */
  _validateSelection(item) {
    const selectedItems = this.selectedItems;

    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
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
    }

    // set items level appropriately
    if (item && item.getAttribute('level') !== this.level) {
      item.setAttribute('level', this.level);
    }

    this._resetTabTarget();

    this._triggerChangeEvent();
  }

  /** @private */
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    const oldSelection = this._oldSelection;

    if (!this._preventTriggeringEvents && this._arraysAreDifferent(selectedItems, oldSelection)) {
      // We differentiate whether multiple is on or off and return an array or HTMLElement respectively
      if (this.multiple) {
        this.trigger('coral-accordion:change', {
          oldSelection: oldSelection,
          selection: selectedItems
        });
      }
      else {
        // Return all items if we just switched from multiple=true to multiple=false and we had >1 selected items
        this.trigger('coral-accordion:change', {
          oldSelection: oldSelection.length > 1 ? oldSelection : oldSelection[0] || null,
          selection: selectedItems[0] || null
        });
      }

      this._oldSelection = selectedItems;
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

  /**
   Determine what item should get focus (if any) when the user tries to tab into the accordion. This should be the
   first selected panel, or the first selectable panel otherwise. When neither is available, to Accordion cannot be
   tabbed into.

   @private
   */
  _resetTabTarget() {
    if (!this._resetTabTargetScheduled) {
      this._resetTabTargetScheduled = true;

      window.requestAnimationFrame(() => {
        this._resetTabTargetScheduled = false;

        // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
        const selectedItems = this.items._getAllSelected();

        this._tabTarget = selectedItems.length ? selectedItems[0] : this.items._getFirstSelectable();
      });
    }
  }

  /** @private */
  _toggleItemSelection(item) {
    if (item) {
      item[item.hasAttribute('selected') ? 'removeAttribute' : 'setAttribute']('selected', '');
    }
  }

  /** @private */
  _focusItem(item) {
    if (item) {
      item._elements.button.focus();
    }

    this._tabTarget = item;
  }

  /**
   Returns {@link Accordion} variants.

   @return {AccordionVariantEnum}
   */
  static get variant() { return variant; }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['variant', 'multiple', 'level']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }

    // WAI-ARIA 1.1
    this.setAttribute('role', 'region');

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;

    this._oldSelection = this.selectedItems;

    // Don't trigger animations on rendering
    window.requestAnimationFrame(() => {
      this.classList.add(`${CLASSNAME}--animated`);
    });
  }

  /**
   Triggered when {@link Accordion} selected item has changed.

   @typedef {CustomEvent} coral-accordion:change

   @property {AccordionItem} detail.oldSelection
   The prior selected item(s).
   @property {AccordionItem} detail.selection
   The newly selected item(s).
   */
}

export default Accordion;
