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
import '../../../coral-component-tooltip';
import step from '../templates/step';
import {transform, commons} from '../../../coral-utils';
import getTarget from './getTarget';
import StepList from './StepList';

const CLASSNAME = '_coral-Steplist-item';

/**
 @class Coral.Step
 @classdesc A Step component
 @htmltag coral-step
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Step extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Fetch or create content zone
    this._elements = {
      label: this.querySelector('coral-step-label') || document.createElement('coral-step-label')
    };
    step.call(this._elements);
  }

  /**
   The label of the step.

   @type {StepLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-step-label',
      insert: function (label) {
        label.classList.add('_coral-Steplist-label');
        this._elements.link.insertBefore(label, this._elements.stepMarkerContainer);
      }
    });
  }

  /**
   Whether the item is selected. When <code>true</code>, the item will appear as the active element in the
   StepList. The item must be a child of a StepList before this property is set to <code>true</code>.

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

    this.classList.toggle('is-selected', this.selected);
    this.removeAttribute('aria-selected');

    if (this.selected) {
      this._elements.link.setAttribute('aria-current', 'step');
    } else {
      this._elements.link.removeAttribute('aria-current');
    }

    const stepList = this.parentElement;
    let realTarget;

    // in case the Step is selected, we need to communicate it to the panels
    if (this._selected) {
      realTarget = getTarget(this.target);
      // if the target was defined at the Step level, it has precedence over everything
      if (realTarget) {
        realTarget.setAttribute('selected', '');
      }
      // we use the target defined at the StepList level
      else if (stepList && stepList.target) {
        realTarget = getTarget(stepList.target);

        if (realTarget) {
          // we get the position of this step inside the steplist
          const currentIndex = stepList.items.getAll().indexOf(this);

          // we select the item with the same index
          const targetItem = (realTarget.items ? realTarget.items.getAll() : realTarget.children)[currentIndex];

          // we select the item if it exists
          if (targetItem) {
            targetItem.setAttribute('selected', '');
          }
        }
      }
    }

    this.trigger('coral-step:_selectedchanged');
  }

  /**
   Whether the item is disabled

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
    this.classList.toggle('is-disabled', this.disabled);
    const stepList = this.parentElement;
    if (stepList) {
      this._syncTabIndex(stepList.interaction === StepList.interaction.ON);
    }
  }

  /**
   Reflects the <code>aria-label</code> attribute to the marker dot for cases where no visible label is provided for the Step.
   @type {?String}
   @default ''
   @htmlattribute labelled
   @htmlattributereflected
   @memberof Coral.Step#
   */
  get labelled() {
    return this._labelled || this.getAttribute('labelled') || this._elements.stepMarkerContainer.getAttribute('aria-label') || '';
  }

  set labelled(value) {
    this._labelled = transform.string(value);
    this._reflectAttribute('labelled', value || false);
    if (this._labelled !== '') {
      this._elements.stepMarkerContainer.setAttribute('aria-label', this._labelled);
      this._elements.stepMarkerContainer.removeAttribute('aria-hidden');
    } else {
      this._elements.stepMarkerContainer.removeAttribute('aria-label');
      if (!this.labelledBy) {
        this._elements.stepMarkerContainer.setAttribute('aria-hidden', 'true');
      }
    }
  }

  /**
   Reflects the <code>aria-labelledby</code> attribute to the marker dot for cases where no visible label is provided for the Step,
   and the Step is labelled by an external element.
   @type {?String}
   @default ''
   @htmlattribute labelledby
   @htmlattributereflected
   @memberof Coral.Step#
   */
  get labelledBy() {
    return this._labelledBy || this.getAttribute('labelledby') || this._elements.stepMarkerContainer.getAttribute('aria-labelledby') || '';
  }

  set labelledBy(value) {
    this._labelledBy = transform.string(value);
    this._reflectAttribute('labelledby', value || false);
    if (this._labelledBy !== '') {
      this._elements.stepMarkerContainer.setAttribute('aria-labelledby', this._labelledBy);
      this._elements.stepMarkerContainer.removeAttribute('aria-hidden');
    } else {
      this._elements.stepMarkerContainer.removeAttribute('aria-labelledby');
      if (!this.labelled) {
        this._elements.stepMarkerContainer.setAttribute('aria-hidden', 'true');
      }
    }
  }

  /**
   Reflects the <code>aria-describedby</code> attribute to the link element.
   @type {?String}
   @default ''
   @htmlattribute describedby
   @htmlattributereflected
   @memberof Coral.Step#
   */
  get describedBy() {
    return this._describedBy || this.getAttribute('describedby') || this._elements.link.getAttribute('aria-describedby') || '';
  }

  set describedBy(value) {
    this._describedBy = transform.string(value);
    this._reflectAttribute('describedby', value || false);
    if (this._describedBy !== '') {
      this._elements.link.setAttribute('aria-describedby', this._describedBy);
    } else {
      this._elements.link.removeAttribute('aria-describedby');
    }
  }

  /**
   The target element that will be selected when this Step is selected. It accepts a CSS selector or a DOM element.
   If a CSS Selector is provided, the first matching element will be used.

   @type {?HTMLElement|String}
   @default null
   @htmlattribute target
   */
  get target() {
    return this._target || null;
  }

  set target(value) {
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;
      const realTarget = getTarget(this._target);

      // we add proper accessibility if available
      if (realTarget) {
        // creates a 2 way binding for accessibility
        this.setAttribute('aria-controls', realTarget.id);
        realTarget.setAttribute('aria-labelledby', this.id);
      }
    }
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.label || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  _isHybrid() {
    const label = this.label;
    const maxWidth = this.label.clientWidth;

    // Required to be able to measure full width
    label.style.position = 'relative';
    label.style.whiteSpace = 'inherit';
    label.style.display = 'inline';

    // Mark it for hybrid mode
    this._labelIsHidden = label.getBoundingClientRect().width > maxWidth;

    // Restore defaults
    label.style.position = '';
    label.style.whiteSpace = '';
    label.style.display = '';
  }

  focus() {
    this._elements.link.focus();
  }

  blur() {
    this._elements.link.blur();
  }

  /** @private */
  _syncTabIndex(isInteractive) {
    // the list item itself should never include a tabindex
    this.removeAttribute('tabindex');

    // when interaction is on, we enable the tabindex so users can tab into the items
    if (isInteractive) {
      this._elements.link.setAttribute('role', 'link');
      if (this.disabled) {
        this._elements.link.removeAttribute('tabindex');
        this._elements.link.setAttribute('aria-disabled', true);
      } else {
        this._elements.link.removeAttribute('aria-disabled');
        this._elements.link.setAttribute('tabindex', this.selected ? '0' : '-1');
      }
    } else {
      // when off, removing the tabindex allows the component to never get focus
      this._elements.link.removeAttribute('tabindex');
      this._elements.link.removeAttribute('role');
    }
  }

  /** @private */
  _syncSizeAndCurrentIndex(currentStep, totalSteps) {
    this.setAttribute('aria-setsize', totalSteps);
    this.setAttribute('aria-posinset', currentStep);
  }

  get _contentZones() {
    return {'coral-step-label': 'label'};
  }

  /** @ignore */
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      labelledby: 'labelledBy',
      describedby: 'describedBy',
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'target', 'disabled', 'labelled', 'labelledby', 'describedby']);
  }

  /** @ignore */
  connectedCallback() {
    if (this._skipConnectedCallback()) {
      return;
    }
    super.connectedCallback();

    const overlay = this._elements.overlay;
    // Cannot be open by default when rendered
    overlay.removeAttribute('open');
    // Restore in DOM
    if (overlay._parent) {
      overlay._parent.appendChild(overlay);
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Generate a unique ID for the Step panel if one isn't already present
    // This will be used for accessibility purposes
    this.setAttribute('id', this.id || commons.getUID());

    // A11y
    this.setAttribute('role', 'listitem');

    const frag = document.createDocumentFragment();

    // Discard the template-created link, accessibilityLabel, stepMarkerContainer, and line if one is provided by markup
    this._elements.link = this.querySelector('[handle="link"]') || this._elements.link;
    this._elements.accessibilityLabel = this.querySelector('[handle="accessibilityLabel"]') || this._elements.accessibilityLabel;
    this._elements.stepMarkerContainer = this.querySelector('[handle="stepMarkerContainer"]') || this._elements.stepMarkerContainer;
    this._elements.line = this.querySelector('[handle="line"]') || this._elements.line;

    // Discard the template-created tooltip if one is provided by markup
    this._elements.overlay = this.querySelector('coral-tooltip') || this._elements.overlay;

    // Render main template
    frag.appendChild(this._elements.link);
    this._elements.link.appendChild(this._elements.stepMarkerContainer);
    this._elements.link.appendChild(this._elements.overlay);
    frag.appendChild(this._elements.line);

    const templateHandleNames = ['link', 'accessibilityLabel', 'stepMarkerContainer', 'overlay', 'line'];

    const label = this._elements.label;

    // Remove it so we can process children
    if (label.parentNode) {
      label.remove();
    }

    while (this.firstChild) {
      const child = this.firstChild;

      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        label.appendChild(child);
      } else {
        this.removeChild(child);
      }
    }

    // Link tooltip target
    this._elements.overlay.target = this._elements.stepMarkerContainer;

    this.appendChild(frag);

    // Assign the content zone so the insert function will be called
    this.label = label;

    // Measure hybrid potential
    this._isHybrid();


    // Sync the tabIndex value an role depending on whether interaction is on.
    const stepList = this.parentElement;
    if (stepList) {
      this._syncTabIndex(stepList.interaction === StepList.interaction.ON);
    }
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._skipDisconnectedCallback()) {
      return;
    }
    super.disconnectedCallback();

    const overlay = this._elements.overlay;
    // In case it was moved out don't forget to remove it
    if (!this.contains(overlay)) {
      overlay._parent = overlay._repositioned ? document.body : this;
      overlay.remove();
    }
  }
}

export default Step;
