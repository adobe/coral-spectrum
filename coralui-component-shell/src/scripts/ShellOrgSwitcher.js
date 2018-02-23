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

import {List} from '/coralui-component-list';
import {SelectableCollection} from '/coralui-collection';
import orgSwitcher from '../templates/orgSwitcher';
import {commons} from '/coralui-util';

const CLASSNAMES = ['coral3-BasicList', 'coral3-Shell-orgSwitcher'];

/**
 Minimum number of entries required to show search control.
 
 @type {Number}
 @ignore
 */
const SEARCH_VISIBILITY_THRESHOLD = 6;

/**
 @class Coral.Shell.OrgSwitcher
 @classdesc A Shell OrgSwitcher component
 @htmltag coral-shell-orgswitcher
 @extends {List}
 */
class ShellOrgSwitcher extends List {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      'coral-search:clear': '_showAll',
      'coral-search:input': '_performSearch',
      'coral-search:submit': '_selectFirst',
      'coral-shell-organization:change': '_onOrganizationChange',
      // private
      'coral-shell-organization:_selectedchanged': '_onItemSelectedChanged',
      'coral-shell-suborganization:_selectedchanged': '_onSubItemSelectedChanged'
    });
    
    // Templates
    this._elements = {
      footer: this.querySelector('coral-shell-orgswitcher-footer') || document.createElement('coral-shell-orgswitcher-footer')
    };
    orgSwitcher.call(this._elements);
  
    // Used for eventing
    this._oldSelection = null;
    
    // Item handling
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-shell-organization',
        itemSelector: 'coral-shell-organization, coral-shell-suborganization',
        container: this._elements.items,
        onItemAdded: this._onCollectionChange,
        onItemRemoved: this._onCollectionChange
      });
    }
  
    return this._items;
  }
  
  /**
   The search field placeholder.
   
   @default ''
   @type {String}
   @htmlattribute placeholder
   */
  get placeholder() {
    return this._elements.search.placeholder;
  }
  set placeholder(value) {
    this._elements.search.placeholder = value;
  }
  
  /**
   Content zone where the buttons are located.
   
   @type {HTMLElement}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }
  set footer(value) {
    this._setContentZone('content', value, {
      handle: 'footer',
      tagName: 'coral-shell-orgswitcher-footer',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-shell-organization';
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._validateSelection(item);
  }
  
  /** @private */
  _onSubItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    
    // If a sub organization is selected, deselect all selected organization items
    if (item.hasAttribute('selected')) {
      this.items._getAllSelected().forEach((itemElement) => {
        if (itemElement.tagName === 'CORAL-SHELL-ORGANIZATION') {
          this._preventTriggeringEvents = true;
          itemElement.removeAttribute('selected');
        }
      });
  
      this._preventTriggeringEvents = false;
    }
  }
  
  /** @private */
  _onOrganizationChange() {
    this._triggerChangeEvent();
  }
  
  /**
   Returns the selected workspace.
   
   @type {HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /** @private */
  _selectFirst(event) {
    event.stopPropagation();
  
    const first = this.items.first();
    if (first) {
      first.setAttribute('selected', '');
    }
  }
  
  /** @private */
  _validateSelection(item) {
    // gets the current selection
    const selection = this.items._getAllSelected();
    const selectionCount = selection.length;
    
    if (selectionCount > 1) {
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
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-shell-orgswitcher:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @private */
  _showAll(event) {
    event.stopPropagation();
  
    this._elements.resultMessage.hidden = true;
  
    // Show all items
    this.items.getAll().forEach((item) => {
      item.hidden = false;
    
      if (item.items) {
        // Show all sub-items
        item.items.getAll().forEach((itemElement) => {
          itemElement.hidden = false;
        });
      }
    });
  }
  
  /** @private */
  _performSearch(event) {
    event.stopPropagation();
    
    const searchTerm = this._elements.search.value.toLowerCase();
    
    this._elements.resultMessage.hidden = true;
    
    // Hide items that don't match
    let resultCount = 0;
    
    this.items.getAll().forEach((item) => {
      let matched = item.content.textContent.toLowerCase().indexOf(searchTerm) !== -1;
      
      let childMatched = false;
      if (item.items) {
        item.items.getAll().forEach((itemElement) => {
          const elementMatch = itemElement.content.textContent.toLowerCase().indexOf(searchTerm) !== -1;
          childMatched = childMatched || elementMatch;
  
          itemElement.hidden = !elementMatch;
        });
      }
      
      matched = matched || childMatched;
      item.hidden = !matched;
      
      if (matched) {
        resultCount++;
      }
    });
    
    if (resultCount === 0) {
      this._elements.resultMessage.hidden = false;
    }
  }
  
  /** @private */
  _moveItems() {
    this.setAttribute('id', this.id || commons.getUID());
    Array.prototype.forEach.call(this.querySelectorAll(`#${this.id} > coral-shell-organization`), (item) => {
      this._elements.items.appendChild(item);
    }, this);
  }
  
  /** @private */
  _onCollectionChange(item) {
    // Move all items into the right place
    this._moveItems();
  
    // Select the last selected item
    this._validateSelection(item);
  
    // if mincountforsearch is set and number of organizations are less than or equal to it, hide the search
    if (this.items.length <= SEARCH_VISIBILITY_THRESHOLD) {
      this._elements.search.hide();
    }
    else {
      this._elements.search.show();
    }
  }
  
  get _contentZones() { return {'coral-shell-orgswitcher-footer': 'footer'}; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['placeholder']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(...CLASSNAMES);
  
    // Move the items into the right place
    this._moveItems();

    const container = this.querySelector('[handle="container"]');

    // Support cloneNode
    if (container) {
      this._elements.container = container;
      this._elements.items = this.querySelector('.coral3-Shell-orgSwitcher-items');
      this._elements.search = this.querySelector('.coral3-Shell-orgSwitcher-search');
      this._elements.resultMessage = this.querySelector('.coral3-Shell-orgSwitcher-resultMessage');
      this._items._container = this._elements.items;
    }
    else {
      this.appendChild(this._elements.container);
    }
    
    // Call content zone insert
    this.footer = this._elements.footer;
  
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
  }
  
  /**
   Triggered when the {@link ShellOrgSwitcher} selected organization has changed.
   
   @typedef {CustomEvent} coral-shell-orgswitcher:change
   
   @property {HTMLElement} detail.oldSelection
   The prior selected organization item.
   @property {HTMLElement} detail.selection
   The newly selected organization item.
   */
}

export default ShellOrgSwitcher;
