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

import {ComponentMixin} from '/coralui-mixin-component';
import '/coralui-component-tooltip';
import step from '../templates/step';
import {transform, commons} from '/coralui-util';
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
   
   @type {HTMLElement}
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
  static get observedAttributes() { return ['selected', 'target']; }
  
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
  
    // Assign the content zone so the insert function will be called
    this.label = label;
    
    // Measure hybrid potential
    this._isHybrid();
  }
}

export default Step;
