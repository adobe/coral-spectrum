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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {SelectableCollection} from '../../../coralui-collection';
import {transform, validate, commons} from '../../../coralui-util';
import getTarget from './getTarget';

/**
 Enumeration for {@link StepList} interaction options.
 
 @todo support "click only past steps" mode
 
 @typedef {Object} StepListInteractionEnum
 
 @property {String} ON
 Steps can be clicked to visit them.
 @property {String} OFF
 Steps cannot be clicked.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link StepList} sizes.
 
 @typedef {Object} StepListSizeEnum
 
 @property {String} SMALL
 A small-sized StepList.
 @property {String} LARGE
 A large-sized StepList.
 */
const size = {
  SMALL: 'S',
  LARGE: 'L'
};

// the StepList's base classname
const CLASSNAME = '_coral-Steplist';

/**
 @class Coral.StepList
 @classdesc A StepList component that holds a collection of steps.
 @htmltag coral-steplist
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class StepList extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    this._delegateEvents({
      'click > coral-step > [handle="stepMarkerContainer"]': '_onStepClick',
      'click > coral-step > coral-step-label': '_onStepClick',
      'click > coral-step': '_onStepClick',
  
      'capture:focus > coral-step': '_onStepMouseEnter',
      'capture:mouseenter > coral-step > [handle="stepMarkerContainer"]': '_onStepMouseEnter',
      'capture:blur > coral-step': '_onStepMouseLeave',
      'capture:mouseleave > coral-step > [handle="stepMarkerContainer"]': '_onStepMouseLeave',
  
      'key:enter > coral-step': '_onStepKeyboardSelect',
      'key:space > coral-step': '_onStepKeyboardSelect',
      'key:home > coral-step': '_onHomeKey',
      'key:end > coral-step': '_onEndKey',
      'key:pagedown > coral-step': '_selectNextItem',
      'key:right > coral-step': '_selectNextItem',
      'key:down > coral-step': '_selectNextItem',
      'key:pageup > coral-step': '_selectPreviousItem',
      'key:left > coral-step': '_selectPreviousItem',
      'key:up > coral-step': '_selectPreviousItem',
      
      // private
      'coral-step:_selectedchanged': '_onItemSelectedChanged'
    });
  
    // Used for eventing
    this._oldSelection = null;
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // we do lazy initialization of the collection
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-step',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
    
    return this._items;
  }
  
  /**
   Returns the selected step.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /**
   The target component that will be linked to the StepList. It accepts either a CSS selector or a DOM element. If
   a CSS Selector is provided, the first matching element will be used. Items will be selected based on the index.
   If both target and {@link Coral.Step#target} are set, the second will have higher priority.
   
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
  
      const self = this;
      // we do this in the sync in case the target was not yet in the DOM
      window.requestAnimationFrame(() => {
        const realTarget = getTarget(self._target);
  
        // we add proper accessibility if available
        if (realTarget) {
          const stepItems = self.items.getAll();
          const panelItems = realTarget.items ? realTarget.items.getAll() : realTarget.children;
    
          // we need to add a11y to all components, regardless of whether they can be perfectly paired
          const maxItems = Math.max(stepItems.length, panelItems.length);
    
          let step;
          let panel;
          for (let i = 0; i < maxItems; i++) {
            step = stepItems[i];
            panel = panelItems[i];
      
            // if the step has its own target, we assume the target component will handle its own accessibility.
            // if the target is an empty string we simply ignore it
            if (step && step.target && step.target.trim() !== '') {
              continue;
            }
      
            if (step && panel) {
              // sets the required ids
              step.id = step.id || commons.getUID();
              panel.id = panel.id || commons.getUID();
        
              // creates a 2 way binding for accessibility
              step.setAttribute('aria-controls', panel.id);
              panel.setAttribute('aria-labelledby', step.id);
            }
            else if (step) {
              // cleans the aria since there is no matching panel
              step.removeAttribute('aria-controls');
            }
            else {
              // cleans the aria since there is no matching Step
              panel.removeAttribute('aria-labelledby');
            }
          }
        }
      });
    }
  }
  
  /**
   The size of the StepList. It accepts both lower and upper case sizes. Currently only "S" and "L" (the default)
   are available.
   See {@link StepListSizeEnum}.
   
   @type {String}
   @default StepListSizeEnum.LARGE
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.LARGE;
  }
  set size(value) {
    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.LARGE;
    this._reflectAttribute('size', this._size);
  
    this.classList.toggle(`${CLASSNAME}--small`, this._size === size.SMALL);
  }
  
  /**
   Whether Steps should be interactive or not. When interactive, a Step can be clicked to jump to it.
   See {@link StepListInteractionEnum}.
   
   @type {String}
   @default StepListInteractionEnum.OFF
   @htmlattribute interaction
   @htmlattributereflected
   */
  get interaction() {
    return this._interaction || interaction.OFF;
  }
  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.OFF;
    this._reflectAttribute('interaction', this._interaction);
  
    const isInteractive = this._interaction === interaction.ON;
    this.classList.toggle(`${CLASSNAME}--interactive`, isInteractive);
  
    const steps = this.items.getAll();
    const stepsCount = steps.length;
  
    // update tab index for all children
    for (let i = 0; i < stepsCount; i++) {
      this._syncItemTabIndex(steps[i]);
    }
  }
  
  /** @private */
  _syncItemTabIndex(item) {
    // when interaction is on, we enable the tabindex so users can tab into the items
    if (this.interaction === interaction.ON) {
      item.setAttribute('tabindex', item.hasAttribute('selected') ? '0' : '-1');
      item.removeAttribute('aria-readonly');
    }
    else {
      // when off, removing the tabindex allows the component to never get focus
      item.removeAttribute('tabindex');
      item.setAttribute('aria-readonly', 'true');
    }
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
  
    const item = event.target;
    
    this._syncItemTabIndex(item);
    this._validateSelection(item);
  }
  
  /** @private */
  _validateSelection(item) {
    // gets the current selection
    const selection = this.items._getAllSelected();
    const selectionCount = selection.length;
    
    // if no item is currently selected, we need to find a candidate
    if (selectionCount === 0) {
      // gets the first candidate for selection
      const selectable = this.items._getFirstSelectable();
      
      if (selectable) {
        selectable.setAttribute('selected', '');
      }
    }
    // more items are selected, so we find a single item and deselect everything else
    else if (selectionCount > 1) {
      // By default, the last one stays selected
      item = item || selection[selection.length - 1];
      
      for (let i = 0; i < selectionCount; i++) {
        if (selection[i] !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selection[i].removeAttribute('selected');
        }
      }
  
      // We can trigger change events again
      this._preventTriggeringEvents = false;
    }
  
    // sets the state-related classes every time the selection changes
    this._setStateClasses();
  
    if (this._allChildrenAdded) {
      this._updateLabels();
    }
  
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-steplist:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @private */
  _setStateClasses() {
    let selectedItemIndex = Infinity;
    this.items.getAll().forEach((item, index) => {
      // Use attribute instead of property as items might not be initialized
      if (item.hasAttribute('selected')) {
        // Mark which one is selected
        selectedItemIndex = index;
      }
    
      // Add/remove classes based on index
      item.classList.toggle('is-complete', index < selectedItemIndex);
    });
  }
  
  /** @private */
  _onStepKeyboardSelect(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
      event.stopPropagation();
      
      const item = event.matchedTarget;
      this._selectAndFocusItem(item);
    }
  }
  
  /** @private */
  _onStepClick(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
      event.stopPropagation();
      
      const item = event.matchedTarget.closest('coral-step');
      this._selectAndFocusItem(item);
    }
  }
  
  /** @private */
  _onStepMouseEnter() {
    if (this.size === size.SMALL || this._isHybridMode) {
      const step = event.target.closest('coral-step');
      if (step.hasAttribute('selected') && this._isHybridMode) {
        return;
      }
    
      // we only show the tooltip if we have a label to show
      if (step._elements.label.innerHTML.trim() !== '') {
        step._elements.tooltip.content.innerHTML = step._elements.label.innerHTML;
        step._elements.tooltip.open = true;
      }
    }
  }
  
  /** @private */
  _onStepMouseLeave(event) {
    if (this.size === size.SMALL || this._isHybridMode) {
      const step = event.target.closest('coral-step');
      step._elements.tooltip.open = false;
    }
  }
  
  /** @private */
  _onHomeKey(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
      
      const item = this.items._getFirstSelectable();
      this._selectAndFocusItem(item);
    }
  }
  
  /** @private */
  _onEndKey(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
    
      const item = this.items._getLastSelectable();
      this._selectAndFocusItem(item);
    }
  }
  
  /** @private */
  _selectNextItem(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
    
      this.next();
    }
  }
  
  /** @private */
  _selectPreviousItem(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
    
      this.previous();
    }
  }
  
  /** @private */
  _selectAndFocusItem(item) {
    if (item) {
      item.setAttribute('selected', '');
      item.focus();
    }
  }
  
  /** @private */
  _setHybridLabel(item) {
    if (this._isHybridMode) {
      const items = this.items.getAll();
      const itemIndex = items.indexOf(item);
      const middle = items.length / 2;
      const stepSize = 120;
  
      // Position item label
      const marginLeft = (middle - itemIndex) * stepSize - stepSize / 2;
      item.label.style.marginLeft = `${marginLeft}px`;
  
      // Indicate item index
      item.label.dataset.coralStepIndex = ` (${(itemIndex + 1)}/${items.length})`;
    }
  }
  
  /** @private */
  _updateLabels() {
    let hasOversizedLabel = false;
    const hybridClass = `${CLASSNAME}--hybrid`;
    
    this._isHybridMode = false;
    this.classList.remove(hybridClass);
  
    // when the steplist is small no check is needed
    if (this.size === size.SMALL) {
      return;
    }
  
    // Check if one label is oversized
    const steps = this.items.getAll();
    const stepsCount = steps.length;
    let actualStep;
    
    for (actualStep = 0; actualStep < stepsCount; actualStep++) {
      if (steps[actualStep]._labelIsHidden) {
        hasOversizedLabel = true;
        this._isHybridMode = true;
        this.classList.add(hybridClass);
        
        break;
      }
    }
  
    for (actualStep = 0; actualStep < stepsCount; actualStep++) {
      if (steps[actualStep].label) {
        steps[actualStep].label.hidden = !(steps[actualStep].hasAttribute('selected') || !hasOversizedLabel);
      }
    }
    
    this._setHybridLabel(this.selectedItem);
  }
  
  /**
   Show the next Step.
   
   @emits {coral-steplist:change}
   */
  next() {
    let item = this.selectedItem;
    if (item) {
      item = this.items._getNextSelectable(item);
      this._selectAndFocusItem(item);
    }
  }
  
  /**
   Show the previous Step.
   
   @emits {coral-steplist:change}
   */
  previous() {
    let item = this.selectedItem;
    if (item) {
      item = this.items._getPreviousSelectable(item);
      this._selectAndFocusItem(item);
    }
  }
  
  /**
   Returns {@link StepList} sizes.
   
   @return {StepListSizeEnum}
   */
  static get size() { return size; }
  
  /**
   Returns {@link StepList} interaction options.
   
   @return {StepListInteractionEnum}
   */
  static get interaction() { return interaction; }
  
  /** @ignore */
  static get observedAttributes() { return ['target', 'size', 'interaction']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._interaction) { this.interaction = interaction.OFF; }
    if (!this._size) { this.size = size.LARGE; }
    
    // A11y
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-multiselectable', 'false');
  
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
    
    const self = this;
    window.customElements.whenDefined('coral-step').then(() => {
      self._allChildrenAdded = true;
      // Force label update
      self._updateLabels();
    });
  }
  
  /**
   Triggered when the {@link StepList} selected {@link Step} has changed.
   
   @typedef {CustomEvent} coral-steplist:change
   
   @property {Step} detail.selection
   The newly selected Step.
   @property {Step} detail.oldSelection
   The previously selected Step.
   */
}

export default StepList;
