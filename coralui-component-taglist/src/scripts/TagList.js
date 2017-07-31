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
import {Collection} from 'coralui-collection';
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-TagList';
// Collection
const ITEM_TAGNAME = 'coral-tag';

/**
 Extracts the value from the item in case no explicit value was provided.
 @param {HTMLElement} item
 the item whose value will be extracted.
 @returns {String} the value that will be submitted for this item.
 @private
 */
const itemValueFromDOM = function(item) {
  const attr = item.getAttribute('value');
  // checking explicitly for null allows to differentiate between non set values and empty strings
  return attr !== null ? attr : item.textContent.replace(/\s{2,}/g, ' ').trim();
};

/**
 @class Coral.TagList
 @classdesc A TagList component
 @htmltag coral-taglist
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class TagList extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'capture:focus coral-tag': '_onItemFocus',
      'capture:blur coral-tag': '_onItemBlur',
      'key:right coral-tag': '_onNextItemFocus',
      'key:down coral-tag': '_onNextItemFocus',
      'key:pagedown coral-tag': '_onNextItemFocus',
      'key:left coral-tag': '_onPreviousItemFocus',
      'key:up coral-tag': '_onPreviousItemFocus',
      'key:pageup coral-tag': '_onPreviousItemFocus',
      'key:home coral-tag': '_onFirstItemFocus',
      'key:end coral-tag': '_onLastItemFocus',
  
      // Private
      'coral-tag:_valuechanged': '_onTagValueChanged',
      'coral-tag:_connected': '_onTagConnected'
    });
  
    this._itemToFocusAfterDelete = null;
  }
  
  /**
   Changing the values will redefine the component's items.
   
   @type {Array.<String>}
   @memberof Coral.TagList#
   @fires Coral.mixin.formField#change
   */
  get values() {
    return this.items.getAll().map(function(item) {
      return item.value;
    });
  }
  set values(values) {
    if (Array.isArray(values)) {
      this.items.clear();
      
      values.forEach(function(value) {
        const item = new Coral.Tag().set({
          'label': {
            innerHTML: value
          },
          'value': value
        });
    
        this._attachInputToItem(item);
    
        this.items.add(item);
      }.bind(this));
    }
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.TagList#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: ITEM_TAGNAME
      });
    }
    return this._items;
  }

  // JSDoc inherited
  get name() {
    return this._name || '';
  }
  set name(value) {
    this._name = transform.string(value);
    this._reflectAttribute('name', value);
  
    this.items.getAll().forEach(function(item) {
      if (item._input) {
        item._input.name = this._name;
      }
    }.bind(this));
  }
  
  // JSDoc inherited
  get value() {
    const all = this.items.getAll();
    return all.length ? all[0].value : '';
  }
  set value(value) {
    this.items.clear();
  
    if (value) {
      const item = new Coral.Tag().set({
        'label': {
          innerHTML: value
        },
        'value': value
      });
      
      this._attachInputToItem(item);
    
      this.items.add(item);
    }
  }
  
  // JSDoc inherited
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this.items.getAll().forEach(function(item) {
      item[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
      if (item._input) {
        item._input.disabled = this._disabled;
      }
    }.bind(this));
    
    // a11y
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  // JSDoc inherited
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    
    this.items.getAll().forEach(function(item) {
      item.closable = !this._readOnly;
    }.bind(this));
  
    // a11y
    this.setAttribute('aria-readonly', this._readOnly);
  }
  
  // JSDoc inherited
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    // a11y
    this.setAttribute('aria-required', this._required);
  }
  
  /** @private */
  _attachInputToItem(item) {
    if (!item._input) {
      item._input = document.createElement('input');
      item._input.type = 'hidden';
      // We do this so it is recognized by Coral.Tag and handled if cloned
      item._input.setAttribute('handle', 'input');
    }
  
    const input = item._input;
  
    input.disabled = this.disabled;
    input.name = this.name;
    input.value = item.value;
  
    if (!item.contains(input)) {
      item.appendChild(input);
    }
  }
  
  /** @private */
  _onItemConnected(attachedItem) {
    const self = this;
    const items = self.items.getAll();
    
    // Prevents to add duplicates based on the tag value
    const duplicate = items.some(function(tag) {
      if (itemValueFromDOM(tag) === itemValueFromDOM(attachedItem) && tag !== attachedItem) {
        (items.indexOf(tag) < items.indexOf(attachedItem) ? attachedItem : tag).remove();
        return true;
      }
    });
    
    if (duplicate) {
      return;
    }
    
    // create corresponding input field
    this._attachInputToItem(attachedItem);
    
    // adds the role to support accessibility
    attachedItem.setAttribute('role', 'option');
    attachedItem.setAttribute('aria-selected', false);
    attachedItem.setAttribute('tabindex', '-1');
    attachedItem[this.readOnly ? 'removeAttribute' : 'setAttribute']('closable', '');
    
    // add tabindex to first item if none existing
    if (!this.querySelector(`${ITEM_TAGNAME}[tabindex="0"]`)) {
      const first = items[0];
      if (first) {
        first.setAttribute('tabindex', '0');
      }
    }
    
    // Keep a reference on the host in case the tag gets removed
    attachedItem._host = this;
    
    // triggers the Coral.Collection event
    this.trigger('coral-collection:add', {
      item: attachedItem
    });
  }
  
  /** @private */
  _onItemDisconnected(detachedItem) {
    // Cleans the tag from TagList specific values
    detachedItem.removeAttribute('role');
    detachedItem.removeAttribute('aria-selected');
    detachedItem.removeAttribute('tabindex');
    detachedItem._host = undefined;
    
    if (this._itemToFocusAfterDelete) {
      this._itemToFocusAfterDelete.focus();
    }
    
    // triggers the Coral.Collection event
    this.trigger('coral-collection:remove', {
      item: detachedItem
    });
  }
  
  /** @private */
  _onItemFocus(event) {
    if (!this.disabled) {
      this.setAttribute('aria-live', 'polite');
      
      const tag = event.matchedTarget;
      tag.setAttribute('aria-selected', true);
      
      // add tabindex to first item and remove from previous focused item
      this.items.getAll().forEach(function(item) {
        if (item !== tag) {
          item.setAttribute('tabindex', '-1');
        }
      });
      tag.setAttribute('tabindex', '0');
      
      this._setItemToFocusOnDelete(tag);
    }
  }
  
  /** @private */
  _onItemBlur(event) {
    if (!this.disabled) {
      this.setAttribute('aria-live', 'off');
      
      const tag = event.matchedTarget;
      tag.setAttribute('aria-selected', false);
      
      this._setItemToFocusOnDelete(tag);
    }
  }
  
  /** @private */
  _onSiblingItemFocus(event, sibling) {
    if (!this.disabled) {
      event.preventDefault();
      
      let item = event.target[sibling];
      while (item) {
        if (item.tagName.toLowerCase() === ITEM_TAGNAME && !item.hidden) {
          item.focus();
          break;
        }
        else {
          item = item[sibling];
        }
      }
    }
  }
  
  /** @private */
  _onNextItemFocus(event) {
    this._onSiblingItemFocus(event, 'nextElementSibling');
  }
  
  /** @private */
  _onPreviousItemFocus(event) {
    this._onSiblingItemFocus(event, 'previousElementSibling');
  }
  
  /** @private */
  _onFirstItemFocus(event) {
    event.preventDefault();
    const length = this.items.length;
    if (length > 0) {
      this.items.getAll()[0].focus();
    }
  }
  
  /** @private */
  _onLastItemFocus(event) {
    event.preventDefault();
    const length = this.items.length;
    if (length > 0) {
      this.items.getAll()[length - 1].focus();
    }
  }
  
  /** @private */
  _onTagButtonClicked() {
    this.trigger('change');
  }
  
  /** @private */
  _onTagValueChanged(event) {
    event.stopImmediatePropagation();
    
    const tag = event.target;
    if (tag._input) {
      tag._input.value = tag.value;
    }
  }
  
  /** @private */
  _setItemToFocusOnDelete(tag) {
    let itemToFocusAfterDelete = tag.nextElementSibling;
    
    // Next item will be focusable if the focused tag is removed
    while (itemToFocusAfterDelete) {
      if (itemToFocusAfterDelete.tagName.toLowerCase() === ITEM_TAGNAME && !itemToFocusAfterDelete.hidden) {
        this._itemToFocusAfterDelete = itemToFocusAfterDelete;
        return;
      }
      else {
        itemToFocusAfterDelete = itemToFocusAfterDelete.nextElementSibling;
      }
    }
    
    itemToFocusAfterDelete = tag.previousElementSibling;
    // Previous item will be focusable if the focused tag is removed
    while (itemToFocusAfterDelete) {
      if (itemToFocusAfterDelete.tagName.toLowerCase() === ITEM_TAGNAME && !itemToFocusAfterDelete.hidden) {
        this._itemToFocusAfterDelete = itemToFocusAfterDelete;
        break;
      }
      else {
        itemToFocusAfterDelete = itemToFocusAfterDelete.previousElementSibling;
      }
    }
    
    window.requestAnimationFrame(function() {
      if (tag.parentElement !== null && !this.contains(document.activeElement)) {
        itemToFocusAfterDelete = undefined;
      }
    }.bind(this));
  }
  
  // JSDoc inherited
  _getLabellableElement() {
    return this;
  }
  
  /** @private */
  _onTagConnected(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._onItemConnected(item);
  }
  
  // JSDocs inherited
  reset() {
    // reset the values to the initial values
    this.values = this._initialValues;
  }
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'closable',
      'value',
      'quiet',
      'multiline',
      'size',
      'color'
    ]);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    const self = this;
    
    self.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    self.setAttribute('role', 'listbox');
  
    self.setAttribute('aria-live', 'off');
    self.setAttribute('aria-atomic', 'false');
    self.setAttribute('aria-relevant', 'additions');
  
    // Since tagList can have multiple values, we have to store them all to be able to reset them
    if (self.hasAttribute('value')) {
      self._initialValues = [self.getAttribute('value')];
    }
    else {
      self._initialValues = self.items.getAll().map((item) => {
        return itemValueFromDOM(item);
      });
    }
    
    // Prepare items
    this.items.getAll().forEach((item) => {
      self._onItemConnected(item);
    });
  }
}

export default TagList;
