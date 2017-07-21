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

const CLASSNAME = 'coral3-Card-context';

/**
 @class Coral.Card.Context
 @classdesc A Card context component
 @htmltag coral-card-context
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class CardContext extends Component(HTMLElement) {
  constructor() {
    super();
  }
  
  /**
   The context's content zone.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Card.Context#
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
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default CardContext;
