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
import Tag from './Tag';
import {Collection} from '../../../coral-collection';
import {transform, commons} from '../../../coral-utils';

const CLASSNAME = '_coral-Tags';
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
 @classdesc A TagList component is a form field container to manipulate tags.
 @htmltag coral-taglist
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class TagList extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents(commons.extend(this._events, {
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
      
      // Accessibility
      'capture:focus coral-tag:not(.is-disabled)': '_onItemFocusIn',
      'capture:blur coral-tag:not(.is-disabled)': '_onItemFocusOut',
      
      // Private
      'coral-tag:_valuechanged': '_onTagValueChanged',
      'coral-tag:_connected': '_onTagConnected'
    }));
  
    // Pre-define labellable element
    this._labellableElement = this;
  
    this._itemToFocusAfterDelete = null;
  }
  
  /**
   Changing the values will redefine the component's items.
   
   @type {Array.<String>}
   @emits {change}
   */
  get values() {
    return this.items.getAll().map((item) => item.value);
  }
  set values(values) {
    if (Array.isArray(values)) {
      this.items.clear();
      
      values.forEach((value) => {
        const item = new Tag().set({
          label: {
            innerHTML: value
          },
          value: value
        });
    
        this._attachInputToItem(item);
    
        this.items.add(item);
      });
    }
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {Collection}
   @readonly
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
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._name || '';
  }
  set name(value) {
    this._name = transform.string(value);
    this._reflectAttribute('name', value);
  
    this.items.getAll().forEach((item) => {
      if (item._input) {
        item._input.name = this._name;
      }
    });
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    const all = this.items.getAll();
    return all.length ? all[0].value : '';
  }
  set value(value) {
    this.items.clear();
  
    if (value) {
      const item = new Tag().set({
        label: {
          innerHTML: value
        },
        value: value
      });
      
      this._attachInputToItem(item);
    
      this.items.add(item);
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
    
    this.items.getAll().forEach((item) => {
      item.classList.toggle('is-disabled', this._disabled);
      if (item._input) {
        item._input.disabled = this._disabled;
      }
    });
    
    // a11y
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
  }
  
  // JSDoc inherited
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
  
    this.items.getAll().forEach((item) => {
      item.classList.toggle('is-invalid', this._invalid);
    });
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
    
    this.items.getAll().forEach((item) => {
      item.closable = !this._readOnly;
    });
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
  _prepareItem(attachedItem) {
    const items = this.items.getAll();
    
    // Prevents to add duplicates based on the tag value
    const duplicate = items.some((tag) => {
      if (itemValueFromDOM(tag) === itemValueFromDOM(attachedItem) && tag !== attachedItem) {
        (items.indexOf(tag) < items.indexOf(attachedItem) ? attachedItem : tag).remove();
        return true;
      }
      
      return false;
    });
    
    if (duplicate) {
      return;
    }
    
    // create corresponding input field
    this._attachInputToItem(attachedItem);
    
    // Set tag defaults
    attachedItem.setAttribute('color', Tag.color.DEFAULT);
    attachedItem.setAttribute('size', Tag.size.SMALL);
    
    // adds the role to support accessibility
    attachedItem.setAttribute('role', 'row');
    if (!this.disabled) {
      attachedItem.setAttribute('tabindex', '-1');
    }
    attachedItem[this.readOnly ? 'removeAttribute' : 'setAttribute']('closable', '');
    
    // add tabindex to first item if none existing
    if (!this.disabled && !this.querySelector(`${ITEM_TAGNAME}[tabindex="0"]`)) {
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
    detachedItem.removeAttribute('tabindex');
    detachedItem._host = undefined;

    const parentElement = this.parentElement;
    if (this.items.length === 0 && parentElement) {
      // If all tags are removed, call focus method on parent element
      if (typeof parentElement.focus === 'function') {
        parentElement.focus();
      }

      const self = this;

      commons.nextFrame(() => {
        // if the parentElement did not receive focus or move focus to some other element
        if (document.activeElement.tagName === 'BODY') {
          if (this.items.length > 0) {
            self.items.first().focus();
          }
          else {
            // make the TagList focusable
            self.tabIndex = -1;
            self.classList.add('u-coral-screenReaderOnly');
            self.style.outline = '0';
            self.innerHTML = ' ';
            const onBlurFocusManagement = function() {
              self.removeAttribute('tabindex');
              self.classList.remove('u-coral-screenReaderOnly');
              self.style.outline = '';
              self.innerHTML = '';
              self._vent.off('blur.focusManagement');
            };
            self._vent.on('blur.focusManagement', null, onBlurFocusManagement); 
            if (!parentElement.contains(document.activeElement)) {
              self.focus();
            }
            else {
              onBlurFocusManagement();
            }
          }
        }
      });
    }
    else if (this._itemToFocusAfterDelete) {
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
      
      // add tabindex to first item and remove from previous focused item
      this.items.getAll().forEach((item) => {
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
  
  _onItemFocusIn(event) {
    event.matchedTarget.classList.add('focus-ring');
  }
  
  _onItemFocusOut(event) {
    event.matchedTarget.classList.remove('focus-ring');
  }
  
  /** @private */
  _onTagButtonClicked(item, event) {
    this.trigger('change');
  
    this._trackEvent('remove', 'coral-tag', event, item);
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
      
      itemToFocusAfterDelete = itemToFocusAfterDelete.nextElementSibling;
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
    
    window.requestAnimationFrame(() => {
      if (tag.parentElement !== null && !this.contains(document.activeElement)) {
        itemToFocusAfterDelete = undefined;
      }
    });
  }
  
  /** @private */
  _onTagConnected(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._prepareItem(item);
  }
  
  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    // reset the values to the initial values
    this.values = this._initialValues;
  }
  
  /** @ignore */
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
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    this.setAttribute('role', 'grid');
  
    this.setAttribute('aria-live', 'off');
    this.setAttribute('aria-atomic', 'false');
    this.setAttribute('aria-relevant', 'additions');
  
    // Since tagList can have multiple values, we have to store them all to be able to reset them
    if (this.hasAttribute('value')) {
      this._initialValues = [this.getAttribute('value')];
    }
    else {
      this._initialValues = this.items.getAll().map((item) => itemValueFromDOM(item));
    }
    
    // Prepare items
    this.items.getAll().forEach((item) => {
      this._prepareItem(item);
    });
  }
}

export default TagList;
