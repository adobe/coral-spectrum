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

import {SelectableCollection} from '../../../coral-collection';
import {transform, validate} from '../../../coral-utils';

const CLASSNAME = '_coral-Menu';

/**
 Enumeration for {@link BaseList} interactions.

 @typedef {Object} ListInteractionEnum

 @property {String} ON
 Keyboard interaction is enabled.
 @property {String} OFF
 Keyboard interaction is disabled.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

/**
 @base BaseList
 @classdesc The base element for List components
 */
const BaseList = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();

    this._events = {
      'mouseenter': '_onMouseEnter',
      // Keyboard interaction
      'key:down [coral-list-item]': '_focusNextItem',
      'key:right [coral-list-item]': '_focusNextItem',
      'key:left [coral-list-item]': '_focusPreviousItem',
      'key:up [coral-list-item]': '_focusPreviousItem',
      'key:pageup [coral-list-item]': '_focusPreviousItem',
      'key:pagedown [coral-list-item]': '_focusNextItem',
      'key:home [coral-list-item]': '_focusFirstItem',
      'key:end [coral-list-item]': '_focusLastItem'
    };
  }

  /**
   The Collection Interface that allows interacting with the items that the component contains.

   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        itemTagName: this._itemTagName,
        itemBaseTagName: this._itemBaseTagName,
        itemSelector: 'coral-list-item, button[is="coral-buttonlist-item"], a[is="coral-anchorlist-item"]',
        host: this
      });
    }

    return this._items;
  }

  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-list-item';
  }

  /**
   Whether interaction with the component is enabled. See {@link ListInteractionEnum}.

   @type {String}
   @default ListInteractionEnum.ON
   @htmlattribute interaction
   @htmlattributereflected
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }

  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.ON;
    
    this._reflectAttribute('interaction', this._interaction);
  }

  /**
   Returns true if the event is at the matched target.

   @private
   */
  _eventIsAtTarget(event) {
    const target = event.target;
    const listItem = event.matchedTarget;

    const isAtTarget = target === listItem;

    if (isAtTarget) {
      // Don't let arrow keys etc scroll the page
      event.preventDefault();
    }

    return isAtTarget;
  }

  _onMouseEnter() {
    if (this.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  /** @private */
  _focusFirstItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }

    const items = this._getSelectableItems();
    items[0].focus();
  }

  /** @private */
  _focusLastItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }

    const items = this._getSelectableItems();
    items[items.length - 1].focus();
  }

  /** @private */
  _focusNextItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }

    const target = event.matchedTarget;
    const items = this._getSelectableItems();
    const index = items.indexOf(target);

    if (index === -1) {
      // Invalid state
      return;
    }

    if (index < items.length - 1) {
      items[index + 1].focus();
    }
    else {
      items[0].focus();
    }
  }

  /** @private */
  _focusPreviousItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }

    const target = event.matchedTarget;
    const items = this._getSelectableItems();
    const index = items.indexOf(target);

    if (index === -1) {
      // Invalid state
      return;
    }

    if (index > 0) {
      items[index - 1].focus();
    }
    else {
      items[items.length - 1].focus();
    }
  }

  /** @private */
  _getSelectableItems() {
    // Also checks if item is visible
    return this.items._getSelectableItems().filter(item => !item.hasAttribute('hidden') && item.offsetParent);
  }

  /** @ignore */
  focus() {
    if (!this.contains(document.activeElement)) {
      const items = this._getSelectableItems();
      if (items.length > 0) {
        items[0].focus();
      }
    }
  }

  /**
   Returns {@link BaseList} interaction options.

   @return {ListInteractionEnum}
   */
  static get interaction() {
    return interaction;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['interaction']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._interaction) {
      this.interaction = interaction.ON;
    }
  }
};

export default BaseList;
