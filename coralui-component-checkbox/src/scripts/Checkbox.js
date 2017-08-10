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

const IS_IE_OR_EDGE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0 ||
  window.navigator.userAgent.indexOf('Edge') !== -1;

const CLASSNAME = 'coral3-Checkbox';

/**
 @class Coral.Checkbox
 @classdesc A Checkbox component
 @htmltag coral-checkbox
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class Checkbox extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
  
    // @polyfill ie
    this._delegateEvents({
      'click': '_onClick',
      'mousedown': '_onMouseDown'
    });
  
    // Prepare templates
    this._elements = {
      // Try to find the label content zone or create one
      label: this.querySelector('coral-checkbox-label') || document.createElement('coral-checkbox-label')
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
   Checked state for the checkbox. When the checked state is changed by user interaction a
   {@link Coral.mixin.formField#event:change} event is triggered.
   
   @type {Boolean}
   @default false
   @htmlattribute checked
   @htmlattributereflected
   @fires Coral.mixin.formField#change
   @memberof Coral.Checkbox#
   */
  get checked() {
    return this._checked || false;
  }
  set checked(value) {
    this._checked = transform.booleanAttr(value);
    this._reflectAttribute('checked', this._checked);
    
    this._elements.input.checked = this._checked;
  }
  
  /**
   Indicates that the checkbox is neither on nor off.
   
   @type {Boolean}
   @default false
   @htmlattribute indeterminate
   @htmlattributereflected
   @memberof Coral.Checkbox#
   */
  get indeterminate() {
    return this._indeterminate || false;
  }
  set indeterminate(value) {
    this._indeterminate = transform.booleanAttr(value);
    this._reflectAttribute('indeterminate', this._indeterminate);
    
    this._elements.input.indeterminate = this._indeterminate;
    this._elements.input[this._indeterminate ? 'setAttribute' : 'removeAttribute']('aria-checked', 'mixed');
  }
  
  /**
   The checkbox's label element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Checkbox#
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-checkbox-label',
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
  
  /** @private */
  _onInputChange(event) {
    // stops the current event
    event.stopPropagation();
  
    this[this._componentTargetProperty] = event.target[this._eventTargetProperty];
  
    // resets the indeterminate state after user interaction
    this.indeterminate = false;
  
    // Explicitly re-emit the change event after the property has been set
    if (this._triggerChangeEvent) {
      // @polyfill ie/edge
      if (IS_IE_OR_EDGE) {
        // We need 1 additional frame in case the indeterminate state is set manually on change event
        window.requestAnimationFrame(function() {
          this.trigger('change');
        }.bind(this));
      }
      else {
        this.trigger('change');
      }
    }
  }
  
  /**
   @private
   @polyfill ie/edge
   */
  _onClick(event) {
    // Force the check/uncheck and trigger the change event since IE won't.
    if (IS_IE_OR_EDGE && this.indeterminate) {
      // Other browsers like Chrome and Firefox will trigger the change event and set indeterminate = false. So we
      // verify if indeterminate was changed and if not, we manually check/uncheck and trigger the change event.
      this.checked = !this.checked;
      this._onInputChange(event);
    }
    // Handle the click() just like the native checkbox
    else if (event.target === this) {
      this.indeterminate = false;
      this.checked = !this.checked;
      this.trigger('change');
    }
  }
  
  /**
   Forces checkbox to receive focus on mousedown
   @ignore
   */
  _onMouseDown() {
    const target = this._elements.input;
    window.requestAnimationFrame(function() {
      if (target !== document.activeElement) {
        target.focus();
      }
    });
  }
  
  /**
   Hide the label if it's empty
   @ignore
   */
  _hideLabelIfEmpty() {
    const label = this._elements.label;
  
    // If it's empty and has no non-textnode children, hide the label
    const hiddenValue = label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '';
  
    // Only bother if the hidden status has changed
    if (hiddenValue !== this._elements.labelWrapper.hidden) {
      this._elements.labelWrapper.hidden = hiddenValue;
    }
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
  get _contentZones() {return {'coral-checkbox-label': 'label'};}
  
  static get observedAttributes() {
    return super.observedAttributes.concat(['indeterminate', 'checked']);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Create a temporary fragment
    const frag = document.createDocumentFragment();
  
    const templateHandleNames = ['input', 'checkbox', 'labelWrapper'];
    
    // Render the main template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.checkbox);
    frag.appendChild(this._elements.labelWrapper);
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }
  
    // Hide the labelWrapper by default (will be shown, via contentZone observer)
    this._elements.labelWrapper.hidden = true;
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        (child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1)) {
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
  
    // Cache the initial checked state of the checkbox (in order to implement reset)
    this._initialCheckedState = this.checked;
  
    // Check if we need to hide the label
    // We must do this because IE does not catch mutations when nodes are not in the DOM
    this._hideLabelIfEmpty();
  }
}

export default Checkbox;
