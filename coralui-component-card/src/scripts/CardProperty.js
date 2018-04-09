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
import '../../../coralui-component-icon';
import icon from '../templates/icon';

const CLASSNAME = '_coral-Card-property';

/**
 @class Coral.Card.Property
 @classdesc A Card property component
 @htmltag coral-card-property
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class CardProperty extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      content: this.querySelector('coral-card-property-content') || document.createElement('coral-card-property-content')
    };
    icon.call(this._elements);
  }
  
  /**
   The property's content zone
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-card-property-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Specifies the icon name used inside the property. See {@link Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }
  set icon(value) {
    this._elements.icon.icon = value;
  
    // removes the icon element from the DOM since there is no valid icon. this causes the content to have the
    // correct styling
    if (this.icon === '') {
      this._elements.icon.remove();
    }
    else if (!this._elements.icon.parentNode) {
      this.insertBefore(this._elements.icon, this.firstChild);
    }
  }
  
  get _contentZones() { return {'coral-card-property-content': 'content'}; }
  
  /** @ignore */
  static get observedAttributes() { return ['icon']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME, 'coral-Body--small');
  
    // Create a fragment
    const frag = document.createDocumentFragment();
  
    // Render the main template
    if (this.icon) {
      frag.appendChild(this._elements.icon);
    }
  
    const content = this._elements.content;
  
    // Remove it so we can process children
    if (content.parentNode) {
      content.parentNode.removeChild(content);
    }
  
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'icon') {
        // Add non-template elements to the label
        content.appendChild(child);
      }
      else {
        this.removeChild(child);
      }
    }
  
    // Add the frag to the component
    this.appendChild(frag);
  
    // Assign the content zones, moving them into place in the process
    this.content = content;
  }
}

export default CardProperty;
