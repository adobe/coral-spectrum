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
import {SelectableCollection} from '../../../coral-collection';
import {transform, validate, commons, i18n} from '../../../coral-utils';
import getTarget from './getTarget';
import {Decorator} from '../../../coral-decorator';

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
 @extends {BaseComponent}
 */
const StepList = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._delegateEvents({
      'click > coral-step > [handle="link"]': '_onStepClick',

      'capture:focus > coral-step': '_onStepMouseEnter',
      'capture:mouseenter > coral-step > [handle="link"]': '_onStepMouseEnter',
      'capture:blur > coral-step': '_onStepMouseLeave',
      'capture:mouseleave > coral-step > [handle="link"]': '_onStepMouseLeave',

      'key:enter > coral-step > [handle="link"]': '_onStepKeyboardSelect',
      'key:space > coral-step > [handle="link"]': '_onStepKeyboardSelect',
      'key:home > coral-step > [handle="link"]': '_onHomeKey',
      'key:end > coral-step > [handle="link"]': '_onEndKey',
      'key:pagedown > coral-step > [handle="link"]': '_selectNextItem',
      'key:right > coral-step > [handle="link"]': '_selectNextItem',
      'key:down > coral-step > [handle="link"]': '_selectNextItem',
      'key:pageup > coral-step > [handle="link"]': '_selectPreviousItem',
      'key:left > coral-step > [handle="link"]': '_selectPreviousItem',
      'key:up > coral-step > [handle="link"]': '_selectPreviousItem',

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

      // we do this in the sync in case the target was not yet in the DOM
      window.requestAnimationFrame(() => {
        const realTarget = getTarget(this._target);

        // we add proper accessibility if available
        if (realTarget) {
          const stepItems = this.items.getAll();
          const panelItems = realTarget.items ? realTarget.items.getAll() : realTarget.children;

          // we need to add a11y to all components, regardless of whether they can be perfectly paired
          const maxItems = Math.max(stepItems.length, panelItems.length);

          let step;
          let panel;
          for (let i = 0 ; i < maxItems ; i++) {
            step = stepItems[i];
            panel = panelItems[i];

            // if the step has its own target, we assume the target component will handle its own accessibility.
            // if the target is an empty string we simply ignore it
            if (step && step.target && step.target.trim() !== '') {
              continue;
            }

            if (panel) {
              panel.setAttribute('role', 'region');
            }

            if (step && panel) {
              // sets the required ids
              step.id = step.id || commons.getUID();
              panel.id = panel.id || commons.getUID();

              // creates a 2 way binding for accessibility
              step.setAttribute('aria-controls', panel.id);
              panel.setAttribute('aria-labelledby', step.id);
            } else if (step) {
              // cleans the aria since there is no matching panel
              step.removeAttribute('aria-controls');
            } else {
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

    if (!this.items.length) {
      return;
    }

    // update aria-label for all children
    const _syncItemLabelled = () => {
      const isSmall = this.size === size.SMALL;
      const steps = this.items.getAll();
      const stepsCount = steps.length;

      for (let i = 0 ; i < stepsCount ; i++) {
        const step = steps[i];
        const label = step._elements.label;
        if (!step.labelled && label.textContent.length) {
          label.classList.toggle('u-coral-screenReaderOnly', isSmall);
          label.style.display = isSmall ? 'block' : '';
        }
      }
    };

    const lastItem = this.items.last();

    if (typeof lastItem._syncTabIndex === 'function') {
      _syncItemLabelled();
    } else {
      commons.ready(lastItem, _syncItemLabelled);
    }
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

    if (!this.items.length) {
      return;
    }

    // update tab index for all children
    const _syncItemProps = () => {
      const steps = this.items.getAll();
      const stepsCount = steps.length;

      for (let i = 0 ; i < stepsCount ; i++) {
        // update tab index for all children
        steps[i]._syncTabIndex(isInteractive);
        //update posin set and total size for all steps
        steps[i]._syncSizeAndCurrentIndex(i + 1, stepsCount);
      }
    };

    const lastItem = this.items.last();

    if (typeof lastItem._syncTabIndex === 'function') {
      _syncItemProps();
    } else {
      commons.ready(lastItem, _syncItemProps);
    }
  }

  /** @private */
  _syncItemTabIndex(item) {
    item._syncTabIndex(this.interaction === interaction.ON);
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

      for (let i = 0 ; i < selectionCount ; i++) {
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

      if (!item._elements) {
        return;
      }

      // Set accessibilityState text label
      let accessibilityLabel = i18n.get('not completed: ');

      if (index < selectedItemIndex) {
        accessibilityLabel = i18n.get('completed: ');
      } else if (index === selectedItemIndex) {
        accessibilityLabel = i18n.get('current: ');
      }

      item._elements.accessibilityLabel.innerHTML = accessibilityLabel;
    });
  }

  /** @private */
  _onStepKeyboardSelect(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
      event.stopPropagation();

      const item = event.matchedTarget.closest('coral-step');
      this._selectAndFocusItem(item);

      this._trackEvent('click', 'coral-steplist-item', event, item);
    }
  }

  /** @private */
  _onStepClick(event) {
    if (this.interaction === interaction.ON) {
      event.preventDefault();
      event.stopPropagation();

      const item = event.matchedTarget.closest('coral-step');

      // Disabled item should not get selected
      if (item.disabled) {
        return;
      }

      this._selectAndFocusItem(item);

      this._trackEvent('click', 'coral-steplist-item', event, item);
    }
  }

  /** @private */
  _onStepMouseEnter() {
    if (this.size === size.SMALL) {
      const step = event.target.closest('coral-step');

      // we only show the tooltip if we have a label to show
      if (step._elements.label.innerHTML.trim() !== '') {
        step._elements.overlay.content.innerHTML = step._elements.label.innerHTML;
        step._elements.overlay.open = true;
      }
    }
  }

  /** @private */
  _onStepMouseLeave(event) {
    if (this.size === size.SMALL) {
      const step = event.target.closest('coral-step');
      step._elements.overlay.open = false;
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
  static get size() {
    return size;
  }

  /**
   Returns {@link StepList} interaction options.

   @return {StepListInteractionEnum}
   */
  static get interaction() {
    return interaction;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['target', 'size', 'interaction']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Default reflected attributes
    if (!this._interaction) {
      this.interaction = interaction.OFF;
    }
    if (!this._size) {
      this.size = size.LARGE;
    }

    // A11y
    this.setAttribute('role', 'list');

    // provide accessibility label for the list
    if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
      this.setAttribute('aria-label', i18n.get('Step List'));
    }

    // the screen reader should not navigate to hidden element
    // the element is hidden if has only one child
    if (this.items.length === 1) {
      this.setAttribute('aria-hidden', 'true');
    }

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;

    this._oldSelection = this.selectedItem;
  }

  /**
   Triggered when the {@link StepList} selected {@link Step} has changed.

   @typedef {CustomEvent} coral-steplist:change

   @property {Step} detail.selection
   The newly selected Step.
   @property {Step} detail.oldSelection
   The previously selected Step.
   */
});

export default StepList;
