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

import Component from 'coralui-mixin-component';
import 'coralui-component-panelstack';
import 'coralui-component-tablist';
import {transform, commons} from 'coralui-util';

/**
 TabView orientations.
 
 @enum {String}
 @memberof Coral.TabView
 */
const orientation = {
  /** Tabs on top of the panels. This is the default. */
  HORIZONTAL: 'horizontal',
  /** Tabs are rendered on the side and match the height of the panels. */
  VERTICAL: 'vertical'
};

// the tabview's base classname
const CLASSNAME = 'coral3-TabView';

/**
 @class Coral.TabView
 @classdesc A TabView component
 @htmltag coral-tabview
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class TabView extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      tabList: this.querySelector('coral-tablist') || document.createElement('coral-tablist'),
      panelStack: this.querySelector('coral-panelstack') || document.createElement('coral-panelstack')
    };
    
    // Events
    this.on({
      'coral-tablist:change > coral-tablist': '_onTabListChange',
      'coral-panelstack:change > coral-panelstack': '_onPanelStackChange',
      'coral-collection:add > coral-tablist': '_syncTabListAndPanelStack',
      'coral-collection:remove > coral-tablist': '_syncTabListAndPanelStack',
      'coral-collection:add > coral-panelstack': '_syncTabListAndPanelStack',
      'coral-collection:remove > coral-panelstack': '_syncTabListAndPanelStack'
    });
  }
  
  /**
   The TabView's orientation.
   
   @type {Coral.TabView.orientation}
   @default Coral.TabView.orientation.HORIZONTAL
   @htmlattribute orientation
   @htmlattributereflected
   @memberof Coral.TabView#
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
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.TabView#
   */
  get tabList() {
    return this._getContentZone(this._elements.tabList);
  }
  set tabList(value) {
    this._setContentZone('tabList', value, {
      handle: 'tabList',
      tagName: 'coral-tablist',
      insert: function(tabs) {
        this.insertBefore(tabs, this._elements.panelStack || null);
      }
    });
  }
  
  /**
   The PanelStack which contains all the panels.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.TabView#
   */
  get panelStack() {
    return this._getContentZone(this._elements.panelStack);
  }
  set panelStack(value) {
    this._setContentZone('panelStack', value, {
      handle: 'panelStack',
      tagName: 'coral-panelstack',
      insert: function(panels) {
        this.appendChild(panels);
      }
    });
  }
  
  /**
   Detects a change in the TabList and triggers an event.
   
   @private
   */
  _onTabListChange(event) {
    this.trigger('coral-tabview:change', {
      'selection': event.detail.selection,
      'oldSelection': event.detail.oldSelection
    });
  }
  
  /** @private */
  _onPanelStackChange(event) {
    // everytime the panelstack changes, we verify that the tablist and panelstack are up to date
    if (event.detail.selection) {
    
      const tabSelector = event.detail.selection.getAttribute('aria-labelledby');
      const tab = document.getElementById(tabSelector);
    
      // we select the tab if this was not the case
      if (tab && !tab.hasAttribute('selected')) {
        tab.setAttribute('selected', '');
      }
    }
  }
  
  /** @private */
  _syncTabListAndPanelStack() {
    this._elements.tabList.target = this._elements.tabList.target;
  }
  
  // For backwards compatibility + Torq
  get _contentZones() {
    return {
      'coral-tablist': 'tabList',
      'coral-panelstack': 'panelStack'
    };
  }
  
  // Expose enumerations
  static get orientation() {return orientation;}
  
  static get observedAttributes() {return ['orientation'];}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._orientation) {this.orientation = this.orientation;}
  
    // Fetch or create the content zone elements
    const tabs = this._elements.tabList;
    const panels = this._elements.panelStack;
  
    // Bind the tablist and panel stack together, using the panel id
    panels.id = panels.id || commons.getUID();
    tabs.setAttribute('target', '#' + panels.id);
  
    // Assign the content zones.
    this.panelStack = panels;
    this.tabList = tabs;
  }
  
  /**
   Triggered when the selected tab panel item has changed.
   
   @event Coral.TabView#coral-tabview:change
   
   @param {Object} event
   Event object.
   @param {HTMLElement} event.detail.selection
   The new selected tab panel item.
   @param {HTMLElement} event.detail.oldSelection
   The prior selected tab panel item.
   */
}

export default TabView;
