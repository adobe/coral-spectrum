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

import {ComponentMixin} from '../../../coral-mixin-component';
import '../../../coral-component-tooltip';
import step from '../templates/step';
import {transform, commons} from '../../../coral-utils';
import getTarget from './getTarget';

const CLASSNAME = '_coral-Steplist-item';

/**
 @class Coral.Step
 @classdesc A Step component
 @htmltag coral-step
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Step extends ComponentMixin(HTMLElement) {
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
      insert: function(label) {
        this.appendChild(label);
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
    this.setAttribute('aria-selected', this.selected);
  
    const stepList = this.parentNode;
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
   Inherited from {@link ComponentMixin#trackingElement}.
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
  
  get _contentZones() { return {'coral-step-label': 'label'}; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['selected', 'target']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Generate a unique ID for the Step panel if one isn't already present
    // This will be used for accessibility purposes
    this.setAttribute('id', this.id || commons.getUID());
    
    // A11y
    this.setAttribute('role', 'tab');
    
    const frag = document.createDocumentFragment();
  
    // Discard the template created tooltip if one is provided by markup
    this._elements.tooltip = this.querySelector('coral-tooltip') || this._elements.tooltip;
  
    // Cannot be open by default when rendered
    this._elements.tooltip.removeAttribute('open');
    
    // Render main template
    frag.appendChild(this._elements.stepMarkerContainer);
    frag.appendChild(this._elements.tooltip);
    frag.appendChild(this._elements.line);
    
    const templateHandleNames = ['stepMarkerContainer', 'tooltip', 'line'];
  
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
      }
      else {
        this.removeChild(child);
      }
    }
    
    this.appendChild(frag);
  
    // Link tooltip target
    this._elements.tooltip.target = this._elements.stepMarkerContainer;
    
    // Assign the content zone so the insert function will be called
    this.label = label;
    
    // Measure hybrid potential
    this._isHybrid();
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    // In case it was moved out don't forget to remove it
    if (!this.contains(this._elements.tooltip)) {
      this._elements.tooltip.remove();
    }
  }
}

export default Step;
