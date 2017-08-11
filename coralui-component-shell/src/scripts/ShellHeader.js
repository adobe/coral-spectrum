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

const CLASSNAME = 'coral3-Shell-header';

/**
 @class Coral.Shell.Header
 @classdesc A Shell Header component
 @htmltag coral-shell-header
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ShellHeader extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      home: this.querySelector('coral-shell-header-home') || document.createElement('coral-shell-header-home'),
      actions: this.querySelector('coral-shell-header-actions') || document.createElement('coral-shell-header-actions'),
      content: this.querySelector('coral-shell-header-content') || document.createElement('coral-shell-header-content')
    };
    
    // Events
    this._delegateEvents({
      'global:coral-overlay:beforeopen': '_handleMenuBeforeOpenOrClose',
      'global:coral-overlay:beforeclose': '_handleMenuBeforeOpenOrClose',
      'global:coral-overlay:close': '_handleMenuClose'
    });
  }
  
  /**
   The label of the panel.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.Header#
   */
  get home() {
    return this._getContentZone(this._elements.home);
  }
  set home(value) {
    this._setContentZone('home', value, {
      handle: 'home',
      tagName: 'coral-shell-header-home',
      insert: function(content) {
        // a11y
        this._enableHomeAccessibility(content);
        this.appendChild(content);
      }
    });
  }

  /**
   The main content zone of the panel.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.Header#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-shell-header-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   The content zone where the actions are placed.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.Header#
   */
  get actions() {
    return this._getContentZone(this._elements.actions);
  }
  set actions(value) {
    this._setContentZone('actions', value, {
      handle: 'content',
      tagName: 'coral-shell-header-actions',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Just before a menu is open or closed, we check that the zIndex of the Header is correct so that it animates
   below the header.
   
   @ignore
   */
  _handleMenuBeforeOpenOrClose(event) {
    const target = event.target;
  
    // header only changes zIndex due to menus
    if (target.tagName === 'CORAL-SHELL-MENU') {
      // we need one frame to make sure the zIndex is already set
      window.requestAnimationFrame(function() {
        this.style.zIndex = parseInt(target.style.zIndex, 10) + 100;
      }.bind(this));
    }
  }
  
  /**
   After an overlay is closed, we return the zIndex to the initial value.
   
   @ignore
   */
  _handleMenuClose(event) {
    const target = event.target;
    
    if (target.tagName === 'CORAL-SHELL-MENU') {
      // resets the zIndex to the initial value
      this.style.zIndex = 'auto';
    }
  }
  
  /** @private */
  _enableHomeAccessibility(home) {
    home.setAttribute('role', 'heading');
    home.setAttribute('aria-level', '2');
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-shell-header-content': 'content'};}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    // appheader only exists on dark theme
    this.classList.add('coral--dark');
    
    const home = this._elements.home;
    const actions = this._elements.actions;
    const content = this._elements.content;
    
    // Remove them so we can process children
    if (home.parentNode) {home.remove();}
    if (actions.parentNode) {actions.remove();}
    if (content.parentNode) {content.remove();}
    
    // moves everything to the main content zone
    while (this.firstChild) {
      content.appendChild(this.firstChild);
    }
    
    // // Call the content zone insert
    this.home = home;
    this.actions = actions;
    this.content = content;
  }
}

export default ShellHeader;
