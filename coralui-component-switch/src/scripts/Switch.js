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
import base from '../templates/base';
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-Switch';

/**
 @class Coral.Switch
 @classdesc A Switch component
 @htmltag coral-switch
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class Switch extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
    
    // Make sure the events from the FormField are attached
    this._delegateEvents(this._events);
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements);
  }
  
  /**
   Whether the switch is on or off. Changing the checked value will cause a
   {@link Coral.mixin.formField#event:change} event to be triggered.
   
   @type {Boolean}
   @default false
   @htmlattribute checked
   @htmlattributereflected
   @fires Coral.mixin.formField#change
   @memberof Coral.Switch#
   */
  get checked() {
    return this._checked || false;
  }
  set checked(value) {
    this._checked = transform.booleanAttr(value);
    this._reflectAttribute('checked', this._checked);
    
    this._elements.input.checked = this._checked;
  }
  
  // JSDoc inherited
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.input.name = value;
  }
  
  /**
   The value that will be submitted when the checkbox is checked. Changing this value will not trigger an event.
   
   @type {String}
   @default "on"
   @htmlattribute value
   @memberof Coral.Checkbox#
   */
  get value() {
    return this._elements.input.value || 'on';
  }
  set value(value) {
    this._elements.input.value = value;
  }
  
  // JSDoc inherited
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.setAttribute('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.input.disabled = this._disabled;
  }
  
  // JSDoc inherited
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    this.setAttribute('aria-required', this._required);
    this._elements.input.required = this._required;
  }
  
  // JSDoc inherited
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    
    this.setAttribute('aria-readonly', this._readOnly);
  }
  
  /*
   Indicates to the formField that the 'checked' property needs to be set in this component.
   
   @protected
   */
  get _componentTargetProperty() {return 'checked';}
  
  /*
   Indicates to the formField that the 'checked' property has to be extracted from the event.
   
   @protected
   */
  get _eventTargetProperty() {return 'checked';}
  
  
  // JSDoc inherited
  clear() {
    this.checked = false;
  }
  
  // JSDoc inherited
  reset() {
    this.checked = this._initialCheckedState;
  }
  
  static get observedAttributes() {
    return super.observedAttributes.concat(['checked']);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Create a temporary fragment
    const frag = document.createDocumentFragment();
    
    const templateHandleNames = ['input', 'label'];
  
    // Render the template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.label);
  
    // Clean up
    while (this.firstChild) {
      const child = this.firstChild;
      // Only works if all root template elements have a handle attribute
      if (child.nodeType === Node.TEXT_NODE ||
        (child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1)) {
        // Add non-template elements to the content
        frag.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Append the fragment to the component
    this.appendChild(frag);
  }
}

export default Switch;
