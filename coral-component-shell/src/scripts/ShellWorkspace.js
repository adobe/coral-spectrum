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

import {ComponentMixin} from '../../../coral-mixin-component';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Shell-workspaces-workspace';

/**
 @class Coral.Shell.Workspace
 @classdesc A Shell Workspace component
 @htmltag coral-shell-workspace
 @htmlbasetag a
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 */
class ShellWorkspace extends ComponentMixin(HTMLAnchorElement) {
  /** @ignore */
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
  
  /** @ignore */
  static get observedAttributes() { return super.observedAttributes.concat(['selected']); }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
  
  /**
   Triggered when a {@link ShellWorkspace} selection changed.
   
   @typedef {CustomEvent} coral-shell-workspace:_selectedchanged
   
   @private
   */
}

export default ShellWorkspace;
