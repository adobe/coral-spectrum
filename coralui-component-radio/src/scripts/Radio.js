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

const CLASSNAME = 'coral3-Radio';

/**
 @class Coral.Radio
 @classdesc A Radio component
 @htmltag coral-radio
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class Radio extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
    
    this._delegateEvents({
      'click': '_onClick',
      'mousedown': '_onMouseDown'
    });
    
    // Prepare templates
    this._elements = {
      // Try to find the label content zone
      label: this.querySelector('coral-radio-label') || document.createElement('coral-radio-label')
    };
    base.call(this._elements);
  
    // Check if the label is empty whenever we get a mutation
    this._observer = new MutationObserver(this._hideLabelIfEmpty.bind(this));
  
    // Watch for changes to the label element's children
    this._observer.observe(this._elements.labelWrapper, {
      childList: true, // Catch changes to childList
      characterData: true, // Catch changes to textContent
      subtree: true // Monitor any child node
    });
  }
  
  /**
   Checked state for the radio, <code>true</code> is checked and <code>false</code> is unchecked. Changing the
   checked value will cause a {@link Coral.mixin.formField.event:change} event to be triggered.
   
   @type {Boolean}
   @default false
   @htmlattribute checked
   @htmlattributereflected
   @fires Coral.mixin.formField#change
   @memberof Coral.Radio#
   */
  get checked() {
    return this._checked || false;
  }
  set checked(value) {
    this._checked = transform.booleanAttr(value);
    this._reflectAttribute('checked', this._checked);
    
    this._elements.input.checked = this._checked;
  
    // handles related radios
    this._syncRelatedRadios();
  }
  
  /**
   The radios's label element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Radio#
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-radio-label',
      insert: function(label) {
        this._elements.labelWrapper.appendChild(label);
      }
    });
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
   The value this radio should submit when checked. Changing this value will not trigger an event.
   
   @type {String}
   @default "on"
   @htmlattribute value
   @memberof Coral.Radio#
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
  
  /**
   Takes care of keeping the checked property up to date, by unchecking every radio that has the same name. This is
   only done if the radio is already in the DOM, it has a name and it is checked, otherwise this is not needed.
 
   @ignore
   */
  _syncRelatedRadios() {
    // if the radio has a name defined and it is checked, we need to ensure that other radios that share the name
    // are not checked.
    if (this.parentNode !== null && this.name && this.checked) {
      // queries the document for all the coral-radios with the same name
      const items = document.querySelectorAll(this.tagName + '[name=' + JSON.stringify(this.name) + ']');
      const  itemCount = items.length;
    
      for (let i = 0; i < itemCount; i++) {
        if (items[i] !== this) {
          // we uncheck all other radios with the same name
          items[i].removeAttribute('checked');
        }
      }
    }
  }
  
  /**
   Hide the label if it's empty.
 
   @ignore
   */
  _hideLabelIfEmpty() {
    const label = this.label;
    // If it's empty and has no non-textnode children, hide the label
    const hiddenValue = label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '';
    // Only bother if the hidden status has changed
    if (hiddenValue !== this._elements.labelWrapper.hidden) {
      this._elements.labelWrapper.hidden = hiddenValue;
    }
  }
  
  /**
   @private
   */
  _onClick(event) {
    // Handle the click() just like the native radio
    if (event.target === this && !this.checked) {
      this.checked = true;
      this.trigger('change');
    }
  }
  
  /**
   Forces radio to receive focus on mousedown
   @ignore
   */
  _onMouseDown() {
    const target = this._elements.input;
    requestAnimationFrame(() => {
      if (target !== document.activeElement) {
        target.focus();
      }
    });
  }
  
  // JSDoc inherited
  clear() {
    this.checked = false;
  }
  
  // JSDoc inherited
  reset() {
    this.checked = this._initialCheckedState;
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.label;}
  set defaultContentZone(value) {this.label = value;}
  get _contentZones() {return {'coral-radio-label': 'label'};}
  
  static get observedAttributes() {
    return super.observedAttributes.concat(['checked']);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Create a temporary fragment
    const frag = document.createDocumentFragment();
  
    const templateHandleNames = ['input', 'checkmark', 'labelWrapper'];
  
    // Render the main template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.checkmark);
    frag.appendChild(this._elements.labelWrapper);
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label && label.parentNode) {
      label.parentNode.removeChild(label);
    }
  
    // Hide the labelWrapper by default (will be shown, via contentZone observer)
    this._elements.labelWrapper.hidden = true;
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        label.appendChild(child);
      }
      else {
        // Remove anything else (e.g labelWrapper)
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(frag);
  
    // Assign the content zones, moving them into place in the process
    this.label = label;
  
    // Cache the initial checked state of the radio button (in order to implement reset)
    this._initialCheckedState = this.checked;
  
    // handles the case where the attached component was checked
    this._syncRelatedRadios();
  
    // Check if we need to hide the label
    // We must do this because IE does not catch mutations when nodes are not in the DOM
    this._hideLabelIfEmpty();
  }
}

export default Radio;
