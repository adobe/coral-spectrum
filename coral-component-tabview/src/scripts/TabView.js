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
import '../../../coral-component-panelstack';
import '../../../coral-component-tablist';
import {commons} from '../../../coral-utils';

/**
 Enumeration for {@link TabView} orientations.
 
 @typedef {Object} TabViewOrientationEnum
 
 @property {String} HORIZONTAL
 Tabs on top of the panels. This is the default.
 @property {String} VERTICAL
 Tabs are rendered on the side and match the height of the panels.
 */

const orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

// the tabview's base classname
const CLASSNAME = '_coral-TabView';

/**
 @class Coral.TabView
 @classdesc A TabView component is the wrapping container used to create the typical Tabbed pattern.
 This is intended to be used with a {@link TabList} and {@link PanelStack}.
 @htmltag coral-tabview
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class TabView extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      tabList: this.querySelector('coral-tablist') || document.createElement('coral-tablist'),
      panelStack: this.querySelector('coral-panelstack') || document.createElement('coral-panelstack')
    };
    
    // Events
    this._delegateEvents({
      'coral-tablist:change > coral-tablist': '_onTabListChange',
      'coral-panelstack:change > coral-panelstack': '_onPanelStackChange',
      'coral-collection:add > coral-tablist': '_syncTabListAndPanelStack',
      'coral-collection:remove > coral-tablist': '_syncTabListAndPanelStack',
      'coral-collection:add > coral-panelstack': '_syncTabListAndPanelStack',
      'coral-collection:remove > coral-panelstack': '_syncTabListAndPanelStack'
    });
  }
  
  /**
   The TabView's orientation. See {@link TabViewOrientationEnum}.
   
   @type {String}
   @default TabViewOrientationEnum.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   */
  get orientation() {
    return this._elements.tabList.getAttribute('orientation') || orientation.HORIZONTAL;
  }
  set orientation(value) {
    // We rely on the tablist orientation enum so don't need to double check enums
    this._elements.tabList.setAttribute('orientation', value);
    this._reflectAttribute('orientation', this.orientation);
  
    this.classList[this.orientation === orientation.VERTICAL ? 'add' : 'remove'](`${CLASSNAME}--vertical`);
  }
  
  /**
   The TabList which handles all the tabs.
   
   @type {TabList}
   @contentzone
   */
  get tabList() {
    return this._getContentZone(this._elements.tabList);
  }
  set tabList(value) {
    // Support nested coral-tablist
    if (value instanceof HTMLElement && !value.parentNode || value.parentNode === this) {
      this._setContentZone('tabList', value, {
        handle: 'tabList',
        tagName: 'coral-tablist',
        insert: function(tabs) {
          tabs.setAttribute('tracking', 'off');
          this.insertBefore(tabs, this._elements.panelStack || null);
        }
      });
    }
  }
  
  /**
   The PanelStack which contains all the panels.
   
   @type {PanelStack}
   @contentzone
   */
  get panelStack() {
    return this._getContentZone(this._elements.panelStack);
  }
  set panelStack(value) {
    // Support nested coral-panelstack
    if (value instanceof HTMLElement && !value.parentNode || value.parentNode === this) {
      this._setContentZone('panelStack', value, {
        handle: 'panelStack',
        tagName: 'coral-panelstack',
        insert: function(panels) {
          this.appendChild(panels);
        }
      });
    }
  }
  
  /**
   Detects a change in the TabList and triggers an event.
   
   @private
   */
  _onTabListChange(event) {
    this.trigger('coral-tabview:change', {
      selection: event.detail.selection,
      oldSelection: event.detail.oldSelection
    });
  }
  
  /** @private */
  _onPanelStackChange(event) {
    // everytime the panelstack changes, we verify that the tablist and panelstack are up to date
    if (event.detail.selection) {
      const tabSelector = event.detail.selection.getAttribute('aria-labelledby');
      const tab = document.getElementById(tabSelector);
    
      // we select the tab if this was not the case
      if (tab) {
        if (!tab.hasAttribute('selected')) {
          tab.setAttribute('selected', '');
        }
        else {
          this._trackEvent('display', 'coral-tab', event, event.detail.selection);
        }
      }
    }
  }
  
  /** @private */
  _syncTabListAndPanelStack() {
    this._elements.tabList.target = this._elements.tabList.target;
  }
  
  get _contentZones() {
    return {
      'coral-tablist': 'tabList',
      'coral-panelstack': 'panelStack'
    };
  }
  
  /**
   Returns {@link TabView} orientation options.
   
   @return {TabViewOrientationEnum}
   */
  static get orientation() { return orientation; }
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['orientation']); }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._orientation) { this.orientation = this.orientation; }
  
    // Fetch or create the content zone elements
    const tabs = this._elements.tabList;
    const panels = this._elements.panelStack;
  
    // Bind the tablist and panel stack together, using the panel id
    panels.id = panels.id || commons.getUID();
    tabs.setAttribute('target', `#${panels.id}`);
  
    // Assign the content zones.
    this.panelStack = panels;
    this.tabList = tabs;
  }
  
  /**
   Triggered when the {@link TabView} selected tab panel item has changed.
 
   @typedef {CustomEvent} coral-tabview:change
   
   @property {Tab} event.detail.selection
   The new selected tab panel item.
   @param {Tab} event.detail.oldSelection
   The prior selected tab panel item.
   */
}

export default TabView;
