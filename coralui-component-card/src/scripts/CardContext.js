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

import {ComponentMixin} from '../../../coralui-mixin-component';

const CLASSNAME = '_coral-Card-context';

/**
 @class Coral.Card.Context
 @classdesc A Card context component
 @htmltag coral-card-context
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardContext extends ComponentMixin(HTMLElement) {
  /**
   The context's content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME, 'coral-Heading', 'coral-Heading--5');
  }
}

export default CardContext;
