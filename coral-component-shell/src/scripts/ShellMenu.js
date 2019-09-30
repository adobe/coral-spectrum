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

import {Popover} from '../../../coral-component-popover';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Shell-menu';

/**
 @class Coral.Shell.Menu
 @classdesc A Shell Menu component
 @htmltag coral-shell-menu
 @extends {Popover}
 */
class ShellMenu extends Popover {
  /**
   Inherited from {@link Popover#within}.
   */
  get within() {
    // Force 'coral-shell'
    return document.querySelector('coral-shell') || 'coral-shell';
  }
  set within(value) {
    super.within = value;
  }
  
  /**
   Inherited from {@link Popover#placement}.
   */
  get placement() {
    // Force bottom placement
    return this.constructor.placement.BOTTOM;
  }
  set placement(value) {
    super.placement = value;
  }
  
  /**
   Whether the overlay should use all available space.
   
   @type {Boolean}
   @default false
   @htmlattribute full
   @htmlattributereflected
   */
  get full() {
    return this._full || false;
  }
  set full(value) {
    this._full = transform.booleanAttr(value);
    this._reflectAttribute('full', this._full);
  
    this.classList.toggle(`${CLASSNAME}--full`, this._full);
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['full']);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    this.trigger('coral-shell-menu:_connected');
  }
}

export default ShellMenu;
