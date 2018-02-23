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

import {ComponentMixin} from '/coralui-mixin-component';
import ActionBarContainerMixin from './ActionBarContainerMixin';
import '/coralui-component-list';

const CLASSNAME = 'coral3-ActionBar-container';

/**
 Enumeration for {@link ActionBarContainer} positions.
 
 @typedef {Object} ActionBarContainerPositionEnum
 
 @property {String} PRIMARY
 Primary (left) ActionBar container.
 @property {String} SECONDARY
 Secondary (right) ActionBar container.
 @property {String} INVALID
 Invalid ActionBar container.
 */
const position = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  INVALID: 'invalid'
};

/**
 @class Coral.ActionBar.Container
 @classdesc An ActionBar container component
 @htmltag coral-actionbar-container
 @extends {HTMLElement}
 @extends {ComponentMixin}
 
 @deprecated
 */
class ActionBarContainer extends ActionBarContainerMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
  
    console.warn('@deprecated: coral-actionbar-container is deprecated, use coral-actionbar-primary and ' +
      'coral-actionbar-secondary instead');
  }
  
  /**
   The container position inside the actionbar.
   
   @private
   @type {String}
   @readonly
   @default ActionBarContainerPositionEnum.INVALID
   */
  get _position() {
    if (this.parentNode) {
      const containers = this.parentNode.getElementsByTagName('coral-actionbar-container');
    
      if (containers.length > 0 && containers[0] === this) {
        return position.PRIMARY;
      }
      else if (containers.length > 1 && containers[1] === this) {
        return position.SECONDARY;
      }
    }
  
    return position.INVALID;
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    if (this.parentNode && this.parentNode.secondary === this) {
      this.insertBefore(this._elements.moreButton, this.firstChild);
    }
    else {
      // add the button to the left/primary contentzone
      this.appendChild(this._elements.moreButton);
    }
  }
  
  /**
   Returns {@link ActionBarContainer} positions.
   
   @return {ActionBarContainerPositionEnum}
   */
  static get position() { return position; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Cleanup resize helpers object (cloneNode support)
    const resizeHelpers = this.getElementsByTagName('object');
    for (let i = 0; i < resizeHelpers.length; ++i) {
      const resizeElement = resizeHelpers[i];
      if (resizeElement.parentNode === this) {
        this.removeChild(resizeElement);
      }
    }
  
    // Cleanup 'More' button
    this._elements.moreButton = this.querySelector('[coral-actionbar-more]');
    if (this._elements.moreButton) {
      this.removeChild(this._elements.moreButton);
    }
  
    // Cleanup 'More' popover
    this._elements.popover = this.querySelector('[coral-actionbar-popover]');
    if (this._elements.popover) {
      this.removeChild(this._elements.popover);
    }
  
    // Init 'More' button
    this._elements.moreButton.label.textContent = this.moreButtonText;
    // 'More' button might be moved later in dom when Container is attached to parent
    this.appendChild(this._elements.moreButton);
  
    // Init 'More' popover
    this._elements.popover.target = this._elements.moreButton;
  
    // Insert popover always as firstChild to ensure element order (cloneNode support)
    this.insertBefore(this._elements.popover, this.firstChild);
  
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarContainer;
