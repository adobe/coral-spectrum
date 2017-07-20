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

import {Collection} from 'coralui-collection';
import {transform, validate} from 'coralui-util';

const CLASSNAME = 'coral3-BasicList';

/**
 Boolean enumeration for List keyboard interaction state.
 
 @enum {String}
 @memberof Coral.List#
 */
const interaction = {
  /** Keyboard interaction is enabled. */
  ON: 'on',
  /** Keyboard interaction is disabled. */
  OFF: 'off'
};

/**
 @mixin List
 @classdesc The base element for list components
 */
const List = (superClass) => class extends superClass {
  constructor() {
    super();
  
    this._events = {
      'capture:mouseenter [coral-list-item]': '_onItemMouseEnter',
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
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.List#
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new Collection({
        itemTagName: this._itemTagName,
        itemBaseTagName: this._itemBaseTagName,
        itemSelector: '[coral-list-item]',
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
   Whether interaction with the component is enabled.
   
   @type {Coral.List.interaction}
   @default Coral.List.interaction.ON
   @htmlattribute interaction
   @htmlattributereflected
   @memberof Coral.List#
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }
  set interaction(value) {
    value = transform.string(value).toLowerCase();
    
    if (validate.enumeration(interaction)(value)) {
      this._interaction = value;
      transform.reflect(this, 'interaction', this._interaction);
    }
  }
  
  /** @private */
  _onItemMouseEnter(event) {
    // Do not try to focus on disabled items
    if (!event.matchedTarget.hasAttribute('disabled') && this.interaction === interaction.ON) {
      event.matchedTarget.focus();
    }
  }
  
  /**
   Returns true if the event is at the matched target.
   
   @todo this should be moved to Coral.Component
   @private
   */
  _eventIsAtTarget(event) {
    const target = event.target;
    const listItem = event.matchedTarget;
  
    const isAtTarget = (target === listItem);
    
    if (isAtTarget) {
      // Don't let arrow keys etc scroll the page
      event.preventDefault();
      event.stopPropagation();
    }
    
    return isAtTarget;
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
    return this.items.getAll().filter(function(item) {
      return !item.hasAttribute('hidden') && !item.hasAttribute('disabled');
    });
  }
  
  // Expose enumerations
  static get interaction() {return interaction;}
  
  static get observedAttributes() {return ['interaction'];}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._interaction) {this.interaction = interaction.ON;}
  }
};

export default List;
