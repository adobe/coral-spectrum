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
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-SelectList-item';

/**
 @class Coral.SelectList.Item
 @classdesc A SelectList item component
 @htmltag coral-selectlist-item
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class SelectListItem extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Events
    this.on({
      'focus': '_onFocus',
      'blur': '_onBlur'
    });
  }
  
  /**
   Value of the item. If not explicitly set, the value of <code>Node.textContent</code> is returned.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   @memberof Coral.SelectList.Item#
   */
  get value() {
    return typeof this._value === 'string' ? this._value : this.textContent.replace(/\s{2,}/g, ' ').trim();
  }
  set value(value) {
    this._value = transform.string(value);
    this._reflectAttribute('value', this._value);
  }
  
  /**
   The content element for the item.
   
   @type {HTMLElement}
   @contentzone
   @readonly
   @memberof Coral.SelectList.Item#
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        this[prop] = value[prop];
      }
    }
  }
  
  /** @private **/
  get _isTabTarget() {
    return this.__isTabTarget || false;
  }
  set _isTabTarget(value) {
    this.__isTabTarget = value;
    this.setAttribute('tabindex', this.__isTabTarget ? 0 : -1);
  }
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.SelectList.Item#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this.disabled ? false : this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected);
    
    this.trigger('coral-selectlist-item:_selectedchanged');
  }
  
  /**
   Whether this item is disabled.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.SelectList.Item#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this.setAttribute('aria-disabled', this._disabled);
    
    this.selected = this.selected;
  }
  
  /** @private */
  _onFocus() {
    this.classList.add('is-highlighted');
  }
  
  /** @private */
  _onBlur() {
    this.classList.remove('is-highlighted');
  }
  
  static get observedAttributes() {
    return ['selected', 'disabled'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    this.setAttribute('role', 'option');
  }
}

export default SelectListItem;
