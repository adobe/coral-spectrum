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
import {DragAction} from 'coralui-dragaction';
import {transform, commons} from 'coralui-util';

const CLASSNAME = 'coral3-Masonry-item';

/**
 @class Coral.Masonry.Item
 @classdesc A Masonry Item component
 @htmltag coral-masonry-item
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class MasonryItem extends Component(HTMLElement) {
  constructor() {
    super();
  
    // Represents ownership (necessary when the item is moved which triggers callbacks)
    this._masonry = null;
    
    // Default value
    this._dragAction = null;
  }
  
  /**
   Item content element.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Masonry.Item#
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Masonry.Item#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.classList.toggle('is-selected', this._selected);
  }
  
  /** @private */
  get _removing() {
    return this.__removing || false;
  }
  set _removing(value) {
    this.__removing = transform.booleanAttr(value);
    this._reflectAttribute('_removing', this.__removing);
    
    // Do it in the next frame so that the removing animation is visible
    window.requestAnimationFrame(function() {
      this.classList.toggle('is-removing', this.__removing);
    }.bind(this));
  }
  
  /** @private */
  get _orderable() {
    return this.__orderable || false;
  }
  set _orderable(value) {
    this.__orderable = transform.booleanAttr(value);
    this._reflectAttribute('_orderable', this.__orderable);
    
    this._updateDragAction(this.__orderable);
  }
  
  /** @private */
  get _placeholder() {
    return this.__placeholder || false;
  }
  set _placeholder(value) {
    this.__placeholder = transform.booleanAttr(value);
    this._reflectAttribute('_placeholder', this.__placeholder);
  }
  
  /**
   Animates the insertion of the item.
   
   @private
   */
  _insert() {
    if (this.classList.contains('is-beforeInserting')) {
      this.classList.remove('is-beforeInserting');
      this.classList.add('is-inserting');
      commons.transitionEnd(this, function() {
        this.classList.remove('is-inserting');
      }.bind(this));
    }
  }
  
  /** @private */
  _setTabbable(tabbable) {
    this.setAttribute('tabindex', tabbable ? 0 : -1);
  }
  
  /** @private */
  _updateDragAction(enabled) {
    let handle;
    if (enabled) {
      // Find handle
      if (this.getAttribute('coral-masonry-draghandle') !== null) {
        handle = this;
      }
      else {
        handle = this.querySelector('[coral-masonry-draghandle]');
        if (!handle) {
          enabled = false; // Disable drag&drop if handle wasn't found
        }
      }
    }
    
    if (enabled) {
      if (!this._dragAction) {
        this._dragAction = new DragAction(this);
        this._dragAction.dropZone = this.parentNode;
      }
      this._dragAction.handle = handle;
    }
    else {
      if (this._dragAction) {
        this._dragAction.destroy();
        this._dragAction = null;
      }
    }
  }

  static get observedAttributes() {return ['selected', '_removing', '_orderable', '_placeholder'];}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // @a11y
    this.setAttribute('tabindex', '-1');
    
    // Inform masonry immediately
    this.trigger('coral-masonry-item:_connected');
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
  
    // Handle it in masonry immediately
    const masonry = this._masonry;
    if (masonry) {
      masonry._onItemDisconnected(this);
    }
  }
}

export default MasonryItem;
