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
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-Shell-workspaces-workspace';

/**
 @class Coral.Shell.Workspace
 @classdesc A Shell Workspace component
 @htmltag coral-shell-workspace
 @htmlbasetag a
 @extends HTMLAnchorElement
 @extends Coral.mixin.component
 */
class ShellWorkspace extends Component(HTMLAnchorElement) {
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      click: '_onClick'
    });
  }
  
  /**
   Whether this workspace is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Shell.Workspace#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.setAttribute('aria-selected', this._selected);
    this.classList.toggle('is-selected', this._selected);
    
    this.trigger('coral-shell-workspace:_selectedchanged');
  }
  
  /** @private */
  _onClick() {
    if (!this.selected) {
      this.selected = true;
    }
  }
  
  static get observedAttributes() { return ['selected']; }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
  
  /**
   Triggered when a workspace selection changed.
   
   @event Coral.Shell.Workspace#coral-shell-workspace:_selectedchanged
   
   @param {Object} event Event object
   @private
   */
}

export default ShellWorkspace;
