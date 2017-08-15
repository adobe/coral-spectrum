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
import {Collection} from 'coralui-collection';

const CLASSNAME = 'coral3-Shell-menubar';

/**
 @class Coral.Shell.MenuBar
 @classdesc A Shell MenuBar component
 @htmltag coral-shell-menubar
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ShellMenuBar extends Component(HTMLElement) {
  constructor() {
    super();
    
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Shell.MenuBar#
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-menubar-item'
      });
    }
  
    return this._items;
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default ShellMenuBar;
