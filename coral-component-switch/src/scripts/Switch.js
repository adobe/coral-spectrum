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
import base from '../templates/base';
import {transform, commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-ToggleSwitch';

/**
 @class Coral.Switch
 @classdesc A Switch component is a toggle form field similar to a Checkbox component.
 @htmltag coral-switch
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Switch extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Make sure the events from the FormField are attached
    this._delegateEvents(commons.extend(this._events, {
      'capture:focus ._coral-ToggleSwitch-input': '_onFocus',
      'capture:blur ._coral-ToggleSwitch-input': '_onBlur'
    }));

    // Prepare templates
    this._elements = {
      // Try to find the label content zone
      label: this.querySelector('coral-switch-label') || document.createElement('coral-switch-label')
    };
    base.call(this._elements, {commons, i18n});

    // Pre-define labellable element
    this._labellableElement = this._elements.input;

    // Check if the label is empty whenever we get a mutation
    this._observer = new MutationObserver(this._hideLabelIfEmpty.bind(this));

    // Watch for changes to the label element's children
    this._observer.observe(this._elements.labelWrapper, {
      // Catch changes to childList
      childList: true,
      // Catch changes to textContent
      characterData: true,
      // Monitor any child node
      subtree: true
    });
  }

  /**
   Whether the switch is on or off.

   @type {Boolean}
   @default false
   @htmlattribute checked
   @htmlattributereflected
   @emits {change}
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
   The switch's label element.

   @type {SwitchLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-switch-label',
      insert: function (label) {
        this._elements.labelWrapper.appendChild(label);
      }
    });
  }

  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
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
   */
  get value() {
    return this._elements.input.value || 'on';
  }

  set value(value) {
    this._elements.input.value = value;
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

    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.input.disabled = this._disabled;
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

    this._elements.input.required = this._required;
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

    this.classList.toggle('is-readOnly', this._readOnly);
    this._elements.input.tabIndex = this._readOnly ? -1 : 0;
  }

  /**
   Inherited from {@link BaseFormField#labelled}.
   */
  get labelled() {
    return super.labelled;
  }

  set labelled(value) {
    super.labelled = value;

    this._hideLabelIfEmpty();
  }

  /*
   Indicates to the formField that the 'checked' property needs to be set in this component.

   @protected
   */
  get _componentTargetProperty() {
    return 'checked';
  }

  /*
   Indicates to the formField that the 'checked' property has to be extracted from the event.

   @protected
   */
  get _eventTargetProperty() {
    return 'checked';
  }

  /**
   Hide the label if it's empty.

   @ignore
   */
  _hideLabelIfEmpty() {
    const label = this._elements.label;

    // If it's empty and has no non-textnode children, hide the label
    const hiddenValue = !(label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '');

    // Toggle the screen reader text
    this._elements.labelWrapper.style.margin = !hiddenValue ? '0' : '';
    this._elements.screenReaderOnly.hidden = hiddenValue || this.labelled;
  }

  _onFocus() {
    this._elements.input.classList.add('focus-ring');
  }

  _onBlur() {
    this._elements.input.classList.remove('focus-ring');
  }

  get _contentZones() {
    return {'coral-switch-label': 'label'};
  }

  /**
   Inherited from {@link BaseFormField#clear}.
   */
  clear() {
    this.checked = false;
  }

  /**
   Inherited from {@link BaseFormField#reset}.
   */
  reset() {
    this.checked = this._initialCheckedState;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['checked']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Create a fragment
    const frag = document.createDocumentFragment();

    const templateHandleNames = ['input', 'switch', 'labelWrapper'];

    // Render the template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.switch);
    frag.appendChild(this._elements.labelWrapper);

    const label = this._elements.label;

    // Remove it so we can process children
    if (label && label.parentNode) {
      label.parentNode.removeChild(label);
    }

    // Clean up
    while (this.firstChild) {
      const child = this.firstChild;
      // Only works if all root template elements have a handle attribute
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the content
        label.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Append the fragment to the component
    this.appendChild(frag);

    // Assign the content zones, moving them into place in the process
    this.label = label;

    // Cache the initial checked state of the switch (in order to implement reset)
    this._initialCheckedState = this.checked;

    // Check if we need to hide the label
    // We must do this because IE does not catch mutations when nodes are not in the DOM
    this._hideLabelIfEmpty();
  }
}

export default Switch;
