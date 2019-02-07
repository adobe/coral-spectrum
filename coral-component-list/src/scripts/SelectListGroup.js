/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coral-mixin-component';
import {SelectableCollection} from '../../../coral-collection';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-SelectList-group';

/**
 @class Coral.SelectList.Group
 @classdesc A SelectList group component
 @htmltag coral-selectlist-group
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class SelectListGroup extends ComponentMixin(HTMLElement) {
  /**
   The label of the group. It reflects the <code>label</code> attribute to the DOM.
   
   @type {String}
   @default ""
   @htmlattribute label
   @htmlattributereflected
   */
  get label() {
    return this._label || '';
  }
  set label(value) {
    this._label = transform.string(value);
    this._reflectAttribute('label', this._label);
  
    this.setAttribute('aria-label', this._label);
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
        itemTagName: 'coral-selectlist-item'
      });
    }
    return this._items;
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['label']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    this.setAttribute('role', 'group');
  }
}

export default SelectListGroup;
