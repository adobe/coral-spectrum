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
import ButtonMixin from 'coralui-mixin-button';
import {transform, commons} from 'coralui-util';

// Key code
const SPACE = 32;

/**
 @class Coral.AnchorButton
 @classdesc A Link component rendering as a button.
 @htmltag coral-anchorbutton
 @htmlbasetag a
 @extends HTMLAnchorElement
 @extends Coral.mixin.component
 @extends Coral.mixin.button
 */
class AnchorButton extends ButtonMixin(Component(HTMLAnchorElement)) {
  constructor() {
    super();
    
    // Events
    this.on(commons.extend(this._events, {
      'keydown': '_onKeyDown',
      'keyup': '_onKeyUp'
    }));
    
    // cannot use the events hash because events on disabled items are not reported
    this.addEventListener('click', this._onClick.bind(this));
  }
  
  /**
   Disables the button from user interaction.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.AnchorButton#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    
    transform.reflect(this, 'disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this.setAttribute('tabindex', this._disabled ? '-1' : '0');
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  /**
   Keyboard handling per the WAI-ARIA button widget design pattern:
   https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role
 
   @ignore
   */
  _onKeyDown(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.click();
      this.classList.add('is-selected');
    }
  }
  
  /** @ignore */
  _onKeyUp(event) {
    if (event.keyCode === SPACE) {
      event.preventDefault();
      this.classList.remove('is-selected');
    }
  }
  
  /** @ignore */
  _onClick(event) {
    if (this.disabled) {
      event.preventDefault();
    }
  }
  
  // Override content zone name
  get _contentZones() {return {'coral-anchorbutton-label': 'label'};}
  
  static get observedAttributes() {
    return super.observedAttributes.concat(['disabled']);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    // a11y
    this.setAttribute('role', 'button');
    if (!this.disabled) {
      // Force tabindex and aria-disabled attribute reflection
      this.setAttribute('tabindex', '0');
      this.setAttribute('aria-disabled', 'false');
    }
  }
}

export default AnchorButton;
