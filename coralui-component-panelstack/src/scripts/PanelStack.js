/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coralui-mixin-component';
import {SelectableCollection} from '../../../coralui-collection';

const CLASSNAME = '_coral-PanelStack';

/**
 @class Coral.PanelStack
 @classdesc A PanelStack component holding a collection of panels. It wraps content, keeping only the selected panel in view.
 @htmltag coral-panelstack
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class PanelStack extends ComponentMixin(HTMLElement) {
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
  connectedCallback() {
    super.connectedCallback();
    
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
