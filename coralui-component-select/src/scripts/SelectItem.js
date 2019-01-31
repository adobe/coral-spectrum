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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {transform} from '../../../coralui-utils';

/**
 @class Coral.Select.Item
 @classdesc A Select item component
 @htmltag coral-select-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class SelectItem extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    this._observer = new MutationObserver(this._handleMutation.bind(this));
    this._observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }
  
  /**
   Item content element.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether this item is disabled. When set to <code>true</code>, this will prevent every user interaction with the
   item. If disabled is set to <code>true</code> for a selected item it will be deselected.
   
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
    
    this.trigger('coral-select-item:_disabledchanged');
  }
  
  /**
   Whether the item is selected. Selected cannot be set to <code>true</code> if the item is disabled.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.trigger('coral-select-item:_selectedchanged');
  }
  
  /**
   Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    // keep spaces to only 1 max and trim to mimic native select option behavior
    return typeof this._value === 'undefined' ? this.textContent.replace(/\s{2,}/g, ' ').trim() : this._value;
  }
  set value(value) {
    this._value = transform.string(value);
    this._reflectAttribute('value', this._value);
    
    this.trigger('coral-select-item:_valuechanged');
  }
  
  /**
   Inherited from {@link ComponentMixin#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      this.value || this.textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }
  set trackingElement(value) {
    super.trackingElement = value;
  }
  
  /** @private */
  _handleMutation() {
    this.trigger('coral-select-item:_contentchanged', {
      content: this.textContent
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'value']);
  }
}

export default SelectItem;
