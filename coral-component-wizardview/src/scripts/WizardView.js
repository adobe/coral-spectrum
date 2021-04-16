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
import {Collection} from '../../../coral-collection';
import '../../../coral-component-steplist';
import '../../../coral-component-panelstack';
import {commons} from '../../../coral-utils';

const CLASSNAME = '_coral-WizardView';

/**
 @class Coral.WizardView
 @classdesc A WizardView component is the wrapping container used to create the typical Wizard pattern. This is intended
 to be used with a {@link StepList} and a {@link PanelStack}.
 @htmltag coral-wizardview
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class WizardView extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._delegateEvents({
      'capture:click coral-steplist[coral-wizardview-steplist] > coral-step': '_onStepClick',
      'coral-steplist:change coral-steplist[coral-wizardview-steplist]': '_onStepListChange',
      'click [coral-wizardview-previous]': '_onPreviousClick',
      'click [coral-wizardview-next]': '_onNextClick'
    });

    // Init the collection mutation observer
    this.stepLists._startHandlingItems(true);
    this.panelStacks._startHandlingItems(true);

    // Disable tracking for specific elements that are attached to the component.
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Sync added nodes
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];

          if (addedNode.setAttribute &&
            (
              addedNode.hasAttribute('coral-wizardview-next') ||
              addedNode.hasAttribute('coral-wizardview-previous') ||
              addedNode.hasAttribute('coral-wizardview-steplist') ||
              addedNode.hasAttribute('coral-wizardview-panelstack')
            )) {
            addedNode.setAttribute('tracking', 'off');
          }
        }
      });
    });

    this._observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  /**
   The set of controlled PanelStacks. Each PanelStack must have the <code>coral-wizardview-panelstack</code> attribute.

   @type {Collection}
   @readonly
   */
  get panelStacks() {
    // Construct the collection on first request:
    if (!this._panelStacks) {
      this._panelStacks = new Collection({
        host: this,
        itemTagName: 'coral-panelstack',
        // allows panelstack to be nested
        itemSelector: ':scope > coral-panelstack[coral-wizardview-panelstack]',
        onItemAdded: this._onItemAdded
      });
    }

    return this._panelStacks;
  }

  /**
   The set of controlling StepLists. Each StepList must have the <code>coral-wizardview-steplist</code> attribute.

   @type {Collection}
   @readonly
   */
  get stepLists() {
    // Construct the collection on first request:
    if (!this._stepLists) {
      this._stepLists = new Collection({
        host: this,
        itemTagName: 'coral-steplist',
        // allows steplist to be nested
        itemSelector: ':scope > coral-steplist[coral-wizardview-steplist]',
        onItemAdded: this._onItemAdded
      });
    }

    return this._stepLists;
  }

  /**
   Called by the Collection when an item is added

   @private
   */
  _onItemAdded(item) {
    this._selectItemByIndex(item, this._getSelectedIndex());
  }

  _onStepClick(event) {
    this._trackEvent('click', 'coral-wizardview-steplist-step', event, event.matchedTarget);
  }

  /**
   Handles the next button click.

   @private
   */
  _onNextClick(event) {
    // we stop propagation in case the wizard views are nested
    event.stopPropagation();

    this.next();

    const stepList = this.stepLists.first();
    const step = stepList.items.getAll()[this._getSelectedIndex()];
    this._trackEvent('click', 'coral-wizardview-next', event, step);
  }

  /**
   Handles the previous button click.

   @private
   */
  _onPreviousClick(event) {
    // we stop propagation in case the wizard views are nested
    event.stopPropagation();

    this.previous();

    const stepList = this.stepLists.first();
    const step = stepList.items.getAll()[this._getSelectedIndex()];
    this._trackEvent('click', 'coral-wizardview-previous', event, step);
  }

  /**
   Detects a change in the StepList and triggers an event.

   @private
   */
  _onStepListChange(event) {
    // Stop propagation of the events to support nested panels
    event.stopPropagation();

    // Get the step number
    const index = event.target.items.getAll().indexOf(event.detail.selection);

    // Sync the other StepLists
    this._selectStep(index);

    this.trigger('coral-wizardview:change', {
      selection: event.detail.selection,
      oldSelection: event.detail.oldSelection
    });

    this._trackEvent('change', 'coral-wizardview', event);
  }

  /** @private */
  _getSelectedIndex() {
    const stepList = this.stepLists.first();
    if (!stepList) {
      return -1;
    }

    let stepIndex = -1;
    if (stepList.items) {
      stepIndex = stepList.items.getAll().indexOf(stepList.selectedItem);
    } else {
      // Manually get the selected step
      const steps = stepList.querySelectorAll('coral-step');

      // Find the last selected step
      for (let i = steps.length - 1 ; i >= 0 ; i--) {
        if (steps[i].hasAttribute('selected')) {
          stepIndex = i;
          break;
        }
      }
    }

    return stepIndex;
  }

  /**
   Select the step according to the provided index.

   @param {*} component
   The StepList or PanelStack to select the step on.
   @param {Number} index
   The index of the step that should be selected.

   @private
   */
  _selectItemByIndex(component, index) {
    let item = null;

    // we need to set an id to be able to find direct children
    component.id = component.id || commons.getUID();

    // if collection api is available we use it to find the correct item
    if (component.items) {
      // Get the corresponding item
      item = component.items.getAll()[index];
    }
    // Resort to querying manually on immediately children
    else if (component.tagName === 'CORAL-STEPLIST') {
      // @polyfill IE - we use id since :scope is not supported
      item = component.querySelectorAll(`#${component.id} > coral-step`)[index];
    } else if (component.tagName === 'CORAL-PANELSTACK') {
      // @polyfill IE - we use id since :scope is not supported
      item = component.querySelectorAll(`#${component.id} > coral-panel`)[index];
    }

    if (item) {
      // we only select if not select to avoid mutations
      if (!item.hasAttribute('selected')) {
        item.setAttribute('selected', '');
      }
    }
      // if we did not find an item to select, it means that the "index" is not available in the component, therefore we
    // need to deselect all items
    else {
      // we use the component id to be able to find direct children
      if (component.tagName === 'CORAL-STEPLIST') {
        // @polyfill IE - we use id since :scope is not supported
        item = component.querySelector(`#${component.id} > coral-step[selected]`);
      } else if (component.tagName === 'CORAL-PANELSTACK') {
        // @polyfill IE - we use id since :scope is not supported
        item = component.querySelector(`#${component.id} > coral-panel[selected]`);
      }

      if (item) {
        item.removeAttribute('selected');
      }
    }
  }

  /** @private */
  _selectStep(index) {
    // we apply the selection to all available steplists
    this.stepLists.getAll().forEach((stepList) => {
      this._selectItemByIndex(stepList, index);
    });

    // we apply the selection to all available panelstacks
    this.panelStacks.getAll().forEach((panelStack) => {
      this._selectItemByIndex(panelStack, index);
    });
  }

  /**
   Sets the correct selected item in every PanelStack.

   @private
   */
  _syncPanelStackSelection(defaultIndex) {
    // Find out which step we're on by checking the first StepList
    let index = this._getSelectedIndex();

    if (index === -1) {
      if (typeof defaultIndex !== 'undefined') {
        index = defaultIndex;
      } else {
        // No panel selected
        return;
      }
    }

    this.panelStacks.getAll().forEach((panelStack) => {
      this._selectItemByIndex(panelStack, index);
    });
  }

  /**
   Selects the correct step in every StepList.

   @private
   */
  _syncStepListSelection(defaultIndex) {
    // Find out which step we're on by checking the first StepList
    let index = this._getSelectedIndex();

    if (index === -1) {
      if (typeof defaultIndex !== 'undefined') {
        index = defaultIndex;
      } else {
        // No step selected
        return;
      }
    }

    this.stepLists.getAll().forEach((stepList) => {
      this._selectItemByIndex(stepList, index);
    });
  }

  /**
   Shows the next step. If the WizardView is already in the last step nothing will happen.

   @emits {coral-wizardview:change}
   */
  next() {
    const stepList = this.stepLists.first();
    if (!stepList) {
      return;
    }

    // Change to the next step
    stepList.next();

    // Select the step everywhere
    this._selectStep(stepList.items.getAll().indexOf(stepList.selectedItem));
  }

  /**
   Shows the previous step. If the WizardView is already in the first step nothing will happen.

   @emits {coral-wizardview:change}
   */
  previous() {
    const stepList = this.stepLists.first();
    if (!stepList) {
      return;
    }

    // Change to the previous step
    stepList.previous();

    // Select the step everywhere
    this._selectStep(stepList.items.getAll().indexOf(stepList.selectedItem));
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    this._syncStepListSelection(0);
    this._syncPanelStackSelection(0);

    // Disable tracking for specific elements that are attached to the component.
    const selector = '[coral-wizardview-next],[coral-wizardview-previous],[coral-wizardview-steplist],[coral-wizardview-panelstack]';
    const items = this.querySelectorAll(selector);
    for (let i = 0 ; i < items.length ; i++) {
      items[i].setAttribute('tracking', 'off');
    }
  }

  /**
   Triggered when the {@link WizardView} selected step list item has changed.

   @typedef {CustomEvent} coral-wizardview:change

   @property {Step} event.detail.selection
   The new selected step list item.
   @property {Step} event.detail.oldSelection
   The prior selected step list item.
   */
}

export default WizardView;
