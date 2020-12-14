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

const CLASSNAME = '_coral-PanelStack';

/**
 @class Coral.PanelStack
 @classdesc A PanelStack component holding a collection of panels. It wraps content, keeping only the selected panel in view.
 @htmltag coral-panelstack
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class PanelStack extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Attach events
    this._delegateEvents({
      // private
      'coral-panel:_selectedchanged': '_onItemSelectedChanged'
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
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-panel',
        // allows panels to be nested
        itemSelector: ':scope > coral-panel',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
    return this._items;
  }

  /**
   The selected item of the PanelStack.

   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }

  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();

    this._validateSelection(event.target);
  }

  /** @private */
  _validateSelection(item) {
    const selectedItems = this.items._getAllSelected();

    // Last selected item wins if multiple selection while not allowed
    item = item || selectedItems[selectedItems.length - 1];

    if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
      selectedItems.forEach((selectedItem) => {
        if (selectedItem !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selectedItem.removeAttribute('selected');
        }
      });

      // We can trigger change events again
      this._preventTriggeringEvents = false;
    }

    this._triggerChangeEvent();
  }

  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;

    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-panelstack:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });

      this._oldSelection = selectedItem;
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    this.setAttribute('role', 'presentation');

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;

    this._oldSelection = this.selectedItem;
  }

  /**
   Triggered when {@link PanelStack} selected panel has changed.

   @typedef {CustomEvent} coral-panelstack:change

   @property {Panel} detail.selection
   The new selected panel.
   @property {Panel} detail.oldSelection
   The prior selected panel.
   */
}

export default PanelStack;
