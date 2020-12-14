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
import {Icon} from '../../../coral-component-icon';
import base from '../templates/base';
import {transform, commons, i18n} from '../../../coral-utils';

const IS_IE_OR_EDGE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0 ||
  window.navigator.userAgent.indexOf('Edge') !== -1;

const CLASSNAME = '_coral-Checkbox';

/**
 @class Coral.Checkbox
 @classdesc A Checkbox component to be used as a form field.
 @htmltag coral-checkbox
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class Checkbox extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // @polyfill ie
    this._delegateEvents(commons.extend(this._events, {
      click: '_onClick',
      mousedown: '_onMouseDown'
    }));

    // Prepare templates
    this._elements = {
      // Try to find the label content zone or create one
      label: this.querySelector('coral-checkbox-label') || document.createElement('coral-checkbox-label')
    };
    base.call(this._elements, {commons, i18n, Icon});

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
   Checked state for the checkbox.

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
   Indicates that the checkbox is neither on nor off.

   @type {Boolean}
   @default false
   @htmlattribute indeterminate
   @htmlattributereflected
   */
  get indeterminate() {
    return this._indeterminate || false;
  }

  set indeterminate(value) {
    this._indeterminate = transform.booleanAttr(value);
    this._reflectAttribute('indeterminate', this._indeterminate);

    this.classList.toggle('is-indeterminate', this._indeterminate);
    this._elements.input.indeterminate = this._indeterminate;
    this._elements.input[this._indeterminate ? 'setAttribute' : 'removeAttribute']('aria-checked', 'mixed');
  }

  /**
   The checkbox's label element.

   @type {CheckboxLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-checkbox-label',
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

  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }

  set labelledBy(value) {
    super.labelledBy = value;

    this._hideLabelIfEmpty();
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    // it uses the name as the first fallback since it is not localized, otherwise it uses the label
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.name ? `${this.name}=${this.value}` : '') || (this.label || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
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

  /** @private */
  _onInputChange(event) {
    // stops the current event
    event.stopPropagation();

    /** @ignore */
    this[this._componentTargetProperty] = event.target[this._eventTargetProperty];

    // resets the indeterminate state after user interaction
    this.indeterminate = false;

    // Explicitly re-emit the change event after the property has been set
    if (this._triggerChangeEvent) {
      // @polyfill ie/edge
      if (IS_IE_OR_EDGE) {
        // We need 1 additional frame in case the indeterminate state is set manually on change event
        window.requestAnimationFrame(() => {
          this.trigger('change');
        });
      } else {
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

    this._trackEvent(this.checked ? 'checked' : 'unchecked', 'coral-checkbox', event);
  }

  /**
   Forces checkbox to receive focus on mousedown
   @ignore
   */
  _onMouseDown() {
    const target = this._elements.input;
    window.requestAnimationFrame(() => {
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
    const hiddenValue = !(label.children.length === 0 && label.textContent.replace(/\s*/g, '') === '');

    // Toggle the screen reader text
    this._elements.labelWrapper.style.margin = !hiddenValue ? '0' : '';
    this._elements.screenReaderOnly.hidden = !!hiddenValue || !!this.labelledBy || !!this.labelled;
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

  get _contentZones() {
    return {'coral-checkbox-label': 'label'};
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['indeterminate', 'checked']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Create a fragment
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

    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
        label.appendChild(child);
      } else {
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
